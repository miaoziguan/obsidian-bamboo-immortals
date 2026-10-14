import { describe, it, expect } from 'vitest';
import { normalizePath } from 'obsidian';
import { migrateDataDir, normalizeDirInput } from '../folderMigration';

/**
 * 迁移链路回归测试（数据安全关键）。
 *
 * 锁定「换数据目录时，子目录里的档也必须被复制」——曾经的 bug：
 * Obsidian 的 adapter.list() 是非递归的，旧实现只遍历 list.files，
 * 导致 typewriter-writing / typewriter-notes / typewriter-mindmap 等子目录整目录漏拷，
 * 用户换数据根目录、重启后会发现这些档"凭空消失"（其实还留在旧目录）。
 */

/** 忠实复刻 Obsidian DataAdapter 语义：list() 非递归，files/folders 均为「完整 vault 相对路径」 */
class FakeAdapter {
  private files = new Map<string, string>();
  private dirs = new Set<string>();

  async exists(p: string): Promise<boolean> {
    const n = normalizePath(p);
    if (this.files.has(n) || this.dirs.has(n)) return true;
    const prefix = n + '/';
    for (const k of this.dirs) if (k.startsWith(prefix)) return true;
    for (const k of this.files.keys()) if (k.startsWith(prefix)) return true;
    return false;
  }

  async mkdir(p: string): Promise<void> {
    const n = normalizePath(p);
    const parts = n.split('/');
    for (let i = 1; i <= parts.length; i++) this.dirs.add(parts.slice(0, i).join('/'));
  }

  async list(p: string): Promise<{ files: string[]; folders: string[] }> {
    const n = normalizePath(p);
    const files: string[] = [];
    const folders: string[] = [];
    for (const k of this.files.keys()) {
      if (k.startsWith(n + '/') && !k.slice(n.length + 1).includes('/')) files.push(k);
    }
    for (const d of this.dirs) {
      if (d.startsWith(n + '/') && !d.slice(n.length + 1).includes('/')) folders.push(d);
    }
    return { files, folders };
  }

  async read(p: string): Promise<string> {
    const n = normalizePath(p);
    const v = this.files.get(n);
    if (v === undefined) throw new Error('File not found: ' + n);
    return v;
  }

  async write(p: string, content: string): Promise<void> {
    this.files.set(normalizePath(p), content);
  }

  /** 测试辅助：写入文件并补齐父目录 */
  async put(p: string, content: string): Promise<void> {
    const n = normalizePath(p);
    await this.mkdir(n.split('/').slice(0, -1).join('/'));
    await this.write(n, content);
  }
}

function makeApp(): { app: any; adapter: FakeAdapter } {
  const adapter = new FakeAdapter();
  return { app: { vault: { adapter } }, adapter };
}

describe('migrateDataDir：递归复制（数据安全）', () => {
  it('顶层文件 + 多层子目录下的档全部复制，且旧目录一份不少', async () => {
    const { app, adapter } = makeApp();
    await adapter.put('bamboo-review/settings.json', '{"a":1}');
    await adapter.put('bamboo-review/goals.json', '[]');
    await adapter.put('bamboo-review/typewriter-writing/g1.json', '{"v":1}');
    await adapter.put('bamboo-review/typewriter-notes/g2.json', '{"v":2}');
    await adapter.put('bamboo-review/typewriter-mindmap/sub/deep.json', '{"v":3}');

    await migrateDataDir(app, 'bamboo-review', 'newdata');

    // 顶层文件
    expect(await adapter.exists('newdata/settings.json')).toBe(true);
    expect(await adapter.exists('newdata/goals.json')).toBe(true);
    // 子目录里的档（回归重点：旧实现会漏掉这些）
    expect(await adapter.exists('newdata/typewriter-writing/g1.json')).toBe(true);
    expect(await adapter.exists('newdata/typewriter-notes/g2.json')).toBe(true);
    expect(await adapter.exists('newdata/typewriter-mindmap/sub/deep.json')).toBe(true);
    // 内容一致
    expect(await adapter.read('newdata/typewriter-writing/g1.json')).toBe('{"v":1}');
    // 复制式：绝不删除旧目录
    expect(await adapter.exists('bamboo-review/typewriter-writing/g1.json')).toBe(true);
  });

  it('目标目录已存在 → 不复制（避免覆盖既有数据）', async () => {
    const { app, adapter } = makeApp();
    await adapter.put('src/a.json', '{"v":1}');
    await adapter.put('dst/keep.json', '{"keep":1}');

    await migrateDataDir(app, 'src', 'dst');

    expect(await adapter.read('dst/keep.json')).toBe('{"keep":1}');
    expect(await adapter.exists('dst/a.json')).toBe(false);
  });

  it('源目录不存在 → 静默返回，不抛错', async () => {
    const { app } = makeApp();
    await expect(migrateDataDir(app, 'nope', 'whatever')).resolves.toBeUndefined();
  });
});

describe('normalizeDirInput：路径安全', () => {
  it('去空白 / 反斜杠 / 首尾斜杠', () => {
    expect(normalizeDirInput('  \\画中卷\\写作\\  ', 'def')).toBe('画中卷/写作');
  });
  it('空值回退默认', () => {
    expect(normalizeDirInput('   ', 'typewriter-writing')).toBe('typewriter-writing');
  });
  it('含 .. 视为非法 → 回退默认（防路径遍历）', () => {
    expect(normalizeDirInput('../../etc', 'typewriter-writing')).toBe('typewriter-writing');
    expect(normalizeDirInput('a/../b', 'x')).toBe('x');
  });
  it('合法嵌套子路径保留', () => {
    expect(normalizeDirInput('画中卷/子弹笔记', 'x')).toBe('画中卷/子弹笔记');
  });
  // 红线：'.' 指向 Vault 根。若被接受，误填后「清空所有数据」会 rmdir('.') 删掉整个库。
  it('纯点号 / ./ 开头一律回退（防止指向 Vault 根）', () => {
    expect(normalizeDirInput('.', 'bamboo-review')).toBe('bamboo-review');
    expect(normalizeDirInput('./', 'bamboo-review')).toBe('bamboo-review');
    expect(normalizeDirInput('./data', 'bamboo-review')).toBe('bamboo-review');
    expect(normalizeDirInput('..', 'bamboo-review')).toBe('bamboo-review');
    expect(normalizeDirInput('.obsidian', 'x')).toBe('.obsidian'); // 合法目录名（非纯点号）照常放行
  });
});
