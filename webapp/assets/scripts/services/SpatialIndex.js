/**
 * SpatialIndex — 均匀网格空间哈希（视口剔除 + 命中/框选查询的 O(可视) 加速结构）。
 *
 * P8 空间索引：把「每张卡占据的网格单元」建索引，cull 时只查视口覆盖的少数单元，
 * 不必全量扫 _notes（原 _updateCulling 是 O(n) forEach）。卡片可旋转：用旋转后的
 * AABB（轴对齐包围盒）入格，查询保守正确——与 _updateCulling 旧可见性判定完全同构。
 *
 * 设计要点：
 *  - 纯几何、零 DOM 依赖（坐标取模型/几何缓存，不读活 DOM），故剔除态/虚拟化下照常工作；
 *  - 每张卡按其 AABB 写入所有覆盖到的单元（_cells 记录归属，便于增量 update/remove）；
 *  - queryRect 只遍历视口覆盖的单元 → 返回量与可见卡数成正比，与总量 n 无关。
 */
const DEFAULT_CELL = 512;

export class SpatialIndex {
  constructor(cellSize = DEFAULT_CELL) {
    this._cell = Math.max(1, cellSize | 0);
    this._buckets = new Map();   // "gx,gy" -> Set<id>
    this._cells = new Map();     // id -> string[]（该 id 占据的单元 key 列表，便于增量更新）
    this._rects = new Map();     // id -> {x,y,w,h,rot}（原始几何，供精确判定/调试）
  }

  /** 由左上角 (x,y) + 尺寸 (w,h) + 旋转角(deg) 求旋转后的 AABB（轴对齐包围盒）。 */
  _aabb(x, y, w, h, rot) {
    const cw = Math.max(1, w || 1), ch = Math.max(1, h || 1);
    const cx = x + cw / 2, cy = y + ch / 2;
    const rad = (Math.abs(rot) || 0) * Math.PI / 180;
    const c = Math.abs(Math.cos(rad)), s = Math.abs(Math.sin(rad));
    const ex = c * (cw / 2) + s * (ch / 2);
    const ey = s * (cw / 2) + c * (ch / 2);
    return { minX: cx - ex, minY: cy - ey, maxX: cx + ex, maxY: cy + ey };
  }

  _cellKeys(minX, minY, maxX, maxY) {
    const cs = this._cell;
    const x0 = Math.floor(minX / cs), y0 = Math.floor(minY / cs);
    const x1 = Math.floor(maxX / cs), y1 = Math.floor(maxY / cs);
    const keys = [];
    for (let gx = x0; gx <= x1; gx++) {
      for (let gy = y0; gy <= y1; gy++) keys.push(gx + ',' + gy);
    }
    return keys;
  }

  _put(id, keys) {
    for (const k of keys) {
      let set = this._buckets.get(k);
      if (!set) { set = new Set(); this._buckets.set(k, set); }
      set.add(id);
    }
  }

  _drop(id, keys) {
    for (const k of keys) {
      const set = this._buckets.get(k);
      if (!set) continue;
      set.delete(id);
      if (set.size === 0) this._buckets.delete(k);
    }
  }

  /** 插入/重建一张卡（已存在则等价于 update）。 */
  insert(id, x, y, w, h, rot) {
    if (this._cells.has(id)) return this.update(id, x, y, w, h, rot);
    const bb = this._aabb(x, y, w, h, rot);
    const keys = this._cellKeys(bb.minX, bb.minY, bb.maxX, bb.maxY);
    this._cells.set(id, keys);
    this._rects.set(id, { x, y, w, h, rot });
    this._put(id, keys);
    return this;
  }

  /** 增量更新一张卡的几何（先撤旧单元、再入新单元）。 */
  update(id, x, y, w, h, rot) {
    const old = this._cells.get(id);
    if (old) this._drop(id, old);
    const bb = this._aabb(x, y, w, h, rot);
    const keys = this._cellKeys(bb.minX, bb.minY, bb.maxX, bb.maxY);
    this._cells.set(id, keys);
    this._rects.set(id, { x, y, w, h, rot });
    this._put(id, keys);
    return this;
  }

  remove(id) {
    const old = this._cells.get(id);
    if (old) this._drop(id, old);
    this._cells.delete(id);
    this._rects.delete(id);
    return this;
  }

  has(id) { return this._cells.has(id); }

  /** 返回与矩形 (x0,y0)-(x1,y1) 精确相交的所有 id。先按单元收候选（O(覆盖单元数)），
   *  再对候选做旋转 AABB 精确相交判定，避免「同单元但不相交」的保守超集。 */
  queryRect(x0, y0, x1, y1) {
    const minX = Math.min(x0, x1), minY = Math.min(y0, y1);
    const maxX = Math.max(x0, x1), maxY = Math.max(y0, y1);
    const keys = this._cellKeys(minX, minY, maxX, maxY);
    const out = new Set();
    const seen = new Set();
    for (const k of keys) {
      const set = this._buckets.get(k);
      if (!set) continue;
      for (const id of set) {
        if (seen.has(id)) continue;
        seen.add(id);
        const r = this._rects.get(id);
        const bb = this._aabb(r.x, r.y, r.w, r.h, r.rot);
        if (bb.minX <= maxX && bb.maxX >= minX && bb.minY <= maxY && bb.maxY >= minY) out.add(id);
      }
    }
    return out;
  }

  /** 点命中候选：返回覆盖该点的所有 id（不保证精确落在旋转矩形内，调用方再做精确判定）。 */
  queryPoint(px, py) {
    const cs = this._cell;
    const k = Math.floor(px / cs) + ',' + Math.floor(py / cs);
    const set = this._buckets.get(k);
    return set ? Array.from(set) : [];
  }

  /** 全部几何包围盒（fit-all 等用）。无元素返回 null。 */
  bounds() {
    if (this._cells.size === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const r of this._rects.values()) {
      const bb = this._aabb(r.x, r.y, r.w, r.h, r.rot);
      if (bb.minX < minX) minX = bb.minX;
      if (bb.minY < minY) minY = bb.minY;
      if (bb.maxX > maxX) maxX = bb.maxX;
      if (bb.maxY > maxY) maxY = bb.maxY;
    }
    return { minX, minY, maxX, maxY };
  }

  clear() {
    this._buckets.clear();
    this._cells.clear();
    this._rects.clear();
    return this;
  }

  get size() { return this._cells.size; }
}
