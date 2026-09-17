/**
 * UndoStack — 轻量「快照式」撤销/重做栈
 *
 * 为什么用快照式而不是命令式（每步写 do/undo 一对）：
 *   宿主的操作种类很多（新建 / 删除 / 移动 / 缩放 / 旋转 / 换纸样 / 改字号 /
 *   编辑文本 / 增删连线 / 一键排版 / 平移画布…），命令式要为每一种都写一对互逆操作，
 *   漏一个就是静默的状态错乱，维护成本极高。而数据模型是纯数组 + 纯字段
 *   （便签 notes / 子弹 nodes，外加 links 与画布偏移），整体快照既便宜又不会漏。
 *   便签上限 50 张、单卡上限 500 字，栈深 20 步的内存占用可忽略。
 *
 * 本模块只管「栈」与「调用时机」，不碰任何具体数据：
 *   - capture(): 采集一份当前状态快照（不可用时返回 null，本次不入栈）
 *   - restore(s): 用快照把界面恢复回去
 *   - onChange(): 恢复后通知宿主落盘 / 重绘
 *
 * 时序约定（关键）：
 *   调用方必须在**变更前** push()。此时入栈的是「变更前」的状态；
 *   undo() 时把「当前（变更后）」状态压进 redo 栈，再恢复栈顶的旧状态；
 *   redo() 反之。这样来回拨动才是严格对称的。
 */

/** 默认撤销栈深度：足够覆盖误操作，又不至于让快照无限堆积 */
const DEFAULT_LIMIT = 20;

export class UndoStack {
  /**
   * @param {Object} o
   * @param {()=>any|null} o.capture   采集当前状态快照
   * @param {(s:any)=>void} o.restore  用快照恢复
   * @param {()=>void} [o.onChange]    恢复后的通知（落盘/重绘）
   * @param {number} [o.limit]         栈深上限
   */
  constructor(o) {
    this._capture = o.capture;
    this._restore = o.restore;
    this._onChange = o.onChange || (() => {});
    this._limit = o.limit || DEFAULT_LIMIT;
    this._undo = [];
    this._redo = [];
  }

  get canUndo() { return this._undo.length > 0; }
  get canRedo() { return this._redo.length > 0; }

  /**
   * 在**变更前**调用：记下此刻状态。
   * @returns {boolean} 是否真的入栈（画布未就绪等原因会跳过）
   */
  push() {
    const snap = this._capture();
    if (!snap) return false;
    this._undo.push(snap);
    if (this._undo.length > this._limit) this._undo.shift();
    // 一旦产生新操作，原来的「重做」分支就失效了（标准的历史语义）
    this._redo.length = 0;
    return true;
  }

  /** 撤销一步：当前状态进 redo 栈，恢复到上一个状态 */
  undo() {
    if (!this._undo.length) return false;
    const cur = this._capture();
    const prev = this._undo.pop();
    if (cur) this._redo.push(cur);
    this._restore(prev);
    this._onChange();
    return true;
  }

  /** 重做一步：当前状态进 undo 栈，前进到下一个状态 */
  redo() {
    if (!this._redo.length) return false;
    const cur = this._capture();
    const next = this._redo.pop();
    if (cur) this._undo.push(cur);
    this._restore(next);
    this._onChange();
    return true;
  }

  /** 清空历史（切换模式 / 卸载时用：两套文档的历史不该串味） */
  reset() {
    this._undo.length = 0;
    this._redo.length = 0;
  }
}

// 与 LinkLayer 同款双保险：打包器未解析 import 时也能从 window 取到
if (typeof window !== 'undefined') {
  window.UndoStack = UndoStack;
}
