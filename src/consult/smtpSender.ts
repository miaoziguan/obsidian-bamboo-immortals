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
  on(event: 'data', listener: (chunk: string | Uint8Array) => void): void;
  on(event: 'error', listener: (err: Error) => void): void;
  on(event: 'close', listener: () => void): void;
  off(event: 'data', listener: (chunk: string | Uint8Array) => void): void;
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
  connect(opts: {
    socket: SmtpSocket;
    host?: string;
    port?: number;
    /** SNI：证书校验依赖主机名，缺失时会对多域名证书校验失败 */
    servername?: string;
    rejectUnauthorized?: boolean;
  }): SmtpSocket;
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

/** socket 级兜底超时（毫秒） */
const SMTP_TIMEOUT_MS = 15000;

export interface SmtpConfig {
  host: string;     // SMTP 服务器地址，如 smtp.qq.com
  port: number;     // 通常 465（SSL）或 587（STARTTLS）
  secure: boolean;  // true = SSL 直连(465)，false = STARTTLS(587)
  user: string;     // 邮箱账号（发件人，需完整邮箱如 xxx@qq.com）
  pass: string;     // SMTP 授权码
  fromName?: string; // 发件人显示名（可选）
  /**
   * 是否跳过 TLS 证书校验。默认 false（校验开启）。
   * 仅在自建/自签证书的私有 SMTP 服务器上才应开启 ——
   * 关闭校验会让授权码（等同邮箱密码）暴露给中间人。
   */
  allowSelfSignedCert?: boolean;
}

export interface SendResult {
  ok: boolean;
  error?: string;
  trace?: string[]; // 调试追踪：每条发送/接收的命令（密码已脱敏）
}

