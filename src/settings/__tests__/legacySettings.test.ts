import { describe, it, expect } from 'vitest';
import { normalizeLegacySettings, EXPORT_FOLDER_DEFAULTS } from '../legacySettings';

/**
 * 遗留设置归一的回归测试（数据/资源/导出三链路的「旧值不丢」保障）。
 *
 * 背景：这些设置原由 webapp 直接写进 {dataPath}/settings.json（散装键）。若不归一，
 * 升级后会被原生默认值永久覆盖，表现为「我以前设的目录 / 时长丢了」。
 * 归一现在上移到插件 onload（不再依赖「打开某个设置页」）。
 */

/** 与服务端 DEFAULT_SETTINGS 对齐的最小测试用设置对象（避免测试去 import 重量级模块） */
function baseSettings(): any {
  return {
    dataPath: 'bamboo-review',
    writeStoreFolder: 'typewriter-writing',
    notesStoreFolder: 'typewriter-notes',
    mindmapStoreFolder: 'typewriter-mindmap',
    mmExportFolder: '思维子弹',
    noteExportFolder: '便签',
    writeExportFolder: 'MD可视化写作',
    enableSwipe: true,
    autoSaveInterval: 2000,
    incenseDuration: 60,
    incenseGooseInterval: 10,
  };
}

/** 只提供 adapter.read 的伪 App；json 为 null 表示文件不存在（抛错） */
function makeApp(json: string | null): any {
  return {
    vault: {
      adapter: {
        read: async () => {
          if (json === null) throw new Error('File not found');
          return json;
        },
      },
    },
  };
}

describe('normalizeLegacySettings：旧散装键 → 原生设置', () => {
  it('把 legacy 值全部归一到原生设置并返回 true', async () => {
    const s = baseSettings();
    const legacy = JSON.stringify({
      writeStoreFolder: 'old-writing',
      mmExportFolder: '画中卷/子弹笔记',
      noteExportFolder: '旧便签目录',
      writeExportFolder: '旧写作目录',
      enableSwipe: 'false',
      autoSaveInterval: 5000,
      incenseDuration: 45,
      incenseGooseInterval: 15,
    });
    const changed = await normalizeLegacySettings(makeApp(legacy), s);
    expect(changed).toBe(true);
    expect(s.writeStoreFolder).toBe('old-writing');
    expect(s.mmExportFolder).toBe('画中卷/子弹笔记');
    expect(s.noteExportFolder).toBe('旧便签目录');
    expect(s.writeExportFolder).toBe('旧写作目录');
    expect(s.enableSwipe).toBe(false);
    expect(s.autoSaveInterval).toBe(5000);
    expect(s.incenseDuration).toBe(45);
    expect(s.incenseGooseInterval).toBe(15);
  });

  it('没有 settings.json → 不改动、返回 false（新装用户）', async () => {
    const s = baseSettings();
    const changed = await normalizeLegacySettings(makeApp(null), s);
    expect(changed).toBe(false);
    expect(s.writeStoreFolder).toBe('typewriter-writing');
    expect(s.autoSaveInterval).toBe(2000);
  });

  it('已在原生设置里配好的值不会被 legacy 覆盖', async () => {
    const s = baseSettings();
    s.mmExportFolder = '我的目录';
    s.incenseDuration = 90;
    const legacy = JSON.stringify({ mmExportFolder: 'legacy目录', incenseDuration: 30 });
    const changed = await normalizeLegacySettings(makeApp(legacy), s);
    expect(changed).toBe(false);
    expect(s.mmExportFolder).toBe('我的目录');
    expect(s.incenseDuration).toBe(90);
  });

  it('含 .. 的 legacy 值被拒绝（防路径遍历）', async () => {
    const s = baseSettings();
    const legacy = JSON.stringify({ writeStoreFolder: '../../etc', mmExportFolder: '../x' });
    await normalizeLegacySettings(makeApp(legacy), s);
    expect(s.writeStoreFolder).toBe('typewriter-writing');
    expect(s.mmExportFolder).toBe(EXPORT_FOLDER_DEFAULTS.mmExportFolder);
  });

  it('化雁间隔被钳制为不超过一炷香总时长', async () => {
    const s = baseSettings();
    const legacy = JSON.stringify({ incenseDuration: 30, incenseGooseInterval: 99 });
    await normalizeLegacySettings(makeApp(legacy), s);
    expect(s.incenseDuration).toBe(30);
    expect(s.incenseGooseInterval).toBe(30);
  });

  it('损坏的 settings.json（非 JSON）→ 静默跳过', async () => {
    const s = baseSettings();
    const changed = await normalizeLegacySettings(makeApp('{ not json'), s);
    expect(changed).toBe(false);
    expect(s.writeStoreFolder).toBe('typewriter-writing');
  });
});
