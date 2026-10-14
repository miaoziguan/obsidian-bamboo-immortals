/**
 * @jest-environment jsdom
 */
// 便签卡片工具条「五态」纪律锁。
//
// 背景（真实缺陷，已复发 3 次：split → merge → export）：工具条里的按钮从裸 <button> 起步，
// 浏览器默认会给它白底 + 边框，所以每加一个按钮都必须显式「纳入样式组」，并在**暗色**下成对
// 覆盖颜色。漏掉的后果有二：
//   · 常规态：白底白框，与同排裸图标钮格格不入（split / merge 都踩过，见 8914fdf / e2f0073）；
//   · 暗色态：仍沿用浅色模式的 #5b6257（深色画布上的暗橄榄灰）→ 肉眼发黯（export 踩过）。
// 这三次都靠人眼事后发现，故在此把它变成可静态检测的断言，杜绝第 4 次：
//   1) 凡渲染进 .tw-card-tools 的按钮，其语义类必须有一条 :host(.dark) 颜色规则；
//   2) 工具条按钮的 hover 只可变色，不可铺底（system = 裸图标，del 即范例）。
const fs = require('fs');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'handlers', 'features', 'CardViewManager.js');
const CSS = path.join(__dirname, '..', '..', 'styles', 'notes.css');

/** 从建卡模板里取出 .tw-card-tools 内每个按钮的语义类（class 列表首项，如 tw-card-move-up → tw-card-move） */
function toolButtonClasses(src) {
  const start = src.indexOf('<div class="tw-card-tools">');
  const end = src.indexOf('</div>', start);   // 块内无嵌套 div，取下一个闭合标签即止
  if (start < 0 || end < 0) return [];
  const block = src.slice(start, end);
  const out = [];
  const re = /<button[^>]*\bclass="([^"]+)"/g;
  let m;
  while ((m = re.exec(block))) out.push(m[1].trim().split(/\s+/)[0]);
  return out;
}

/** 把 CSS 拆成 { selector, body } 规则块（本文件无 @media 嵌套，扁平切分足够） */
function rules(css) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}

const src = fs.readFileSync(SCRIPT, 'utf8');
const css = fs.readFileSync(CSS, 'utf8');
const classes = toolButtonClasses(src);
const allRules = rules(css);

test('模板解析出工具条按钮（防解析失配导致后续断言空转）', () => {
  expect(classes).toEqual(expect.arrayContaining(['tw-card-export', 'tw-card-split', 'tw-card-del', 'tw-card-paper']));
  expect(classes.length).toBeGreaterThanOrEqual(8);
});

test('每个工具条按钮都有暗色态颜色规则（R: export 曾被漏掉 → 暗色发黯）', () => {
  const missing = classes.filter((cls) => !allRules.some(
    (r) => r.selector.includes(':host(.dark)')
      && new RegExp('\\.' + cls + '(?![\\w-])').test(r.selector)
      && /(^|;)\s*color\s*:/.test(r.body)
  ));
  expect(missing).toEqual([]);
});

test('工具条按钮 hover 只变色、不铺底（保持裸图标体系；R: export 曾是唯一带底色的）', () => {
  const offenders = classes.filter((cls) => allRules.some(
    (r) => !r.selector.includes(':host(.dark)')
      && new RegExp('\\.' + cls + ':hover(?![\\w-])').test(r.selector)
      && /(^|;)\s*background(-color)?\s*:/.test(r.body)
  ));
  expect(offenders).toEqual([]);
});