function b64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
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

    // 证书校验默认开启。仅当用户显式开启「允许自签证书」时才关闭 ——
    // 授权码等同邮箱密码，关闭校验会让它暴露给中间人。
    const allowSelfSigned = cfg.allowSelfSignedCert === true;

    // 注意用 let：STARTTLS 升级后要把 conn 换成 TLSSocket，
    // 否则后续命令仍写入已被包裹的原始 socket。
    let conn: SmtpSocket = cfg.secure
      ? tls.connect({ host, port, rejectUnauthorized: !allowSelfSigned })
      : net.connect({ host, port });

    const trace: string[] = [];

    // 状态机步骤
    //   0=等待 banner / 发 EHLO
    //   1=AUTH LOGIN（非 secure 时为 STARTTLS，收到其 220 后升级 TLS 并重置为 0）
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
    let secureUpgraded = cfg.secure;      // 已是 TLS（465 直连，或已完成 STARTTLS）
    let awaitingStartTlsReply = false;    // 已发出 STARTTLS，正等待服务器的 220
    // 刚建连、尚未收到任何响应时，服务器会先来一个 220 banner。
    // 它不是对任何命令的应答，绝不能被当成「STARTTLS 被接受」。
    let sawBanner = false;

    const fail = (msg: string) => {
      if (answered) return;
      answered = true;
      try { conn.destroy(); } catch { /* noop */ }
      resolve({ ok: false, error: msg, trace });
    };

    // 具名处理器：STARTTLS 升级时需要能把它们从旧 socket 上摘掉，
    // 因此不能写成内联箭头函数（拿不到引用）。
    const onConnError = (err: Error) => fail(`连接/发送失败：${err.message}`);
    const onConnClose = () => { if (!answered) fail('连接意外关闭，邮件可能未发送'); };

    const sendNext = () => {
      let raw = '';
      switch (step) {
        case 0:
          raw = `EHLO ${host}\r\n`;
          break;
        case 1:
          // 判断依据必须是 secureUpgraded（实际是否已在 TLS 上），而不是 cfg.secure。
          // STARTTLS 升级后 cfg.secure 仍为 false，若据此判断会再发一次 STARTTLS，
          // 服务器此时已在 TLS 上等待 EHLO/AUTH 回应，必然超时 → 587 模式依旧不可用。
          if (secureUpgraded) {
            raw = 'AUTH LOGIN\r\n';
          } else {
            raw = 'STARTTLS\r\n';
            // 只有发出了 STARTTLS，其后的 220 才代表「同意升级」
            awaitingStartTlsReply = true;
          }
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
          const subjectEncoded = `=?UTF-8?B?${b64(subject)}?=`;
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

    const handleData = (chunk: string | Uint8Array) => {
      buffer += chunk.toString();
      let idx: number;
      while ((idx = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const code = parseInt(line.slice(0, 3), 10);
        const cont = line[3] === '-'; // 多行续接（如 EHLO 多条）
        // 收发双向脱敏：base64 后的账号/授权码不应出现在 trace 里
        // （服务器回包也可能回显凭据，旧实现只对写出行做替换）。
        const safeLine = line
          .split(b64(cfg.pass)).join('***')
          .split(b64(cfg.user)).join('<user>');
        trace.push(`<<< ${safeLine}`);
        if (cont) continue; // 多行响应续接，不处理

        if (code >= 400) {
          fail(`SMTP 错误 ${code}：${line}`);
          return;
        }

        // 连接 banner：服务器建连后的第一行 greeting，不是对任何命令的应答。
        // 【关键】必须先于 STARTTLS 判定处理掉。旧实现只判 `code === 220`，
        // 而 banner 恰好也是 220 且在 step 0 最早到达，于是被误当成「STARTTLS 被接受」，
        // 在仍是明文的 socket 上发起 TLS 握手 —— 服务器此刻还在等 EHLO 响应，
        // 握手必然失败，587 模式 100% 不可用（banner 守卫在其之后，永远走不到）。
        if (!sawBanner && !awaitingStartTlsReply && code === 220) {
          sawBanner = true;
          trace.push('<<< (连接 banner，非命令应答，已忽略)');
          return;
        }

        // STARTTLS 升级：仅当确实已发出 STARTTLS 且收到其 220 时才升级
        if (!secureUpgraded && awaitingStartTlsReply && code === 220) {
          awaitingStartTlsReply = false;
          secureUpgraded = true;
          // 明文 socket 交由 TLS 接管前，必须摘掉旧监听 ——
          // 否则升级后同一份数据会被 handleData 处理两次（重复推进状态机）。
          try {
            conn.off('data', handleData);
            conn.off('error', onConnError);
            conn.off('close', onConnClose);
            conn.setTimeout(0);
          } catch { /* noop */ }
          const tlsSock = tls.connect({
            socket: conn,
            host,
            servername: host,          // SNI：证书校验依赖，必须给
            rejectUnauthorized: !allowSelfSigned,
          });
          tlsSock.setEncoding('utf-8');
          tlsSock.setTimeout(SMTP_TIMEOUT_MS, () => fail('SMTP 超时：STARTTLS 升级后服务器未响应'));
          conn = tlsSock;              // 后续命令必须写新的 TLS socket
          tlsSock.on('data', handleData);
          tlsSock.on('error', onConnError);
          tlsSock.on('close', onConnClose);
          // RFC 3207：TLS Negotiation 之后能力需重新协商，故重置状态并重发 EHLO
          step = 0;
          buffer = '';
          sendNext();
          trace.push('>>> (STARTTLS 已升级为 TLS，重置状态并重发 EHLO)');
          return;
        }

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
    conn.on('error', onConnError);
    conn.on('close', onConnClose);
    // 整体兜底超时（socket 级，比逐条 readLine 计时更稳）
    conn.setTimeout(SMTP_TIMEOUT_MS, () => fail('SMTP 超时（15s）：服务器未在规定时间内响应，请检查网络/代理或端口配置'));

    // 连接建立后立即触发首次 EHLO（banner 是被动接收，不阻塞）
    const onReady = () => sendNext();
    if (cfg.secure) {
      (conn as unknown as { once(ev: string, cb: () => void): void }).once('secureConnect', onReady);
    } else {
      (conn as unknown as { once(ev: string, cb: () => void): void }).once('connect', onReady);
    }
  });
}
