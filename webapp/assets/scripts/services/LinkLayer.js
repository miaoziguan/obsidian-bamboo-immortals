/**
 * LinkLayer — 连线层（便签模式与思维子弹共用的「节点-线」渲染与交互）
 *
 * 把原先焊死在 typewriterFeature 里的连线整套（几何/渲染/悬停控件/拖拽连接）
 * 抽成参数化的独立模块。便签（.tw-canvas / .tw-card）与思维子弹（.tw-mm-canvas / .tw-mm-node）
 * 各实例化一份，得到完全统一的视觉与交互：选边路由、贝塞尔/直线、中点弯曲手柄、
 * 线型切换、实/虚线切换、箭头、端点实时算、双击删除、拖锚点连接。
 *
 * 模块本身不做任何存储与数据校验，只负责「画」和「交互」。数据增删由宿主通过
 * 构造选项注入（getLinks / setLinks / addLink / removeLink / removeLinksOf / onChange），
 * 这样两套文档各自存各自的 key，互不污染（符合「来回拨动零副作用」的设计）。
 *
 * 坐标约定（与便签原实现一致）：连线层 SVG 与节点同处一个被 translate 的容器内，
 * 节点用 offsetLeft/offsetTop（容器局部坐标）定位，连线路径也用同一套局部坐标，
 * 容器平移时二者一起移动。拖拽连接时的指针坐标换算成「clientX - 容器rect.left」。
 */
export const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 17H7a5 5 0 0 1 0-10h2.5"/><path d="M14.5 7H17a5 5 0 0 1 0 10h-2.5"/><path d="M8 12h8"/></svg>`;

const SVGNS = 'http://www.w3.org/2000/svg';

export class LinkLayer {
  /**
   * @param {Object} o
   * @param {HTMLElement} o.container          连线层挂载的容器（节点与 SVG 的共同父级，被平移）
   * @param {string}      o.nodeSelector       端点元素选择器（'.tw-card' / '.tw-mm-node'）
   * @param {()=>Map<string,HTMLElement>} [o.getNodeMap] 宿主自带的「节点 id → 元素」表（可选）。
   *                                       提供则直接复用，免去每次 render 的 querySelectorAll 全量查询；
   *                                       未提供时回退为一次查询，行为不变。
   * @param {()=>Array}   o.getLinks           取当前连线数组（元素：{from,to,route?,bend?,dash?}）
   * @param {(a:Array)=>void} o.setLinks       连线数组被整体替换时回写宿主
   * @param {(f:string,t:string)=>boolean} o.addLink        新增一条连线（宿主做去重/校验），返回是否成功
   * @param {(f:string,t:string)=>void}      o.removeLink    删除一条连线
   * @param {(id:string)=>void}              o.removeLinksOf  级联删除与某节点相关的所有连线
   * @param {()=>void}     o.onChange         连线结构/属性变化后通知宿主落盘
   * @param {string}      [o.anchorClass]     连接锚点 class（默认 'tw-link-anchor'）
   * @param {string}      [o.layerClass]      连线层 SVG class（默认 'tw-links'）
   * @param {string}      [o.tempPathClass]   拖拽预览线 class（默认 'tw-link is-temp'）
   * @param {(el:HTMLElement)=>void} [o.decorateAnchor]  锚点建好后的尺寸/样式微调钩子
   * @param {(msg:string,type?:string)=>void} [o.toast]    提示回调
   */
  constructor(o) {
    this.opts = o;
    this._container = o.container;
    this._svg = null;
    this._ctlSvg = null;          // 控件/拖拽预览层：与连线层同坐标系、z-index 更高，避免被节点压住
    this._linkEls = [];
    this._linkSigCache = '';
    this._ctlEls = null;
    this._hoverLink = null;
    this._ctlHover = false;
    this._hoverTimer = 0;
    this._linkRaf = 0;
    this._linkRo = null;
    this._hitCache = null;        // 连线拖拽期的节点几何快照（见 _snapshotNodes）
  }

  getLinks() { return this.opts.getLinks(); }
  onChange() { if (this.opts.onChange) this.opts.onChange(); }
  toast(msg, type) {
    if (this.opts.toast) { this.opts.toast(msg, type); return; }
    if (typeof Toast !== 'undefined') Toast.showToast(msg, type);
  }

  destroy() {
    if (this._linkRo) { this._linkRo.disconnect(); this._linkRo = null; }
    clearTimeout(this._hoverTimer);
    this._hoverTimer = 0;
    if (this._linkRaf) { cancelAnimationFrame(this._linkRaf); this._linkRaf = 0; }
    this._svg = null;
    this._ctlSvg = null;
  }

