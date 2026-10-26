#!/usr/bin/env node
/**
 * 运行时覆盖率 × 文本引用 交集扫描（死代码的「运行时证据」）
 *
 * 为什么需要它：check-dead-exports / check-dead-methods 都是**文本计数**——
 * 「代码里有没有人提到这个名字」。它们看不见两件事：
 *   ① 可达性（有人提到 ≠ 能走到；例如 handler 注册了但模板永远不产生该按钮）
 *   ② 动态派发（`this[action]()`、data-action 字符串、CustomEvent 名）
 * 本脚本用 CDP 精确覆盖率（每个函数被调用几次）给出**执行证据**：
 *   A. 零执行 + 文本零引用 → 双重证据的死代码（高置信）
 *   B. 仅零执行        → 文本有引用但本次流程没走到（多为未覆盖路径，不能据此删）
 *
 * 用法：
 *   node scripts/scan-runtime-coverage.mjs                    # 全视图（约 40s）
 *   node scripts/scan-runtime-coverage.mjs --only-app          # 只扫首页
 *   node scripts/scan-runtime-coverage.mjs --json=/tmp/cov.json
 *   node scripts/scan-runtime-coverage.mjs --root=<git工作树>  # 事后验证某历史版本的删除决策
 *
 * 依赖：playwright（**非项目依赖**，按需安装）
 *   npm i -D playwright && npx playwright install chromium
 *
 * 为什么加载 `*-src.html` 而不是 app.html：
 *   构建产物 app.html 把所有 JS 内联成一个 bundle（url 为空、无 sourcemap），
 *   覆盖率无法映射回源文件。源页面按模块逐个加载，url 即文件路径。
 *   代价：file:// 下浏览器禁止加载 ESM（CORS），所以必须起一个静态服务器。
 *
 * 已知局限（读结论前必看）：
 *   1. 覆盖率取决于流程厚度。空 vault 下大量渲染/编辑分支不会执行，
 *      因此 B 组数量大不等于「死」，只等于「没走到」。
 *   2. 流程本身有非确定性（异步恢复与 bridge 超时竞态），同一版本两次运行
 *      exec 计数会有 ±1% 抖动；判断单个方法是否「从未执行」时，建议连跑两次取交集。
 *   3. 画中卷（scroll 页）默认挂「香道」，打字机需显式 `_mountTypewriter()` 才会挂载，
 *      本脚本已代劳；否则整个 typewriter/mindmap 子系统会假装「零执行」。
 */
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.SCAN_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEBAPP = path.join(ROOT, 'webapp');
const JSON_OUT = (process.argv.find((a) => a.startsWith('--json=')) || '').split('=')[1] || '';
const ONLY_APP = process.argv.includes('--only-app');
const VIEWS = ONLY_APP ? ['index.html'] : ['index.html', 'scroll-src.html', 'archive-src.html', 'module-src.html'];

const DECL = /^\s*(?:async\s+)?(?:\*\s*)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*$/;
const FN = /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/;
const ARROW = /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/;

// ── 静态服务器（file:// 下 ESM 会被 CORS 拦死，必须走 http）──
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
};

