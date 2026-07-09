/**
 * 测试用 obsidian 内存 mock。
 * 提供 VaultStorage 实际用到的 API：normalizePath、TFile，以及内存版 vault.adapter。
 * 通过 vitest alias 注入，避免依赖真实 Obsidian 运行时。
 */
export class TFile {
  path: string;
  constructor(path?: string) {
    this.path = path ?? '';
  }
}

export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
}

/** 内存文件系统，按路径存字符串内容 */
export class MemoryAdapter {
  private store = new Map<string, string>();

  async exists(p: string): Promise<boolean> {
    const n = normalizePath(p);
    return this.store.has(n) || [...this.store.keys()].some((k) => k.startsWith(n + '/'));
  }

  async mkdir(p: string): Promise<void> {
    this.store.set(normalizePath(p), '__dir__');
  }

  async rmdir(p: string, recursive = false): Promise<void> {
    const n = normalizePath(p);
    if (recursive) {
      for (const k of [...this.store.keys()]) {
        if (k === n || k.startsWith(n + '/')) this.store.delete(k);
      }
    } else {
      this.store.delete(n);
    }
  }

  async read(p: string): Promise<string> {
    const n = normalizePath(p);
    const v = this.store.get(n);
    if (v === undefined) throw new Error('File not found: ' + n);
    return v;
  }

  async write(p: string, content: string): Promise<void> {
    this.store.set(normalizePath(p), content);
  }

  async remove(p: string): Promise<void> {
    this.store.delete(normalizePath(p));
  }

  async list(p: string): Promise<{ files: string[]; folders: string[] }> {
    const n = normalizePath(p);
    const files: string[] = [];
    const folders: string[] = [];
    for (const k of this.store.keys()) {
      if (k === n) continue;
      if (k.startsWith(n + '/')) {
        const rest = k.slice(n.length + 1);
        if (rest.includes('/')) folders.push(rest.split('/')[0]);
        else files.push(k);
      }
    }
    return { files, folders: [...new Set(folders)] };
  }

  /** 测试辅助：直接读结构 */
  snapshot(): Record<string, string> {
    return Object.fromEntries(this.store.entries());
  }
}

/** 构造一个挂载了 MemoryAdapter 的伪 App */
export function createMockApp() {
  const adapter = new MemoryAdapter();
  const app = {
    vault: {
      adapter,
      getAbstractFileByPath: () => null,
      process: async (file: unknown, fn: (data: string) => string) => {
        const p = (file as any)?.path ?? (file as string);
        const current = (await adapter.exists(p)) ? await adapter.read(p) : '{}';
        const next = fn(current);
        await adapter.write(p, next);
        return next;
      },
      create: async (p: string, content: string) => {
        adapter.write(p, content);
      },
    },
  };
  return { app, adapter };
}