  // ===== 连线层 =====

  /** 连线层：挂在 container 内，与节点同一坐标系 —— 容器 transform 平移时线自然跟随。
   *  SVG 设 overflow:visible，可画到负坐标/任意远处，适配无限画布。 */
  ensureLayer() {
    if (this._svg && this._svg.isConnected && this._svg.parentNode === this._container) return this._svg;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', this.opts.layerClass || 'tw-links');
    svg.setAttribute('aria-hidden', 'true');
    this._container.appendChild(svg);
    this._svg = svg;
    return svg;
  }

  /** 控件层：与连线层同一坐标系（都 inset:0、无 viewBox），但 z-index 更高，
   *  让悬浮控件/拖拽预览线浮在节点之上（便签大卡片无所谓，思维子弹的小胶囊必须）。 */
  ensureControlLayer() {
    if (this._ctlSvg && this._ctlSvg.isConnected && this._ctlSvg.parentNode === this._container) return this._ctlSvg;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', (this.opts.layerClass || 'tw-links') + '-ctl');
    svg.setAttribute('aria-hidden', 'true');
    this._container.appendChild(svg);
    this._ctlSvg = svg;
    return svg;
  }

  _scheduleRenderLinks() {
    if (this._linkRaf) return;
    this._linkRaf = requestAnimationFrame(() => {
      this._linkRaf = 0;
      this.render();
    });
  }
  scheduleRender() { this._scheduleRenderLinks(); }

  /** 求「从元素中心朝 (tx,ty) 方向」与（旋转后）矩形边界的交点 —— 线止于元素边，不穿进内部。
   *  方向向量反向旋转回元素局部坐标 → 与未旋转矩形求交 → 交点转回全局。 */
  edgePoint(el, tx, ty) {
    const cx = el.offsetLeft + el.offsetWidth / 2;
    const cy = el.offsetTop + el.offsetHeight / 2;
    const hw = el.offsetWidth / 2;
    const hh = el.offsetHeight / 2;
    let dx = tx - cx;
    let dy = ty - cy;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const rot = (Number(el.dataset.rot) || 0) * Math.PI / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const lx = dx * cos + dy * sin;
    const ly = -dx * sin + dy * cos;
    const tx2 = Math.abs(lx) > 1e-6 ? hw / Math.abs(lx) : Infinity;
    const ty2 = Math.abs(ly) > 1e-6 ? hh / Math.abs(ly) : Infinity;
    const t = Math.min(tx2, ty2);
    const plx = lx * t;
    const ply = ly * t;
    return {
      x: cx + (plx * cos - ply * sin),
      y: cy + (plx * sin + ply * cos),
    };
  }

  /** 取「节点 id → 元素」映射。
   *  【性能】宿主若自带元素表（思维子弹的 this._els）则直接复用，省掉每帧 querySelectorAll 的全量 DOM 查询
   *  （500 节点 × 60fps ≈ 每秒 3 万次元素查询）；未注入时回退为一次查询，行为与原来一致。 */
  _nodeMap() {
    if (typeof this.opts.getNodeMap === 'function') {
      const m = this.opts.getNodeMap();
      if (m && typeof m.get === 'function') return m;
    }
    const byId = new Map();
    this._container.querySelectorAll(this.opts.nodeSelector).forEach((c) => byId.set(c.dataset.id, c));
    return byId;
  }