function startServer() {
    const server = http.createServer((req, res) => {
        const urlPath = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
        const abs = path.join(WEBAPP, urlPath === '/' ? '/index.html' : urlPath);
        if (!abs.startsWith(WEBAPP)) {
            res.writeHead(403).end('forbidden');
            return;
        }
        fs.readFile(abs, (err, buf) => {
            if (err) {
                res.writeHead(404).end('not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream' });
            res.end(buf);
        });
    });
    return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

// playwright 有意**不进 devDependencies**（否则 CI 每次 npm ci 都要拖浏览器）。
// 优先用本仓库已装的；否则用 PLAYWRIGHT_HOME 指向任意装了 playwright 的目录。
let chromium;
const tryLoad = (base) => {
    try {
        return createRequire(path.join(base, 'package.json'))('playwright').chromium;
    } catch {
        return null;
    }
};
chromium = tryLoad(ROOT) || (process.env.PLAYWRIGHT_HOME ? tryLoad(process.env.PLAYWRIGHT_HOME) : null);
if (!chromium) {
    console.error(
        '缺少 playwright（非项目依赖）。任选其一：\n' +
            '  npm i --no-save playwright && npx playwright install chromium\n' +
            '  PLAYWRIGHT_HOME=<已装 playwright 的目录> node scripts/scan-runtime-coverage.mjs',
    );
    process.exit(1);
}

const srcCache = new Map();
function readSrc(rel) {
    if (!srcCache.has(rel)) {
        const p = path.join(WEBAPP, rel);
        srcCache.set(rel, fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
    }
    return srcCache.get(rel);
}

/** 从偏移量回溯找最近的声明行（覆盖率的匿名函数只有 offset，没有名字） */
function nameAt(src, offset) {
    if (!src) return null;
    const line = src.slice(0, offset).split('\n').length;
    const lines = src.split('\n');
    for (let d = 0; d <= 2; d++) {
        const l = lines[line - 1 - d];
        if (l === undefined) continue;
        const m = l.match(DECL) || l.match(FN) || l.match(ARROW);
        if (m) return { name: m[1], line: line - d };
    }
    return { name: null, line };
}

const agg = new Map();
function addFn(rel, name, line, count) {
    const key = `${rel}|${name}|${line}`;
    const cur = agg.get(key);
    if (!cur) agg.set(key, { rel, name, line, count });
    else cur.count = Math.max(cur.count, count);
}

const { server, port } = await startServer();
const BASE = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();
const flowStats = [];

for (const view of VIEWS) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 220)));
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Debugger.enable');
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.startPreciseCoverage', { callCount: true, detailed: true });

    await page.goto(`${BASE}/${view}`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__bambooShadowRoot, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(500);

    // ① 派发全部已注册 action —— 覆盖 data-action 字符串派发空间（文本扫描唯一的线索）
    const info = await page.evaluate(async () => {
        const sr = window.__bambooShadowRoot;
        const acts = Object.keys(window.ActionDispatcher?._handlers || {});
        if (!sr) return { acts: acts.length, errs: ['no-shadow-root'] };
        const host = document.createElement('div');
        host.id = '__cov_host';
        host.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;';
        sr.appendChild(host);
        const errs = [];
        for (const a of acts) {
            try {
                host.innerHTML = '';
                const btn = document.createElement('button');
                btn.setAttribute('data-action', a);
                host.appendChild(btn);
                btn.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
                await new Promise((r) => setTimeout(r, 30));
            } catch {
                errs.push(a);
            }
        }
        host.remove();
        return { acts: acts.length, errs };
    });
    await page.waitForTimeout(300);

    // ② 广度点击页面上真实出现的 [data-action]（面板展开后新出现的按钮也要点到，3 轮）
    info.uiClicks = await page.evaluate(async () => {
        const sr = window.__bambooShadowRoot;
        if (!sr) return 0;
        let clicked = 0;
        for (let round = 0; round < 3; round++) {
            const els = Array.from(sr.querySelectorAll('[data-action]')).filter((e) => !e.getAttribute('data-cov-clicked'));
            if (!els.length) break;
            for (const el of els.slice(0, 80)) {
                el.setAttribute('data-cov-clicked', '1');
                try {
                    el.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
                } catch {
                    /* 单个按钮失败不影响整体流程 */
                }
                clicked++;
                await new Promise((r) => setTimeout(r, 25));
            }
        }
        return clicked;
    });
    await page.waitForTimeout(200);

    // ③ 领域 flow：画中卷三档（便签/写作/导图）——空 vault 下没有任何 action 能触发它们
    let domain = null;
    if (view.startsWith('scroll')) {
        domain = await page
            .evaluate(async () => {
                const Tw = window.TypewriterFeature;
                if (!Tw) return { ok: false, reason: 'no-tw' };
                // scroll 页默认挂「香道」；打字机在生产由宿主 scroll:feature 注入，这里显式挂载
                if (!Tw._input && window.ScrollManager && window.ScrollManager._mountTypewriter) {
                    Promise.resolve(window.ScrollManager._mountTypewriter()).catch(() => {});
                    await new Promise((r) => setTimeout(r, 800));
                }
                if (!Tw._input) return { ok: false, reason: 'mount-failed' };
                const log = { notes: 0, write: 0, mm: 0, restoring: !!Tw._restoring };
                // 恢复期挂起 → 补打：无宿主时 restore 长挂，正好覆盖这两条分支
                if (Tw._restoring) {
                    Tw._input.value = '恢复期输入';
                    Tw._commitInput();
                    await new Promise((r) => setTimeout(r, 120));
                    Tw._restoring = false;
                    if (typeof Tw._flushPendingPrint === 'function') Tw._flushPendingPrint();
                    await new Promise((r) => setTimeout(r, 120));
                }
                const commit = (txt) => {
                    Tw._input.value = txt;
                    Tw._commitInput();
                };
                const samples = [
                    '早课：吐纳三十息',
                    '夜读《冲虚真经》第三章\n※ 注意心法与呼吸的配合',
                    '# 带井号前缀的便签',
                    '长文压测 ' + '竹叶飘零 '.repeat(120),
                    '符号 & <tag> "quote" https://example.com 测试',
                ];
                for (const s of samples) {
                    commit(s);
                    log.notes++;
                    await new Promise((r) => setTimeout(r, 40));
                }
                await Tw._setMode('write');
                commit('# 卷一\n\n## 第一幕\n- 要点一\n- 要点二\n\n## 第二幕\n正文段落。');
                commit('> 引用块');
                commit('普通段落 ' + 'y '.repeat(60));
                log.write = 3;
                await Tw._setMode('mindmap');
                for (const s of ['根节点', '子节点A', '子节点B']) {
                    Tw._input.value = s;
                    Tw._commitInput();
                    log.mm++;
                    await new Promise((r) => setTimeout(r, 40));
                }
                await Tw._setMode('notes');
                return { ok: true, log };
            })
            .catch((e) => ({ ok: false, reason: String(e).slice(0, 80) }));
        info.domain = domain;
        await page.waitForTimeout(300);

        // ④ 交互 flow：卡片拖拽 / 双击编辑 / 框选 / 滚轮缩放 / 删除
        try {
            const card = page.locator('.tw-card').first();
            if (await card.count()) {
                const bb = await card.boundingBox();
                if (bb) {
                    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(bb.x + bb.width / 2 + 60, bb.y + bb.height / 2 + 40, { steps: 8 });
                    await page.mouse.up();
                    await page.mouse.dblclick(bb.x + 12, bb.y + 12);
                    await page.waitForTimeout(120);
                    await page.keyboard.type('补写');
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(100);
                }
            }
            const canvas = page.locator('.tw-canvas').first();
            const cb = (await canvas.count()) ? await canvas.boundingBox() : null;
            if (cb) {
                await page.mouse.move(cb.x + 8, cb.y + cb.height - 8);
                await page.mouse.down();
                await page.mouse.move(cb.x + cb.width - 8, cb.y + 8, { steps: 10 });
                await page.mouse.up();
                await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
                await page.mouse.wheel(0, -240);
                await page.waitForTimeout(80);
                await page.mouse.down();
                await page.mouse.move(cb.x + cb.width / 2 + 50, cb.y + cb.height / 2 + 30, { steps: 6 });
                await page.mouse.up();
            }
            await page.keyboard.press('Delete');
            await page.waitForTimeout(80);
            await page.keyboard.press('Escape');
        } catch (e) {
            info.interactErr = String(e).slice(0, 80);
        }
        await page.waitForTimeout(400);
    }

    const { result } = await cdp.send('Profiler.takePreciseCoverage');
    await cdp.send('Profiler.stopPreciseCoverage');
    flowStats.push({
        view,
        actions: info.acts,
        uiClicks: info.uiClicks,
        actionErrs: info.errs.length,
        pageErrors: errors.length,
        errors,
    });

    for (const s of result) {
        if (!s.url || !s.url.includes('/assets/scripts/') || s.url.includes('/tests/')) continue;
        const rel = s.url.replace(`${BASE}/`, '').replace(/\?.*$/, '');
        const src = readSrc(rel);
        for (const f of s.functions) {
            const range = f.ranges && f.ranges[0];
            const cnt = (range && range.count) || 0;
            let name = f.functionName || null;
            let line = range ? src.slice(0, range.startOffset).split('\n').length : 0;
            if (!name && src && range) {
                const guess = nameAt(src, range.startOffset);
                if (guess && guess.name && guess.line >= line - 1) {
                    name = guess.name;
                    line = guess.line;
                }
            }
            // V8 会给内联回调合成 `x.addEventListener.passive` 这类名字，不是源码标识符，丢弃
            if (name !== '(module)' && (!name || !/^[A-Za-z_$][\w$]*$/.test(name))) continue;
            addFn(rel, name || '(anon)', line, cnt);
        }
    }
    await page.close();
}
await browser.close();
server.close();

