import { ItemView, WorkspaceLeaf, MarkdownRenderer, Component, TFile, normalizePath, setIcon } from 'obsidian';
import type BambooReviewPlugin from '../../main';
import { diffLocalDays } from '../utils/dateUtils';

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
 *   · 元信息：作者/日期/字数/阅读时长（一律通用 frontmatter 键优先，缺失即不渲染，不做硬编码填充）
 *   · 文章落款：最后更新于（挂在正文之后；时间非法时整行不渲染）
 *   · 内部链接拦截（跨文章在插件内打开）
 *   · 字号缩放 / 专注模式(Esc 退出+持久化) / 阅读进度恢复（按文章路径）
 *   · 上/下篇（范围 = 博客模块 rootFolder 目录含子目录；全站一条链，按文件 mtime 与左侧列表同序，不分分类）
 *   · 相关阅读（按 tag 重叠取 top3，可跨分类；与上下篇彼此独立、互不影响）
 *   · 返回按钮 + 浮动 FAB(↑↓)
 */

interface ArticleMeta {
  title: string;
  date: string;
  /** 作者；三级兜底后仍为空则整段不渲染（绝不写死笔名） */
  author: string;
  words: number;
  reading: number;
}

interface IndexEntry {
  path: string;
  title: string;
  /**
   * 导航排序键 = 文件 mtime。必须与左侧博客列表同源：blog.js 的文章列表是
   * `items.sort((a,b) => b.mtime - a.mtime)` 且卡片上显示的日期就是 mtime，
   * 所以「下一篇」必须等于列表里紧邻上方那篇，否则阅读器与列表的次序会对不上。
   * （不用 ctime：文件被复制/同步/恢复会刷新 ctime，`把自媒体搬进Ob` 就是 slug=07-19 而 ctime=09-15。）
   */
  mtime: number;
  tags: string[];
}

interface TocEntry {
  level: number;
  text: string;
  id: string;
}

/** frontmatter 归一化结果：阅读器内部的统一元信息结构（详情页与 vault 索引同源） */
interface FrontmatterInfo {
  title: string;
  date: string;
  tags: string[];
  author: string;
}

/** 格式化为 YYYY-MM-DD（YAML 里的裸日期会被 Obsidian 解析成 Date 对象） */
function formatYmd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 取所在目录（顶层文件返回空串） */
function dirOfPath(path: string): string {
  return path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
}