  /** 画全部连线。路由分两层（对齐国际前沿做法）：
   *   1) 选边 —— 按两元素相对位置自动挑 上/右/下/左 出线边，线垂直于该边射出；
   *   2) 路线 —— bezier(曲线，默认) / straight(直线)：可逐条切换，并支持拖中点弯曲。
   *  悬空连线（任一端元素已删）自动跳过。 */
  render() {
    if (!this._container) return;
    const svg = this.ensureLayer();
    const items = [];
    // 【P8 视口剔除】连线端点优先从宿主几何缓存取（卡片被剔时 DOM 已卸载，但仍能精确画连线）；
    // 未注入 getGeom 时（思维子弹等不剔除的场景）回退到「按 id 查 DOM 元素」的旧逻辑，行为不变。
    if (typeof this.opts.getGeom === 'function') {
      this.getLinks().forEach((l) => {
        const ga = this.opts.getGeom(l.from);
        const gb = this.opts.getGeom(l.to);
        if (ga && gb) items.push({ l, ga, gb });
      });
    } else {
      // 未注入 getGeom（思维子弹等不剔除场景）：按 id 查 DOM，并转成与 getGeom 同构的几何对象
      const toGeom = (el) => (el ? {
        cx: el.offsetLeft + el.offsetWidth / 2,
        cy: el.offsetTop + el.offsetHeight / 2,
        hw: el.offsetWidth / 2 || 1,
        hh: el.offsetHeight / 2 || 1,
        rot: Number(el.dataset.rot) || 0,
      } : null);
      const byId = this._nodeMap();
      this.getLinks().forEach((l) => {
        const ga = toGeom(byId.get(l.from));
        const gb = toGeom(byId.get(l.to));
        if (ga && gb) items.push({ l, ga, gb });
      });
    }
    // 【性能】结构签名：只有连线的增删/顺序变了才重建 DOM。端点移动（拖元素/旋转/缩放）
    // 时复用已有元素、只改几何属性。
    const sig = items.map((it) => it.l.from + '>' + it.l.to).join('|');
    const reusable = this._linkEls.length === items.length
      && this._linkSigCache === sig
      && this._linkEls.every((g) => g && g.path && g.path.parentNode === svg);
    // 【性能】读写分离（两趟）：先把全部几何一次读完（读 offset* 会触发重排），再统一写属性。
    // 若按「一条线读完就写」交错进行，则每条线写完后的下一次读都被迫同步重排 → 每帧 O(L) 次强制 reflow。
    const geoms = items.map((it) => this.linkGeom(it));
    if (reusable) {
      items.forEach((it, i) => this.applyGeom(this._linkEls[i], geoms[i], it.l));
    } else {
      Array.from(svg.children).forEach((ch) => {
        if (!ch.classList || !ch.classList.contains('is-temp')) svg.removeChild(ch);
      });
      this._linkEls = items.map((it, i) => this.buildLink(svg, it, geoms[i]));
      this._linkSigCache = sig;
    }
    // 重建「连线对 → 元素」索引，供 setActive / highlightFor 直接命中，省去每次 hover 的 querySelectorAll
    this._byPair = new Map();
    items.forEach((it, i) => {
      const g = this._linkEls[i];
      if (g) this._byPair.set(it.l.from + '>' + it.l.to, [g.hit, g.path, g.src, g.arrow]);
    });
    if (this._hoverLink) this.renderControls(this._hoverLink.from, this._hoverLink.to);
  }

  /** 为一条连线建出全部 SVG 元素（仅结构变化时调用），返回引用供后续复用更新 */
  buildLink(svg, it, preGeo) {
    const l = it.l;
    const mk = (tag, cls) => {
      const el = document.createElementNS(SVGNS, tag);
      el.setAttribute('class', cls);
      el.setAttribute('data-from', l.from);
      el.setAttribute('data-to', l.to);
      return el;
    };

    // 隐形命中层：可见线只有 1.5px，直接点几乎选不中。叠一条同路径、16px 宽、完全透明的线专收事件。
    const hit = mk('path', 'tw-link-hit');
    hit.addEventListener('mouseenter', () => {
      clearTimeout(this._hoverTimer);
      this._hoverLink = { from: l.from, to: l.to };
      this.setActive(l.from, l.to, true);
      this.renderControls(l.from, l.to);
    });
    hit.addEventListener('mouseleave', () => this.scheduleEndHover());
    hit.addEventListener('dblclick', (e) => {
      e.stopPropagation();   // 避免冒泡到画布触发 fit-all / 新建子弹
      this.endHover();
      this.removeLink(l.from, l.to);
    });
    const title = document.createElementNS(SVGNS, 'title');
    title.textContent = '双击删除 · 拖中点改走向 · 点圆点切线型 · 点虚线点切换实线/虚线';
    hit.appendChild(title);
    svg.appendChild(hit);

    const path = mk('path', 'tw-link');
    svg.appendChild(path);

    // 端点：源端实心圆点；目标端实心小三角。
    const src = mk('circle', 'tw-link-dot tw-link-dot-src');
    src.setAttribute('r', '3.6');
    svg.appendChild(src);
    const arrow = mk('path', 'tw-link-arrow-end');
    svg.appendChild(arrow);

    const g = { hit, path, src, arrow };
    this.applyGeom(g, preGeo || this.linkGeom(it), it.l);
    return g;
  }