// ── 文本语料（与 check-dead-methods 同口径：webapp JS + src TS + main.ts + 源视图 HTML）──
const prodFiles = [];
function walk(dir, out, exts) {
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (['tests', '__tests__', 'node_modules'].includes(e.name)) continue;
            walk(full, out, exts);
        } else if (exts.some((x) => e.name.endsWith(x))) out.push(full);
    }
    return out;
}
walk(path.join(WEBAPP, 'assets/scripts'), prodFiles, ['.js']);
walk(path.join(ROOT, 'src'), prodFiles, ['.ts']);
if (fs.existsSync(path.join(ROOT, 'main.ts'))) prodFiles.push(path.join(ROOT, 'main.ts'));
if (fs.existsSync(WEBAPP)) {
    for (const f of fs.readdirSync(WEBAPP)) if (f.endsWith('-src.html')) prodFiles.push(path.join(WEBAPP, f));
}

const corpus = [];
for (const p of prodFiles) {
    let t = '';
    try {
        t = fs.readFileSync(p, 'utf8');
    } catch {
        continue;
    }
    for (const l of t.split('\n')) if (!DECL.test(l)) corpus.push(l);
}

const named = [...agg.values()].filter((f) => f.name !== '(anon)' && f.name !== '(module)');
const executed = named.filter((f) => f.count > 0).length;
const zero = named.filter((f) => f.count === 0);
const rows = zero.map((f) => {
    const re = new RegExp('(?<![\\w$])' + f.name.replace(/[$]/g, '\\$') + '(?![\\w$])');
    return { ...f, refs: corpus.reduce((n, l) => (re.test(l) ? n + 1 : n), 0) };
});
const both = rows.filter((r) => r.refs === 0).sort((a, b) => a.rel.localeCompare(b.rel));
const covOnly = rows.filter((r) => r.refs > 0).sort((a, b) => a.refs - b.refs);

