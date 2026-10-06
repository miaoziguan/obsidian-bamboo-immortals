#!/usr/bin/env node
/**
 * check-html-escape —— 属性上下文转义闸门
 *
 * 【为什么需要它】`.eslintrc.cjs` 把整个 `webapp/` 排除在 ESLint 之外
 * （注释：预编译前端，独立工具链），所以 webapp 侧没有任何 lint 保护。
 * 手工审查曾一次性发现 20+ 处属性上下文误用/漏转义（含真实注入点），
 * 说明"靠人记住约定"不可靠。本闸门把约定固化为可执行检查。
 *
 * 【为什么用 AST 而非正则】属性插值的位置判定必须解析模板字符串：
 *   `<div class="x">${text}</div>`   → 文本上下文，escapeHtml 正确
 *   `<div title="${text}">`          → 属性上下文，必须 escapeHtmlAttr
 * 两者在正则眼里几乎同形，只有解析 quasi/expression 配对才能区分。
 *
 * 【判定规则】属性位置（标签内未闭合的引号）的插值必须满足其一：
 *   1. 包裹在已批准转义函数中（默认 escapeHtmlAttr / HTMLUtils.escapeHtmlAttr）
 *   2. 命中 scripts/html-escape-allow.json 中该文件的豁免表达式
 *   3. 该行（或紧邻上一行）带 `html-escape-allow` 行内豁免注释
 * 其余一律报错。escapeHtml **不算**合格——它按 textContent 往返，不转义引号，
 * 用在属性上会闭合属性并允许注入任意事件处理器。
 *
 * 用法：
 *   node scripts/check-html-escape.mjs            # 闸门模式，有违例则 exit 1
 *   node scripts/check-html-escape.mjs --report    # 列出全部命中但不失败（用于摸底）
 */

import { Linter } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCAN_ROOT = path.join(ROOT, 'webapp', 'assets', 'scripts');
const ALLOW_FILE = path.join(__dirname, 'html-escape-allow.json');
const RULE_ID = 'bamboo/html-attr-escape';

/** 已批准的属性转义函数（按函数名匹配，不限定命名空间） */
const APPROVED_ESCAPES = new Set(['escapeHtmlAttr']);

/**
 * 判定 quasi 文本是否停在"某标签内、未闭合的属性值"里。
 *
 * 两处关键：
 *  1. 要求前面存在真实标签且路径不含 '>'，避免跨标签误判
 *     （否则 `<div>他说 "` 这类纯文本会被当成属性）；
 *  2. 开引号之后用 [^"']* 而不是 \s* ——属性值中间插值
 *     （class="todo-item ${a} ${b}"）同样处于未闭合状态，
 *     若只允许空白会把这类最常见写法全部漏掉。
 */