  /** 算一条连线的几何：路径 d、源端点、箭头三角。端点坐标实时算，不入档。 */
  linkGeom(it) {
    const l = it.l;
    const a = it.ga;
    const b = it.gb;
    const ca = { x: a.cx, y: a.cy };
    const cb = { x: b.cx, y: b.cy };
    const A = this.anchorOn(a, cb);
    const B = this.anchorOn(b, ca);
    const mode = (l.route === 'straight') ? 'straight' : 'bezier';
    const { d, tip } = this.routePath(A.p, A.u, B.p, B.u, mode, Number(l.bend) || 0);
    const ah = 8, aw = 7;   // 三角高 / 半宽
    const apx = -tip.y, apy = tip.x;                          // 垂直于入线方向
    const bx = B.p.x - tip.x * ah, by = B.p.y - tip.y * ah;   // 底边中心（朝源侧退 ah）
    const ab1 = { x: bx + apx * aw / 2, y: by + apy * aw / 2 };
    const ab2 = { x: bx - apx * aw / 2, y: by - apy * aw / 2 };
    return {
      d,
      p1: A.p,
      arrowD: `M ${B.p.x} ${B.p.y} L ${ab1.x} ${ab1.y} L ${ab2.x} ${ab2.y} Z`,
      dash: l.dash === 'dashed',
      from: l.from,
      to: l.to,
    };
  }

  /** 把几何写进已有元素（零 DOM 重建）。l 为连线对象，直接读 label，避免每帧 linkOf 的 O(L) 查找 */
  applyGeom(g, geo, l) {
    g.hit.setAttribute('d', geo.d);
    g.path.setAttribute('d', geo.d);
    g.src.setAttribute('cx', geo.p1.x);
    g.src.setAttribute('cy', geo.p1.y);
    g.arrow.setAttribute('d', geo.arrowD);
    g.path.classList.toggle('is-dashed', geo.dash);
  }

  // ===== 连线路由：选边 → 路线 =====

  /** 选边（JSON Canvas 的 fromSide/toSide、GoJS 的 fromSpot/toSpot）：
   *  把目标中心换算到本元素局部坐标，按「归一化到半宽/半高」的超限比例挑 上/右/下/左；
   *  端点落在该边上（沿边方向按目标偏移，限 45% 内避免贴角），出线方向 = 该边的外法线。 */
  anchorOn(g, target) {
    const cx = g.cx;
    const cy = g.cy;
    const hw = g.hw || 1;
    const hh = g.hh || 1;
    const rot = (g.rot || 0) * Math.PI / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const dx = target.x - cx;
    const dy = target.y - cy;
    const lx = dx * cos + dy * sin;
    const ly = -dx * sin + dy * cos;
    let px, py, ux, uy;
    if (Math.abs(lx) / hw >= Math.abs(ly) / hh) {
      const s = lx >= 0 ? 1 : -1;       // 右 / 左
      px = s * hw;
      py = Math.max(-hh * 0.45, Math.min(hh * 0.45, ly));
      ux = s; uy = 0;
    } else {
      const s = ly >= 0 ? 1 : -1;       // 下 / 上
      py = s * hh;
      px = Math.max(-hw * 0.45, Math.min(hw * 0.45, lx));
      ux = 0; uy = s;
    }
    return {
      p: { x: cx + (px * cos - py * sin), y: cy + (px * sin + py * cos) },
      u: { x: ux * cos - uy * sin, y: ux * sin + uy * cos },
    };
  }

  /** 生成路径。mode: bezier | straight；bend: 沿法线的额外弯曲量(px，拖中点手柄改，随线存盘)
   *  @returns {{d:string, tip:{x:number,y:number}}} 路径与末端切线单位向量（供箭头定向） */
  routePath(p1, ua, p2, ub, mode, bend) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (mode === 'straight') {
      return { d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`, tip: { x: dx / dist, y: dy / dist } };
    }
    const k = Math.min(60, dist * 0.30);
    const bow = Math.min(34, Math.max(10, dist * 0.12)) + bend;
    const nx = -dy / dist;
    const ny = dx / dist;
    const c1 = { x: p1.x + ua.x * k + nx * bow, y: p1.y + ua.y * k + ny * bow };
    const c2 = { x: p2.x + ub.x * k + nx * bow, y: p2.y + ub.y * k + ny * bow };
    const tx = p2.x - c2.x;
    const ty = p2.y - c2.y;
    const tl = Math.hypot(tx, ty) || 1;
    return {
      d: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`,
      tip: { x: tx / tl, y: ty / tl },
    };
  }

  // ===== 连线上的悬浮控件（中点弯曲手柄 + 线型切换 + 删除 + 实虚线） =====

  clearControls() {
    // 关键修复：同时复位「指针停在控件上」标记。控件 DOM 被移除（拖动/缩放/旋转节点、新建连线、
    // ResizeObserver 触发重绘）时其 mouseleave 不会触发，若不复位 _ctlHover 会卡在 true。
    this._ctlHover = false;
    this._ctlEls = null;
    const ctl = this._ctlSvg;
    if (!ctl) return;
    Array.from(ctl.querySelectorAll('.tw-link-ctl')).forEach((el) => el.remove());
  }


