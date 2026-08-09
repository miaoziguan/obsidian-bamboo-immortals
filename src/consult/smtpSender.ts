/**
 * smtpSender — 纯 Node.js SMTP 发件客户端（零第三方依赖）
 *
 * 直接从 Obsidian 桌面端（Electron）发邮件到羽鳞君的收件箱。
 * 用户自配 SMTP 凭证，凭证仅保存在本地 data.json，无后端/无中转。
 *
 * 实现参考 bamboo-license-gen/src/license/smtpSender.ts 的成熟写法：
 *   - 事件驱动状态机（避免 readLine 里 Buffer/string 混用导致的超时）
 *   - tls.connect 后显式 setEncoding('utf-8')（关键：否则中文分包会错位 → 一直读到超时）
 *   - socket 级 setTimeout 兜底，不再逐条 readLine 单独计时
 */

// 不顶层 import 'net'/'tls'：官方 lint 禁止直接引入 Node 内置模块（移动端无运行时）。
// 运行时模块经 nodeRequire() 通过桌面端 Electron 的全局 window.require 惰性加载，
// 并由 isSmtpAvailable() 守卫（仅桌面端触发）。

/** SMTP 底层 socket 的最小形状（net.Socket / tls.TLSSocket 共有） */
interface SmtpSocket {
  write(chunk: string | Uint8Array): boolean;
  destroy(): void;
  end(): void;
  destroyed: boolean;
  setEncoding(enc: string): void;
  setTimeout(ms: number, cb?: () => void): void;
  setNoDelay?(v: boolean): void;
  on(event: 'data', listener: (chunk: string | Buffer) => void): void;
  on(event: 'error', listener: (err: Error) => void): void;
  on(event: 'close', listener: () => void): void;
  off(event: 'data', listener: (chunk: string | Buffer) => void): void;
  off(event: 'error', listener: (err: Error) => void): void;
  off(event: 'close', listener: () => void): void;
}

/** 经 window.require 惰性加载的 net 模块形状 */
interface NetModule {
  connect(opts: { host: string; port: number }): SmtpSocket;
}

/** 经 window.require 惰性加载的 tls 模块形状 */
interface TlsModule {
  connect(opts: { host: string; port: number; rejectUnauthorized?: boolean }): SmtpSocket;
  connect(opts: { socket: SmtpSocket; host?: string; port?: number; rejectUnauthorized?: boolean }): SmtpSocket;
}

/**
 * 惰性加载 Node.js 内置模块。
 * 仅在桌面端 Electron 可用（window.require 存在），调用方需先经 isSmtpAvailable() 守卫。
 */
function nodeRequire(id: 'net'): NetModule;
function nodeRequire(id: 'tls'): TlsModule;
function nodeRequire(id: string): unknown {
  const req = (window as unknown as { require?: (id: string) => unknown }).require;
  if (typeof req !== 'function') {
    throw new Error('当前环境不支持 Node.js 网络模块（竹林咨询仅支持桌面端）');
  }
  return req(id);
}

/** 当前环境是否可用 SMTP 发信（桌面端 Electron 才有全局 require） */
export function isSmtpAvailable(): boolean {
  return typeof (window as unknown as { require?: unknown }).require === 'function';
}

export interface SmtpConfig {
  host: string;     // SMTP 服务器地址，如 smtp.qq.com
  port: number;     // 通常 465（SSL）或 587（STARTTLS）
  secure: boolean;  // true = SSL 直连(465)，false = STARTTLS(587)
  user: string;     // 邮箱账号（发件人，需完整邮箱如 xxx@qq.com）
  pass: string;     // SMTP 授权码
  fromName?: string; // 发件人显示名（可选）
}

export interface SendResult {
  ok: boolean;
  error?: string;
  trace?: string[]; // 调试追踪：每条发送/接收的命令（密码已脱敏）
}

function b64(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64');
}

/**
 * 发送一封邮件（事件驱动状态机版，对齐 license-gen 成熟实现）
 *
 * secure=true 走 465 SSL；secure=false 走 587 STARTTLS（明文 EHLO → STARTTLS → TLS 升级 → 再 EHLO）。
 */
