/**
 * BambooSelect —— 竹林自定义下拉（渐进增强原生 <select>）
 *
 * 为什么需要它：
 *   原生 <select> 的**展开列表由操作系统绘制**，option/高亮/字体全部不受 CSS 控制
 *   （macOS 上是系统蓝高亮 + 系统字体），与竹·水墨风格割裂，且无法美化。
 *   唯一出路是自绘下拉。
 *
 * 设计原则：**不破坏原有契约**
 *   - 原生 <select> 保留在 DOM 里作为「值容器」与「change 事件源」，仅视觉隐藏；
 *   - 选择后写回 select.value 并 dispatch 一个冒泡的 change 事件，
 *     所有既有调用方（监听 change）**无需改一行**；
 *   - 幂等：重复 enhance 同一元素会直接跳过（重渲染后重新 enhance 即可）。
 *
 * 用法：
 *   BambooSelect.enhanceAll(containerEl)   // 升级 container 内所有 <select>
 *   BambooSelect.enhance(selectEl)         // 升级单个
 *
 * 可访问性：
 *   trigger = <button aria-haspopup="listbox" aria-expanded>；
 *   popup = role="listbox"；选项 = role="option" + aria-selected；
 *   键盘：Enter/Space/↓ 打开，↑↓/Home/End 移动，Enter/Space 选中，Esc/Tab 关闭。
 */

const CHEVRON = '<svg class="bs-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">' +
  '<path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let _uid = 0;

function closeAll(except) {
  document.querySelectorAll('.bs-select.is-open').forEach((w) => {
    if (w !== except) w.__bsClose && w.__bsClose();
  });
}

function enhance(sel) {
  if (!sel || sel.dataset.bsReady === '1') return null;
  if (!sel.parentNode) return null;
  sel.dataset.bsReady = '1';

  const id = 'bs-' + (++_uid);
  const wrap = document.createElement('span');
  wrap.className = 'bs-select';
  if (sel.classList.contains('arch-select')) wrap.classList.add('bs-select--compact');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bs-trigger';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', id);
  if (sel.disabled) btn.disabled = true;
  if (sel.id) btn.dataset.for = sel.id;

  const label = document.createElement('span');
  label.className = 'bs-label';
  btn.appendChild(label);
  btn.insertAdjacentHTML('beforeend', CHEVRON);

  const pop = document.createElement('div');
  pop.className = 'bs-popup';
  pop.id = id;
  pop.setAttribute('role', 'listbox');
  pop.hidden = true;
  pop.tabIndex = -1;

  // 原生 select 视觉隐藏但仍留在 DOM（值 + change 事件源）
  sel.classList.add('bs-native');
  sel.setAttribute('tabindex', '-1');
  sel.setAttribute('aria-hidden', 'true');

  wrap.appendChild(btn);
  wrap.appendChild(pop);
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);

  let items = [];
  let activeIdx = -1;

  const syncLabel = () => {
    const o = sel.selectedOptions && sel.selectedOptions[0];
    label.textContent = o ? o.textContent : '';
  };

  const paint = () => {
    items.forEach((el, i) => {
      const on = i === activeIdx;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', el.dataset.v === sel.value ? 'true' : 'false');
      el.classList.toggle('is-sel', el.dataset.v === sel.value);
    });
  };

  const build = () => {
    pop.innerHTML = '';
    items = [];
    Array.from(sel.options).forEach((o) => {
      const el = document.createElement('div');
      el.className = 'bs-opt';
      el.setAttribute('role', 'option');
      el.dataset.v = o.value;
      el.textContent = o.textContent;
      if (o.disabled) {
        el.classList.add('is-disabled');
        el.setAttribute('aria-disabled', 'true');
      }
      pop.appendChild(el);
      items.push(el);
    });
    activeIdx = Math.max(0, Array.from(sel.options).findIndex((o) => o.value === sel.value));
    paint();
  };

  const isOpen = () => !pop.hidden;

  const open = () => {
    if (isOpen() || sel.disabled) return;
    closeAll(wrap);
    build();
    pop.hidden = false;
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    pop.focus({ preventScroll: true });
  };

  const close = () => {
    if (!isOpen()) return;
    pop.hidden = true;
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.focus({ preventScroll: true });
  };

  const commit = (idx) => {
    const el = items[idx];
    if (!el || el.classList.contains('is-disabled')) return;
    if (sel.value !== el.dataset.v) {
      sel.value = el.dataset.v;
      syncLabel();
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      syncLabel();
    }
    close();
  };

  const move = (dir) => {
    if (!items.length) return;
    let i = activeIdx;
    for (let n = 0; n < items.length; n++) {
      i = (i + dir + items.length) % items.length;
      if (!items[i].classList.contains('is-disabled')) break;
    }
    activeIdx = i;
    paint();
    // jsdom 未实现 scrollIntoView（测试环境），做能力守卫
    if (typeof items[i].scrollIntoView === 'function') {
      items[i].scrollIntoView({ block: 'nearest' });
    }
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.detail > 0) btn.blur(); // 鼠标点击后交还焦点，避免空格重开
    isOpen() ? close() : open();
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen()) move(1); else open();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen()) move(-1); else open();
    }
  });

  pop.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); activeIdx = 0; paint(); }
    else if (e.key === 'End') { e.preventDefault(); activeIdx = items.length - 1; paint(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commit(activeIdx); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { close(); }
  });

  pop.addEventListener('click', (e) => {
    const el = e.target.closest('.bs-opt');
    if (!el) return;
    commit(items.indexOf(el));
  });

  const onDocClick = (e) => {
    if (!isOpen()) return;
    const path = e.composedPath ? e.composedPath() : [];
    if (!path.includes(wrap)) close();
  };
  // shadow DOM 内的事件 target 会被重定向，故用 composedPath 判定是否点在内部
  (window.__bambooShadowRoot || document).addEventListener('click', onDocClick, true);

  wrap.__bsClose = close;
  syncLabel();

  return {
    update() { syncLabel(); if (isOpen()) { build(); } },
    destroy() {
      (window.__bambooShadowRoot || document).removeEventListener('click', onDocClick, true);
      sel.classList.remove('bs-native');
      sel.removeAttribute('tabindex');
      sel.removeAttribute('aria-hidden');
      delete sel.dataset.bsReady;
      wrap.replaceWith(sel);
    },
  };
}

function enhanceAll(root) {
  if (!root) return [];
  const list = root.querySelectorAll ? root.querySelectorAll('select:not(.bs-native)') : [];
  return Array.from(list).map((s) => enhance(s)).filter(Boolean);
}

export const BambooSelect = { enhance, enhanceAll };
window.BambooSelect = BambooSelect;
