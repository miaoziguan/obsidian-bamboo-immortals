// 通用画布手势接线（C3 · 机制收敛）
// 滚轮 / 空格抓手 / 双指捏合 / 平移 三模式共享同一套实现，避免「给便签加了手势、导图漏了」的漂移。
// 模式专属逻辑（卡片/节点拖拽、框选、连线）经回调（adapter.onEmptyPointerDown）注入。
//
// 用法（每模式在初始化时调用）：
//   const hand = CanvasGestures.installSpaceHand(host, { isActive });
//   CanvasGestures.installWheel(host, { isActive, getView, zoomAt, panBy });
//   CanvasGestures.attach(host, {
//     isActive, state: hand.state,
//     getView, setView, getScale, zoomAt, panBy,
//     onEmptyPointerDown: (e) => { ...卡片/节点拖拽 或 框选... },
//     // 可选钩子：onPointerDownAny / onBeforePan / onPanStart / onPanMove / onPanEnd
//     //          onPinchWillStart / onPinchStart / onPinchEnd
//   });
import { CanvasViewport } from './CanvasViewport.js';
import { isFromTextEntry } from '../utils/domRef.js';

// 命中这些元素的指针按下：不触发画布平移/捏合/框选（交给控件自身，或交给 onEmptyPointerDown 之外的逻辑）。
// 注意：.tw-card / .tw-mm-node / .tw-link-anchor 不在其中——它们需要被 onEmptyPointerDown 拿到去拖拽/连线。
// 但 .tw-card 必须含入：点便签本体要回退给便签自己的拖拽/选中逻辑，绝不能触发画布框选或清选（editExit 回归点）。
const CONTROL_SEL = [
  'button', 'input', 'textarea', 'select',
  '.tw-zoom-bar',
  '.tw-card', '.tw-card-resize', '.tw-card-rotate', '.tw-card-link', '.tw-card-delete',
  '.tw-links', '.tw-links-ctl',
  '.tw-mm-search', '.tw-mm-toolbar',
].join(',');

export const CanvasGestures = {
  /** 滚轮：⌘/Ctrl=以光标为焦点缩放；Shift=横移；普通=平移。（单卡缩放快捷键已移除，Alt+滚轮按普通平移处理） */
  installWheel(host, a) {
    const onWheel = (e) => {
      if (!a.isActive()) return;
      e.preventDefault();
      if (e.metaKey || e.ctrlKey) a.zoomAt(e.clientX, e.clientY, CanvasViewport.wheelFactor(e.deltaY));
      else if (e.shiftKey)        a.panBy(-e.deltaY, 0);
      else                        a.panBy(-e.deltaX, -e.deltaY);
    };
    host.addEventListener('wheel', onWheel, { passive: false });
    return () => host.removeEventListener('wheel', onWheel);
  },

  /** 空格=临时抓手 / Hand 工具。返回 { state, toggleHand, destroy }；state.spaceDown/handTool 供 attach 读取。 */
  installSpaceHand(host, a) {
    const state = { spaceDown: false, handTool: false };
    const onKeyDown = (e) => {
      if (e.code !== 'Space' || !a.isActive()) return;
      if (isFromTextEntry(e)) return;       // 输入框内不劫持空格
      state.spaceDown = true;
      if (host) host.classList.add('is-hand');
      e.preventDefault();                    // 避免空格滚动页面
    };
    const onKeyUp = (e) => {
      if (e.code !== 'Space') return;
      state.spaceDown = false;
      if (host && !state.handTool) host.classList.remove('is-hand');
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);
    const toggleHand = () => {
      state.handTool = !state.handTool;
      if (host) host.classList.toggle('is-hand', state.handTool);
      return state.handTool;
    };
    return {
      state,
      toggleHand,
      destroy() {
        document.removeEventListener('keydown', onKeyDown, true);
        document.removeEventListener('keyup', onKeyUp, true);
      },
    };
  },

  /**
   * 接管画布级指针手势（平移 / 双指捏合 / 空白判定）。
   * @param {Element} host 监听 pointerdown 的元素（功能根或导图层）
   * @param {object} a 见文件头注释
   * @returns detach()
   */
  attach(host, a) {
    const ptrs = new Map();

    const isPanIntent = (e) =>
      !!(a.state.spaceDown || a.state.handTool) ||
      (e.pointerType === 'mouse' && e.button === 1);

    const onDown = (e) => {
      if (!a.isActive()) return;
      if (e.target.closest && e.target.closest(CONTROL_SEL)) return;
      // 仅放行左键(0)与中键(1)；右键等不参与（保留右键菜单）
      if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 1) return;
      if (a.onPointerDownAny) a.onPointerDownAny(e);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (ptrs.size >= 2) {                 // 双指 → 捏合（接管，并取消可能已起的框选）
        if (a.onPinchWillStart) a.onPinchWillStart();
        startPinch();
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (isPanIntent(e)) {                 // 空格/抓手/中键 → 平移（接管，阻止 onEmptyPointerDown 触发框选）
        if (a.onBeforePan) a.onBeforePan();
        startPan({ clientX: e.clientX, clientY: e.clientY });
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // 普通左键空白 → 交给模式（卡片/节点拖拽 或 框选）
      if (a.onEmptyPointerDown) a.onEmptyPointerDown(e);
    };

    const startPan = (first) => {
      const v = a.getView();
      const x0 = first.clientX, y0 = first.clientY, vx0 = v.x, vy0 = v.y;
      if (a.onPanStart) a.onPanStart();
      const move = (ev) => {
        a.setView({ x: vx0 + (ev.clientX - x0), y: vy0 + (ev.clientY - y0), scale: a.getScale() });
        if (a.onPanMove) a.onPanMove();
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        if (a.onPanEnd) a.onPanEnd();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    };

    const startPinch = () => {
      if (a.onPinchStart) a.onPinchStart();
      let last = null;
      const move = (ev) => {
        if (ptrs.has(ev.pointerId)) ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
        const ps = Array.from(ptrs.values());
        if (ps.length < 2) return;
        const dist = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
        const mid = { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 };
        if (last && last.dist > 0) {
          // 以中点为焦点缩放 + 内容跟随中点移动（Excalidraw 手感）
          a.zoomAt(mid.x, mid.y, dist / last.dist);
          const v = a.getView();
          a.setView({ x: v.x + (mid.x - last.mid.x), y: v.y + (mid.y - last.mid.y), scale: a.getScale() });
        }
        last = { dist, mid };
      };
      const up = (ev) => {
        if (ptrs.has(ev.pointerId)) ptrs.delete(ev.pointerId);
        if (ptrs.size >= 2) return;          // 还有两指以上，继续捏合
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        if (a.onPinchEnd) a.onPinchEnd();
        if (ptrs.size === 1) {               // 松一指 → 剩一根续平移，避免「松一指就卡住」
          const p = Array.from(ptrs.values())[0];
          startPan({ clientX: p.x, clientY: p.y });
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    };

    // 兜底：任何抬起都从指针表移除（即便不是本次平移/捏合的手指），保证 ptrs.size 在收尾时正确
    const onUpGlobal = (ev) => {
      if (!a.isActive()) { ptrs.clear(); return; }
      ptrs.delete(ev.pointerId);
    };

    host.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUpGlobal);
    window.addEventListener('pointercancel', onUpGlobal);

    return () => {
      host.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUpGlobal);
      window.removeEventListener('pointercancel', onUpGlobal);
    };
  },
};

// 测试 harness（loadModule 剥离 import）兼容：挂到 globalThis
if (typeof globalThis !== 'undefined') {
  globalThis.CanvasGestures = CanvasGestures;
}
