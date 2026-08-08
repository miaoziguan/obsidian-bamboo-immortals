/**
 * smtpSender — 纯 Node.js SMTP 发件客户端（零第三方依赖）
 *
 * 直接从 Obsidian 桌面端（Electron）发邮件到羽鳞君的收件箱。
 * 用户自配 SMTP 凭证，凭证仅保存在本地 data.json，无后端/无中转。
 * 移植自 bamboo-license-gen/src/license/smtpSender.ts
 *
 * SMTP 配置由调用方传入，本模块不依赖 Obsidian API。
 */

import type { Socket } from 'net';
import type { TLSSocket } from 'tls';

/**
 * 惰性加载 Node.js 内置模块。
 * 顶层 import 会让插件在移动端（无 Node.js runtime）加载即崩溃，
 * 因此改为调用时才 require，并由调用方保证仅在桌面端触发。
 */
function nodeRequire(id: 'net'): typeof import('net');
function nodeRequire(id: 'tls'): typeof import('tls');
function nodeRequire(id: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const req = (globalThis as any).require;
  if (typeof req !== 'function') {
    throw new Error('当前环境不支持 Node.js 网络模块（竹林咨询仅支持桌面端）');
  }
  return req(id);
}

/** 当前环境是否可用 SMTP 发信（桌面端 Electron 才有 Node.js runtime） */
export function isSmtpAvailable(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (globalThis as any).require === 'function';
}

export interface SmtpConfig {
  host: string;     // SMTP 服务器地址，如 smtp.qq.com
  port: number;     // 通常 465（SSL）或 587（STARTTLS）
  secure: boolean;  // true = SSL 直连(465)，false = STARTTLS(587)
  user: string;     // 邮箱账号（发件人）
  pass: string;     // SMTP 授权码
}

export interface SendResult {
  ok: boolean;
  error?: string;
}

/** 简单的 Base64 编码（仅支持 ASCII，足够 SMTP AUTH 用） */
function toBase64(str: string): string {
  return Buffer.from(str).toString('base64');
}

/** 从 SMTP 响应行中提取状态码 */
function parseCode(line: string): number {
  return parseInt(line.slice(0, 3), 10) || 0;
}

/** 从 socket 读取一行（SMTP 每行以 \r\n 结尾） */
function readLine(sock: Socket | TLSSocket, timeoutMs = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`SMTP 读取响应超时（${timeoutMs}ms）`));
    }, timeoutMs);

    let buf = '';

    function onData(chunk: Buffer) {
      buf += chunk.toString('utf-8');
      if (buf.includes('\r\n')) {
        const idx = buf.indexOf('\r\n');
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        cleanup();
        resolve(line);
      }
    }

    function onError(err: Error) {
      cleanup();
      reject(err);
    }

    function onClose() {
      cleanup();
      reject(new Error('SMTP 连接被对方关闭'));
    }

    function cleanup() {
      clearTimeout(timer);
      sock.off('data', onData);
      sock.off('error', onError);
      sock.off('close', onClose);
    }

    sock.on('data', onData);
    sock.on('error', onError);
    sock.on('close', onClose);
  });
}

/** 发送命令 → 读一行响应 → 返回 { code, line } */
async function sendCmd(
  sock: Socket | TLSSocket,
  cmd: string,
): Promise<{ code: number; line: string }> {
  sock.write(cmd + '\r\n');
  const line = await readLine(sock);
  return { code: parseCode(line), line };
}

/** 发送 EHLO → 读取多行响应（250- 开头表示后续还有行，250 空格表示结束） */
async function sendEhlo(
  sock: Socket | TLSSocket,
  hostname: string,
): Promise<string[]> {
  sock.write(`EHLO ${hostname}\r\n`);
  const lines: string[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const line = await readLine(sock);
    lines.push(line);
    const code = parseCode(line);
    // 不是 250 开头或第四个字符是空格 → 结束
    if (code !== 250 || (line.length >= 4 && line[3] === ' ')) {
      return lines;
    }
  }
}

/**
 * 发送一封邮件
 *
 * 流程：TCP 连接 → (可选 STARTTLS 升级) → EHLO → AUTH LOGIN → MAIL FROM → RCPT TO → DATA → QUIT
 */
