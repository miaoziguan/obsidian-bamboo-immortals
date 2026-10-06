/**
 * smtpSender 状态机回归测试
 *
 * 【背景】587/STARTTLS 模式此前 100% 不可用，根因是状态机把「连接 banner」
 * （服务器建连后的 220 greeting）误当成「STARTTLS 被接受」，在仍是明文的
 * socket 上发起 TLS 握手。旧实现另有两个连带缺陷：
 *   1. sendNext 用 cfg.secure 而非实际 TLS 状态判断，升级后会再发一次 STARTTLS；
 *   2. 升级时未从旧 socket 摘掉 data 监听，同一份数据会被处理两次。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { sendEmail } from '../smtpSender';

type Handler = (...a: unknown[]) => void;

class FakeSocket {
    written: string[] = [];
    destroyed = false;
    timeoutMs = 0;
    /** 供测试直接派发 connect/secureConnect 等事件 */
    handlers: Record<string, Handler[]> = {};

    setEncoding(): this { return this; }
    setTimeout(ms: number): this { this.timeoutMs = ms; return this; }
    write(chunk: string): boolean { this.written.push(chunk); return true; }
    destroy(): void { this.destroyed = true; }
    end(): void { this.destroyed = true; }
    on(ev: string, fn: Handler): this { (this.handlers[ev] ||= []).push(fn); return this; }
    off(ev: string, fn: Handler): this {
        this.handlers[ev] = (this.handlers[ev] || []).filter((f) => f !== fn);
        return this;
    }
    once(ev: string, fn: Handler): this {
        const wrapped: Handler = (...a) => { this.off(ev, wrapped); fn(...a); };
        return this.on(ev, wrapped);
    }
    /** 测试侧「服务器」投递一行响应 */
    reply(line: string): void { (this.handlers['data'] || []).forEach((f) => f(line + '\r\n')); }
    fireError(msg: string): void { (this.handlers['error'] || []).forEach((f) => f(new Error(msg))); }
    get dataHandlerCount(): number { return (this.handlers['data'] || []).length; }
    get all(): string { return this.written.join(''); }
}

const HOST = 'smtp.qq.com';
const CFG_BASE = { host: HOST, user: 'me@qq.com', pass: 'smtp-auth-code', fromName: '竹林修仙传' };