const fileStats = {};
for (const f of named) {
    const s = (fileStats[f.rel] = fileStats[f.rel] || { total: 0, exec: 0 });
    s.total++;
    if (f.count > 0) s.exec++;
}

console.log('=== 流程 ===');
for (const s of flowStats) {
    console.log(` ${s.view}: actions=${s.actions} uiClicks=${s.uiClicks ?? 0} actionErr=${s.actionErrs} pageErrors=${s.pageErrors}`);
    (s.errors || []).slice(0, 4).forEach((e) => console.log('   ! ' + String(e).slice(0, 110)));
}
console.log(`\n=== 命名函数 ${named.length} 个，执行过 ${executed} 个（${((executed / named.length) * 100).toFixed(1)}%），零执行 ${zero.length} 个 ===`);
console.log(`  A. 双重死（零执行 + 文本零引用）: ${both.length}`);
for (const r of both) console.log(`     ${r.rel}:${r.line}  ${r.name}`);
console.log(`  B. 仅运行时零执行（文本有引用，多为未覆盖路径，不可据此删除）: ${covOnly.length}`);
for (const r of covOnly.slice(0, 20)) console.log(`     ${r.rel}:${r.line}  ${r.name}  (文本${r.refs})`);
if (covOnly.length > 20) console.log(`     … 其余 ${covOnly.length - 20} 个省略`);

console.log('\n=== 文件级覆盖（>=10 个函数，按覆盖率升序）===');
Object.entries(fileStats)
    .filter(([, s]) => s.total >= 10)
    .sort((a, b) => a[1].exec / a[1].total - b[1].exec / b[1].total)
    .slice(0, 16)
    .forEach(([rel, s]) => {
        const pct = ((s.exec / s.total) * 100).toFixed(0);
        console.log(`  ${pct.padStart(3)}%  ${String(s.exec).padStart(3)}/${String(s.total).padStart(3)}  ${rel}`);
    });

if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify({ flowStats, total: named.length, executed, both, covOnly, fileStats, rows: named }, null, 2));
    console.log(`\nJSON 已写入 ${JSON_OUT}`);
}
