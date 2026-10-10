/**
 * materialMarket.js — 画中卷·打字机「便签模式」素材市场
 *
 * 入口：缩放条上的「素材市场」按钮（CanvasZoomUI 注入 data-act="market"）→
 * 点击在画布右侧（黄区）展开抽屉，拉清单 → 一张一张渲染素材卡（缩略图 + 名称 + 下载）。
 * 下载后的素材卡变为可拖拽：
 *   · type=paper   → 拖到画布空白＝新建一张该纸纹的便签；拖到已有卡片＝给该卡换纸纹；
 *   · type=sticker → 拖到画布任意处＝落一张贴纸（装饰层，叠加在卡片之上，独立拖拽）；
 *   · type=font    → 拖到卡片＝给该卡换字体；拖到空白＝新建一张该字体的便签；
 *   · type=template→ 拖到卡片＝套用预设(纸纹+字体)；拖到空白＝新建预设便签。
 *
 * 分发：照主题动效同构 —— 素材文件导出 window.__bamboo_material_<id>，
 * 安全模型复用 ModuleManager「静态审计 + 沙箱执行」思路（此处自包含实现，不依赖全局 ModuleManager）。
 * 存储：经 window.storageManager 取清单 / 下载 / 读回（宿主侧实现；本地探针用 stub）。
 * 持久化：已安装素材（源码）存入 storageManager，重载后自动恢复并重新注册。
 *
 * 注：本文件为纯前端市场 UI + 落卡逻辑，不直接碰素材仓库；素材仓库见 bamboo-material-market/。
 */
import { WritingDoc } from './writingDoc.js';
import { ViewportCuller } from '../../services/ViewportCuller.js';
import { CanvasViewport } from '../../services/CanvasViewport.js';
import { FONTS, PAPERS, MARKET_PAPERS, MARKET_FONTS, registerMarketPaper, unregisterMarketPaper, registerMarketFont, unregisterMarketFont } from './twConfig.js';
// 贴纸按「便签组」独立持久化：需取当前组 id 作为存储 key
import { TypewriterStore } from '../../services/TypewriterStore.js';
// 素材 SVG 注入前的实例隔离（id 前缀 + <style> 作用域沙箱）
import { SvgIsolate } from '../../utils/svgIsolate.js';