const ATTR_OPEN = /<[a-zA-Z][^<>]*?=\s*(["'])[^"']*$/;

/** 累积到第 i 个插值为止的模板文本，用于跨 quasi 判断标签上下文 */
function accumulated(node, i) {
    let out = '';
    for (let k = 0; k <= i; k++) {
        out += node.quasis[k].value.raw;
        if (k < i) out += '${}';
    }
    return out;
}

/** 取出属性名，使报错能指明位置（兼容属性值中间插值） */
function attrName(raw) {
    const m = /<[a-zA-Z][^<>]*?([a-zA-Z-]+)\s*=\s*(["'])[^"']*$/.exec(raw);
    return m ? m[1] : '(unknown)';
}

const linter = new Linter();

/**
 * 杠杆 1：把两类「可静态证明安全」的表达式从豁免表中解放出来。
 *
 * (a) map/forEach 类回调的**第二个参数** —— 按语言定义即数组下标，必为非负整数；
 * (b) 溯源到**对象字面量中字面量**的属性链（如 const colors = { start:'#fff' }
 *     → colors.start；export const L = { SPEC:{ FILL:'none' } } → this.SPEC.FILL）。
 *
 * 两者都是纯语法层判定，不需要类型信息，也不会漏出用户数据。之所以值得做：
 * 豁免表里这类条目本就能被证明，登记进去等于把「可自动判定」变成「需人工维护」，
 * 而清单会腐化 —— 这正是本闸门要消灭的债务形态。
 */
function precomputeSafeNames(code, filename) {
    const literalPaths = new Set();   // 溯源到字面量的属性链，如 colors.start
    const mapIndexParams = new Set(); // map/forEach 回调第二形参名

    const scanner = new Linter();
    scanner.defineRule('bamboo/probe', {
        create() {
            /** 把对象字面量里的字面量叶子登记为「根名.路径」 */
            function walk(obj, prefix, root) {
                for (const p of obj.properties) {
                    if (p.type !== 'Property' || p.computed) continue;
                    const key = p.key.type === 'Identifier' ? p.key.name
                        : (p.key.type === 'Literal' && typeof p.key.value === 'string' ? p.key.value : null);
                    if (key === null) continue;
                    const path = prefix ? prefix + '.' + key : key;
                    if (p.value.type === 'Literal') {
                        // root 为空表示「只登记从第二层起的后缀路径」，
                        // 此时不能再拼前导点，否则会存成 '.SPEC.FILL' 而永远匹配不上
                        literalPaths.add(root ? root + '.' + path : path);
                        const parts = path.split('.');
                        for (let i = 1; i < parts.length; i++) literalPaths.add(parts.slice(i).join('.'));
                    } else if (p.value.type === 'ObjectExpression') {
                        walk(p.value, path, root);
                    }
                }
            }
            function recordObjectLiteral(name, obj) {
                walk(obj, '', name);
                // 二级嵌套：使 SPEC.FILL 这类「对象中的对象」也能命中
                for (const p of obj.properties) {
                    if (p.type !== 'Property' || p.computed) continue;
                    const key = p.key.type === 'Identifier' ? p.key.name
                        : (p.key.type === 'Literal' && typeof p.key.value === 'string' ? p.key.value : null);
                    if (key !== null && p.value.type === 'ObjectExpression') walk(p.value, key, '');
                }
            }
            function recordFn(node) {
                const p = node.parent;
                if (p && p.type === 'CallExpression' && p.callee.type === 'MemberExpression'
                    && p.callee.property.type === 'Identifier'
                    && ['map', 'forEach', 'flatMap', 'filter', 'some', 'every', 'find', 'findIndex', 'reduce']
                        .includes(p.callee.property.name)) {
                    const second = node.params[1];
                    if (second && second.type === 'Identifier') mapIndexParams.add(second.name);
                }
            }
            return {
                VariableDeclarator(node) {
                    // 只认 const：可重新赋值的绑定不构成常量证明
                    if (node.id.type !== 'Identifier') return;
                    if (!node.parent || node.parent.kind !== 'const') return;
                    if (node.init && node.init.type === 'ObjectExpression') recordObjectLiteral(node.id.name, node.init);
                },
                ArrowFunctionExpression: recordFn,
                FunctionExpression: recordFn,
            };
        },
    });
    scanner.verify(code, {
        parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
        rules: { 'bamboo/probe': 'error' },
    }, filename);
    return { literalPaths, mapIndexParams };
}

/** 把成员访问还原为点路径。this. 前缀会被剥离（SPEC.FILL 与 this.SPEC.FILL 等价） */
function memberPath(node) {
    const parts = [];
    let cur = node;
    while (cur && cur.type === 'MemberExpression' && !cur.computed && cur.property.type === 'Identifier') {
        parts.unshift(cur.property.name);
        cur = cur.object;
    }
    if (!cur) return null;
    if (cur.type === 'ThisExpression') return parts.join('.');
    // 关键：必须带上根标识符，否则 colors.start 会被截成 'start' 而匹配不上
    if (cur.type === 'Identifier') return parts.length ? cur.name + '.' + parts.join('.') : cur.name;
    return null;
}

linter.defineRule(RULE_ID, {
    create(ctx) {
        const src = ctx.getSourceCode();
        const file = ctx.getFilename();
        const allowList = ctx.options[0] || {};
        // 豁免条目支持两种形态：裸数组（不推荐）或 { _reason, allow: [] }（带理由）
        const entry = allowList[file];
        const allowedHere = new Set(Array.isArray(entry) ? entry : (entry && entry.allow) || []);
        const { literalPaths, mapIndexParams } = precomputeSafeNames(src.getText(), file);

        /**
         * 可静态证明安全 → 无需转义。覆盖：
         *  - 字符串/数字/布尔字面量
         *  - 静态片段不含引号、且所有插值均安全的模板字面量
         *  - 三元表达式：两个分支都安全
         *  - 算术运算（- * / %）：结果必为数值，不可能闭合属性
         *  - 一侧为数字字面量的字符串拼接
         *  - 一元运算、Math.* 调用（恒返回原始值/数值）
         *  - map/forEach 回调的索引参数（语言定义即数字）
         *  - 溯源到 const 对象字面量的属性链（如 colors.start、this.SPEC.FILL）
         * 其余（标识符、成员访问、函数调用）必须走 escapeHtmlAttr 或登记豁免。
         */
        function isSafeStatic(expr) {
            if (!expr) return false;
            switch (expr.type) {
                case 'Literal':
                    return true;
                case 'TemplateLiteral':
                    return expr.quasis.every((q) => !/["']/.test(q.value.raw))
                        && expr.expressions.every(isSafeStatic);
                case 'ConditionalExpression':
                    return isSafeStatic(expr.consequent) && isSafeStatic(expr.alternate);
                case 'BinaryExpression':
                    if (['-', '*', '/', '%'].includes(expr.operator)) return true;
                    if (expr.operator === '+') {
                        return (expr.left.type === 'Literal' && typeof expr.left.value === 'number')
                            || (expr.right.type === 'Literal' && typeof expr.right.value === 'number');
                    }
                    return false;
                case 'UnaryExpression':
                    // 一元运算结果必为原始值（number/boolean/string/undefined），
                    // 不可能包含引号，故与操作数是否静态无关
                    return true;
                case 'CallExpression':
                    // num(x)：显式数值强制器，恒返回有限数字（见 htmlUtils.num）
                    if (expr.callee.type === 'Identifier' && expr.callee.name === 'num') return true;
                    // Math.* 恒返回数值（min/max/abs/floor/random…），不可能闭合属性
                    if (expr.callee.type !== 'MemberExpression') return false;
                    if (expr.callee.object.type === 'Identifier' && expr.callee.object.name === 'Math') return true;
                    return false;
                case 'Identifier':
                    // map/forEach 回调的索引参数：按语言定义即非负整数
                    return mapIndexParams.has(expr.name);
                case 'MemberExpression':
                    // 溯源到 const 对象字面量中的字面量
                    return literalPaths.has(memberPath(expr) || '\u0000');
                default:
                    return false;
            }
        }

        /** 表达式是否包裹在已批准转义函数中（含 `x || escapeHtmlAttr(y)` 兜底） */
        function isEscaped(expr) {
            let e = expr;
            if (e.type === 'LogicalExpression') e = e.right;
            if (e.type !== 'CallExpression') return false;
            const callee = e.callee;
            if (callee.type === 'Identifier') return APPROVED_ESCAPES.has(callee.name);
            if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
                return APPROVED_ESCAPES.has(callee.property.name);
            }
            return false;
        }

        function hasInlineAllow(line) {
            const lines = src.lines;
            if (lines[line - 1] && lines[line - 1].includes('html-escape-allow')) return true;
            if (lines[line] && lines[line].includes('html-escape-allow')) return true;
            return false;
        }

        return {
            TemplateLiteral(node) {
                node.quasis.forEach((q, i) => {
                    if (i >= node.expressions.length) return;
                    // 必须用「累积到本插值为止」的文本：模板字符串常有多个插值，
                    // 而开标签只存在于第一个 quasi 里。若只看当前 quasi，
                    // 第二个及之后的插值（属性片段）永远匹配不到 <，会被整体漏检。
                    const raw = accumulated(node, i);
                    if (!ATTR_OPEN.test(raw)) return;

                    const expr = node.expressions[i];
                    if (isEscaped(expr) || isSafeStatic(expr)) return;

                    const exprText = src.getText(expr);
                    if (allowedHere.has(exprText)) return;

                    const line = expr.loc.start.line;
                    if (hasInlineAllow(line)) return;

                    ctx.report({
                        node: expr,
                        message:
                            `属性 \`${attrName(raw)}\` 的值来自未转义插值 \`${exprText}\`。` +
                            `属性上下文必须用 escapeHtmlAttr（escapeHtml 不转义引号，会被闭合后注入事件处理器）。` +
                            `确认该值不可能来自用户数据时，可用 html-escape-allow.json 按「文件 → 表达式」豁免，` +
                            `或在本行加 // html-escape-allow 注释。`,
                    });
                });
            },
        };
    },
});

function loadAllow() {
    if (!fs.existsSync(ALLOW_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(ALLOW_FILE, 'utf8'));
    } catch (e) {
        console.error(`❌ 无法解析 ${path.relative(ROOT, ALLOW_FILE)}: ${e.message}`);
        process.exit(1);
    }
}

function collectFiles(dir, acc = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'tests') continue; // 测试桩里的模板字面量不约束
            collectFiles(p, acc);
        } else if (entry.name.endsWith('.js')) {
            acc.push(p);
        }
    }
    return acc;
}

const reportOnly = process.argv.includes('--report');

/**
 * 视图级依赖闸门：HTML 入口必须加载 htmlUtils.js。
 *
 * 【为什么需要这一条】本仓库所有模块都走「先加载 htmlUtils.js，再用裸全局
 * （window.HTMLUtils / escapeHtml / num）」的约定——全仓 0 个模块 import 它。
 * 于是「某个视图忘了引入 htmlUtils.js」这类错误，lint / 单测 / 属性转义闸门
 * **全都发现不了**（它们不关心视图的 script 清单），只会在用户打开该视图时
 * 抛 ReferenceError。2026-10-06 就因此让画中卷报「num is not defined」并回退香道。
 *
 * 局限：只检查 HTML 里显式列出的 script，不追踪 import 图。当前仓库无模块
 * import htmlUtils，故显式清单即完整；若将来改为 import，本检查需相应调整。
 */
const VIEW_ENTRIES = ['index.html', 'archive-src.html', 'scroll-src.html', 'module-src.html'];
const HTMLUTILS = 'utils/htmlUtils.js';
/** 裸全局使用（前面不能有 `.`，以免误命中成员访问） */
const USES_GLOBAL = /(?<![.\w$])(?:HTMLUtils\s*\.|escapeHtml\s*\(|escapeHtmlAttr\s*\(|\bnum\s*\()/;

function checkViewDependencies() {
    const problems = [];
    for (const entry of VIEW_ENTRIES) {
        const abs = path.join(ROOT, 'webapp', entry);
        if (!fs.existsSync(abs)) continue;
        const html = fs.readFileSync(abs, 'utf8');
        const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
        if (scripts.some((s) => s.includes(HTMLUTILS))) continue;
        for (const src of scripts) {
            if (!src.startsWith('assets/scripts/')) continue;
            const file = path.join(ROOT, 'webapp', src.replace(/\?.*$/, ''));
            if (!fs.existsSync(file)) continue;
            if (!USES_GLOBAL.test(fs.readFileSync(file, 'utf8'))) continue;
            problems.push({ entry, file: path.relative(ROOT, file) });
            break; // 每个视图只报首个使用者，避免刷屏
        }
    }
    return problems;
}

/**
 * 自检用例 —— 闸门自身的回归测试。
 * 背景：本闸门若误报会让团队养成忽略它的习惯，若漏报则等于没有闸门；
 * 因此「拦该拦的、放该放的」这两侧都必须有可执行断言，不能靠人工抽查。
 */
const SELF_TEST = [
    { code: '`<div title="${o.name}">`', expect: 'catch', why: '未转义的成员访问' },
    { code: '`<div title="${escapeHtml(o.name)}">`', expect: 'catch', why: 'escapeHtml 不转义引号' },
    { code: "`<div title='${o.name}'>`", expect: 'catch', why: '单引号属性同样需转义' },
    { code: '`<div class="x ${cls}">`', expect: 'catch', why: 'class 属性值中间插值' },
    { code: '`<div class="a ${b} ${c}" data-x="${d}">`', expect: 'catch', why: '同属性多个插值只报首个' },
    { code: '`<div class="x ${cond ? o.name : \'\'}">`', expect: 'catch', why: '三元分支含用户数据' },
    { code: '`<div style="color:${\'px\' + o.name}">`', expect: 'catch', why: '字符串拼接含用户数据' },
    { code: '`<div class="x ${o.name || \'\'}">`', expect: 'catch', why: '|| 兜底不改变风险' },
    { code: '`<div class="x ${o.name}">` // html-escape-allow', expect: 'pass', why: '行内豁免注释' },
    { code: '`<div title="${HTMLUtils.escapeHtmlAttr(o.name)}">`', expect: 'pass', why: '已用批准函数' },
    { code: '`<div class="x ${cond ? \'lit\' : \'\'}">`', expect: 'pass', why: '两分支皆字面量' },
    { code: '`<div style="width:${w / total * 100}%">`', expect: 'pass', why: '算术结果必为数值' },
    { code: '`<div class="x ${-n}">`', expect: 'pass', why: '一元运算结果为原始值' },
    { code: '`<div>文本 ${o.name} 未闭合</div>`', expect: 'pass', why: '文本上下文不属属性' },
    { code: '`<span class="x">他说 "你好 ${o.name}"</span>`', expect: 'pass', why: '已闭合属性后的文本不误报' },
    { code: '`<div class="x ${a || HTMLUtils.escapeHtmlAttr(b)}">`', expect: 'pass', why: '|| 兜底到已转义值' },
    { code: '`<div style="width:${Math.min(a, 100)}%">`', expect: 'pass', why: 'Math.* 恒返回数值' },
    { code: '`<div style="width:${num(v)}%">`', expect: 'pass', why: 'num() 数值强制器' },
    { code: 'const c={s:"#fff"};`<b style="color:${c.s}"></b>`', expect: 'pass', why: 'const 对象字面量的属性链' },
    { code: 'const L={SPEC:{F:"none"}};`<b fill="${this.SPEC.F}"></b>`', expect: 'pass', why: '二级嵌套常量对象（this. 前缀）' },
    { code: 'l.map((it,i)=>`<b data-i="${i}"></b>`)', expect: 'pass', why: 'map 回调索引参数' },
    { code: '`<div style="width:${num(userInput)}%">`', expect: 'pass', why: 'num() 包裹任意值仍安全' },
    { code: '`<b data-x="${cols[key]}">`', expect: 'catch', why: '计算属性不能溯源，仍需转义' },
    // ↓ 以下两例针对「多插值模板」的历史盲区：开标签只在 quasi[0]，
    //   若按单个 quasi 判定，第二个及之后的插值会整体漏检。
    { code: '`<div data-a="${p}" data-b="${q}">`', expect: 'catch', why: '同一模板的第二个插值也要检查' },
    { code: '`<div class="a ${p}" data-b="${q}">`', expect: 'catch', why: '跨 quasi 累积标签上下文' },
];

function runSelfTest() {
    let failed = 0;
    for (const t of SELF_TEST) {
        const messages = linter.verify(t.code, {
            parserOptions: { ecmaVersion: 2020, sourceType: 'module', range: true },
            rules: { [RULE_ID]: 'error' },
        }, '__self_test__.js');
        const caught = messages.some((m) => !m.fatal);
        const actual = caught ? 'catch' : 'pass';
        if (actual !== t.expect) {
            failed++;
            console.error(`  ✗ ${t.why}：期望 ${t.expect}，实际 ${actual}`);
            console.error(`    ${t.code}`);
        }
    }
    if (failed) {
        console.error(`\n❌ 闸门自检失败：${failed}/${SELF_TEST.length} 项不符合预期\n`);
        process.exit(1);
    }
    console.log(`✅ 闸门自检通过：${SELF_TEST.length} 项检出/放行行为均符合预期。`);
}

if (process.argv.includes('--self-test')) {
    runSelfTest();
    process.exit(0);
}

const allow = loadAllow();
const files = collectFiles(SCAN_ROOT);
const violations = [];

for (const abs of files) {
    const rel = path.relative(ROOT, abs);
    const messages = linter.verify(fs.readFileSync(abs, 'utf8'), {
        parserOptions: { ecmaVersion: 2020, sourceType: 'module', range: true },
        rules: { [RULE_ID]: ['error', { [rel]: allow[rel] || [] }] },
    }, rel);
    for (const m of messages) {
        if (m.fatal) continue;
        violations.push({ rel, line: m.line, attr: attrName(m.message), message: m.message });
    }
}

const viewProblems = checkViewDependencies();

if (reportOnly) {
    console.log(`扫描 ${files.length} 个文件，未转义属性插值命中 ${violations.length} 处\n`);
    const byFile = new Map();
    for (const v of violations) {
        if (!byFile.has(v.rel)) byFile.set(v.rel, []);
        byFile.get(v.rel).push(v);
    }
    for (const [f, list] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
        console.log(`${f}  (${list.length})`);
        for (const v of list) {
            console.log(`  ${String(v.line).padStart(5)}  ${v.message.split('。')[0]}`);
        }
    }
    console.log(`\n视图依赖检查：${viewProblems.length === 0 ? '通过' : viewProblems.length + ' 个视图缺少 htmlUtils.js'}`);
    for (const p of viewProblems) console.log(`  ❌ ${p.entry} 未加载 htmlUtils.js，但 ${p.file} 依赖其全局`);
    process.exit(0);
}

if (violations.length > 0) {
    console.error(`\n❌ 属性转义闸门未通过：${violations.length} 处未转义（扫描 ${files.length} 个文件）\n`);
    for (const v of violations) {
        console.error(`  ${v.rel}:${v.line}`);
        console.error(`    ${v.message}\n`);
    }
    console.error('修复：属性位置改用 HTMLUtils.escapeHtmlAttr(...)；');
    console.error('若该值可证明非用户数据，在 scripts/html-escape-allow.json 按「文件 → 表达式」登记豁免。\n');
}

if (viewProblems.length > 0) {
    console.error(`❌ 视图依赖闸门未通过：${viewProblems.length} 个 HTML 入口缺少 ${HTMLUTILS}\n`);
    for (const p of viewProblems) {
        console.error(`  ${p.entry}  ← ${p.file} 使用了 HTMLUtils/escapeHtml/num 等全局`);
    }
    console.error(`\n修复：在该 HTML 的 <script> 清单中加入 assets/scripts/${HTMLUTILS}?__BUILD__`);
    console.error('（本仓库约定：htmlUtils.js 提供裸全局，无任何模块 import 它，故每个视图都须显式引入）\n');
}

if (violations.length > 0 || viewProblems.length > 0) {
    process.exit(1);
}

console.log(`✅ 属性转义闸门通过：${files.length} 个文件的属性插值均已转义或登记豁免；4 个视图的 htmlUtils 依赖齐备。`);
