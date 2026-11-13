/**
 * 围栏代码块的语法着色 —— **纯投影层**。
 *
 * 两条硬约束（这就是「风险最低」的全部含义）：
 *  1. 只切分、不改字符：所有 token 的 text 拼起来与源码逐字相等（`join('') === src`）。
 *     因此任何一条既有链路（序列化回 md / 导出 / 语音朗读 / 编辑态）看到的文本与着色前一致。
 *  2. 不认的语言就当没有（返回空数组）：未知语言 = 现在的纯文本，绝不猜。
 *
 * 不引第三方高亮库：插件离线运行、卡片代码块通常只有几十行，自带一个「足够好看」的
 * 词法切分器比塞进 100KB+ 的 Prism/highlight.js 划算，也没有版本/许可证负担。
 */

/**
 * 着色长度上限：实测本机 2k 字符 0.6ms、40k 字符 11.5ms（扫描器是 O(n×规则数)）。
 * 卡片正文上限远小于此，这里只是兜底——真来了一段巨长的代码块，返回空数组即纯文本，
 * 宁可不着色也不能让一次挂载卡住。
 */
const MAX_HIGHLIGHT_CHARS = 20000;

/**
 * token → 类名。这里刻意写全字面量而不是 `'tk-' + cls`：构建门禁的
 * `check:dead-css` 靠「类名是否以字面量出现在源码里」判活，拼接出来的类会被判成死 CSS。
 */
const TOKEN_CLASS = {
  com: 'tk-com',
  str: 'tk-str',
  num: 'tk-num',
  kw: 'tk-kw',
  fn: 'tk-fn',
  op: 'tk-op',
  tag: 'tk-tag',
  attr: 'tk-attr',
  var: 'tk-var',
  prop: 'tk-prop',
  at: 'tk-at',
};

/** 语言别名 → 词法族（大小写不敏感；未命中一律不着色） */
const LANG_FAMILY = {
  js: 'js', javascript: 'js', mjs: 'js', cjs: 'js', jsx: 'js', node: 'js',
  ts: 'js', typescript: 'js', tsx: 'js',
  json: 'json', json5: 'json', jsonc: 'json',
  py: 'py', python: 'py', python3: 'py',
  sh: 'sh', bash: 'sh', zsh: 'sh', shell: 'sh', shellsession: 'sh', terminal: 'sh', console: 'sh',
  html: 'html', htm: 'html', xml: 'html', svg: 'html', vue: 'html',
  css: 'css', scss: 'css', less: 'css',
  yml: 'yaml', yaml: 'yaml', toml: 'yaml', ini: 'yaml', conf: 'yaml', properties: 'yaml', env: 'yaml',
  sql: 'sql', mysql: 'sql', pgsql: 'sql', postgresql: 'sql', sqlite: 'sql',
};

const JS_KW = 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue'
  + '|new|class|extends|super|this|typeof|instanceof|in|of|try|catch|finally|throw'
  + '|async|await|yield|import|from|export|default|delete|void|null|undefined|true|false'
  + '|interface|type|enum|implements|public|private|protected|readonly|as|declare|namespace'
  + '|abstract|static|get|set';
const PY_KW = 'def|return|if|elif|else|for|while|import|from|as|class|try|except|finally|with'
  + '|lambda|None|True|False|and|or|not|in|is|pass|raise|yield|global|nonlocal|assert|del'
  + '|break|continue|async|await|self|print';
const SH_KW = 'if|then|else|elif|fi|for|while|until|do|done|case|esac|function|return|local'
  + '|export|unset|set|echo|cd|exit|source|trap|read|printf|test|shift|eval|alias|sudo';
const SQL_KW = 'select|from|where|insert|into|values|update|set|delete|create|table|alter|drop'
  + '|index|join|left|right|inner|outer|on|group|order|by|having|limit|offset|as|and|or|not'
  + '|null|is|in|like|between|distinct|union|all|case|when|then|else|end|primary|key|foreign'
  + '|references|default|unique|check|exists|count|sum|avg|min|max|begin|commit|rollback';

/**
 * 每个族的规则表（**顺序即优先级**，先匹配到的赢）。
 * 每条规则必须至少消费 1 个字符（sticky 正则零长匹配会让扫描死循环）。
 */
