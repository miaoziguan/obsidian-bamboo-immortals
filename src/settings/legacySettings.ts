import { App, normalizePath } from 'obsidian';
import type { BambooReviewSettings } from './PluginSettings';
import { EXPORT_FOLDER_DEFAULTS } from './settingsDefaults';

// 向后兼容再导出：既有测试/调用方仍可从 legacySettings 取该常量。
// 定义已移到中立模块 settingsDefaults（打破 PluginSettings ⇄ legacySettings 的依赖环）。
export { EXPORT_FOLDER_DEFAULTS };

/** 安全子路径：去空白 / 反斜杠 / 首尾斜杠；空值或含 `..`（路径遍历）→ '' */
function safeSub(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const v = raw.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
  return !v || v.includes('..') ? '' : v;
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return null;
}

/**
 * 把上一版「散装键」（曾由 webapp 直接写入 {dataPath}/settings.json 的设置）一次性归一到原生设置。
 *
 * 关键：在插件 onload（loadSettings 之后）调用一次即可 —— **不再依赖「用户打开某个设置页」才迁移**。
 * 否则没被打开过的页面，其旧值会被原生默认值永久覆盖，表现为「我以前设的目录 / 时长丢了」。
 * （这原本是已移除的 webapp SettingsModal.init() 承担的"开机回填"职责。）
 *
 * @returns 是否有改动（true 时调用方应 saveSettings 落库）
 */
export async function normalizeLegacySettings(app: App, settings: BambooReviewSettings): Promise<boolean> {
  let legacy: Record<string, unknown>;
  try {
    const raw = await app.vault.adapter.read(
      normalizePath(`${settings.dataPath || 'bamboo-review'}/settings.json`)
    );
    const parsed: unknown = JSON.parse(raw);
    legacy = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
  } catch {
    return false; // 没有 settings.json（新装用户）→ 无需迁移
  }

  let dirty = false;

  // 1) 写作档存储目录（相对 dataPath 的子目录）
  if (!settings.writeStoreFolder || settings.writeStoreFolder === 'typewriter-writing') {
    const v = safeSub(legacy.writeStoreFolder);
    if (v && v !== 'typewriter-writing') { settings.writeStoreFolder = v; dirty = true; }
  }

  // 2) 三个导出目录（Vault 相对路径）
  (Object.keys(EXPORT_FOLDER_DEFAULTS) as Array<keyof typeof EXPORT_FOLDER_DEFAULTS>).forEach((k) => {
    const cur = settings[k];
    if (cur && cur !== EXPORT_FOLDER_DEFAULTS[k]) return; // 已配置，跳过
    const v = safeSub(legacy[k]);
    if (v && v !== EXPORT_FOLDER_DEFAULTS[k]) { settings[k] = v; dirty = true; }
  });

  // 3) 行为设置：滑动切换日期 / 自动保存间隔 / 静坐一炉香
  if (settings.autoSaveInterval === 2000) {
    const n = num(legacy.autoSaveInterval);
    if (n) { settings.autoSaveInterval = Math.round(n); dirty = true; }
  }
  if (settings.incenseDuration === 60) {
    const n = num(legacy.incenseDuration);
    if (n) { settings.incenseDuration = Math.min(240, Math.max(1, Math.round(n))); dirty = true; }
  }
  if (settings.incenseGooseInterval === 10) {
    const n = num(legacy.incenseGooseInterval);
    if (n) {
      settings.incenseGooseInterval = Math.min(120, Math.min(settings.incenseDuration, Math.max(1, Math.round(n))));
      dirty = true;
    }
  }
  if (settings.enableSwipe === true && legacy.enableSwipe === 'false') {
    settings.enableSwipe = false;
    dirty = true;
  }

  return dirty;
}
