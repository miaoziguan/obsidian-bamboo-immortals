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

/** requestUrl mock：默认抛错，测试可通过 __setRequestUrlHandler 注入行为 */
export interface RequestUrlResponse {
  status: number;
  arrayBuffer: ArrayBuffer;
  headers: Record<string, string>;
}
type RequestUrlHandler = (opts: { url: string; method?: string }) => Promise<RequestUrlResponse>;
let requestUrlHandler: RequestUrlHandler = async () => {
  throw new Error('requestUrl 未在测试中注入');
};
export function __setRequestUrlHandler(fn: RequestUrlHandler): void {
  requestUrlHandler = fn;
}
export function requestUrl(opts: { url: string; method?: string }): Promise<RequestUrlResponse> {
  return requestUrlHandler(opts);
}

/** 内存文件系统，按路径存字符串内容 */
export class MemoryAdapter {
  private store = new Map<string, string>();
  private binStore = new Map<string, ArrayBuffer>();

  async exists(p: string): Promise<boolean> {
    const n = normalizePath(p);
    return (
      this.store.has(n) ||
      this.binStore.has(n) ||
      [...this.store.keys()].some((k) => k.startsWith(n + '/'))
    );
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
    const n = normalizePath(p);
    this.store.delete(n);
    this.binStore.delete(n);
  }

  async writeBinary(p: string, data: ArrayBuffer): Promise<void> {
    this.binStore.set(normalizePath(p), data);
  }

  async readBinary(p: string): Promise<ArrayBuffer> {
    const n = normalizePath(p);
    const v = this.binStore.get(n);
    if (v === undefined) throw new Error('File not found: ' + n);
    return v;
  }

  async stat(p: string): Promise<{ type: 'file' | 'folder'; size: number } | null> {
    const n = normalizePath(p);
    if (this.binStore.has(n)) return { type: 'file', size: this.binStore.get(n)!.byteLength };
    const v = this.store.get(n);
    if (v === undefined) return null;
    if (v === '__dir__') return { type: 'folder', size: 0 };
    return { type: 'file', size: v.length };
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

/** 最小 Modal 桩：仅保存 app，contentEl 提供无副作用的 DOM 方法 */
export class Modal {
  app: any;
  contentEl: any = {
    empty() {},
    addClass() {},
    createEl() {
      return {};
    },
    createDiv() {
      return {};
    },
  };
  scope: any;
  constructor(app: any) {
    this.app = app;
  }
  onOpen(): void {}
  onClose(): void {}
  close(): void {}
}

/** 最小 Notice 桩 */
export class Notice {
  constructor(_message?: string) {}
}

/** App 类型桩（值导入场景下仅占位） */
export class App {}

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