  endHover() {
    const cur = this._hoverLink;
    this._hoverLink = null;
    this.clearControls();
    if (cur) this.setActive(cur.from, cur.to, false);
  }

  /** 收起悬浮控件前留一点余量：允许指针从线移到控件上而不中断 */
  scheduleEndHover() {
    clearTimeout(this._hoverTimer);
    this._hoverTimer = setTimeout(() => {
      if (this._ctlHover) { this.scheduleEndHover(); return; }
      this.endHover();
    }, 80);
  }

  /** hover 连线时在线上浮现控件（tldraw elbowMidPoint 的做法）：
   *  中点「弯曲手柄」可拖动改变走向；1/4 处「线型按钮」点击在 曲线/直线 间循环；
   *  3/4 处「删除按钮」；1/8 处「实/虚线按钮」。位置用 getPointAtLength 精确取在曲线上。 */
  renderControls(from, to) {
    const svg = this._svg;
    if (!svg) return;
    if (!this.linkOf(from, to)) { this.clearControls(); return; }
    const key = from + '>' + to;
    const c = this._ctlEls;
    const reusable = c && c.key === key && c.lineEl.parentNode === svg
      && c.bend.parentNode === this._ctlSvg && c.dash.parentNode === this._ctlSvg;
    if (reusable) {
      this.applyControlsGeom(c);
      return;
    }
    this.clearControls();
    this._ctlEls = this.buildControls(svg, from, to, key);
  }

  /** 取连线对象（惰性查：控件被复用后生命周期变长，不能让回调闭包长期持有旧对象） */
  linkOf(from, to) {
    return this.getLinks().find((l) => l.from === from && l.to === to) || null;
  }

