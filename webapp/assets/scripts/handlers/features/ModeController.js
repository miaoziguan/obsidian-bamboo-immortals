// ModeController — 从 typewriterFeature 巨型单例（B1 解耦）抽出的子系统。
// 方法体逐字搬运，所有内部调用经 ctrl._xxx 由 feature 委托壳自动解析回原对象。
// 共享常量（裸名引用由本 import 提供；测试 harness 剥离 import 时由 twConfig 挂 globalThis 兜底）
import { ICON_PRINT, ICON_X, ICON_FONT_DOWN, ICON_FONT_UP, ICON_ZOOM_OUT, ICON_ZOOM_IN, ICON_PAPER, ICON_MOVE_UP, ICON_MOVE_DOWN, ICON_LV_UP, ICON_LV_DOWN, ICON_ROTATE } from './twConfig.js';
import { STACK_STEP, STACK_LEVELS, TYPE_SPEED, NOTE_CAP, WRITE_FLOW_GAP, SAVE_DEBOUNCE, LOD_DENSITY, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from './twConfig.js';
// 三档差异真源（P2）：抬头 / 输入上限 / 元信息条 / 机身键语义 / 文档种类 / 装饰归属 → 全部查表
import { ModePolicy, META_IDS } from './modePolicy.js';
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

/**
 * 宿主 MarkdownRenderer 回传的是 HTML 字符串。预览是只读视图，插进 shadow root 前先剥掉
 * 可执行节点与内联事件：用户笔记里的 raw HTML 不该借预览获得脚本能力。
 * 用 <template> 解析而非直接 innerHTML，可在挂进文档之前清洗（此时脚本/资源都还没机会执行）。
 */
/** 复制图标（Lucide copy）：常量，不含任何用户数据。宿主按钮的图标样式随宿主 CSS 一起丢了，这里自带。 */
const PREVIEW_COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

/** 只读预览里的文本复制：优先标准 API，data: iframe / 旧 webview 降级 execCommand。 */
async function copyPreviewText(host, text) {
  const nav = (typeof navigator !== 'undefined') ? navigator : null;
  if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
    try { await nav.clipboard.writeText(text); return true; } catch (_) { /* 降级 */ }
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  const parent = (host && host.parentNode) || document.body;
  parent.appendChild(ta);
  try { ta.select(); } catch (_) { /* 选区失败仍继续尝试 */ }
  let ok = false;
  try { ok = !!document.execCommand('copy'); } catch (_) { /* 环境不支持 */ }
  ta.remove();
  return ok;
}

function mountPreviewHtml(host, html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const blocked = ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'FORM'];
  Array.from(tpl.content.querySelectorAll('*')).forEach((el) => {
    if (blocked.indexOf(el.tagName) >= 0) { el.remove(); return; }
    // Obsidian 把 `- [x]` 渲染成原生 <input type=checkbox>；shadow root 不继承宿主的
    // .task-list-item-checkbox 样式，会落回 UA 大白方块且尺寸失控（还会盖住文字）。
    // 只读预览不需要表单控件：换成自绘圆点，彻底脱离 UA 外观与主题覆盖。
    if (el.tagName === 'INPUT' && String(el.getAttribute('type') || '').toLowerCase() === 'checkbox') {
      const li = el.closest ? el.closest('li') : null;
      const done = el.hasAttribute('checked') || el.checked
        || !!(li && (li.getAttribute('data-task') === 'x' || li.classList.contains('is-checked')));
      const mark = document.createElement('span');
      mark.className = 'tw-preview-check';
      mark.setAttribute('aria-hidden', 'true');
      if (done) mark.classList.add('is-checked');
      el.replaceWith(mark);
      return;
    }
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = String(attr.value || '').trim();
      if (name.indexOf('on') === 0) el.removeAttribute(attr.name);
      else if ((name === 'href' || name === 'src') && /^javascript:/i.test(val)) el.removeAttribute(attr.name);
    });
  });
  // 代码块复制钮：宿主 MarkdownRenderer 会注入 .copy-code-button，但 shadow root 拿不到宿主 CSS
  // （裸 button 退化成 48px 白方块并掉进文档流），宿主的事件委托也够不到这份 HTML 副本。
  // 统一改造成自有按钮：移进 <pre>、右上角定位（见 scroll-pager.css），并接管点击复制与反馈。
  // 宿主各版本类名不完全一致：经典 .copy-code-button、新版 .code-block-flair 里的裸按钮、
  // 或只有 aria-label 的按钮，都归到同一套处理。
  const COPY_BTN_SEL = '.copy-code-button, [class*="copy-code"], .code-block-flair button,'
    + ' button[aria-label*="opy"], button[aria-label*="复制"]';
  Array.from(tpl.content.querySelectorAll(COPY_BTN_SEL)).forEach((btn) => {
    const holder = btn.parentElement;
    const prev = btn.previousElementSibling;
    const near = holder && (holder.previousElementSibling || holder.nextElementSibling);
    // 宿主结构有好几种：按钮在 <pre> 内、紧贴 <pre>、或包在 .code-block-flair 之类的小容器里。
    const pre = btn.closest('pre')
      || (prev && prev.tagName === 'PRE' ? prev : null)
      || (near && near.tagName === 'PRE' ? near : null)
      || (holder && holder.querySelector('pre'));
    if (!pre) { btn.remove(); return; }   // 找不到归属代码块：宁可去掉，也不留流内白方块
    pre.classList.add('tw-preview-code');
    btn.className = 'tw-preview-copy';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', '复制代码');
    btn.setAttribute('title', '复制代码');
    btn.innerHTML = PREVIEW_COPY_ICON;
    if (btn.parentNode !== pre) pre.appendChild(btn);
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const code = pre.querySelector('code');
      const ok = await copyPreviewText(host, code ? code.textContent : pre.textContent);
      const label = ok ? '已复制' : '复制失败';
      btn.classList.toggle('is-copied', ok);
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      if (btn._copyTimer) clearTimeout(btn._copyTimer);
      btn._copyTimer = setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.setAttribute('aria-label', '复制代码');
        btn.setAttribute('title', '复制代码');
      }, 1500);
    });
  });
  host.innerHTML = '';
  host.appendChild(tpl.content);
}