const RULES = {
  js: [
    { p: '//[^\\n]*', c: 'com' },
    { p: '/\\*[\\s\\S]*?(?:\\*/|$)', c: 'com' },
    { p: "'(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\"|`(?:\\\\.|[^`\\\\])*`", c: 'str' },
    { p: '0[xX][0-9a-fA-F]+|0[bB][01]+|\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?n?', c: 'num' },
    { p: `\\b(?:${JS_KW})\\b`, c: 'kw' },
    { p: '[A-Za-z_$][\\w$]*(?=\\s*\\()', c: 'fn' },
    { p: '=>|===|!==|\\.\\.\\.|==|!=|<=|>=|&&|\\|\\||\\?\\?|\\?\\.|[+\\-*/%=<>!&|^~?:]', c: 'op' },
  ],
  json: [
    { p: '//[^\\n]*', c: 'com' },
    { p: '/\\*[\\s\\S]*?(?:\\*/|$)', c: 'com' },
    { p: '"(?:\\\\.|[^"\\\\\\n])*"', c: 'str' },
    { p: '-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?', c: 'num' },
    { p: '\\b(?:true|false|null)\\b', c: 'kw' },
  ],
  py: [
    { p: '#[^\\n]*', c: 'com' },
    { p: '"""[\\s\\S]*?(?:"""|$)|\'\'\'[\\s\\S]*?(?:\'\'\'|$)', c: 'str' },
    { p: "'(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\"", c: 'str' },
    { p: '@[A-Za-z_][\\w.]*', c: 'at' },
    { p: '\\b\\d[\\d_]*(?:\\.\\d+)?\\b', c: 'num' },
    { p: `\\b(?:${PY_KW})\\b`, c: 'kw' },
    { p: '[A-Za-z_][\\w]*(?=\\s*\\()', c: 'fn' },
    { p: '===|!==|==|!=|<=|>=|\\*\\*|//|[-+*/%=<>!&|^~:]=?', c: 'op' },
  ],
  sh: [
    { p: '#[^\\n]*', c: 'com' },
    { p: "'[^']*'|\"(?:\\\\.|[^\"\\\\])*\"", c: 'str' },
    { p: '\\$\\{[^}]*\\}|\\$[A-Za-z_][\\w]*|\\$[0-9@#?$!*-]', c: 'var' },
    { p: `\\b(?:${SH_KW})\\b`, c: 'kw' },
    { p: '\\b\\d+\\b', c: 'num' },
    { p: '&&|\\|\\||>>|<<|[|&;<>()]', c: 'op' },
  ],
  html: [
    { p: '<!--[\\s\\S]*?(?:-->|$)', c: 'com' },
    { p: '<![^>]*>', c: 'com' },
    { p: '</?[A-Za-z][\\w:-]*', c: 'tag' },
    { p: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'', c: 'str' },
    { p: '[A-Za-z_:@][\\w:.-]*(?=\\s*=)', c: 'attr' },
  ],
  css: [
    { p: '/\\*[\\s\\S]*?(?:\\*/|$)', c: 'com' },
    { p: '//[^\\n]*', c: 'com' },
    { p: '"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'', c: 'str' },
    { p: '@[A-Za-z-]+', c: 'at' },
    { p: '#[0-9a-fA-F]{3,8}\\b', c: 'num' },
    { p: '\\b\\d+(?:\\.\\d+)?(?:px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|fr|ch|ex|pt)?', c: 'num' },
    { p: '[A-Za-z-]+(?=\\s*:)', c: 'prop' },
    { p: '!important', c: 'kw' },
  ],
  yaml: [
    { p: '[#;][^\\n]*', c: 'com' },
    { p: '"(?:\\\\.|[^"\\\\\\n])*"|\'[^\'\\n]*\'', c: 'str' },
    { p: '^[ \\t-]*[A-Za-z_][\\w.-]*(?=\\s*[:=])', c: 'prop', f: 'm' },
    { p: '\\b\\d+(?:\\.\\d+)?\\b', c: 'num' },
    { p: '\\b(?:true|false|null|yes|no|on|off)\\b', c: 'kw', f: 'i' },
  ],
  sql: [
    { p: '--[^\\n]*', c: 'com' },
    { p: '/\\*[\\s\\S]*?(?:\\*/|$)', c: 'com' },
    { p: "'(?:''|\\\\.|[^'\\\\])*'", c: 'str' },
    { p: '\\b\\d+(?:\\.\\d+)?\\b', c: 'num' },
    { p: `\\b(?:${SQL_KW})\\b`, c: 'kw', f: 'i' },
    { p: '[A-Za-z_][\\w$]*(?=\\s*\\()', c: 'fn' },
  ],
};

/** 惰性编译：只有真正用到的族才建正则（10 个族全建也只是一次性开销） */
const COMPILED = {};
function rulesOf(family) {
  if (!RULES[family]) return null;
  if (!COMPILED[family]) {
    COMPILED[family] = RULES[family].map((r) => ({
      re: new RegExp(r.p, 'y' + (r.f || '')),
      c: r.c,
    }));
  }
  return COMPILED[family];
}

/** 语言标记 → 词法族；`js title=foo` 这类附加信息只取第一个词。
 *  （不导出：对外只有 paintCode / plainifyCodeBlocks 两个入口；单测经 harness 直接取顶层绑定） */
function codeFamily(lang) {
  const key = String(lang == null ? '' : lang).trim().toLowerCase().split(/\s+/)[0];
  return LANG_FAMILY[key] || '';
}

/**
 * 纯函数：源码 → `[文字, 类名][]`。类名为空串表示「原样、不着色」。
 * 保证 `tokens.map(t => t[0]).join('') === src`。
 */
function highlightTokens(src, lang) {
  const text = String(src == null ? '' : src);
  const rules = rulesOf(codeFamily(lang));
  if (!rules || !text) return [];
  if (text.length > MAX_HIGHLIGHT_CHARS) return [];   // 超长代码不着色：宁可纯文本，也不让一次挂载卡住
  const out = [];
  let plain = '';
  let i = 0;
  while (i < text.length) {
    let hit = null;
    for (let k = 0; k < rules.length; k += 1) {
      const r = rules[k];
      r.re.lastIndex = i;
      const m = r.re.exec(text);
      if (m && m[0]) { hit = { s: m[0], c: r.c }; break; }
    }
    if (hit) {
      if (plain) { out.push([plain, '']); plain = ''; }
      out.push([hit.s, hit.c]);
      i += hit.s.length;
    } else {
      plain += text.charAt(i);
      i += 1;
    }
  }
  if (plain) out.push([plain, '']);
  return out;
}

/**
 * 把着色结果画进 `<code>`：只包 `<span class="tk-*">`，**文本一个字符都不改**。
 * 返回是否真的着上色（未知语言返回 false，DOM 保持原样）。
 *
 * 编辑态（contenteditable）一律不画：编辑中的重投影（如插入图片后 _applyCardText）
 * 不能再把 span 塞回正在编辑的代码块里，否则又回到「新字继承旧 token 颜色」。
 */
export function paintCode(codeEl, src, lang) {
  if (!codeEl) return false;
  if (typeof codeEl.closest === 'function' && codeEl.closest('[contenteditable="true"]')) return false;
  const tokens = highlightTokens(src, lang);
  if (!tokens.length) return false;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < tokens.length; i += 1) {
    const [text, cls] = tokens[i];
    if (!cls) { frag.appendChild(document.createTextNode(text)); continue; }
    const span = document.createElement('span');
    span.className = TOKEN_CLASS[cls] || 'tk-com';
    span.textContent = text;      // 绝不用 innerHTML：代码内容来自用户笔记
    frag.appendChild(span);
  }
  codeEl.textContent = '';
  codeEl.appendChild(frag);
  return true;
}

/**
 * 编辑态去着色：把 `<pre><code>` 里的 span 拍平成纯文本。
 *
 * 为什么要这一步：卡片是「所见即所得」直接改投影 DOM 的，带 span 的代码块编辑时光标
 * 会钻到 token 内部、新打的字继承上一个 token 的颜色，着色又不会随输入实时重算 ——
 * 看着像坏了（数据其实没错，序列化对 span 透明）。与其在编辑态维护增量着色，不如
 * 编辑时干脆回到纯文本：编辑体验与着色前**逐字节一致**，退出编辑再按新模型重绘。
 *
 * @returns {number} 被拍平的代码块数量
 */
export function plainifyCodeBlocks(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return 0;
  const pres = root.querySelectorAll('pre.tw-md-code');
  let n = 0;
  for (let i = 0; i < pres.length; i += 1) {
    const pre = pres[i];
    if (!pre.querySelector('span[class^="tk-"]')) continue;
    const code = pre.querySelector('code') || pre;
    const plain = code.textContent || '';
    code.textContent = plain;     // 文本本就一致，回填只是去掉包装
    n += 1;
  }
  return n;
}