  /** 首次（或换了连线之后）构建 hover 控件，返回可复用的元素引用表 */
  buildControls(svg, from, to, key) {
    const line = Array.from(svg.querySelectorAll('.tw-link')).find((el) =>
      el.getAttribute('data-from') === from && el.getAttribute('data-to') === to);
    if (!line || typeof line.getTotalLength !== 'function') return null;
    if (!line.getTotalLength()) return null;
    const ctlSvg = this.ensureControlLayer();

    const mkCtl = (cls, label) => {
      const el = document.createElementNS(SVGNS, 'circle');
      el.setAttribute('class', cls);
      el.setAttribute('r', '5');
      const t = document.createElementNS(SVGNS, 'title');
      t.textContent = label;
      el.appendChild(t);
      el.addEventListener('mouseenter', () => { clearTimeout(this._hoverTimer); this._ctlHover = true; });
      el.addEventListener('mouseleave', () => { this._ctlHover = false; this.scheduleEndHover(); });
      // 控件自身的 pointerdown 必须拦截冒泡：控件层（.tw-links-ctl）浮在节点之上，
      // 若冒泡到画布层，宿主会把「点控件」误判成「平移画布 / 取消选中」，导致高光异常跳动。
      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      ctlSvg.appendChild(el);
      return el;
    };

    // ① 中点弯曲手柄：拖动把线沿法线推弯，弯曲量随线存盘
    const bend = mkCtl('tw-link-ctl tw-link-bend', '拖动改变连线走向');
    bend.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      // 【P8 视口剔除】端点卡可能被剔除卸载 → 优先从几何缓存取锚点，让「拖中点弯曲」在剔除态也成立；
      // 未注入 getGeom（思维子弹等不剔除场景）回退到 DOM 查卡取锚点。
      let gA = null, gB = null;
      if (typeof this.opts.getGeom === 'function') {
        gA = this.opts.getGeom(from);
        gB = this.opts.getGeom(to);
      } else {
        const cardById = (id) => Array.from(this._container.querySelectorAll(this.opts.nodeSelector))
          .find((c) => c.dataset.id === id);
        const cardA = cardById(from), cardB = cardById(to);
        if (cardA && cardB) {
          gA = { cx: cardA.offsetLeft + cardA.offsetWidth / 2, cy: cardA.offsetTop + cardA.offsetHeight / 2, hw: cardA.offsetWidth / 2 || 1, hh: cardA.offsetHeight / 2 || 1, rot: Number(cardA.dataset.rot) || 0 };
          gB = { cx: cardB.offsetLeft + cardB.offsetWidth / 2, cy: cardB.offsetTop + cardB.offsetHeight / 2, hw: cardB.offsetWidth / 2 || 1, hh: cardB.offsetHeight / 2 || 1, rot: Number(cardB.dataset.rot) || 0 };
        }
      }
      if (!gA || !gB) return;
      this._ctlHover = true;
      const rect = this._container.getBoundingClientRect();
      const cA = { x: gA.cx, y: gA.cy };
      const cB = { x: gB.cx, y: gB.cy };
      const A = this.anchorOn(gA, cB);
      const B = this.anchorOn(gB, cA);
      const base = { x: (A.p.x + B.p.x) / 2, y: (A.p.y + B.p.y) / 2 };
      const vx = B.p.x - A.p.x;
      const vy = B.p.y - A.p.y;
      const vl = Math.hypot(vx, vy) || 1;
      const nx = -vy / vl;
      const ny = vx / vl;
      const onMove = (ev) => {
        const lk = this.linkOf(from, to);
        if (!lk) return;
        const mx = ev.clientX - rect.left;
        const my = ev.clientY - rect.top;
        lk.bend = Math.round((mx - base.x) * nx + (my - base.y) * ny);
        this._scheduleRenderLinks();   // rAF 节流：弯曲手柄拖动时每帧最多重绘一次连线
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        this._ctlHover = false;
        this.onChange();
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    // ② 线型切换按钮：点击在 曲线 → 直线 间循环
    const mode = mkCtl('tw-link-ctl tw-link-mode', '点击切换线型（曲线 / 直线）');
    mode.addEventListener('click', (e) => {
      e.stopPropagation();
      const lk = this.linkOf(from, to);
      if (!lk) return;
      const order = ['bezier', 'straight'];
      const cur = (lk.route === 'straight') ? 'straight' : 'bezier';
      lk.route = order[(order.indexOf(cur) + 1) % order.length];
      this.render();
      this.onChange();
    });

    // ③ 删除按钮：hover 连线时浮现于约 3/4 处
    const keep = () => { clearTimeout(this._hoverTimer); this._ctlHover = true; };
    const release = () => { this._ctlHover = false; this.scheduleEndHover(); };
    const del = document.createElementNS(SVGNS, 'g');
    del.setAttribute('class', 'tw-link-ctl tw-link-del');
    const delBg = document.createElementNS(SVGNS, 'circle');
    delBg.setAttribute('class', 'tw-link-del-bg');
    delBg.setAttribute('r', '8');
    const delX = document.createElementNS(SVGNS, 'path');
    delX.setAttribute('class', 'tw-link-del-x');
    del.appendChild(delBg); del.appendChild(delX);
    const delT = document.createElementNS(SVGNS, 'title');
    delT.textContent = '点击删除连线';
    del.appendChild(delT);
    del.addEventListener('mouseenter', keep);
    del.addEventListener('mouseleave', release);
    del.addEventListener('pointerdown', (e) => e.stopPropagation());   // 拦截冒泡，避免误触画布平移/取消选中
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      this.endHover();
      this.removeLink(from, to);
    });
    ctlSvg.appendChild(del);

    // ④ 实线/虚线切换按钮：约 1/8 处
    const dash = document.createElementNS(SVGNS, 'g');
    dash.setAttribute('class', 'tw-link-ctl tw-link-dash');
    const dashBg = document.createElementNS(SVGNS, 'circle');
    dashBg.setAttribute('class', 'tw-link-dash-bg');
    dashBg.setAttribute('r', '8');
    const dashIco = document.createElementNS(SVGNS, 'path');
    dashIco.setAttribute('class', 'tw-link-dash-ico');
    const dashT = document.createElementNS(SVGNS, 'title');
    dash.appendChild(dashBg); dash.appendChild(dashIco); dash.appendChild(dashT);
    dash.addEventListener('mouseenter', keep);
    dash.addEventListener('mouseleave', release);
    dash.addEventListener('pointerdown', (e) => e.stopPropagation());   // 拦截冒泡，避免误触画布平移/取消选中
    dash.addEventListener('click', (e) => {
      e.stopPropagation();
      const lk = this.linkOf(from, to);
      if (!lk) return;
      lk.dash = (lk.dash === 'dashed') ? 'solid' : 'dashed';
      this.render();
      this.onChange();
    });
    ctlSvg.appendChild(dash);

