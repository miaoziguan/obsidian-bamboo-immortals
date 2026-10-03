import { ItemView, WorkspaceLeaf, MarkdownRenderer, Component, TFile, setIcon } from 'obsidian';
import type BambooReviewPlugin from '../../main';

export const VIEW_TYPE_BAMBOO_READER = 'bamboo-reader';

/** 文章列表所在的模块 id（模块市场的 blog 模块，默认停靠在左侧栏）。 */
const BLOG_MODULE_ID = 'blog';

/**
 * BambooReaderView —— 竹杖芒鞋式博客阅读视图（中央 ItemView）
 *
 * 由博客模块（blog.js）经 module:openReader 触发，宿主在此自建 Obsidian 视图。
 * 渲染走 Obsidian 原生 MarkdownRenderer 管线 + markdown-preview-view 类（callout/math/
 * mermaid/wikilink/任务列表/标签等原生能力自动继承），并在此之上注入竹青主题与
 * 全套阅读增强（对标竹杖芒鞋 ReaderView 的核心阅读体验，不含 TTS/分享/评论等跨插件特性）：
 *   · 排版接管 + 竹青覆盖（标题字距/两端对齐/竹林风引用/竹青链接/圆角图片/竹节分割线/表格/代码/暗色）
 *   · 中英混排窄空格预处理（保护代码块/行内代码）
 *   · 代码块增强（语言标签 + 复制 + 行号）
 *   · 图片懒加载 + 骨架 + 点击放大（lightbox）
 *   · 独立 TOC 侧栏（滚动进度条 + 百分比 + scroll spy 高亮）
 *   · 元信息：作者/日期/分类/字数/阅读时长/标签 + 最后更新提示
 *   · 内部链接拦截（跨文章在插件内打开）
 *   · 字号缩放 / 专注模式(Esc 退出+持久化) / 阅读进度恢复（按文章路径）
 *   · 上/下篇（按 date）+ 相关阅读（按 tag 重叠）
 *   · 返回按钮 + 浮动 FAB(↑↓)
 */
