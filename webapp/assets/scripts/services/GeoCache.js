/**
 * GeoCache — 卡片几何缓存（id → {x, y, w, h, rot}）的单一真源。
 *
 * 命中测试、连线端点、框选、视口剔除矩形全都读它（见 typewriterFeature 的
 * _getGeom / _selectInRect / _updateCulling），因此它必须「随卡片位置/尺寸变化」
 * 及时刷新，且离屏卡（DOM 已卸载）也保留最后测量值。
 *
 * 当初把它从 feature 内联的 `Map` 抽出来，是为了把「缓存 + 失效集 + 合帧句柄」
 * 内聚到一处：
 *   · 消除「几何真源双份、mounted / unmounted 取法不一致」的隐患（复盘 A4 / 解耦 B2）；
 *   · 让剔除 / 连线 / 命中一致地从同一处取几何，后续若再改几何语义只动这一个类。
 *
 * 接口尽量与 Map 兼容（get/set/delete/has/forEach/clear/size），使 feature 内
 * 既有的 `this._geo.get(...)` 等调用无需改动；失效管理与合帧句柄是本类新增的内聚职责。
 */
export class GeoCache {
  constructor() {
    this._map = new Map();   // id → { x, y, w, h, rot }
    this._dirty = new Set(); // 待重测的卡 id（尺寸/布局已变）；合帧时批量 reflow
    this._flushRaf = 0;      // requestAnimationFrame 句柄（多个失效点合并成一帧一次重测）
  }

  // —— Map 兼容接口（供 _getGeom / _measureCard / _syncLayoutGeo / _removeNoteById 等沿用）——
  get(id) { return this._map.get(id); }
  set(id, g) { this._map.set(id, g); return this; }
  delete(id) { this._map.delete(id); this._dirty.delete(id); return this; }
  has(id) { return this._map.has(id); }
  clear() { this._map.clear(); this._dirty.clear(); this._flushRaf = 0; return this; }
  forEach(cb) { this._map.forEach(cb); } // 回调签名同 Map.forEach：(value, key, map)
  get size() { return this._map.size; }

  // —— 失效管理：任何改变卡片尺寸/位置的操作都应打标记，而非立刻 reflow ——
  markDirty(id) { if (id != null) this._dirty.add(id); }
  markAllDirty(ids) { for (const id of ids) this._dirty.add(id); }
  takeDirty() { const d = this._dirty; this._dirty = new Set(); return d; }

  // —— 合帧句柄：把多次失效合并到一帧一次 reflow（对标 tldraw 的 geometry caching）——
  get flushRaf() { return this._flushRaf; }
  setFlushRaf(raf) { this._flushRaf = raf; }

  reset() { this._map.clear(); this._dirty.clear(); this._flushRaf = 0; }
}
