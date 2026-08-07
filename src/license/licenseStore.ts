/**
 * licenseStore.ts - 激活状态持久化（落插件 data.json）
 *
 * 存储形态：plugin.saveData 会把整个 settings 对象写入 data.json。
 * 为避免与 BambooReviewSettings 强耦合，这里把 license 字段挂在 settings 上（licenseKey / licenseActive）。
 * 读取走 plugin.settings，写入走 plugin.saveSettings()。
 */

import type BambooReviewPlugin from '../../main';
import { verifyLicenseKey, getLicenseTag } from './licenseKey';

const LICENSE_FIELD = 'licenseKey' as const;
const ACTIVE_FIELD = 'licenseActive' as const;
const TAG_FIELD = 'licenseTag' as const;

export class LicenseStore {
  constructor(private plugin: BambooReviewPlugin) {}

  /** 当前是否已激活（已存 key 且上次校验通过会缓存为 true） */
  isActive(): boolean {
    const s = this.plugin.settings as unknown as Record<string, unknown>;
    return Boolean(s[ACTIVE_FIELD]);
  }

  /** 读取已保存的激活码原文（脱敏显示用） */
  getSavedKey(): string {
    const s = this.plugin.settings as unknown as Record<string, unknown>;
    return (s[LICENSE_FIELD] as string) ?? '';
  }

  /** 读取已激活码的归属 TAG（用户码才有；格式 BRI-<TAG4>-<SIG20>） */
  getSavedTag(): string {
    const s = this.plugin.settings as unknown as Record<string, unknown>;
    return (s[TAG_FIELD] as string) ?? '';
  }

  /** 校验并激活。成功返回 true 并存盘；失败返回 false 且不写激活态。 */
  async activate(rawKey: string): Promise<{ ok: boolean; reason?: string }> {
    const key = (rawKey ?? '').trim();
    if (!key) return { ok: false, reason: '请输入激活码' };

    const valid = await verifyLicenseKey(key);
    if (!valid) return { ok: false, reason: '激活码无效，请检查后重试' };

    const s = this.plugin.settings as unknown as Record<string, unknown>;
    s[LICENSE_FIELD] = key;
    s[ACTIVE_FIELD] = true;
    s[TAG_FIELD] = getLicenseTag(key) ?? '';
    await this.plugin.saveSettings();
    return { ok: true };
  }

  /** 清除激活态（调试 / 退款用） */
  async deactivate(): Promise<void> {
    const s = this.plugin.settings as unknown as Record<string, unknown>;
    s[LICENSE_FIELD] = '';
    s[ACTIVE_FIELD] = false;
    s[TAG_FIELD] = '';
    await this.plugin.saveSettings();
  }
}
