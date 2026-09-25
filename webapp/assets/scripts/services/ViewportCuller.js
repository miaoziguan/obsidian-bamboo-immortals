/**
 * ViewportCuller — 视口剔除 + 几何缓存 + 卡片挂载/卸载/资源释放 的单一职责模块。
 *
 * 从 TypewriterFeature 巨型单例（B1 解耦）中抽出的「视口与几何」子系统：
 *   · 连线端点几何（getGeom）、几何缓存失效/合帧重测（invalidateGeo* / flushGeo / measureCard / syncLayoutGeo）
 *   · 空间索引（seedSpatial / noteIndex / pinnedIds）
 *   · 卡片生命周期（mountCard / unmountCard / disposeCard / ensureCardVisible）
 *   · 视口剔除（updateCulling / scheduleCull）与超上限归档（enforceCap）
 *
 * 【解耦 B5 / 复盘 4.2 模块真解耦】本模块不再穿透 `this` 读写宿主状态：
 *   · 每个方法首参为 `ctx = { state, ctrl }`；
 *   · `state` 是 NotesState 单主实例（notes/geo/spatial/mountedCards/links/selected/canvasOffset/mode），
 *     模块对共享**数据**的全部读写都走 `state.*`（不穿透宿主）；
 *   · `ctrl` 是宿主（TypewriterFeature）显式传入的依赖：模块对宿主**行为/字段**的访问，回调走 `ctrl._xxx`
 *     （如 _scheduleRenderLinks / _createCardEl / _applyLod / _noteIndex…），宿主字段走 `ctrl._xxx`
 *     （如 _canvas / _restored / _zTop / _linkLayer …）；
 *   · 模块内部互相调用（measureCard→setGeom、updateCulling→mountCard…）一律 `this.method(ctx, …)`，
 *     跨子系统调用（mountCard→_createCardEl、updateCulling→_refreshWriteOrder）经 `ctrl._delegate` 回到宿主委托层。
 * 这样模块不再依赖 `this` 隐式等于宿主，数据真源在 NotesState、行为真源在宿主，二者皆显式注入。
 */
import { GeoCache } from './GeoCache.js';
import { SpatialIndex } from './SpatialIndex.js';
import { WRITE_NO_CULL_MAX } from '../handlers/features/twConfig.js';

