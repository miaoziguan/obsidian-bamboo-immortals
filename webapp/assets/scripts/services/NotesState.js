/**
 * NotesState — 便签/写作档共享可变状态的单一所有者（解耦 B5 / 复盘 4.2 收口）。
 *
 * 此前 _notes / _geo / _spatial / _mountedCards / _links / _selected / _canvasOffset / _mode
 * 等 8 个字段直接挂在 TypewriterFeature 巨型单例上，与「方法集合」混在一起：
 *   · 任何新增字段都要同时动 _resetState + 所有触碰它的模块；
 *   · 数据真源与行为耦合，几何/数据易漂移（见 setGeom 单源入口）。
 *
 * 现统一收口到本对象，feature 经存取器代理（this._notes → this._state.notes）访问，
 * 杜绝镜像漂移；本对象即后续「模块接收 state 而非穿透 this」解耦的第一块基石。
 */
export class NotesState {
  constructor() {
    this.notes = [];                 // 写作档便签规范数据模型（WritingDoc 不可变增改）
    this.mountedCards = null;        // id → 在屏 DOM 元素
    this.geo = null;                // id → 几何缓存 {x,y,w,h,rot}（GeoCache）
    this.spatial = null;            // 空间索引（SpatialIndex）：cull/框选/命中 O(可视)
    this.links = [];                // 便签连线：[{from,to}]
    this.selected = null;           // 多选集合：Set<HTMLElement>
    this.canvasOffset = null;             // 画布平移偏移（首次设定前为 null，读取方用 || {x:0,y:0} 兜底，与解耦前一致）
    this.mode = 'notes';            // 红色齿轮旋钮三档权威状态
  }
}

// 测试 harness（loadModule 剥离 import）兼容：把类挂到 globalThis，
// 供剥离 import 后的 feature 经全局解析（与 twConfig 同处理）。
if (typeof globalThis !== 'undefined') {
  globalThis.NotesState = NotesState;
}
