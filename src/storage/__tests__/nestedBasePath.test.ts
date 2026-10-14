import { describe, it, expect } from 'vitest';
import { normalizePath } from 'obsidian';
import { createMockApp } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../VaultStorage';

/**
 * 嵌套 dataPath 的目录创建回归测试（数据安全）。
 *
 * 背景：normalizeDirInput 明确放行嵌套路径（如「画中卷/数据」），设置页也宣称
 * 支持任意 Vault 相对路径；但宿主 ensureStructure / ensureDir / vaultWrite 用的都是
 * **单层 adapter.mkdir** —— 祖先目录不存在时直接抛错，导致整个数据根建不起来。
 * 现已统一改为逐级创建（mkdirP），与 AppAPI 侧一致。
 */

/** 把 mock 的 mkdir 收紧为「单层语义」：父目录不存在就抛错（贴近真实 Obsidian 行为） */
function enforceSingleLevelMkdir(mock: ReturnType<typeof createMockApp>): void {
  const real = mock.adapter.mkdir.bind(mock.adapter);
  mock.adapter.mkdir = async (p: string) => {
    const parent = normalizePath(p).split('/').slice(0, -1).join('/');
    if (parent && !(await mock.adapter.exists(parent))) {
      throw new Error('mkdir: 父目录不存在 ' + parent);
    }
    return real(p);
  };
}

describe('嵌套 dataPath 的目录创建', () => {
  const day = (date: string) => ({ date, weekday: '周三', note: 'ok', metrics: {}, timeline: [] }) as any;
  const doc = () => ({ version: 1, notes: [], links: [], canvasOffset: null }) as any;

  it('ensureStructure 能为嵌套 dataPath 补齐祖先目录', async () => {
    const mock = createMockApp();
    enforceSingleLevelMkdir(mock);
    const storage = new VaultStorage(mock.app as any, '画中卷/数据');

    // 旧实现在此抛错：'画中卷' 不存在，单层 mkdir('画中卷/数据') 失败
    await expect(storage.ensureStructure()).resolves.toBeUndefined();
    expect(await mock.adapter.exists('画中卷')).toBe(true);
    expect(await mock.adapter.exists('画中卷/数据')).toBe(true);
  });

  it('日数据 / 画中卷文档写入均能建出深层父目录', async () => {
    const mock = createMockApp();
    enforceSingleLevelMkdir(mock);
    const storage = new VaultStorage(mock.app as any, '画中卷/数据');

    await storage.putDay(day('2026-01-01'));
    expect(await storage.getDay('2026-01-01')).not.toBeNull();

    await storage.putTypewriterWritingDoc('g1', doc());
    expect(await storage.getTypewriterWritingDoc('g1')).not.toBeNull();

    await storage.putTypewriterMindmapDoc('m1', { version: 1, nodes: [], links: [], view: null, style: 0 } as any);
    expect(await storage.getTypewriterMindmapDoc('m1')).not.toBeNull();
  });

  it('备份导出 / overwrite 导入在嵌套 dataPath 下同样可用', async () => {
    const mock = createMockApp();
    enforceSingleLevelMkdir(mock);
    const storage = new VaultStorage(mock.app as any, '画中卷/数据');
    await storage.putDay(day('2026-01-01'));

    const backup = await storage.exportAllData();
    expect(Object.keys(backup.days)).toEqual(['2026-01-01']);

    await storage.importData({ ...backup, days: { '2026-01-02': day('2026-01-02') }, goals: [], settings: {} });
    expect(await storage.getDay('2026-01-02')).not.toBeNull();
    expect(await storage.getDay('2026-01-01')).toBeNull(); // overwrite 生效
  });

  it('单层 dataPath 行为不变（回归保护）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await storage.putDay(day('2026-01-01'));
    expect(await storage.getDay('2026-01-01')).not.toBeNull();
    expect((await storage.exportAllData()).days['2026-01-01']).toBeDefined();
  });
});
