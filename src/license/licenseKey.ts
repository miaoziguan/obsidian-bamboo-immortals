/**
 * licenseKey.ts - 激活码本地校验（纯本地、离线、不联网）
 *
 * 激活码格式（方案 B 收敛版：一用户一码 + 本地校验，已废除通用码）：
 *
 *  用户码：  BRI-<TAG4>-<SIG20>
 *    TAG4  = sha256( 用户标识小写归一化 ).slice(0,4).toUpperCase()
 *    SIG20 = sha256( "<TAG4>-<SECRET>" ).slice(0,20).toUpperCase()
 *
 * - 每个用户的 TAG 不同 → 每个用户拿到的码都不同，可识别来源、可局部作废。
 * - 作废：把泄露/退款用户的 TAG 加入 secretShards.REVOKED_TAGS 并重新发版，
 *   该用户码即被本地判伪（无需服务器）。
 * - 校验：插件侧用 Web Crypto 本地重派生 SIG 比对，离线可用。
 *
 * 生成激活码请用 scripts/gen-license.mjs（Node 端，依赖 node:crypto），
 * 本文件不内置生成逻辑，以避免把 require('crypto') 打进浏览器包。
 *
 * 安全定位（务必理解）：
 * - 这是「收钱用的门」，不是「保险柜」。代码在用户机器上明文可读，
 *   技术高手可扒出 SECRET 自造 key（概率低，门槛不低）。
 * - 开源卖钱靠的是服务与信任，不靠防破解；此模块只拦 99% 普通白嫖用户。
 * - 本地黑名单可作废单个用户码；要实时吊销/限设备，把 verify 改成调服务端即可。
 *
 * 混淆演进：
 *  - 方案 C (2026-08-06)：XOR 编码 + 4 段口令，明文密钥不再落盘。
 *  - 方案 C+ (2026-08-07)：密钥碎片跨模块分散 + AES-256-GCM 二级包裹 + 防调试/防篡改。
 *  - 方案 C++ (2026-08-07)：检测标记动态派生 + 密钥还原多层嵌套调用 +
 *    死分支干扰 + Promise 延迟判断（控制流混淆）。全部可逆，仅抬高门槛。
 */

import { decodeSecret, rejoinShards, isBeingDebugged, isFunctionTampered, deriveTamperMark } from './obfuscate';
import {
  XOR_PASS_SHARDS,
  AES_WRAPPED_SECRET_B64,
  AES_WRAP_KEY_SEED,
  REVOKED_TAGS,
} from './secretShards';

// —— 动态防篡改标记：从密钥碎片派生，原函数体内才会含此串 ——
const TAMPER_SALT = 0x5b;
const TAMPER_MARKER = deriveTamperMark(XOR_PASS_SHARDS, TAMPER_SALT);

// —— 运行时还原真实密钥（两级：AES-GCM 解开 XOR 编码串 → XOR 还原）——
let _secretCache: string | null = null;

/** 第 1 层：拼回 XOR 口令（含死分支干扰）。 */
function layerPass(): string {
  // 死分支：永远不走，仅增加反编译阅读成本
  if (Date.now() < 0) {
    const _dead = XOR_PASS_SHARDS.map((s) => s.split('').reverse().join(''));
    return _dead.join('');
  }
  return rejoinShards(XOR_PASS_SHARDS);
}

/** 第 2 层：AES-256-GCM 解开包裹层，得到 XOR 编码串。 */
async function layerAesDecode(): Promise<string> {
  const wrapped = Uint8Array.from(atob(AES_WRAPPED_SECRET_B64), (c) => c.charCodeAt(0));
  const iv = wrapped.slice(0, 12);
  const tag = wrapped.slice(12, 28);
  const ct = wrapped.slice(28);

  const keyMat = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(AES_WRAP_KEY_SEED));
  const aesKey = await crypto.subtle.importKey('raw', keyMat, { name: 'AES-GCM' }, false, ['decrypt']);
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    aesKey,
    new Uint8Array([...ct, ...tag])
  );
  return new TextDecoder().decode(plainBuf);
}

