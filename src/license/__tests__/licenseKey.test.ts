import { describe, it, expect } from 'vitest';
import { verifyLicenseKey, getLicenseTag, normalizeUserIdentity } from '../licenseKey';
import crypto from 'node:crypto';

// 测试环境补齐 Web Crypto（浏览器原生有 globalThis.crypto，node 测试需注入）
if (!(globalThis as { crypto?: unknown }).crypto) {
  (globalThis as { crypto?: unknown }).crypto = crypto.webcrypto;
}

// 复用 gen-license 的 SECRET 还原（与 secretShards 对齐）
import { XOR_PASS_SHARDS, AES_WRAPPED_SECRET_B64, AES_WRAP_KEY_SEED } from '../secretShards';

function decodeSecret(encoded: string, pass: string): string {
  let out = '';
  for (let i = 0; i < encoded.length; i++) {
    out += String.fromCharCode(encoded.charCodeAt(i) ^ pass.charCodeAt(i % pass.length));
  }
  return out;
}

function resolveSecret(): string {
  const xorPass = XOR_PASS_SHARDS.join('');
  const wrapped = Buffer.from(AES_WRAPPED_SECRET_B64, 'base64');
  const iv = wrapped.slice(0, 12);
  const tag = wrapped.slice(12, 28);
  const ct = wrapped.slice(28);
  const aesKey = crypto.createHash('sha256').update(AES_WRAP_KEY_SEED).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
  decipher.setAuthTag(tag);
  const xorEncoded = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  return decodeSecret(xorEncoded, xorPass);
}

const SECRET = resolveSecret();

// 生成用户码（与 scripts/gen-license.mjs 同算法，码格式 BRI-<TAG4>-<SIG20>）
function genUser(userIdentity: string): string {
  const tag = crypto
    .createHash('sha256')
    .update(normalizeUserIdentity(userIdentity))
    .digest('hex')
    .slice(0, 4)
    .toUpperCase();
  const sig = crypto
    .createHash('sha256')
    .update(`${tag}-${SECRET}`)
    .digest('hex')
    .slice(0, 20)
    .toUpperCase();
  return 'BRI-' + (tag + sig).match(/.{1,4}/g)!.join('-');
}

describe('licenseKey · 一用户一码（方案 B，已废通用码）', () => {
  it('用户码校验通过，且同用户确定性', async () => {
    const a = genUser('bob@x.com');
    const b = genUser('bob@x.com');
    expect(a).toBe(b);
    expect(await verifyLicenseKey(a)).toBe(true);
    expect(getLicenseTag(a)).toBe(a.split('-')[1]);
  });

  it('不同用户拿到不同码', async () => {
    expect(genUser('bob@x.com')).not.toBe(genUser('alice@x.com'));
  });

  it('非法码 / 篡改 SIG 校验失败', async () => {
    const valid = genUser('carol@x.com');
    const broken = valid.slice(0, -1) + (valid.endsWith('0') ? '1' : '0');
    expect(await verifyLicenseKey(broken)).toBe(false);
    expect(await verifyLicenseKey('BRI-9-ZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZ')).toBe(false);
  });

  it('黑名单 TAG 被本地判伪', async () => {
    const tag = genUser('dave@x.com').split('-')[1];
    // 动态把 TAG 注入 REVOKED_TAGS（模拟发版作废）
    const { REVOKED_TAGS } = await import('../secretShards');
    REVOKED_TAGS.push(tag);
    expect(await verifyLicenseKey(genUser('dave@x.com'))).toBe(false);
    REVOKED_TAGS.pop();
  });
});