const BAMBOO_READER_CSS = [
  '.bamboo-reader-view{position:relative;height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;}',
  '.bamboo-reader-view .bm-layout{flex:1 1 auto;min-height:0;height:100%;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto 1fr;grid-template-areas:"topbar toc" "content toc";box-sizing:border-box;overflow-y:auto;overflow-x:hidden;background:var(--background-primary);overscroll-behavior:contain;}',
  // TOC 侧栏
  '.bamboo-reader-view .bm-toc{grid-area:toc;width:220px;overflow-y:auto;padding:16px 10px 16px 14px;border-left:1px solid var(--background-modifier-border,#ececec);box-sizing:border-box;scrollbar-width:none;-ms-overflow-style:none;position:sticky;top:0;align-self:start;max-height:100%;}',
  '.bamboo-reader-view .bm-toc::-webkit-scrollbar{width:0;height:0;display:none;}',
  '.bamboo-reader-view .bm-toc-progress{height:3px;background:var(--background-modifier-border,#e5e3da);border-radius:2px;overflow:hidden;margin-bottom:10px;}',
  '.bamboo-reader-view .bm-toc-bar{height:100%;width:0;background:#4a7c59;transition:width .12s linear;}',
  '.bamboo-reader-view .bm-toc-head{display:flex;justify-content:space-between;align-items:baseline;font-size:11px;color:var(--text-muted,#888);margin-bottom:6px;}',
  '.bamboo-reader-view .bm-toc-pct{font-variant-numeric:tabular-nums;}',
  '.bamboo-reader-view .bm-toc-list{display:flex;flex-direction:column;gap:2px;}',
  '.bamboo-reader-view .bm-toc-item{font-size:12px;color:var(--text-muted,#777);cursor:pointer;padding:2px 0 2px 8px;border-left:2px solid transparent;line-height:1.45;}',
  '.bamboo-reader-view .bm-toc-item:hover{color:#3d6b4a;}',
  '.bamboo-reader-view .bm-toc-item.is-active{border-left-color:#4a7c59;color:#3d6b4a;font-weight:600;}',
  '.bamboo-reader-view .bm-toc-h2{padding-left:16px;}.bamboo-reader-view .bm-toc-h3{padding-left:26px;}.bamboo-reader-view .bm-toc-h4{padding-left:36px;}',
  // 内容列（滚动容器）
  '.bamboo-reader-view .bm-content{grid-area:content;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:visible;position:relative;scrollbar-width:none;-ms-overflow-style:none;overscroll-behavior:contain;}',
  '.bamboo-reader-view .bm-content::-webkit-scrollbar{width:0;height:0;display:none;}',
  // 顶栏（sticky）
  '.bamboo-reader-view .bm-topbar{grid-area:topbar;position:sticky;top:0;z-index:5;display:flex;flex-direction:column;gap:6px;padding:8px 12px 9px;background:var(--background-primary);border-bottom:1px solid var(--background-modifier-border,#ececec);}',
  '.bamboo-reader-view .bm-toolbar{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;max-width:44rem;margin:0 auto;width:100%;}',
  '.bamboo-reader-view .bm-rbtn{border:none;background:transparent;border-radius:6px;padding:4px 8px;cursor:pointer;font:inherit;font-size:12px;color:var(--text-muted,#777);transition:.12s;line-height:1;}',
  '.bamboo-reader-view .bm-rbtn:hover{color:#3d6b4a;background:var(--background-modifier-hover,rgba(0,0,0,.05));}',
  '.bamboo-reader-view .bm-rbtn.primary{color:#3d6b4a;font-weight:600;background:transparent;border:none;}',
  '.bamboo-reader-view .bm-rbtn.primary:hover{background:rgba(74,124,89,.12);}',
  '.bamboo-reader-view .bm-rbtn.is-on{color:#3d6b4a;font-weight:600;background:transparent;border:none;}',
  '.bamboo-reader-view .bm-toolbar-sep{width:1px;height:18px;background:var(--background-modifier-border,#ececec);margin:0 3px;}',
  // 正文容器
  '.bamboo-reader-view .bm-body-wrap{padding:6px 16px 48px;max-width:44rem;margin:0 auto;width:100%;box-sizing:border-box;}',
  '.bamboo-reader-view .bm-header{max-width:44rem;margin:0 auto;width:100%;padding:10px 16px 4px;}',
  '.bamboo-reader-view .bm-title{font-size:calc(var(--bm-base-size,16px)*1.6);font-weight:700;line-height:1.4;letter-spacing:.01em;color:var(--text-normal);cursor:default;}',
  '.bamboo-reader-view .bm-meta{font-size:12px;color:var(--text-muted,#9a9a9a);margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;}',
  '.bamboo-reader-view .bm-sep{opacity:.5;}',
  '.bamboo-reader-view .bm-badge{font-size:11px;padding:1px 7px;border-radius:10px;background:rgba(74,124,89,.12);color:#3d6b4a;}',
  '.bamboo-reader-view .bm-updated{font-size:11px;color:var(--text-muted,#9a9a9a);margin:8px 0 0;opacity:.85;}',
  // 竹青排版覆盖（markdown-preview-view 原生接管其余样式，加前缀压过原生）
  '.bamboo-reader-view .bm-reader-body{--bm-bamboo-deep:#3d6b4a;--bm-bamboo:#4a7c59;--bm-bamboo-light:#6a9e6e;--bm-bamboo-pale:#a8c5a0;font-size:var(--bm-base-size,16px);line-height:1.75;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;padding:0;}',
  '.bamboo-reader-view .bm-reader-body p{margin-bottom:1.2em;text-align:justify;overflow-wrap:break-word;}',
  '.bamboo-reader-view .bm-reader-body h1,.bamboo-reader-view .bm-reader-body h2,.bamboo-reader-view .bm-reader-body h3{line-height:1.4;letter-spacing:.01em;font-weight:600;color:var(--text-normal);}',
  '.bamboo-reader-view .bm-reader-body h1{font-size:calc(var(--bm-base-size,16px)*1.6);margin-top:1.6em;}.bamboo-reader-view .bm-reader-body h2{font-size:calc(var(--bm-base-size,16px)*1.35);margin-top:1.4em;}.bamboo-reader-view .bm-reader-body h3{font-size:calc(var(--bm-base-size,16px)*1.15);margin-top:1.2em;}',
  '.bamboo-reader-view .bm-reader-body :not(pre)>code{white-space:nowrap;text-align:initial;background:rgba(74,124,89,.1);padding:1px 5px;border-radius:4px;font-size:.9em;}',
  '.bamboo-reader-view .bm-reader-body ::selection{background:color-mix(in srgb,var(--bm-bamboo) 22%,transparent);}',
  '.bamboo-reader-view .bm-reader-body strong{font-weight:600;}',
  '.bamboo-reader-view .bm-reader-body blockquote{border-left:3px solid var(--bm-bamboo-light);background:color-mix(in srgb,var(--bm-bamboo-pale) 12%,transparent);padding:8px 16px;margin:1.2em 0;border-radius:0 4px 4px 0;color:var(--text-muted);}',
  '.bamboo-reader-view .bm-reader-body a{color:var(--bm-bamboo);text-decoration:none;}',
  '.bamboo-reader-view .bm-reader-body a:hover{text-decoration:underline;}',
  '.bamboo-reader-view .bm-reader-body img{display:block;max-width:100%;height:auto;margin:1.4em auto;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.12);cursor:zoom-in;}',
  '.bamboo-reader-view .bm-reader-body hr{border:none;height:20px;margin:2em 0;background:none;position:relative;}',
  '.bamboo-reader-view .bm-reader-body hr::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:40px;height:2px;background:var(--bm-bamboo-pale);border-radius:1px;}',
  '.bamboo-reader-view .bm-reader-body table th{background:color-mix(in srgb,var(--bm-bamboo-pale) 16%,transparent);font-weight:600;}',
  // 图片骨架
  '.bamboo-reader-view .bm-img{opacity:0;transition:opacity .3s ease;}',
  '.bamboo-reader-view .bm-img--loaded{opacity:1;}',
  // 代码块增强
  '.bamboo-reader-view .bm-code{border-radius:6px;border:1px solid var(--background-modifier-border);padding:0;margin:1.2em 0;position:relative;overflow:hidden;counter-reset:bm-line;}',
  '.bamboo-reader-view .bm-code code{padding:0;}',
  '.bamboo-reader-view .bm-code-header{display:flex;align-items:center;justify-content:space-between;padding:4px 10px;font-size:10px;color:var(--text-muted,#999);background:var(--background-secondary,#f0f0f0);border-bottom:1px solid var(--background-modifier-border);}',
  '.bamboo-reader-view .bm-code-lang{text-transform:uppercase;letter-spacing:.05em;}',
  '.bamboo-reader-view .bm-code-copy{border:none;background:none;cursor:pointer;font-size:11px;color:var(--text-muted,#999);padding:0;}',
  '.bamboo-reader-view .bm-code-copy:hover{color:#3d6b4a;}',
  '.bamboo-reader-view .bm-line{display:block;white-space:pre;position:relative;padding-left:2.6em;}',
  '.bamboo-reader-view .bm-line::before{content:counter(bm-line);counter-increment:bm-line;position:absolute;left:0;width:2.1em;text-align:right;color:var(--text-faint,#bbb);user-select:none;font-size:11px;}',
  // 上/下篇 + 相关阅读
  '.bamboo-reader-view .bm-prevnext{display:flex;gap:24px;margin-top:22px;}',
  '.bamboo-reader-view .bm-pn{flex:1 1 0;min-width:0;padding:6px 0;cursor:pointer;background:transparent;}',
  '.bamboo-reader-view .bm-pn:hover .bm-pn-title{color:#3d6b4a;}',
  '.bamboo-reader-view .bm-pn-empty{visibility:hidden;}',
  '.bamboo-reader-view .bm-pn-label{font-size:10px;color:var(--text-muted,#aaa);}',
  '.bamboo-reader-view .bm-pn-title{font-size:13px;font-weight:600;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.bamboo-reader-view .bm-related{margin-top:22px;}',
  '.bamboo-reader-view .bm-related-title{font-size:12px;font-weight:700;color:var(--text-normal,#444);margin-bottom:6px;border-bottom:1px solid var(--background-modifier-border,#ececec);padding-bottom:4px;}',
  '.bamboo-reader-view .bm-related-link{display:block;font-size:12.5px;color:#3d6b4a;padding:5px 0;cursor:pointer;}',
  '.bamboo-reader-view .bm-related-link:hover{text-decoration:underline;}',
  // 加载/错误态
  '.bamboo-reader-view .bm-loading,.bamboo-reader-view .bm-error{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;color:var(--text-muted,#9a9a9a);padding:30px;box-sizing:border-box;text-align:center;}',
  '.bamboo-reader-view .bm-spinner{width:28px;height:28px;border:3px solid var(--background-modifier-border,#e0ddd2);border-top-color:#4a7c59;border-radius:50%;animation:bm-spin .8s linear infinite;}',
  '@keyframes bm-spin{to{transform:rotate(360deg);}}',
  '.bamboo-reader-view .bm-error-icon{font-size:30px;opacity:.6;}',
  // lightbox
  '.bamboo-reader-view .bm-mask{position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;}',
  '.bamboo-reader-view .bm-lightbox-img{max-width:90vw;max-height:90vh;border-radius:8px;}',
  // FAB
  '.bamboo-reader-view .bm-fab{position:absolute;right:18px;bottom:18px;display:flex;flex-direction:column;gap:8px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:6;}',
  '.bamboo-reader-view .bm-fab.show{opacity:1;pointer-events:auto;}',
  '.bamboo-reader-view .bm-fab-btn{width:34px;height:34px;border-radius:50%;border:1px solid var(--background-modifier-border);background:var(--background-primary);cursor:pointer;color:var(--text-muted);font-size:15px;line-height:1;box-shadow:0 1px 4px rgba(0,0,0,.12);}',
  '.bamboo-reader-view .bm-fab-btn:hover{color:#3d6b4a;border-color:#4a7c59;}',
  // 专注模式：仅隐藏 TOC 侧栏；顶栏（工具）始终保留，避免“工具丢失”
  '.bamboo-reader-view.bm-focus .bm-toc{display:none;}',
  '.bamboo-reader-view.bm-focus .bm-layout{grid-template-columns:1fr 0fr;}',
  // 目录显隐开关（工具栏按钮控制，跨次打开保留）
  '.bamboo-reader-view.bm-hide-toc .bm-toc{display:none;}',
  '.bamboo-reader-view.bm-hide-toc .bm-layout{grid-template-columns:1fr 0fr;}',
  // 暗色校准
  '.theme-dark .bamboo-reader-view .bm-reader-body{--bm-bamboo-deep:#7ab890;--bm-bamboo:#8fc59f;--bm-bamboo-light:#a8d6b5;--bm-bamboo-pale:rgba(143,197,159,.25);}',
  '.theme-dark .bamboo-reader-view .bm-reader-body blockquote{background:rgba(143,197,159,.08);}',
].join('\n');

