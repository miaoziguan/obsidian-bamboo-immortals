// CardViewManager — 从 typewriterFeature 巨型单例（B1 解耦）抽出的子系统。
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
import { FLOWING_PAPER_SET, FONT_MAX_IDX_FIXED } from './twConfig.js';

export const CardViewManager = {
  // (was _createCardEl)
  createCardEl(ctx, note) {
    const { state, ctrl } = ctx;
    const id = note.id || Math.random().toString(36).slice(2, 8).toUpperCase();
    const font = note.font || 'classic';
    const paper = note.paper || 'plain';
    const date = note.date || ctrl._now();
    const level = (LEVELS.indexOf(note.level) >= 0) ? note.level : 'p';   // 旧数据无 level → 正文
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.setAttribute('role', 'note');
    card.dataset.id = id;
    card.dataset.font = font;
    card.dataset.paper = paper;
    card.dataset.date = date;
    card.dataset.level = level;
    // 【P4】写入档（MD可视化写作）是「文章视图」：画布自此降级为纯呈现层，
    // 旋转 / 纸样切换这些源于便签、与文章语义无关的维度一律禁用。
    // 只关呈现、不动模型（rot / paper 仍存原值），故切回便签档会各自恢复，绝不丢数据。
    const isWrite = ctrl._mode === 'write';
    // 手动缩放：读落盘值（旧数据无 zoom → 默认 1，观感与历史便签一致）
    ctrl._applyZoom(card, note.zoom);
    if (isWrite) {
      // 文章里没有「斜放的段落」：呈现上归零。
      // 注意不能走 _applyRot —— 它会把角度回写进模型（WritingDoc.setRot），
      // 那样等于把用户存档的角度抹掉，违背「只关呈现、不动模型」。故此处只设呈现。
      card.dataset.rot = '0';
      card.style.setProperty('--tw-card-rot', '0deg');
    } else {
      ctrl._applyRot(card, note.rot);
    }
    card.innerHTML = `
      <div class="tw-card-edge tw-card-edge-top" aria-hidden="true"></div>
      <div class="tw-card-main">
        <div class="tw-card-noise" aria-hidden="true"></div>
        <div class="tw-card-head">
          <span class="tw-card-title">${PAPER_TITLES[paper] || PAPER_TITLES.plain}</span>
        </div>
        <div class="tw-card-meta">
          <span class="tw-card-date"></span>
        </div>
        <div class="tw-card-text"></div>
      </div>
      <div class="tw-card-edge tw-card-edge-bottom" aria-hidden="true"></div>
      <button type="button" class="tw-card-level" aria-label="切换结构级别"></button>
      <div class="tw-card-tools">
        <button type="button" class="tw-card-paper" aria-label="切换便签样式">${ICON_PAPER}</button>
        <button type="button" class="tw-card-move tw-card-move-up" aria-label="上移（文章顺序）">${ICON_MOVE_UP}</button>
        <button type="button" class="tw-card-move tw-card-move-down" aria-label="下移（文章顺序）">${ICON_MOVE_DOWN}</button>
        <button type="button" class="tw-card-lv tw-card-lv-up" aria-label="提升层级">${ICON_LV_UP}</button>
        <button type="button" class="tw-card-lv tw-card-lv-down" aria-label="降低层级">${ICON_LV_DOWN}</button>
        <button type="button" class="tw-card-font tw-card-font-down" aria-label="缩小字号">${ICON_FONT_DOWN}</button>
        <button type="button" class="tw-card-font tw-card-font-up" aria-label="放大字号">${ICON_FONT_UP}</button>
        <button type="button" class="tw-card-zoom-out" aria-label="缩小便签">${ICON_ZOOM_OUT}</button>
        <button type="button" class="tw-card-zoom-in" aria-label="放大便签">${ICON_ZOOM_IN}</button>
        <button type="button" class="tw-card-del" aria-label="移除卡片">${ICON_X}</button>
      </div>`;

    // 工具条按钮/图标内联像素尺寸（与 apply() 中同策略），新卡片立即定型，
    // 不依赖 CSS 的 calc(var()) 在本环境是否可靠。
    const _ctScale = parseFloat(ctrl._el.style.getPropertyValue('--tw-scale')) || 1;
    card.querySelectorAll('.tw-card-tools button').forEach((b) => {
      // 级别钮是文字标签（「正文 / H1 / 引用」），宽度须自适应，不能钉成方钮
      if (b.classList.contains('tw-card-level')) return;
      b.style.width = (20 * _ctScale).toFixed(2) + 'px';
      b.style.height = (20 * _ctScale).toFixed(2) + 'px';
    });
    card.querySelectorAll('.tw-card-tools svg').forEach((s) => {
      s.style.width = (18 * _ctScale).toFixed(2) + 'px';
      s.style.height = (18 * _ctScale).toFixed(2) + 'px';
    });

    card.querySelector('.tw-card-date').textContent = date;
    // 【P4】纸样是便签维度（「信笺 / 夜航」等），文章里没有这个语义 → 写入档隐藏切换钮。
    // 隐藏而非删除：模型值保留，切回便签档按钮自然回来、纸样如旧。
    if (isWrite) {
      const pb = card.querySelector('.tw-card-paper');
      if (pb) pb.hidden = true;
    }

    // 纸样：写入抬头与按钮提示（显示当前纸样名）
    ctrl._applyPaper(card, paper);
    // 结构级别：写入 dataset 与按钮文字（仅MD可视化写作模式下该钮可见）
    ctrl._applyLevel(card, level);
    // 字级档位：旧数据无 fontScale → 落到默认档（1.0）
    ctrl._applyFontScale(card, ctrl._fontIdxOf(note.fontScale, paper));
    ctrl._bindFontSteps(card);
    ctrl._bindZoomSteps(card);
    ctrl._bindPaperSwitch(card);
    ctrl._bindLevelSwitch(card);
    ctrl._bindOrderSteps(card);
    ctrl._bindLevelSteps(card);
    ctrl._bindTools(card);
    ctrl._bindTips(card);
    ctrl._bindEdit(card);

    card.querySelector('.tw-card-del').addEventListener('click', (e) => {
      e.stopPropagation();
      // 单张删除同样要留档：这是最常用的删除入口，漏掉的话 Cmd+Z 就找不回来
      if (ctrl._undoStack) ctrl._undoStack.push();
      ctrl._removeCard(card);
      ctrl._scheduleSave();
    });
    ctrl._makeDraggable(card);
    ctrl._makeResizable(card);
    if (!isWrite) ctrl._makeRotatable(card);   // 【P4】写入档不提供旋转手柄
    ctrl._makeLinkable(card);
    ctrl._watchCardSize(card);
    return card;
  
  },
  // (was _detectWriteLevel)
  detectWriteLevel(ctx, raw) {
    const { state, ctrl } = ctx;
    const lines = String(raw).split('\n');
    const first = lines[0] || '';
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(first))) { lines[0] = m[2]; return { level: 'h' + m[1].length, text: lines.join('\n') }; }
    if ((m = /^>\s+(.*)$/.exec(first))) { lines[0] = m[1]; return { level: 'quote', text: lines.join('\n') }; }
    if ((m = /^[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(first))) { lines[0] = m[2]; return { level: 'task', text: lines.join('\n') }; }
    if ((m = /^[-*]\s+(.*)$/.exec(first))) { lines[0] = m[1]; return { level: 'ul', text: lines.join('\n') }; }
    if ((m = /^\d+[.)]\s+(.*)$/.exec(first))) { lines[0] = m[1]; return { level: 'ol', text: lines.join('\n') }; }
    return { level: 'p', text: raw };
  
  },
  // (was _applyZoom)
  applyZoom(ctx, card, zoom) {
    const { state, ctrl } = ctx;
    const z = ctrl._clampZoom(zoom);
    card.dataset.zoom = z.toFixed(3);
    if (z === 1) card.style.removeProperty('--tw-card-zoom');
    else card.style.setProperty('--tw-card-zoom', z.toFixed(3));
    // 拖拽手柄 / ⌘+滚轮 改完缩放后，尺寸档位按钮的可用态也要跟着更新
    ctrl._syncCardScaleButtons(card);
    // 连续编辑改走 WritingDoc 原语：缩放即改规范模型（与落盘/撤销/导出同源）
    ctrl._notes = WritingDoc.setZoom(ctrl._notes, card.dataset.id, ctrl._clampZoom(card.dataset.zoom));
    ctrl._invalidateGeo(card.dataset.id);   // 缩放改了卡片尺寸 → 几何失效（滚轮/双击复位/档位钮都走这里）
    return z;
  
  },
  // (was _zoomIdxOf)
  zoomIdxOf(ctx, zoom) {
    const { state, ctrl } = ctx;
    const z = ctrl._clampZoom(zoom);
    let idx = CARD_SCALE_DEFAULT_IDX;
    let bestD = Infinity;
    CARD_SCALES.forEach((s, i) => {
      const d = Math.abs(s - z);
      if (d < bestD) { bestD = d; idx = i; }
    });
    return idx;
  
  },
  // (was _clampZoom)
  clampZoom(ctx, z) {
    const { state, ctrl } = ctx;
    const n = Number(z);
    if (!isFinite(n) || n <= 0) return 1;
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, n));
  
  },
  // (was _stepCardScale)
  stepCardScale(ctx, card, dir) {
    const { state, ctrl } = ctx;
    const z = ctrl._clampZoom(card.dataset.zoom);
    let idx = -1;
    if (dir > 0) {
      for (let i = 0; i < CARD_SCALES.length; i++) {
        if (CARD_SCALES[i] > z + 0.01) { idx = i; break; }
      }
    } else {
      for (let i = CARD_SCALES.length - 1; i >= 0; i--) {
        if (CARD_SCALES[i] < z - 0.01) { idx = i; break; }
      }
    }
    if (idx < 0) return false;
    ctrl._applyZoom(card, CARD_SCALES[idx]);
    return true;
  
  },
  // (was _syncCardScaleButtons)
  syncCardScaleButtons(ctx, card) {
    const { state, ctrl } = ctx;
    const out = card.querySelector('.tw-card-zoom-out');
    const inc = card.querySelector('.tw-card-zoom-in');
    if (!out || !inc) return;
    const z = ctrl._clampZoom(card.dataset.zoom);
    const label = CARD_SCALE_LABELS[ctrl._zoomIdxOf(z)];
    out.disabled = (z <= CARD_SCALES[0] + 0.01);
    inc.disabled = (z >= CARD_SCALES[CARD_SCALES.length - 1] - 0.01);
    out._tipText = `缩小便签（当前：${label}）`;
    inc._tipText = `放大便签（当前：${label}）`;
    ctrl._refreshTip();
  
  },
  // (was _bindZoomSteps)
  bindZoomSteps(ctx, card) {
    const { state, ctrl } = ctx;
    const step = (dir) => {
      if (!ctrl._stepCardScale(card, dir)) return;
      ctrl._scheduleSave();
    };
    const out = card.querySelector('.tw-card-zoom-out');
    const inc = card.querySelector('.tw-card-zoom-in');
    if (out) out.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    if (inc) inc.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
    ctrl._syncCardScaleButtons(card);
  
  },
  // (was _applyPaper)
  applyPaper(ctx, card, paper) {
    const { state, ctrl } = ctx;
    const p = (PAPERS.indexOf(paper) >= 0) ? paper : 'plain';
    card.dataset.paper = p;
    const title = card.querySelector('.tw-card-title');
    if (title) title.textContent = PAPER_TITLES[p] || PAPER_TITLES.plain;
    const btn = card.querySelector('.tw-card-paper');
    if (btn) btn._tipText = `切换便签样式（当前：${PAPER_LABELS[p] || p}）`;
    ctrl._refreshTip();
    ctrl._notes = WritingDoc.setPaper(ctrl._notes, card.dataset.id, p);
    ctrl._invalidateGeo(card.dataset.id);   // 纸样改了 padding/比例 → 尺寸变，几何失效
    return p;
    
  },
  // (was _bindPaperSwitch)
  bindPaperSwitch(ctx, card) {
    const { state, ctrl } = ctx;
    const btn = card.querySelector('.tw-card-paper');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cur = card.dataset.paper || 'plain';
      const next = PAPERS[(PAPERS.indexOf(cur) + 1) % PAPERS.length];
      ctrl._applyPaper(card, next);
      ctrl._applyFontScale(card, Number(card.dataset.fontIdx));  // ① 夹回新纸样的字级上限
      ctrl._scheduleRenderLinks();                                // ② 尺寸/比例变了，端点重算
      ctrl._scheduleSave();
      if (typeof Toast !== 'undefined') {
        Toast.showToast('已切换为「' + (PAPER_LABELS[next] || next) + '」', 'success');
      }
    });
  
  },
  // (was _applyLevel)
  applyLevel(ctx, card, level) {
    const { state, ctrl } = ctx;
    const lv = (LEVELS.indexOf(level) >= 0) ? level : 'p';
    card.dataset.level = lv;
    const btn = card.querySelector('.tw-card-level');
    if (btn) {
      const label = LEVEL_LABELS[lv] || LEVEL_LABELS.p;
      btn.textContent = label;
      btn.title = '结构级别：' + (LEVEL_FEEDBACK[lv] || LEVEL_FEEDBACK.p) + '（点击切换）';
      btn.setAttribute('aria-label', '结构级别 ' + label + '，点击切换');
    }
    ctrl._refreshLevelSteps(card);   // 层级变了：± 钮的可用态与「→ 下一级」提示要跟着变
    ctrl._notes = WritingDoc.setLevel(ctrl._notes, card.dataset.id, lv);
    ctrl._invalidateGeo(card.dataset.id);   // 级别改了 padding/行高/最大宽度 → 几何失效
    return lv;
  
  },
  // (was _bindLevelSteps)
  bindLevelSteps(ctx, card) {
    const { state, ctrl } = ctx;
    const step = (dir) => (e) => {
      e.stopPropagation();
      if (ctrl._mode !== 'write') return;
      const idx = LEVEL_LADDER.indexOf(card.dataset.level || 'p');
      if (idx < 0) return;
      const nxt = LEVEL_LADDER[idx + dir];
      if (!nxt || nxt === card.dataset.level) return;
      if (ctrl._undoStack) ctrl._undoStack.push();
      ctrl._applyLevel(card, nxt);
      ctrl._scheduleSave();
      ctrl._showScreenMsg('LEVEL: ' + (LEVEL_LABELS[nxt] || nxt), 1000);
    };
    const up = card.querySelector('.tw-card-lv-up');    // 提升 = 往 H1 方向 = 下标 -1
    const dn = card.querySelector('.tw-card-lv-down');  // 降低 = 往正文方向 = 下标 +1
    if (up) up.addEventListener('click', step(-1));
    if (dn) dn.addEventListener('click', step(1));
  
  },
  // (was _refreshLevelSteps)
  refreshLevelSteps(ctx, card) {
    const { state, ctrl } = ctx;
    const up = card.querySelector('.tw-card-lv-up');
    const dn = card.querySelector('.tw-card-lv-down');
    if (!up && !dn) return;
    const lv = card.dataset.level || 'p';
    const idx = LEVEL_LADDER.indexOf(lv);
    const cur = LEVEL_LABELS[lv] || lv;
    const off = idx < 0;
    const offTip = cur + ' 不参与层级升降（用类型菜单切换）';
    if (up) {
      const top = idx === 0;
      up.disabled = off || top;
      up._tipText = off ? offTip
        : (top ? '已是最高层级 H1' : `提升层级：${cur} → ${LEVEL_LABELS[LEVEL_LADDER[idx - 1]]}`);
    }
    if (dn) {
      const bottom = idx === LEVEL_LADDER.length - 1;
      dn.disabled = off || bottom;
      dn._tipText = off ? offTip
        : (bottom ? '已是最低（正文）' : `降低层级：${cur} → ${LEVEL_LABELS[LEVEL_LADDER[idx + 1]]}`);
    }
    ctrl._refreshTip();
  
  },
  // (was _bindLevelSwitch)
  bindLevelSwitch(ctx, card) {
    const { state, ctrl } = ctx;
    const btn = card.querySelector('.tw-card-level');
    if (!btn) return;
    // 徽章已移出工具条，直接挂在卡片下：挡掉 pointerdown，卡片拖拽与画布都不感知这次按下
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 同一张卡的菜单已开着 → 再点是收起，避免想关却只是重开
      if (ctrl._levelMenuCard === card && ctrl._levelMenu && !ctrl._levelMenu.hidden) {
        ctrl._hideLevelMenu();
        return;
      }
      ctrl._showLevelMenu(card, btn);
    });
  
  },
  // (was _ensureLevelMenu)
  ensureLevelMenu(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._levelMenu || !ctrl._el) return;
    // 浮层用 absolute 定位，需根元素作为定位基准；根元素若为 static 就补一个 relative
    if (getComputedStyle(ctrl._el).position === 'static') ctrl._el.style.position = 'relative';
    const menu = document.createElement('div');
    menu.className = 'tw-level-menu';
    menu.hidden = true;
    LEVEL_GROUPS.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'tw-level-menu-group';
      const cap = document.createElement('span');
      cap.className = 'tw-level-menu-cap';
      cap.textContent = g.label;
      row.appendChild(cap);
      g.items.forEach((lv) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tw-level-menu-item';
        b.dataset.level = lv;
        // 圆点颜色交给 CSS 的 --lv-* 变量（见 notes.css），此处不写死色值
        b.innerHTML = '<i class="tw-level-dot" data-level="' + lv + '"></i>'
          + '<span>' + (LEVEL_LABELS[lv] || lv) + '</span>';
        row.appendChild(b);
      });
      menu.appendChild(row);
    });
    // 浮层内的交互不冒泡到画布（否则会触发平移 / 框选）
    menu.addEventListener('pointerdown', (e) => e.stopPropagation());
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.tw-level-menu-item');
      const card = ctrl._levelMenuCard;
      if (!item || !card) return;
      const lv = item.dataset.level;
      ctrl._applyLevel(card, lv);
      ctrl._scheduleSave();
      ctrl._showScreenMsg('LEVEL: ' + (LEVEL_FEEDBACK[lv] || lv), 900);
      ctrl._hideLevelMenu();
    });
    ctrl._el.appendChild(menu);
    ctrl._levelMenu = menu;
  
  },
  // (was _showLevelMenu)
  showLevelMenu(ctx, card, btn) {
    const { state, ctrl } = ctx;
    ctrl._ensureLevelMenu();
    const menu = ctrl._levelMenu;
    if (!menu) return;
    ctrl._levelMenuCard = card;
    const cur = card.dataset.level || 'p';
    menu.querySelectorAll('.tw-level-menu-item').forEach((it) => {
      it.classList.toggle('is-on', it.dataset.level === cur);
    });
    menu.hidden = false;                       // 先显示再量：隐藏元素量不到尺寸
    const r = btn.getBoundingClientRect();
    const mr = menu.getBoundingClientRect();
    const host = ctrl._el.getBoundingClientRect();
    const M = 8;                               // 视口安全边距
    let vt = r.bottom + 4;
    if (vt + mr.height > window.innerHeight - M) vt = Math.max(M, r.top - mr.height - 4);
    let vl = r.left;
    if (vl + mr.width > window.innerWidth - M) vl = Math.max(M, window.innerWidth - mr.width - M);
    menu.style.top = (vt - host.top) + 'px';
    menu.style.left = (vl - host.left) + 'px';
    // 打开期间接管：点空白处或按 Esc 收起（捕获阶段，确保早于画布的 pointerdown）
    if (!ctrl._levelMenuDocHandler) {
      ctrl._levelMenuDocHandler = (ev) => {
        if (ev.type === 'keydown' && ev.key !== 'Escape') return;
        if (ctrl._isInLevelMenu(ev)) return;
        ctrl._hideLevelMenu();
      };
    }
    document.addEventListener('pointerdown', ctrl._levelMenuDocHandler, true);
    document.addEventListener('keydown', ctrl._levelMenuDocHandler, true);
  
  },
  // (was _hideLevelMenu)
  hideLevelMenu(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._levelMenu) ctrl._levelMenu.hidden = true;
    ctrl._levelMenuCard = null;
    if (ctrl._levelMenuDocHandler) {
      document.removeEventListener('pointerdown', ctrl._levelMenuDocHandler, true);
      document.removeEventListener('keydown', ctrl._levelMenuDocHandler, true);
    }
  
  },
  // (was _isInLevelMenu)
  isInLevelMenu(ctx, ev) {
    const { state, ctrl } = ctx;
    const path = (typeof ev.composedPath === 'function') ? ev.composedPath() : [];
    for (let i = 0; i < path.length; i += 1) {
      const n = path[i];
      if (!n || n.nodeType !== 1 || !n.classList) continue;
      if (n.classList.contains('tw-level-menu')) return true;
      if (n.classList.contains('tw-card-level')) return true;
    }
    // 兜底：无 composedPath 的老环境退回 target
    return !!(ev.target && ev.target.closest && ev.target.closest('.tw-level-menu'));
  
  },
  // (was _maxFontIdx)
  maxFontIdx(ctx, paper) {
    const { state, ctrl } = ctx;
    // 定版纸样（书燕等）：文本区按比例预留、纸高固定，字放太大撑出留白区会破坏版式，故封顶 FONT_MAX_IDX_FIXED 档；
    // 流式纸样（素笺/夜光）字变大纸自然变长，可一路到最大档。固定集由 PAPERS 派生，新增定版纸样无需改这里。
    return (FLOWING_PAPER_SET.has(paper)) ? FONT_SCALES.length - 1 : FONT_MAX_IDX_FIXED;

  },
  // (was _fontIdxOf)
  fontIdxOf(ctx, scale, paper) {
    const { state, ctrl } = ctx;
    const max = ctrl._maxFontIdx(paper);
    const n = Number(scale);
    let idx = FONT_SCALE_DEFAULT_IDX;
    if (isFinite(n) && n > 0) {
      let bestD = Infinity;
      FONT_SCALES.forEach((s, i) => {
        if (i > max) return;
        const d = Math.abs(s - n);
        if (d < bestD) { bestD = d; idx = i; }
      });
    }
    return Math.min(max, idx);
  
  },
  // (was _applyFontScale)
  applyFontScale(ctx, card, idx) {
    const { state, ctrl } = ctx;
    const max = ctrl._maxFontIdx(card.dataset.paper);
    const raw = Number(idx);
    const i = Math.min(max, Math.max(0, isFinite(raw) ? raw : FONT_SCALE_DEFAULT_IDX));
    card.dataset.fontIdx = String(i);
    card.dataset.fontScale = String(FONT_SCALES[i]);
    card.style.setProperty('--tw-text-zoom', String(FONT_SCALES[i]));
    const down = card.querySelector('.tw-card-font-down');
    const up = card.querySelector('.tw-card-font-up');
    const label = FONT_SCALE_LABELS[i];
    if (down) {
      down.disabled = (i === 0);
      down._tipText = `缩小字号（当前：${label}）`;
    }
    if (up) {
      up.disabled = (i >= max);
      up._tipText = `放大字号（当前：${label}）`;
    }
    ctrl._refreshTip();
    ctrl._notes = WritingDoc.setFontScale(ctrl._notes, card.dataset.id, card.dataset.fontScale);
    ctrl._invalidateGeo(card.dataset.id);   // 字级改了文字尺寸 → 卡片高度随之变，几何失效
    return i;
  
  },
  // (was _bindFontSteps)
  bindFontSteps(ctx, card) {
    const { state, ctrl } = ctx;
    const step = (dir) => {
      const cur = Number(card.dataset.fontIdx);
      const next = isFinite(cur) ? cur + dir : FONT_SCALE_DEFAULT_IDX;
      const applied = ctrl._applyFontScale(card, next);
      if (applied === cur) return;   // 已达上下限，无变化
      ctrl._scheduleSave();
    };
    const down = card.querySelector('.tw-card-font-down');
    const up = card.querySelector('.tw-card-font-up');
    if (down) down.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    if (up) up.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  
  },
  // (was _bindTools)
  bindTools(ctx, card) {
    const { state, ctrl } = ctx;
    const placeTools = () => {
      const canvas = ctrl._canvas;
      if (!canvas) return;
      const cr = canvas.getBoundingClientRect();
      const kr = card.getBoundingClientRect();
      card.classList.toggle('tw-tools-below', (kr.top - cr.top) < 46);
    };
    const lift = () => {
      placeTools();
      if (card.dataset.zLifted === '1') return;
      card.dataset.zLifted = '1';
      card._zPrev = card.style.zIndex;
      card.style.zIndex = '5000';
    };
    const drop = () => {
      if (card.dataset.zLifted !== '1') return;
      // 钉住态与拖拽中保持置顶，不回落
      if (card.classList.contains('is-pinned') || card.classList.contains('dragging')) return;
      card.dataset.zLifted = '';
      card.style.zIndex = card._zPrev || '';
    };
    card.addEventListener('mouseenter', lift);
    card.addEventListener('mouseleave', drop);
    card.addEventListener('focusin', lift);
    card.addEventListener('focusout', drop);
  
  },
  // (was _applyRot)
  applyRot(ctx, card, deg) {
    const { state, ctrl } = ctx;
    let d = Number(deg);
    if (!isFinite(d)) d = 0;
    d = ((d % 360) + 540) % 360 - 180;   // 归一到 (-180, 180]
    card.dataset.rot = d.toFixed(2);
    card.style.setProperty('--tw-card-rot', d + 'deg');
    ctrl._notes = WritingDoc.setRot(ctrl._notes, card.dataset.id, d);
    return d;
  
  },
  // (was _applyKnobSize)
  applyKnobSize(ctx, el) {
    const { state, ctrl } = ctx;
    const scale = parseFloat(ctrl._el && ctrl._el.style.getPropertyValue('--tw-scale')) || 1;
    const px = Math.min(38, Math.max(26, 30 * scale));
    const iconPx = Math.min(21, Math.max(15, 17 * scale));
    el.style.width = px.toFixed(2) + 'px';
    el.style.height = px.toFixed(2) + 'px';
    el.style.minWidth = px.toFixed(2) + 'px';
    el.style.minHeight = px.toFixed(2) + 'px';
    const svg = el.querySelector('svg');
    if (svg) {
      svg.style.width = iconPx.toFixed(2) + 'px';
      svg.style.height = iconPx.toFixed(2) + 'px';
    }
  
  },
  // (was _ensureTip)
  ensureTip(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._tip && ctrl._tip.isConnected) return ctrl._tip;
    const tip = document.createElement('div');
    tip.className = 'tw-tip';
    tip.setAttribute('role', 'tooltip');
    ctrl._el.appendChild(tip);
    ctrl._tip = tip;
    return tip;
  
  },
  // (was _positionTip)
  positionTip(ctx, el) {
    const { state, ctrl } = ctx;
    const tip = ctrl._tip;
    if (!tip) return;
    const r = el.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    const maxLeft = (window.innerWidth || document.documentElement.clientWidth) - tr.width - 6;
    let left = r.left + r.width / 2 - tr.width / 2;
    left = Math.max(6, Math.min(left, maxLeft));
    let top = r.top - tr.height - 6;
    if (top < 6) top = r.bottom + 6;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  
  },
  // (was _bindTips)
  bindTips(ctx, card) {
    const { state, ctrl } = ctx;
    const targets = [
      [card.querySelector('.tw-card-paper'), '切换便签样式'],
      [card.querySelector('.tw-card-move-up'), '上移（文章顺序）'],
      [card.querySelector('.tw-card-move-down'), '下移（文章顺序）'],
      [card.querySelector('.tw-card-lv-up'), '提升层级'],
      [card.querySelector('.tw-card-lv-down'), '降低层级'],
      [card.querySelector('.tw-card-font-down'), '缩小字号'],
      [card.querySelector('.tw-card-font-up'), '放大字号'],
      [card.querySelector('.tw-card-zoom-out'), '缩小便签'],
      [card.querySelector('.tw-card-zoom-in'), '放大便签'],
      [card.querySelector('.tw-card-del'), '移除便签'],
    ];
    targets.forEach(([el, fallback]) => {
      if (!el) return;
      const show = () => {
        const tip = ctrl._ensureTip();
        ctrl._tipEl = el;
        tip.textContent = el._tipText || fallback;
        tip.classList.add('on');
        ctrl._positionTip(el);
      };
      const hide = () => {
        if (ctrl._tipEl === el) ctrl._tipEl = null;
        if (ctrl._tip) ctrl._tip.classList.remove('on');
      };
      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);
      el.addEventListener('click', show); // 点完立刻用新文案重画
    });
  
  },
  // (was _refreshTip)
  refreshTip(ctx) {
    const { state, ctrl } = ctx;
    const tip = ctrl._tip;
    if (!tip || !ctrl._tipEl || !tip.classList.contains('on')) return;
    const el = ctrl._tipEl;
    const text = el._tipText || el.getAttribute('aria-label');
    if (!text) return;
    tip.textContent = text;
    ctrl._positionTip(el);
  
  },
  // (was _spawnAnchorCard)
  spawnAnchorCard(ctx, exclude) {
    const { state, ctrl } = ctx;
    const seq = ctrl._orderCards().filter((c) => c.el !== exclude);
    if (!seq.length) return null;
    const sel = ctrl._selected;
    let pick = null;
    if (sel && sel.size) {
      for (let i = seq.length - 1; i >= 0; i -= 1) {
        // 注意排除 el 为 null（被剔除）的项：sel 是元素集合，null 永远不命中
        if (seq[i].el && sel.has(seq[i].el)) { pick = seq[i]; break; }   // 选中组里最靠后的那张
      }
    }
    if (!pick) pick = seq[seq.length - 1];
    // 【修复「跳动」】文末卡很可能已被视口剔除（el === null）。旧实现直接 `return ...el`，
    // 于是返回 null → 调用方退化成「落到出纸口（画布中央）」，新卡凭空出现在视野中央，
    // 随后被 _ensureCardVisible 滚过去 —— 这就是卡片一多就「跳一下」的来源。
    // 现在即使没有 DOM，也按**模型坐标 + 几何缓存高度**接续文章流，成文流不再断。
    const el = pick.el;
    const g = ctrl._geo ? ctrl._geo.get(pick.id) : null;
    return {
      el,
      x: el ? (parseFloat(el.style.left) || 0) : (typeof pick.x === 'number' ? pick.x : 0),
      y: el ? (parseFloat(el.style.top) || 0) : (typeof pick.y === 'number' ? pick.y : 0),
      h: el ? (el.offsetHeight || 0) : (g ? (g.h || 0) : 0),
    };

  },
};