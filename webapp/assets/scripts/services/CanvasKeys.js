// 通用画布键位接线（C2 · 机制收敛）
// 三模式（便签 / 写作 / 思维导图）共享同一套「缩放 / 重置 / 适应 / 抓手」键位，
// 避免「便签加了某键、导图漏了」的漂移。命中且本模式激活时 stopImmediatePropagation，
// 阻断事件继续到其他模式的键盘处理器（双响根因）。
//
// 用法（每模式在初始化时调用一次）：
//   CanvasKeys.bind({
//     isActive: () => ctrl._mode === 'notes',
//     zoomByCenter: (f) => ctrl._zoomByCenter(f),
//     zoomReset: () => ctrl._zoomReset(),
//     fitView: () => ctrl._fitNotesToView(),
//     fitSelection: () => ctrl._fitSelectionToView(),
//     toggleHand: () => ctrl._hand.toggleHand(),
//   });
import { isFromTextEntry } from '../utils/domRef.js';

export const CanvasKeys = {
  DEFAULT_ZOOM_STEP: 1.25,

  /**
   * @param {object} a
   *   isActive()             本模式是否应响应
   *   zoomByCenter(factor)   以画布中心缩放
   *   zoomReset()            重置 100%
   *   fitView()              适应内容（fit-all）
   *   fitSelection()         适应选区（无选区降级为全部）
   *   toggleHand()           切换抓手工具
   *   zoomStep           可选，默认 1.25
   * @returns detach()
   */
  bind(a) {
    const step = (typeof a.zoomStep === 'number') ? a.zoomStep : CanvasKeys.DEFAULT_ZOOM_STEP;
    const onKey = (e) => {
      if (!a.isActive()) return;
      if (isFromTextEntry(e)) return;       // 输入框内不劫持画布键
      const mod = e.metaKey || e.ctrlKey;
      let handled = false;
      if (mod) {
        if (e.code === 'Equal' || e.code === 'NumpadAdd') { e.preventDefault(); a.zoomByCenter(step); handled = true; }
        else if (e.code === 'Minus' || e.code === 'NumpadSubtract') { e.preventDefault(); a.zoomByCenter(1 / step); handled = true; }
        else if (e.code === 'Digit0' || e.code === 'Numpad0') { e.preventDefault(); a.zoomReset(); handled = true; }
      }
      if (!handled && e.shiftKey && e.code === 'Digit1') { e.preventDefault(); a.fitView(); handled = true; }
      else if (!handled && e.shiftKey && e.code === 'Digit2') { e.preventDefault(); a.fitSelection(); handled = true; }
      else if (!handled && e.code === 'KeyH') { e.preventDefault(); a.toggleHand(); handled = true; }
      if (handled) e.stopImmediatePropagation();   // 阻断其他模式的键盘处理器（双响根因）
    };
    // 捕获阶段：先于各模式自有的处理器拿到键盘
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  },
};

// 测试 harness（loadModule 剥离 import）兼容：挂到 globalThis
if (typeof globalThis !== 'undefined') {
  globalThis.CanvasKeys = CanvasKeys;
}
