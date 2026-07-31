import { store } from '../../state/store.js';
import { GoalsArchiver } from './archiver.js';

/**
 * 归档独立页引导。
 *
 * 关键：本文件必须作为 bundle 的一部分（与 GoalsArchiver / store 同模块图）运行，
 * 不能放在独立的 <script type="module"> 里用全局引用 GoalsArchiver。
 * 原因：主 bundle 含 top-level await（store 初始化），独立 module 脚本会与之
 * 并发执行，可能在 bundle 暴露 window.GoalsArchiver 之前就先跑了初始化检查，
 * 导致 '[Archive] GoalsArchiver not available'。放进 bundle 后，本模块直接 import
 * GoalsArchiver（模块作用域，非全局查找），并 await store.initPromise，天然在二者
 * 就绪后才执行，彻底消除竞态。
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
  if (root && typeof GoalsArchiver !== 'undefined') {
    GoalsArchiver.openStandalone(root);
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
