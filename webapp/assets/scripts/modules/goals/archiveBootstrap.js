import { store } from '../../state/store.js';
import { GoalsArchiver } from './archiver.js';

/**
 * 归档独立页引导。
 *
 * 关键约束：
 * 1. 本文件必须作为 bundle 的一部分（与 GoalsArchiver / store 同模块图）运行，
 *    不能放在独立的 <script type="module"> 里用全局引用 GoalsArchiver，否则会
 *    与主 bundle 的 top-level await（store 初始化）并发，出现竞态。
 * 2. GoalsArchiver 的判定优先用 window.GoalsArchiver —— archiver.js 在模块求值期
 *    同步把实例挂到 window.GoalsArchiver 上，入口又会把模块导出统一挂到 window，
 *    因此 bundle 同步求值结束后该引用必然就绪。为彻底消除任何打包顺序/缓存造成的
 *    边界竞态，若首次取不到再做一次 0ms 重试兜底。
 */
async function bootArchive() {
  document.body.classList.add('loading');

  const loadingEl = document.getElementById('archiveLoading');

  try {
    await Promise.race([
      store.initPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('store.initPromise timeout')), 10000)
      ),
    ]);
  } catch (e) {
    console.error('Archive store init failed:', e.message);
    // 不阻断页面渲染：store 已降级到离线模式，继续初始化归档组件
  }

  const root = document.getElementById('archiveRoot');
  if (!root) {
    console.error('[Archive] archiveRoot container not found');
    document.body.classList.remove('loading');
    return;
  }

  // 解析 GoalsArchiver：优先 window（archiver.js 同步挂载），必要时做一次微任务重试。
  let archiver = window.GoalsArchiver;
  if (typeof archiver === 'undefined' || typeof archiver.openStandalone !== 'function') {
    await new Promise((r) => setTimeout(r, 0));
    archiver = window.GoalsArchiver;
  }

  if (root && typeof archiver !== 'undefined' && typeof archiver.openStandalone === 'function') {
    archiver.openStandalone(root);
    if (loadingEl) loadingEl.remove();
  } else {
    if (loadingEl) loadingEl.textContent = '归档组件初始化失败';
    console.error('[Archive] GoalsArchiver not available');
  }

  document.body.classList.remove('loading');

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) {
    document.body.classList.add('motion-reduced');
  }
  motionQuery.addEventListener('change', (e) => {
    document.body.classList.toggle('motion-reduced', e.matches);
  });
}

bootArchive();
