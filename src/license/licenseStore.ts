/**
 * licenseStore.ts - 激活状态持久化（落插件 data.json）
 *
 * 存储形态：plugin.saveData 会把整个 settings 对象写入 data.json。
 * 为避免与 BambooReviewSettings 强耦合，这里把 license 字段挂在 settings 上（licenseKey / licenseActive）。
 * 读取走 plugin.settings，写入走 plugin.saveSettings()。
 */

import type BambooReviewPlugin from '../../main';
import {
  verifyLicenseKey,
  getLicenseTag,
  isLicenseKeyShape,
  isVerifyBlockedByDebugger,
} from './licenseKey';
import { REVOKED_TAGS } from './secretShards';

// 注：不加 `as const` —— const 声明的字面量本身即窄化类型，断言冗余
// （Obsidian Source review 的 no-unnecessary-type-assertion 会判 Warning）。
const LICENSE_FIELD = 'licenseKey';
const ACTIVE_FIELD = 'licenseActive';
const TAG_FIELD = 'licenseTag';

export class LicenseStore {
  constructor(private plugin: BambooReviewPlugin) {}

  /**
   * 当前是否已激活（已存 key 且上次校验通过会缓存为 true）。
   * 若已激活但归属 TAG 命中吊销黑名单（REVOKED_TAGS），视为失效：
   * 后台清除激活态并返回 false，使该用户码在发版后立即失效（无需服务器）。
   */
  isActive(): boolean {
    const s = this.plugin.settings as unknown as Record<string, unknown>;
    if (!s[ACTIVE_FIELD]) return false;
    // 布尔与 key 绑定：data.json 是明文，只翻转 licenseActive 而不提供形状合法的
    // key 时必须判为未激活，否则「改一个字段即解锁」。同步路径只做结构检查，
    // 验签由 revalidate() 异步承担（它依赖 Web Crypto 且带防调试分支）。
    if (!isLicenseKeyShape((s[LICENSE_FIELD] as string) ?? '')) return false;
    const tag = (s[TAG_FIELD] as string) ?? '';
    if (tag && REVOKED_TAGS.includes(tag)) {
      // 吊销：异步清理激活态（不阻塞当前同步返回值）
      void this.deactivate();
      return false;
    }
    return true;
  }

  /**
   * 异步复验：用已存 key 重新验签，失败则清除激活态并落盘。
   *
   * 由 onload 以 `void` 调用：不阻塞启动，也不打断当次会话已加载的界面，
   * 效果落在下一次启动或重开视图（遮罩重新出现）。
   *
   * 三道保护，避免误伤正版用户：
   * 1) 未激活直接返回，不产生任何写盘
   * 2) 调试态跳过——verifyLicenseKey 在 devtools 打开时恒判假
   * 3) 形状非法与签名不符都清理，这是本方法相对 isActive() 的增量收益
   */
  async revalidate(): Promise<boolean> {
    const s = this.plugin.settings as unknown as Record<string, unknown>;
    if (!s[ACTIVE_FIELD]) return false;
    if (isVerifyBlockedByDebugger()) return true;

    const key = this.getSavedKey();
    if (!isLicenseKeyShape(key)) {
      await this.deactivate();
      return false;
    }
    if (!(await verifyLicenseKey(key))) {
      await this.deactivate();
      return false;
    }
    // TAG 以 key 为准回写，避免该字段被单独篡改以规避 REVOKED_TAGS
    const tag = getLicenseTag(key) ?? '';
    if (((s[TAG_FIELD] as string) ?? '') !== tag) {
      s[TAG_FIELD] = tag;
      await this.plugin.saveSettings();
    }
    return true;
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