/** 标签归一化：兼容 string / string[]（多行 YAML 列表会被 Obsidian 解析成数组）、去 # 前缀与空白、去重 */
function normalizeTags(input: unknown): string[] {
  const out: string[] = [];
  const push = (v: unknown): void => {
    if (typeof v !== 'string') return;
    // YAML 里 `bamboo-tags: ""` 是「空值」的常见写法；正则兜底路径拿到的是带引号的原文，
    // 若不去引号就会把 `""` 本身当成一个标签（metadataCache 路径没这问题，它由 YAML 解析器给出空串）。
    // 去引号放在去 `#` 之前：`"#tag"` 这种带引号又带井号的写法也能收敛到 `tag`。
    const t = v.trim().replace(/^['"]|['"]$/g, '').trim().replace(/^#+/, '').trim();
    if (t && !out.includes(t)) out.push(t);
  };
  if (Array.isArray(input)) input.forEach(push);
  else if (typeof input === 'string') input.split(/[,，\s]+/).forEach(push);
  return out;
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

/** 更新时间格式化：今天/昨天 + 时分；更早则完整日期 */
function formatUpdateTime(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  // 用「日历日差」而非时长差：昨天 23:00 更新、今天 08:00 打开应为「昨天」而不是「今天」
  const diffDays = diffLocalDays(d, now);
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
  /** 本次索引实际生效的范围键（rootFolder，或未配置时的当前文章所在目录）：变化即重建 */
  private _indexRoot = '';

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
    // vault 增删改名后作废文章索引：否则「上/下篇」「相关阅读」会一直拿着旧快照
    // （含已删除文件、缺新建文件），直到重开阅读视图。registerEvent 随视图卸载自动反注册。
    const dropIndex = () => { this._index = null; };
    this.registerEvent(this.app.vault.on('create', dropIndex));
    this.registerEvent(this.app.vault.on('delete', dropIndex));
    this.registerEvent(this.app.vault.on('rename', dropIndex));
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
    container.empty();
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
    const loading = bodyWrap.createDiv({ cls: 'bm-loading' });
    loading.createDiv({ cls: 'bm-spinner' });
    loading.createDiv({ text: '正在加载文章…' });

    try {
      const raw = await this.app.vault.read(file);
      const meta = this.parseArticle(raw, file);
      const processed = preprocessMarkdown(stripFrontmatter(raw));

      bodyWrap.empty();
      this.renderHeader(topbar, meta);

      const body = bodyWrap.createDiv({ cls: 'bm-reader-body markdown-preview-view' });
      this._bodyEl = body;
      await MarkdownRenderer.render(this.app, processed, body, this._path, this._renderComp);

      // 落款：更新时间的归属是「文章结尾」而非开头。原先它建在正文之前，读者一眼看到的是一行
      // 技术性时间戳挡在标题与正文之间；移到正文之后，它才回到该在的位置（正文末尾的落款）。
      // formatUpdateTime 对非法时间返回空串，此时整行不渲染 —— 沿用本视图「缺失即不渲染」的约定，
      // 避免留下「最后更新于 」这种残缺文本。
      const updatedText = formatUpdateTime(file.stat.mtime);
      if (updatedText) bodyWrap.createDiv({ cls: 'bm-updated', text: '最后更新于 ' + updatedText });

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
      body.querySelectorAll('pre').forEach((pre) => this.enhanceCode(pre));

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

      // 上/下篇（时间流）与相关阅读（主题网）彼此独立，各自决定是否渲染
      this.renderPrevNext(bodyWrap);
      this.renderRelated(bodyWrap);

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
    wrap.createDiv({ text: msg });
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
    // 分隔点只插在「确实渲染出来的两段」之间：可选字段（作者/日期）缺失时不再残留悬空的点，
    // 避免出现「作者 · · 约 N 字」这种连续双点。字数/阅读时长恒有，永远兜住最后一个点。
    const parts: Array<(el: HTMLElement) => void> = [];
    if (meta.author) parts.push((el) => el.createSpan({ text: meta.author }));
    if (meta.date) parts.push((el) => el.createSpan({ text: meta.date }));
    parts.push((el) => el.createSpan({ text: `约 ${formatWordCount(meta.words)} · ${meta.reading} 分钟` }));
    parts.forEach((render, idx) => {
      if (idx > 0) m.createSpan({ cls: 'bm-sep', text: '·' });
      render(m);
    });
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

  /* ── 上/下篇（时间流）── */
  /**
   * 上一篇 / 下一篇 —— 沿「本博客全部文章」按文件修改时间翻，不按分类切分。
   *
   * 【序必须与左侧列表同源】左侧博客列表 = blog.js 的 `sort((a,b) => b.mtime - a.mtime)`，
   * 卡片上显示的日期也是 mtime。所以这里的链一律按 mtime 倒序，读者在列表里看到某篇的上一格是谁，
   * 点进正文后「下一篇」就该是谁。不用文章日期（slug 里的日期只代表发布日，被编辑后与列表次序会错开），
   * 更不用 ctime（文件复制/同步会刷新它，`把自媒体搬进Ob` 就出现 slug=07-19 而 ctime=09-15 的漂移）。
   *
   * 【为什么不分分类】本地博客的文章是一串按时间排好的流，读者的「上一篇 / 下一篇」是沿着这条流
   * 往前走，而不是在某个分类内部打转。曾经按分类过滤过：分类取自目录名时，文章平铺在同一层
   * → 全归「未分类」→ 恰好等价于全站，看着是对的；一旦分类改从 frontmatter 读，
   * 就变成「只有同分类的少数几篇能互翻」，大部分文章直接没有上下篇 —— 那是回归。
   * 分类维度已整体移除：详情页不再展示，也不再参与任何导航。
   *
   * 方向：列表按 mtime 倒序（新 → 旧），故「上一篇」= 更早（列表后一项）、「下一篇」= 更新（列表前一项）。
   * mtime 相同的多篇用路径兜底排序，保证次序稳定、不随文件枚举顺序抖动。
   *
   * 与「相关阅读」彼此独立：文章没有标签也照样有上下篇，反之亦然。
   */
  private renderPrevNext(container: HTMLElement): void {
    const all = this.buildIndex();
    const cur = all.find((a) => a.path === this._path);
    if (!cur || all.length < 2) return;
    const ordered = all.slice().sort((a, b) => b.mtime - a.mtime || a.path.localeCompare(b.path));
    const ci = ordered.findIndex((a) => a.path === cur.path);
    if (ci < 0) return;
    const prev = ci < ordered.length - 1 ? ordered[ci + 1] : null;
    const next = ci > 0 ? ordered[ci - 1] : null;
    if (!prev && !next) return;
    const nav = container.createDiv({ cls: 'bm-prevnext' });
    const slot = (label: string, target: IndexEntry | null): void => {
      if (!target) {
        nav.createDiv({ cls: 'bm-pn bm-pn-empty' });
        return;
      }
      const item = nav.createDiv({ cls: 'bm-pn' });
      item.createDiv({ cls: 'bm-pn-label', text: label });
      item.createDiv({ cls: 'bm-pn-title', text: target.title });
      item.addEventListener('click', () => void this.plugin.openReaderView(target.path));
    };
    slot('← 上一篇', prev);
    slot('下一篇 →', next);
  }

  /* ── 相关阅读（主题网）── */
  /**
   * 相关阅读 —— 按 tag 重叠打分取 top3，**允许跨分类**聚合。
   * 这正是它区别于上下篇的价值：上下篇是时间流，相关阅读是主题网（同一主题常散落在不同分类里）。
   * 范围同样是博客目录；本文章无标签、或与他文无重叠时，只是不渲染这一块，不影响上下篇。
   */
  private renderRelated(container: HTMLElement): void {
    const all = this.buildIndex();
    const cur = all.find((a) => a.path === this._path);
    if (!cur) return;
    const curTags = new Set(cur.tags);
    if (curTags.size === 0) return;
    const scored = all
      .filter((a) => a.path !== cur.path)
      .map((a) => ({ a, overlap: a.tags.filter((t) => curTags.has(t)).length }))
      .filter((s) => s.overlap > 0)
      .sort((x, y) => y.overlap - x.overlap)
      .slice(0, 3);
    if (!scored.length) return;
    const sec = container.createDiv({ cls: 'bm-related' });
    sec.createDiv({ cls: 'bm-related-title', text: '相关阅读' });
    for (const s of scored) {
      const link = sec.createDiv({ cls: 'bm-related-link', text: s.a.title });
      link.addEventListener('click', () => void this.plugin.openReaderView(s.a.path));
    }
  }

  /**
   * 读取文章 frontmatter —— 阅读器内部唯一的元信息入口（详情页与 vault 索引共用同一份数据）
   *
   * 【键名约定：通用键优先】元信息一律先读 Obsidian Properties / Hugo / Jekyll 通行的通用键，
   * `bamboo-*` 只作为**同语义别名**排在后面兜底（博客模块/bamboo-publisher 写的存量文章照样能读）：
   *   · 标题 title（→ 文件名）
   *   · 日期 date / published / created（→ 文件 mtime，与左侧列表显示的是同一个值）
   *   · 作者 author / authors（→ 博客模块 profile.nickname，仍为空则不显示作者）
   *   · 标签 tags / tag（字符串或数组，逗号/空白分隔都认）
   * 这是「面向用户」的取舍：别人不必学我们的私有字段名，写通用键就能用；我们自己的存量字段也不用迁移。
   *
   * 【已废弃的私有约定】曾按 `bamboo-slug`（`分类/YYYY-MM-DD-标题`）抽日期、按所在目录名派生分类：
   * 前者是发布器的内部命名，用户没义务适配，且 slug 里的日期是「发布日」，文章被编辑后会与列表次序脱节；
   * 后者（分类维度）已整体移除，列表与详情页都不再展示。
   *
   * 【为什么必须以 metadataCache 为主源】索引原先是正则解析（parseFrontmatter）的结果，但那只是对
   * 「传入的 raw」做正则解析，而索引这条路径根本没有 raw（也不可能为建索引去读全库文件）：
   * frontmatter 块恒为空 → 索引里 tags 恒空 →「相关阅读」按 tag 重叠打分永远是 0，该区块永不出现。
   * Obsidian 的 metadataCache 在启动时已把全库 frontmatter 解析完并常驻内存，读取同步零 IO，
   * 正好解开「索引要真数据」与「不能为索引读全库文件」这对矛盾（多行 YAML 列表也被正确解析成数组）。
   * raw 传入时（详情页）用正则结果补充，覆盖 cache 尚未索引到的新建/刚改文件的空窗。
   *
   * 注意：这里解析出的 date 只喂给详情页的元信息展示，**不参与导航排序**；
   * 上下篇的次序一律用文件 mtime（见 IndexEntry.mtime）。
   */
  private readFrontmatter(file: TFile, raw?: string): FrontmatterInfo {
    const fm: Record<string, unknown> | undefined = this.app.metadataCache.getFileCache(file)?.frontmatter;
    const fb = this.parseFrontmatter(raw);
    const str = (key: string): string => {
      const v = fm ? fm[key] : undefined;
      if (typeof v === 'string') return v.trim();
      if (v instanceof Date && !Number.isNaN(v.getTime())) return formatYmd(v);
      // `authors: [A, B]` 这类数组只取首位：元信息行是单行，多作者并排会挤爆版面
      if (Array.isArray(v)) {
        const hit = v.find((it) => typeof it === 'string' && it.trim());
        if (typeof hit === 'string') return hit.trim();
      }
      return '';
    };
    const first = (...keys: string[]): string => {
      for (const k of keys) { const v = str(k); if (v) return v; }
      return '';
    };
    // 空串/空数组不算有效值：`tags: ""` 时还要能落到别名键上
    const rawTags = [fm ? fm['tags'] : undefined, fm ? fm['tag'] : undefined, fm ? fm['bamboo-tags'] : undefined]
      .find((v) => normalizeTags(v).length > 0);
    const tags = normalizeTags(rawTags);
    for (const t of fb.tags) if (!tags.includes(t)) tags.push(t);
    return {
      title: first('title') || fb.title || file.basename,
      // 三级：通用键 → 正则兜底（cache 尚未索引到的新建/刚改文件）→ 文件 mtime
      // （末级必须与左侧列表同源，列表卡片上的日期就是 mtime，两处不一致用户一眼能看出）
      date: first('date', 'published', 'created', 'bamboo-date').slice(0, 10)
        || fb.date
        || formatYmd(new Date(file.stat.mtime)),
      author: first('author', 'authors', 'bamboo-author') || fb.author || this.blogAuthor(),
      tags,
    };
  }

  /**
   * 博客作者名 —— 取自博客模块自己的 `profile.nickname`（模块设置里的「昵称」）。
   *
   * 【为什么不写死】这是要给别人用的插件：兜底值若写成某个固定笔名，任何没写 author 的文章都会被错误署名。
   * 博客模块本来就有一个「昵称」配置位，那才是作者名该待的地方 —— 用户填一次全站生效，没填就干脆不显示作者。
   */
  private blogAuthor(): string {
    const data = this.plugin.settings?.moduleData?.[BLOG_MODULE_ID];
    const profile = data ? data['profile'] : undefined;
    if (!profile || typeof profile !== 'object') return '';
    const nick = (profile as Record<string, unknown>)['nickname'];
    return typeof nick === 'string' ? nick.trim() : '';
  }

  /**
   * 博客文章根目录 —— 阅读视图的文件范围由博客模块的 rootFolder 决定，不用全库。
   *
   * 【为什么必须限定目录】阅读视图的入口是博客模块（module:listFiles { folder, recursive } 列出
   * 指定目录下的文章），所以「上/下篇」「相关阅读」的候选集也必须落在同一目录内。若按全库建索引，
   * vault 里的 Excalidraw 画板、日记、其他插件生成的 md 都会被算进来（它们往往共享通用 tag），
   * 相关阅读会冒出一堆与文章无关的条目。rootFolder 读不到时（模块未装/未配置）退化为
   * 「当前文章所在目录」，宁可范围保守，也不放大到全库。
   */
  private blogRootFolder(): string {
    const data = this.plugin.settings?.moduleData?.[BLOG_MODULE_ID];
    const raw = data && typeof data['rootFolder'] === 'string' ? data['rootFolder'].trim() : '';
    return raw ? normalizePath(raw).replace(/^\/+|\/+$/g, '') : '';
  }

  /** 该文件是否在博客范围内（root 为空时退化到「当前文章所在目录」） */
  private inBlogScope(path: string, root: string): boolean {
    return root ? path === root || path.startsWith(root + '/') : dirOfPath(path) === dirOfPath(this._path);
  }

  /**
   * 轻量构建博客目录内的文章索引（元信息取自 metadataCache，同步零 IO，不为建索引读文件）。
   * _indexRoot 记的是「本次索引实际生效的范围键」—— 有 rootFolder 就记它，没有则记当前文章所在目录；
   * 这样模块改目录、或未配置时切到别的目录，都能在下次渲染自动重建（无需重启）。
   */
  private buildIndex(): IndexEntry[] {
    const root = this.blogRootFolder();
    const scope = root || dirOfPath(this._path);
    if (this._index && this._indexRoot === scope) return this._index;
    const files = (this.app.vault.getMarkdownFiles() || []).filter((f) => this.inBlogScope(f.path, root));
    this._index = files.map((f) => {
      const fm = this.readFrontmatter(f);
      return {
        path: f.path,
        title: fm.title,
        mtime: f.stat.mtime,
        tags: fm.tags,
      };
    });
    this._indexRoot = scope;
    return this._index;
  }

  private parseArticle(raw: string, file: TFile): ArticleMeta {
    const fm = this.readFrontmatter(file, raw);
    const words = countWords(stripFrontmatter(raw));
    return {
      title: fm.title,
      date: fm.date,
      // author 已由 readFrontmatter 走完「通用键 → 正则 → profile.nickname」三级兜底；此处再兜底就只能是编造的笔名
      author: fm.author,
      words,
      reading: estimateReadingTime(words),
    };
  }

  /** 简易 frontmatter 解析（正则兜底：metadataCache 尚未就绪时用，见 readFrontmatter）。键名约定同 readFrontmatter：通用键优先。 */
  private parseFrontmatter(raw?: string): FrontmatterInfo {
    let block = '';
    if (raw !== undefined) {
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
      if (m) block = m[1];
    }
    // 键名锚定行首：否则 `subtitle:` 会被 `title\s*:` 命中、`updated_date:` 会被 `date\s*:` 命中
    const get = (k: string) => {
      const mm = block.match(new RegExp('^[ \\t]*' + k + '[ \\t]*:[ \\t]*(.+)$', 'm'));
      // 去引号后必须再 trim 一次：`title: "……的 "` 的尾空格在引号**里面**，只做外层 trim 会留下它，
      // 而 metadataCache 路径（readFrontmatter 的 str()）拿到的是 YAML 解出的字符串并 trim 过 ——
      // 同一篇文章在「cache 就绪 / 未就绪」两条路径上就会给出不同的值。与 `tags: ""` 是同一类坑。
      return mm ? mm[1].trim().replace(/^['"]|['"]$/g, '').trim() : '';
    };
    // tags 三种写法都要认：inline 数组 `tags: [a, b]`、标量 `tags: a, b`、多行列表（下文 `- a`）
    let tags: string[] = [];
    const inline = block.match(/^[ \t]*(?:bamboo-)?tags?[ \t]*:[ \t]*\[([^\]]*)\][ \t]*$/m);
    if (inline) {
      tags = normalizeTags(inline[1]);
    } else {
      const scalar = block.match(/^[ \t]*(?:bamboo-)?tags?[ \t]*:[ \t]*(.+)$/m);
      if (scalar && !/^\s*\[/.test(scalar[1])) {
        tags = normalizeTags(scalar[1]);
      } else {
        const lines = block.split(/\r?\n/);
        const start = lines.findIndex((l) => /^[ \t]*(?:bamboo-)?tags?[ \t]*:/.test(l));
        for (let i = start + 1; start >= 0 && i < lines.length; i += 1) {
          const m = lines[i].match(/^[ \t]*-[ \t]*(.+)$/);
          if (!m) break;                       // 多行列表结束
          for (const t of normalizeTags(m[1])) if (!tags.includes(t)) tags.push(t);
        }
      }
    }
    // `authors: [A, B]` 这类数组写法只取首位，与 readFrontmatter 里 str() 对数组的处理保持一致
    const listFirst = (v: string): string => v.replace(/^\[|\]$/g, '').split(/[,，、]/)[0].trim();
    return {
      title: get('title'),
      // 通用键优先、bamboo-* 作别名；**不解析 bamboo-slug**（发布器内部命名，且里面的发布日与列表显示日会脱节）
      date: (get('date') || get('published') || get('created') || get('bamboo-date')).slice(0, 10),
      author: get('author') || listFirst(get('authors')) || get('bamboo-author'),
      tags,
    };
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
      for (let i = 0; i < lines.length; i++) {
        const sp = code.createSpan({ cls: 'bm-line' });
        lines[i].forEach((n) => sp.appendChild(n));
        code.appendChild(sp);
        if (i < lines.length - 1) code.appendText('\n');
      }
    }
  }

  private showLightbox(src: string, alt: string): void {
    const mask = this.containerEl.createDiv({ cls: 'bm-mask' });
    mask.createEl('img', { cls: 'bm-lightbox-img', attr: { src, alt } });
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
