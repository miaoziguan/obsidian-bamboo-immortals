import { App, Notice, TextComponent, normalizePath } from 'obsidian';

/**
 * 目录输入规范化：去空白、反斜杠转正斜杠、去首尾斜杠；空值或含 `..`（路径遍历）→ 返回 fallback。
 * 所有「目录类」输入框统一走这里，保证写入设置的值永远是安全的 Vault 相对子路径。
 */
export function normalizeDirInput(raw: string, fallback: string): string {
  const v = (raw || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
  if (!v || v.includes('..')) return fallback;
  // 纯点号 / './' 开头一律回退：'.' 指向 Vault 根，「清空所有数据」会 rmdir('.') 删掉整个库
  if (v === '.' || v.startsWith('./') || /^\.+$/.test(v)) return fallback;
  return v;
}

/**
 * 数据目录迁移（安全「复制」）。把旧数据目录 from 下的**全部内容（含子目录）**复制到新目录 to。
 *
 * 设计原则——零丢失优先：
 *  - 仅做「复制」、绝不删除旧目录，任何异常都不破坏现有数据；
 *  - 若目标目录已存在，跳过自动复制并提示手动合并，避免覆盖既有数据；
 *  - 复制完成后提示用户重启插件（运行中各 View 的 AppAPI.storage 在构造时已固定旧路径，
 *    须重建视图才会切换到新目录）。
 *
 * 注意：Obsidian 的 adapter.list() 是**非递归**的（只返回直接子级，见 obsidian.d.ts），
 * 因此这里必须自行递归下钻，否则会漏掉 typewriter-writing / typewriter-notes /
 * typewriter-mindmap 等子目录里的档（换数据根目录后这些档会"凭空消失"）。
 */
export async function migrateDataDir(app: App, from: string, to: string): Promise<void> {
  const adapter = app.vault.adapter;
  const src = normalizePath(from);
  const dst = normalizePath(to);
  if (src === dst) return;
  if (!(await adapter.exists(src))) {
    new Notice(`源目录「${src}」不存在，无需迁移（可能是首次设置）。`);
    return;
  }
  if (await adapter.exists(dst)) {
    new Notice(`目标目录「${dst}」已存在，未自动复制以免覆盖。请手动合并后删除旧目录「${src}」。`);
    return;
  }

  let copied = 0;
  let failed = 0;
  const walk = async (curSrc: string, curDst: string): Promise<void> => {
    const listed = await adapter.list(curSrc);
    await adapter.mkdir(curDst);
    // 先递归子目录（保留目录结构），再复制本层文件。
    // adapter.list() 的 folders 多数实现返回「完整 vault 相对路径」，但个别实现/测试桩只给目录名 ——
    // 两种都兼容，避免因路径形态差异漏拷子目录（数据安全优先）。
    for (const sub of listed.folders) {
      const subSrc = sub.includes('/') ? sub : `${curSrc}/${sub}`;
      const name = subSrc.split('/').pop();
      if (!name) continue;
      await walk(subSrc, `${curDst}/${name}`);
    }
    for (const file of listed.files) {
      const name = file.split('/').pop();
      if (!name) continue;
      try {
        const content = await adapter.read(file);
        await adapter.write(`${curDst}/${name}`, content);
        copied++;
      } catch {
        failed++; // 单文件失败跳过，不中断其余文件
      }
    }
  };

  try {
    await walk(src, dst);
  } catch (e) {
    new Notice(`迁移出错：${(e as Error)?.message || String(e)}。旧目录「${src}」未受影响，可重试。`);
    return;
  }

  if (failed > 0) {
    new Notice(`已复制 ${copied} 个文件到「${dst}」，${failed} 个失败（旧目录「${src}」完整保留）。请重启插件并核对后再手动删除旧目录。`);
  } else {
    new Notice(`已将「${src}」的数据（含子目录）复制到「${dst}」。请重启插件以完全生效；旧目录可手动删除。`);
  }
}

/**
 * 目录类输入框的「提交式迁移」绑定：
 *  - 逐键只更新内存值（去抖落盘），【不】触发迁移；
 *  - 仅在失焦 / 回车提交时，若相对上次提交值发生变化，才执行迁移。
 * 避免逐键迁移创建一串中间目录、并反复整目录复制。
 */
export function bindFolderMigration(
  text: TextComponent,
  get: () => string,
  commit: (oldValue: string, newValue: string) => void | Promise<void>
): void {
  let last = get();
  const runCommit = (): void => {
    const now = get();
    if (now === last) return;
    const prev = last;
    last = now;
    Promise.resolve(commit(prev, now)).catch(() => { /* 迁移内部已自行提示，这里兜底吞掉 */ });
  };
  text.inputEl.addEventListener('blur', runCommit);
  text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      text.inputEl.blur(); // 触发 blur → runCommit
    }
  });
}
