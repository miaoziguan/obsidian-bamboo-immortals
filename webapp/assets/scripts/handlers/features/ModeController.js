// ModeController — 从 typewriterFeature 巨型单例（B1 解耦）抽出的子系统。
// 方法体逐字搬运，所有内部调用经 ctrl._xxx 由 feature 委托壳自动解析回原对象。
// 共享常量（裸名引用由本 import 提供；测试 harness 剥离 import 时由 twConfig 挂 globalThis 兜底）
import { ICON_LAYERS, ICON_FONT, ICON_GRID, ICON_PRINT, ICON_X, ICON_FONT_DOWN, ICON_FONT_UP, ICON_ZOOM_OUT, ICON_ZOOM_IN, ICON_PAPER, ICON_EXPORT, ICON_PREVIEW, ICON_MOVE_UP, ICON_MOVE_DOWN, ICON_LV_UP, ICON_LV_DOWN, ICON_ROTATE } from './twConfig.js';
import { STACK_STEP, STACK_LEVELS, TYPE_SPEED, MAX_LEN, NOTE_CAP, WRITE_FLOW_GAP, SAVE_DEBOUNCE, LOD_DENSITY, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from './twConfig.js';
import { FONT_SCALES, FONT_SCALE_DEFAULT_IDX, FONT_SCALE_LABELS, CARD_SCALES, CARD_SCALE_LABELS, CARD_SCALE_DEFAULT_IDX } from './twConfig.js';
import { FONTS, FONT_LABELS, FONT_FEEDBACK } from './twConfig.js';
import { PAPERS, PAPER_LABELS, PAPER_FEEDBACK, PAPER_TITLES } from './twConfig.js';
import { LEVELS, LEVEL_LABELS, LEVEL_FEEDBACK, LEVEL_GROUPS, LEVEL_LADDER } from './twConfig.js';
import { TypewriterStore } from '../../services/TypewriterStore.js';
import { SpatialIndex } from '../../services/SpatialIndex.js';
import { GeoCache } from '../../services/GeoCache.js';
import { MindmapFeature } from './mindmapFeature.js';
import { LinkLayer } from '../../services/LinkLayer.js';
import { WritingDoc } from './writingDoc.js';
import { UndoStack } from '../../services/undoStack.js';
import { isFromTextEntry } from '../../utils/domRef.js';

export const ModeController = {
  // (was _cycleMode)
  cycleMode(ctx, dir) {
    const { state, ctrl } = ctx;
    const order = ['notes', 'write', 'mindmap'];
    const cur = Math.max(0, order.indexOf(ctrl._mode));
    const step = dir >= 0 ? 1 : -1;
    ctrl._setMode(order[(cur + step + order.length) % order.length]);
  
  },
  // (was _setMode)
  async setMode(ctx, mode) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    const order = ['notes', 'write', 'mindmap'];
    if (order.indexOf(mode) < 0 || mode === ctrl._mode) return;
    const knob = ctrl._el && ctrl._el.querySelector('#twKnob');
    const prev = ctrl._mode;
    // 切档含 await（要读盘）：期间再拨会与上一次的读写交叉，两份文档互相覆盖。
    // 用一把重入锁挡住连拨；finally 保证任何异常都解锁，不会把旋钮永久锁死。
    if (ctrl._switching) return;
    ctrl._switching = true;
    ctrl._ensureAudio();          // 必须在用户手势（点击旋钮）内恢复音频上下文，否则出声被浏览器拦截
    ctrl._playGearSound();        // 拨动齿轮的转动音效
    try {
      // ① 取消挂起的防抖落盘：它会在切档「之后」才触发，届时档位已变，
      //    就会拿新档的 key 去写旧档的卡片 —— 文档串味最隐蔽的一条路径。
      if (ctrl._saveTimer) { clearTimeout(ctrl._saveTimer); ctrl._saveTimer = null; }

      // ② 离开当前档：草稿各自带走；半截编辑先提交，避免文本挂在即将隐藏/清空的 DOM 上
      // 离开当前档：草稿各自带走。用 ctrl._mode（此刻仍是「被离开的档」）作为键，
      // 三档键名与 _mode 取值一致；此前误用派生布尔 _mindmap，会让 write 档草稿落进 draft.notes，
      // 切回 write 时 _applyModeChrome 按 draft.write 恢复 → 半截输入丢失。
      if (ctrl._input) ctrl._draft[ctrl._mode] = ctrl._input.value;
      if (ctrl._mode === 'mindmap') {
        MindmapFeature.deactivate();
      } else {
        await ctrl._persistDoc(prev);   // 把这一档的卡片写回它自己的文档
      }
      ctrl._exitAllEdits();
      ctrl._clearSelection();

      ctrl._mode = mode;
      // 导图自绘层；便签/写作共用同一张卡片画布作为渲染介质，但数据各存各的
      ctrl._canvas.hidden = ctrl._mode === 'mindmap';
      // 写作档外观必须**先于**载入卡片生效：_loadDoc 会量卡片尺寸并做「带入视野」校正，
      // 若此刻还挂着便签的纸样样式，量到的是纸样尺寸（连 aspect-ratio 都不同），位置会算歪。
      ctrl._refreshWriteMode();

      if (knob) {
        knob.dataset.mode = mode;
        knob.classList.toggle('is-on', ctrl._mode === 'mindmap');
        knob.setAttribute('aria-pressed', ctrl._mode === 'mindmap' ? 'true' : 'false');
        const TITLES = {
          notes: '拨动齿轮：便签画布 / MD可视化写作 / 思维子弹',
          write: 'MD可视化写作：给每张卡定级别，最后连成一篇 Markdown',
          mindmap: '思维子弹：打字后回车新建节点',
        };
        knob.title = TITLES[mode] || TITLES.notes;
      }
      if (ctrl._mode === 'mindmap') {
        MindmapFeature.activate();
      } else {
        // ③ 进入卡片档：载入这一档自己的文档，并重置撤销栈（两份卡片文档的历史不该串味）
        // 【chrome 瞬时切换】_loadDoc 要等多次桥接 await，若语义等到载入后才换，空窗期会是
        //   「导图外壳 + 空画布」的混合态。故先换一次语义（标题/placeholder/按钮/草稿立刻跟上）；
        //   载入完下面还会再调一次 —— 因为 _refreshScreenMeta 按 _notes 算卡片数，
        //   只有载入后那次才拿得到新文档真值（提前这次读到的是旧文档，会被后一次覆盖）。
        ctrl._applyModeChrome();
        // 【切档闪档修复】画布里还留着「上一次载入的那份文档」的旧卡 —— 进导图只 hidden 画布、
        // 从不清卡（卡片 DOM 仅在 loadDoc / _buildCards / 撤销恢复里才清）。而 _loadDoc 要等
        // TypewriterStore 三次桥接 await 才清卡重建，这期间画布已显示 → 会闪一下上一份文档的卡片
        // （典型：便签→写作→导图→便签，中间闪写作卡与其 .tw-card-order 顺序徽标）。
        // 故在 await 前同步清空画布，让空窗期露的是空画布而非上一份文档。
        // 注意：不能用 canvas.hidden 遮 —— display:none 会让 getBoundingClientRect 变 0×0，
        // 触发 collectNotes 的 cr.width<2 提前返回 null，并把 _ensureNotesVisible 的居中算歪。
        // 必须走 _buildCards 这条既有清理路径：一次清掉 DOM / mountedCards / geo，且画布保持可测量。
        if (ctrl._canvas) {
          const cr0 = ctrl._canvas.getBoundingClientRect();
          ctrl._buildCards([], false, cr0.width || 1, cr0.height || 1);
          // 【连线层同步清理】连线层是挂在画布里的 SVG（container: _canvas），不是 .tw-card，
          // 上面那条 buildCards 清理够不到它。画布一露，上一份文档残留的连线路径
          // （含端点圆点、箭头这些小元件）会先于新档重绘闪出来 —— 即「卡片没了但小元素还在」。
          // 直接摘掉这两个 SVG 即可：LinkLayer.ensureLayer/ensureControlLayer 的复用判据含
          // isConnected && parentNode===container，下次 render 会自动重建；render 的结构复用
          // 判据含 path.parentNode===svg 也会随之重建，不会留悬空引用。纯 DOM 操作，不碰模型。
          Array.from(ctrl._canvas.querySelectorAll('svg')).forEach((s) => s.remove());
        }
        await ctrl._loadDoc(mode);
        if (ctrl._undoStack) ctrl._undoStack.reset();
      }

      ctrl._applyModeChrome();       // 载入后再刷一次：计数/元信息取自刚载入的新文档真值
      ctrl._scheduleRenderLinks();
      const MSGS = {
        notes: '已回到便签画布',
        write: 'MD可视化写作：用卡片上的级别钮定 H1–H6 / 正文 / 引用',
        mindmap: '思维子弹模式：打字后回车新建节点',
      };
      ctrl._showScreenMsg(MSGS[mode] || '', mode === 'mindmap' ? 1800 : 1900);
    } finally {
      ctrl._switching = false;
    }
  
  },
  // (was _getDocKind)
  getDocKind(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._mode === 'mindmap') return 'mindmap';
    if (ctrl._mode === 'write') return 'write';
    return null;
  
  },
  // (was _ensureDocCorner)
  ensureDocCorner(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._docCorner || !ctrl._el) return;
    if (getComputedStyle(ctrl._el).position === 'static') ctrl._el.style.position = 'relative';
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'tw-doc-corner';
    c.id = 'twDocCorner';
    c.hidden = true;
    c.textContent = '';
    const label = document.createElement('span');
    label.className = 'tw-doc-corner-label';
    label.textContent = '未命名草稿';
    c.appendChild(label);
    c.addEventListener('click', () => {
      if (ctrl._getDocKind() == null) return;
      if (ctrl._docPanel && !ctrl._docPanel.hidden) ctrl._hideDocPanel();
      else ctrl._showDocPanel();
    });
    // 阻止画布平移吞掉点击（机身区平移绑在 feature 根上）
    c.addEventListener('pointerdown', (e) => e.stopPropagation());
    ctrl._el.appendChild(c);
    ctrl._docCorner = c;
  
  },
  // (was _ensureDocPanel)
  ensureDocPanel(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._docPanel || !ctrl._el) return;
    if (getComputedStyle(ctrl._el).position === 'static') ctrl._el.style.position = 'relative';
    const panel = document.createElement('div');
    panel.className = 'tw-doc-panel';
    panel.hidden = true;
    panel.addEventListener('pointerdown', (e) => e.stopPropagation());   // 浮层内交互不冒泡到画布
    ctrl._el.appendChild(panel);
    ctrl._docPanel = panel;
  
  },
  // (was _renderDocPanel)
  async renderDocPanel(ctx) {
    const { state, ctrl } = ctx;
    ctrl._ensureDocPanel();
    const panel = ctrl._docPanel;
    if (!panel) return;
    const kind = ctrl._getDocKind();
    if (!kind) { panel.hidden = true; return; }
    let groups, curId, headText, addText;
    if (kind === 'mindmap') {
      groups = await TypewriterStore.listMindmapGroups();
      const cur = await TypewriterStore.getCurrentMindmapGroup();
      curId = cur ? cur.id : null;
      headText = '思维导图组'; addText = '＋ 新建思维导图组';
    } else {
      groups = await TypewriterStore.listWritingGroups();
      const cur = await TypewriterStore.getCurrentWritingGroup();
      curId = cur ? cur.id : null;
      headText = '写作卡片组'; addText = '＋ 新建卡片组';
    }
    const fallback = kind === 'mindmap' ? '未命名思维导图' : '未命名草稿';
    panel.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'tw-doc-head';
    const t1 = document.createElement('span'); t1.textContent = headText;
    const t2 = document.createElement('span'); t2.className = 'tw-doc-count'; t2.textContent = String(groups.length);
    head.appendChild(t1); head.appendChild(t2);
    panel.appendChild(head);
    const list = document.createElement('div');
    list.className = 'tw-doc-list';
    groups.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'tw-doc-row' + (g.id === curId ? ' is-on' : '');
      row.dataset.id = g.id;
      const name = document.createElement('button');
      name.type = 'button';
      name.className = 'tw-doc-name';
      name.dataset.id = g.id;
      name.textContent = g.title || fallback;
      name.title = '单击切换组';
      name.addEventListener('click', () => ctrl._switchDocGroup(kind, g.id));
      row.appendChild(name);
      // 编辑图标：单击即改组名（比双击更直观，也避免与画布双击误触）
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'tw-doc-edit';
      edit.title = '重命名该组';
      edit.textContent = '✎';
      edit.addEventListener('click', (e) => {
        e.stopPropagation();
        ctrl._beginRenameDoc(kind, g.id, name);
      });
      row.appendChild(edit);
      // 删除图标：点击经确认后删除该组（含其绑定笔记）
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'tw-doc-del';
      del.title = '删除该组';
      del.textContent = '✕';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        ctrl._deleteDocGroup(kind, g.id, g.title);
      });
      row.appendChild(del);
      list.appendChild(row);
    });
    panel.appendChild(list);
    const foot = document.createElement('div');
    foot.className = 'tw-doc-foot';
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'tw-doc-add';
    add.textContent = addText;
    add.addEventListener('click', () => ctrl._createDocGroup(kind));
    foot.appendChild(add);
    panel.appendChild(foot);
  
  },
  // (was _showDocPanel)
  async showDocPanel(ctx) {
    const { state, ctrl } = ctx;
    // 写作与思维导图两种组都用同一套面板；角控件只在有效模式可见（_applyModeChrome），
    // 故此处用 _getDocKind() 判空即可，不再限定写作模式。
    if (ctrl._getDocKind() == null) return;
    ctrl._ensureDocCorner();
    await ctrl._renderDocPanel();
    const panel = ctrl._docPanel;
    const btn = ctrl._el.querySelector('#twDocCorner');
    if (!panel || !btn) return;
    panel.hidden = false;
    const br = btn.getBoundingClientRect();
    const root = ctrl._el.getBoundingClientRect();
    const panelW = panel.offsetWidth || 200;
    const panelH = panel.offsetHeight || 160;
    // 右对齐到按钮右侧：面板向左展开，避免画布右上角时面板被右边界截断
    let left = br.right - root.left - panelW;
    left = Math.max(8, Math.min(left, root.width - panelW - 8));
    panel.style.left = left + 'px';
    panel.style.right = 'auto';
    // 垂直：默认在按钮下方；空间不足则翻到上方
    let top = br.bottom - root.top + 6;
    if (top + panelH > root.height - 8) {
      top = br.top - root.top - panelH - 6;
      if (top < 8) top = 8;
    }
    panel.style.top = top + 'px';
    if (!ctrl._docDocHandler) {
      ctrl._docDocHandler = (ev) => {
        if (panel.hidden) return;
        const path = (typeof ev.composedPath === 'function') ? ev.composedPath() : [];
        for (let i = 0; i < path.length; i += 1) {
          const n = path[i];
          if (n && n.classList && (n.classList.contains('tw-doc-panel') || n.id === 'twDocCorner')) return;
        }
        ctrl._hideDocPanel();
      };
      document.addEventListener('pointerdown', ctrl._docDocHandler, true);
    }
  
  },
  // (was _hideDocPanel)
  hideDocPanel(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._docPanel) ctrl._docPanel.hidden = true;
    if (ctrl._docDocHandler) {
      document.removeEventListener('pointerdown', ctrl._docDocHandler, true);
      ctrl._docDocHandler = null;
    }
  
  },
  // (was _switchWritingGroup)
  async switchWritingGroup(ctx, id) {
    const { state, ctrl } = ctx;
    if (ctrl._mode !== 'write' || ctrl._docBusy) return;
    const cur = (await TypewriterStore.getCurrentWritingGroup()).id;
    ctrl._hideDocPanel();
    if (id === cur) return;
    ctrl._docBusy = true;
    try {
      ctrl._exitAllEdits();
      if (ctrl._saveTimer) { clearTimeout(ctrl._saveTimer); ctrl._saveTimer = null; }
      await ctrl._persistDoc('write');          // 当前组落盘到它自己的独立文件
      await TypewriterStore.setWritingCurrent(id);
      await ctrl._loadDoc('write');             // 清空当前画布并载入目标组
      if (ctrl._undoStack) ctrl._undoStack.reset();
      ctrl._scheduleRenderLinks();
      await ctrl._refreshDocBtnLabel();
      ctrl._showScreenMsg('已切换卡片组', 1200);
    } finally {
      ctrl._docBusy = false;
    }
  
  },
  // (was _createWritingGroup)
  async createWritingGroup(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._mode !== 'write' || ctrl._docBusy) return;
    ctrl._docBusy = true;
    try {
      ctrl._exitAllEdits();
      if (ctrl._saveTimer) { clearTimeout(ctrl._saveTimer); ctrl._saveTimer = null; }
      await ctrl._persistDoc('write');          // 先存好当前组
      await TypewriterStore.createWritingGroup('未命名草稿');
      await ctrl._loadDoc('write');             // 新组为空，画布清空
      if (ctrl._undoStack) ctrl._undoStack.reset();
      await ctrl._refreshDocBtnLabel();
      await ctrl._renderDocPanel();             // 刷新列表（面板保持打开）
      ctrl._showScreenMsg('已新建卡片组', 1200);
    } finally {
      ctrl._docBusy = false;
    }
  
  },
  // (was _beginRenameDoc)
  beginRenameDoc(ctx, kind, id, nameEl) {
    const { state, ctrl } = ctx;
    if (!nameEl || !nameEl.isConnected) return;
    const cur = nameEl.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tw-doc-rename-input';
    input.value = cur;
    nameEl.replaceWith(input);
    input.focus(); input.select();
    let done = false;
    const commit = async () => {
      if (done) return; done = true;
      const v = input.value.trim();
      if (kind === 'mindmap') {
        // 思维导图是纯快照导出、不绑定笔记，改名只改组名
        await MindmapFeature.renameGroup(id, v || cur);
      } else {
        await TypewriterStore.renameWritingGroup(id, v || cur);
      }
      await ctrl._refreshDocBtnLabel();
      await ctrl._renderDocPanel();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.preventDefault(); ctrl._renderDocPanel(); }
    });
    input.addEventListener('blur', commit);
  
  },
  // (was _deleteWritingGroup)
  async deleteWritingGroup(ctx, id, title) {
    const { state, ctrl } = ctx;
    if (ctrl._mode !== 'write' || ctrl._docBusy) return;
    const idx = await TypewriterStore.ensureWritingIndex();
    const g = idx.groups[id];
    if (!g) return;
    const warn = '确定删除卡片组「' + (title || '未命名草稿') + '」？此操作无法撤销。';
    if (!window.confirm(warn)) return;
    ctrl._docBusy = true;
    try {
      ctrl._exitAllEdits();
      if (ctrl._saveTimer) { clearTimeout(ctrl._saveTimer); ctrl._saveTimer = null; }
      const wasCurrent = (await TypewriterStore.getCurrentWritingGroup()).id === id;
      await TypewriterStore.deleteWritingGroup(id);
      if (wasCurrent) await ctrl._loadDoc('write');   // 删的是当前组 → 载入新的当前组
      if (ctrl._undoStack) ctrl._undoStack.reset();
      await ctrl._refreshDocBtnLabel();
      await ctrl._renderDocPanel();
      ctrl._showScreenMsg('已删除卡片组', 1200);
    } finally {
      ctrl._docBusy = false;
    }
  
  },
  // (was _switchDocGroup)
  async switchDocGroup(ctx, kind, id) {
    const { state, ctrl } = ctx;
    if (kind === 'mindmap') {
      if (ctrl._docBusy) return;
      ctrl._docBusy = true;
      try {
        ctrl._hideDocPanel();
        const cur = (await TypewriterStore.getCurrentMindmapGroup()).id;
        if (id !== cur) {
          await MindmapFeature.switchGroup(id);
          await ctrl._refreshDocBtnLabel();
          await ctrl._renderDocPanel();
          ctrl._showScreenMsg('已切换思维导图组', 1200);
        }
      } finally { ctrl._docBusy = false; }
    } else {
      await ctrl._switchWritingGroup(id);
    }
  
  },
  // (was _createDocGroup)
  async createDocGroup(ctx, kind) {
    const { state, ctrl } = ctx;
    if (kind === 'mindmap') {
      if (ctrl._docBusy) return;
      ctrl._docBusy = true;
      try {
        ctrl._exitAllEdits();
        await MindmapFeature.newGroup();
        await ctrl._refreshDocBtnLabel();
        await ctrl._renderDocPanel();
        ctrl._showScreenMsg('已新建思维导图组', 1200);
      } finally { ctrl._docBusy = false; }
    } else {
      await ctrl._createWritingGroup();
    }
  
  },
  // (was _deleteDocGroup)
  async deleteDocGroup(ctx, kind, id, title) {
    const { state, ctrl } = ctx;
    if (kind === 'mindmap') await ctrl._deleteMindmapGroup(id, title);
    else await ctrl._deleteWritingGroup(id, title);
  
  },
  // (was _deleteMindmapGroup)
  async deleteMindmapGroup(ctx, id, title) {
    const { state, ctrl } = ctx;
    if (ctrl._docBusy) return;
    const idx = await TypewriterStore.ensureMindmapIndex();
    const g = idx.groups[id];
    if (!g) return;
    const warn = '确定删除思维导图组「' + (title || '未命名思维导图') + '」？此操作无法撤销。';
    if (!window.confirm(warn)) return;
    ctrl._docBusy = true;
    try {
      ctrl._exitAllEdits();
      const wasCurrent = (await TypewriterStore.getCurrentMindmapGroup()).id === id;
      await MindmapFeature.deleteGroup(id);   // 导图不绑定笔记：删组只删文档与索引
      // MindmapFeature.deleteGroup 已载入新当前组并重绘；这里只需刷新角标与面板
      await ctrl._refreshDocBtnLabel();
      await ctrl._renderDocPanel();
      ctrl._showScreenMsg('已删除思维导图组', 1200);
    } finally {
      ctrl._docBusy = false;
    }
  
  },
  // (was _refreshDocBtnLabel)
  async refreshDocBtnLabel(ctx) {
    const { state, ctrl } = ctx;
    ctrl._ensureDocCorner();
    const btn = ctrl._el && ctrl._el.querySelector('#twDocCorner');
    if (!btn) return;
    const kind = ctrl._getDocKind();
    let title = '未命名草稿';
    let prefix = '当前写作卡片组：';
    if (kind === 'mindmap') {
      const g = await TypewriterStore.getCurrentMindmapGroup();
      title = (g && g.title) || '未命名思维导图';
      prefix = '当前思维导图组：';
    } else if (kind === 'write') {
      const g = await TypewriterStore.getCurrentWritingGroup();
      title = (g && g.title) || '未命名草稿';
    } else {
      btn.title = '当前没有可切换的组';
      return;
    }
    const label = btn.querySelector('.tw-doc-corner-label');
    if (label) label.textContent = title;
    btn.title = prefix + title + '（点击切换 / 新建）';
  
  },
  // (was _applyModeChrome)
  applyModeChrome(ctx) {
    const { state, ctrl } = ctx;
    const root = ctrl._el;
    if (!root) return;
    ctrl._ensureDocCorner();   // 先确保画布角控件已创建，下面的 set('#twDocCorner') 才不会因元素不存在而跳过
    const mm = ctrl._mode === 'mindmap';
    const wr = ctrl._mode === 'write';
    const T = {
      notes: { title: '凝墨成笺', ph: '输入文字打印便签...' },
      // 抬头「列锦成文」：列锦是古典修辞格——意象并置、如锦缎铺陈，正合本模式
      // 「一张张卡片平铺陈列」的可视化特质（而非线性的珠串）；成文=落成一篇 Markdown。
      // 与便签「凝墨成笺」、子弹「枝连成图」同为「X → 成 Y」的四字结构，同一套诗意命名。
      write: { title: '列锦成文', ph: '输入文字打印卡片...' },
      mindmap: { title: '枝连成图', ph: '输入文字新建节点...' },
    }[ctrl._mode] || { title: '凝墨成笺', ph: '输入文字打印便签...' };
    const set = (sel, fn) => { const el = root.querySelector(sel); if (el) fn(el); };
    set('#twScreenTitle', (el) => { el.textContent = T.title; });
    // 元信息分档：便签=FONT·PAPER；写作=卡片·连线；导图=子弹·连线。
    // 此前写作档借用便签那条（显隐判据只是「非导图」），漏出 FONT·PAPER ——
    // 而写作档根本没有字体/纸样：工具条两键已改作预览/导出，卡片的纸样钮也被隐藏。
    set('#twMetaNotes', (el) => { el.hidden = mm || wr; });
    set('#twMetaWrite', (el) => { el.hidden = !wr; });
    set('#twMetaMindmap', (el) => { el.hidden = !mm; });
    const input = ctrl._input;
    if (input) {
      input.placeholder = T.ph;
      input.setAttribute('aria-label', T.ph.replace('...', ''));
      input.value = (ctrl._draft && ctrl._draft[ctrl._mode]) || '';
    }
    // #twPaper 三档语义不同：便签=切换便签样式；写作=整篇预览；导图=切换子弹样式。
    set('#twPaper', (el) => {
      el.disabled = false;
      if (ctrl._mode === 'write') {
        el.title = '整篇预览：按连线顺序查看合成后的 Markdown（只读，不落盘）';
        el.setAttribute('aria-label', '整篇预览');
        el.innerHTML = ICON_PREVIEW;
      } else if (mm) {
        el.title = '切换子弹样式';
        el.setAttribute('aria-label', '切换子弹样式');
        el.innerHTML = ICON_LAYERS;
      } else {
        el.title = '切换便签样式';
        el.setAttribute('aria-label', '切换便签样式');
        el.innerHTML = ICON_LAYERS;
      }
    });
    // #twFont 三档语义不同：便签=切换字体；写作=保存快照（带时间戳的独立笔记）；导图=导出为 Markdown。
    set('#twFont', (el) => {
      el.disabled = false;
      if (mm) {
        el.title = '导出为 Markdown 笔记（落库到 Vault）';
        el.setAttribute('aria-label', '导出为 Markdown');
        el.innerHTML = ICON_EXPORT;
      } else if (ctrl._mode === 'write') {
        el.title = '把卡片连成整篇 Markdown 并新建笔记';
        el.setAttribute('aria-label', '生成 Markdown 笔记');
        el.innerHTML = ICON_EXPORT;
      } else {
        el.title = '切换字体';
        el.setAttribute('aria-label', '切换字体');
        el.innerHTML = ICON_FONT;
      }
    });
    // #twArrange 三档语义不同：便签=一键排版（网格）；写作=顺流重排（文章顺序→竖向阅读流）；
    // 导图=一键自动布局（多种布局循环）。
    set('#twArrange', (el) => {
      el.disabled = false;
      if (mm) {
        el.title = '一键自动布局（多种布局循环：树状 / 横向 / 放射）';
        el.setAttribute('aria-label', '一键自动布局');
        el.innerHTML = ICON_LAYERS;
      } else if (ctrl._mode === 'write') {
        el.title = '顺流重排：按文章顺序把卡片排成竖向阅读流（选中≥2张时只排选中组）';
        el.setAttribute('aria-label', '顺流重排卡片');
        el.innerHTML = ICON_GRID;
      } else {
        el.title = '一键排版：便签排成整齐网格（选中≥2张时只排选中组）';
        el.setAttribute('aria-label', '一键排版');
        el.innerHTML = ICON_GRID;
      }
    });
    // 写作卡片组切换控件：仅写作模式可见，浮于画布右上角（异步刷新组名，不阻塞 Chrome）
    set('#twDocCorner', (el) => {
      const kind = ctrl._mode === 'mindmap' ? 'mindmap' : (ctrl._mode === 'write' ? 'write' : null);
      el.hidden = !kind;
      if (kind) ctrl._refreshDocBtnLabel();
    });
    set('#twPrint', (el) => { el.title = mm ? '新建节点' : '打印'; });
    ctrl._refreshScreenMeta();
  
  },
  // (was _refreshScreenMeta)
  refreshScreenMeta(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._el) return;
    const root = ctrl._el;
    const set = (sel, v) => { const el = root.querySelector(sel); if (el) el.textContent = v; };
    if (ctrl._mode === 'mindmap') {
      let s = { count: 0, links: 0 };
      if (MindmapFeature.isActive && MindmapFeature.isActive()) s = MindmapFeature.stats();
      set('#twNodeCount', String(s.count));
      set('#twLinkCount', String(s.links));
      return;
    }
    if (ctrl._mode === 'write') {
      // 【P8 视口剔除】卡片 DOM 会被卸载 → 数挂载 DOM 只得到可见卡数；总数以模型 _notes 为准
      const n = ctrl._notes ? ctrl._notes.length : 0;
      set('#twCardCount', String(n));
      set('#twLinkCount', String((ctrl._links || []).length));
    }
  
  },
  // (was _refreshWriteMode)
  refreshWriteMode(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    ctrl._canvas.classList.toggle('tw-mode-write', ctrl._mode === 'write');
  
  },
  // (was _openPreviewModal)
  openPreviewModal(ctx) {
    const { state, ctrl } = ctx;
    const modal = ctrl._el.querySelector('#twPreviewModal');
    if (!modal || !ctrl._canvas) return;
    const ordered = ctrl._orderCards();
    if (!ordered.length) { ctrl._showScreenMsg('画布上还没有卡片', 1400); return; }
    const content = ctrl._buildCardsMarkdown(ordered);
    if (!content.trim()) { ctrl._showScreenMsg('卡片都是空的', 1400); return; }
    const body = modal.querySelector('#twPreviewBody');
    body.value = content;
    // 结构概览：卡片数与（去空白）字数，便于快速判断整篇规模是否符合预期
    modal.querySelector('#twPreviewStat').textContent =
      ordered.length + ' 张 · ' + content.replace(/\s/g, '').length + ' 字';
    modal.hidden = false;
    body.scrollTop = 0;   // 每次打开都从开头看起
    setTimeout(() => body.focus(), 0);
  
  },
  // (was _closePreviewModal)
  closePreviewModal(ctx) {
    const { state, ctrl } = ctx;
    const modal = ctrl._el.querySelector('#twPreviewModal');
    if (modal) modal.hidden = true;
  
  },
  // (was _buildCardsMarkdown)
  buildCardsMarkdown(ctx, ordered) {
    const { state, ctrl } = ctx;
    // 【P8 视口剔除】文本/层级必须来自模型真源，绝不能再读 c.el.dataset/innerText：
    // 离屏卡被剔、c.el 为 null，读 DOM 会抛「Cannot read dataset of null」→ 导出/快照/预览直接崩。
    // 仅「正在打字动画中」的卡用 dataset.pendingText（此时它必在屏、被钉屏，不会是离屏卡）。
    const byId = ctrl._notes ? new Map(ctrl._notes.map((n) => [n.id, n])) : null;
    const blocks = [];
    let olN = 0;   // 有序列表跨卡连续累加（非全局阅读序 i），避免编号错位/跳号
    ordered.forEach((c, i) => {
      const id = c.id;
      let text = '';
      let lv = 'p';
      if (c.el && c.el.dataset && c.el.dataset.pendingText != null) {
        text = c.el.dataset.pendingText;          // 打字中途：未落模型，用 DOM 暂存全文
      } else if (byId) {
        const note = byId.get(id);
        if (note) { text = note.text || ''; lv = note.level || 'p'; }   // 真源：模型
      } else if (c.el) {
        text = ((c.el.querySelector('.tw-card-text') || {}).innerText) || '';
      }
      const trimmed = String(text).replace(/\s+$/, '');
      if (!trimmed.trim()) return;
      const lines = trimmed.split('\n');
      if (/^h[1-6]$/.test(lv)) {
        blocks.push('#'.repeat(Number(lv.slice(1))) + ' ' + (lines[0] || '').trim());
        const rest = lines.slice(1).join('\n').trim();
        if (rest) blocks.push(rest);
      } else if (lv === 'quote') {
        blocks.push(lines.map((s) => '> ' + s.trim()).join('\n'));
      } else if (lv === 'ul' || lv === 'ol' || lv === 'task') {
        // 列表三兄弟：一行一项，空行跳过。
        // 编号列表逐行累加序号（与 ul 逐行成 bullet 一致）—— 不要求用户在卡里手写「1. 2. 3.」，
        // 手写反而会因增删项而错乱；且跨卡连续累加，整篇导出为单一有序序列（对齐「文章顺序」）。
        const items = lines.map((s) => s.trim()).filter(Boolean);
        if (!items.length) return;
        if (lv === 'ul') blocks.push(items.map((s) => '- ' + s).join('\n'));
        else if (lv === 'ol') blocks.push(items.map((s) => (++olN) + '. ' + s).join('\n'));
        else blocks.push(items.map((s) => '- [ ] ' + s).join('\n'));
      } else {
        blocks.push(trimmed.trim());
      }
    });
    return blocks.join('\n\n') + '\n';
  
  },
  // (was _downloadMarkdown)
  downloadMarkdown(ctx, filename, content) {
    const { state, ctrl } = ctx;
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (filename.split('/').pop() || '子弹图.md');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (_) { /* 兜底也失败则静默 */ }
  
  },
  // (was _exportMindmap)
  async exportMindmap(ctx) {
    const { state, ctrl } = ctx;
    // 只有「框选(多选)」才导出选中分支；单选一颗子弹视为导出整张图，
    // 避免随手点中一颗就把整图缩成孤零零一支。
    const mm = MindmapFeature;
    const marquee = (mm && mm._selSet && mm._selSet.size) ? Array.from(mm._selSet) : null;
    const data = mm.buildMarkdown(marquee);
    if (!data || !data.content) { ctrl._showScreenMsg('没有可导出的子弹', 1200); return; }
    const grp = await TypewriterStore.getCurrentMindmapGroup();
    const base = (grp.title || '未命名思维导图')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[.\s]+|[.\s]+$/g, '')
      .slice(0, 40) || '未命名思维导图';
    // 落库位置：设置弹窗里的「子弹导出目录」（Vault 相对路径），默认 思维子弹
    const folder = ((window.SettingsModal && window.SettingsModal.mmExportFolder) || '思维子弹').replace(/^\/+/, '');
    // 与写作「保存快照」完全对齐：每次导出生成带时间戳的独立笔记（思维子弹/<组名> 快照 <时间>.md），
    // 互不覆盖，自然形成可回看的版本历史。
    const d = new Date();
    const p2 = (n) => String(n).padStart(2, '0');
    const ts = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}.${p2(d.getMinutes())}.${p2(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`;
    const snapName = `${base} 快照 ${ts}`;
    const filename = `${folder}/${snapName}.md`;
    ctrl._showScreenMsg('EXPORTING...', 1200);
    try {
      const sm = window.storageManager;
      if (sm && typeof sm.exportMindmap === 'function') {
        const res = await sm.exportMindmap(filename, data.content);
        if (res && res.ok) {
          ctrl._showScreenMsg((marquee ? '已落库（选中分支）：' : '已落库：') + snapName, 1900);
          try { if (sm.openFile) await sm.openFile(filename); } catch (_) { /* 打开失败不影响落库 */ }
          return;
        }
      }
      throw new Error('bridge 不可用');
    } catch (e) {
      // 兜底：桥未连接（纯网页/测试环境）时下载 .md，保证按钮永远可用
      ctrl._downloadMarkdown(filename, data.content);
      ctrl._showScreenMsg('已下载 .md（桥未连接）', 2000);
    }
  
  },
};