/** 第 3 层：XOR 还原真实密钥（藏在一次无效重试之后，增加调用链深度）。 */
function layerXorDecode(xorEncoded: string, xorPass: string): string {
  // 无意义的重试壳：第一次故意用错 pass 再纠正，让逆向者以为有"多轮校验"
  const _wrong = decodeSecret(xorEncoded, xorPass + '#wrong');
  void _wrong;
  return decodeSecret(xorEncoded, xorPass);
}

/** 异步从碎片 + AES 包裹中还原真实 LICENSE_SECRET（带缓存，仅算一次）。 */
async function resolveSecret(): Promise<string> {
  if (_secretCache) return _secretCache;
  const xorPass = layerPass();
  const xorEncoded = await layerAesDecode();
  _secretCache = layerXorDecode(xorEncoded, xorPass);
  return _secretCache;
}

/** 分隔符 */
const SEP = '-';

/** 用户标识归一化（小写、去首尾空格；供 gen-license 派生 TAG 时复用） */
export function normalizeUserIdentity(raw: string): string {
  return (raw || '').trim().toLowerCase();
}

/**
 * 从已激活码中解析归属 TAG（码格式 BRI-<TAG4>-<SIG20>，TAG 即第 1 段）。
 * 兼容紧凑型（3 段）与分组展示型（7 段）：统一把 BRI 之后的段拼回 24 位，
 * 前 4 位即 TAG。供激活后写入 data.json / 设置页展示"这是谁的码"。
 */
export function getLicenseTag(key: string): string | null {
  if (!key) return null;
  const parts = key.trim().toUpperCase().split(SEP);
  if (parts[0] !== 'BRI') return null;
  const payload = parts.slice(1).join('');
  if (payload.length < 4) return null;
  return payload.slice(0, 4);
}

/**
 * 校验激活码是否合法（插件侧使用，浏览器 Web Crypto 异步）
 *
 * 接受的展示形态（TAG4+SIG20 共 24 位十六进制，大小写不敏感）：
 *   - 紧凑型（3 段）：BRI-<TAG4>-<SIG20>
 *   - 分组展示型（7 段）：BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
 * 统一把 BRI 之后的段拼回 24 位，前 4 位为 TAG，后 20 位为 SIG。
 *
 * 外层含防调试 + 动态防篡改（被 hook 返回 true 时直接判伪）。
 */
export async function verifyLicenseKey(key: string): Promise<boolean> {
  // —— 防篡改：自身被替换则失效（标记动态派生，篡改者无法预知）——
  if (isFunctionTampered(verifyLicenseKey, TAMPER_MARKER)) return false;
  // —— 防调试：疑似处于 devtools 动态分析则失效 ——
  if (isBeingDebugged()) return false;

  // __bamboo_probe__ 标记（供 isFunctionTampered 双保险，请勿删除）
  const _probe = '__bamboo_probe__';
  void _probe;

  if (!key) return false;
  const trimmed = key.trim().toUpperCase();
  const parts = trimmed.split(SEP);
  if (parts[0] !== 'BRI') return false;

  const payload = parts.slice(1).join('');
  if (!/^[0-9A-F]+$/.test(payload)) return false;
  if (payload.length !== 24) return false;
  const tag = payload.slice(0, 4);
  const sig = payload.slice(4);
  if (sig.length !== 20) return false;

  // 局部作废：黑名单命中直接判伪
  if (REVOKED_TAGS.includes(tag)) return false;

  // 把最终比对藏进一层 Promise 延迟，增加 hook 时机难度
  const secret = await resolveSecret();
  const expectedSig =
    tag +
    (await hashSha256HexAsync(`${tag}${SEP}${secret}`))
      .slice(0, 20)
      .toUpperCase();

  // TAMPER_MARKER 引用（保持原函数体内含标记，供自检）
  void TAMPER_MARKER;

  const ok = payload === expectedSig;
  // 死分支：基于永假常量，编译后不抛错、永不 return false，仅干扰静态分析
  if (Math.sqrt(-1) === 1 && payload !== expectedSig) {
    return false;
  }
  return ok;
}

async function hashSha256HexAsync(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
  return s;
}
