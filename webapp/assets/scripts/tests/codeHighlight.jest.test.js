/**
 * @jest-environment jsdom
 */
/**
 * 代码块语法着色（utils/codeHighlight.js）契约。
 *
 * 它是**纯投影层**，所以最该钉住的不是「颜色好不好看」，而是两件事：
 *   ① 文本不变量：所有 token 的文字拼起来 === 源码（逐字节）。只要这条成立，
 *      序列化回 md / 导出 / 编辑态就不会因为着色出现任何漂移；
 *   ② 不认的语言一律不着色（返回空数组）—— 不猜、不半吊子，未知语言就是纯文本。
 * 另外钉住「只包 span、绝不用 innerHTML」：代码内容来自用户笔记，不能当 HTML 解析。
 */
const { loadModule } = require('./__helpers__/testUtils');

const {
  highlightTokens, paintCode, plainifyCodeBlocks, codeFamily,
} = loadModule('utils/codeHighlight.js', [
  'highlightTokens', 'paintCode', 'plainifyCodeBlocks', 'codeFamily',
]);

afterEach(() => { document.body.innerHTML = ''; });

const join = (tokens) => tokens.map((t) => t[0]).join('');

// 覆盖各族 + 各种讨厌的边界：未闭合块注释、三引号、模板串、CRLF、中文、emoji
const SAMPLES = [
  ['js', 'const a = 1; // 行注释\nfunction f(x) { return `tpl ${x}`; }\n/* 未闭合'],
  ['ts', 'interface A<T> { readonly k: T; }\nconst s: A<number> = { k: 1 };'],
  ['json', '{"a": [1, 2.5e3, true, null], "b": "x\\"y"}'],
  ['py', 'def g(n):\n    """文档串"""\n    return n ** 2  # 注释\n# 末尾'],
  ['sh', '#!/bin/bash\nNAME="竹林"\necho "${NAME}" | wc -l && exit 0'],
  ['html', '<div class="a" data-x=\'b\'>文本 &amp; 表情 🌿</div>\n<!-- 未闭合'],
  ['css', '.a::before { content: "x"; color: #fff; margin: 0.5em !important; }\n@keyframes k {}'],
  ['yaml', 'name: 竹林\nlist:\n  - one\n  - 2\nflag: true  # 注释'],
  ['sql', "SELECT id, COUNT(*) FROM t WHERE name = 'a''b' -- 注释\nGROUP BY id;"],
  ['js', '中文标识符 🌿\r\nconst 名 = 1;\r\n'],
  ['js', '```未闭合的围栏也算普通文本```'],
  ['js', ''],
];

describe('文本不变量（着色的唯一硬约束）', () => {
  test.each(SAMPLES)('拼回去与源码逐字相等：%s', (lang, src) => {
    const tokens = highlightTokens(src, lang);
    if (!src) {
      expect(tokens).toEqual([]);
      return;
    }
    expect(join(tokens)).toBe(src);
  });

  test('空串 / null / undefined 都返回空数组，不抛错', () => {
    expect(highlightTokens('', 'js')).toEqual([]);
    expect(highlightTokens(null, 'js')).toEqual([]);
    expect(highlightTokens(undefined, 'js')).toEqual([]);
  });
});

describe('语言识别：认得的着色，认不得的当纯文本', () => {
  test('别名归一（大小写不敏感，附加信息只取首个词）', () => {
    expect(codeFamily('JavaScript')).toBe('js');
    expect(codeFamily('TSX')).toBe('js');
    expect(codeFamily('PY')).toBe('py');
    expect(codeFamily('Bash')).toBe('sh');
    expect(codeFamily('js title=foo')).toBe('js');
    expect(codeFamily('')).toBe('');
    expect(codeFamily(null)).toBe('');
  });

  test('未知 / 无语言 → 空数组（不猜）', () => {
    expect(highlightTokens('const a = 1;', 'text')).toEqual([]);
    expect(highlightTokens('const a = 1;', 'diff')).toEqual([]);
    expect(highlightTokens('const a = 1;', '')).toEqual([]);
    expect(highlightTokens('const a = 1;')).toEqual([]);
  });

  test('超长代码（>20000 字符）直接不着色，避免一次挂载卡住', () => {
    const big = 'const a = 1;\n'.repeat(2000);   // 26000 字符
    expect(big.length).toBeGreaterThan(20000);
    expect(highlightTokens(big, 'js')).toEqual([]);
    expect(highlightTokens('const a = 1;\n'.repeat(100), 'js').length).toBeGreaterThan(0);
  });
});