describe('smtpSender · STARTTLS(587) 状态机', () => {
    let plain: FakeSocket;
    let secure: FakeSocket;
    let tlsUpgradeArgs: Record<string, unknown> | null;

    beforeEach(() => {
        plain = new FakeSocket();
        secure = new FakeSocket();
        tlsUpgradeArgs = null;
        (globalThis as unknown as { window: unknown }).window = {
            require: (id: string) => {
                if (id === 'net') return { connect: () => plain };
                if (id === 'tls') {
                    return {
                        connect: (opts: Record<string, unknown>) => {
                            if (!opts.socket) return secure;   // 465 直连
                            tlsUpgradeArgs = opts;              // STARTTLS 升级
                            return secure;
                        },
                    };
                }
                throw new Error('unexpected require: ' + id);
            },
        };
    });

    const start587 = (extra?: Record<string, unknown>) => {
        const p = sendEmail({ ...CFG_BASE, port: 587, secure: false, ...extra }, 'to@qq.com', '主题', '<p>正文</p>');
        (plain.handlers['connect'] || []).forEach((f) => f());
        return p;
    };

    it('587 全流程应发送成功，命令序列符合 RFC', async () => {
        const promise = start587();
        plain.reply('220 smtp.qq.com ESMTP ready');   // banner（非命令应答）
        plain.reply('250-smtp.qq.com');
        plain.reply('250 STARTTLS');                   // EHLO 能力应答
        plain.reply('220 2.0.0 Ready to start TLS');   // STARTTLS 被接受
        secure.reply('250-smtp.qq.com');               // 升级后重发 EHLO
        secure.reply('250 AUTH LOGIN');
        secure.reply('334 VXNlcm5hbWU6');
        secure.reply('334 UGFzc3dvcmQ6');
        secure.reply('235 2.7.0 Authentication successful');
        secure.reply('250 2.1.0 Ok');
        secure.reply('250 2.1.5 Ok');
        secure.reply('354 End data with <CR><LF>.<CR><LF>');
        secure.reply('250 2.0.0 Ok: queued');
        secure.reply('221 2.0.0 Bye');

        const result = await promise;
        expect(result.ok).toBe(true);
        expect(result.error).toBeUndefined();

        expect(plain.all).toContain('EHLO ' + HOST);
        expect(plain.all).toContain('STARTTLS');
        expect(plain.all).not.toContain('AUTH LOGIN');   // 升级前不得发送凭据
        expect(secure.all).toContain('EHLO ' + HOST);
        expect(secure.all).toContain('AUTH LOGIN');
        expect(secure.all.match(/STARTTLS/g) || []).toHaveLength(0);
        expect(secure.all).toContain('MAIL FROM:<me@qq.com>');
        expect(secure.all).toContain('RCPT TO:<to@qq.com>');
        expect(secure.all).toContain('DATA');
    });

    it('回归：连接 banner 的 220 不得触发 TLS 升级', async () => {
        const promise = start587();
        plain.reply('220 smtp.qq.com ESMTP ready');
        expect(tlsUpgradeArgs).toBeNull();
        expect(plain.all).not.toContain('AUTH LOGIN');
        plain.fireError('stop');
        await promise;
    });

    it('回归：升级时摘掉明文 socket 的 data 监听，避免重复处理', async () => {
        const promise = start587();
        // 建连后明文 socket 上挂着 data 监听
        expect(plain.dataHandlerCount).toBe(1);
        plain.reply('220 banner');
        plain.reply('250-smtp');
        plain.reply('250 STARTTLS');
        plain.reply('220 go ahead');
        expect(tlsUpgradeArgs).not.toBeNull();
        // 升级后必须为 0：否则同一份数据会被 handleData 处理两次
        expect(plain.dataHandlerCount).toBe(0);
        expect(secure.dataHandlerCount).toBe(1);
        secure.fireError('stop');
        await promise;
    });

    it('TLS 升级应携带 SNI，且默认开启证书校验', async () => {
        const promise = start587();
        plain.reply('220 banner');
        plain.reply('250-smtp');
        plain.reply('250 STARTTLS');
        plain.reply('220 go ahead');
        expect(tlsUpgradeArgs).toMatchObject({ host: HOST, servername: HOST, rejectUnauthorized: true });
        secure.fireError('stop');
        await promise;
    });

    it('显式允许自签证书时才关闭校验', async () => {
        const promise = start587({ allowSelfSignedCert: true });
        plain.reply('220 banner');
        plain.reply('250-smtp');
        plain.reply('250 STARTTLS');
        plain.reply('220 go ahead');
        expect(tlsUpgradeArgs).toMatchObject({ rejectUnauthorized: false });
        secure.fireError('stop');
        await promise;
    });

    it('465 直连不应走 STARTTLS，且凭据不进 trace', async () => {
        const p = sendEmail({ ...CFG_BASE, port: 465, secure: true }, 'to@qq.com', '主题', '正文');
        (secure.handlers['secureConnect'] || []).forEach((f) => f());
        expect(secure.all).toContain('EHLO ' + HOST);
        expect(secure.all).not.toContain('STARTTLS');
        secure.reply('250-smtp');
        secure.reply('250 AUTH LOGIN');
        secure.reply('334 VXNlcm5hbWU6');
        secure.reply('334 UGFzc3dvcmQ6');
        secure.reply('235 ok');
        secure.reply('250 Ok');
        secure.reply('250 Ok');
        secure.reply('354 go');
        secure.reply('250 queued');
        secure.reply('221 bye');
        const result = await p;
        expect(result.ok).toBe(true);
        const trace = (result.trace || []).join('\n');
        expect(trace).not.toContain('c21tcC1hdXRoLWNvZGU');   // b64(pass)
        expect(trace).toContain('***');
    });
});
