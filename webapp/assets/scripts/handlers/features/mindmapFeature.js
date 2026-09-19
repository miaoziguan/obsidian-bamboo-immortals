import { TypewriterStore } from '../../services/TypewriterStore.js';
import { MindmapDoc } from './mindmapDoc.js';
import { MindmapLayout } from './mindmapLayout.js';
import { MindmapExport } from './mindmapExport.js';
import { LinkLayer } from '../../services/LinkLayer.js';
// 文本输入来源判定（Shadow DOM 安全）：见 utils/domRef 的 isFromTextEntry 注释
import { isFromTextEntry } from '../../utils/domRef.js';
// 撤销/重做栈（快照式；导图这份文档独享一份历史）
import { UndoStack } from '../../services/undoStack.js';

/**
 * mindmapFeature — 思维子弹（**独立文档**：子弹自由拖动 + 子弹之间自由连线）
 *
 * 数据边界（用户选定的方案 B）：
 *   - 便签：卡片/位置/尺寸/旋转/连线/平移，全在 TypewriterStore 的便签那套 key 里；
 *   - 子弹：nodes:{id,text,x,y} + links:{from,to} + 自己的一份视野平移，只在 KEY_MINDMAP 里。
 *   两边各自增删改、互不可见；唯一的一次性往来是用户主动点「沿便签连线生成子弹」。
 *
 * 模型（默认自由拖拽；用户可主动点第三个机身键做「一键自动布局」，是可选动作而非强制）：
 *   - **位置即数据**：每颗子弹有 x/y，拖动就改数据、落盘；一键布局只是用户主动触发的坐标重排；
 *   - **连线即关系**：任意两颗之间可拉一条线（多对多、无父子、无根），一键删除。
 * 因此旧版的「树 / 层级 / 钉住 / 改父」整套都删了 —— 那是传统导图的的逻辑，不是这个模式要的。
 *
 * 交互（都做在节点与空白上，不占用机身控件）：
 *   双击空白        归位/适配全部子弹到视口中心（与便签模式双击空白一致）
 *   Shift+双击空白  在落点新建一颗子弹（保留鼠标新建入口）
 *   双击子弹 / F2   编辑文本（Enter 提交、Shift+Enter 换行、Esc 取消）
 *   拖动子弹        自由移动（落盘坐标）
 *   拖动右端圆点    拉出连线（落到另一颗上即成线；落到空白取消）
 *   单击连线        选中（Delete 删除）；Esc 取消
 *   Enter           在选中子弹旁新建一颗（不连线）；Tab 新建一颗并连上（接轨最常用）
 *   Delete          删除选中子弹（连带其所有连线）或选中连线
 *   F 居中 / 拖动空白平移 / Esc 取消选中
 *   第三个机身键   一键自动布局（树状 ↓ / 横向 → / 放射 ◎ 循环；主动触发才重排，不改变自由拖拽模型）
 */
// 子弹样式：6 种，由导图模式下第一个机身按钮循环切换；索引存进导图文档（与便签零耦合）
const MM_STYLE_NAMES = ['经典', '方角', '终端', '胶囊点', '草图', '玻璃'];
const MM_STYLE_COUNT = MM_STYLE_NAMES.length;