export function sendEmail(
  cfg: SmtpConfig,
  to: string,
  subject: string,
  bodyHtml: string,
): Promise<SendResult> {
  return new Promise((resolve) => {
    if (!cfg.user || !cfg.pass) {
      resolve({ ok: false, error: 'SMTP 未配置：请先在插件设置中填写发件邮箱和 SMTP 授权码' });
      return;
    }
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      resolve({ ok: false, error: '收件人邮箱格式不合法' });
      return;
    }
    // QQ/腾讯企业邮要求 MAIL FROM 必须完整邮箱，纯 QQ 号码会被反垃圾网关拒
    if (!/^[^@\s]+@[^@\s]+$/.test(cfg.user)) {
      resolve({ ok: false, error: '发件邮箱格式不合法：需填写完整邮箱（如 xxx@qq.com），不能是纯 QQ 号码' });
      return;
    }
    if (!isSmtpAvailable()) {
      resolve({ ok: false, error: '竹林咨询仅支持桌面端（移动端无法直连 SMTP）' });
      return;
    }

    const host = cfg.host || 'smtp.qq.com';
    const port = cfg.port || (cfg.secure ? 465 : 587);

    // 配置自检：secure 与 port 必须匹配，否则服务器不回话 → 表现就是「读取响应超时」
    if (cfg.secure && port !== 465) {
      resolve({ ok: false, error: `配置有误：已开启 SSL 直连，端口应为 465，当前为 ${port}。请改端口为 465，或关闭 SSL 直连改用 587 + STARTTLS。` });
      return;
    }
    if (!cfg.secure && port !== 587) {
      resolve({ ok: false, error: `配置有误：未开启 SSL 直连（STARTTLS 模式），端口应为 587，当前为 ${port}。请改端口为 587，或开启 SSL 直连改用 465。` });
      return;
    }

    const net = nodeRequire('net');
    const tls = nodeRequire('tls');

    const conn: SmtpSocket = cfg.secure
      ? tls.connect({ host, port, rejectUnauthorized: false })
      : net.connect({ host, port });

    const trace: string[] = [];

    // 状态机步骤
    //   0=等待 banner / 发 EHLO
    //   1=AUTH LOGIN（或 STARTTLS，待 STARTTLS 升级后重置为 0）
    //   2=AUTH 用户名 b64
    //   3=AUTH 密码 b64
    //   4=MAIL FROM
    //   5=RCPT TO
    //   6=DATA
    //   7=邮件头+正文（等 354 后写 body，250 后结束）
    //   8=QUIT
    //   9=结束（resolve）
    let step = 0;
    let buffer = '';
    let answered = false;
    let secureUpgraded = cfg.secure; // STARTTLS 升级后置 true

    const fail = (msg: string) => {
      if (answered) return;
      answered = true;
      try { conn.destroy(); } catch { /* noop */ }
      resolve({ ok: false, error: msg, trace });
    };

    const sendNext = () => {
      let raw = '';
      switch (step) {
        case 0:
          raw = `EHLO ${host}\r\n`;
          break;
        case 1:
          raw = cfg.secure ? 'AUTH LOGIN\r\n' : 'STARTTLS\r\n';
          break;
        case 2:
          raw = b64(cfg.user) + '\r\n'; // AUTH 用户名（收到 334 后发）
          break;
        case 3:
          raw = b64(cfg.pass) + '\r\n'; // AUTH 密码（收到 334 后发）
          break;
        case 4:
          raw = `MAIL FROM:<${cfg.user}>\r\n`;
          break;
        case 5:
          raw = `RCPT TO:<${to}>\r\n`;
          break;
        case 6:
          raw = 'DATA\r\n';
          break;
        case 7: {
          const fromName = cfg.fromName || '竹林修仙传';
          const subjectEncoded = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
          const head =
            `From: "${fromName}" <${cfg.user}>\r\n` +
            `To: <${to}>\r\n` +
            `Subject: ${subjectEncoded}\r\n` +
            'MIME-Version: 1.0\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            '\r\n';
          const body = bodyHtml.replace(/^\./gm, '..') + '\r\n.\r\n';
          raw = head + body;
          break;
        }
        case 8:
          raw = 'QUIT\r\n';
          break;
      }
      // 调试日志：写出/读入的行（密码 b64 已脱敏为 ***）
      const masked = raw.replace(b64(cfg.pass), '***');
      trace.push(`>>> ${masked.replace(/\r\n/g, '\\r\\n')}`);
      conn.write(raw);
    };

    const handleData = (chunk: string | Buffer) => {
      buffer += chunk.toString();
      let idx: number;
      while ((idx = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const code = parseInt(line.slice(0, 3), 10);
        const cont = line[3] === '-'; // 多行续接（如 EHLO 多条）
        trace.push(`<<< ${line}`);
        if (cont) continue; // 多行响应续接，不处理

        if (code >= 400) {
          fail(`SMTP 错误 ${code}：${line}`);
          return;
        }

        // STARTTLS 升级：明文收到 220 后把 socket 升级为 TLS，再重新发 EHLO
        if (!secureUpgraded && code === 220) {
          secureUpgraded = true;
          const tlsSock = tls.connect({ socket: conn, host, rejectUnauthorized: false });
          tlsSock.setEncoding('utf-8');
          tlsSock.on('data', handleData);
          tlsSock.on('error', (err: Error) => fail(`连接/发送失败：${err.message}`));
          tlsSock.on('close', () => { if (!answered) fail('连接意外关闭，邮件可能未发送'); });
          step = 0;
          tlsSock.write(`EHLO ${host}\r\n`);
          trace.push('>>> (STARTTLS 升级为 TLS 后重发 EHLO)');
          return;
        }

        // 连接 banner（连接刚建立时的 220）不是命令响应，不推进 step
        if (step === 0 && code === 220) return;

        // AUTH LOGIN 的中间应答 334：直接发下一步（用户名/密码），不 step++
        if (code === 334) {
          // step=1 刚发完 AUTH LOGIN → 发用户名(step=2)
          // step=2 刚发完用户名 → 发密码(step=3)
          if (step === 1 || step === 2) {
            step++;
            sendNext();
          } else {
            fail(`SMTP 协议错误：意外收到 334（step=${step}）`);
          }
          continue;
        }

        // 正常命令完成（250/235 等）：推进 step，发下一条
        step++;
        if (step >= 9) {
          answered = true;
          try { conn.end(); } catch { /* noop */ }
          resolve({ ok: true, trace });
          return;
        }
        sendNext();
      }
    };

    conn.setEncoding('utf-8');
    conn.on('data', handleData);
    conn.on('error', (err: Error) => fail(`连接/发送失败：${err.message}`));
    conn.on('close', () => { if (!answered) fail('连接意外关闭，邮件可能未发送'); });
    // 整体兜底超时（socket 级，比逐条 readLine 计时更稳）
    conn.setTimeout(15000, () => fail('SMTP 超时（15s）：服务器未在规定时间内响应，请检查网络/代理或端口配置'));

    // 连接建立后立即触发首次 EHLO（banner 是被动接收，不阻塞）
    const onReady = () => sendNext();
    if (cfg.secure) {
      (conn as unknown as { once(ev: string, cb: () => void): void }).once('secureConnect', onReady);
    } else {
      (conn as unknown as { once(ev: string, cb: () => void): void }).once('connect', onReady);
    }
  });
}