export const ModeController = {
  // (was _cycleMode)
  cycleMode(ctx, dir) {
    const { state, ctrl } = ctx;
    const step = dir >= 0 ? 1 : -1;
    // 切档含 await：期间的连拨不再静默丢弃，而是累积净步数，待当前切档完成后接续（避免快速拨动丢档）
    if (ctrl._switching) { ctrl._pendingModeDir = (ctrl._pendingModeDir || 0) + step; return; }
    // 拨齿顺序与合法性都由策略表持有（MODE_ORDER），此处不再自带一份数组
    ctrl._setMode(ModePolicy.next(ctrl._mode, step));

  },
  // (was _setMode)
  async setMode(ctx, mode) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    if (!ModePolicy.isMode(mode) || mode === ctrl._mode) return;
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
      // 【顺序】必须「先退出编辑、再落盘」——上面那句注释就是这么承诺的（半截编辑先提交）。
      // 文本是**退出编辑时才写进模型**的（CardInteractions.exitEdit 里的 WritingDoc.setText）。
      // 原先先 persistDoc 后 exitAllEdits：这次编辑既没进本档存档，随后 _loadDoc 又用新档卡片
      // 覆盖 _notes → 丢失（未提交的输入法组字 + 未经 blur 的切档触发时命中）。
      // 与 switchWritingGroup 的正确顺序（先 _exitAllEdits 再 _persistDoc）对齐。
      ctrl._exitAllEdits();
      if (ctrl._mode === 'mindmap') {
        MindmapFeature.deactivate();
      } else {
        await ctrl._persistDoc(prev);   // 把这一档的卡片写回它自己的文档
      }
      ctrl._clearSelection();

      ctrl._mode = mode;
      // 【档位所有权】贴纸是便签档专属装饰：离开便签档时整层隐藏（_applyModeChrome 里的 _syncDecoLayer）。
      // 【性能·B】不销毁、只「停放」：自由贴纸留在装饰层里隐藏即可，切回便签档时免去全量重建；
      //   依附在卡片里的贴纸会随卡片被清掉，故此时仍走 detach（清空后切回再重建）。
      if (!ModePolicy.ownsStickers(mode) && typeof ctrl._parkStickers === 'function') await ctrl._parkStickers();
      // 导图自绘层；便签/写作共用同一张卡片画布作为渲染介质，但数据各存各的
      ctrl._canvas.hidden = ctrl._mode === 'mindmap';
      // 写作档外观必须**先于**载入卡片生效：_loadDoc 会量卡片尺寸并做「带入视野」校正，
      // 若此刻还挂着便签的纸样样式，量到的是纸样尺寸（连 aspect-ratio 都不同），位置会算歪。
      ctrl._refreshModeScope();

      if (knob) {
        const kP = ModePolicy.of(mode);
        knob.dataset.mode = mode;
        knob.classList.toggle('is-on', kP.id === 'mindmap');
        knob.setAttribute('aria-pressed', kP.id === 'mindmap' ? 'true' : 'false');
        knob.title = kP.knobTitle;
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
          // ⚠️ 只摘「画布直接子级」的 SVG（连线层 tw-links / 控件层 tw-links-ctl）。
          //    不能 querySelectorAll('svg') —— 贴纸内容 `.bm-sticker-content > svg` 也在画布内，
          //    一并删除会让贴纸变空白（这正是历史上「切回便签档必须重建贴纸」的原因）。
          Array.from(ctrl._canvas.children)
            .filter((el) => el.tagName && el.tagName.toLowerCase() === 'svg')
            .forEach((s) => s.remove());
        }
        await ctrl._loadDoc(mode);
        if (ctrl._undoStack) ctrl._undoStack.reset();
        // 贴纸不属于卡片文档、不会随 _loadDoc 回来 → 切回便签档要按当前组把贴纸挂回去。
        // 走 ctrl 委托壳（_reloadStickers）而非全局探测：模块作用域里 typeof MaterialMarket
        // 探不到值，旧写法让这条重建长期静默失效（现象即「切走再切回看不到，重启才又能看到」）。
        if (ModePolicy.ownsStickers(mode) && typeof ctrl._reloadStickers === 'function') {
          await ctrl._reloadStickers();
        }
      }

      ctrl._applyModeChrome();       // 载入后再刷一次：计数/元信息取自刚载入的新文档真值
      ctrl._scheduleRenderLinks();
      const msgP = ModePolicy.of(mode);
      ctrl._showScreenMsg(msgP.msg || '', msgP.msgMs || 1900);
      TypewriterStore.setMode(mode).catch(() => {});   // 持久化档位，下次启动恢复（best-effort）
    } finally {
      ctrl._switching = false;
      // 接续连拨：把切档期间累积的净步数一次性落到最新档位（3 档循环，净步数已含方向）
      const pending = ctrl._pendingModeDir || 0;
      ctrl._pendingModeDir = 0;
      if (pending) {
        const st = pending > 0 ? 1 : -1;
        let target = ctrl._mode;
        for (let k = 0; k < Math.abs(pending); k += 1) target = ModePolicy.next(target, st);
        if (target && target !== ctrl._mode) this.setMode(ctx, target);
      }
    }
  
  },
  // (was _getDocKind)
  getDocKind(ctx) {
    const { state, ctrl } = ctx;
    return ModePolicy.docKind(ctrl._mode);
  
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
    } else if (kind === 'notes') {
      groups = await TypewriterStore.listNotesGroups();
      const cur = await TypewriterStore.getCurrentNotesGroup();
      curId = cur ? cur.id : null;
      headText = '便签组'; addText = '＋ 新建便签组';
    } else {
      groups = await TypewriterStore.listWritingGroups();
      const cur = await TypewriterStore.getCurrentWritingGroup();
      curId = cur ? cur.id : null;
      headText = '写作卡片组'; addText = '＋ 新建卡片组';
    }
    const fallback = kind === 'mindmap' ? '未命名思维导图' : (kind === 'notes' ? '未命名便签' : '未命名草稿');
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
    if (ctrl._mode !== 'write' || ctrl._docBusy || ctrl._switching) return;
    const cur = (await TypewriterStore.getCurrentWritingGroup()).id;
    // 切换后**不关闭**菜单：用户常需要在同一张列表里连续比对/切换几组，
    // 每切一次就收起等于逼他重开。选中态由本方法末尾的 _renderDocPanel() 重渲刷新。
    if (id === cur) return;
    ctrl._docBusy = true;
    ctrl._switching = true;   // 切组窗口挡防抖落盘/剔除重挂载（同 setMode 语义），防旧组内容写进新组文件
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
      ctrl._switching = false;
      ctrl._docBusy = false;
      // 分组操作窗口内若拨了旋钮，cycleMode 会因 _switching 为真而累积净步数。
      // 但这个窗口不是切档，累积值对它毫无意义，必须就地丢弃 —— 否则会残留到
      // 下一次**无关**的切档才被消费，表现为「莫名多跳一档」。
      ctrl._pendingModeDir = 0;
    }
  
  },
  // (was _createWritingGroup)
  /** opts: { title, notePath, chunks } —— 从笔记导入时一次跑完「建组 + 铺卡」，
   *  复用同一把 _docBusy/_switching 锁，避免导入过程中防抖落盘把旧组内容写进新组。 */
  async createWritingGroup(ctx, opts) {
    const { state, ctrl } = ctx;
    const o = opts || {};
    // 返回 true 表示建组成功；false 表示被模式/忙碌锁拒绝（调用方据此报告失败，
    // 不能假装成功 —— 导入路径尤其需要，否则用户以为导进去了其实什么都没发生）
    if (ctrl._mode !== 'write' || ctrl._docBusy || ctrl._switching) return false;
    ctrl._docBusy = true;
    ctrl._switching = true;   // 新建组窗口挡防抖落盘（同 setMode 语义），防旧组内容写进新组文件
    try {
      ctrl._exitAllEdits();
      if (ctrl._saveTimer) { clearTimeout(ctrl._saveTimer); ctrl._saveTimer = null; }
      await ctrl._persistDoc('write');          // 先存好当前组
      await TypewriterStore.createWritingGroup(o.title || '未命名草稿', o.notePath || null);
      await ctrl._loadDoc('write');             // 新组为空，画布清空
      if (ctrl._undoStack) ctrl._undoStack.reset();
      await ctrl._refreshDocBtnLabel();
      await ctrl._renderDocPanel();             // 刷新列表（面板保持打开）
      if (Array.isArray(o.chunks) && o.chunks.length) {
        if (o.chunks.length === 1 && typeof ctrl._spawn === 'function') {
          // _importDraft 要求 ≥2 块（单块走普通打印），这里对齐同一口径
          ctrl._spawn(o.chunks[0].text, o.chunks[0].level);
          ctrl._showScreenMsg('IMPORTED 1 BLOCK', 1600);   // 与 _importDraft 的寻呼机文案同风格
        } else if (typeof ctrl._importDraft === 'function') {
          ctrl._importDraft(o.chunks);          // 快照导入：一次性铺成卡片 + 链式连线
        }
      } else {
        ctrl._showScreenMsg('已新建卡片组', 1200);
      }
      return true;
    } finally {
      ctrl._switching = false;
      ctrl._docBusy = false;
      // 分组操作窗口内若拨了旋钮，cycleMode 会因 _switching 为真而累积净步数。
      // 但这个窗口不是切档，累积值对它毫无意义，必须就地丢弃 —— 否则会残留到
      // 下一次**无关**的切档才被消费，表现为「莫名多跳一档」。
      ctrl._pendingModeDir = 0;
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
      } else if (kind === 'notes') {
        await TypewriterStore.renameNotesGroup(id, v || cur);
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
    if (ctrl._mode !== 'write' || ctrl._docBusy || ctrl._switching) return;
    const idx = await TypewriterStore.ensureWritingIndex();
    const g = idx.groups[id];
    if (!g) return;
    const warn = '确定删除卡片组「' + (title || '未命名草稿') + '」？此操作无法撤销。';
    if (!window.confirm(warn)) return;
    ctrl._docBusy = true;
    ctrl._switching = true;   // 删组窗口挡防抖落盘（同 setMode 语义）
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
      ctrl._switching = false;
      ctrl._docBusy = false;
      // 分组操作窗口内若拨了旋钮，cycleMode 会因 _switching 为真而累积净步数。
      // 但这个窗口不是切档，累积值对它毫无意义，必须就地丢弃 —— 否则会残留到
      // 下一次**无关**的切档才被消费，表现为「莫名多跳一档」。
      ctrl._pendingModeDir = 0;
    }
  
  },
  async switchNotesGroup(ctx, id) {
    const { state, ctrl } = ctx;
    if (ctrl._mode !== 'notes' || ctrl._docBusy || ctrl._switching) return;
    const cur = (await TypewriterStore.getCurrentNotesGroup()).id;
    // 切换后不关闭菜单（同上：便于连续切换，选中态由 _renderDocPanel 刷新）
    if (id === cur) return;
    ctrl._docBusy = true;
    ctrl._switching = true;   // 切便签组窗口挡防抖落盘（同 setMode 语义）
    try {
      ctrl._exitAllEdits();
      if (ctrl._saveTimer) { clearTimeout(ctrl._saveTimer); ctrl._saveTimer = null; }
      await ctrl._persistDoc('notes');
      await TypewriterStore.setNotesCurrent(id);
      await ctrl._loadDoc('notes');
      // 贴纸按便签组独立持久化：切组后按新组重建（贴纸属于某一组，不跨组串味）
      if (typeof ctrl._reloadStickers === 'function') {
        await ctrl._reloadStickers();
      }
      if (ctrl._undoStack) ctrl._undoStack.reset();
      ctrl._scheduleRenderLinks();
      await ctrl._refreshDocBtnLabel();
      await ctrl._renderDocPanel();
      ctrl._showScreenMsg('已切换便签组', 1200);
    } finally {
      ctrl._switching = false;
      ctrl._docBusy = false;
      // 分组操作窗口内若拨了旋钮，cycleMode 会因 _switching 为真而累积净步数。
      // 但这个窗口不是切档，累积值对它毫无意义，必须就地丢弃 —— 否则会残留到
      // 下一次**无关**的切档才被消费，表现为「莫名多跳一档」。
      ctrl._pendingModeDir = 0;
    }
  },
  async createNotesGroup(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._mode !== 'notes' || ctrl._docBusy || ctrl._switching) return;
    ctrl._docBusy = true;
    ctrl._switching = true;   // 新建便签组窗口挡防抖落盘（同 setMode 语义）
    try {
      ctrl._exitAllEdits();
      if (ctrl._saveTimer) { clearTimeout(ctrl._saveTimer); ctrl._saveTimer = null; }
      await ctrl._persistDoc('notes');
      await TypewriterStore.createNotesGroup('未命名便签');
      await ctrl._loadDoc('notes');
      // 同上：新建组是空组，重建即清掉上一组残留的贴纸
      if (typeof ctrl._reloadStickers === 'function') {
        await ctrl._reloadStickers();
      }
      if (ctrl._undoStack) ctrl._undoStack.reset();
      await ctrl._refreshDocBtnLabel();
      await ctrl._renderDocPanel();
      ctrl._showScreenMsg('已新建便签组', 1200);
    } finally {
      ctrl._switching = false;
      ctrl._docBusy = false;
      // 分组操作窗口内若拨了旋钮，cycleMode 会因 _switching 为真而累积净步数。
      // 但这个窗口不是切档，累积值对它毫无意义，必须就地丢弃 —— 否则会残留到
      // 下一次**无关**的切档才被消费，表现为「莫名多跳一档」。
      ctrl._pendingModeDir = 0;
    }
  },
  async deleteNotesGroup(ctx, id, title) {
    const { state, ctrl } = ctx;
    if (ctrl._mode !== 'notes' || ctrl._docBusy || ctrl._switching) return;
    const idx = await TypewriterStore.ensureNotesIndex();
    const g = idx.groups[id];
    if (!g) return;
    const warn = '确定删除便签组「' + (title || '未命名便签') + '」？此操作无法撤销。';
    if (!window.confirm(warn)) return;
    ctrl._docBusy = true;
    ctrl._switching = true;   // 删便签组窗口挡防抖落盘（同 setMode 语义）
    try {
      ctrl._exitAllEdits();
      if (ctrl._saveTimer) { clearTimeout(ctrl._saveTimer); ctrl._saveTimer = null; }
      const wasCurrent = (await TypewriterStore.getCurrentNotesGroup()).id === id;
      await TypewriterStore.deleteNotesGroup(id);
      if (wasCurrent) await ctrl._loadDoc('notes');
      if (ctrl._undoStack) ctrl._undoStack.reset();
      await ctrl._refreshDocBtnLabel();
      await ctrl._renderDocPanel();
      ctrl._showScreenMsg('已删除便签组', 1200);
    } finally {
      ctrl._switching = false;
      ctrl._docBusy = false;
      // 分组操作窗口内若拨了旋钮，cycleMode 会因 _switching 为真而累积净步数。
      // 但这个窗口不是切档，累积值对它毫无意义，必须就地丢弃 —— 否则会残留到
      // 下一次**无关**的切档才被消费，表现为「莫名多跳一档」。
      ctrl._pendingModeDir = 0;
    }
  },

  // (was _switchDocGroup)
  async switchDocGroup(ctx, kind, id) {
    const { state, ctrl } = ctx;
    if (kind === 'mindmap') {
      if (ctrl._docBusy || ctrl._switching) return;
      ctrl._docBusy = true;
      // 与 notes/write 的分组操作对称（switchWritingGroup / switchNotesGroup 都置这对标记）：
      // setMode 只认 _switching，只置 _docBusy 挡不住「切组与切档交错」——
      // 导图的窗口在 _groupId 已切换、load() 未完成时 _nodes 仍是旧组的，
      // 此时切档 → deactivate() → _saveNow() 会把旧组内容落进新组文件。
      ctrl._switching = true;
      try {
        // 切换后不关闭菜单（同 notes/write：便于连续切换，选中态由 _renderDocPanel 刷新）
        const cur = (await TypewriterStore.getCurrentMindmapGroup()).id;
        if (id !== cur) {
          await MindmapFeature.switchGroup(id);
          await ctrl._refreshDocBtnLabel();
          await ctrl._renderDocPanel();
          ctrl._showScreenMsg('已切换思维导图组', 1200);
        }
      } finally { ctrl._docBusy = false; ctrl._switching = false; ctrl._pendingModeDir = 0; }
    } else if (kind === 'notes') {
      await ctrl._switchNotesGroup(id);
    } else {
      await ctrl._switchWritingGroup(id);
    }
  
  },
  // (was _createDocGroup)
  async createDocGroup(ctx, kind) {
    const { state, ctrl } = ctx;
    if (kind === 'mindmap') {
      if (ctrl._docBusy || ctrl._switching) return;
      ctrl._docBusy = true;
      ctrl._switching = true;   // 同 switchDocGroup：新建组窗口同样要挡住切档
      try {
        ctrl._exitAllEdits();
        await MindmapFeature.newGroup();
        await ctrl._refreshDocBtnLabel();
        await ctrl._renderDocPanel();
        ctrl._showScreenMsg('已新建思维导图组', 1200);
      } finally { ctrl._docBusy = false; ctrl._switching = false; ctrl._pendingModeDir = 0; }
    } else if (kind === 'notes') {
      await ctrl._createNotesGroup();
    } else {
      await ctrl._createWritingGroup();
    }
  
  },
  // (was _deleteDocGroup)
  async deleteDocGroup(ctx, kind, id, title) {
    const { state, ctrl } = ctx;
    if (kind === 'mindmap') await ctrl._deleteMindmapGroup(id, title);
    else if (kind === 'notes') await ctrl._deleteNotesGroup(id, title);
    else await ctrl._deleteWritingGroup(id, title);
  
  },
  // (was _deleteMindmapGroup)
  async deleteMindmapGroup(ctx, id, title) {
    const { state, ctrl } = ctx;
    if (ctrl._docBusy || ctrl._switching) return;
    const idx = await TypewriterStore.ensureMindmapIndex();
    const g = idx.groups[id];
    if (!g) return;
    const warn = '确定删除思维导图组「' + (title || '未命名思维导图') + '」？此操作无法撤销。';
    if (!window.confirm(warn)) return;
    ctrl._docBusy = true;
    ctrl._switching = true;   // 同 switchDocGroup：删组窗口同样要挡住切档
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
      ctrl._switching = false;
      ctrl._pendingModeDir = 0;   // 同上：删组窗口内的旋钮累积就地丢弃
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
    } else if (kind === 'notes') {
      const g = await TypewriterStore.getCurrentNotesGroup();
      title = (g && g.title) || '未命名便签';
      prefix = '当前便签组：';
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
    // 【P2】三档差异一律查策略表（modePolicy.js），不再在本函数里散落 if (_mode === 'x')
    const P = ModePolicy.of(ctrl._mode);
    const mm = P.id === 'mindmap';
    // 切档时收起卡片搜索浮层：它挂在功能根上，不随画布重建，留着会跨档残留
    if (typeof ctrl._closeCardSearch === 'function') ctrl._closeCardSearch();
    // 缩放条互斥：便签与导图各有一条（分别挂在 wrap 与 .tw-mm 上）。
    // 只显示当前模式对应的那条，否则导图模式下会叠出两条重叠的缩放条。
    // （导图层在便签模式下 layer.hidden = true，其缩放条随之隐藏，无需额外处理。）
    for (let i = 0; i < root.children.length; i++) {
      const c = root.children[i];
      if (c && c.classList && c.classList.contains('tw-zoom-bar')) c.hidden = mm;
    }
    // 素材市场按钮：仅「拥有装饰物（贴纸）」的档位可见 —— 目前只有便签档
    const mktBtn = root.querySelector('.tw-zoom-market');
    if (mktBtn) mktBtn.hidden = !P.ownsStickers;
    // 层级配色按钮：只有写作档有意义（level 是写作档的结构字段）。
    // 便签档虽也存 level，但卡片不按级别读；导图根本没有 level —— 一律隐藏，避免误点无反馈。
    const tintBtn = root.querySelector('.tw-zoom-tint');
    if (tintBtn) tintBtn.hidden = P.id !== 'write';
    // 文章连线（一键连成链 / 一键清空）只有写作档有语义：该档连线定义文章顺序，
    // 便签档连线只是关联、导图档有自己的一套 bar。非写作档一律隐藏，避免误点无反馈。
    const linkToggleBtn = root.querySelector('.tw-zoom-link-toggle');
    if (linkToggleBtn) linkToggleBtn.hidden = P.id !== 'write';
    // 档位专属装饰层（贴纸属于便签档）：非便签档整层隐藏 ——
    // 从渲染树上保证不串档，而不是只靠「逐个摘除」（P1）。
    if (typeof ctrl._syncDecoLayer === 'function') ctrl._syncDecoLayer();
    const set = (sel, fn) => { const el = root.querySelector(sel); if (el) fn(el); };
    set('#twScreenTitle', (el) => { el.textContent = P.screen.title; });
    // 元信息分档：便签=FONT·PAPER；写作=卡片·连线；导图=子弹·连线。
    // 此前写作档借用便签那条（显隐判据只是「非导图」），漏出 FONT·PAPER ——
    // 而写作档根本没有字体/纸样：工具条两键已改作预览/导出，卡片的纸样钮也被隐藏。
    META_IDS.forEach((id) => set(id, (el) => { el.hidden = id !== P.meta; }));
    const input = ctrl._input;
    if (input) {
      // 输入框上限按档位切换：便签档 = 单卡上限（写不下即截）；写作档 = 草稿箱上限，
      // 允许整篇长文粘进来，打印时再由 splitDraft 拆成多块（单卡仍 ≤ MAX_LEN）。
      input.maxLength = P.input.maxLen;
      input.placeholder = P.screen.ph;
      input.setAttribute('aria-label', P.screen.ph.replace('...', ''));
      input.value = (ctrl._draft && ctrl._draft[ctrl._mode]) || '';
    }
    // 机身键三档语义不同（纸样 / 字体 / 排版 / 打印）：一律查表，不再逐个 if 分支。
    const applyBtn = (sel, b) => set(sel, (el) => {
      el.disabled = false;
      el.title = b.title;
      el.setAttribute('aria-label', b.aria);
      el.innerHTML = b.icon;
    });
    applyBtn('#twPaper', P.buttons.paper);
    applyBtn('#twFont', P.buttons.font);
    applyBtn('#twArrange', P.buttons.arrange);
    // 文档组切换角控件：档位有文档种类才可见，浮于画布右上角（异步刷新组名，不阻塞 Chrome）
    set('#twDocCorner', (el) => {
      const kind = P.docKind;
      el.hidden = !kind;
      if (kind) ctrl._refreshDocBtnLabel();
    });
    set('#twPrint', (el) => { el.title = P.buttons.print.title; });
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
      // 【P1-9】此前误写 #twLinkCount（那是**写作档** meta 里的元素，见 typewriterFeature.js:227），
      // 导图档 meta 里的连线计数元素实为 #twDepthCount（:228）→ 导图连了多少条线都显示「连线 0」。
      set('#twDepthCount', String(s.links));
      return;
    }
    if (ctrl._mode === 'write') {
      // 【P8 视口剔除】卡片 DOM 会被卸载 → 数挂载 DOM 只得到可见卡数；总数以模型 _notes 为准
      const n = ctrl._notes ? ctrl._notes.length : 0;
      set('#twCardCount', String(n));
      set('#twLinkCount', String((ctrl._links || []).length));
    }
  
  },
  /**
   * 给画布打上「档位作用域」class：tw-mode-notes / tw-mode-write / tw-mode-mindmap（三选一）。
   *
   * 目的：让三档各自拥有独立的外观作用域，CSS 才能按档位隔离 —— 否则「便签档的默认值」
   * 天然会成为「写作档的默认值」（3.28.21 的便签定宽删掉 max-width，导致写作档
   * max-content 失去上限、卡片无限撑宽压叠，即此类事故）。
   *
   * 【时机】必须在**首次挂载**与**切档**两处都执行。只做切档的话，首屏（默认便签档）
   * 拿不到自己的作用域，一旦把便签样式迁进 tw-mode-notes 就会首屏丢样式。
   */
  refreshModeScope(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    const m = ctrl._mode;
    ctrl._canvas.classList.toggle('tw-mode-notes', m === 'notes');
    ctrl._canvas.classList.toggle('tw-mode-write', m === 'write');
    ctrl._canvas.classList.toggle('tw-mode-mindmap', m === 'mindmap');
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
    const rendered = modal.querySelector('#twPreviewRendered');
    body.value = content;                         // 原文始终保留：降级视图 / 复制 / 既有契约
    // 结构概览：卡片数与（去空白）字数，便于快速判断整篇规模是否符合预期
    modal.querySelector('#twPreviewStat').textContent =
      ordered.length + ' 张 · ' + content.replace(/\s/g, '').length + ' 字';
    modal.hidden = false;
    body.scrollTop = 0;   // 每次打开都从开头看起

    // 每轮先复位到纯文本，避免上一次的渲染结果残留；随后异步升级为阅读视图。
    const toggle = modal.querySelector('#twPreviewToggle');
    if (rendered) { rendered.hidden = true; rendered.innerHTML = ''; }
    body.hidden = false;
    if (toggle) { toggle.hidden = true; toggle.onclick = null; }
    setTimeout(() => { if (!body.hidden) body.focus(); }, 0);

    // 现成桥：moduleManager.renderMarkdown → 宿主 module:renderMarkdown → Obsidian MarkdownRenderer。
    // 异步不阻塞弹层打开；桥缺失 / 返回空 / 抛错都保持纯文本，不会退化成「预览打不开」。
    const seq = (ctrl._previewRenderSeq = (ctrl._previewRenderSeq || 0) + 1);
    const sm = (typeof window !== 'undefined') ? window.storageManager : null;
    // storageManager 上的是 bridge 方法 moduleRenderMarkdown；renderMarkdown 是 _buildApi
    // 交给「模块」的能力名（挂在模块 API 对象上，不在 storageManager 上），两者都兼容。
    const renderMarkdown = sm && (sm.moduleRenderMarkdown || sm.renderMarkdown);
    if (!rendered || typeof renderMarkdown !== 'function') return;
    Promise.resolve()
      .then(() => renderMarkdown.call(sm, { content, sourcePath: '' }))
      .then((html) => {
        if (ctrl._previewRenderSeq !== seq || modal.hidden) return;   // 已关闭 / 又开了一轮
        if (typeof html !== 'string' || !html.trim()) return;          // 桥不可用 → 保持原文
        mountPreviewHtml(rendered, html);
        rendered.hidden = false;
        body.hidden = true;
        rendered.scrollTop = 0;
        rendered.focus();
        // 渲染视图盖住了原文，给一条回退路径：确认结构 / 复制 markdown 时仍能切回去。
        if (toggle) {
          toggle.hidden = false;
          toggle.textContent = '查看原文';
          toggle.onclick = () => {
            const toRaw = !rendered.hidden;      // 当前是阅读视图 → 切到原文
            rendered.hidden = toRaw;
            body.hidden = !toRaw;
            toggle.textContent = toRaw ? '返回阅读视图' : '查看原文';
            (toRaw ? body : rendered).focus();
          };
        }
      })
      .catch(() => { /* 渲染失败：保留纯文本预览 */ });

  },
  // (was _closePreviewModal)
  closePreviewModal(ctx) {
    const { state, ctrl } = ctx;
    ctrl._previewRenderSeq = (ctrl._previewRenderSeq || 0) + 1;   // 作废在途渲染，防回填到已关闭的弹层
    const modal = ctrl._el.querySelector('#twPreviewModal');
    if (modal) modal.hidden = true;

  },
  // (was _buildCardsMarkdown)
  buildCardsMarkdown(ctx, ordered) {
    const { state, ctrl } = ctx;
    // 【P8 视口剔除】文本/层级必须来自模型真源，绝不能再读 c.el.dataset/innerText：
    // 离屏卡被剔、c.el 为 null，读 DOM 会抛「Cannot read dataset of null」→ 导出/快照/预览直接崩。
    const byId = ctrl._notes ? new Map(ctrl._notes.map((n) => [n.id, n])) : null;
    const blocks = [];
    let olN = 0;   // 有序列表跨卡连续累加（非全局阅读序 i），避免编号错位/跳号
    ordered.forEach((c, i) => {
      const id = c.id;
      let text = '';
      let lv = 'p';
      if (byId) {
        const note = byId.get(id);
        if (note) { text = note.text || ''; lv = note.level || 'p'; }   // 真源：模型
      } else if (c.el) {
        text = ((c.el.querySelector('.tw-card-text') || {}).innerText) || '';
      }
      const trimmed = String(text).replace(/\s+$/, '');
      if (!trimmed.trim()) return;
      const lines = trimmed.split('\n');
      if (/^h[1-6]$/.test(lv)) {
        // 首行可能在编辑态被写回带 `#` 的原文，先剥再补，避免导出成 `## ## 标题`
        const head = (lines[0] || '').trim().replace(/^#{1,6}\s+/, '');
        blocks.push('#'.repeat(Number(lv.slice(1))) + ' ' + head);
        const rest = lines.slice(1).join('\n').trim();
        if (rest) blocks.push(rest);
      } else if (lv === 'quote') {
        // detectLevel 只剥首行 `> `，后续行仍带；盲目逐行补会导出成 `> > ...`。
        // 与列表分支同一口径：已有 marker 的行原样（含缩进），只有普通行才补。
        blocks.push(lines.filter((s) => s.trim()).map((s) => {
          const indent = (/^[ \t]*/.exec(s) || [''])[0];
          const body = s.slice(indent.length).trim();
          return indent + (/^>\s?/.test(body) ? body : '> ' + body);
        }).join('\n'));
      } else if (lv === 'ul' || lv === 'ol' || lv === 'task') {
        // 列表三兄弟：一行一项，空行跳过。
        // 编号列表逐行累加序号（与 ul 逐行成 bullet 一致）—— 不要求用户在卡里手写「1. 2. 3.」，
        // 手写反而会因增删项而错乱；且跨卡连续累加，整篇导出为单一有序序列（对齐「文章顺序」）。
        const items = lines.filter((s) => s.trim());
        if (!items.length) return;
        // 行首缩进是嵌套层级语义，必须保留；带缩进的子项通常已有自己的 marker，
        // 盲目逐行加前缀会导出成 `- - 内层` 之类坏 markdown。
        const withIndent = (line, fn) => {
          const indent = (/^[ \t]*/.exec(line) || [''])[0];
          return indent + fn(line.slice(indent.length).trim());
        };
        if (lv === 'ul') blocks.push(items.map((s) => withIndent(s, (t) => (/^[-*]\s+/.test(t) ? t : '- ' + t))).join('\n'));
        // ol：模型里已有编号就原样保留 —— 卡片投影显示的就是它，无条件跨卡累加会让
        // 整篇预览/导出变成 5. 6.（前面几张 ol 卡已把 olN 推高），与卡片对不上。
        // 只有老数据（纯文本、无编号）才按跨卡累加补号，保持「整篇单一有序序列」的既有回归。
        // 带缩进的嵌套项同理：已有编号保留自己的层级，否则补号。
        else if (lv === 'ol') blocks.push(items.map((s) => {
          const indent = (/^[ \t]*/.exec(s) || [''])[0];
          const body = s.slice(indent.length).trim();
          const m = /^(\d+[.)])\s+(.*)$/.exec(body);
          if (m) return indent + m[1] + ' ' + m[2];
          return indent + (++olN) + '. ' + body;
        }).join('\n'));
        // task：正文保留原始 marker（detectLevel 不剥，勾选态就在 marker 里）。
        // 已是 `- [x] 项` 的原样输出；老数据（首行曾被剥成纯文本）或夹着的普通行补 `- [ ] `。
        // 若盲目逐行加前缀会导出成 `- [ ] - [ ] 项`，且把已勾选丢成未勾选。
        else blocks.push(items.map((s) => withIndent(s, (t) => {
          const d = WritingDoc.detectLevel(t);
          return d.level === 'task' ? d.text : '- [ ] ' + d.text;
        })).join('\n'));
      } else if (lv === 'table' || lv === 'code') {
        // 表格 / 围栏代码：`|`、`---`、``` 都是语法，不能加列表/标题前缀，
        // 也不能逐行 trim 掉列内对齐或代码缩进。显式列出，防止以后给 else
        // 加通用处理时误伤结构块。
        blocks.push(trimmed.trim());
      } else {
        blocks.push(trimmed.trim());
      }
    });
    return blocks.join('\n\n') + '\n';
  
  },
  /** PNG 导出兜底：桥不可用 / 写盘失败时把 base64 还原成 Blob 触发浏览器下载。 */
  downloadPng(filename, base64) {
    try {
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (filename.split('/').pop() || '便签.png');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (_) { /* 兜底也失败则静默 */ }
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
    // 落库位置：原生「导出」页的「思维子弹模式导出目录」为唯一真源，读不到再回退设置面板字段/默认
    const fsBridge = window.storageManager;
    const folder = (fsBridge && typeof fsBridge.getExportFolder === 'function')
      ? await fsBridge.getExportFolder('mmExportFolder', '思维子弹')
      : ((window.SettingsModal && window.SettingsModal.mmExportFolder) || '思维子弹').replace(/^\/+/, '');
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