import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';
import { MIME_TYPES, ALLOWED_AUDIO_EXTENSIONS } from '../constants/audio';

/**
 * LocalServer - 本地 HTTP 静态文件服务器
 *
 * 在 Obsidian (Electron) 环境中启动一个本地 HTTP 服务器，
 * 为 iframe 提供 webapp 静态资源服务，绕过 app:// 协议的限制。
 */
export class LocalServer {
  private server: http.Server | null = null;
  private port = 0;
  private webappDir: string;
  private vaultBasePath: string = '';

  constructor(webappDir: string) {
    this.webappDir = webappDir;
  }

  /** 设置库根目录（供 /bamboo-audio 音频代理使用） */
  setVaultBasePath(basePath: string): void {
    this.vaultBasePath = basePath;
  }

  /** 启动服务器，返回监听端口 */
  async start(): Promise<number> {
    if (this.server) return this.port;

    this.port = await this.findFreePort();

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on('error', (err: Error) => {
        console.error('[BambooReview] Server error:', err);
        reject(new Error(`Server error: ${err.message}`));
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        console.log(`[BambooReview] Local server started on port ${this.port}`);
        resolve(this.port);
      });
    });
  }

  /** 停止服务器 */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('[BambooReview] Local server stopped');
          this.server = null;
          this.port = 0;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /** 获取服务器 URL */
  getUrl(): string {
    return `http://127.0.0.1:${this.port}`;
  }

  /** 处理 HTTP 请求 */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // /bamboo-audio?path=xxx — 音频文件代理，绕过 postMessage 大 payload 限制
    const url = req.url || '/';
    if (url.startsWith('/bamboo-audio-proxy')) {
      this.handleAudioUrlProxy(req, res);
      return;
    }
    if (url.startsWith('/bamboo-audio')) {
      this.handleAudioProxy(req, res);
      return;
    }

    // 解析 URL，去除查询参数
    let urlPath = url.split('?')[0];
    // 目录默认文件
    if (urlPath.endsWith('/')) {
      urlPath += 'index.html';
    }
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(this.webappDir, safePath);

    // 安全检查：确保路径在 webappDir 内
    if (!filePath.startsWith(this.webappDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // 检查文件是否存在
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404);
        res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { display:flex; align-items:center; justify-content:center; height:100vh; margin:0;
         font-family: system-ui, sans-serif; background:#0a0a0a; color:#888; }
  .box { text-align:center; }
  h2 { color:#ccc; font-weight:400; }
  p { font-size:14px; }
  button { margin-top:16px; padding:8px 24px; border:1px solid #444; border-radius:6px;
           background:#1a1a1a; color:#aaa; cursor:pointer; font-size:14px; }
  button:hover { background:#2a2a2a; color:#fff; }
</style></head><body>
<div class="box">
  <h2>竹林修仙传正在初始化……</h2>
  <p>首次启动需要下载资源包，请稍候</p>
  <button onclick="location.reload()">手动刷新</button>
  <script>
    var retries = 0;
    function check() {
      fetch(window.location.href, { method: 'HEAD' }).then(function(r) {
        if (r.status === 200) location.reload();
        else if (++retries < 30) setTimeout(check, 2000);
      }).catch(function() { if (++retries < 30) setTimeout(check, 2000); });
    }
    setTimeout(check, 3000);
  </script>
</div></body></html>`);
        return;
      }

      // 设置 MIME 类型
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // 差异化缓存策略：静态资源带 __BUILD__ 版本号，可长期缓存
      const isHTML = ext === '.html';
      const isStatic = ['.css', '.js', '.woff', '.woff2', '.ttf', '.svg', '.png', '.ico', '.json'].includes(ext);
      const cacheControl = isHTML
        ? 'no-cache'
        : isStatic
          ? 'public, max-age=86400'
          : 'public, max-age=3600';

      // 设置响应头（不需要 CORS，iframe 与服务器同源）
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      });

      // 流式传输文件
      const stream: fs.ReadStream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error', () => {
        if (!res.headersSent) {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      });
    });
  }

  /** /bamboo-audio-proxy?url=xxx — 代理外部音源 URL，绕过浏览器 CORS 限制 */
  private handleAudioUrlProxy(req: http.IncomingMessage, res: http.ServerResponse): void {
    try {
      const rawUrl = req.url || '';
      const queryIndex = rawUrl.indexOf('?');
      if (queryIndex === -1) {
        res.writeHead(400); res.end('Missing url parameter');
        return;
      }
      const queryStr = rawUrl.slice(queryIndex + 1);
      const params = new URLSearchParams(queryStr);
      const targetUrl = params.get('url');
      if (!targetUrl) {
        res.writeHead(400); res.end('Missing url parameter');
        return;
      }

      // 安全检查：仅允许 http/https
      let parsed: URL;
      try {
        parsed = new URL(targetUrl);
      } catch {
        res.writeHead(400); res.end('Invalid URL');
        return;
      }
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        res.writeHead(403); res.end('Forbidden: only http/https URLs allowed');
        return;
      }

      // 安全检查：禁止访问本地地址
      const hostname = parsed.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
        || hostname === '[::1]' || hostname.startsWith('192.168.') || hostname.startsWith('10.')
        || hostname.startsWith('172.')) {
        res.writeHead(403); res.end('Forbidden: local/private network URLs not allowed');
        return;
      }

      // 检查扩展名（白名单）
      const pathname = parsed.pathname.toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
        res.writeHead(403); res.end('Forbidden: unsupported audio format');
        return;
      }

      const transport = parsed.protocol === 'https:' ? https : http;
      const proxyReq = transport.get(targetUrl, { timeout: 30000 }, (proxyRes) => {
        const status = proxyRes.statusCode || 500;
        const ct = proxyRes.headers['content-type'] || 'application/octet-stream';

        // 限制响应大小（最大 50MB）
        const maxSize = 50 * 1024 * 1024;
        let totalSize = 0;
        const chunks: Buffer[] = [];

        proxyRes.on('data', (chunk: Buffer) => {
          totalSize += chunk.length;
          if (totalSize > maxSize) {
            proxyReq.destroy();
            if (!res.headersSent) {
              res.writeHead(413); res.end('Audio file too large (max 50MB)');
            }
            return;
          }
          chunks.push(chunk);
        });

        proxyRes.on('end', () => {
          if (res.headersSent) return;
          res.writeHead(status, {
            'Content-Type': ct,
            'Content-Length': totalSize,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
          });
          const body = Buffer.concat(chunks);
          res.end(body);
        });

        proxyRes.on('error', (err) => {
          if (!res.headersSent) {
            console.error('[BambooReview] Audio URL proxy upstream error:', err.message);
            res.writeHead(502); res.end('Upstream error');
          }
        });
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        if (!res.headersSent) {
          res.writeHead(504); res.end('Upstream timeout');
        }
      });

      proxyReq.on('error', (err: Error) => {
        if (!res.headersSent) {
          console.error('[BambooReview] Audio URL proxy error:', err.message);
          res.writeHead(502); res.end('Upstream connection failed');
        }
      });
    } catch (e: any) {
      if (!res.headersSent) {
        console.error('[BambooReview] Audio URL proxy error:', e);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    }
  }

  /** /bamboo-audio?path=xxx — 流式代理库内音频文件 */
  private handleAudioProxy(req: http.IncomingMessage, res: http.ServerResponse): void {
    try {
      const rawUrl = req.url || '';
      const queryIndex = rawUrl.indexOf('?');
      if (queryIndex === -1) {
        res.writeHead(400); res.end('Missing path parameter');
        return;
      }
      const queryStr = rawUrl.slice(queryIndex + 1);
      const params: URLSearchParams = new URLSearchParams(queryStr);
      const relativePath = params.get('path');
      if (!relativePath) {
        res.writeHead(400); res.end('Missing path parameter');
        return;
      }

      // 安全检查：只允许指定扩展名
      const ext = path.extname(relativePath).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
        res.writeHead(403); res.end('Forbidden: unsupported audio format');
        return;
      }
      // 安全检查：禁止路径穿越
      const normalized = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
      if (!normalized || normalized.startsWith('..') || normalized.startsWith('/')) {
        res.writeHead(403); res.end('Forbidden');
        return;
      }
      if (!this.vaultBasePath) {
        res.writeHead(500); res.end('Vault base path not configured');
        return;
      }

      const fullPath = path.join(this.vaultBasePath, normalized);
      if (!fullPath.startsWith(this.vaultBasePath)) {
        res.writeHead(403); res.end('Forbidden');
        return;
      }

      fs.stat(fullPath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404); res.end('File not found');
          return;
        }
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stats.size,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        });
        const stream: fs.ReadStream = fs.createReadStream(fullPath);
        stream.pipe(res);
        stream.on('error', () => {
          if (!res.headersSent) {
            res.writeHead(500);
            res.end('Stream error');
          }
        });
      });
    } catch (e: any) {
      if (!res.headersSent) {
        res.writeHead(500);
        console.error('[BambooReview] Audio proxy error:', e);
        res.end('Internal Server Error');
      }
    }
  }

  /** 查找可用端口 */
  private findFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.listen(0, '127.0.0.1', () => {
        const port = (server.address() as net.AddressInfo).port;
        server.close(() => resolve(port));
      });
      server.on('error', reject);
    });
  }
}