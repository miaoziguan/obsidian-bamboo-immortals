import { describe, it, expect, beforeEach } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../../storage/VaultStorage';

/**
 * 画中卷·打字机文档 id 安全（路径遍历防护）。
 *
 * 背景：写作档 / 思维子弹 / 便签组的文档 id 直接参与文件路径拼接
 * （`typewriter-writing/<id>.json` 等），而 Obsidian 的 normalizePath 只做斜杠归一、
 * 不解析 `..`。未加约束前，`../../.obsidian/x`、`a/b` 这类 id 会拼出越界路径，
 * 读写删都可能落在画中卷数据目录之外。此处锁定「非法 id 一律 fail-fast」。
 */
describe('VaultStorage 画中卷文档 id 安全', () => {
  let storage: VaultStorage;

  beforeEach(() => {
    const mock = createMockApp();
    storage = new VaultStorage(mock.app as any, 'bamboo-review');
  });

  const BAD_IDS = [
    '../../.obsidian/x', // 路径遍历
    '..',                // 纯父目录
    'a/b',               // 斜杠 → 越出数据目录
    '/abs/path',         // 绝对路径
    '',                  // 空 id
    'id with space',     // 空格
    'id;rm -rf',         // 注入字符
    'x'.repeat(65),      // 超长（>64）
  ];

  it.each(BAD_IDS)('写作档：非法 id %j 在 put/get/delete 上一律抛错', async (id) => {
    await expect(storage.putTypewriterWritingDoc(id, { version: 3, notes: [], links: [], canvasOffset: null }))
      .rejects.toThrow(/非法文档 id/);
    await expect(storage.getTypewriterWritingDoc(id)).rejects.toThrow(/非法文档 id/);
    await expect(storage.deleteTypewriterWritingDoc(id)).rejects.toThrow(/非法文档 id/);
  });

  it.each(BAD_IDS)('思维子弹：非法 id %j 在 put/get/delete 上一律抛错', async (id) => {
    await expect(storage.putTypewriterMindmapDoc(id, { version: 2, nodes: [], links: [], view: null, style: 0 }))
      .rejects.toThrow(/非法文档 id/);
    await expect(storage.getTypewriterMindmapDoc(id)).rejects.toThrow(/非法文档 id/);
    await expect(storage.deleteTypewriterMindmapDoc(id)).rejects.toThrow(/非法文档 id/);
  });

  it.each(BAD_IDS)('便签组：非法 id %j 在 put/get/delete 上一律抛错', async (id) => {
    await expect(storage.putTypewriterNotesDoc(id, { version: 2, notes: [], links: [], canvasOffset: null }))
      .rejects.toThrow(/非法文档 id/);
    await expect(storage.getTypewriterNotesDoc(id)).rejects.toThrow(/非法文档 id/);
    await expect(storage.deleteTypewriterNotesDoc(id)).rejects.toThrow(/非法文档 id/);
  });

  // 反向锁定：校验不能误伤合法 id（否则正常存取会被一起拒掉）
  it.each(['default', 'doc-1a2b3c', 'note_x-9', 'A'.repeat(64)])(
    '合法 id %j 通过校验（读空档位返回 null 而非抛错）',
    async (id) => {
      await expect(storage.getTypewriterWritingDoc(id)).resolves.toBeNull();
      await expect(storage.getTypewriterMindmapDoc(id)).resolves.toBeNull();
      await expect(storage.getTypewriterNotesDoc(id)).resolves.toBeNull();
    }
  );
});
