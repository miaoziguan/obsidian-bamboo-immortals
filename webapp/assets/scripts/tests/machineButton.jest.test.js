/**
 * @jest-environment jsdom
 */
// 机身按钮焦点回归锁：v3.22.1
// 根因：三个机身键（#twPaper/#twFont/#twArrange）与打印键（#twPrint）鼠标点击后未交还焦点，
//   而旋钮 #twKnob 早已 blur（见其注释）。焦点残留在按钮上 → 之后按空格/回车会「再次激活」它：
//   写作档表现为重切排版模式（顺流竖排 ⇄ 分幕，即用户看到的「按空格键切换模式」），
//   便签档是重排网格/重切纸样字体，打印键还会再打一张；且焦点框一直挂着 = 「激活态取消不掉」。
// 统一由 _bindRbtn 绑定：鼠标/触控点击（detail>0）后交还焦点；键盘激活（detail=0）保留焦点。
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
const { TypewriterFeature: feature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);

function mountBtn(id) {
  const host = document.createElement('div');
  const btn = document.createElement('button');
  btn.id = id;
  host.appendChild(btn);
  document.body.appendChild(host);
  feature._el = host;
  return { host, btn };
}

test('鼠标点击机身键后交还焦点（否则空格会再次激活它 → 误切排版模式 + 焦点框挂着）', () => {
  const { btn } = mountBtn('twArrange');
  let hits = 0;
  feature._bindRbtn('#twArrange', () => { hits++; });

  btn.focus();
  expect(document.activeElement).toBe(btn);

  btn.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  expect(hits).toBe(1);
  expect(document.activeElement).not.toBe(btn);   // 关键：鼠标点击后不在按钮上驻留焦点
});

test('键盘激活（detail=0）保留焦点，支持键盘连续操作', () => {
  const { btn } = mountBtn('twPaper');
  let hits = 0;
  feature._bindRbtn('#twPaper', () => { hits++; });

  btn.focus();
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
  expect(hits).toBe(1);
  expect(document.activeElement).toBe(btn);       // 键盘激活不 blur
});

test('选择器不存在时安全空操作（不抛异常）', () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  feature._el = host;
  expect(() => feature._bindRbtn('#twNotExist', () => {})).not.toThrow();
});

test('回归：四个机身键必须走 _bindRbtn（不得裸用 addEventListener 绑点击，否则丢失交还焦点）', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'handlers', 'features', 'typewriterFeature.js'), 'utf8'
  );
  ['#twPaper', '#twFont', '#twArrange', '#twPrint'].forEach((sel) => {
    expect(src).not.toContain(`querySelector('${sel}').addEventListener('click'`);
    expect(src).toContain(`_bindRbtn('${sel}'`);
  });
});
