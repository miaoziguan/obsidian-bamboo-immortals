/**
 * @jest-environment jsdom
 */
// BambooSelect 契约锁：自绘下拉必须**保持原生 select 的既有契约**，
// 否则已接入的 4 处（归档筛选 / 时间线 / 设置面板 / 白噪音）会静默失效。
// 关键契约：
//  1) 原生 select 保留在 DOM（仅视觉隐藏）——值容器；
//  2) 选择后写回 select.value 并 dispatch 冒泡的 change —— 既有监听器无需改动；
//  3) enhance 幂等（重渲染后重复调用不应套娃）；
//  4) 键盘 Enter 可选中（可访问性）。
const { loadModule } = require('./__helpers__/testUtils');

const { BambooSelect } = loadModule('utils/bambooSelect.js', ['BambooSelect']);

function build() {
  document.body.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="arch-filter-field">' +
    '<select class="arch-select" id="cat">' +
    '<option value="all" selected>全部分类</option>' +
    '<option value="work">工作</option>' +
    '<option value="life">个人</option>' +
    '</select></div>';
  document.body.appendChild(wrap);
  return wrap;
}

test('enhanceAll：升级为自绘下拉，原生 select 保留在 DOM 但视觉隐藏', () => {
  const root = build();
  const res = BambooSelect.enhanceAll(root);
  expect(res).toHaveLength(1);

  const sel = root.querySelector('select');
  expect(sel).toBeTruthy();                 // 仍在 DOM（值容器）
  expect(sel.classList.contains('bs-native')).toBe(true);
  expect(sel.getAttribute('aria-hidden')).toBe('true');

  const trigger = root.querySelector('.bs-trigger');
  expect(trigger).toBeTruthy();
  expect(root.querySelector('.bs-label').textContent).toBe('全部分类');
});

test('选择选项：写回 select.value 并 dispatch 冒泡 change（既有监听器照常工作）', () => {
  const root = build();
  BambooSelect.enhanceAll(root);
  const sel = root.querySelector('select');
  const seen = [];
  sel.addEventListener('change', (e) => seen.push(e.target.value));

  root.querySelector('.bs-trigger').click();
  const opts = root.querySelectorAll('.bs-opt');
  expect(opts).toHaveLength(3);
  opts[1].click();

  expect(sel.value).toBe('work');
  expect(seen).toEqual(['work']);
  expect(root.querySelector('.bs-label').textContent).toBe('工作');
  expect(root.querySelector('.bs-popup').hidden).toBe(true);
});

test('enhance 幂等：重复调用不会重复包裹', () => {
  const root = build();
  BambooSelect.enhanceAll(root);
  BambooSelect.enhanceAll(root);            // 第二次
  expect(root.querySelectorAll('.bs-select')).toHaveLength(1);
  expect(root.querySelectorAll('.bs-trigger')).toHaveLength(1);
});

test('键盘：Enter 选中当前激活项', () => {
  const root = build();
  BambooSelect.enhanceAll(root);
  const sel = root.querySelector('select');
  const pop = root.querySelector('.bs-popup');

  root.querySelector('.bs-trigger').click();   // 打开（默认激活当前选中项 all）
  pop.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  pop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

  expect(sel.value).toBe('work');
  expect(pop.hidden).toBe(true);
});
