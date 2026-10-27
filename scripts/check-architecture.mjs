#!/usr/bin/env node
/**
 * check:architecture —— 模块图门禁（dependency-cruiser）
 *
 * 其余门禁都在查「名字」：导出有没有人用、方法有没有人调、CSS 类有没有人挂。
 * 它们都看不见「文件之间还连不连得上」。这个门禁补的就是这一层：
 *
 *   - no-circular      循环依赖（一旦形成，任何一侧都无法单独加载）
 *   - no-unresolvable  import 指向不存在的文件/包
 *   - isolated         既没人 import、自己也不 import 任何东西的孤岛文件
 *   - unreachable      从入口出发走不到的模块（自己 import 了一堆东西，但没人引它）
 *   - 入口自身         HTML 里 <script src> 指向的文件必须存在
 *
 * 不用 dependency-cruiser 自带的 no-orphans：它的 orphan 是「无出边且无入边」，
 * 而本仓大量模块由 HTML 的 <script> 直接加载、靠 window 桥互相消费，既没有 import
 * 也没有被 import，会被整片误判。这里改用入口出发的 BFS 判定可达性，口径统一、
 * 且能区分「完全孤岛」与「漏接线」两种不同的修法。
 *
 * 入口的定义是本门禁的关键：源页面的 <script src> 列表 + Obsidian 插件入口 main.ts。
 * 少了它，所有被 HTML 直接加载的模块（bootstrap、各 feature）都会被当成孤儿。
 * 构建产物（app.html 等）不参与——它们内联了全部源码，只会重复计数。
 *
 * 用法：
 *   node scripts/check-architecture.mjs
 *   node scripts/check-architecture.mjs --verbose   # 打印全部可达性统计
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_PATH = path.join(ROOT, 'scripts', 'architecture-baseline.json');

// 源页面：入口脚本就从这些文件里读；构建产物不含入口信息，跳过
const SOURCE_PAGES = ['index.html', 'scroll-src.html', 'archive-src.html', 'module-src.html'];
const PLUGIN_ENTRY = 'main.ts';
const CRUISE_TARGETS = ['webapp/assets/scripts', 'src', PLUGIN_ENTRY];
const EXCLUDE_TESTS = { path: '(^|/)(tests?|__tests__)/' };

let cruise;
try {
    ({ cruise } = await import('dependency-cruiser'));
} catch {
    console.error('缺少 dependency-cruiser：npm i -D dependency-cruiser');
    process.exit(1);
}

/** 从源页面的 <script src> 收集入口（去掉 ?__BUILD__ 查询串与 ./ 前缀） */
function collectEntries() {
    const entries = new Map(); // source -> 来源页面
    const missing = [];
    for (const page of SOURCE_PAGES) {
        const file = path.join(ROOT, 'webapp', page);
        if (!fs.existsSync(file)) continue;
        const html = fs.readFileSync(file, 'utf8');
        for (const m of html.matchAll(/<script[^>]*\ssrc="([^"?#]+)/g)) {
            const rel = `webapp/${m[1].replace(/^\.?\//, '')}`;
            if (!fs.existsSync(path.join(ROOT, rel))) {
                missing.push({ source: rel, page });
                continue;
            }
            if (!entries.has(rel)) entries.set(rel, page);
        }
    }
    entries.set(PLUGIN_ENTRY, 'esbuild.config.mjs');
    return { entries, missing };
}

const { entries, missing } = collectEntries();

const { output } = await cruise(CRUISE_TARGETS, {
    // 编程接口默认不开规则校验（只有 CLI 默认开），漏掉这一行 ruleSet 会全程静默通过
    validate: true,
    exclude: EXCLUDE_TESTS,
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    ruleSet: {
        forbidden: [
            { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
            { name: 'no-unresolvable', severity: 'error', from: {}, to: { couldNotResolve: true } },
        ],
    },
});

const modules = output.modules;
const bySource = new Map(modules.map((m) => [m.source, m]));
const inTree = (source) => /^(webapp\/assets\/scripts\/|src\/)/.test(source) || source === PLUGIN_ENTRY;

// ── 可达性：从入口出发做一次 BFS（dependency-cruiser 的 orphan 只看「完全孤立」） ──
const reachable = new Set();
const queue = [...entries.keys()].filter((e) => bySource.has(e));
while (queue.length) {
    const source = queue.pop();
    if (reachable.has(source)) continue;
    reachable.add(source);
    for (const dep of bySource.get(source)?.dependencies || []) {
        if (dep.resolved && bySource.has(dep.resolved) && !reachable.has(dep.resolved)) queue.push(dep.resolved);
    }
}
// 区分两种不可达：完全孤岛（连出边都没有）与「有依赖但没人引」——后者往往是漏接线
const unreachable = modules
    .filter((m) => inTree(m.source) && !reachable.has(m.source) && !entries.has(m.source))
    .map((m) => ({ source: m.source, isolated: m.dependencies.length === 0 }));

// ── 违规整理 ──
const violations = [];
for (const v of output.summary.violations) {
    const rule = v.rule.name;
    const from = v.from;
    const to = v.to;
    // 外部包（obsidian 等）解析失败不算本仓问题
    if (rule === 'no-unresolvable' && !inTree(to) && !to.startsWith('.')) continue;
    violations.push({ rule, from, to, kind: 'graph' });
}
for (const { source, isolated } of unreachable) {
    violations.push({ rule: isolated ? 'isolated' : 'unreachable', from: source, to: '', kind: 'reachability' });
}
for (const m of missing) violations.push({ rule: 'missing-entry', from: m.source, to: m.page, kind: 'entry' });

// ── 基线 ──
const baseline = fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')) : { allowed: [] };
const allowed = new Map((baseline.allowed || []).map((e) => [`${e.rule}:${e.from}`, e]));
const fresh = violations.filter((v) => !allowed.has(`${v.rule}:${v.from}`));
const stale = [...allowed.keys()].filter((key) => !violations.some((v) => key === `${v.rule}:${v.from}`));

const describe = (v) => {
    switch (v.rule) {
        case 'no-circular':
            return `循环依赖：${v.from} → ${v.to}`;
        case 'no-unresolvable':
            return `无法解析的引用：${v.from} → ${v.to}`;
        case 'no-orphans':
            return `孤岛文件（无人 import，自身也不 import 任何模块）：${v.from}`;
        case 'isolated':
            return `孤岛文件（无人 import，自身也不 import 任何模块）：${v.from}`;
        case 'unreachable':
            return `从入口不可达（有人可用但没人引）：${v.from}`;
        case 'missing-entry':
            return `HTML 引用了不存在的脚本：${v.from}（${v.to}）`;
        default:
            return `${v.rule}: ${v.from} → ${v.to}`;
    }
};

if (process.argv.includes('--verbose')) {
    console.log(`入口 ${entries.size} 个，模块 ${modules.length} 个，可达 ${reachable.size} 个`);
    for (const [source, page] of entries) console.log(`  entry  ${source}  ← ${page}`);
}

if (fresh.length) {
    console.error(`✗ check:architecture 发现 ${fresh.length} 处模块图问题：\n`);
    for (const v of fresh) console.error(`  ${describe(v)}`);
    console.error('\n修法：接线或删除孤立模块；确属已知问题则写入 scripts/architecture-baseline.json（需写 reason）。');
}
if (stale.length) {
    console.error('✗ check:architecture 基线已失效（问题已消失，请移除条目）：');
    for (const key of stale) console.error(`  ${key}`);
}
if (fresh.length || stale.length) process.exit(1);

console.log(
    `✓ check:architecture 通过（入口 ${entries.size} / 模块 ${modules.length} / 可达 ${reachable.size}，基线豁免 ${allowed.size}）`,
);
