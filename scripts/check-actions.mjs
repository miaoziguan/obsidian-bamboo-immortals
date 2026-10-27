#!/usr/bin/env node
/**
 * check:actions —— data-action 双向门禁
 *
 * 现有门禁都在查「名字有没有被提到」，唯独 data-action 这条契约没人守：
 * 模板渲染了 data-action="x"，但没有任何代码按这个名字接线 → 按钮点了没反应；
 * ActionDispatcher 注册了 x，但永远没有元素带这个属性 → 死注册。
 *
 * A 方向（死控件）：data-action="x" 存在，但全仓没有「按名字」的接线证据。
 * B 方向（死注册）：ActionDispatcher 注册了 x，但全仓没有 data-action="x"，
 *                   也没有把 x 当字符串动态拼进模板的迹象。
 *
 * 判定只用「全仓只出现这一处」这种硬证据，与 check-dead-methods 同哲学：
 * 可能漏（动态渲染/前缀委托识别不全），但不会误伤。
 *
 * 用法：
 *   node scripts/check-actions.mjs               # 门禁（有新增即 exit 1）
 *   node scripts/check-actions.mjs --list        # 只列全部发现，不判基线
 *   node scripts/check-actions.mjs --update      # 把当前发现写入基线（人工确认后使用）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEBAPP = path.join(ROOT, 'webapp');
const BASELINE_PATH = path.join(ROOT, 'scripts', 'actions-baseline.json');

// 构建产物：内联了全部源码，会与源文件重复计数
const BUILT_PAGES = new Set(['app.html', 'scroll.html', 'archive.html', 'module.html']);
const SKIP_DIRS = new Set(['tests', '__tests__', 'node_modules', '.git']);

const walk = (dir, out = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.(js|ts|html)$/.test(entry.name)) out.push(full);
    }
    return out;
};

const files = [
    ...walk(path.join(WEBAPP, 'assets', 'scripts')),
    ...fs.readdirSync(WEBAPP)
        .filter((f) => f.endsWith('.html') && !BUILT_PAGES.has(f))
        .map((f) => path.join(WEBAPP, f)),
    ...walk(path.join(ROOT, 'src')),
].filter((f) => fs.existsSync(f));

const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const corpus = new Map(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));

/** 从 registerMany({ ... }) 的对象体里取顶层 key（跳过嵌套对象与方法体） */
function topLevelKeys(body) {
    const keys = [];
    let depth = 0;
    let i = 0;
    const n = body.length;
    while (i < n) {
        const ch = body[i];
        if (ch === '/' && body[i + 1] === '/') {
            while (i < n && body[i] !== '\n') i++;
            continue;
        }
        if (ch === '/' && body[i + 1] === '*') {
            i += 2;
            while (i < n && !(body[i] === '*' && body[i + 1] === '/')) i++;
            i += 2;
            continue;
        }
        if (ch === '"' || ch === "'" || ch === '`') {
            const quote = ch;
            let j = i + 1;
            let str = '';
            while (j < n && body[j] !== quote) {
                if (body[j] === '\\') j++;
                str += body[j];
                j++;
            }
            i = j + 1;
            if (depth === 0) {
                let k = i;
                while (k < n && /\s/.test(body[k])) k++;
                if (body[k] === ':') keys.push({ key: str, offset: k });
            }
            continue;
        }
        if (ch === '{' || ch === '(' || ch === '[') {
            depth++;
            i++;
            continue;
        }
        if (ch === '}' || ch === ')' || ch === ']') {
            depth--;
            i++;
            continue;
        }
        if (depth === 0 && /[A-Za-z_$]/.test(ch)) {
            let j = i;
            while (j < n && /[\w$]/.test(body[j])) j++;
            const ident = body.slice(i, j);
            let k = j;
            while (k < n && /\s/.test(body[k])) k++;
            if (body[k] === ':' && body[k + 1] !== ':') keys.push({ key: ident, offset: k });
            i = j;
            continue;
        }
        i++;
    }
    return keys;
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const registrations = new Map(); // name -> { file, line }
const rendered = new Map(); // name -> { file, line }
let dynamicSites = 0;

for (const [file, text] of corpus) {
    if (/\.[jt]s$/.test(file)) {
        for (const m of text.matchAll(/ActionDispatcher\.registerMany\(\s*\{([\s\S]*?)\n\s*\}\s*\)/g)) {
            const base = m.index + m[0].indexOf('{') + 1;
            for (const { key, offset } of topLevelKeys(m[1])) {
                if (!registrations.has(key)) {
                    registrations.set(key, { file: rel(file), line: lineOf(text, base + offset) });
                }
            }
        }
        for (const m of text.matchAll(/ActionDispatcher\.register\(\s*['"]([^'"]+)['"]/g)) {
            if (!registrations.has(m[1])) {
                registrations.set(m[1], { file: rel(file), line: lineOf(text, m.index) });
            }
        }
    }
    // 只统计渲染侧（HTML 模板字符串与 .html），TS 不渲染
    if (/\.ts$/.test(file)) continue;
    for (const m of text.matchAll(/data-action\s*=\s*(?:"([^"$\s]+)"|'([^'$\s]+)')/g)) {
        const name = m[1] || m[2];
        if (!rendered.has(name)) rendered.set(name, { file: rel(file), line: lineOf(text, m.index) });
    }
    dynamicSites += (text.match(/data-action\s*=\s*(?:"[^"]*\$\{|'[^']*\$\{|`)/g) || []).length;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 是否有「按名字接线」的代码（选择器 / 前缀委托 / switch / 比较 / dispatch） */
function wiringOf(name) {
    const re = escapeRe(name);
    const patterns = [
        [`[data-action="${name}"]`, new RegExp(`\\[data-action\\s*=\\s*["']${re}["']\\]`)],
        [`case '${name}'`, new RegExp(`case\\s+["']${re}["']`)],
        [`=== '${name}'`, new RegExp(`[=!]==?\\s*["']${re}["']`)],
        [`dispatch('${name}')`, new RegExp(`dispatch\\(\\s*["']${re}["']`)],
    ];
    for (const [label, pattern] of patterns) {
        for (const [, text] of corpus) if (pattern.test(text)) return label;
    }
    // 前缀委托：data-action^="archive-" 覆盖 archive-restore 这类
    for (const [, text] of corpus) {
        for (const m of text.matchAll(/data-action\s*\^=\s*["']([^"']+)["']/g)) {
            if (name.startsWith(m[1])) return `data-action^="${m[1]}"`;
        }
    }
    return null;
}

/** 除「渲染属性」与「注册行」之外，这个名字是否还被别处引用（动态拼接的迹象） */
function otherMentions(name, exclude) {
    const re = new RegExp(`["'\`]${escapeRe(name)}["'\`]`);
    const attr = new RegExp(`data-action\\s*=\\s*["']${escapeRe(name)}["']`);
    const hits = [];
    for (const [file, text] of corpus) {
        if (!text.includes(name)) continue;
        text.split('\n').forEach((line, i) => {
            if (!re.test(line)) return;
            if (attr.test(line) && !/\[data-action|closest|matches/.test(line)) return; // 纯渲染属性
            if (exclude.file === rel(file) && exclude.line === i + 1) return; // 注册行自身
            hits.push(`${rel(file)}:${i + 1}`);
        });
    }
    return hits;
}

const deadControls = [];
for (const [name, where] of rendered) {
    if (registrations.has(name)) continue;
    if (wiringOf(name)) continue;
    const mentions = otherMentions(name, { file: where.file, line: -1 });
    if (mentions.length) continue; // 按名字被引用过（可能在别处补了监听）
    deadControls.push({ name, ...where });
}

const deadRegistrations = [];
for (const [name, where] of registrations) {
    if (rendered.has(name)) continue;
    const mentions = otherMentions(name, where);
    if (mentions.length) continue; // 可能被数据表动态拼进 data-action="${...}"
    deadRegistrations.push({ name, ...where });
}

const baseline = fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')) : {};
const known = new Map([
    ...(baseline.deadControls || []).map((e) => [`control:${e.name}`, e]),
    ...(baseline.deadRegistrations || []).map((e) => [`registration:${e.name}`, e]),
]);

const listOnly = process.argv.includes('--list');
const updateMode = process.argv.includes('--update');

if (updateMode) {
    const next = {
        _doc: 'check:actions 基线。每条都必须写清楚为什么暂不修，修好后请删除对应条目（门禁会因条目失效而报错）。',
        deadControls: deadControls.map((e) => ({ ...e, reason: known.get(`control:${e.name}`)?.reason || '' })),
        deadRegistrations: deadRegistrations.map((e) => ({ ...e, reason: known.get(`registration:${e.name}`)?.reason || '' })),
    };
    fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`已写入基线：死控件 ${deadControls.length}，死注册 ${deadRegistrations.length}`);
    process.exit(0);
}

const findings = [
    ...deadControls.map((e) => ({ kind: 'control', ...e })),
    ...deadRegistrations.map((e) => ({ kind: 'registration', ...e })),
];

if (listOnly) {
    console.log(`注册 ${registrations.size} 个 action，静态渲染 ${rendered.size} 个，动态模板 ${dynamicSites} 处`);
    for (const f of findings) {
        const label = f.kind === 'control' ? '[死控件] 点了没反应' : '[死注册] 永不触发';
        console.log(`  ${label}  ${f.name}  ${f.file}:${f.line}`);
    }
    process.exit(0);
}

const fresh = findings.filter((f) => !known.has(`${f.kind}:${f.name}`));
const stale = [...known.keys()].filter(
    (key) => !findings.some((f) => key === `${f.kind}:${f.name}`),
);
const waived = findings.length - fresh.length;

if (fresh.length) {
    console.error('✗ check:actions 发现未登记的接线断点：\n');
    for (const f of fresh) {
        const hint =
            f.kind === 'control'
                ? `渲染了 data-action="${f.name}"，但没有任何 handler/选择器/case 接住它`
                : `ActionDispatcher 注册了 "${f.name}"，但全仓没有元素渲染这个 action`;
        console.error(`  ${f.file}:${f.line}  ${f.name}\n    ${hint}`);
    }
    console.error('\n修法：接线，或删掉无用的 data-action / 注册项；确属已知问题则写入 scripts/actions-baseline.json 并注明 reason。');
}
if (stale.length) {
    console.error('✗ check:actions 基线已失效（对应问题已消失，请移除条目）：\n');
    for (const key of stale) console.error(`  ${key}`);
}
if (fresh.length || stale.length) process.exit(1);

console.log(
    `✓ check:actions 通过（注册 ${registrations.size} / 渲染 ${rendered.size} / 动态模板 ${dynamicSites}，基线豁免 ${waived}）`,
);
