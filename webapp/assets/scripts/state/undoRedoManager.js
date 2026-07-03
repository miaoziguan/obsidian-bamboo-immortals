/**
 * UndoRedoManager — 撤销/重做栈管理
 * 从 store.js 中抽取，通过 state 对象操作，与 Store 解耦。
 */
export class UndoRedoManager {
    /**
     * @param {{ data, undoStack, redoStack }} state — Store 的状态对象引用
     * @param {function} onStateChanged — 状态变化回调（通知 UI 更新）
     */
    constructor(state, onStateChanged) {
        this._state = state;
        this._onChange = onStateChanged || (() => {});
    }

    /** 推入撤销栈（在修改前调用） */
    push(dateKey, dayData) {
        const dataCopy = structuredClone(dayData || {});
        this._state.undoStack.push({ key: dateKey, data: dataCopy });

        const maxStackSize = 50;
        if (this._state.undoStack.length > maxStackSize) {
            this._state.undoStack.shift();
        }

        this._state.redoStack = [];
        this._onChange();
    }

    /** 撤销 */
    undo(currentKey) {
        if (this._state.undoStack.length === 0) return null;
        const currentData = structuredClone(this._state.data[currentKey] || {});
        this._state.redoStack.push({ key: currentKey, data: currentData });

        const prev = this._state.undoStack.pop();
        this._onChange();
        return prev;
    }

    /** 重做 */
    redo(currentKey) {
        if (this._state.redoStack.length === 0) return null;
        const currentData = structuredClone(this._state.data[currentKey] || {});
        this._state.undoStack.push({ key: currentKey, data: currentData });

        const next = this._state.redoStack.pop();
        this._onChange();
        return next;
    }

    canUndo() { return this._state.undoStack.length > 0; }
    canRedo() { return this._state.redoStack.length > 0; }
}
