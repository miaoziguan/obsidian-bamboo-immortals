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
import { ModePolicy } from './modePolicy.js';
// 贴纸按「便签组」独立持久化：需取当前组 id 作为存储 key
import { TypewriterStore } from '../../services/TypewriterStore.js';
// 素材 SVG 注入前的实例隔离（id 前缀 + <style> 作用域沙箱）
import { SvgIsolate } from '../../utils/svgIsolate.js';
// 贴纸隔离结果缓存：切档/切组重建同一张贴纸时直接命中，避免重复的逐 id 全串替换
import { isolateStickerHtml, evictStickerIsolate } from '../../utils/stickerIsolateCache.js';
// 素材 minAppVersion 门控：宿主版本低于素材要求时明确拒绝装载（而不是渲染到一半崩坏）
import { meetsMinVersion } from '../../utils/semver.js';
// 动态 <style>/查询须走 shadow 抽象层：画中卷运行在 Shadow DOM 内，市场纸纹 css 若插到 document.head 将穿透不进 shadow 内的 .tw-card
import { getStyleMount, byId } from '../../utils/domRef.js';

import { LucideUtils } from '../../utils/lucideUtils.js';

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
  _installedVersions: {}, // id -> { version, installedAt }（宿主权威版本表，用于「可更新」判定）
  _canvasStickers: [], // 画布贴纸：{ id, material, x, y, z, w, h, rot, el }（独立持久化，不入便签模型；永远浮于卡片之上）
  _menu: null,         // 右键层级菜单 DOM
  _menuCloser: null,   // 菜单关闭监听
  _collapsed: {},      // 系列分组折叠态：series 名 -> true（未分组素材用 __other__），持久化到 marketSeriesCollapsed
  _typeFilter: '',     // 形态筛选：'' = 全部；'sticker' 贴纸 | 'paper' 皮肤 | 'font' 字体 | 'template' 模板（仅本次会话，不持久化）
  _persistedMeta: {},  // 已安装素材的 {version, installedAt} 快照（持久化时保留宿主写入的元数据，避免被覆盖）

  /** feature.mount 时调用：记 ctrl/wrap，挂抽屉与画布 drop 监听（幂等） */
  init(ctrl, host) {
    this._ctrl = ctrl;
    ctrl._materialMarket = this;   // 回指：卡片侧（统一选区 / 整体拖动 / Delete）可一致操作贴纸
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
        '<button type="button" class="bm-market-refresh" aria-label="刷新素材清单" title="刷新">' + LucideUtils.createIcon('refreshCw', { size: 16, strokeWidth: 1.8 }) + '</button>' +
        '<button type="button" class="bm-market-close" aria-label="收起素材市场" title="收起">' + LucideUtils.createIcon('x', { size: 16, strokeWidth: 1.8 }) + '</button>' +
      '</div>' +
      '<div class="bm-market-body"><div class="market-loading">正在从竹林素材市场加载…</div></div>';
    wrap.appendChild(drawer);
    this._drawer = drawer;
    this._bodyEl = drawer.querySelector('.bm-market-body');
    // 刷新：绕过宿主 TTL 缓存强制重拉清单（作者更新后立即看到「可更新」）
    drawer.querySelector('.bm-market-refresh').addEventListener('click', () => {
      this._loadMarket(true);
    });
    drawer.querySelector('.bm-market-close').addEventListener('click', () => {
      drawer.classList.remove('is-open');
    });
    // 抽屉内交互不冒泡到画布（避免触发平移 / 取消选中）
    drawer.addEventListener('pointerdown', (e) => e.stopPropagation());
    drawer.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  },

  async _loadMarket(force) {
    const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
    if (!mgr || typeof mgr.fetchMaterialMarketManifest !== 'function') {
      this._bodyEl.innerHTML = '<div class="market-empty">素材市场功能暂不可用</div>';
      return;
    }
    this._bodyEl.innerHTML = '<div class="market-loading">正在从竹林素材市场加载…</div>';
    let data;
    try {
      data = await mgr.fetchMaterialMarketManifest(!!force);
    } catch (e) {
      this._bodyEl.innerHTML = '<div class="market-empty">素材市场加载失败，请稍后重试</div>';
      return;
    }
    this._installedVersions = (data && data.installed) || {}; // 宿主权威版本表 → 「可更新」判定
    const list = (data && data.manifest && data.manifest.materials) || [];
    if (!list.length) {
      this._bodyEl.innerHTML = '<div class="market-empty">素材市场暂无素材</div>';
      return;
    }
    await this._restoreCollapsed();
    this._renderMarketBody(list);
  },

  /** 当前宿主插件版本（bridge 经 app:ready 下发）；未下发时返回空串 → 门控按「无从比较」放行，不误杀 */
  _appVersion() {
    return (typeof window !== 'undefined' && window.__bambooAppVersion) || '';
  },

  /** 形态筛选 chips：只列清单中真实存在的形态并附数量，避免空分类占位（贴纸 / 皮肤 / 字体 / 模板） */
  _typeChipsHtml(list) {
    const LABEL = { sticker: '贴纸', paper: '皮肤', font: '字体', template: '模板' };
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const counts = new Map();
    list.forEach((m) => { const t = m.type || ''; counts.set(t, (counts.get(t) || 0) + 1); });
    const cur = this._typeFilter || '';
    const items = [['', '全部', list.length]].concat(
      ['sticker', 'paper', 'font', 'template'].filter((t) => counts.has(t)).map((t) => [t, LABEL[t] || t, counts.get(t)])
    );
    return '<div class="bm-market-filters" role="tablist" aria-label="按形态筛选素材">' +
      items.map((it) => {
        const on = cur === it[0];
        return '<button type="button" class="bm-market-chip' + (on ? ' is-active' : '') + '" data-type="' + esc(it[0]) + '"' +
          ' role="tab" aria-selected="' + (on ? 'true' : 'false') + '" title="只看' + esc(it[1]) + '">' +
          esc(it[1]) + '<span class="bm-market-chip-count">' + it[2] + '</span></button>';
      }).join('') +
      '</div>';
  },

  /** chips 点击 → 切换形态筛选并重绘（筛选态仅本次会话有效，不做持久化） */
  _bindTypeChips(list) {
    this._bodyEl.querySelectorAll('.bm-market-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const t = btn.getAttribute('data-type') || '';
        if (this._typeFilter === t) return;
        this._typeFilter = t;
        this._renderMarketBody(list);
      });
    });
  },

  _renderMarketBody(list) {
    const el = this;
    // D · 宿主版本（bridge 经 app:ready 下发）；未下发时为空串 → 门控放行，不误杀
    const appVer = this._appVersion();
    // 文本统一转义：原实现 name/author 未转义，新增 series 入 DOM 时一并补上
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // 形态筛选 chips → 先按当前筛选过滤，再按 series 分组（分组主轴仍是 series，形态只作筛选）
    const chips = this._typeChipsHtml(list);
    const view = this._typeFilter ? list.filter((m) => (m.type || '') === this._typeFilter) : list;
    if (!view.length) {
      this._bodyEl.innerHTML = chips + '<div class="market-empty">该分类暂无素材</div>';
      this._bindTypeChips(list);
      return;
    }
    // 按 series 分组：组顺序与组内顺序都沿用 manifest 原顺序；无 series 的归入「其他素材」
    const order = [];
    const buckets = new Map();
    view.forEach((m) => {
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
        // D · minAppVersion 门控：素材要求的宿主版本高于当前 → 明确拒绝（不下载 / 不入沙箱 / 不可拖）
        const need = m.minAppVersion || '';
        const blocked = !meetsMinVersion(appVer, need);
        // C · schema 预留 previewUrl：优先内联预览（素材自带 / 已装源码回填），缺失再按 URL 懒加载
        const preview = installed && this._installed[m.id].preview ? this._installed[m.id].preview : (m.preview || '');
        const thumb = preview
          ? '<div class="bm-market-thumb">' + SvgIsolate.isolate(preview, 'mt' + i + '-') + '</div>'
          : (m.previewUrl
              ? '<div class="bm-market-thumb"><img class="bm-market-thumb-img" loading="lazy" decoding="async" alt="" src="' + esc(m.previewUrl) + '"></div>'
              : '<div class="bm-market-thumb bm-market-thumb-empty">无预览</div>');
        const typeLabel = m.type === 'sticker' ? '贴纸'
          : (m.type === 'paper' ? '皮肤'
            : (m.type === 'font' ? '字体'
              : (m.type === 'template' ? '模板' : (m.type || ''))));
        // B · 「可更新」：以宿主权威版本表比对（与主题 / 模块市场同式）
        const ver = m.version || '';
        const rec = this._installedVersions[m.id];
        const hasUpdate = installed && !!ver && !!rec && rec.version !== ver;
        const ICON = {
          download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
          trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
          ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
        };
        const btn = blocked
          ? '<button class="market-btn install is-blocked" disabled data-id="' + esc(m.id) + '" title="不可用" aria-label="不可用">' + ICON.ban + '</button>'
          : (!installed
              ? '<button class="market-btn install" data-id="' + esc(m.id) + '" data-url="' + esc(m.url || '') + '" data-version="' + esc(ver) + '" data-min-app="' + esc(need) + '" title="下载" aria-label="下载">' + ICON.download + '</button>'
              : (hasUpdate
                  ? '<button class="market-btn install" data-action="update" data-id="' + esc(m.id) + '" data-url="' + esc(m.url || '') + '" data-version="' + esc(ver) + '" data-min-app="' + esc(need) + '" title="更新" aria-label="更新">' + ICON.download + '</button>' +
                    '<button class="market-btn uninstall" data-id="' + esc(m.id) + '" title="删除" aria-label="删除">' + ICON.trash + '</button>'
                  : '<button class="market-btn uninstall" data-id="' + esc(m.id) + '" title="删除" aria-label="删除">' + ICON.trash + '</button>'));
        const dragAttr = installed && !blocked ? ' draggable="true"' : '';
        return '<div class="market-card bm-material-card' + (installed ? ' installed' : '') + '"' + dragAttr +
          ' data-id="' + esc(m.id) + '" data-type="' + esc(m.type || '') + '">' +
          thumb +
          '<div class="market-card-main">' +
            '<div class="market-card-head">' +
              '<span class="market-card-name">' + esc(m.name || m.id) + '</span>' +
              (hasUpdate ? '<span class="market-update-badge">可更新 v' + esc(ver) + '</span>' : '') +
              '<span class="bm-material-type">' + typeLabel + '</span>' +
            '</div>' +
            (m.author ? '<div class="market-card-author">作者：' + esc(m.author) + (m.version ? ' · v' + esc(m.version) : '') + '</div>' : '') +
            (blocked
              ? '<div class="bm-market-hint is-blocked">需插件 ≥ v' + esc(need) + '</div>'
              : (installed ? '<div class="bm-market-hint">拖入画布使用</div>' : '')) +
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
    this._bodyEl.innerHTML = chips + groups;
    // 形态 chips 点击 → 切换筛选并重绘
    this._bindTypeChips(list);

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
        el._install(b.getAttribute('data-id'), b.getAttribute('data-url'), b.getAttribute('data-version') || '', b.getAttribute('data-action') === 'update', b.getAttribute('data-min-app') || '');
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

  async _install(id, url, ver, isUpdate, minApp) {
    const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
    if (!mgr || typeof mgr.installMarketMaterial !== 'function') return;
    // D · 门控兜底：渲染层已禁用按钮，这里再挡一层（防外部直接调用 / 旧 DOM），并给出明确提示
    if (!meetsMinVersion(this._appVersion(), minApp)) {
      if (typeof Toast !== 'undefined') Toast.showToast('该素材需插件 ≥ v' + (minApp || '?') + '，请先更新插件', 'error');
      return;
    }
    const code = await mgr.installMarketMaterial(id, url, ver);
    if (!code) { if (typeof Toast !== 'undefined') Toast.showToast('下载失败', 'error'); return; }
    const material = this._sandboxEval(code, id);
    if (!material) { if (typeof Toast !== 'undefined') Toast.showToast('素材格式错误', 'error'); return; }
    material.__code = code;
    material.version = ver || '';   // 记下版本：_persist 写回 materialInstalled 时保留，供「可更新」比对
    this._installed[id] = material;
    this._registerInstalled(material, id);
    await this._persist();
    await this._rerender();
    if (typeof Toast !== 'undefined') Toast.showToast('「' + (material.name || id) + '」' + (isUpdate ? '已更新到 v' + (ver || '最新') : '已下载，拖入画布使用'), 'success');
  },

  async _uninstall(id) {
    const m = this._installed[id];
    if (!m) return;
    if (m.type === 'paper') {
      const style = byId('bm-paper-' + id);
      if (style) style.remove();
      unregisterMarketPaper(m.name);
    } else if (m.type === 'font') {
      const style = byId('bm-font-' + id);
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

  /** 注入素材 css()（纸纹 / 字体共用：@font-face、data-paper/data-font 规则等）。
   *  【Shadow DOM】画中卷跑在 shadowRoot 内，动态 <style> 必须插到 shadowRoot（getStyleMount）；
   *  插到 document.head 会因 shadow 封装穿透不进 .tw-card —— 纸纹/字体 css 全部失效（paper 类素材首曝此坑）。 */
  _registerStyle(material, styleId) {
    let style = byId(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      getStyleMount().appendChild(style);
    }
    style.textContent = material.css ? material.css() : '';
  },

  async _rerender() {
    const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
    if (!mgr || typeof mgr.fetchMaterialMarketManifest !== 'function') return;
    const data = await mgr.fetchMaterialMarketManifest();
    this._installedVersions = (data && data.installed) || {};
    const list = (data && data.manifest && data.manifest.materials) || [];
    this._renderMarketBody(list);
  },

  /** 持久化：只记 id/版本 —— 素材源码已落盘在宿主「竹林便签素材」目录，重载后经 material:load 按 id 读回。
   *  【键必须与宿主一致】宿主 material:install 写的是 materialInstalled（对象 id→{version,installedAt}）；
   *  早先这里写 installedMaterials(数组) 与宿主不同键、且该键从未落盘，导致重载后恢复读空、
   *  素材不注册、CSS 不注入（市场皮肤重启丢失的根因）。故改写同一键，并保留宿主已写入的
   *  version / installedAt（不清空，否则「可更新」检测失效）；卸载时也靠它把条目摘掉。 */
  async _persist() {
    try {
      const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
      if (mgr && typeof mgr.putSetting === 'function') {
        const prev = this._persistedMeta || {};
        const obj = {};
        Object.keys(this._installed).forEach((id) => {
          const old = prev[id] || {};
          obj[id] = {
            version: (this._installed[id] && this._installed[id].version) || old.version || '',
            installedAt: old.installedAt || Date.now(),
          };
        });
        await mgr.putSetting('materialInstalled', obj);
        this._persistedMeta = obj;
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
      // 【持久化键对齐】宿主持久化的权威键是 materialInstalled（对象 id→{version,installedAt}，
      // 见 AppAPI 的 material:install）。早先这里读 installedMaterials(数组)——与宿主不同键、
      // 且从未落盘 → 永远读空 → 素材不注册、CSS 不注入（市场皮肤重启丢失的根因）。
      // 现以 materialInstalled 为准，并兼容历史键 installedMaterials(数组)。
      let saved = null;
      if (mgr && typeof mgr.getSetting === 'function') {
        saved = await mgr.getSetting('materialInstalled');
        if (!saved) saved = await mgr.getSetting('installedMaterials');
      }
      const arr = Array.isArray(saved)
        ? saved
        : (saved && typeof saved === 'object'
            ? Object.keys(saved).map((id) => Object.assign({ id }, saved[id] || {}))
            : []);
      this._persistedMeta = (!Array.isArray(saved) && saved && typeof saved === 'object') ? saved : {};
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
          // D · minAppVersion 门控：已装素材要求的宿主版本高于当前 → 不注册（不注入 CSS、不入纸纹/字体列表），
          //     避免依赖新版宿主 API 的素材把画布渲染坏。源码保留，升级插件后自动可用。
          const need = material.minAppVersion || '';
          if (!meetsMinVersion(this._appVersion(), need)) {
            console.warn('[MaterialMarket] 素材 "' + item.id + '" 需插件 ≥ v' + need + '，当前 v' + this._appVersion() + '，本轮不加载');
            continue;
          }
          material.__code = code;
          this._installed[item.id] = material;
          this._registerInstalled(material, item.id);
        } catch (e) {
          console.warn('[MaterialMarket] 恢复素材失败:', item.id, e && e.message);
        }
      }
      const ids = Object.keys(this._installed);
      console.log('[MaterialMarket] 已恢复素材 ' + ids.length + ' 个: ' + (ids.join(', ') || '(无)'));
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
    const wrap = this._wrap;
    if (!wrap) return;
    // 治本：事件委托到稳定祖先（feature 根，切组/重挂都不动它），不再绑死某个具体 canvas 节点；
    // 先移除旧监听，避免 init 重跑 / 多实例时 handler 累加。
    //
    // 【命中判定为什么不能用 .tw-canvas】
    // .tw-canvas 是「无限画布」的坐标容器：position:relative + 由 JS 施加 transform: translate(panX,panY)
    // （仅平移，见 _applyCanvasTransform），且 background:transparent。因此它的 DOM 矩形
    // （getBoundingClientRect）会随画布平移漂到可视区之外，肉眼既看不出它的边界，也无法用它判定落点。
    // 实测：画布被平移到 rect=[214,1050,…]、而用户在可视区 y≈400 处拖放 → 用 canvas 矩形/子树判定会
    // 误判为“不在画布上” → dragover 不 preventDefault → 浏览器不 firing drop → 表现为“拖不进来”。
    //
    // 正解：凡落在 feature 根(wrap) 内、且不在素材抽屉 / 预览弹窗等 chrome 上，一律视为可落卡区。
    // 落点坐标仍以 canvas.getBoundingClientRect() 换算（该矩形已含 translate，减左/上即得画布局部坐标，
    // 除以缩放比后与卡片坐标系一致）——松手在哪，贴纸就落在哪。
    if (this._onDragOver) {
      wrap.removeEventListener('dragover', this._onDragOver);
      wrap.removeEventListener('drop', this._onDrop);
    }
    const isDropZone = (e) => {
      const t = e.target;
      if (!t || !t.closest) return false;
      if (t.closest('.bm-market-drawer')) return false;   // 素材抽屉自身：不落卡
      if (t.closest('.tw-preview-modal')) return false;   // 整篇预览弹窗：不落卡
      return true;
    };
    this._onDragOver = (e) => {
      if (!isDropZone(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };
    this._onDrop = (e) => {
      if (!isDropZone(e)) return;
      const ctrl = this._ctrl;
      const canvas = ctrl && ctrl._canvas;
      if (!canvas) return;
      let raw = '';
      try { raw = e.dataTransfer ? e.dataTransfer.getData('text/plain') : ''; } catch (_) {}
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
          this._applyMaterialToCard(targetCard, { paper: material.name });
          if (typeof Toast !== 'undefined') Toast.showToast('已套用「' + material.name + '」皮肤', 'success');
        } else {
          this._spawnCard(material.name, (typeof FONTS !== 'undefined' && FONTS[ctrl._fontIdx]) || 'classic', x, y);
        }
      } else if (material.type === 'sticker') {
        this._dropSticker(material, x, y, payload.id);
      } else if (material.type === 'font') {
        if (targetCard) {
          this._applyMaterialToCard(targetCard, { font: material.name });
          if (typeof Toast !== 'undefined') Toast.showToast('已套用「' + material.name + '」字体', 'success');
        } else {
          this._spawnCard((typeof PAPERS !== 'undefined' && PAPERS[ctrl._paperIdx]) || 'plain', material.name, x, y);
        }
      } else if (material.type === 'template') {
        const preset = material.preset || {};
        if (targetCard) {
          this._applyMaterialToCard(targetCard, { paper: preset.paper, font: preset.font });
          if (typeof Toast !== 'undefined') Toast.showToast('已套用模板「' + material.name + '」', 'success');
        } else {
          this._spawnCard(preset.paper || 'plain', preset.font || ((typeof FONTS !== 'undefined' && FONTS[ctrl._fontIdx]) || 'classic'), x, y);
        }
      }
    };
    wrap.addEventListener('dragover', this._onDragOver);
    wrap.addEventListener('drop', this._onDrop);
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

  /** 把纸样 / 字体落到已有卡片：既改 DOM，也写回便签模型并落盘。
   *  只改 dataset 不落盘的话，重启后卡片按模型里的旧值重建，市场皮肤/字体会丢失。 */
  _applyMaterialToCard(targetCard, patch) {
    const ctrl = this._ctrl;
    const id = targetCard && targetCard.dataset && targetCard.dataset.id;
    if (!id) return;
    if (patch.paper) {
      targetCard.dataset.paper = patch.paper;
      targetCard.style.setProperty('--tw-card-paper', patch.paper);
      // 非破坏性：直接写模型、保留市场纸样原值，不再经 setPaper 回落 plain。
      // 素材注册（registerMarketPaper）是异步的（_restoreAll 不阻塞挂载），启动竞态/
      // 恢复未完成时 MARKET_PAPERS 可能为空，setPaper 会把已装纸样静默销毁 → 持久化丢。
      // 用户明确拖入套用即应落盘；CSS 是 shadow 内全局样式表（按 data-paper 命中），
      // 素材注册后已渲染卡片会自动套上，无需回退到 plain。
      ctrl._notes = ctrl._notes.map(n => n.id === id ? { ...n, paper: patch.paper } : n);
    }
    if (patch.font) {
      targetCard.dataset.font = patch.font;
      ctrl._notes = ctrl._notes.map(n => n.id === id ? { ...n, font: patch.font } : n);
    }
    if (typeof ctrl._invalidateGeo === 'function') ctrl._invalidateGeo(id);   // 纸样改了 padding/比例 → 尺寸变
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
    (this._ensureDecoLayer(ctrl) || ctrl._canvas).appendChild(el);
    rec.el = el;
    this._canvasStickers.push(rec);
    // 落下即「自由贴纸」：不自动挂到便签。依附会改变坐标系（画布绝对 → 便签相对），
    // 属结构性变化，必须由用户显式发起（多选条的「挂到便签」），不能偷偷发生 —— 否则
    // 既误触，又让人没法放一张「压在便签上但仍自由」的贴纸。
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

  // ===== 贴纸依附便签（parentId）：贴纸成为卡片子元素，随之移动 / 旋转 / 缩放 =====
  // 坐标语义：依附态存「相对便签」的量 —— rx/rw 为卡片宽度的百分比，ry/rh 为 em（= 卡片字号）。
  // 选 em 而非 % 做垂直量：便签大多是 height:auto（随正文变高），用 top:% 会随打字漂移；
  // em 只跟卡片字号走，而字号含 --tw-card-zoom，故缩放自动跟随且不漂移。

  /** 按便签 id 取画布上的卡片元素（依附的挂载目标） */
  _cardElById(ctrl, id) {
    if (!ctrl || !ctrl._canvas || !id) return null;
    try { return ctrl._canvas.querySelector('.tw-card[data-id="' + id + '"]') || null; }
    catch (_) { return null; }
  },

  /** 卡片未旋转时的布局尺寸与字号（em 基准）—— 依附坐标的换算基准 */
  _cardMetrics(card) {
    const w = card.offsetWidth || 340;
    const h = card.offsetHeight || w;
    let fs = parseFloat(getComputedStyle(card).fontSize);
    if (!fs || !isFinite(fs)) fs = 16;
    let rot = parseFloat(card.style.getPropertyValue('--tw-card-rot'));
    if (!isFinite(rot)) rot = 0;
    return { w, h, fs, rot };
  },

  /** 贴纸在屏幕上的总旋转角（自身 rot + 宿主便签 rot）；菜单反向旋转它即可保持文字朝上 */
  _stickerTotalRot(rec) {
    let a = Number(rec && rec.rot) || 0;
    if (rec && rec.parentId) {
      const card = this._cardElById(this._ctrl, rec.parentId);
      if (card) a += this._cardMetrics(card).rot;
    }
    return a;
  },

  /** 依附：把自由贴纸挂到便签下（画布绝对 px → 相对 %宽 / em 高），DOM 移入卡片 */
  _attachSticker(rec, card) {
    if (!rec || !card) return false;
    const m = this._cardMetrics(card);
    const cx = (parseFloat(card.style.left) || 0) + m.w / 2;
    const cy = (parseFloat(card.style.top) || 0) + m.h / 2;
    const sx = Number(rec.x) || 0, sy = Number(rec.y) || 0;
    const sw = Number(rec.w) || 120, sh = Number(rec.h) || 120;
    const th = -m.rot * Math.PI / 180;               // 屏幕系 → 卡片本地系：反向旋转
    const cos = Math.cos(th), sin = Math.sin(th);
    const ox = sx + sw / 2 - cx, oy = sy + sh / 2 - cy;
    const lx = ox * cos - oy * sin, ly = ox * sin + oy * cos;
    rec.parentId = card.dataset.id || null;
    rec.rx = ((lx + m.w / 2 - sw / 2) / m.w) * 100;
    rec.ry = (ly + m.h / 2 - sh / 2) / m.fs;
    rec.rw = (sw / m.w) * 100;
    rec.rh = sh / m.fs;
    if (rec.el) {
      card.appendChild(rec.el);
      rec.el.style.removeProperty('--tw-drag-x');   // 清掉自由态遗留的拖拽位移，依附态不再读取它
      rec.el.style.removeProperty('--tw-drag-y');
    }
    this._applyStickerBox(rec);
    this._saveStickers();
    return true;
  },

  /** 解除依附：相对坐标 → 画布绝对 px，DOM 移回装饰层 */
  _detachSticker(rec) {
    if (!rec) return false;
    const ctrl = this._ctrl;
    const card = rec.parentId ? this._cardElById(ctrl, rec.parentId) : null;
    if (card) {
      const m = this._cardMetrics(card);
      const th = m.rot * Math.PI / 180;              // 卡片本地系 → 屏幕系：正向旋转
      const cos = Math.cos(th), sin = Math.sin(th);
      const sw = (Number(rec.rw) || 35) / 100 * m.w;
      const sh = (Number(rec.rh) || (sw / m.fs)) * m.fs;
      const lx = (Number(rec.rx) || 0) / 100 * m.w + sw / 2 - m.w / 2;
      const ly = (Number(rec.ry) || 0) * m.fs + sh / 2 - m.h / 2;
      const ox = lx * cos - ly * sin, oy = lx * sin + ly * cos;
      rec.x = (parseFloat(card.style.left) || 0) + m.w / 2 + ox - sw / 2;
      rec.y = (parseFloat(card.style.top) || 0) + m.h / 2 + oy - sh / 2;
      rec.w = Math.round(sw); rec.h = Math.round(sh);
    }
    rec.parentId = null;
    if (rec.el) { const layer = this._ensureDecoLayer(ctrl); (layer || (ctrl && ctrl._canvas)).appendChild(rec.el); }
    this._applyStickerBox(rec);
    this._saveStickers();
    return true;
  },

  /** 按依附 / 自由态写出贴纸的定位与尺寸样式（唯一出口，避免两处漂移） */
  _applyStickerBox(rec) {
    const el = rec && rec.el;
    if (!el) return;
    const ctrl = this._ctrl;
    const card = rec.parentId ? this._cardElById(ctrl, rec.parentId) : null;
    if (card) {
      el.dataset.attached = '1';
      el.style.left = (Number(rec.rx) || 0) + '%';
      el.style.top = (Number(rec.ry) || 0) + 'em';
      el.style.width = (Number(rec.rw) || 35) + '%';
      const aspect = this._stickerAspect(this._installed && this._installed[rec.material]);
      if (aspect) { el.style.aspectRatio = String(aspect); el.style.height = 'auto'; }
      else { el.style.height = (Number(rec.rh) || 35) + 'em'; }
      // 卡内层叠：正文/标题在 10，夜光纸纹理 .tw-card-main::after 在 20。
      // 正常依附贴纸须「浮在纸面纹理之上」（30），否则夜光纸上贴纸会被纹理盖住、发暗；
      // 但仍低于卡片自身手柄（.tw-card-resize 40 / .tw-card-tools 60），便于随时抓取。
      // rec.behind 则半藏到纸后（-1）。
      el.style.zIndex = rec.behind ? '-1' : '30';
      el.classList.toggle('bm-sticker-behind', !!rec.behind);
    } else {
      el.dataset.attached = '0';
      el.style.left = (Number(rec.x) || 0) + 'px';
      el.style.top = (Number(rec.y) || 0) + 'px';
      el.style.width = (Number(rec.w) || 120) + 'px';
      el.style.height = (Number(rec.h) || 120) + 'px';
      el.style.aspectRatio = '';
      el.style.zIndex = String(rec.z || (ctrl ? ++ctrl._zTop : 1));
      rec.z = Number(el.style.zIndex);
      el.classList.remove('bm-sticker-behind');
    }
    // 「半藏 / 从便签取下」已收进 ⋯ 菜单，其显隐在开菜单时按依附态判定，这里无需再管控件。
    // 自由态：贴纸在装饰层（非卡片子级），需自带画布拖拽位移（与卡片同套 _startGroupDrag）。
    // 依附态：贴纸已是卡片子元素，父级 transform 已含画布拖拽位移；子级若再加 translate 会「二次位移」
    //         —— 拖动卡片时贴纸相对卡片漂移，松手后 --tw-drag-x/y 清零才归位。故依附态仅保留自身 rotate。
    el.style.transform = rec.parentId
      ? 'rotate(' + (Number(rec.rot) || 0) + 'deg)'
      : 'translate(var(--tw-drag-x, 0px), var(--tw-drag-y, 0px)) rotate(' + (Number(rec.rot) || 0) + 'deg)';
  },

  /** 便签被删除时连带删除挂在它下面的贴纸（依附关系随宿主消失） */
  removeAttachedStickers(cardId) {
    if (!cardId) return 0;
    const gone = this._canvasStickers.filter((s) => s.parentId === cardId);
    gone.forEach((s) => { if (s.el && s.el.parentNode) s.el.parentNode.removeChild(s.el); });
    if (gone.length) {
      this._canvasStickers = this._canvasStickers.filter((s) => s.parentId !== cardId);
      this._saveStickers();
    }
    return gone.length;
  },

  /** 依附态拖拽：屏幕位移 → 卡片本地位移（抵消画布缩放与卡片旋转），再归一成 % / em */
  _startAttachedDrag(ctrl, el, rec, e) {
    const card = this._cardElById(ctrl, rec.parentId);
    if (!card) return;
    const m0 = this._cardMetrics(card);
    const rx0 = Number(rec.rx) || 0, ry0 = Number(rec.ry) || 0, rw0 = Number(rec.rw) || 35;
    let sx = e.clientX, sy = e.clientY, raf = 0, moved = false;
    let nrx = rx0, nry = ry0;
    const apply = () => {
      raf = 0;
      rec.rx = nrx; rec.ry = nry;
      el.style.left = nrx + '%'; el.style.top = nry + 'em';
    };
    const onMove = (ev) => {
      const s = (typeof CanvasViewport !== 'undefined' && CanvasViewport.getScale) ? CanvasViewport.getScale(ctrl) : 1;
      const th = -m0.rot * Math.PI / 180;
      const cos = Math.cos(th), sin = Math.sin(th);
      const dx = (ev.clientX - sx) / (s || 1), dy = (ev.clientY - sy) / (s || 1);
      if (Math.abs(ev.clientX - sx) > 3 || Math.abs(ev.clientY - sy) > 3) moved = true;
      const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
      nrx = rx0 + (lx / m0.w) * 100;
      nry = ry0 + ly / m0.fs;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      apply();
      el.classList.remove('dragging');
      if (moved) this._saveStickers();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    el.classList.add('dragging');
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return rw0;
  },

  /** 按一条贴纸记录构建 DOM（含删除钮 + 拖拽） */
  _buildStickerEl(ctrl, material, rec) {
    const el = document.createElement('div');
    el.className = 'bm-sticker';
    el.dataset.stickerId = rec.id;
    this._applyStickerShadow(el, material);   // 素材可声明 shadow:'none' 关闭默认投影
    rec.el = el;                       // _applyStickerBox 依此写样式
    // 尺寸 / 旋转：与位置同属可持久化属性，重建时一并还原。
    // 元素比例必须等于素材 viewBox 比例：一旦偏离，SVG 会按 preserveAspectRatio=meet 居中留白，
    // 四角的操作手柄就会离图形很远。素材更新 viewBox 后，历史贴纸在此自动贴合新比例。
    const aspect = this._stickerAspect(material);
    if (aspect) {
      const w0 = Number(rec.w) || 120, h0 = Number(rec.h) || 120;
      if (h0 > 0 && Math.abs(w0 / h0 - aspect) > 0.01) { rec.w = w0; rec.h = Math.round(w0 / aspect); }
    }
    // —— 控件布局（重构）——
    // 旧版悬停会同时亮 6 个圆钮（旋转/缩放/翻转/半藏/取下/删除）围成一圈：又挤、符号又难认、
    // 且「删除」紧挨着高频的缩放/旋转，误点率很高。
    // 新版：悬停只留 3 个入口 —— 左上 ↻ 旋转、右下 ⇲ 缩放（这两组是肌肉记忆，保留），
    // 右上 ⋯ 收纳其余。点 ⋯ 弹出「带文字标签」的菜单：低频操作不再靠猜符号，
    // 破坏性的「删除」单独分隔并置末（危险色）。菜单用 fixed + 视口坐标定位，
    // 贴纸自身旋转/缩放、乃至宿主便签的旋转，都不会让菜单歪掉或错位。
    el.innerHTML = '<div class="bm-sticker-content">' + isolateStickerHtml(material, rec.id) + '</div>' +
      '<button type="button" class="bm-sticker-rotate" aria-label="旋转贴纸" title="拖动旋转 · Shift 吸附 15° · 双击归零">↻</button>' +
      '<button type="button" class="bm-sticker-resize" aria-label="缩放贴纸" title="拖动缩放 · Shift 等比 · 双击还原">⇲</button>' +
      '<button type="button" class="bm-sticker-more" aria-label="更多操作" title="更多操作">⋯</button>' +
      '<div class="bm-sticker-menu" role="menu" hidden>' +
      '  <button type="button" class="bm-sticker-mi" data-act="flipx" role="menuitem">水平翻转</button>' +
      '  <button type="button" class="bm-sticker-mi" data-act="flipy" role="menuitem">垂直翻转</button>' +
      '  <button type="button" class="bm-sticker-mi" data-act="behind" role="menuitem">半藏到便签后</button>' +
      '  <button type="button" class="bm-sticker-mi" data-act="detach" role="menuitem">从便签取下</button>' +
      '  <div class="bm-sticker-menu-sep" aria-hidden="true"></div>' +
      '  <button type="button" class="bm-sticker-mi bm-sticker-mi-del" data-act="del" role="menuitem">删除贴纸</button>' +
      '</div>';
    // innerHTML 之后再写定位/尺寸/层叠（依附态据此切换层叠与「半藏」标识）
    this._applyStickerBox(rec);
    const menu = el.querySelector('.bm-sticker-menu');
    const moreBtn = el.querySelector('.bm-sticker-more');
    if (menu && moreBtn) {
      // 注意：本 webapp 跑在 shadow root 内。挂在 document 上的监听器拿到的 ev.target 会被
      // 重定向成 shadow 宿主（而非菜单项），用 el.contains(ev.target) 判断必然为 false →
      // 一按下菜单项就被当成"点外部"关闭菜单（display:none），后续 click 无处可落 = 点不动。
      // 故必须用 composedPath() 穿透 shadow 边界判断（与 ModeController 的 _docDocHandler 同法）。
      const onDocDown = (ev) => {
        if (menu.hidden) return;
        const path = (typeof ev.composedPath === 'function') ? ev.composedPath() : [];
        if (path.indexOf(menu) >= 0 || path.indexOf(el) >= 0) return;   // 点在菜单/贴纸内部 → 不关
        closeMenu();
      };
      const onMenuKey = (ev) => { if (ev.key === 'Escape') closeMenu(); };
      const closeMenu = () => {
        menu.hidden = true;
        document.removeEventListener('pointerdown', onDocDown, true);
        document.removeEventListener('keydown', onMenuKey, true);
      };
      const openMenu = () => {
        // 上下文显隐：半藏 / 取下只在「挂到便签」后才有意义
        menu.querySelectorAll('[data-act]').forEach((b) => {
          if (b.dataset.act === 'behind' || b.dataset.act === 'detach') b.style.display = rec.parentId ? '' : 'none';
        });
        const behBtn = menu.querySelector('[data-act="behind"]');
        if (behBtn) behBtn.textContent = rec.behind ? '浮回便签之上' : '半藏到便签后';
        // 菜单是贴纸的子元素、绝对定位于 ⋯ 钮下方（right:0 锚在右上角），并反向旋转抵消
        // 「贴纸自身旋转 + 宿主便签旋转」，保证文字始终是正的。
        // 不用 fixed：.bm-sticker 自带 transform，变换后的祖先即 fixed 的包含块，fixed 会失效。
        menu.style.transform = 'rotate(' + (-this._stickerTotalRot(rec)) + 'deg)';
        menu.hidden = false;
        document.addEventListener('pointerdown', onDocDown, true);
        document.addEventListener('keydown', onMenuKey, true);
      };
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (menu.hidden) openMenu(); else closeMenu();
      });
      menu.addEventListener('pointerdown', (e) => e.stopPropagation());   // 条内点击不触发拖拽/取消选择
      // click 与 pointerup 双通道：画布手势在某些路径下会吞掉 click（指针捕获 / preventDefault），
      // 用 pointerup 兜底；350ms 去重，保证一次点击只执行一次。
      let lastPick = 0;
      const onPick = (e) => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        e.stopPropagation();
        const now = Date.now();
        if (now - lastPick < 350) return;
        lastPick = now;
        const act = b.dataset.act;
        if (act === 'flipx' || act === 'flipy') {
          if (act === 'flipx') rec.flipX = !rec.flipX; else rec.flipY = !rec.flipY;
          this._applyFlip(el, rec);
          this._saveStickers();
        } else if (act === 'behind') {
          if (!rec.parentId) { if (typeof Toast !== 'undefined') Toast.showToast('贴纸没挂到便签上，无法半藏', 'info'); return; }
          rec.behind = !rec.behind;
          this._applyStickerBox(rec);
          this._saveStickers();
          if (typeof Toast !== 'undefined') Toast.showToast(rec.behind ? '已半藏到便签后面' : '已浮回便签之上', 'success');
        } else if (act === 'detach') {
          if (!rec.parentId) { if (typeof Toast !== 'undefined') Toast.showToast('贴纸没挂在便签上', 'info'); return; }
          this._detachSticker(rec);
          if (typeof Toast !== 'undefined') Toast.showToast('已从便签取下', 'success');
        } else if (act === 'del') {
          el.remove();
          this._canvasStickers = this._canvasStickers.filter((s) => s !== rec);
          const dmat = rec.material ? this._installed[rec.material] : null;
          if (dmat) evictStickerIsolate(dmat, rec.id);
          this._saveStickers();
          if (typeof Toast !== 'undefined') Toast.showToast('贴纸已删除', 'success');
        }
        closeMenu();
      };
      menu.addEventListener('click', onPick);
      menu.addEventListener('pointerup', onPick);
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

  /** 贴纸默认投影由 CSS 提供（filter:drop-shadow，跟随画面轮廓）。
   *  素材若自带阴影，可声明 shadow:'none' → 把 --bm-sticker-shadow 置 none 关掉默认投影，
   *  避免自己的阴影与默认投影叠成两层。未声明时什么都不做（默认投影即兜底，忘记也不会出错）。 */
  _applyStickerShadow(el, material) {
    if (!el || !el.style) return;
    const opt = material && material.shadow;
    if (opt === 'none' || opt === false) el.style.setProperty('--bm-sticker-shadow', 'none');
  },

  /** 翻转仅作用于内容层，不影响 .bm-sticker 元素上的旋转与四角手柄 */
  _applyFlip(el, rec) {
    const c = el.querySelector('.bm-sticker-content');
    if (!c) return;
    c.style.transform = 'scaleX(' + (rec.flipX ? -1 : 1) + ') scaleY(' + (rec.flipY ? -1 : 1) + ')';
  },

  _makeStickerDraggable(ctrl, el, rec) {
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;   // 旋转/缩放/翻转/删除按钮不触发拖拽
      // 抓手/空格态：不在贴纸上起拖拽，让事件冒泡给画布平移（对齐 Excalidraw 手工具）
      if (ctrl && ctrl._hand && ctrl._hand.state && (ctrl._hand.state.handTool || ctrl._hand.state.spaceDown)) return;
      // 关键：不冒泡到画布 —— 贴纸不是 .tw-card，冒泡上去会被判定为「拖空白」而启动框选 / 平移。
      // （同 CanvasZoomUI 缩放条与卡片浮层的既有约定：浮层内交互一律 stopPropagation。）
      e.stopPropagation();
      // 统一选区：Shift 点击切换选中；否则若未选中则设为唯一选中，随后整体拖动。
      // 与便签卡同套语义 —— 选中集（_selected）可同时含卡片与贴纸，拖动/删除一视同仁。
      if (e.shiftKey) { if (ctrl) ctrl._toggleSelect(el); return; }
      if (!ctrl || !ctrl._selected || !ctrl._selected.has(el)) { if (ctrl) ctrl._selectOnly(el); }
      // 【依附态】坐标为「相对便签」的 % / em，不能走画布级整体拖拽（它会按 px 改写 left/top）。
      // 此处改为在便签内微调：屏幕位移先抵消画布缩放、再反向旋转到卡片本地系，最后归一成 % / em。
      if (rec.parentId) { this._startAttachedDrag(ctrl, el, rec, e); return; }
      if (ctrl) ctrl._startGroupDrag(e, el);   // 委托统一整体拖动（含本贴纸 + 其余选中项）
    });
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
      el.classList.remove('dragging');      // 旋转结束：恢复 drop-shadow
      el.style.willChange = '';
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();        // 不冒泡：否则会触发贴纸拖拽 / 画布框选
      rotating = true;
      // 旋转期同样关闭 drop-shadow 并提升合成层：否则每帧改 transform 都要重新栅格化
      // 贴纸的 drop-shadow（内容复杂的贴纸会掉帧），复用 .dragging 的 filter:none。
      el.classList.add('dragging');
      el.style.willChange = 'transform';
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
      if (rec.parentId) {
        // 依附态：宽度以「卡宽百分比」存储（高度由 aspect-ratio 推导），随便签缩放
        const card = this._cardElById(ctrl, rec.parentId);
        const cw = card ? (card.offsetWidth || 340) : 340;
        rec.rw = Math.max(2, (w / cw) * 100);
        rec.w = Math.round(w); rec.h = Math.round(h);   // 保留一份 px 便于解绑时换算
        this._applyStickerBox(rec);
      } else {
        rec.w = Math.round(w); rec.h = Math.round(h);
        el.style.width = rec.w + 'px'; el.style.height = rec.h + 'px';
      }
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
      el.classList.remove('dragging');      // 缩放结束：恢复 drop-shadow
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      // 缩放期关闭 drop-shadow：尺寸每帧变化同样会重栅格化 filter，内容复杂的贴纸会掉帧。
      el.classList.add('dragging');
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
      if (rec.parentId) {
        const card = this._cardElById(ctrl, rec.parentId);
        const cw = card ? (card.offsetWidth || 340) : 340;
        rec.w = 120; rec.h = Math.round(120 / (ratio || 1));
        rec.rw = Math.max(2, (rec.w / cw) * 100);
        rec.rh = rec.h / ((card ? (parseFloat(getComputedStyle(card).fontSize) || 16) : 16));
        this._applyStickerBox(rec);
      } else {
        if (ratio >= 1) { rec.h = 120; rec.w = Math.round(120 * ratio); }
        else { rec.w = 120; rec.h = Math.round(120 / ratio); }
        el.style.width = rec.w + 'px'; el.style.height = rec.h + 'px';
      }
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
      const r3 = (v) => Math.round((Number(v) || 0) * 1000) / 1000;   // 相对量保留 3 位小数
      const arr = this._canvasStickers.map((s) => ({
        id: s.id, material: s.material,
        x: Math.round(Number(s.x) || 0), y: Math.round(Number(s.y) || 0), z: s.z || 0,
        w: Math.round(s.w || 120), h: Math.round(s.h || 120), rot: Math.round(s.rot || 0),
        fx: s.flipX ? 1 : 0, fy: s.flipY ? 1 : 0,
        // 依附态：宿主便签 id + 相对坐标（rx/rw 为卡宽百分比，ry/rh 为 em）+ 半藏开关
        pid: s.parentId || null, rx: r3(s.rx), ry: r3(s.ry), rw: r3(s.rw), rh: r3(s.rh),
        bh: s.behind ? 1 : 0,
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
    this._mountedStickerKey = null;   // 记录失效：下次恢复必须重建
  },

  /** 【性能·B】跳过重建时，卡片已用新的 ++_zTop 重建 → 把仍在位的自由贴纸重新置顶，
   *  否则沿用旧 z 会被新卡片盖住（历史坑：「切走再切回贴纸不见了」）。
   *  依附贴纸在卡片内部，层叠由卡片决定，无需处理。 */
  _bringStickersToFront(ctrl) {
    if (!ctrl) return;
    this._canvasStickers.forEach((s) => {
      if (!s || !s.el || s.parentId) return;
      ctrl._zTop = (Number(ctrl._zTop) || 0) + 1;
      const z = ctrl._zTop;
      s.el.style.zIndex = String(z);
      s.z = z;
    });
  },

  /** 【性能·B】贴纸 DOM 是否仍在位（切档只隐藏、未销毁时可跳过重建）。
   *  依附贴纸活在卡片里，卡片被 _buildCards 清过 → 必然断开，返回 false → 走重建。 */
  _stickerDomIntact() {
    const ctrl = this._ctrl;
    if (!ctrl || !ctrl._canvas) return false;
    if (!this._canvasStickers.length) return false;
    return this._canvasStickers.every((s) => s && s.el && s.el.isConnected);
  },

  /** 【性能·B】离开便签档：不销毁自由贴纸（留在装饰层，由 syncDecoLayer 隐藏），
   *  依附贴纸在卡片里、会随卡片被清掉，故只要存在依附贴纸就照旧清空（切回时重建）。 */
  async parkStickers() {
    if (this._canvasStickers && this._canvasStickers.length) await this._saveStickers();
    if (this._canvasStickers.some((s) => s && s.parentId)) this._clearStickerDom();
  },

  /** 按 DOM 元素反查贴纸记录（卡片侧统一拖动时定位 rec） */
  recForEl(el) { return this._canvasStickers.find((s) => s.el === el) || null; },

  /** 删除单张贴纸（供统一选区的 Delete 调用）：摘除 DOM + 移出记录 + 落盘 */
  removeStickerEl(el) {
    const rec = this.recForEl(el);
    if (!rec) return false;
    const i = this._canvasStickers.indexOf(rec);
    if (i >= 0) this._canvasStickers.splice(i, 1);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    // 删除即清缓存（recId 不复用，留着只是占内存）
    const mat = rec.material ? this._installed[rec.material] : null;
    if (mat) evictStickerIsolate(mat, rec.id);
    this._saveStickers();
    return true;
  },

  /** 便签档装饰层：贴纸的专属挂载容器（P1 · 所有权显式化）。
   *  共享画布是便签 / 写作 / 导图三档共用的渲染介质，贴纸若直写画布，
   *  「属于便签档的装饰」会在切档后滞留到别的档位（P0 只能靠逐个摘除兜底）。
   *  该层刻意不设 z-index / transform / overflow —— 不新建层叠上下文，
   *  贴纸的 z（++_zTop）仍在画布层叠上下文里与卡片按同一序列排序，改造前后层级行为一致。 */
  _ensureDecoLayer(ctrl) {
    if (!ctrl || !ctrl._canvas) return null;
    let layer = ctrl._canvas.querySelector('.tw-deco-layer[data-mode="notes"]');
    if (!layer || !layer.isConnected) {
      layer = document.createElement('div');
      layer.className = 'tw-deco-layer';
      layer.dataset.mode = 'notes';
      ctrl._canvas.appendChild(layer);
    }
    return layer;
  },

  /** 档位切换：装饰层只跟随它所属的档位显示（贴纸属于便签档）。
   *  即便有残留内容，非便签档也看不见 —— 从「渲染树」而非「逐个摘除」上保证不串档。 */
  syncDecoLayer(mode) {
    const ctrl = this._ctrl;
    if (!ctrl || !ctrl._canvas) return;
    const layer = ctrl._canvas.querySelector('.tw-deco-layer[data-mode="notes"]');
    if (layer) layer.hidden = !ModePolicy.ownsStickers(mode);
    // 依附贴纸住在卡片内部（不在装饰层里），装饰层隐藏管不到它们 —— 一并按档位显隐，
    // 否则切到写作档时「属于便签档的装饰」会漏到文章段落上。
    ctrl._canvas.querySelectorAll('.bm-sticker[data-attached="1"]').forEach((el) => {
      el.style.display = ModePolicy.ownsStickers(mode) ? '' : 'none';
    });
  },

  /** 恢复当前便签组的贴纸（须在已安装素材恢复之后，否则拿不到 render）。
   *  【档位所有权】贴纸是「便签档专属装饰」，非便签档一律不挂载（只清场）。
   *  判定要卡在每个 await 之后复检：启动恢复与切档是并发的，档位可能在等待期间被改写，
   *  只在函数入口判一次仍会把贴纸挂进已经切走的档位（写作档画布）。 */
  async _restoreStickers(force) {
    try {
      const ctrl = this._ctrl;
      // 闸门①：进来时已不是便签档 → 清场返回（覆盖「贴纸恢复晚于档位恢复」的启动竞态）
      if (!ctrl || ctrl._mode !== 'notes') { this._clearStickerDom(); return; }
      const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
      if (!mgr || typeof mgr.getSetting !== 'function') { this._clearStickerDom(); return; }
      const key = await this._stickerKey();
      // 闸门②：上面 await 期间可能已切到写作 / 导图档 —— 此刻挂载就会漏进别的档位
      if (ctrl._mode !== 'notes') { this._clearStickerDom(); return; }
      // 【性能·B】同一便签组、且贴纸 DOM 仍在（离开便签档只是隐藏、未销毁）→ 跳过全量重建。
      //   仅 force / 切到别的组 / DOM 已断（如依附贴纸随卡片被清）时才真正重建。
      if (!force && key && this._mountedStickerKey === key && this._stickerDomIntact()) {
        this._bringStickersToFront(ctrl);   // 卡片刚用新的 z 重建，贴纸需重新置顶
        this.syncDecoLayer(ctrl._mode);     // 确保整层可见
        return;
      }
      this._clearStickerDom();
      const arr = await mgr.getSetting(key);
      if (!Array.isArray(arr) || !arr.length) { this._mountedStickerKey = key; return; }
      if (ctrl._mode !== 'notes') { this._clearStickerDom(); return; }
      if (!ctrl._canvas) return;
      for (const s of arr) {
        const material = this._installed[s.material];
        if (!material) continue;   // 素材已删除 / 未安装 → 不重建
        // z 传 0 = 重建时统一置顶（由 _buildStickerEl 取 ++_zTop）。
        // 不能沿用落盘的旧 z：切档会重建卡片并让 _zTop 继续递增（实测 14 → 20），
        // 沿用旧值会让贴纸被新卡片压在下面 —— 即「切走再切回贴纸不见了，重启才回来」。
        const rec = {
          id: s.id, material: s.material,
          x: Number(s.x) || 0, y: Number(s.y) || 0, z: 0,
          w: Number(s.w) || 120, h: Number(s.h) || 120, rot: Number(s.rot) || 0,
          flipX: !!s.fx, flipY: !!s.fy,
          parentId: s.pid || null,
          rx: Number(s.rx), ry: Number(s.ry), rw: Number(s.rw), rh: Number(s.rh),
          behind: !!s.bh,
          el: null,
        };
        // 宿主便签已不在（被删 / 未渲染）→ 视为孤儿，退回自由态，避免挂在空气上
        const hostCard = rec.parentId ? this._cardElById(ctrl, rec.parentId) : null;
        if (rec.parentId && !hostCard) rec.parentId = null;
        const el = this._buildStickerEl(ctrl, material, rec);
        if (hostCard && rec.parentId) hostCard.appendChild(el);   // 依附：进卡片，随之移动/旋转/缩放
        else (this._ensureDecoLayer(ctrl) || ctrl._canvas).appendChild(el);
        rec.el = el;
        this._canvasStickers.push(rec);
      }
      this._mountedStickerKey = key;   // 记录已挂载的组，供下次同组切回时跳过重建
      // 注：重建时每条贴纸 z=0，由 _buildStickerEl 走 ++_zTop 统一置顶（高于重建后的卡片），
      // 故切档 / 重载后贴纸始终浮于卡片之上，无需再按 front/back 重排。
    } catch (e) {
      console.warn('[MaterialMarket] 贴纸恢复失败:', e && e.message);
    }
  },

  /** 供外部（切便签组）调用：按新组重建贴纸 */
  async reloadStickers() { await this._restoreStickers(); },

  /** 供外部（离开便签档）调用：把贴纸从画布摘掉。
   *  不能依赖 _buildCards 顺带清场 —— 它只清 .tw-card，贴纸会滞留在写作档画布上。
   *  摘之前先 flush 内存里未落盘的改动；且仅在确有贴纸时才写盘，
   *  否则连续切档（便签→写作→导图）会用空数组覆盖掉该组已存的贴纸。 */
  async detachStickers() {
    if (this._canvasStickers && this._canvasStickers.length) await this._saveStickers();
    this._clearStickerDom();
  },

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
