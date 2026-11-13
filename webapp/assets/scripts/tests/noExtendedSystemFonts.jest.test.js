/**
 * @jest-environment node
 */
// Obsidian 插件检查器会把 CSS Fonts 4 的「扩展系统字体族」判成
//   Unexpected browser feature "extended-system-fonts" is not supported by Obsidian x.y.z
// 命中的写法是 system-ui / ui-monospace / ui-sans-serif / ui-serif / ui-rounded。
// 它们在实际环境里并不带来额外收益（这些族名本来就有传统等价物），却会污染审核报告。
// 这里锁住「样式与内联 CSS 只用传统族名」，避免以后又被写回来。
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', '..');   // webapp/assets
const BANNED = /\b(system-ui|ui-monospace|ui-sans-serif|ui-serif|ui-rounded)\b/;

/** 收集源码里的样式/脚本；跳过 tests 目录（断言文本自己会命中黑名单词）。 */
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'tests' || e.name === '__tests__' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(css|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** 剥注释：注释里允许出现族名做说明，不算使用。 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

test('样式与内联 CSS 不使用 extended-system-fonts 族', () => {
  const files = [...walk(path.join(ASSETS, 'styles')), ...walk(path.join(ASSETS, 'scripts'))];
  expect(files.length).toBeGreaterThan(10);   // 防 walk 失配导致断言空转
  const offenders = files.filter((f) => BANNED.test(stripComments(fs.readFileSync(f, 'utf8'))));
  expect(offenders.map((f) => path.relative(ASSETS, f))).toEqual([]);
});