export const MindmapFeature = {
  NODE_MAX_W: 220,          // 子弹最大宽度（px，超长文本换行）
  NODE_CAP: 500,            // 子弹数量软上限：防无限新建把 O(N)/O(L) 问题放大到卡顿
  // 每颗子弹可单独着色：'' = 默认（随主题）；其余为任意 CSS 颜色值
  MM_COLORS: ['', '#e6b450', '#5ec8a0', '#5b9bff', '#ef8a9c', '#b58cff', '#8fd0e8'],
  SAVE_DEBOUNCE: 400,

  // ── 状态归属（D3 定界）──
  // 思维子弹模式是一个「独立文档子系统」：其文档状态（_nodes/_links/_view/_sel*/_style/_groupId）
  // 刻意不并入便签的 NotesState，而是自持于本单例。原因：
  //   ① 它经 ctx 边界对齐宿主，但只取 ctx.ctrl 的宿主行为（_refreshScreenMeta / getSeedSource / _showScreenMsg），
  //      自身数据真源即此处，不依赖 NotesState；
  //   ② 导出/布局这类纯逻辑又进一步抽离到独立纯模块 MindmapLayout / MindmapExport（见 D2），
  //      本文件只持有「状态 + DOM + 交互」。
  // 因此「模块接收 state」解耦在导图侧表现为：边界用 ctx（仅收 ctrl），内部文档状态自治。
  _active: false,
  _groupId: null,          // 当前思维导图组 id（对应 typewriter:mindmap-index.current）
  _nodes: [],
  _links: [],
  _view: null,
  style: 0,                // 子弹样式索引（0..5）：导图模式下第一个机身按钮循环切换
  _selId: null,
  _selLinkIdx: null,
  _els: null,               // Map<id, el>
  _selSet: null,            // 框选多选集合：Set<id>（思维子弹模式框选删除用）
  _marquee: null,           // 框选矩形 DOM
  _marqueeRect: null,       // 框选矩形几何（画布局部 px）
  _editId: null,
  _undoStack: null,         // 撤销/重做栈（仅导图文档；便签那份在 TypewriterFeature）
  _ctrl: null,              // 宿主（便签功能实例），经 ctx.ctrl 注入，用于提示条与种子数据
  _layoutIdx: 0,            // 当前自动布局模式索引（循环用）
  LAYOUT_MODES: [           // 一键自动布局的可用模式（循环顺序）
    { id: 'tree', label: '树状 ↓' },
    { id: 'horizontal', label: '横向 →' },
    { id: 'radial', label: '放射 ◎' },
  ],

  // ===== 生命周期 =====

  /** 在宿主 wrap 内建层（默认隐藏），并绑定一次全局监听 */
  mount(ctx, wrapEl) {
    if (this._el) return;
    const { ctrl } = ctx;
    this._ctrl = ctrl || null;
    const layer = document.createElement('div');
    layer.className = 'tw-mm';
    layer.setAttribute('role', 'region');
    layer.setAttribute('aria-label', '思维子弹画布');
    layer.hidden = true;
    layer.innerHTML = `
      <div class="tw-mm-canvas">
        <svg class="tw-links" aria-hidden="true"></svg>
        <div class="tw-mm-nodes"></div>
      </div>
      <div class="tw-mm-empty" hidden>
        <p class="tw-mm-empty-title">思维子弹还是空的</p>
        <p class="tw-mm-empty-sub">输入文字按回车打印子弹 · Shift+双击空白落点新建<br>拖节点自由移动 · 拖右侧圆点（或按住 Shift/Alt 拖节点）连线<br>Shift+空白拖拽框选 · Delete 删除选中</p>
        <button type="button" class="tw-mm-seed" hidden>沿便签连线生成子弹（一次性）</button>
        <p class="tw-mm-empty-note" hidden>只会读一次便签的连线来搭骨架，之后两边互不影响</p>
      </div>`;
    // 【必须插在机身之前】wrap 是列向 flex：画布(flex:1) → 机身(flex:none) → [导图层]。
    // 若把导图层 append 在机身后，隐藏画布后顺序就变成「机身 → 导图层」，机身会被顶到顶部。
    const beeper = wrapEl.querySelector('.tw-beeper');
    if (beeper) wrapEl.insertBefore(layer, beeper);
    else wrapEl.appendChild(layer);
    this._el = layer;
    this._canvas = layer.querySelector('.tw-mm-canvas');
    this._svg = null;
    // 连线层（与便签模式共用 LinkLayer：同一套渲染/拖拽连接/悬浮控件）
    this._linkLayer = new LinkLayer({
      container: this._canvas,
      nodeSelector: '.tw-mm-node',
      getNodeMap: () => this._els,
      getLinks: () => this._links,
      setLinks: (a) => { this._links = a; },
      addLink: (f, t) => {
        const next = MindmapDoc.addLink(this._nodes, this._links, f, t);
        if (!next) return false;
        this._mutate(() => { this._links = next; });   // 连线可撤销（B1）
        return true;
      },
      removeLink: (f, t) => { let r; this._mutate(() => { r = MindmapDoc.removeLink(this._links, f, t); this._links = r; }); },  // 删线可撤销（B1）
      removeLinksOf: (id) => { this._links = this._links.filter((l) => l.from !== id && l.to !== id); },
      onChange: () => this._scheduleSave(),
      anchorClass: 'tw-link-anchor',
      toast: (m) => this._msg(m),
    });
    this._nodeBox = layer.querySelector('.tw-mm-nodes');
    this._empty = layer.querySelector('.tw-mm-empty');
    this._els = new Map();
    this._initToolbar(layer);
    this._initSearch(layer);
    this._initUndo();
    this._bindLayer();
  },

  /** 选中浮动工具条：图标按钮 + 一级内联色盘（6 色圆点直接在条内，无需弹窗） */
  _initToolbar(layer) {
    const tb = document.createElement('div');
    tb.className = 'tw-mm-toolbar';
    tb.hidden = true;

    // 图标按钮行：复制 + 删除（连线用节点右侧锚点、编辑双击节点，均不重复放）
    const acts = [
      { act: 'dup',  icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>', title: '复制' },
      { act: 'del',  icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>', title: '删除子弹' },
    ];
    acts.forEach(({ act, icon, title }) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.act = act;
      b.title = title;
      b.innerHTML = icon;
      b.className = 'tw-mm-tb-btn';
      tb.appendChild(b);
    });

    // 分隔线
    const sep = document.createElement('span');
    sep.className = 'tw-mm-tb-sep';
    tb.appendChild(sep);

    // 一级内联色盘：6 色圆点直接排列在工具条内，点击即改色（无需弹窗）
    this.MM_COLORS.forEach((c) => {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'tw-mm-swatch';
      s.dataset.color = c;
      s.title = c ? '着色' : '默认色';
      if (c) s.style.background = c;
      tb.appendChild(s);
    });

    layer.appendChild(tb);
    this._toolbar = tb;

    // 工具条上的交互不冒泡到画布（否则会触发平移 / 误触）
    tb.addEventListener('pointerdown', (e) => e.stopPropagation());
    tb.addEventListener('click', (e) => {
      // 色块点击
      const swatch = e.target.closest('.tw-mm-swatch');
      if (swatch) { e.stopPropagation(); this._setColorForSelection(swatch.dataset.color); return; }
      // 图标按钮点击
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'dup') this._duplicateSel();
      else if (act === 'del') this._deleteSel();
    });
  },

  /** 搜索框（Cmd/Ctrl+F 唤起：匹配子弹文本、回车跳转居中、高亮命中） */
  _initSearch(layer) {
    const sb = document.createElement('div');
    sb.className = 'tw-mm-search';
    sb.hidden = true;
    sb.innerHTML = `
      <input type="text" class="tw-mm-search-input" placeholder="搜索子弹…" />
      <span class="tw-mm-search-count"></span>
      <button type="button" class="tw-mm-search-prev" title="上一个">上</button>
      <button type="button" class="tw-mm-search-next" title="下一个">下</button>
      <button type="button" class="tw-mm-search-close" title="关闭">关</button>`;
    layer.appendChild(sb);
    this._searchBox = sb;
    this._searchInput = sb.querySelector('.tw-mm-search-input');
    this._searchCount = sb.querySelector('.tw-mm-search-count');
    sb.addEventListener('pointerdown', (e) => e.stopPropagation());
    this._searchInput.addEventListener('input', () => this._runSearch(this._searchInput.value));
    this._searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this._searchStep(e.shiftKey ? -1 : 1); }
      else if (e.key === 'Escape') { e.preventDefault(); this._closeSearch(); }
    });
    sb.querySelector('.tw-mm-search-prev').addEventListener('click', () => this._searchStep(-1));
    sb.querySelector('.tw-mm-search-next').addEventListener('click', () => this._searchStep(1));
    sb.querySelector('.tw-mm-search-close').addEventListener('click', () => this._closeSearch());
  },

  async activate() {
    if (!this._el) return;
    this._active = true;
    this._el.hidden = false;
    const idx = await TypewriterStore.ensureMindmapIndex();
    this._groupId = (idx.current && idx.groups[idx.current]) ? idx.current
      : (Object.keys(idx.groups)[0] || 'default');
    await this.load();
    this.render();
    this._applyStyleClass();
  },

  /** 离开子弹：落盘（节点 + 连线 + 视野），隐藏层 */
  deactivate() {
    if (!this._el) return;
    this._active = false;
    this._commitEdit(true);
    this._selId = null;
    this._selLinkIdx = null;
    this._linkFrom = null;
    this._el.hidden = true;
    this._saveNow();
  },

  // ===== 数据 =====

  async load() {
    const id = this._groupId || 'default';
    const doc = await TypewriterStore.loadMindmapGroupDoc(id);
    let nodes = doc.nodes || [];
    let links = doc.links || [];
    // v1 遗留（父子树）→ 自由子弹 + 连线：一次性迁移并立即落盘，之后全是自由模型。
    // 触发判据只看「节点是否还带着 parent 字段」——比 version 更稳：旧档可能压根没写 version，
    // 若只信 version 会把老树误判成 v2 空结构，静默丢内容。
    if (nodes.some((n) => 'parent' in n)) {
      const m = MindmapDoc.migrateFromTree(nodes);
      nodes = m.nodes;
      links = m.links;
      this._nodes = nodes;
      this._links = links;
      this._view = null;
      this._saveNow();
    }
    const norm = MindmapDoc.normalize(nodes, links);
    this._nodes = norm.nodes;
    this._links = norm.links;
    this._view = doc.view ? { x: doc.view.x, y: doc.view.y } : null;
    this._style = (((typeof doc.style === 'number') ? doc.style : 0) % MM_STYLE_COUNT + MM_STYLE_COUNT) % MM_STYLE_COUNT;
  },

  /** 防抖落盘（拖动/编辑时高频触发，只在停手后写一次） */
  _scheduleSave() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this._saveNow(), this.SAVE_DEBOUNCE);
  },

  _saveNow() {
    clearTimeout(this._saveTimer);
    this._saveTimer = 0;
    if (!this._nodes || !this._groupId) return;
    const hasView = this._view && (this._view.x || this._view.y);
    TypewriterStore.saveMindmapGroupDoc(this._groupId, {
      nodes: this._nodes, links: this._links,
      view: hasView ? this._view : null, style: this._style,
    });
  },

  /** 把当前子弹样式落到根元素 class（.tw-mm-style-0..5，CSS 据此切换 6 种视觉） */
  _applyStyleClass() {
    if (!this._el) return;
    const s = ((this._style % MM_STYLE_COUNT) + MM_STYLE_COUNT) % MM_STYLE_COUNT;
    for (let i = 0; i < MM_STYLE_COUNT; i++) this._el.classList.remove('tw-mm-style-' + i);
    this._el.classList.add('tw-mm-style-' + s);
  },

  // ===== 分组（与写作卡片组同一套交互：右上角切换 / 新建 / 改名 / 删除）=====
  /** 切换到指定组：先落盘当前组，再载入目标组并重绘 */
  async switchGroup(id) {
    if (!id || id === this._groupId) return;
    this._saveNow();
    await TypewriterStore.setMindmapCurrent(id);
    this._groupId = id;
    await this.load();
    this.render();
    this._applyStyleClass();
  },
  /** 新建空白组并切换过去 */
  async newGroup() {
    this._saveNow();
    const g = await TypewriterStore.createMindmapGroup('未命名思维导图');
    this._groupId = g.id;
    this._nodes = []; this._links = []; this._view = null; this._style = 0;
    this.render();
    this._applyStyleClass();
  },
  /** 删除一个组：落盘后清索引与文档，载入新的当前组 */
  async deleteGroup(id) {
    this._saveNow();
    const res = await TypewriterStore.deleteMindmapGroup(id);
    this._groupId = res.current;
    await this.load();
    this.render();
    this._applyStyleClass();
    return res;
  },
  /** 仅改组名（思维导图导出为快照式，不绑定笔记，故不涉及笔记改名） */
  async renameGroup(id, title) {
    await TypewriterStore.renameMindmapGroup(id, title);
  },

  /** 第一个机身按钮在导图模式下调用：循环切换子弹样式（共 MM_STYLE_COUNT 种），落盘并提示 */
  cycleStyle() {
    if (!this._active) return;
    this._style = (this._style + 1) % MM_STYLE_COUNT;
    this._applyStyleClass();
    this._scheduleSave();
    this._msg('子弹样式：' + MM_STYLE_NAMES[this._style]);
  },

  /** 供宿主查询：本层是否正在使用（决定便签的鼠标/键盘监听是否放行） */
  isActive() { return !!this._active; },

  /** 规模（回显到机身屏幕）：子弹数 + 连线数 */
  stats() { return { count: this._nodes.length, links: this._links.length }; },

  /**
   * 把当前思维子弹图导出为 Markdown：按连线结构生成大纲（from→to 视为父子），
   * 入度为 0 的子弹作根，递归缩进其子节点；环/游离节点收进「## 未连接」段。
   * 返回 { content, title }：content 为完整 .md 正文，title 为建议文件名（首颗根子弹首句）。
   */
  buildMarkdown(selIds) {
    // 逻辑已抽离到纯模块 MindmapExport.build（见 mindmapExport.js）：此处仅作公开 API 委托壳
    return MindmapExport.build(this._nodes, this._links, selIds);
  },

  /** 返回当前选中的子弹 id 数组（单选 _selId 与框选 _selSet 的并集）；无选中返回 []。 */
  getSelectedIds() {
    const ids = new Set();
    if (this._selId) ids.add(this._selId);
    if (this._selSet && this._selSet.size) this._selSet.forEach((id) => ids.add(id));
    return Array.from(ids);
  },

  /**
   * 机身输入框回车 / 点「打印」时调用：新建一颗子弹。
   * 有选中 → 落在它旁边；无选中 → 落在视野中心。不自动连线（连线是显式动作）。
   * 返回是否真的建了（宿主据此决定要不要清空输入框）。
   */
  addNodeFromInput(text) {
    const t = (text || '').trim();
    if (!t) return false;
    if (this._nodes.length >= this.NODE_CAP) {
      this._msg('子弹已达上限（' + this.NODE_CAP + '），先清理或删一些再新建');
      return false;
    }
    let anchor = { x: 0, y: 0 };
    if (this._selId) {
      const el = this._els.get(this._selId);
      if (el) anchor = { x: parseFloat(el.style.left) || 0, y: parseFloat(el.style.top) || 0 };
    } else if (this._view && this._canvas) {
      anchor = {
        x: -this._view.x + (this._canvas.clientWidth || 600) / 2,
        y: -this._view.y + (this._canvas.clientHeight || 400) / 2,
      };
    }
    const spot = MindmapDoc.freeSpot(this._nodes, anchor);
    _mutate(() => { this._nodes = MindmapDoc.addNode(this._nodes, t, spot.x, spot.y); });
    const id = this._nodes[this._nodes.length - 1].id;
    this._mountNode(this._nodes[this._nodes.length - 1]);  // 只挂这一颗，不重画整图
    this._refreshEmpty();
    this._scheduleSave();
    this._select(id);
    this._ensureVisible(id);
    this._spawnFrom(id);   // 从打字机口「射出」动画（与子弹音效配对）
    return true;
  },

  /** 新子弹若落在视野外，把视野平移过去 —— 否则像「点了没反应」 */
  _ensureVisible(id) {
    const el = this._els.get(id);
    if (!el || !this._view) return;
    const r = this._canvas.getBoundingClientRect();
    const cx = parseFloat(el.style.left) + el.offsetWidth / 2;
    const cy = parseFloat(el.style.top) + el.offsetHeight / 2;
    const sx = this._view.x + cx;
    const sy = this._view.y + cy;
    const M = 32;
    let dx = 0, dy = 0;
    if (sx < M) dx = M - sx; else if (sx > r.width - M) dx = (r.width - M) - sx;
    if (sy < M) dy = M - sy; else if (sy > r.height - M) dy = (r.height - M) - sy;
    if (!dx && !dy) return;
    this._view = { x: this._view.x + dx, y: this._view.y + dy };
    this._applyView();
    this._scheduleSave();
  },

  /** 让一颗子弹从打字机输入框「射出」到自己的落点（由 addNodeFromInput 调用）。
   *  关键：用 left/top 驱动位移（而非 transform），并飞行期间每帧重绘连线——
   *  因为连线端点读的是 offsetLeft/offsetTop（不吃 CSS transform），若用 transform 飞入，
   *  线会「已钉在落点、球却从输入框滑过来」，看起来就像一颗挂在连线上的小球飞进画面。
   *  用 left/top 飞入 + 连线跟随，则线头跟着子弹走，射出感自然且不割裂。 */
  _spawnFrom(id) {
    const el = this._els.get(id);
    if (!el) return;
    const input = document.getElementById('twInput');
    if (!input) return;
    const ir = input.getBoundingClientRect();
    const r = this._canvas.getBoundingClientRect();
    const landX = parseFloat(el.style.left || '0');
    const landY = parseFloat(el.style.top || '0');
    // 起点取打字机口中心；若输入框不可见（rect 全 0，例如被隐藏）则回退到落点本身，
    // 避免起点变成 (0,0) 导致子弹从画布左上角飞入。
    const fromX = ir.width ? ir.left + ir.width / 2 : r.left + landX;
    const fromY = ir.height ? ir.top + ir.height / 2 : r.top + landY;
    const startX = fromX - r.left;   // 转成画布局部坐标，与 left/top 同坐标系
    const startY = fromY - r.top;
    const dx = startX - landX, dy = startY - landY;
    if (!dx && !dy) return;          // 起点≈落点，无需动画
    el.style.transition = 'none';
    el.style.left = Math.round(startX) + 'px';
    el.style.top = Math.round(startY) + 'px';
    el.style.transform = 'scale(0.5)';   // 射出时「由小长大」的弹出感
    el.style.opacity = '0';
    void el.offsetWidth;             // 强制回流，让初始态生效
    el.style.transition = 'left .45s cubic-bezier(.22,.9,.3,1), top .45s cubic-bezier(.22,.9,.3,1), opacity .28s ease, transform .45s cubic-bezier(.22,.9,.3,1)';
    el.style.left = Math.round(landX) + 'px';
    el.style.top = Math.round(landY) + 'px';
    el.style.transform = 'scale(1)';
    el.style.opacity = '1';
    // 飞行期间每帧重绘连线，使线头跟住飞入的子弹（left/top 会被 offsetLeft/offsetTop 读到）
    let raf = 0;
    const tick = () => { this._linkLayer.render(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    let cleaned = false;
    const done = (e) => {
      if (cleaned) return;
      if (e && e.propertyName && e.propertyName !== 'left' && e.propertyName !== 'top') return;
      cleaned = true;
      if (raf) cancelAnimationFrame(raf);
      el.style.transition = '';
      el.style.opacity = '';
      el.style.transform = '';      // 复位弹出缩放，回到正常态（本版本节点旋转不存于 transform，清空安全）
      // 注意：left/top 保留为落点（即数据坐标），不可清空，否则节点会跳回起点
      el.removeEventListener('transitionend', done);
      this._linkLayer.render();
    };
    el.addEventListener('transitionend', done);
    setTimeout(done, 700);           // 兜底：动画异常未触发 transitionend 时清理内联样式
  },

  // ===== 渲染 =====

  /** 仅挂载/注册一颗子弹的 DOM（增量新增用）：建元素、挂锚点、落位、画文本。已存在则跳过。 */
  _mountNode(n) {
    let el = this._els.get(n.id);
    if (el) return el;
    el = this._createNodeEl(n);
    this._els.set(n.id, el);
    this._nodeBox.appendChild(el);
    this._linkLayer.makeLinkable(el);
    this._placeNode(n.id);
    this._paintNode(el, n);
    return el;
  },

  /** 按数据坐标落位一颗子弹（位置即数据） */
  _placeNode(id) {
    const n = this._nodes.find((x) => x.id === id);
    const el = this._els.get(id);
    if (!n || !el) return;
    el.style.left = Math.round(n.x) + 'px';
    el.style.top = Math.round(n.y) + 'px';
  },

  /** 从 DOM 移除一颗子弹（增量删除用） */
  _unmountNode(id) {
    const el = this._els.get(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    this._els.delete(id);
  },

  /** 同步空态显隐（增量增删后调用，避免每步都跑全量 render） */
  _refreshEmpty() {
    if (!this._empty) return;
    const empty = this._nodes.length === 0;
    this._empty.hidden = !empty;
    if (empty) this._syncSeedButton();
  },

  /** 全量渲染：同步节点 DOM → 按存储坐标落位 → 画连线。
   *  单节点增删请走 _mountNode/_unmountNode（增量），render() 留给加载/撤销/整图排版等批量场景。 */
  render() {
    if (!this._el || !this._active) return;
    // 1) 增删节点元素（复用 _mountNode；已存在者刷新文本与落位）
    const alive = new Set();
    this._nodes.forEach((n) => {
      alive.add(n.id);
      const el = this._els.get(n.id);
      if (!el) { this._mountNode(n); }
      else { this._paintNode(el, n); this._placeNode(n.id); }
    });
    Array.from(this._els.keys()).forEach((id) => {
      if (!alive.has(id)) this._unmountNode(id);
    });

    // 2) 空态（含一次性种子入口）
    this._refreshEmpty();

    // 3) 视野：首次（无存档视野）自动居中到所有子弹
    const vw = this._canvas.clientWidth || 0;
    const vh = this._canvas.clientHeight || 0;
    if (!this._view && this._nodes.length) {
      const bb = this._bounds();
      this._view = {
        x: Math.round(vw / 2 - (bb.minX + bb.maxX) / 2),
        y: Math.round(vh / 2 - (bb.minY + bb.maxY) / 2),
      };
    }
    if (!this._view) this._view = { x: 0, y: 0 };
    this._applyView();

    this._linkLayer.render();
    this._paintSelection();
    this._updateToolbar();
    if (this._ctrl && typeof this._ctrl._refreshScreenMeta === 'function') this._ctrl._refreshScreenMeta();
  },

  /** 增量刷新：只重画指定的若干颗子弹，再重画连线 / 选中态 / 工具条。
   *  用于「只有少数节点变了」的场景（拖动结束、退出编辑、落点连线），
   *  【性能】避免整图 O(N) 的 _paintNode + _placeNode —— NODE_CAP=500 时差异明显。
   *  整图结构变化（增删节点 / 切组 / 撤销 / 自动布局）仍走 render()。 */
  renderNodes(ids) {
    if (!this._el || !this._active) return;
    const list = Array.isArray(ids) ? ids : [ids];
    list.forEach((id) => {
      const el = this._els.get(id);
      if (!el) return;
      const n = this._nodes.find((x) => x.id === id);
      if (!n) return;
      this._paintNode(el, n);
      this._placeNode(id);
    });
    this._linkLayer.render();
    this._paintSelection();
    this._updateToolbar();
    if (this._ctrl && typeof this._ctrl._refreshScreenMeta === 'function') this._ctrl._refreshScreenMeta();
  },

  _applyView() {
    if (!this._canvas || !this._view) return;
    this._canvas.style.transform = `translate(${this._view.x}px, ${this._view.y}px)`;
    this._updateToolbar();    // 平移时让工具条跟着选中节点走
  },

  _createNodeEl(n) {
    const el = document.createElement('div');
    el.className = 'tw-mm-node';
    el.dataset.id = n.id;
    el.innerHTML = `
      <span class="tw-mm-text"></span>`;
    el.title = '拖动=移动；拖右侧连线按钮=连线；双击=编辑';
    el._text = el.querySelector('.tw-mm-text');
    return el;
  },

  /** 把数据画到元素上（文本 + 占位提示）；层级配色已交给 CSS 子弹框，这里不画层级 */
  _paintNode(el, n) {
    if (!el._text) return;
    if (this._editId !== n.id) {
      el._text.textContent = n.text || '双击输入';
      el._text.classList.toggle('is-placeholder', !n.text);
    }
    el.style.maxWidth = this.NODE_MAX_W + 'px';
    if (n.color) el.style.setProperty('--mm-accent', n.color);
    else el.style.removeProperty('--mm-accent');
  },

  _paintSelection() {
    // 只在实际状态变化时才写 DOM（平时选中切换是 O(N) 遍历，但几乎零写操作，远轻于全量渲染）
    this._els.forEach((el, id) => {
      const sel = id === this._selId;
      if (el.classList.contains('is-sel') !== sel) el.classList.toggle('is-sel', sel);
      const a = sel ? 'true' : 'false';
      if (el.getAttribute('aria-selected') !== a) el.setAttribute('aria-selected', a);
    });
  },

  /** 当前所有子弹的包围盒（用估算尺寸兜底，DOM 未就绪时也能用） */
  _bounds() {
    if (!this._nodes.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this._nodes.forEach((n) => {
      const el = this._els.get(n.id);
      const w = (el && el.offsetWidth) || MindmapDoc.EST_W;
      const h = (el && el.offsetHeight) || MindmapDoc.EST_H;
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x + w);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y + h);
    });
    return { minX, minY, maxX, maxY };
  },





  // ===== 指针交互：移动 / 连线 / 平移 =====

  _bindLayer() {
    const layer = this._el;
    // 原生 dblclick 兜底：pointerdown 上的 preventDefault 通常会抑制它，但慢速双击（越过手动判定阈值）仍能触发；
    // _handleDoubleTap 已有 350ms 节流，与手动判定重复触发时只执行一次。
    layer.addEventListener('dblclick', (e) => { this._handleDoubleTap(e); });
    layer.addEventListener('click', (e) => {
      if (e.target.closest('.tw-links, .tw-links-ctl')) return;   // 点击连线/控件：交给 LinkLayer 的悬浮控件
    });
    layer.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    this._keyHandler = (e) => this._onKeyDown(e);
    // 捕获阶段：先于便签的画布监听拿到键盘，避免两边同时响应
    document.addEventListener('keydown', this._keyHandler, true);
  },

  _onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('.tw-links, .tw-links-ctl')) return;   // 点连线或控件不触发平移（交给 LinkLayer）
    if (e.target.closest('button, .tw-mm-search, .tw-mm-toolbar')) return;
    // 双击检测：pointerdown 上的 preventDefault（平移/拖拽）会抑制原生 dblclick（兼容性鼠标事件），
    // 故在此手动判定。命中则走「双击」语义并直接返回，不再启动平移/拖拽。
    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const ld = this._lastDown;
    if (ld && (now - ld.t) < 450 && Math.abs(e.clientX - ld.x) < 12 && Math.abs(e.clientY - ld.y) < 12) {
      this._lastDown = null;
      this._handleDoubleTap(e);
      return;
    }
    this._lastDown = { t: now, x: e.clientX, y: e.clientY };
    const portEl = e.target.closest('.tw-link-anchor');
    const nodeEl = e.target.closest('.tw-mm-node');
    if (nodeEl && this._editId === nodeEl.dataset.id) return;   // 编辑中的节点：指针留给文本
    // 连线两种起手都行：
    //   ① 拖节点上的连线锚点（最直观）
    //   ② 按住 Shift/Alt 从节点本体拖出（锚点太小时更稳）
    // 否则纯拖节点本体 = 自由移动
    if (portEl && nodeEl) { this._linkLayer.startConnect(nodeEl, e); return; }
    if (nodeEl && (e.shiftKey || e.altKey)) { this._linkLayer.startConnect(nodeEl, e); return; }
    if (nodeEl) {
      const id = nodeEl.dataset.id;
      // 按下的节点已在框选集合内 → 整体拖动所有选中节点，不清空多选；否则按单选处理
      if (!(this._selSet && this._selSet.has(id))) this._clearMultiSel();
      this._beginMoveDrag(e, nodeEl);
      return;
    }
    if (e.shiftKey) { this._startMarquee(e); return; }   // Shift+空白拖拽 = 框选（替代平移）
    this._clearMultiSel();
    this._beginPan(e);
  },

  /** 手动双击语义（规避 pointerdown preventDefault 吞掉原生 dblclick）：
   *  双击空白=归位全部子弹到视口中心；Shift+双击空白=落点新建；双击节点=编辑。 */
  _handleDoubleTap(e) {
    const t = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    if (this._lastDoubleTap && (t - this._lastDoubleTap) < 350) return;  // 节流：手动判定与兜底原生 dblclick 可能同发，去重
    this._lastDoubleTap = t;
    if (e.target.closest('.tw-links, .tw-links-ctl')) return;   // 连线/控件双击由 LinkLayer 自己处理（删除）
    const nodeEl = e.target.closest('.tw-mm-node');
    if (nodeEl && !e.target.closest('.tw-link-anchor')) { this._enterEdit(nodeEl.dataset.id); return; }
    if (e.target.closest('.tw-link-anchor')) return;
    if (e.target.closest('button')) return;
    if (e.shiftKey) { this._createBulletAt(e.clientX, e.clientY); return; }  // Shift+双击空白：落点新建子弹
    this._centerView();   // 双击空白：归位/适配全部子弹到视口中心（与便签模式一致）
  },

  /** 拖动子弹 = 自由移动：落盘坐标，连线实时跟随。
   *  若按下的节点属于当前框选集合，则整体拖动所有选中子弹（同一位移）；否则只拖这一颗。
   *  单颗拖动时：松手若「丢」在另一颗子弹上，则建立连线（拖动的那颗弹回原位），否则正常落位。 */
  _beginMoveDrag(e, nodeEl) {
    e.preventDefault();
    const id = nodeEl.dataset.id;
    const dragSet = (this._selSet && this._selSet.has(id)) ? this._selSet : null;
    this._select(id);   // 单选高亮（不清除 _selSet，多选框仍保留）
    const x0 = e.clientX, y0 = e.clientY;
    // 记录每个被拖节点的初始坐标
    const starts = new Map();
    if (dragSet) {
      dragSet.forEach((nid) => {
        const el = this._els.get(nid);
        if (el) starts.set(nid, { el, left: parseFloat(el.style.left) || 0, top: parseFloat(el.style.top) || 0 });
      });
    } else {
      starts.set(id, { el: nodeEl, left: parseFloat(nodeEl.style.left) || 0, top: parseFloat(nodeEl.style.top) || 0 });
    }
    let moved = false;
    let dropTargetEl = null;   // 拖放连线的目标高亮
    let raf = 0;              // rAF 节流：把「连线重绘 + 命中测试」合并到每帧一次，避免 pointermove 高频抖动/回流
    let lastEv = null;
    // 单颗拖动时让被拖元素对命中测试透明，便于检测「丢在谁身上」
    if (!dragSet) nodeEl.style.pointerEvents = 'none';
    if (this._toolbar) this._toolbar.hidden = true;   // 拖拽时收起浮动工具条，落点后再出现
    const updateDropHint = (ev) => {
      if (dragSet) return;
      const under = document.elementFromPoint(ev.clientX, ev.clientY);
      const tgt = under && under.closest('.tw-mm-node');
      const tid = tgt && tgt.dataset.id;
      const next = (tid && tid !== id) ? tgt : null;
      if (next !== dropTargetEl) {
        if (dropTargetEl) dropTargetEl.classList.remove('is-drop-target');
        dropTargetEl = next;
        if (dropTargetEl) dropTargetEl.classList.add('is-drop-target');
      }
    };
    const flush = () => {        // 每帧只跑一次：重画连线（含端点几何）+ 命中测试
      raf = 0;
      this._linkLayer.render();
      if (lastEv) updateDropHint(lastEv);
    };
    const move = (ev) => {
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 3) return;
      moved = true;
      // 仅写节点位置（落到下一帧统一读），避免「写 → 读 offset → 强制回流」在同一事件里反复发生
      starts.forEach((s) => {
        s.el.classList.add('is-dragging');
        s.el.style.left = (s.left + dx) + 'px';
        s.el.style.top = (s.top + dy) + 'px';
      });
      lastEv = ev;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const up = (ev) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      if (raf) { cancelAnimationFrame(raf); raf = 0; }   // 丢弃未执行的重绘，改用下面的终态渲染
      if (dropTargetEl) { dropTargetEl.classList.remove('is-drop-target'); dropTargetEl = null; }
      if (!dragSet) nodeEl.style.pointerEvents = '';
      // 拖放连线：单颗拖动且松手落在另一颗子弹上 → 连线并弹回原位
      if (!dragSet && moved) {
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const tgt = under && under.closest('.tw-mm-node');
        const tid = tgt && tgt.dataset.id;
        if (tid && tid !== id) {
          const s0 = starts.get(id);
          if (s0) s0.el.classList.remove('is-dragging');   // B4：本分支提前 return，会漏清拖拽态类
          let added = false;
          this._mutate(() => {   // 连线 + 弹回原位 一并留档（B1）
            const next = MindmapDoc.addLink(this._nodes, this._links, id, tid);
            this._nodes = MindmapDoc.setPos(this._nodes, id, s0.left, s0.top);  // 弹回原位，避免叠在目标上
            if (next) { this._links = next; added = true; }
          });
          this._scheduleSave();
          this.renderNodes([id]);
          this._updateToolbar();
          this._msg(added ? '已连线' : '已相连');
          return;
        }
      }
      this._mutate(() => {
        starts.forEach((s, nid) => {
          s.el.classList.remove('is-dragging');
          if (moved) {
            this._nodes = MindmapDoc.setPos(this._nodes, nid,
              parseFloat(s.el.style.left) || 0, parseFloat(s.el.style.top) || 0);
          }
        });
      });
      if (moved) { this._scheduleSave(); this.renderNodes(Array.from(starts.keys())); }
      this._updateToolbar();   // 无论是否拖动都刷新：纯点击选中也要显示工具条（否则 moved=false 时工具条被拖拽前收起后再不出现）
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  },


  _clientToCanvas(clientX, clientY) {
    const r = this._canvas.getBoundingClientRect();
    // getBoundingClientRect 已含 translate(view) 变换，画布坐标 = 屏幕坐标 - 画布左上角即可；
    // 不要再减 this._view，否则平移量被算两次，Shift+双击新建会偏到别处。
    return { x: clientX - r.left, y: clientY - r.top };
  },


  /** 空白拖动 = 平移视野（与便签画布同一手感） */
  _beginPan(e) {
    if (e.target.closest('button, .tw-mm-search, .tw-mm-toolbar')) return;
    e.preventDefault();
    this._select(null);
    if (this._toolbar) this._toolbar.hidden = true;
    this._el.classList.add('is-panning');
    const x0 = e.clientX, y0 = e.clientY;
    const v0 = { x: this._view ? this._view.x : 0, y: this._view ? this._view.y : 0 };
    const move = (ev) => {
      this._view = { x: v0.x + (ev.clientX - x0), y: v0.y + (ev.clientY - y0) };
      this._applyView();
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      this._el.classList.remove('is-panning');
      this._scheduleSave();
      this._updateToolbar();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  },

  /** 在落点新建一颗子弹并进入编辑（程序化调用；双击空白已改为归位，不再走此路径） */
  _createBulletAt(clientX, clientY) {
    if (this._nodes.length >= this.NODE_CAP) {
      this._msg('子弹已达上限（' + this.NODE_CAP + '），先清理或删一些再新建');
      return;
    }
    const p = this._clientToCanvas(clientX, clientY);
    const spot = { x: p.x - MindmapDoc.EST_W / 2, y: p.y - MindmapDoc.EST_H / 2 };
    let id = null;
    this._mutate(() => {
      this._nodes = MindmapDoc.addNode(this._nodes, '', spot.x, spot.y);
      id = this._nodes[this._nodes.length - 1].id;
      this._mountNode(this._nodes[this._nodes.length - 1]);
      this._refreshEmpty();
      this._scheduleSave();
      this._select(id);
    });
    // 延迟到事件序列结束后再聚焦：Shift+双击空白走 pointerdown 的「双击检测」分支，比原生 dblclick 默认动作
    // （页面选词）更早同步 focus()，会被后者抢走焦点 → 编辑态瞬间被关掉、无法键入。延后到下一 tick 让默认动作先执行完。
    setTimeout(() => this._enterEdit(id), 0);
  },

  // ===== 选中 / 编辑 / 键盘 =====

  _select(id) {
    if (this._editId && this._editId !== id) this._commitEdit();
    // 单选新节点即取消多选；但拖动「已在多选集合内」的节点时保留整组（否则多拖退化成单拖）
    if (!(this._selSet && this._selSet.has(id))) this._clearMultiSel();
    this._selId = id || null;
    this._selLinkIdx = null;
    this._paintSelection();   // 仅切换受影响节点的高亮（见 _paintSelection 的增量判定）
    this._updateToolbar();    // 选中变化 → 刷新浮动工具条（显隐/定位）
  },


  _enterEdit(id) {
    const el = this._els.get(id);
    if (!el || !el._text) return;
    this._exitConnectMode();
    this._editId = id;
    this._select(id);
    const t = el._text;
    t.classList.remove('is-placeholder');
    const n = this._nodes.find((x) => x.id === id);
    t.textContent = n ? n.text : '';
    t.contentEditable = 'plaintext-only';
    el.classList.add('is-editing');
    this._editKey = (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); this._commitEdit(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); this._commitEdit(true); }
    };
    this._editBlur = () => this._commitEdit();
    t.addEventListener('keydown', this._editKey);
    t.addEventListener('blur', this._editBlur);
    t.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(t);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);
    } catch (_) { /* 选区失败不影响编辑 */ }
  },

  _commitEdit(cancel) {
    const id = this._editId;
    if (!id) return;
    this._editId = null;
    const el = this._els.get(id);
    if (el && el._text) {
      if (this._editKey) el._text.removeEventListener('keydown', this._editKey);
      if (this._editBlur) el._text.removeEventListener('blur', this._editBlur);
      el._text.contentEditable = 'false';
      el.classList.remove('is-editing');
      if (!cancel) {
        const text = (el._text.innerText || '').replace(/\s+$/, '');
        this._nodes = MindmapDoc.setText(this._nodes, id, text);
      }
    }
    this._editKey = null;
    this._editBlur = null;
    if (!cancel) this._scheduleSave();
    this.renderNodes([id]);
  },

  _onKeyDown(e) {
    if (!this._active) return;
    if (this._editId) return;
    // 【Shadow DOM 陷阱】本监听挂在 document（light DOM），而机身输入框在 shadow 树内。
    // 事件一旦穿越 shadow 边界，e.target 会被 retarget 成 shadow host（一个普通 div），
    // 于是 e.target.closest('input, textarea') 恒为 null —— 守卫形同虚设。
    // 表现为：在输入框里打完字按回车，除了正常建出那颗带文字的子弹，
    // 这里还会把它当成「画布上的回车」（case 'Enter' → _addNear）再补一颗**空**子弹。
    if (isFromTextEntry(e)) return;
    // Cmd/Ctrl+F：唤起子弹搜索（与便签模式的查找一致）
    if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); this._openSearch(); return; }
    // 撤销 / 重做：Cmd/Ctrl+Z、Cmd/Ctrl+Shift+Z（不要求有选中，空画布也能撤）
    if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      this._undoRedo(e.shiftKey ? 'redo' : 'undo');
      return;
    }
    const hasSel = this._selId || (this._selSet && this._selSet.size);
    if (!hasSel) {
      if (e.key === 'Escape') { this._clearMultiSel(); this._select(null); }
      return;
    }
    switch (e.key) {
      case 'Tab': e.preventDefault(); this._addNear(true); break;   // 新建并连上
      case 'Enter': e.preventDefault(); this._addNear(false); break; // 仅新建
      case 'Delete': case 'Backspace':
        e.preventDefault();
        if (this._selSet && this._selSet.size) this._deleteMulSel();   // 框选批量删
        else if (this._selId) this._deleteSel();                      // 单选删
        break;
      case 'F2': e.preventDefault(); this._enterEdit(this._selId); break;
      case 'f': case 'F': e.preventDefault(); this._centerView(); break;
      case 'Escape': e.preventDefault(); this._clearMultiSel(); this._select(null); break;
      case 'd': case 'D':
        if (e.metaKey || e.ctrlKey) { e.preventDefault(); this._duplicateSel(); }
        break;
      default: break;
    }
  },

  /** 在选中子弹旁新建一颗；withLink=true 时顺便连一条线 */
  _addNear(withLink) {
    if (this._nodes.length >= this.NODE_CAP) {
      this._msg('子弹已达上限（' + this.NODE_CAP + '），先清理或删一些再新建');
      return;
    }
    const selId = this._selId;
    const base = selId ? this._els.get(selId) : null;
    const anchor = base
      ? { x: parseFloat(base.style.left) || 0, y: parseFloat(base.style.top) || 0 }
      : (this._view && this._canvas
        ? { x: -this._view.x + this._canvas.clientWidth / 2, y: -this._view.y + this._canvas.clientHeight / 2 }
        : { x: 0, y: 0 });
    const spot = MindmapDoc.freeSpot(this._nodes, { x: anchor.x + 40, y: anchor.y + 30 });
    let id = null, linked = false;
    this._mutate(() => {
      this._nodes = MindmapDoc.addNode(this._nodes, '', spot.x, spot.y);
      id = this._nodes[this._nodes.length - 1].id;
      this._mountNode(this._nodes[this._nodes.length - 1]);
      this._refreshEmpty();
      if (withLink && selId) {
        const next = MindmapDoc.addLink(this._nodes, this._links, selId, id);
        if (next) { this._links = next; linked = true; }
      }
      this._scheduleSave();
      this._select(id);
    });
    if (linked) this._linkLayer.render();   // 只有新增了连线才需要重画连线
    setTimeout(() => this._enterEdit(id), 0);   // 延后聚焦，避免同步 focus 被后续默认动作抢走
  },

  // ===== 撤销 / 重做（快照式，与便签模式同一机制，见 services/undoStack.js） =====

  /** 建立撤销栈。导图是独立文档（nodes / links / view），历史与便签互不共享。 */
  _initUndo() {
    this._undoStack = new UndoStack({
      capture: () => this._snapshot(),
      restore: (s) => this._restoreSnapshot(s),
      onChange: () => this._scheduleSave(),
    });
  },

  /** 采集当前状态：子弹 + 连线 + 视野（未激活时返回 null，本次不入栈）
   *  nodes / links / view 全部浅克隆：快照与当前实时状态彻底解耦，撤销正确性不再依赖
   *  「MindmapDoc 必须全不可变」这一隐藏不变量 —— 即便将来有人在别处对 this._nodes[i]
   *  做原地修改，旧快照也不会被连带改坏，Cmd+Z 恢复出的永远是当时那一刻的完整状态。
   *  （成本：单次捕获 O(N) 个节点克隆；但 capture 只在「新增/删除/编辑提交/移动结束/连线」
   *  等离散用户动作时触发，绝不进入 pointermove 每帧热路径，实测开销可忽略。）
   *  links 同样克隆：bend / dash 会被 LinkLayer 就地改（linkOf(...).bend = ...），共享会串味。 */
  _snapshot() {
    if (!this._active) return null;
    return {
      nodes: this._nodes.map((n) => Object.assign({}, n)),
      links: this._links.map((l) => Object.assign({}, l)),
      view: Object.assign({}, this._view || { x: 0, y: 0 }),
    };
  },

  /** 用快照整体恢复：先退出编辑态与选中，再按数据重绘 */
  _restoreSnapshot(s) {
    if (!s) return;
    // 必须先把编辑态收掉：否则被撤销掉的那颗子弹仍处于 contentEditable，
    // 其 blur / keydown 回调会把内容写回一个已不存在的 id。
    if (this._editId) this._commitEdit(true);
    this._nodes = (s.nodes || []).map((n) => Object.assign({}, n));
    this._links = (s.links || []).map((l) => Object.assign({}, l));
    this._view = Object.assign({}, s.view || { x: 0, y: 0 });
    this._selId = null;
    if (this._selSet) this._clearMultiSel();
    this._scheduleSave();
    this.render();
    this._paintSelection();
  },

  /**
   * 包裹一次「离散用户变更」：在变更**前**留档（Ctrl+Z 可回退）。
   * 仅负责「快照时机」，保存由调用方在 fn 内负责（保持现有时机/频率）。
   * 修复：此前新建 / 移动 / 连线 / 删线 / 播种等路径漏调用 push，
   * 导致这些最核心的编辑不可撤销（与 _initUndo 注释声明的契约相悖）。
   */
  _mutate(fn) {
    if (this._undoStack) this._undoStack.push();
    fn();
  },

  /**
   * 执行撤销 / 重做。
   * @param {'undo'|'redo'} kind
   */
  _undoRedo(kind) {
    const stack = this._undoStack;
    if (!stack) return;
    const ok = (kind === 'redo') ? stack.redo() : stack.undo();
    this._msg(ok
      ? (kind === 'redo' ? '已重做' : '已撤销')
      : (kind === 'redo' ? '没有可重做的操作' : '没有可撤销的操作'));
  },

  /** 删除选中子弹：连带它的所有连线 */
  _deleteSel() {
    const id = this._selId;
    if (!id) return;
    this._exitConnectMode();
    _mutate(() => {
      const { nodes, links } = MindmapDoc.removeNode(this._nodes, this._links, id);
      this._nodes = nodes;
      this._links = links;
      this._unmountNode(id);          // 只摘掉这一颗，不重画整图
      this._selId = null;
      this._refreshEmpty();
      this._scheduleSave();
      this._linkLayer.render();       // 移除与该子弹相关的连线元素
      this._paintSelection();
      this._msg('已删除该子弹，其连线一并移除');
    });
  },

  /** 清空框选集合（移除高亮类） */
  _clearMultiSel() {
    if (!this._selSet) { this._selSet = new Set(); return; }
    this._selSet.forEach((id) => {
      const el = this._els.get(id);
      if (el) el.classList.remove('is-multi-sel');
    });
    this._selSet.clear();
  },

  /** 删除框选的全部子弹（连带各自连线） */
  _deleteMulSel() {
    if (!this._selSet || !this._selSet.size) return;
    const ids = Array.from(this._selSet);
    _mutate(() => {
      let nodes = this._nodes, links = this._links;
      ids.forEach((id) => {
        const r = MindmapDoc.removeNode(nodes, links, id);
        nodes = r.nodes; links = r.links;
        this._unmountNode(id);       // 逐颗摘 DOM
      });
      this._nodes = nodes;
      this._links = links;
      this._selSet.clear();
      this._selId = null;
      this._refreshEmpty();
      this._scheduleSave();
      this._linkLayer.render();       // 一次性重画剩余连线
      this._msg(`已删除 ${ids.length} 颗子弹，其连线一并移除`);
    });
  },

  // ===== 浮动工具条 / 改色 / 连线模式 =====

  /** 刷新浮动工具条：无选中或正在编辑 → 隐藏；否则定位于选中节点（或选框）上方居中 */
  _updateToolbar() {
    const tb = this._toolbar;
    if (!tb) return;
    const hasSel = this._selId || (this._selSet && this._selSet.size);
    if (!hasSel || this._editId) { tb.hidden = true; return; }
    const single = !!this._selId;
    const lr = this._el.getBoundingClientRect();
    let ax = 0, ayTop = 0, ayBottom = 0;
    if (single) {
      const el = this._els.get(this._selId);
      if (!el) { tb.hidden = true; return; }
      const r = el.getBoundingClientRect();
      ax = r.left - lr.left + r.width / 2;
      ayTop = r.top - lr.top;
      ayBottom = r.bottom - lr.top;
    } else {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      this._selSet.forEach((id) => {
        const el = this._els.get(id); if (!el) return;
        const r = el.getBoundingClientRect();
        minX = Math.min(minX, r.left); maxX = Math.max(maxX, r.right);
        minY = Math.min(minY, r.top); maxY = Math.max(maxY, r.bottom);
      });
      if (minX === Infinity) { tb.hidden = true; return; }
      ax = (minX - lr.left + maxX - lr.left) / 2;
      ayTop = minY - lr.top;
      ayBottom = maxY - lr.top;
    }
    tb.hidden = false;   // 先显形才能量到真实尺寸
    const tbH = tb.offsetHeight || 34;
    const halfW = tb.offsetWidth / 2 || 60;
    const W = this._el.clientWidth || 0;
    // 顶部空间不够（或贴左/右）会被 overflow:hidden 视口裁掉 → 翻到节点下方 + 水平夹紧
    const below = ayTop < tbH + 12;
    tb.classList.toggle('is-below', below);
    let left = Math.round(ax);
    if (W) left = Math.max(halfW + 4, Math.min(W - halfW - 4, left));
    tb.style.left = left + 'px';
    tb.style.top = Math.round(below ? ayBottom : ayTop) + 'px';
  },

  /** 给当前选中（单选或框选全部）批量改色 */
  _setColorForSelection(color) {
    const ids = this.getSelectedIds();
    if (!ids.length) return;
    _mutate(() => {
      ids.forEach((id) => this._setNodeColor(id, color));
      this._scheduleSave();
      this._msg(color ? '已改色' : '已恢复默认色');
    });
  },

  _setNodeColor(id, color) {
    if (!id) return;
    this._nodes = MindmapDoc.setColor(this._nodes, id, color || '');
    const el = this._els.get(id);
    if (el) {
      if (color) el.style.setProperty('--mm-accent', color);
      else el.style.removeProperty('--mm-accent');
    }
  },

  _exitConnectMode() {
    // 点击连线模式已移除（原 _beginConnectMode 为死代码，见 B2）：保留空壳，仅供其它路径安全调用，避免串联改多处
  },

  // ===== 复制（Cmd/Ctrl+D）：单/多选复制，并复制涉及选中集合的连线 =====

  _duplicateSel() {
    const ids = this.getSelectedIds();
    if (!ids.length) return;
    if (this._nodes.length + ids.length > this.NODE_CAP) {
      this._msg('复制后超过上限（' + this.NODE_CAP + '）');
      return;
    }
    const newIds = [];
    const map = new Map();          // oldId → newId
    _mutate(() => {
      ids.forEach((oid) => {
        const on = this._nodes.find((n) => n.id === oid);
        if (!on) return;
        this._nodes = MindmapDoc.addNode(this._nodes, on.text || '', on.x + 30, on.y + 36, on.color || '');
        const nid = this._nodes[this._nodes.length - 1].id;
        map.set(oid, nid);
        newIds.push(nid);
        this._mountNode(this._nodes[this._nodes.length - 1]);
      });
      // 复制连线：涉及选中集合的连线，选中端映射到新 id；外部端保持
      this._links.slice().forEach((l) => {
        if (l.from === l.to) return;
        const fNew = map.get(l.from), tNew = map.get(l.to);
        if (!fNew && !tNew) return;   // 与选中集合无关
        const f = fNew || l.from, t = tNew || l.to;
        const next = MindmapDoc.addLink(this._nodes, this._links, f, t);
        if (next) this._links = next;
      });
      this._refreshEmpty();
      this._scheduleSave();
      this._linkLayer.render();
    });
    // 选中新副本
    if (newIds.length === 1) {
      this._select(newIds[0]);
    } else if (newIds.length) {
      // 多选复制：把高亮从「原选中」迁移到「新副本」。多选高亮走 is-multi-sel（由框选直接加），
      // 而 _paintSelection 只管单选 is-sel，故这里手动迁移，否则旧节点残留高亮、新副本却无高亮。
      this._els.forEach((el) => el.classList.remove('is-multi-sel'));
      this._selId = null;
      this._selSet = new Set(newIds);
      newIds.forEach((id) => { const el = this._els.get(id); if (el) el.classList.add('is-multi-sel'); });
      this._updateToolbar();
    }
  },

  // ===== 搜索（Cmd/Ctrl+F） =====

  _openSearch() {
    if (!this._active || !this._searchBox) return;
    this._searchBox.hidden = false;
    this._searchInput.value = '';
    this._searchHits = [];
    this._searchIdx = -1;
    this._searchInput.focus();
    this._searchInput.select();
    this._msg('搜索子弹：回车跳转，Shift+回车上一个');
  },

  _runSearch(q) {
    const term = (q || '').trim().toLowerCase();
    this._searchHits = term
      ? this._nodes.filter((n) => (n.text || '').toLowerCase().includes(term)).map((n) => n.id)
      : [];
    this._searchIdx = this._searchHits.length ? 0 : -1;
    this._paintSearchHits();
    this._updateSearchCount();
    // 输入时只高亮，不跳转：否则每敲一个字画布都会被猛拉到第一个命中（边打字边"抽风"）。
    // 跳转（居中 + 选中）只在回车 / 上下翻时由 _searchStep 触发。
  },

  _paintSearchHits() {
    this._els.forEach((el) => el.classList.remove('is-search-hit', 'is-search-cur'));
    this._searchHits.forEach((id, i) => {
      const el = this._els.get(id);
      if (el) el.classList.add(i === this._searchIdx ? 'is-search-cur' : 'is-search-hit');
    });
  },

  _updateSearchCount() {
    if (!this._searchCount) return;
    const n = this._searchHits.length;
    this._searchCount.textContent = n ? (this._searchIdx + 1) + '/' + n : '0';
  },

  _searchStep(dir) {
    if (!this._searchHits.length) return;
    this._searchIdx = (this._searchIdx + dir + this._searchHits.length) % this._searchHits.length;
    this._paintSearchHits();
    this._updateSearchCount();
    this._focusHit(this._searchHits[this._searchIdx]);
  },

  /** 把视野平移到命中子弹居中，并选中它 */
  _focusHit(id) {
    if (!id) return;
    this._select(id);
    const el = this._els.get(id);
    if (!el) return;
    const cx = parseFloat(el.style.left) + (el.offsetWidth || 0) / 2;
    const cy = parseFloat(el.style.top) + (el.offsetHeight || 0) / 2;
    const vw = this._canvas.clientWidth || 0, vh = this._canvas.clientHeight || 0;
    this._view = { x: Math.round(vw / 2 - cx), y: Math.round(vh / 2 - cy) };
    this._applyView();
    this._scheduleSave();
  },

  _closeSearch() {
    if (this._searchBox) this._searchBox.hidden = true;
    this._els.forEach((el) => el.classList.remove('is-search-hit', 'is-search-cur'));
    this._searchHits = [];
    this._searchIdx = -1;
  },

  /** 在画布上拉出框选矩形（Shift+空白拖拽触发，几何对齐便签模式 _startMarquee） */
  _startMarquee(e) {
    const canvas = this._canvas;
    if (!canvas) return;
    this._clearMultiSel();
    if (this._marquee) this._marquee.remove();
    const m = document.createElement('div');
    m.className = 'tw-mm-marquee';
    canvas.appendChild(m);
    this._marquee = m;
    this._marqueeRect = null;
    const cr = canvas.getBoundingClientRect();
    const sx0 = e.clientX - cr.left;   // 画布局部坐标（仅平移不缩放，屏幕位移即局部位移）
    const sy0 = e.clientY - cr.top;
    const move = (ev) => {
      const sx1 = ev.clientX - cr.left;
      const sy1 = ev.clientY - cr.top;
      const x = Math.min(sx0, sx1), y = Math.min(sy0, sy1);
      const w = Math.abs(sx1 - sx0), h = Math.abs(sy1 - sy0);
      m.style.left = x + 'px'; m.style.top = y + 'px';
      m.style.width = w + 'px'; m.style.height = h + 'px';
      this._marqueeRect = { x, y, w, h };
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      if (this._marquee) { this._marquee.remove(); this._marquee = null; }
      this._selectInRect(this._marqueeRect || { x: sx0, y: sy0, w: 0, h: 0 });
      this._marqueeRect = null;
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    move(e);
  },

  /** 框选矩形与子弹求交，选中相交者（矩形与子弹包围盒相交即算） */
  _selectInRect(r) {
    if (!this._selSet) this._selSet = new Set();
    this._selSet.clear();
    this._nodes.forEach((n) => {
      const el = this._els.get(n.id);
      if (!el) return;
      const lx = parseFloat(el.style.left) || 0;
      const ly = parseFloat(el.style.top) || 0;
      const w = el.offsetWidth || MindmapDoc.EST_W;
      const h = el.offsetHeight || MindmapDoc.EST_H;
      if (lx + w >= r.x && lx <= r.x + r.w && ly + h >= r.y && ly <= r.y + r.h) {
        this._selSet.add(n.id);
        el.classList.add('is-multi-sel');
      }
    });
    if (this._selSet.size) this._selId = null;   // 框选优先：清掉单选高亮，避免两套高亮混叠
    this._paintSelection();
    this._updateToolbar();    // 框选后也要刷新浮动工具条（否则删除/复制/改色工具条不出现，见 B3）
  },


  /** F：把全部子弹居中到视口 */
  _centerView() {
    if (!this._nodes.length) return;
    const bb = this._bounds();
    const vw = this._canvas.clientWidth || 0;
    const vh = this._canvas.clientHeight || 0;
    this._view = {
      x: Math.round(vw / 2 - (bb.minX + bb.maxX) / 2),
      y: Math.round(vh / 2 - (bb.minY + bb.maxY) / 2),
    };
    this._applyView();
    this._scheduleSave();
  },

  // ===== 一键自动布局（第三个机身键；思维子弹模式专用）=====
  // 可选能力：用户主动触发才重排，不改变「位置即数据」的默认自由模型。
  // 模式在 LAYOUT_MODES 里循环：树状(下) / 横向(右) / 放射(环绕)。

  /** 按模式计算每颗子弹的新坐标（返回 Map<id,{x,y}>）；画布为空返回 null。 */
  /** 当前选区：框选集合 ∪ 单选。供「对选择部分排版」使用。 */
  _getLayoutScope() {
    const ids = new Set();
    if (this._selSet) this._selSet.forEach((id) => ids.add(id));
    if (this._selId) ids.add(this._selId);
    return ids;
  },

  /** 应用指定模式的一键自动布局（覆盖手动坐标）。
   *  - scopeIds 为空 → 排整张图并居中显示；
   *  - scopeIds 非空 → 只排选中的子弹（框选=精确集合；单选=该节点整条子树），并锚定在原位置附近，不动其余、不移动视口。
   *  返回模式标签，画布为空返回 ''。 */
  autoLayout(mode, scopeIds) {
    const nodes = this._nodes || [];
    const links = this._links || [];
    if (!nodes.length) return '';
    const scope = (scopeIds && scopeIds.size) ? scopeIds : null;
    // 单选时把范围扩展到整条子树（含后代），让「选中一颗 → 整理它下面的分支」成立
    let targetIds = scope;
    if (scope && scope.size === 1) {
      const childMap = new Map();
      links.forEach((l) => { if (!childMap.has(l.from)) childMap.set(l.from, []); childMap.get(l.from).push(l.to); });
      const sub = new Set([scope.values().next().value]);
      const stack = Array.from(sub);
      while (stack.length) {
        const cur = stack.pop();
        (childMap.get(cur) || []).forEach((c) => { if (!sub.has(c)) { sub.add(c); stack.push(c); } });
      }
      targetIds = sub;
    }
    const targetSet = targetIds ? new Set(targetIds) : null;
    const subNodes = targetSet ? nodes.filter((n) => targetSet.has(n.id)) : nodes;
    const subLinks = targetSet ? links.filter((l) => targetSet.has(l.from) && targetSet.has(l.to)) : links;
    const pos = MindmapLayout.compute(mode, subNodes, subLinks);
    if (!pos || !pos.size) return '';
    if (targetSet) {
      // 锚定：保持选中集合在原位置附近（质心对齐），未选中节点不动
      let ox = 0, oy = 0, oc = 0;
      subNodes.forEach((n) => { ox += n.x; oy += n.y; oc++; });
      const oAvgX = oc ? ox / oc : 0, oAvgY = oc ? oy / oc : 0;
      let nx = 0, ny = 0; pos.forEach((p) => { nx += p.x; ny += p.y; });
      const nAvgX = pos.size ? nx / pos.size : 0, nAvgY = pos.size ? ny / pos.size : 0;
      const dx = Math.round(oAvgX - nAvgX), dy = Math.round(oAvgY - nAvgY);
      const moved = new Map();
      pos.forEach((p, k) => moved.set(k, { x: p.x + dx, y: p.y + dy }));
      this._nodes = nodes.map((n) => {
        const p = moved.get(n.id);
        return p ? Object.assign({}, n, { x: p.x, y: p.y }) : n;
      });
    } else {
      this._nodes = nodes.map((n) => {
        const p = pos.get(n.id);
        return p ? Object.assign({}, n, { x: p.x, y: p.y }) : n;
      });
    }
    this.render();
    if (!targetSet) this._centerView();   // 局部排版不挪动视口
    this._scheduleSave();
    const m = (this.LAYOUT_MODES || []).find((x) => x.id === mode) || (this.LAYOUT_MODES || [])[0];
    return m ? m.label : '';
  },

  /** 循环切换布局模式并应用；有选区时只对选区排版。返回模式标签（选区前加「选区」），画布为空返回 ''。 */
  cycleLayout() {
    const modes = this.LAYOUT_MODES || [];
    if (!modes.length) return '';
    const idx = (this._layoutIdx || 0) % modes.length;
    const scope = this._getLayoutScope();
    const partial = scope.size > 0;
    // 自动布局会重写所有（或选区）子弹的坐标、并可能重新居中视野，不可逆 —— 变更留档
    let label = '';
    if (this._nodes.length) _mutate(() => { label = this.autoLayout(modes[idx].id, partial ? scope : null); });
    this._layoutIdx = (idx + 1) % modes.length;
    return label ? (partial ? '选区 ' + label : label) : '';
  },

  // ===== 空态与一次性种子 =====

  _syncSeedButton() {
    const btn = this._empty.querySelector('.tw-mm-seed');
    const note = this._empty.querySelector('.tw-mm-empty-note');
    const src = this._ctrl && this._ctrl.getSeedSource ? this._ctrl.getSeedSource() : null;
    const cards = (src && src.cards) || [];
    const show = cards.length > 0;
    btn.hidden = !show;
    note.hidden = !show;
    if (!show) return;
    btn.textContent = `沿便签连线生成子弹（读 ${cards.length} 张便签，一次性）`;
    btn.onclick = (e) => { e.stopPropagation(); this._seedFromNotes(src); };
  },

  /** 一次性：把便签卡片 → 子弹、便签连线 → 子弹连线。只读便签、不回写，之后两边再无往来 */
  _seedFromNotes(src) {
    const { nodes, links } = MindmapDoc.seedFromCards(src.cards, src.links);
    if (!nodes.length) { this._msg('便签为空，无法生成'); return; }
    this._mutate(() => { this._nodes = nodes; this._links = links; this._view = null; });  // 播种可撤销（B1）
    this._scheduleSave();
    this.render();
    this._msg('已沿便签连线生成子弹（此后两边互不影响）');
  },

  _msg(text) {
    if (this._ctrl && typeof this._ctrl._showScreenMsg === 'function') {
      this._ctrl._showScreenMsg(text, 1200);
    }
  },

  /** 宿主重置（换页/重挂载）时清引用：下次 mount 会重新建层，避免指向已卸载的 DOM */
  teardown() {
    clearTimeout(this._saveTimer);
    this._saveTimer = 0;
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler, true);
      this._keyHandler = null;
    }
    // 历史只属于本次会话的文档：卸载即弃，避免重挂载后把旧状态的快照带回来
    if (this._undoStack) { this._undoStack.reset(); this._undoStack = null; }
    this._active = false;
    this._el = null;
    this._canvas = null;
    this._nodeBox = null;
    this._empty = null;
    this._toolbar = null;
    this._searchBox = null;
    this._searchInput = null;
    this._searchCount = null;
    this._els = new Map();
    this._nodes = [];
    this._links = [];
    this._view = null;
    this._selId = null;
    this._selLinkIdx = null;
    this._editId = null;
    this._editKey = null;
    this._editBlur = null;
  },
};

// 双保险：与其它模块同一套路
if (typeof window !== 'undefined') window.MindmapFeature = MindmapFeature;
