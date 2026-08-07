/**
 * backupCode.ts - 备份码编解码（纯本地、不含任何密钥）
 *
 * 备份码 = 已保存激活码的便携封装，用于换设备 / 换仓库时免输长串激活码。
 * 本质：Base64(激活码) 加 BRIBACK- 前缀，不含 LICENSE_SECRET 或任何派生密钥，
 * 安全性等同于「直接把激活码明文发给用户自己」——这是有意为之（用户本就持有激活码）。
 *
 * 为什么不直接用激活码：避免用户把备份码误当正式激活码分发给他人造成混淆；
 * 前缀可让导入逻辑快速判别格式并给出友好提示。
 */

const BACKUP_PREFIX = 'BRIBACK-';

/** 由激活码生成备份码（UTF-8 安全 Base64） */
export function encodeBackup(licenseKey: string): string {
  const bytes = new TextEncoder().encode(licenseKey);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  return BACKUP_PREFIX + b64;
}

/** 由备份码还原激活码；非法格式抛错 */
export function decodeBackup(backup: string): string {
  const raw = (backup || '').trim();
  if (!raw.startsWith(BACKUP_PREFIX)) {
    throw new Error('备份码格式不正确（应以 BRIBACK- 开头）');
  }
  try {
    const binary = atob(raw.slice(BACKUP_PREFIX.length));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error('备份码损坏，无法解析');
  }
}

export function isBackupCode(s: string): boolean {
  return (s || '').trim().startsWith(BACKUP_PREFIX);
}