export async function sendEmail(
  config: SmtpConfig,
  to: string,
  subject: string,
  bodyHtml: string,
): Promise<SendResult> {
  if (!config.user || !config.pass) {
    return { ok: false, error: 'SMTP 未配置：请先在插件设置中填写发件邮箱和 SMTP 授权码' };
  }

  let rawSock: Socket | null = null;
  let sock: Socket | TLSSocket;

  if (!isSmtpAvailable()) {
    return { ok: false, error: '竹林咨询仅支持桌面端（移动端无法直连 SMTP）' };
  }

  const net = nodeRequire('net');
  const tls = nodeRequire('tls');

  try {
    // 1. TCP 连接
    rawSock = await new Promise<Socket>((resolve, reject) => {
      const s = net.connect({ host: config.host, port: config.port }, () => resolve(s));
      s.on('error', reject);
    });

    // 2. 读欢迎消息
    const welcome = await readLine(rawSock);
    const welcomeCode = parseCode(welcome);
    if (welcomeCode !== 220) {
      rawSock.destroy();
      return { ok: false, error: `SMTP 连接异常：${welcome}` };
    }

    // 3. 决定是否 SSL / STARTTLS
    if (config.secure) {
      // 465 端口：直接 TLS 握手
      sock = await new Promise<TLSSocket>((resolve, reject) => {
        const raw = rawSock as Socket;
        const ts = tls.connect({
          socket: raw,
          rejectUnauthorized: false, // QQ 邮箱证书有时 tricky
        }, () => resolve(ts));
        ts.on('error', reject);
      });
    } else {
      // 587 端口：先 EHLO 再 STARTTLS
      sock = rawSock;

      let r = await sendCmd(sock, `EHLO localhost`);
      if (r.code !== 250) {
        sock.destroy();
        return { ok: false, error: `EHLO 失败：${r.line}` };
      }

      r = await sendCmd(sock, 'STARTTLS');
      if (r.code !== 220) {
        sock.destroy();
        return { ok: false, error: `STARTTLS 失败：${r.line}` };
      }

      // TLS 升级
      sock = await new Promise<TLSSocket>((resolve, reject) => {
        const raw = rawSock as Socket;
        const ts = tls.connect({
          socket: raw,
          rejectUnauthorized: false,
        }, () => resolve(ts));
        ts.on('error', reject);
      });
    }

    // 4. EHLO
    await sendEhlo(sock, 'localhost');

    // 5. AUTH LOGIN
    let r = await sendCmd(sock, 'AUTH LOGIN');
    if (r.code !== 334) {
      sock.destroy();
      return { ok: false, error: `AUTH LOGIN 不支持：${r.line}` };
    }

    r = await sendCmd(sock, toBase64(config.user));
    if (r.code !== 334) {
      sock.destroy();
      return { ok: false, error: `SMTP 用户名被拒：${r.line}` };
    }

    r = await sendCmd(sock, toBase64(config.pass));
    if (r.code !== 235) {
      sock.destroy();
      return { ok: false, error: `SMTP 授权码验证失败。请检查授权码是否正确，是否开启了 SMTP 服务？` };
    }

    // 6. MAIL FROM
    r = await sendCmd(sock, `MAIL FROM:<${config.user}>`);
    if (r.code !== 250) {
      sock.destroy();
      return { ok: false, error: `MAIL FROM 失败：${r.line}` };
    }

    // 7. RCPT TO
    r = await sendCmd(sock, `RCPT TO:<${to}>`);
    if (r.code !== 250) {
      sock.destroy();
      return { ok: false, error: `收件人地址无效：${r.line}` };
    }

    // 8. DATA
    r = await sendCmd(sock, 'DATA');
    if (r.code !== 354) {
      sock.destroy();
      return { ok: false, error: `DATA 指令失败：${r.line}` };
    }

    // 拼装邮件内容
    const subjectEncoded = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const mail = [
      `From: ${config.user}`,
      `To: ${to}`,
      `Subject: ${subjectEncoded}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      bodyHtml,
    ].join('\r\n');

    // 正文以 \r\n.\r\n 结束
    sock.write(mail.replace(/\n\./g, '\n..') + '\r\n.\r\n');

    const dataLine = await readLine(sock);
    const dataCode = parseCode(dataLine);
    if (dataCode !== 250) {
      sock.destroy();
      return { ok: false, error: `发送失败：${dataLine}` };
    }

    // 9. QUIT
    await sendCmd(sock, 'QUIT');
    sock.destroy();

    return { ok: true };
  } catch (e) {
    if (rawSock && !rawSock.destroyed) rawSock.destroy();
    return {
      ok: false,
      error: `SMTP 连接错误：${e instanceof Error ? e.message : '未知错误'}`,
    };
  }
}