export const ViewportCuller = {
  /** 连线层取端点的几何源：挂载卡读活 DOM（与旧行为一致），离屏卡读几何缓存（最后测量值）。 */
  getGeom(ctx, id) {
    const { state, ctrl } = ctx;
    if (!state.mountedCards || !state.geo) return null;
    const card = state.mountedCards.get(id);
    if (card) {
      if (ctrl._canvas) {
        const cr = ctrl._canvas.getBoundingClientRect();
        const r = card.getBoundingClientRect();
        // 缩放比取自视口真源；仅在视口不可用时（测试/旧上下文）才回退到 rect 反推。
        // 注意：card.offsetWidth 是未缩放的布局尺寸，即画布坐标下的宽高，不能再除以 s。
        const s = (typeof CanvasViewport !== 'undefined')
          ? CanvasViewport.getScale(ctrl)
          : ((cr.width && ctrl._canvas.offsetWidth) ? cr.width / ctrl._canvas.offsetWidth : 1);
        const hw = card.offsetWidth / 2 || 1;
        const hh = card.offsetHeight / 2 || 1;
        return {
          cx: (r.left + r.width / 2 - cr.left) / s,
          cy: (r.top + r.height / 2 - cr.top) / s,
          hw, hh,
          rot: Number(card.dataset.rot) || 0,
        };
      }
      return {
        cx: card.offsetLeft + card.offsetWidth / 2,
        cy: card.offsetTop + card.offsetHeight / 2,
        hw: card.offsetWidth / 2 || 1,
        hh: card.offsetHeight / 2 || 1,
        rot: Number(card.dataset.rot) || 0,
      };
    }
    const g = state.geo.get(id);
    if (g) return { cx: g.x + g.w / 2, cy: g.y + g.h / 2, hw: g.w / 2 || 1, hh: g.h / 2 || 1, rot: g.rot || 0 };
    return null;
  },

  /** 几何单一写入入口（【解耦 B2 / 复盘 A4】）：一次写入同时刷新 GeoCache（state.geo）与空间索引（state.spatial），
   *  杜绝「只改一处导致另一处停在旧位置」的漂移。凡是改写卡片几何（位置/尺寸/旋转）的入口都应走这里。
   *  seedSpatial（模型重建整张索引）属预挂载引导路径，仍允许只写 state.spatial。 */
  setGeom(ctx, id, g) {
    const { state } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    state.geo.set(id, g);
    if (!state.spatial) state.spatial = new SpatialIndex(512);
    state.spatial.update(id, g.x, g.y, g.w, g.h, g.rot);
  },

  /** 几何单一删除入口：同时清 GeoCache 与空间索引。 */
  removeGeom(ctx, id) {
    const { state } = ctx;
    if (state.geo) state.geo.delete(id);
    if (state.spatial) state.spatial.remove(id);
  },

  /** 重排 / 排版 / 上移下移后同步几何缓存与空间索引（【P8 几何缓存】失效完备性补齐）。 */
  syncLayoutGeo(ctx) {
    const { state, ctrl } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    if (!state.spatial) state.spatial = new SpatialIndex(512);
    const noteIdx = ctrl._noteIndex();
    if (state.mountedCards) {
      state.mountedCards.forEach((el) => ctrl._measureCard(el));
    }
    noteIdx.forEach((note, id) => {
      if (state.mountedCards && state.mountedCards.has(id)) return;
      const g = state.geo.get(id);
      if (!g) return;
      g.x = typeof note.x === 'number' ? note.x : 0;
      g.y = typeof note.y === 'number' ? note.y : 0;
      this.setGeom(ctx, id, g);
    });
  },

  /** 把一张模型卡建回 DOM 并挂进挂载表 + 量几何。culling 进屏时调用。 */
  mountCard(ctx, note) {
    const { state, ctrl } = ctx;
    const _t0 = ctrl._perfBegin();
    const card = ctrl._createCardEl({
      id: note.id, font: note.font, paper: note.paper, date: note.date,
      zoom: note.zoom, fontScale: note.fontScale, rot: note.rot, level: note.level,
    });
    card.style.zIndex = String(++ctrl._zTop);
    card.style.left = (typeof note.x === 'number' ? note.x : 0) + 'px';
    card.style.top = (typeof note.y === 'number' ? note.y : 0) + 'px';
    card.style.bottom = 'auto';
    const textEl = card.querySelector('.tw-card-text');
    textEl.textContent = (typeof note.text === 'string') ? note.text : '';
    ctrl._canvas.appendChild(card);
    if (!state.mountedCards) state.mountedCards = new Map();
    if (!state.geo) state.geo = new GeoCache();
    state.mountedCards.set(note.id, card);
    ctrl._measureCard(card);
    ctrl._perfEnd('mount', _t0);
    return card;
  },

  /** 量一张卡进几何缓存（坐标取 style.left/top；尺寸取 offset*，一次 reflow 摊销）。 */
  measureCard(ctx, card) {
    const { state } = ctx;
    const id = card.dataset.id;
    if (!id) return;
    const g = {
      x: parseFloat(card.style.left) || 0,
      y: parseFloat(card.style.top) || 0,
      w: card.offsetWidth || 340,
      h: card.offsetHeight || 200,
      rot: Number(card.dataset.rot) || 0,
    };
    this.setGeom(ctx, id, g);
  },

  /** 离屏卡卸载 DOM（保留模型/几何缓存/连线）。 */
  unmountCard(ctx, id) {
    const { state, ctrl } = ctx;
    if (!state.mountedCards) return false;
    const card = state.mountedCards.get(id);
    if (!card) return false;
    ctrl._disposeCard(card);
    card.remove();
    state.mountedCards.delete(id);
    return true;
  },

  /** 懒建 id→note 索引（cull mount 时按 id 取 note 内容，避免每次 O(n) find）。 */
  noteIndex(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._noteById && ctrl._noteByIdSrc === state.notes) return ctrl._noteById;
    ctrl._noteById = new Map();
    if (state.notes) for (const n of state.notes) ctrl._noteById.set(n.id, n);
    ctrl._noteByIdSrc = state.notes;
    return ctrl._noteById;
  },

  /** 用模型坐标重建整张空间索引（默认尺寸占位；_buildCards 测量后精确入格）。 */
  seedSpatial(ctx) {
    const { state } = ctx;
    if (!state.spatial) state.spatial = new SpatialIndex(512);
    state.spatial.clear();
    if (!state.notes) return;
    for (const n of state.notes) {
      const x = typeof n.x === 'number' ? n.x : 0;
      const y = typeof n.y === 'number' ? n.y : 0;
      state.spatial.insert(n.id, x, y, 340, 200, Number(n.rot) || 0);
    }
  },

  /** 必须钉在屏上、剔除跳过的卡（编辑 / 选中 / 拖拽中 / 打字中）。 */
  pinnedIds(ctx) {
    const { state, ctrl } = ctx;
    const s = new Set();
    if (state.selected) state.selected.forEach((c) => { if (c.dataset && c.dataset.id) s.add(c.dataset.id); });
    if (ctrl._draggingSet) ctrl._draggingSet.forEach((id) => s.add(id));
    if (ctrl._typingIds) ctrl._typingIds.forEach((id) => s.add(id));
    if (ctrl._editingId) s.add(ctrl._editingId);
    return s;
  },

  /** 【几何缓存失效】标记一张卡的几何已不可信（尺寸/比例可能变了），待合帧重测。 */
  invalidateGeo(ctx, id) {
    const { state, ctrl } = ctx;
    if (!id) return;
    if (!state.geo) state.geo = new GeoCache();
    state.geo.markDirty(id);
    this.scheduleGeoFlush(ctx);
  },

  /** 整机根字号变化 → 所有卡片的 em 尺寸全变 → 几何整体失效 */
  invalidateGeoAll(ctx) {
    const { state, ctrl } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    state.geo.forEach((_g, id) => state.geo.markDirty(id));
    if (state.mountedCards) state.mountedCards.forEach((_c, id) => state.geo.markDirty(id));
    this.scheduleGeoFlush(ctx);
  },

  scheduleGeoFlush(ctx) {
    const { state, ctrl } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    if (state.geo.flushRaf) return;
    state.geo.setFlushRaf(requestAnimationFrame(() => {
      state.geo.setFlushRaf(0);
      this.flushGeo(ctx);
    }));
  },

  /** 合帧重测所有失效卡。离屏卡不在 DOM 无法测，保持旧值即可 —— 重挂载时 _mountCard 会测。 */
  flushGeo(ctx) {
    const { state, ctrl } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    const dirty = state.geo.takeDirty();
    if (!dirty || !dirty.size) return;
    const _t0 = ctrl._perfBegin();
    let changed = false;
    dirty.forEach((id) => {
      const card = state.mountedCards ? state.mountedCards.get(id) : null;
      if (!card) return;
      ctrl._measureCard(card);
      changed = true;
    });
    if (changed) ctrl._scheduleRenderLinks();
    ctrl._perfEnd('geoFlush', _t0);
  },

  scheduleCull(ctx) {
    const { state, ctrl } = ctx;
    // 【写作档不做视口剔除】文章是线性文档、规模有限（几十~几百块），
    // 而剔除会随「新建卡自动归位」/ 画布平移把卡片 DOM 反复销毁又重建 —— 这是可视化写作
    // 闪烁的根因：卡片甚至不到 20 张就开始闪，且与拖动无关（新建卡即触发）。
    // 文章块既少又便宜，虚拟化零收益、纯属负担；超阈值才回退剔除作安全兜底。
    // 常驻挂载不丢功能：卡片由 _buildCards / _mountCard 全量建立，删除走 _removeCard，
    // 几何缓存与连线端点照常工作（离屏卡仍可从 geo 取几何画连线）。
    // 【补注·抖动根因已可治】上文「反复销毁又重建」抖动的根因（每帧 createElement + 逐卡测量强制重排）
    // 已在导图侧以「DOM 回收池复用 + 批量测量」根治（mindmapFeature._mountNode 入池、_cullView 走 _batchMeasure）。
    // 若便签/写作画布日后也出现可感知抖动，可按同一套手法给 mountCard/unmountCard 上回收池，
    // 届时写作档是否下调 WRITE_NO_CULL_MAX 再据实测决定，勿凭推断放宽。
    if (state.mode === 'write'
      && (state.notes ? state.notes.length : 0) <= WRITE_NO_CULL_MAX) return;
    if (ctrl._cullRaf) return;
    ctrl._cullRaf = requestAnimationFrame(() => {
      ctrl._cullRaf = 0;
      this.updateCulling(ctx);
    });
  },

  /** 重算挂载：离屏卸载、进屏重建。 */
  updateCulling(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._restored || !ctrl._canvas) return;
    // 【切档回填修复】切档窗口（_switching=true）内模型正在换代：state.notes 仍是上一份文档，
    // 而 _mode 已指向新档。此时若允许重挂载，本函数会按尚未替换的 state.notes + state.spatial
    // 把旧卡重新挂回刚清空的画布 → 表现为「便签外皮 + 上一份文档(写作档)内容」的一闪
    // （典型：便签→写作→导图→便签，中间闪写作卡）。
    // 触发窗口的操作源：canvas.hidden=false 让画布尺寸 0→非零，触发观察到画布的 ResizeObserver
    // （typewriterFeature._cullRo）→ _scheduleCull → rAF 在 await _loadDoc 期间到点执行。
    // _mountCard 仅 buildCards 与本函数两处调用，故在此收口即可覆盖全部重挂载路径。
    if (ctrl._switching) return;
    if (!state.mountedCards) state.mountedCards = new Map();
    if (!state.geo) state.geo = new GeoCache();
    if (!state.spatial) state.spatial = new SpatialIndex(512);
    if (ctrl._CULL_MARGIN == null) ctrl._CULL_MARGIN = 240;
    const s = (typeof CanvasViewport !== 'undefined') ? CanvasViewport.getScale(ctrl) : 1;
    const cr = ctrl._canvas.getBoundingClientRect();
    // rect 已含缩放（rect.width = 布局宽 * s），除以 s 还原成「布局宽」——
    // 即未缩放前的可见宽度。不能直接用 cr.width 当可见宽度，否则缩放会让可见区失真。
    // 注：不用 offsetWidth —— jsdom 无布局时恒为 0，会让剔除整体失效（压测回归）。
    const LW = cr.width / s, LH = cr.height / s;
    if (LW < 2 || LH < 2) return;
    const _t0 = ctrl._perfBegin();
    const off = state.canvasOffset || { x: 0, y: 0 };
    const M = ctrl._CULL_MARGIN;
    // 缩放感知：卡片在「内容空间」的位置是 off + s * 画布坐标，
    // 故屏幕可见区 [0, LW] 反解回画布坐标要除以 s —— 否则缩小后大片卡片被误剔除（画面空白）。
    const vx0 = (-off.x - M) / s, vy0 = (-off.y - M) / s;
    const vx1 = (LW + M - off.x) / s, vy1 = (LH + M - off.y) / s;
    const pinned = ctrl._pinnedIds();
    const noteIdx = ctrl._noteIndex();
    const visible = state.spatial.queryRect(vx0, vy0, vx1, vy1);
    let changed = false;
    visible.forEach((id) => {
      if (pinned.has(id) || state.mountedCards.has(id)) return;
      const note = noteIdx.get(id);
      if (note) { ctrl._mountCard(note); changed = true; }
    });
    pinned.forEach((id) => {
      if (state.mountedCards.has(id)) return;
      const note = noteIdx.get(id);
      if (note) { ctrl._mountCard(note); changed = true; }
    });
    state.mountedCards.forEach((card, id) => {
      if (pinned.has(id)) return;
      if (!visible.has(id)) { ctrl._unmountCard(id); changed = true; }
    });
    if (changed) {
      if (ctrl._linkLayer) ctrl._linkLayer.clearControls();
      ctrl._scheduleRenderLinks();
      if (state.mode === 'write') ctrl._refreshWriteOrder();
    }
    ctrl._applyLod();
    ctrl._perfEnd('cull', _t0);
  },

  /** 超出上限删最早（以「模型真源 state.notes 的数组序」为时间序；cap 由宿主传入，避免本模块依赖 NOTE_CAP 常量）。 */
  enforceCap(ctx, cap) {
    const { state, ctrl } = ctx;
    if (state.mode === 'write') return;
    if (state.notes.length - cap <= 0) return;
    const over = state.notes.length - cap;
    if (ctrl._undoStack) ctrl._undoStack.push();
    const victims = state.notes.slice(0, over).map((n) => n.id);
    victims.forEach((id) => ctrl._removeNoteById(id));
    ctrl._scheduleSave();
    if (typeof Toast !== 'undefined') {
      Toast.showToast(`已达 ${cap} 张上限，自动归档最早的 ${victims.length} 张`, 'info');
    } else {
      ctrl._showScreenMsg(`已达上限，归档最早 ${victims.length} 张`, 2200);
    }
  },

  /** 卡片从视图移除前的统一资源释放：打字 timer、编辑态事件监听、瞬时集合引用。 */
  disposeCard(ctx, card) {
    const { state, ctrl } = ctx;
    if (!card) return;
    const id = card.dataset && card.dataset.id;
    if (card._typing) {
      try { clearInterval(card._typing.timer); } catch (_) { /* 忽略 */ }
      if (ctrl._timers) {
        const k = ctrl._timers.indexOf(card._typing.timer);
        if (k >= 0) ctrl._timers.splice(k, 1);
      }
      card._typing = null;
    }
    if (card._editHandlers || card._editBlur) {
      const text = card.querySelector('.tw-card-text');
      if (text) {
        if (card._editHandlers) {
          text.removeEventListener('input', card._editHandlers.onInput);
          text.removeEventListener('keydown', card._editHandlers.onKey);
          text.removeEventListener('paste', card._editHandlers.onPaste);
        }
        if (card._editBlur) text.removeEventListener('blur', card._editBlur);
      }
      card._editHandlers = null;
      card._editBlur = null;
    }
    if (id) {
      if (ctrl._typingIds) ctrl._typingIds.delete(id);
      if (ctrl._editingId === id) ctrl._editingId = null;
      if (state.selected) state.selected.delete(card);
    }
  },

  /** 把视野平移到指定卡（钉屏卡跳过；离屏卡用几何缓存/模型定位，无需 DOM）。 */
  ensureCardVisible(ctx, cardOrId) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    if (!VW || !VH) return;
    const id = (cardOrId && cardOrId.dataset) ? cardOrId.dataset.id : cardOrId;
    if (!id) return;
    if (ctrl._pinnedIds(ctx).has(id)) return;
    const g = state.geo ? state.geo.get(id) : null;
    const n = (state.notes || []).find((x) => x.id === id);
    const rawL = (g ? g.x : (n && typeof n.x === 'number' ? n.x : 0));
    const rawT = (g ? g.y : (n && typeof n.y === 'number' ? n.y : 0));
    const w = g ? g.w : 340;
    const h = g ? g.h : 200;
    const off = state.canvasOffset || { x: 0, y: 0 };
    const M = 24;
    let ox = off.x, oy = off.y;
    if (h + 2 * M < VH) {
      oy = Math.min(VH - M - h - rawT, Math.max(M - rawT, oy));
    } else {
      oy = M - rawT;
    }
    if (w + 2 * M < VW) {
      ox = Math.min(VW - M - w - rawL, Math.max(M - rawL, ox));
    } else {
      ox = M - rawL;
    }
    if (ox === off.x && oy === off.y) return;
    ctrl._setCanvasOffset(ox, oy);
  },
};