    const c = { key, from, to, lineEl: line, bend, mode, del, delBg, delX, dash, dashBg, dashIco, dashT };
    this.applyControlsGeom(c);
    return c;
  }

  /** 把控件摆到当前曲线的对应位置（每帧热路径：只改属性，零 DOM 重建） */
  applyControlsGeom(c) {
    const line = c.lineEl;
    const len = line.getTotalLength();
    if (!len) return;
    const link = this.linkOf(c.from, c.to);
    const p = line.getPointAtLength(len / 2);
    c.bend.setAttribute('cx', p.x);
    c.bend.setAttribute('cy', p.y);
    const mp = line.getPointAtLength(len * 0.28);
    c.mode.setAttribute('cx', mp.x);
    c.mode.setAttribute('cy', mp.y);
    const mPt = line.getPointAtLength(len * 0.72);
    const dx = mPt.x, dy = mPt.y;
    c.delBg.setAttribute('cx', dx);
    c.delBg.setAttribute('cy', dy);
    c.delX.setAttribute('d', `M ${dx - 3} ${dy - 3} L ${dx + 3} ${dy + 3} M ${dx - 3} ${dy + 3} L ${dx + 3} ${dy - 3}`);
    const dPt = line.getPointAtLength(len * 0.125);
    const dx2 = dPt.x, dy2 = dPt.y;
    c.dashBg.setAttribute('cx', dx2);
    c.dashBg.setAttribute('cy', dy2);
    const dashed = !!link && link.dash === 'dashed';
    c.dashIco.setAttribute('d', dashed
      ? `M ${dx2 - 4} ${dy2 - 1} l 1.6 0 M ${dx2 - 0.6} ${dy2 - 1} l 1.6 0 M ${dx2 + 2.8} ${dy2 - 1} l 1.6 0`
      : `M ${dx2 - 4.5} ${dy2 - 1} L ${dx2 + 4.5} ${dy2 - 1}`);
    c.dashT.textContent = dashed ? '当前虚线 · 点击改实线' : '当前实线 · 点击改虚线';
    c.dash.classList.toggle('is-on', dashed);
  }

  /** 单条连线的 hover 态（由隐形命中层触发）：提亮该线的线体 / 端点 / 箭头 */
  setActive(from, to, on) {
    const arr = this._byPair.get(from + '>' + to);
    if (!arr) return;
    arr.forEach((el) => el.classList.toggle('is-active', !!on));
  }

  /** 关联高亮：hover 某端点元素时，与它相连的线/端点/箭头一起提亮。 */
  highlightFor(nodeId, on) {
    if (!this._byPair || !nodeId) return;
    this._byPair.forEach((arr, key) => {
      const sep = key.indexOf('>');
      const f = key.slice(0, sep), t = key.slice(sep + 1);
      if (f === nodeId || t === nodeId) arr.forEach((el) => el.classList.toggle('is-active', !!on));
    });
  }

  // ===== 数据增删（委托宿主；此处只负责重绘与落盘通知） =====

  addLink(fromId, toId) {
    const ok = this.opts.addLink(fromId, toId);
    if (!ok) return false;
    this.render();
    this.onChange();
    this.toast('已建立连线', 'success');
    return true;
  }

  removeLink(fromId, toId) {
    this.opts.removeLink(fromId, toId);
    this.clearControls();
    this.render();
    this.onChange();
  }

  removeLinksOf(nodeId) {
    if (!nodeId) return;
    this.opts.removeLinksOf(nodeId);
    this.clearControls();
    this.render();
    this.onChange();
  }

  /** 卡片尺寸变化（改字号/缩放/窗口 resize）会移动端点，用 ResizeObserver 统一兜底重绘 */
  watchSize(el) {
    if (typeof ResizeObserver === 'undefined') return;
    if (!this._linkRo) {
      this._linkRo = new ResizeObserver(() => this._scheduleRenderLinks());
    }
    this._linkRo.observe(el);
  }

  // ===== 拖拽连接（从锚点，或 Shift/Alt 从节点本体） =====

  /** 在端点元素上挂一个连接锚点；按住拖到另一元素松手即建立连线，落空作废。 */
  makeLinkable(el) {
    const anchor = document.createElement('div');
    anchor.className = this.opts.anchorClass || 'tw-link-anchor';
    anchor.setAttribute('role', 'button');
    anchor.setAttribute('aria-label', '拖到另一元素建立连线');
    anchor.title = '拖到另一元素建立连线';
    anchor.innerHTML = ICON_LINK;
    if (this.opts.decorateAnchor) this.opts.decorateAnchor(anchor);
    el.appendChild(anchor);

    el.addEventListener('mouseenter', () => this.highlightFor(el.dataset.id, true));
    el.addEventListener('mouseleave', () => this.highlightFor(el.dataset.id, false));

    anchor.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();   // 不触发节点拖拽、也不触发画布平移
      this.startConnect(el, e);
    });
  }

  /** 程序化发起连线拖拽（供 makeLinkable 锚点，以及宿主的 Shift/Alt 本体拖拽复用） */
  startConnect(fromEl, e) {
    const svg = this.ensureControlLayer();
    this._buildHitCache();   // 拖拽期节点不动：几何只读一次，之后每帧命中测试零 DOM 读
    const fromId = fromEl.dataset.id;
    const temp = document.createElementNS(SVGNS, 'path');
    temp.setAttribute('class', this.opts.tempPathClass || 'tw-link is-temp');
    svg.appendChild(temp);
    let target = null;
    const cr = this._container.getBoundingClientRect();
    const crLeft = cr.left;
    const crTop = cr.top;
    let raf = 0;
    let lastX = e.clientX;
    let lastY = e.clientY;
    const apply = () => {
      raf = 0;
      const px = lastX - crLeft;
      const py = lastY - crTop;
      const p1 = this.edgePoint(fromEl, px, py);
      temp.setAttribute('d', `M ${p1.x} ${p1.y} L ${px} ${py}`);
      const next = this.nodeAtPoint(lastX, lastY, fromEl);
      if (target && target !== next) target.classList.remove('is-link-target');
      if (next) next.classList.add('is-link-target');
      target = next;
      // 命中可连接目标时预览线转实线加粗，给出「此刻松手即成线」的明确信号
      temp.classList.toggle('is-valid', !!target);
    };
    const onMove = (ev) => {
      lastX = ev.clientX;
      lastY = ev.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      apply();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (target) target.classList.remove('is-link-target');
      if (temp.parentNode) temp.parentNode.removeChild(temp);
      if (target) this.addLink(fromId, target.dataset.id);
      this._clearHitCache();   // 拖拽结束，快照作废（下次拖拽会重建）
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  /** 读一遍所有端点元素的几何，返回快照数组（容器局部坐标）。不改缓存，调用方自行决定用法。
   *  【性能】连线拖拽期间节点本身不动，故只需在拖拽开始时读一次 offset*；
   *  之后每帧命中测试全用这份快照做纯算术 —— 零 DOM 读，避免每帧 O(N) 次读取
   *  （也避免与批量写交错触发强制重排）。 */
  _snapshotNodes() {
    const byId = this._nodeMap();
    const out = [];
    byId.forEach((el) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const rot = (Number(el.dataset.rot) || 0) * Math.PI / 180;
      out.push({
        el,
        cx: el.offsetLeft + w / 2,
        cy: el.offsetTop + h / 2,
        hw: w / 2,
        hh: h / 2,
        cos: Math.cos(rot),
        sin: Math.sin(rot),
        z: Number(el.style.zIndex) || 0,
      });
    });
    return out;
  }
  /** 建立 / 丢弃命中测试快照（拖拽开始 / 结束各调一次） */
  _buildHitCache() { this._hitCache = this._snapshotNodes(); }
  _clearHitCache() { this._hitCache = null; }

  /** 命中测试：返回指针下的端点元素（排除 exclude，通常是拖拽起点那个）。
   *  优先用 __bambooShadowRoot.elementFromPoint（与 actionDispatcher 一致）；
   *  再兜一层几何判定：点 → 容器局部坐标 → 判断是否落在元素矩形内。 */
  nodeAtPoint(cx, cy, exclude) {
    const sr = window.__bambooShadowRoot;
    if (sr && typeof sr.elementFromPoint === 'function') {
      try {
        const el = sr.elementFromPoint(cx, cy);
        const hit = (el && el.closest) ? el.closest(this.opts.nodeSelector) : null;
        if (hit && hit !== exclude) return hit;
      } catch (_) { /* 取不到就走几何兜底 */ }
    }
    const canvas = this._container;
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    const px = cx - r.left;
    const py = cy - r.top;
    let best = null;
    let bestZ = -Infinity;
    // 【性能】优先用拖拽开始时建好的快照（纯算术、零 DOM 读）；
    // 无快照时（非拖拽期的零散调用）才临时读一次 DOM，行为与原来一致。
    const rects = this._hitCache || this._snapshotNodes();
    rects.forEach((c) => {
      if (c.el === exclude) return;
      const dx = px - c.cx;
      const dy = py - c.cy;
      const lx = dx * c.cos + dy * c.sin;
      const ly = -dx * c.sin + dy * c.cos;
      if (Math.abs(lx) <= c.hw && Math.abs(ly) <= c.hh) {
        if (c.z >= bestZ) { bestZ = c.z; best = c.el; }
      }
    });
    return best;
  }
}

// 双保险：与其它模块同一套路，打包器未解析 import 时也能从 window 取到
if (typeof window !== 'undefined') {
  window.LinkLayer = LinkLayer;
  window.ICON_LINK = ICON_LINK;
}