interface ArticleMeta {
  title: string;
  date: string;
  tags: string[];
  category: string;
  author: string;
  words: number;
  reading: number;
}

interface IndexEntry {
  path: string;
  title: string;
  date: string;
  dateTs: number;
  category: string;
  tags: string[];
}

interface TocEntry {
  level: number;
  text: string;
  id: string;
}

function slugify(text: string): string {
  return (text || '').toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-|-$/g, '');
}

function stripFrontmatter(raw: string): string {
  return raw
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/^---\r?\n[\s\S]*?\r?\n---$/, '');
}

/** 中英混排窄空格预处理（用 \x00 占位符保护代码块/行内码，避免误伤） */
function preprocessMarkdown(md: string): string {
  const codeBlocks: string[] = [];
  const inlineCodes: string[] = [];
  let processed = md.replace(/```[\s\S]*?```/g, (m) => {
    codeBlocks.push(m);
    return '\x00CODE' + (codeBlocks.length - 1) + '\x00';
  });
  processed = processed.replace(/`[^`]*`/g, (m) => {
    inlineCodes.push(m);
    return '\x00INL' + (inlineCodes.length - 1) + '\x00';
  });
  const cjk = '[一-鿿]';
  const latin = '[a-zA-Z0-9@&%$#]';
  const NARROW = String.fromCharCode(0x2009);
  processed = processed
    .replace(new RegExp('(' + cjk + ')(' + latin + ')', 'g'), '$1' + NARROW + '$2')
    .replace(new RegExp('(' + latin + ')(' + cjk + ')', 'g'), '$1' + NARROW + '$2');
  // eslint-disable-next-line no-control-regex -- \x00 为有意占位符分隔符
  processed = processed.replace(/\x00INL(\d+)\x00/g, (_, i) => inlineCodes[+i] || '');
  // eslint-disable-next-line no-control-regex -- \x00 为有意占位符分隔符
  processed = processed.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[+i] || '');
  return processed;
}

/** 字数统计：中文按字、拉丁按词（剥离 frontmatter/代码/图片/HTML） */
function countWords(md: string): number {
  const stripped = md
    .replace(/^---\n[\s\S]*?\n---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '');
  const cjk = (stripped.match(/[一-鿿]/g) || []).length;
  const latin = (stripped.replace(/[一-鿿]/g, ' ').match(/[a-zA-Z0-9]+/g) || []).length;
  return cjk + latin;
}

function formatWordCount(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k 字' : n + ' 字';
}

function estimateReadingTime(words: number): number {
  return Math.max(1, Math.round(words / 350));
}

function parseDateTs(date: string): number {
  if (!date) return 0;
  const t = Date.parse(date.length <= 10 ? date + 'T00:00:00' : date);
  return Number.isNaN(t) ? 0 : t;
}

/** 更新时间格式化：今天/昨天 + 时分；更早则完整日期 */
function formatUpdateTime(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (diffDays === 0) return `今天 ${time}`;
  if (diffDays === 1) return `昨天 ${time}`;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${time}`;
}