export const MaterialMarket = {
  _ctrl: null,
  _wrap: null,
  _drawer: null,
  _bodyEl: null,
  _papers: {},    // name -> material（type=paper，css 已注入）
  _stickers: {},  // name -> material（type=sticker）
  _fonts: {},     // name -> material（type=font，css 已注入）
  _templates: {}, // name -> material（type=template）
  _installed: {}, // id -> material（全部已下载，含 __code 源码）
  _canvasStickers: [], // 画布贴纸：{ id, material, x, y, z, w, h, rot, el }（独立持久化，不入便签模型；永远浮于卡片之上）
  _menu: null,         // 右键层级菜单 DOM
  _menuCloser: null,   // 菜单关闭监听
  _collapsed: {},      // 系列分组折叠态：series 名 -> true（未分组素材用 __other__），持久化到 marketSeriesCollapsed

  /** feature.mount 时调用：记 ctrl/wrap，挂抽屉与画布 drop 监听（幂等） */
  init(ctrl, host) {
    this._ctrl = ctrl;
    this._wrap = host.querySelector('.scroll-typewriter-feature') || host;
    // 幂等：抽屉已挂且仍在 DOM 中则复用（重复 init 不产生孤儿抽屉）
    if (!this._drawer || !this._drawer.isConnected) {
      this._drawer = null;
      this._ensureDrawer();
    }
    this._bindCanvasDrop();
    this._restoreAll();     // 异步：重载后恢复已安装素材 + 画布贴纸（不阻塞挂载）
  },

  /** 缩放条市场按钮点击 → 开/关抽屉 */
  toggle() {
    if (!this._drawer) return;
    const open = this._drawer.classList.toggle('is-open');
    if (open) this._loadMarket();
  },

  _ensureDrawer() {
    if (this._drawer) return;
    const wrap = this._wrap;
    const drawer = document.createElement('div');
    drawer.className = 'bm-market-drawer';
    drawer.setAttribute('role', 'region');
    drawer.setAttribute('aria-label', '素材市场');
    drawer.innerHTML =
      '<div class="bm-market-head">' +
        '<span class="bm-market-title">素材市场</span>' +
        '<button type="button" class="bm-market-close" aria-label="收起素材市场">×</button>' +
      '</div>' +
      '<div class="bm-market-body"><div class="market-loading">正在从竹林素材市场加载…</div></div>';
    wrap.appendChild(drawer);
    this._drawer = drawer;
    this._bodyEl = drawer.querySelector('.bm-market-body');
    drawer.querySelector('.bm-market-close').addEventListener('click', () => {
      drawer.classList.remove('is-open');
    });
    // 抽屉内交互不冒泡到画布（避免触发平移 / 取消选中）
    drawer.addEventListener('pointerdown', (e) => e.stopPropagation());
    drawer.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  },

  async _loadMarket() {
    const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
    if (!mgr || typeof mgr.fetchMaterialMarketManifest !== 'function') {
      this._bodyEl.innerHTML = '<div class="market-empty">素材市场功能暂不可用</div>';
      return;
    }
    this._bodyEl.innerHTML = '<div class="market-loading">正在从竹林素材市场加载…</div>';
    let data;
    try {
      data = await mgr.fetchMaterialMarketManifest();
    } catch (e) {
      this._bodyEl.innerHTML = '<div class="market-empty">素材市场加载失败，请稍后重试</div>';
      return;
    }
    const list = (data && data.manifest && data.manifest.materials) || [];
    if (!list.length) {
      this._bodyEl.innerHTML = '<div class="market-empty">素材市场暂无素材</div>';
      return;
    }
    await this._restoreCollapsed();
    this._renderMarketBody(list);
  },

  _renderMarketBody(list) {
    const el = this;
    // 文本统一转义：原实现 name/author 未转义，新增 series 入 DOM 时一并补上
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // 按 series 分组：组顺序与组内顺序都沿用 manifest 原顺序；无 series 的归入「其他素材」
    const order = [];
    const buckets = new Map();
    list.forEach((m) => {
      const key = m.series || '';
      if (!buckets.has(key)) { buckets.set(key, []); order.push(key); }
      buckets.get(key).push(m);
    });
    let seq = 0; // 全局递增：保证 SvgIsolate 的实例前缀在分组后仍唯一
    const groups = order.map((key) => {
      const items = buckets.get(key);
      const collapsed = !!this._collapsed[key || '__other__'];
      const cards = items.map((m) => {
        const i = seq++;
        const installed = !!this._installed[m.id];
        const preview = installed && this._installed[m.id].preview ? this._installed[m.id].preview : (m.preview || '');
        const thumb = preview
          ? '<div class="bm-market-thumb">' + SvgIsolate.isolate(preview, 'mt' + i + '-') + '</div>'
          : '<div class="bm-market-thumb bm-market-thumb-empty">无预览</div>';
        const typeLabel = m.type === 'sticker' ? '贴纸'
          : (m.type === 'paper' ? '皮肤'
            : (m.type === 'font' ? '字体'
              : (m.type === 'template' ? '模板' : (m.type || ''))));
        const btn = installed
          ? '<button class="market-btn uninstall" data-id="' + esc(m.id) + '">删除</button>'
          : '<button class="market-btn install" data-id="' + esc(m.id) + '" data-url="' + esc(m.url || '') + '" data-version="' + esc(m.version || '') + '">下载</button>';
        const dragAttr = installed ? ' draggable="true"' : '';
        return '<div class="market-card bm-material-card' + (installed ? ' installed' : '') + '"' + dragAttr +
          ' data-id="' + esc(m.id) + '" data-type="' + esc(m.type || '') + '">' +
          thumb +
          '<div class="market-card-main">' +
            '<div class="market-card-head">' +
              '<span class="market-card-name">' + esc(m.name || m.id) + '</span>' +
              '<span class="bm-material-type">' + typeLabel + '</span>' +
            '</div>' +
            (m.author ? '<div class="market-card-author">作者：' + esc(m.author) + (m.version ? ' · v' + esc(m.version) : '') + '</div>' : '') +
            (installed ? '<div class="bm-market-hint">拖入画布使用</div>' : '') +
          '</div>' +
          '<div class="market-card-actions">' + btn + '</div>' +
        '</div>';
      }).join('');
      const keyAttr = esc(key || '__other__');
      return '<div class="bm-market-group' + (collapsed ? ' is-collapsed' : '') + '" data-series="' + keyAttr + '">' +
          '<button type="button" class="bm-market-group-head" data-series="' + keyAttr + '" aria-expanded="' + (!collapsed) + '">' +
            '<span class="bm-market-group-arrow"></span>' +
            '<span class="bm-market-group-name">' + (key ? esc(key) + '系列' : '其他素材') + '</span>' +
            '<span class="bm-market-group-count">' + items.length + '</span>' +
          '</button>' +
          '<div class="market-list">' + cards + '</div>' +
        '</div>';
    }).join('');
    this._bodyEl.innerHTML = groups;

    // 组头点击 → 折叠/展开（卡片始终渲染，靠 CSS 隐藏，切换无需重绘）
    this._bodyEl.querySelectorAll('.bm-market-group-head').forEach((h) => {
      h.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = h.getAttribute('data-series');
        const group = h.closest('.bm-market-group');
        const collapsed = !group.classList.contains('is-collapsed');
        group.classList.toggle('is-collapsed', collapsed);
        h.setAttribute('aria-expanded', String(!collapsed));
        el._collapsed[key] = collapsed;
        el._persistCollapsed();
      });
    });

    this._bodyEl.querySelectorAll('.market-btn.install').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        el._install(b.getAttribute('data-id'), b.getAttribute('data-url'), b.getAttribute('data-version') || '');
      });
    });
    this._bodyEl.querySelectorAll('.market-btn.uninstall').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        el._uninstall(b.getAttribute('data-id'));
      });
    });
    this._bodyEl.querySelectorAll('.bm-material-card.installed').forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        const id = card.getAttribute('data-id');
        e.dataTransfer.setData('text/plain', JSON.stringify({ id, type: card.getAttribute('data-type') }));
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
  },

  async _install(id, url, ver) {
    const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
    if (!mgr || typeof mgr.installMarketMaterial !== 'function') return;
    const code = await mgr.installMarketMaterial(id, url, ver);
    if (!code) { if (typeof Toast !== 'undefined') Toast.showToast('下载失败', 'error'); return; }
    const material = this._sandboxEval(code, id);
    if (!material) { if (typeof Toast !== 'undefined') Toast.showToast('素材格式错误', 'error'); return; }
    material.__code = code;
    this._installed[id] = material;
    this._registerInstalled(material, id);
    await this._persist();
    await this._rerender();
    if (typeof Toast !== 'undefined') Toast.showToast('「' + (material.name || id) + '」已下载，拖入画布使用', 'success');
  },

  async _uninstall(id) {
    const m = this._installed[id];
    if (!m) return;
    if (m.type === 'paper') {
      const style = document.getElementById('bm-paper-' + id);
      if (style) style.remove();
      unregisterMarketPaper(m.name);
    } else if (m.type === 'font') {
      const style = document.getElementById('bm-font-' + id);
      if (style) style.remove();
      unregisterMarketFont(m.name);
    }
    delete this._installed[id];
    delete this._stickers[id];
    delete this._papers[id];
    delete this._fonts[id];
    delete this._templates[id];
    await this._persist();
    await this._rerender();
    if (typeof Toast !== 'undefined') Toast.showToast('「' + (m.name || id) + '」已删除', 'success');
  },

  /** 按类型把已安装素材接入对应管线（CSS 注入 / 循环注册）；id 为安装时传入的素材 id（素材对象本身无 id 字段） */
  _registerInstalled(material, id) {
    const key = id || material.name;
    if (material.type === 'paper') {
      this._papers[key] = material;
      registerMarketPaper(material.name);
      this._registerStyle(material, 'bm-paper-' + key);
    } else if (material.type === 'font') {
      this._fonts[key] = material;
      registerMarketFont(material.name);
      this._registerStyle(material, 'bm-font-' + key);
    } else if (material.type === 'sticker') {
      this._stickers[key] = material;
    } else if (material.type === 'template') {
      this._templates[key] = material;
    }
  },

  /** 注入素材 css()（纸纹 / 字体共用：@font-face、data-paper/data-font 规则等） */
  _registerStyle(material, styleId) {
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = material.css ? material.css() : '';
  },

  async _rerender() {
    const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
    if (!mgr || typeof mgr.fetchMaterialMarketManifest !== 'function') return;
    const data = await mgr.fetchMaterialMarketManifest();
    const list = (data && data.manifest && data.manifest.materials) || [];
    this._renderMarketBody(list);
  },

  /** 持久化：只记 id/版本 —— 素材源码已落盘在宿主「竹林便签素材」目录，重载后经 material:load 按 id 读回 */
  async _persist() {
    try {
      const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
      if (mgr && typeof mgr.putSetting === 'function') {
        const arr = Object.keys(this._installed).map((id) => ({ id, version: this._installed[id].version || '' }));
        await mgr.putSetting('installedMaterials', arr);
      }
    } catch (e) {
      console.warn('[MaterialMarket] 持久化失败:', e && e.message);
    }
  },

  /** 系列分组折叠态持久化：只记 series -> 是否收起，重载后保留用户的展开/收起习惯 */
  async _persistCollapsed() {
    try {
      const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
      if (mgr && typeof mgr.putSetting === 'function') {
        await mgr.putSetting('marketSeriesCollapsed', this._collapsed);
      }
    } catch (e) {
      console.warn('[MaterialMarket] 折叠态持久化失败:', e && e.message);
    }
  },

  async _restoreCollapsed() {
    try {
      const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
      const saved = mgr && typeof mgr.getSetting === 'function' ? await mgr.getSetting('marketSeriesCollapsed') : null;
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) this._collapsed = saved;
    } catch (e) {
      console.warn('[MaterialMarket] 读取折叠态失败:', e && e.message);
    }
  },

  /** 重载恢复：按 id 取回源码（优先宿主 material:load 读 vault 文件，取不到则回退持久化里的 code）
   *  并重新评估 / 注册（CSS 重新注入、纸纹与字体循环重新并入） */
  async _restoreInstalled() {
    try {
      const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
      const saved = mgr && typeof mgr.getSetting === 'function' ? await mgr.getSetting('installedMaterials') : null;
      const arr = Array.isArray(saved) ? saved : [];
      for (const item of arr) {
        if (!item || !item.id) continue;
        let code = item.code || '';
        if (!code && mgr && typeof mgr.loadMarketMaterialCode === 'function') {
          try { code = (await mgr.loadMarketMaterialCode(item.id)) || ''; } catch (_) { code = ''; }
        }
        if (!code) continue;
        try {
          const material = this._sandboxEval(code, item.id);
          if (!material) continue;
          material.__code = code;
          this._installed[item.id] = material;
          this._registerInstalled(material, item.id);
        } catch (e) {
          console.warn('[MaterialMarket] 恢复素材失败:', item.id, e && e.message);
        }
      }
    } catch (e) {
      console.warn('[MaterialMarket] 读取已安装素材失败:', e && e.message);
    }
  },

  /** 安全加载：静态审计 + 沙箱执行，取出 window.__bamboo_material_<id> */
  _sandboxEval(code, id) {
    const noStrings = code
      .replace(/`(?:\\.|[^`\\])*`/g, '``')
      .replace(/'(?:\\.|[^'\\])*'/g, "''")
      .replace(/"(?:\\.|[^"\\])*"/g, '""');
    const stripped = noStrings.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const rules = [
      /\bwindow\.parent\b/, /\bwindow\.top\b/, /\bwindow\.opener\b/, /\bfetch\s*\(/,
      /\bXMLHttpRequest\b/, /\bWebSocket\b/, /\bdocument\.cookie\b/, /\beval\s*\(/,
      /\bnew\s+Function\s*\(/, /\bimport\s*\(/, /\bimport\s+/, /\bnavigator\.sendBeacon\b/,
    ];
    for (const r of rules) {
      if (r.test(stripped)) {
        console.warn('[MaterialMarket] 素材 "' + id + '" 含被禁止的 API，已拒绝加载');
        return null;
      }
    }
    const BLANK = ['parent', 'top', 'opener', 'fetch', 'XMLHttpRequest', 'WebSocket', 'eval', 'import'];
    const saved = {};
    for (const k of BLANK) {
      try { saved[k] = window[k]; } catch (_) { saved[k] = undefined; }
      try { Object.defineProperty(window, k, { value: undefined, configurable: true, writable: false }); } catch (_) {}
    }
    let result = null;
    try {
      const func = new Function(
        'window', 'self',
        code + '\n;return (typeof window!=="undefined"&&window["__bamboo_material_' + id + '"]!==undefined)?window["__bamboo_material_' + id + '"]:null;'
      );
      result = func(window, window);
    } catch (e) {
      console.error('[MaterialMarket] 执行素材 "' + id + '" 出错:', e && e.message);
    } finally {
      for (const k of BLANK) {
        try { Object.defineProperty(window, k, { value: saved[k], configurable: true, writable: true }); } catch (_) {}
      }
    }
    return result;
  },

  // —— 画布 drop 落卡 ——
  _bindCanvasDrop() {
    const ctrl = this._ctrl;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    canvas.addEventListener('dragover', (e) => {
      if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'text/plain') !== -1) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    });
    canvas.addEventListener('drop', (e) => {
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;
      e.preventDefault();
      let payload;
      try { payload = JSON.parse(raw); } catch (_) { return; }
      if (!payload || !payload.id) return;
      const material = this._installed[payload.id];
      if (!material) return;
      const rect = canvas.getBoundingClientRect();
      const s = CanvasViewport.scaleOf(ctrl._canvasOffset) || 1;
      const x = (e.clientX - rect.left) / s;
      const y = (e.clientY - rect.top) / s;
      const targetCard = e.target.closest && e.target.closest('.tw-card');
      if (material.type === 'paper') {
        if (targetCard) {
          targetCard.dataset.paper = material.name;
          targetCard.style.setProperty('--tw-card-paper', material.name);
          if (typeof Toast !== 'undefined') Toast.showToast('已套用「' + material.name + '」皮肤', 'success');
        } else {
          this._spawnCard(material.name, (typeof FONTS !== 'undefined' && FONTS[ctrl._fontIdx]) || 'classic', x, y);
        }
      } else if (material.type === 'sticker') {
        this._dropSticker(material, x, y, payload.id);
      } else if (material.type === 'font') {
        if (targetCard) {
          targetCard.dataset.font = material.name;
          if (typeof Toast !== 'undefined') Toast.showToast('已套用「' + material.name + '」字体', 'success');
        } else {
          this._spawnCard((typeof PAPERS !== 'undefined' && PAPERS[ctrl._paperIdx]) || 'plain', material.name, x, y);
        }
      } else if (material.type === 'template') {
        const preset = material.preset || {};
        if (targetCard) {
          if (preset.paper) { targetCard.dataset.paper = preset.paper; targetCard.style.setProperty('--tw-card-paper', preset.paper); }
          if (preset.font) targetCard.dataset.font = preset.font;
          if (typeof Toast !== 'undefined') Toast.showToast('已套用模板「' + material.name + '」', 'success');
        } else {
          this._spawnCard(preset.paper || 'plain', preset.font || ((typeof FONTS !== 'undefined' && FONTS[ctrl._fontIdx]) || 'classic'), x, y);
        }
      }
    });
  },

  /** 在画布 (x,y) 处新建一张指定纸纹 / 字体的空白便签（复用 feature 的建卡 / 登记管线） */
  _spawnCard(paperId, fontId, x, y) {
    const ctrl = this._ctrl;
    const id = WritingDoc.newId();
    const date = ctrl._now();
    const card = ctrl._createCardEl({ id, font: fontId, paper: paperId, date, level: 'p' });
    // applyPaper/applyFont 会按内置 PAPERS/FONTS 强制回默认；市场素材需直接覆盖 dataset 使其命中注入的 CSS
    card.dataset.paper = paperId;
    card.style.setProperty('--tw-card-paper', paperId);
    card.dataset.font = fontId;
    card.style.zIndex = String(++ctrl._zTop);
    const cw = card.offsetWidth || 340;
    const ch = card.offsetHeight || 200;
    card.style.left = (x - cw / 2) + 'px';
    card.style.top = (y - ch / 2) + 'px';
    card.style.bottom = 'auto';
    ctrl._canvas.appendChild(card);
    const maxSeq = ctrl._notes.reduce((m, n) => (Number.isFinite(n.seq) && n.seq > m ? n.seq : m), -1);
    ctrl._notes = ctrl._notes.concat([{
      id, seq: maxSeq + 1, text: '', x: parseFloat(card.style.left) || 0, y: parseFloat(card.style.top) || 0,
      font: card.dataset.font || 'classic', paper: paperId, level: 'p', date, zoom: 1, fontScale: 1, rot: 0,
    }]);
    ctrl._mountedCards.set(id, card);
    ViewportCuller.setGeom({ state: ctrl._state, ctrl }, id, { x: parseFloat(card.style.left) || 0, y: parseFloat(card.style.top) || 0, w: cw, h: ch, rot: 0 });
    ctrl._measureCard(card);
    ctrl._refreshWriteOrder();
    if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
  },

  // ===== 画布贴纸：独立 DOM + 独立持久化（按便签组存），不入便签模型 =====

  /** 在画布 (x,y) 处落一张贴纸；materialId＝素材 id（只持久化 id，不持久化 DOM） */
  async _dropSticker(material, x, y, materialId) {
    const ctrl = this._ctrl;
    if (!ctrl || !ctrl._canvas) return;
    // 贴纸初始尺寸按设计稿 SVG 的 viewBox 比例（短边 120），避免被正方形框压扁/留白
    let w = 120, h = 120;
    const vb = material && material.preview && material.preview.match(/viewBox\s*=\s*["']\s*-?[\d.]+\s+-?[\d.]+\s+([\d.]+)\s+([\d.]+)/i);
    if (vb) {
      const vbW = parseFloat(vb[1]), vbH = parseFloat(vb[2]);
      if (vbW > 0 && vbH > 0) {
        if (vbW >= vbH) { w = 120; h = Math.round(120 * vbH / vbW); }
        else { h = 120; w = Math.round(120 * vbW / vbH); }
      }
    }
    const rec = { id: 'stk-' + Math.random().toString(36).slice(2, 9), material: materialId || material.name, x, y, z: 0, w, h, rot: 0, flipX: false, flipY: false, el: null };
    const el = this._buildStickerEl(ctrl, material, rec);
    ctrl._canvas.appendChild(el);
    rec.el = el;
    this._canvasStickers.push(rec);
    await this._saveStickers();
  },

  /** 取素材预览 SVG 的宽高比（viewBox 后两维）；取不到返回 0 */
  _stickerAspect(material) {
    const m = material && material.preview
      ? material.preview.match(/viewBox\s*=\s*["']\s*-?[\d.]+\s+-?[\d.]+\s+([\d.]+)\s+([\d.]+)/i)
      : null;
    if (!m) return 0;
    const w = parseFloat(m[1]), h = parseFloat(m[2]);
    return (w > 0 && h > 0) ? (w / h) : 0;
  },

  /** 按一条贴纸记录构建 DOM（含删除钮 + 拖拽） */
  _buildStickerEl(ctrl, material, rec) {
    const el = document.createElement('div');
    el.className = 'bm-sticker';
    el.dataset.stickerId = rec.id;
    el.style.left = rec.x + 'px';
    el.style.top = rec.y + 'px';
    el.style.zIndex = String(rec.z || (++ctrl._zTop));
    rec.z = Number(el.style.zIndex);
    // 尺寸 / 旋转：与位置同属可持久化属性，重建时一并还原。
    // 元素比例必须等于素材 viewBox 比例：一旦偏离，SVG 会按 preserveAspectRatio=meet 居中留白，
    // 四角的操作手柄就会离图形很远。素材更新 viewBox 后，历史贴纸在此自动贴合新比例。
    const aspect = this._stickerAspect(material);
    if (aspect) {
      const w0 = Number(rec.w) || 120, h0 = Number(rec.h) || 120;
      if (h0 > 0 && Math.abs(w0 / h0 - aspect) > 0.01) { rec.w = w0; rec.h = Math.round(w0 / aspect); }
    }
    el.style.width = (rec.w || 120) + 'px';
    el.style.height = (rec.h || 120) + 'px';
    el.style.transform = 'rotate(' + (rec.rot || 0) + 'deg)';
    el.innerHTML = '<div class="bm-sticker-content">' + (material.render ? SvgIsolate.isolate(material.render(), rec.id + '-') : '') + '</div>' +
      '<button type="button" class="bm-sticker-rotate" aria-label="旋转贴纸" title="拖动旋转 · Shift 吸附 15° · 双击归零">↻</button>' +
      '<button type="button" class="bm-sticker-resize" aria-label="缩放贴纸" title="拖动缩放 · Shift 等比 · 双击还原">⇲</button>' +
      '<button type="button" class="bm-sticker-flip" aria-label="翻转贴纸" title="水平翻转（镜像）· Shift 垂直翻转">↔</button>' +
      '<button type="button" class="bm-sticker-del" aria-label="删除贴纸" title="删除贴纸">×</button>';
    const del = el.querySelector('.bm-sticker-del');
    if (del) {
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        el.remove();
        this._canvasStickers = this._canvasStickers.filter((s) => s !== rec);
        this._saveStickers();
        if (typeof Toast !== 'undefined') Toast.showToast('贴纸已删除', 'success');
      });
    }
    // 翻转：仅作用于内容层（.bm-sticker-content），不波及元素级旋转与四角手柄
    const flip = el.querySelector('.bm-sticker-flip');
    if (flip) {
      flip.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.shiftKey) rec.flipY = !rec.flipY;
        else rec.flipX = !rec.flipX;
        this._applyFlip(el, rec);
        this._saveStickers();
        if (typeof Toast !== 'undefined') Toast.showToast('已翻转', 'success');
      });
    }
    this._applyFlip(el, rec);
    this._makeStickerDraggable(ctrl, el, rec);
    this._makeStickerRotatable(ctrl, el, rec);
    this._makeStickerResizable(ctrl, el, rec);
    return el;
  },

  // 素材 SVG 的实例隔离（id 前缀 + <style> 作用域沙箱）已统一收敛到 utils/svgIsolate.js：
  // SvgIsolate.isolate() 一次解决「url(#id) 跨实例串用」与「内嵌 <style> 全局串色」两类污染，
  // 使任意第三方矢量素材天然自包含。此处不再内联实现，避免两处逻辑漂移。

  /** 翻转仅作用于内容层，不影响 .bm-sticker 元素上的旋转与四角手柄 */
  _applyFlip(el, rec) {
    const c = el.querySelector('.bm-sticker-content');
    if (!c) return;
    c.style.transform = 'scaleX(' + (rec.flipX ? -1 : 1) + ') scaleY(' + (rec.flipY ? -1 : 1) + ')';
  },

  _makeStickerDraggable(ctrl, el, rec) {
    let dragging = false, sx = 0, sy = 0, lx = 0, ly = 0, raf = 0;
    const apply = () => { raf = 0; el.style.left = lx + 'px'; el.style.top = ly + 'px'; };
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      // 关键：不冒泡到画布 —— 贴纸不是 .tw-card，冒泡上去会被判定为「拖空白」而启动框选 / 平移。
      // （同 CanvasZoomUI 缩放条与卡片浮层的既有约定：浮层内交互一律 stopPropagation。）
      e.stopPropagation();
      dragging = true; sx = e.clientX; sy = e.clientY;
      lx = parseFloat(el.style.left) || 0; ly = parseFloat(el.style.top) || 0;
      el.style.zIndex = String(++ctrl._zTop);
      if (rec) rec.z = Number(el.style.zIndex);
      e.preventDefault();
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
    const onMove = (e) => {
      if (!dragging) return;
      const s = CanvasViewport.scaleOf(ctrl._canvasOffset) || 1;
      lx += (e.clientX - sx) / s; ly += (e.clientY - sy) / s;
      sx = e.clientX; sy = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      dragging = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      // 拖完落盘：位置持久化，重载 / 切组后仍在原处
      if (rec) { rec.x = lx; rec.y = ly; this._saveStickers(); }
    };
  },

  /** 贴纸旋转：绕中心取角度增量（数学同便签 makeRotatable，含 ±180° 跳变归一、Shift 吸附 15°） */
  _makeStickerRotatable(ctrl, el, rec) {
    const handle = el.querySelector('.bm-sticker-rotate');
    if (!handle) return;
    let rotating = false, lastAngle = 0, cx0 = 0, cy0 = 0, pendingDeg = 0, raf = 0;
    const angleOf = (ax, ay, px, py) => Math.atan2(py - ay, px - ax) * 180 / Math.PI;
    const apply = () => {
      raf = 0;
      rec.rot = pendingDeg;
      el.style.transform = 'rotate(' + pendingDeg + 'deg)';
    };
    const onMove = (e) => {
      if (!rotating) return;
      const a = angleOf(cx0, cy0, e.clientX, e.clientY);
      let delta = a - lastAngle;
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;
      lastAngle = a;
      pendingDeg += delta;
      if (e.shiftKey) pendingDeg = Math.round(pendingDeg / 15) * 15;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      if (!rotating) return;
      rotating = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      apply();                    // 补写最后一帧，避免丢掉末尾增量
      this._saveStickers();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();        // 不冒泡：否则会触发贴纸拖拽 / 画布框选
      rotating = true;
      const r = el.getBoundingClientRect();
      cx0 = r.left + r.width / 2;
      cy0 = r.top + r.height / 2;
      pendingDeg = Number(rec.rot) || 0;
      lastAngle = angleOf(cx0, cy0, e.clientX, e.clientY);
      el.style.zIndex = String(++ctrl._zTop);
      rec.z = Number(el.style.zIndex);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
    handle.addEventListener('dblclick', (e) => {
      e.preventDefault(); e.stopPropagation();
      rec.rot = 0; el.style.transform = 'rotate(0deg)';
      this._saveStickers();
    });
  },

  /** 贴纸缩放：拖右下角改尺寸（Shift 保持原比例，下限 40px，双击还原默认） */
  _makeStickerResizable(ctrl, el, rec) {
    const handle = el.querySelector('.bm-sticker-resize');
    if (!handle) return;
    let resizing = false, sx = 0, sy = 0, sw = 0, sh = 0, w = 0, h = 0, raf = 0;
    const apply = () => {
      raf = 0;
      rec.w = Math.round(w); rec.h = Math.round(h);
      el.style.width = rec.w + 'px'; el.style.height = rec.h + 'px';
    };
    const onMove = (e) => {
      if (!resizing) return;
      const s = CanvasViewport.scaleOf(ctrl._canvasOffset) || 1;
      const dx = (e.clientX - sx) / s, dy = (e.clientY - sy) / s;
      w = Math.max(40, sw + dx);
      // 始终等比：贴纸元素比例一旦偏离 SVG viewBox 比例，SVG 就会按 meet 居中留白，
      // 使四角手柄远离图形。插画类贴纸本就该保比例，故不再提供自由拉伸（Shift 与否一致）。
      h = Math.max(40, w * (sh / sw));
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      if (!resizing) return;
      resizing = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      apply();
      this._saveStickers();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      sx = e.clientX; sy = e.clientY;
      sw = Number(rec.w) || el.offsetWidth || 120;
      sh = Number(rec.h) || el.offsetHeight || 120;
      el.style.zIndex = String(++ctrl._zTop);
      rec.z = Number(el.style.zIndex);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
    handle.addEventListener('dblclick', (e) => {
      e.preventDefault(); e.stopPropagation();
      // 双击还原：保持当前宽高比，短边回到 120（而非强制正方形破坏比例）
      const ratio = (Number(rec.w) || 120) / (Number(rec.h) || 120);
      if (ratio >= 1) { rec.h = 120; rec.w = Math.round(120 * ratio); }
      else { rec.w = 120; rec.h = Math.round(120 / ratio); }
      el.style.width = rec.w + 'px'; el.style.height = rec.h + 'px';
      this._saveStickers();
    });
  },


  /** 贴纸存储 key：随便签组切换（贴纸属于某一组，不跨组串味） */
  async _stickerKey() {
    try {
      const g = await TypewriterStore.getCurrentNotesGroup();
      return 'notesStickers:' + ((g && g.id) || 'default');
    } catch (_) { return 'notesStickers:default'; }
  },

  async _saveStickers() {
    try {
      const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
      if (!mgr || typeof mgr.putSetting !== 'function') return;
      const arr = this._canvasStickers.map((s) => ({
        id: s.id, material: s.material,
        x: Math.round(s.x), y: Math.round(s.y), z: s.z || 0,
        w: Math.round(s.w || 120), h: Math.round(s.h || 120), rot: Math.round(s.rot || 0),
        fx: s.flipX ? 1 : 0, fy: s.flipY ? 1 : 0,
      }));
      await mgr.putSetting(await this._stickerKey(), arr);
    } catch (e) {
      console.warn('[MaterialMarket] 贴纸保存失败:', e && e.message);
    }
  },

  /** 清掉画布上的贴纸 DOM（重载 / 切组时先清） */
  _clearStickerDom() {
    const ctrl = this._ctrl;
    if (ctrl && ctrl._canvas) {
      ctrl._canvas.querySelectorAll('.bm-sticker').forEach((el) => el.remove());
    }
    this._canvasStickers = [];
  },

  /** 恢复当前便签组的贴纸（须在已安装素材恢复之后，否则拿不到 render） */
  async _restoreStickers() {
    try {
      this._clearStickerDom();
      const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
      if (!mgr || typeof mgr.getSetting !== 'function') return;
      const arr = await mgr.getSetting(await this._stickerKey());
      if (!Array.isArray(arr) || !arr.length) return;
      const ctrl = this._ctrl;
      if (!ctrl || !ctrl._canvas) return;
      for (const s of arr) {
        const material = this._installed[s.material];
        if (!material) continue;   // 素材已删除 / 未安装 → 不重建
        // z 传 0 = 重建时统一置顶（由 _buildStickerEl 取 ++_zTop）。
        // 不能沿用落盘的旧 z：切档会重建卡片并让 _zTop 继续递增（实测 14 → 20），
        // 沿用旧值会让贴纸被新卡片压在下面 —— 即「切走再切回贴纸不见了，重启才回来」。
        const rec = { id: s.id, material: s.material, x: Number(s.x) || 0, y: Number(s.y) || 0, z: 0, w: Number(s.w) || 120, h: Number(s.h) || 120, rot: Number(s.rot) || 0, flipX: !!s.fx, flipY: !!s.fy, el: null };
        const el = this._buildStickerEl(ctrl, material, rec);
        ctrl._canvas.appendChild(el);
        rec.el = el;
        this._canvasStickers.push(rec);
      }
      // 注：重建时每条贴纸 z=0，由 _buildStickerEl 走 ++_zTop 统一置顶（高于重建后的卡片），
      // 故切档 / 重载后贴纸始终浮于卡片之上，无需再按 front/back 重排。
    } catch (e) {
      console.warn('[MaterialMarket] 贴纸恢复失败:', e && e.message);
    }
  },

  /** 供外部（切便签组）调用：按新组重建贴纸 */
  async reloadStickers() { await this._restoreStickers(); },

  /** 启动恢复：先素材后贴纸（贴纸渲染依赖已安装素材） */
  async _restoreAll() {
    await this._restoreInstalled();
    await this._restoreStickers();
  },
};

// 测试 harness（loadModule 剥离 import）兼容：挂到 globalThis。
if (typeof globalThis !== 'undefined') {
  globalThis.MaterialMarket = MaterialMarket;
}
