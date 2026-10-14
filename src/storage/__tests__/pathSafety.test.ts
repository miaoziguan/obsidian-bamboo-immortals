import { describe, it, expect } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { VaultStorage, assertSafeDocId } from '../VaultStorage';

/**
 * 路径安全回归测试（数据安全红线）。
 *
 * 背景：所有「用外部传参拼文件路径」的宿主方法都必须先校验。已逐个加固：
 *  - 画中卷文档 id（assertSafeDocId）
 *  - 自定义模板 id（assertSafeAssetId）
 *  - 市场主题 / 模块 / 素材 id（assertSafeAssetId）
 *  - 每日数据 dateKey（assertSafeDateKey）← 本文件锁定
 * 漏一个的后果：读可读到库内任意 .json，删可直接删掉任意 .json。
 */
describe('VaultStorage 路径安全', () => {
  const day = (date: string) => ({ date, weekday: '周三', note: 'ok', metrics: {}, timeline: [] }) as any;

  describe('dateKey（每日数据）', () => {
    it('deleteDay 拒绝路径遍历，且不会删掉目录外的文件', async () => {
      const mock = createMockApp();
      const storage = new VaultStorage(mock.app as any, 'bamboo-review');
      // 放一个目录外的"受害者"文件
      await mock.adapter.write('victim.json', 'important');

      await expect(storage.deleteDay('../../victim')).rejects.toThrow(/非法 dateKey/);
      await expect(storage.deleteDay('a/b')).rejects.toThrow(/非法 dateKey/);
      await expect(storage.deleteDay('..')).rejects.toThrow(/非法 dateKey/);
      await expect(storage.deleteDay('')).rejects.toThrow(/非法 dateKey/);

      // 受害者必须完好
      expect(await mock.adapter.read('victim.json')).toBe('important');
    });

    it('getDay / putDay 同样拒绝路径遍历', async () => {
      const mock = createMockApp();
      const storage = new VaultStorage(mock.app as any, 'bamboo-review');

      await expect(storage.getDay('../secret')).rejects.toThrow(/非法 dateKey/);
      await expect(storage.putDay(day('../secret'))).rejects.toThrow(/非法 dateKey/);

      const keys = Object.keys(mock.adapter.snapshot());
      expect(keys.some((k) => k.includes('secret'))).toBe(false);
    });

    it('合法日期键照常工作', async () => {
      const mock = createMockApp();
      const storage = new VaultStorage(mock.app as any, 'bamboo-review');

      await storage.putDay(day('2026-01-05'));
      expect(await storage.getDay('2026-01-05')).not.toBeNull();

      await storage.deleteDay('2026-01-05');
      expect(await storage.getDay('2026-01-05')).toBeNull();
    });

    it('兼容历史上手建的怪文件名（getAllDays 列得出、getDay 读得到）', async () => {
      const mock = createMockApp();
      const storage = new VaultStorage(mock.app as any, 'bamboo-review');
      // 用户手工放的、非标准格式的文件名（字符集仍安全）
      await mock.adapter.mkdir('bamboo-review/data');
      await mock.adapter.write('bamboo-review/data/2026-1-5.json', JSON.stringify(day('2026-1-5')));

      const all = await storage.getAllDays();
      expect(Object.keys(all)).toContain('2026-1-5');
      expect(await storage.getDay('2026-1-5')).not.toBeNull();
    });
  });

  describe('画中卷文档 id', () => {
    it('assertSafeDocId 拦路径遍历', () => {
      expect(() => assertSafeDocId('../x')).toThrow();
      expect(() => assertSafeDocId('a/b')).toThrow();
      expect(assertSafeDocId('g-1_2')).toBe('g-1_2');
    });

    it('文档读写删均不接受越界 id', async () => {
      const mock = createMockApp();
      const storage = new VaultStorage(mock.app as any, 'bamboo-review');
      const doc = { version: 1, notes: [], links: [], canvasOffset: null } as any;

      await expect(storage.putTypewriterWritingDoc('../evil', doc)).rejects.toThrow();
      await expect(storage.deleteTypewriterWritingDoc('../evil')).rejects.toThrow();
      await expect(storage.getTypewriterWritingDoc('../evil')).rejects.toThrow();

      const keys = Object.keys(mock.adapter.snapshot());
      expect(keys.some((k) => k.includes('evil'))).toBe(false);
    });
  });
});
