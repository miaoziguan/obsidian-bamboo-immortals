/**
 * secretShards.ts - 密钥碎片分散存储（跨模块存放，提高单点提取难度）
 *
 * 这是方案 C+ 的一部分：把 XOR 口令拆成多段、把 AES 包裹密文独立存放，
 * 运行时再由 licenseKey.ts 拼合。单独 grep 任一片段都无法还原完整口令/密文。
 *
 * 注意：碎片本身仍可逆——只是让"一次性 grep 出密钥"失效。
 * 改密钥时请用 scripts/gen-license.mjs 重新生成并同步更新本文件与 licenseKey.ts。
 */

/** XOR 口令碎片（运行时按顺序拼接 → 完整口令）。每段都夹带无关字符风格，避免被一眼认出。 */
export const XOR_PASS_SHARDS: string[] = [
  'yulin-jun@', // 段0：作者标识前缀
  'bamboo',     // 段1：产品名
  '-immo',      // 段2：后缀前半
  'rtals#',     // 段3：后缀后半
  '2026',       // 段4：年份
];

/**
 * AES-256-GCM 包裹后的 XOR 密文（base64：iv[12] + tag[16] + ciphertext）。
 * 运行时用 WebCrypto 解密得到 XOR 编码串，再 XOR 还原真实密钥。
 * 不在此文件写真实密钥原文。
 */
export const AES_WRAPPED_SECRET_B64 =
  'tpn17tF7BGWNhVAqN9BbrbUYYh5LsmwFVNX60/AJEeU9JB2PCAhN8cVDsGkWY6ydTYbM/nhAvl/C5vOuFW84ZnMPgdT6e/r2/hP0gTx6ReDMxnqwchww2O6kekI=';

/** AES 解密用的派生密钥原料（与 gen-license.mjs 保持一致；非真实密钥，仅用于解开上面的包裹层）。 */
export const AES_WRAP_KEY_SEED = 'bamboo-aes-wrap-key';

/**
 * 已作废的「用户码 TAG」黑名单（方案 B：一用户一码 + 本地校验）。
 *
 * 当某个用户码被退款 / 泄露 / 滥用时，把它的 4 位 TAG 加进此数组并重新发版，
 * 下次插件更新后该用户码即在本地被判为失效（无需服务器）。
 *
 * 维护方式：发现需作废的码 → 取码中 TAG 段 → 加入下表 → bump 版本发版。
 */
export const REVOKED_TAGS: string[] = [
  // 例：'A1B2',
];