describe('词法分类', () => {
  const classesOf = (src, lang, text) => highlightTokens(src, lang)
    .filter((t) => t[0] === text).map((t) => t[1]);

  test('js：关键字 / 字符串 / 注释 / 数字 / 函数名 各归各类', () => {
    const src = 'const s = "hi"; // c\nfunction f() { return 42; }';
    expect(classesOf(src, 'js', 'const')).toContain('kw');
    expect(classesOf(src, 'js', '"hi"')).toContain('str');
    expect(classesOf(src, 'js', '// c')).toContain('com');
    expect(classesOf(src, 'js', '42')).toContain('num');
    expect(classesOf(src, 'js', 'f')).toContain('fn');
    expect(classesOf(src, 'js', 'function')).toContain('kw');   // 关键字优先于函数名
  });

  test('py / sh / sql 的注释与字符串', () => {
    expect(classesOf('# x', 'py', '# x')).toContain('com');
    expect(classesOf("s = 'a'", 'py', "'a'")).toContain('str');
    expect(classesOf('$HOME', 'sh', '$HOME')).toContain('var');
    expect(classesOf("SELECT 1", 'sql', 'SELECT')).toContain('kw');   // 大小写不敏感
  });

  test('html 的标签名与属性名分开着色', () => {
    const src = '<a href="x">t</a>';
    expect(classesOf(src, 'html', '<a')).toContain('tag');
    expect(classesOf(src, 'html', 'href')).toContain('attr');
  });
});

describe('paintCode：只包 span，绝不当 HTML 解析', () => {
  function mkCode() {
    const pre = document.createElement('pre');
    pre.className = 'tw-md-code';
    const code = document.createElement('code');
    pre.appendChild(code);
    document.body.appendChild(pre);
    return code;
  }

  test('包出 tk-* span，且 textContent 与源码逐字相等', () => {
    const src = 'const a = 1; // 注释';
    const code = mkCode();
    expect(paintCode(code, src, 'js')).toBe(true);
    expect(code.textContent).toBe(src);
    expect(code.querySelectorAll('span.tk-kw').length).toBe(1);
    expect(code.querySelector('span.tk-com').textContent).toBe('// 注释');
  });

  test('代码里的 HTML 标签不会被解析成元素（XSS 面）', () => {
    const src = '<img src=x onerror=alert(1)>';
    const code = mkCode();
    paintCode(code, src, 'js');
    expect(code.querySelector('img')).toBeNull();
    expect(code.textContent).toBe(src);
  });

  test('未知语言返回 false，DOM 原样不动', () => {
    const code = mkCode();
    code.textContent = 'raw';
    expect(paintCode(code, 'raw', 'log')).toBe(false);
    expect(code.textContent).toBe('raw');
    expect(code.querySelectorAll('span').length).toBe(0);
  });

  test('编辑态（contenteditable）里一律不画：编辑中的重投影不能塞回 span', () => {
    const host = document.createElement('div');
    host.setAttribute('contenteditable', 'true');
    const pre = document.createElement('pre');
    pre.className = 'tw-md-code';
    const code = document.createElement('code');
    pre.appendChild(code);
    host.appendChild(pre);
    document.body.appendChild(host);

    expect(paintCode(code, 'const a = 1;', 'js')).toBe(false);
    expect(code.querySelectorAll('span').length).toBe(0);
  });
});

describe('plainifyCodeBlocks：编辑态拍平成纯文本', () => {
  function mkPre(lang, src) {
    const pre = document.createElement('pre');
    pre.className = 'tw-md-code';
    pre.dataset.lang = lang;
    const code = document.createElement('code');
    code.textContent = src;
    paintCode(code, src, lang);
    pre.appendChild(code);
    const host = document.createElement('div');
    host.className = 'tw-card-text';
    host.appendChild(pre);
    document.body.appendChild(host);
    return { host, pre, code };
  }

  test('去掉 span、文本一点不变，并返回被处理的数量', () => {
    const src = 'const a = 1; // 注释';
    const { host, pre } = mkPre('js', src);
    expect(pre.querySelectorAll('span.tk-kw').length).toBe(1);

    expect(plainifyCodeBlocks(host)).toBe(1);
    expect(host.querySelectorAll('span.tk-kw').length).toBe(0);
    expect(pre.querySelector('code').textContent).toBe(src);
    expect(pre.dataset.lang).toBe('js');   // 语言标记不是正文，保留
  });

  test('没有着色痕迹时返回 0（幂等，可反复调用）', () => {
    const { host } = mkPre('log', 'plain');
    expect(plainifyCodeBlocks(host)).toBe(0);
    expect(plainifyCodeBlocks(host)).toBe(0);
  });

  test('入参非法（null / 非元素）安全返回 0', () => {
    expect(plainifyCodeBlocks(null)).toBe(0);
    expect(plainifyCodeBlocks({})).toBe(0);
  });
});