export class BambooReaderView extends ItemView {
  static pendingPath: string | null = null;

  private plugin: BambooReviewPlugin;

  private _path = '';
  private _renderComp: Component | null = null;
  private _opened = false;
  private _container: HTMLElement | null = null;

  private _contentEl: HTMLElement | null = null;
  private _bodyEl: HTMLElement | null = null;
  private _index: IndexEntry[] | null = null;

  private _tocElements = new Map<string, HTMLElement>();
  private _headingElements: { id: string; el: HTMLElement }[] = [];
  private _tocBar: HTMLElement | null = null;
  private _tocPct: HTMLElement | null = null;
  private _fabEl: HTMLElement | null = null;
  private _focusBtn: HTMLElement | null = null;
  private _tocBtn: HTMLElement | null = null;
  private _sidebarBtn: HTMLElement | null = null;
  private _tocHidden = false;
  private _scrollHandler: (() => void) | null = null;
  private _scrollRaf = false;
  private _scrollSaveTimer: number | null = null;
  private _focusMode = false;
  private _focusExitHandler: ((e: KeyboardEvent) => void) | null = null;
  /** 专注模式进入前左右侧栏的折叠态（退出时按此恢复；null = 当前不在专注态） */
  private _focusPrev: { left: boolean; right: boolean } | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: BambooReviewPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_BAMBOO_READER;
  }

  getDisplayText(): string {
    return '竹林博客阅读';
  }

  getIcon(): string {
    return 'book-open';
  }

  getPath(): string {
    return this._path;
  }

  getState(): Record<string, unknown> {
    return { path: this._path };
  }

  async setState(state: Record<string, unknown>): Promise<void> {
    if (state && typeof state === 'object' && typeof state.path === 'string') {
      this._path = state.path;
      BambooReaderView.pendingPath = null;
    } else if (BambooReaderView.pendingPath) {
      this._path = BambooReaderView.pendingPath;
      BambooReaderView.pendingPath = null;
    }
    if (this._opened && this._container) {
      void this.render(this._container);
    }
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('bamboo-reader-view');
    if (!container.querySelector('style.bamboo-reader-style')) {
      container.createEl('style', { cls: 'bamboo-reader-style', text: BAMBOO_READER_CSS });
    }
    this._container = container;
    this._opened = true;
    // 不再自动恢复上次的专注模式：否则顶栏(工具)与目录会被隐藏，造成“工具丢失”的错觉
    this._focusMode = false;
    this._focusPrev = null;
    container.removeClass('bm-focus');
    // 读取目录显隐偏好（用户设置，跨次打开保留）
    this._tocHidden = window.localStorage.getItem('bamboo-reader-toc') === 'off';
    container.toggleClass('bm-hide-toc', this._tocHidden);
    await this.render(container);
    // 侧栏被 Obsidian 原生方式（左栏按钮/快捷键）展开或折叠时，同步「☰ 侧栏」按钮高亮态
    this.registerEvent(this.app.workspace.on('layout-change', () => this.syncSidebarBtn()));
  }

  async onClose(): Promise<void> {
    this._renderComp?.unload();
    this._renderComp = null;
    if (this._scrollSaveTimer !== null) {
      window.clearTimeout(this._scrollSaveTimer);
      this._scrollSaveTimer = null;
    }
    if (this._focusExitHandler) {
      document.removeEventListener('keydown', this._focusExitHandler);
      this._focusExitHandler = null;
    }
    // 专注态下关闭阅读页：先恢复侧栏，避免只留一个空工作区
    if (this._focusMode) {
      this._focusMode = false;
      this.applySidebarZen(false);
    }
    this._sidebarBtn = null;
  }

  private async render(container: HTMLElement): Promise<void> {
    Array.from(container.children).forEach((ch) => {
      if (!(ch instanceof HTMLElement && ch.classList.contains('bamboo-reader-style'))) ch.remove();
    });
    this._renderComp?.unload();
    this._renderComp = new Component();
    this._renderComp.load();
    this._tocElements.clear();
    this._headingElements = [];
    this._tocBar = null;
    this._tocPct = null;
    this._fabEl = null;
    this._bodyEl = null;
    this._contentEl = null;
    this._tocBtn = null;

    if (!this._path) {
      container.createDiv({ cls: 'bm-loading', text: '未指定要阅读的文章' });
      return;
    }
    const file = this.app.vault.getAbstractFileByPath(this._path);
    if (!(file instanceof TFile)) {
      this.showError(container, '文章不存在：' + this._path);
      return;
    }

    // 骨架：layout 作为唯一滚动容器（grid：顶栏跨内容列吸顶、TOC 置于右列，与竹杖芒鞋对齐）
    const layout = container.createDiv({ cls: 'bm-layout' });
    this._contentEl = layout;
    const topbar = layout.createDiv({ cls: 'bm-topbar' });
    this.renderToolbar(topbar);
    const content = layout.createDiv({ cls: 'bm-content' });
    const bodyWrap = content.createDiv({ cls: 'bm-body-wrap' });
    bodyWrap.createDiv({ cls: 'bm-loading' }).innerHTML =
      '<div class="bm-spinner"></div><div>正在加载文章…</div>';

    try {
      const raw = await this.app.vault.read(file);
      const meta = this.parseArticle(raw, file);
      const processed = preprocessMarkdown(stripFrontmatter(raw));

      bodyWrap.empty();
      this.renderHeader(topbar, meta);

      const updated = bodyWrap.createDiv({ cls: 'bm-updated' });
      updated.textContent = '最后更新于 ' + formatUpdateTime(file.stat.mtime);

      const body = bodyWrap.createDiv({ cls: 'bm-reader-body markdown-preview-view' });
      this._bodyEl = body;
      await MarkdownRenderer.render(this.app, processed, body, this._path, this._renderComp);

      // 图片懒加载 + 骨架 + lightbox
      body.querySelectorAll('img').forEach((img) => {
        img.setAttribute('loading', 'lazy');
        img.classList.add('bm-img');
        const onLoad = () => img.classList.add('bm-img--loaded');
        img.addEventListener('load', onLoad);
        if (img.complete) onLoad();
        img.addEventListener('click', () => this.showLightbox(img.src, img.alt));
      });

      // 代码块增强（语言标签 + 复制 + 行号）
      body.querySelectorAll('pre').forEach((pre) => this.enhanceCode(pre as HTMLElement));

      // 内部链接拦截
      this.interceptLinks(body);

      // 标题 id（scroll spy 用）
      body.querySelectorAll('h1,h2,h3,h4').forEach((el) => {
        const text = (el.textContent || '').trim();
        const id = slugify(text);
        el.id = id;
        this._headingElements.push({ id, el: el as HTMLElement });
      });

      // TOC 侧栏
      const toc = this.extractToc(processed);
      if (toc.length >= 2) this.renderToc(layout, toc);

      // 上/下篇 + 相关阅读
      this.renderPrevNextRelated(bodyWrap);

      // 浮动 FAB（挂到 layout 而非滚动内容里，确保固定在视图右下角、不随滚动移动）
      const fab = layout.createDiv({ cls: 'bm-fab' });
      this._fabEl = fab;
      fab.createEl('button', { cls: 'bm-fab-btn', text: '↑', attr: { title: '回到顶部' } })
        .addEventListener('click', () => this.scrollTo('top'));
      fab.createEl('button', { cls: 'bm-fab-btn', text: '↓', attr: { title: '到底部' } })
        .addEventListener('click', () => this.scrollTo('bottom'));

      // 字号
      this.applyFontSize();

      // 滚动监听
      this._scrollHandler = () => this.onScroll();
      layout.addEventListener('scroll', this._scrollHandler, { passive: true });

      // 恢复阅读进度
      const saved = this.loadProgress(this._path);
      if (saved) layout.scrollTop = saved;
      this.onScroll();
    } catch (err) {
      bodyWrap.empty();
      this.showError(bodyWrap, '加载失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  }

  private showError(container: HTMLElement, msg: string): void {
    const wrap = container.createDiv({ cls: 'bm-error' });
    const icon = wrap.createSpan({ cls: 'bm-error-icon' });
    setIcon(icon, 'alert-triangle');
    wrap.createEl('div', { text: msg });
  }

  /* ── 工具栏 ── */
  private renderToolbar(bar: HTMLElement): void {
    const tb = bar.createDiv({ cls: 'bm-toolbar' });
    const back = tb.createEl('button', { cls: 'bm-rbtn', text: '☰ 侧栏', attr: { title: '展开/折叠博客侧栏（保留当前阅读页）' } });
    this._sidebarBtn = back;
    this.syncSidebarBtn();
    back.addEventListener('click', () => void this.toggleSidebar());
    tb.createDiv({ cls: 'bm-toolbar-sep' });
    const zoom = tb.createDiv({ cls: 'bm-zoom' });
    zoom.createEl('button', { cls: 'bm-rbtn', text: 'A⁻', attr: { title: '减小字号' } })
      .addEventListener('click', () => this.changeFont(-1));
    zoom.createEl('button', { cls: 'bm-rbtn', text: 'A', attr: { title: '重置字号' } })
      .addEventListener('click', () => this.changeFont(0));
    zoom.createEl('button', { cls: 'bm-rbtn', text: 'A⁺', attr: { title: '增大字号' } })
      .addEventListener('click', () => this.changeFont(1));
    const focus = tb.createEl('button', { cls: 'bm-rbtn', text: '◎ 专注', attr: { title: '专注阅读：折叠左右侧栏（Esc 退出）' } });
    this._focusBtn = focus;
    if (this._focusMode) focus.addClass('is-on');
    focus.addEventListener('click', () => this.toggleFocusMode());
    const toc = tb.createEl('button', { cls: 'bm-rbtn' + (this._tocHidden ? '' : ' is-on'), text: '☰ 目录', attr: { title: '显示/隐藏右侧目录' } });
    this._tocBtn = toc;
    toc.addEventListener('click', () => this.toggleToc());
    const open = tb.createEl('button', { cls: 'bm-rbtn primary', text: '↗ Obsidian', attr: { title: '在 Obsidian 打开原文' } });
    open.addEventListener('click', () => void this.openInObsidian());
  }

  /**
   * 侧栏开关（「☰ 侧栏」按钮）：左栏未展开 → 打开博客模块（openModuleLeftSidebar 连同展开左栏）；
   * 左栏已展开 → 折叠左栏。阅读页始终保留在中央。切换后同步按钮高亮态。
   */
  private async toggleSidebar(): Promise<void> {
    const left = this.leftSplit();
    if (!left) return;
    if (left.collapsed) {
      try {
        await this.plugin.openModuleLeftSidebar(BLOG_MODULE_ID);
      } catch {
        // 打开侧栏失败不应阻塞交互
      }
    } else {
      left.collapse();
    }
    this.syncSidebarBtn();
  }

  /** 左栏展开/折叠态 → 「☰ 侧栏」按钮的 is-on 高亮 */
  private syncSidebarBtn(): void {
    const left = this.leftSplit();
    const expanded = !!left && !left.collapsed;
    this._sidebarBtn?.toggleClass('is-on', expanded);
  }

  /** 取左栏（WorkspaceSidedock），移动端为抽屉形态也可能无 collapse 语义，故做空值保护 */
  private leftSplit(): { collapsed: boolean; collapse(): void; expand(): void } | null {
    const ls = this.app.workspace.leftSplit as unknown as
      { collapsed: boolean; collapse(): void; expand(): void } | undefined;
    return ls ?? null;
  }

  /* ── 元信息 ── */
  private renderHeader(container: HTMLElement, meta: ArticleMeta): void {
    const header = container.createDiv({ cls: 'bm-header' });
    header.createEl('h1', { cls: 'bm-title', text: meta.title });
    header.addEventListener('dblclick', () => this.scrollTo('top'));
    const m = header.createDiv({ cls: 'bm-meta' });
    // 分隔点只插在「确实渲染出来的两段」之间：可选字段（日期/分类）缺失时不再残留悬空的点，
    // 避免出现「作者 · · 约 N 字」这种连续双点。
    const parts: Array<(el: HTMLElement) => void> = [
      (el) => el.createSpan({ text: meta.author }),
    ];
    if (meta.date) parts.push((el) => el.createSpan({ text: meta.date }));
    if (meta.category && meta.category !== '未分类') {
      parts.push((el) => el.createSpan({ cls: 'bm-badge', text: meta.category }));
    }
    parts.push((el) => el.createSpan({ text: `约 ${formatWordCount(meta.words)} · ${meta.reading} 分钟` }));
    parts.forEach((render, idx) => {
      if (idx > 0) m.createSpan({ cls: 'bm-sep', text: '·' });
      render(m);
    });
    if (meta.tags.length) {
      const tr = header.createDiv({ cls: 'bm-meta' });
      for (const t of meta.tags) tr.createSpan({ cls: 'bm-badge', text: t });
    }
  }

  /* ── TOC 侧栏 ── */
  private renderToc(layout: HTMLElement, toc: TocEntry[]): void {
    const nav = layout.createDiv({ cls: 'bm-toc' });
    const progWrap = nav.createDiv({ cls: 'bm-toc-progress' });
    this._tocBar = progWrap.createDiv({ cls: 'bm-toc-bar' });
    const head = nav.createDiv({ cls: 'bm-toc-head' });
    head.createDiv({ text: '目录' });
    this._tocPct = head.createDiv({ cls: 'bm-toc-pct', text: '0%' });
    const list = nav.createDiv({ cls: 'bm-toc-list' });
    for (const e of toc) {
      const item = list.createDiv({ cls: `bm-toc-item bm-toc-h${e.level}`, text: e.text });
      this._tocElements.set(e.id, item);
      const go = () => {
        const el = this._contentEl?.ownerDocument.getElementById(e.id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      item.addEventListener('click', go);
    }
  }

  private extractToc(md: string): TocEntry[] {
    const entries: TocEntry[] = [];
    for (const line of md.split('\n')) {
      const m = line.match(/^(#{1,4})\s+(.+)$/);
      if (m) {
        const text = m[2].replace(/[\\*_`~[\]]/g, '').trim();
        entries.push({ level: m[1].length, text, id: slugify(text) });
      }
    }
    return entries;
  }

  /* ── 上/下篇 + 相关阅读 ── */
  private renderPrevNextRelated(container: HTMLElement): void {
    const all = this.buildIndex();
    const cur = all.find((a) => a.path === this._path);
    if (!cur || all.length < 2) return;

    // 同分类按 date 倒序
    const sameCat = all
      .filter((a) => a.category === cur.category)
      .sort((a, b) => b.dateTs - a.dateTs);
    const ci = sameCat.findIndex((a) => a.path === cur.path);
    const prev = ci >= 0 && ci < sameCat.length - 1 ? sameCat[ci + 1] : null;
    const next = ci > 0 ? sameCat[ci - 1] : null;

    if (prev || next) {
      const nav = container.createDiv({ cls: 'bm-prevnext' });
      if (prev) {
        const p = nav.createDiv({ cls: 'bm-pn' });
        p.createDiv({ cls: 'bm-pn-label', text: '← 上一篇' });
        p.createDiv({ cls: 'bm-pn-title', text: prev.title });
        p.addEventListener('click', () => void this.plugin.openReaderView(prev.path));
      } else {
        nav.createDiv({ cls: 'bm-pn bm-pn-empty' });
      }
      if (next) {
        const n = nav.createDiv({ cls: 'bm-pn' });
        n.createDiv({ cls: 'bm-pn-label', text: '下一篇 →' });
        n.createDiv({ cls: 'bm-pn-title', text: next.title });
        n.addEventListener('click', () => void this.plugin.openReaderView(next.path));
      } else {
        nav.createDiv({ cls: 'bm-pn bm-pn-empty' });
      }
    }

    // 相关阅读：按 tag 重叠打分 top3
    const curTags = new Set(cur.tags);
    if (curTags.size > 0) {
      const scored = all
        .filter((a) => a.path !== cur.path)
        .map((a) => ({ a, overlap: a.tags.filter((t) => curTags.has(t)).length }))
        .filter((s) => s.overlap > 0)
        .sort((x, y) => y.overlap - x.overlap)
        .slice(0, 3);
      if (scored.length) {
        const sec = container.createDiv({ cls: 'bm-related' });
        sec.createDiv({ cls: 'bm-related-title', text: '相关阅读' });
        for (const s of scored) {
          const link = sec.createEl('div', { cls: 'bm-related-link', text: s.a.title });
          link.addEventListener('click', () => void this.plugin.openReaderView(s.a.path));
        }
      }
    }
  }

  /** 轻量构建 vault 文章索引（仅解析 frontmatter） */
  private buildIndex(): IndexEntry[] {
    if (this._index) return this._index;
    const files = this.app.vault.getMarkdownFiles() || [];
    this._index = files.map((f) => {
      const fm = this.parseFrontmatter(f.path);
      return {
        path: f.path,
        title: fm.title || f.basename,
        date: fm.date,
        dateTs: parseDateTs(fm.date) || f.stat.ctime,
        category: fm.category,
        tags: fm.tags,
      };
    });
    return this._index;
  }

  private parseArticle(raw: string, file: TFile): ArticleMeta {
    const fm = this.parseFrontmatter(file.path, raw);
    const words = countWords(stripFrontmatter(raw));
    const parts = file.path.split('/');
    const category = parts.length > 2 ? parts[parts.length - 2] : '未分类';
    return {
      title: fm.title || file.basename,
      date: fm.date,
      tags: fm.tags,
      category,
      author: fm.author || '竹杖芒鞋',
      words,
      reading: estimateReadingTime(words),
    };
  }

  /** 简易 frontmatter 解析（扁平键值，仅取需要的字段） */
  private parseFrontmatter(_path: string, raw?: string): {
    title: string;
    date: string;
    tags: string[];
    category: string;
    author: string;
  } {
    let block = '';
    if (raw !== undefined) {
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
      if (m) block = m[1];
    }
    let title = '';
    let date = '';
    let author = '';
    let tags: string[] = [];
    const get = (k: string) => {
      const mm = block.match(new RegExp(k + '\\s*:\\s*(.+)'));
      return mm ? mm[1].trim().replace(/^['"]|['"]$/g, '') : '';
    };
    title = get('title');
    date = get('date').slice(0, 10);
    author = get('author');
    const tg = block.match(/tags\s*:\s*\[([^\]]*)\]/);
    if (tg) tags = tg[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    const parts = _path.split('/');
    const category = parts.length > 2 ? parts[parts.length - 2] : '未分类';
    return { title, date, tags, category, author };
  }

  /* ── 代码块增强 ── */
  private enhanceCode(pre: HTMLElement): void {
    const code = pre.querySelector('code');
    const lang = code ? (code.className.match(/language-(\w+)/) || [])[1] : null;
    pre.classList.add('bm-code');
    const header = pre.createDiv({ cls: 'bm-code-header' });
    if (lang) header.createSpan({ cls: 'bm-code-lang', text: lang });
    const copy = header.createEl('button', { cls: 'bm-code-copy', text: '复制' });
    copy.addEventListener('click', () => {
      const txt = code ? code.textContent : pre.textContent;
      if (txt && navigator.clipboard) {
        void navigator.clipboard.writeText(txt).then(() => {
          copy.textContent = '已复制 ✓';
          window.setTimeout(() => (copy.textContent = '复制'), 1500);
        });
      }
    });
    if (code) {
      const nodes = Array.from(code.childNodes);
      const lines: Node[][] = [[]];
      for (const child of nodes) {
        if (child.nodeType === 3) {
          const parts = (child.textContent || '').split('\n');
          for (let i = 0; i < parts.length; i++) {
            if (parts[i]) lines[lines.length - 1].push(document.createTextNode(parts[i]));
            if (i < parts.length - 1) lines.push([]);
          }
        } else if (child.nodeName === 'BR') {
          lines.push([]);
        } else {
          lines[lines.length - 1].push(child.cloneNode(true));
        }
      }
      code.textContent = '';
      const frag = document.createDocumentFragment();
      for (let i = 0; i < lines.length; i++) {
        const sp = document.createElement('span');
        sp.className = 'bm-line';
        lines[i].forEach((n) => sp.appendChild(n));
        frag.appendChild(sp);
        if (i < lines.length - 1) frag.appendChild(document.createTextNode('\n'));
      }
      code.appendChild(frag);
    }
  }

  private showLightbox(src: string, alt: string): void {
    const mask = document.createElement('div');
    mask.className = 'bm-mask';
    const img = document.createElement('img');
    img.className = 'bm-lightbox-img';
    img.src = src;
    img.alt = alt;
    mask.appendChild(img);
    mask.addEventListener('click', () => mask.remove());
    this.containerEl.appendChild(mask);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        mask.remove();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  }

  /* ── 内部链接拦截 ── */
  private interceptLinks(body: HTMLElement): void {
    body.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href') ?? a.dataset.href ?? '';
      if (!href) return;
      if (a.classList.contains('external-link')) {
        a.setAttr('target', '_blank');
        a.setAttr('rel', 'noopener noreferrer');
        return;
      }
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = href.split('#')[0];
        const f = this.resolveLink(target);
        if (f) void this.plugin.openReaderView(f);
        else void this.app.workspace.openLinkText(href, this._path, e.ctrlKey || e.metaKey);
      });
    });
  }

  private resolveLink(target: string): string | null {
    if (!target) return null;
    const direct = this.app.vault.getAbstractFileByPath(target);
    if (direct instanceof TFile) return direct.path;
    const byBase = this.app.vault.getMarkdownFiles().find((f) => f.basename === target || f.path === target);
    return byBase ? byBase.path : null;
  }

  /* ── 滚动（进度条 / 百分比 / scroll spy / FAB / 进度保存） ── */
  private onScroll(): void {
    if (this._scrollRaf) return;
    this._scrollRaf = true;
    window.requestAnimationFrame(() => {
      this._scrollRaf = false;
      const c = this._contentEl;
      if (!c) return;
      const top = c.scrollTop;
      const height = c.scrollHeight - c.clientHeight;
      const pct = height > 0 ? Math.min(top / height, 1) : 0;
      if (this._tocBar) this._tocBar.setCssStyles({ width: pct * 100 + '%' });
      if (this._tocPct) this._tocPct.textContent = Math.round(pct * 100) + '%';
      if (this._headingElements.length) {
        let active = this._headingElements[0].id;
        for (const h of this._headingElements) {
          if (h.el.offsetTop - c.offsetTop <= top + 60) active = h.id;
          else break;
        }
        this._tocElements.forEach((el, id) => el.classList.toggle('is-active', id === active));
      }
      if (this._fabEl) this._fabEl.classList.toggle('show', height > 100);
    });
    if (this._scrollSaveTimer !== null) window.clearTimeout(this._scrollSaveTimer);
    this._scrollSaveTimer = window.setTimeout(() => {
      this._scrollSaveTimer = null;
      if (this._contentEl) this.saveProgress(this._path, this._contentEl.scrollTop);
    }, 150);
  }

  private scrollTo(dir: 'top' | 'bottom'): void {
    const c = this._contentEl;
    if (!c) return;
    c.scrollTo({ top: dir === 'top' ? 0 : c.scrollHeight, behavior: 'smooth' });
  }

  /* ── 字号 ── */
  private changeFont(delta: -1 | 0 | 1): void {
    const next = delta === 0 ? 16 : Math.max(12, Math.min(22, this.loadFontSize() + delta * 2));
    window.localStorage.setItem('bamboo-reader-fontsize', String(next));
    this.applyFontSize();
  }

  private applyFontSize(): void {
    const size = this.loadFontSize();
    if (this._bodyEl) {
      this._bodyEl.setCssProps({ '--bm-base-size': size + 'px' });
      this._bodyEl.style.fontSize = size + 'px';
    }
  }

  private loadFontSize(): number {
    const v = window.localStorage.getItem('bamboo-reader-fontsize');
    const n = v ? parseInt(v, 10) : 16;
    return Number.isFinite(n) ? n : 16;
  }

  /* ── 专注模式 ── */
  private toggleFocusMode(): void {
    this._focusMode = !this._focusMode;
    this._container?.toggleClass('bm-focus', this._focusMode);
    this._focusBtn?.toggleClass('is-on', this._focusMode);
    this.applySidebarZen(this._focusMode);
    if (this._focusMode) {
      const exit = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this._focusMode) {
          this.toggleFocusMode();
          document.removeEventListener('keydown', exit);
        }
      };
      document.addEventListener('keydown', exit);
      this._focusExitHandler = exit;
    } else if (this._focusExitHandler) {
      document.removeEventListener('keydown', this._focusExitHandler);
      this._focusExitHandler = null;
    }
  }

  /**
   * 专注模式联动 Obsidian 左右侧栏：进入折叠双栏、退出按进入前的折叠态恢复。
   * 复刻画中卷「一键全屏」的折叠/恢复策略——只展开「原本开着」的一侧，不把用户刻意
   * 收起的侧栏弹回来；记录丢失（视图重建 / 手动收起）时兜底恢复双栏，避免点了没反应。
   */
  private applySidebarZen(on: boolean): void {
    const ws = this.app.workspace as unknown as {
      leftSplit?: { collapse?: () => void; expand?: () => void; collapsed?: boolean };
      rightSplit?: { collapse?: () => void; expand?: () => void; collapsed?: boolean };
    };
    if (on) {
      this._focusPrev = {
        left: !!ws?.leftSplit?.collapsed,
        right: !!ws?.rightSplit?.collapsed,
      };
      try {
        ws?.leftSplit?.collapse?.();
        ws?.rightSplit?.collapse?.();
      } catch {
        /* 折叠失败不阻断，仍视为专注态 */
      }
      this.syncSidebarBtn();
      return;
    }
    const prev = this._focusPrev ?? { left: false, right: false };
    this._focusPrev = null;
    try {
      if (!prev.left) ws?.leftSplit?.expand?.();
      if (!prev.right) ws?.rightSplit?.expand?.();
    } catch {
      /* 展开失败不阻断 */
    }
    this.syncSidebarBtn();
  }

  /* ── 目录显隐开关 ── */
  private toggleToc(): void {
    this._tocHidden = !this._tocHidden;
    this._container?.toggleClass('bm-hide-toc', this._tocHidden);
    this._tocBtn?.toggleClass('is-on', !this._tocHidden);
    window.localStorage.setItem('bamboo-reader-toc', this._tocHidden ? 'off' : 'on');
  }

  /* ── 进度 ── */
  private loadProgress(path: string): number {
    const v = window.localStorage.getItem('bamboo-reader-progress-' + path);
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  }

  private saveProgress(path: string, top: number): void {
    window.localStorage.setItem('bamboo-reader-progress-' + path, String(Math.round(top)));
  }

  private async openInObsidian(): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(this._path);
    if (file instanceof TFile) {
      const leaf = this.app.workspace.getLeaf('tab');
      await leaf.openFile(file);
    }
  }
}
