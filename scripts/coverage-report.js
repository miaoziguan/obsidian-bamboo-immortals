/**
 * P0-1 真实覆盖率汇总与报告（jest globalTeardown）。
 *
 * 仅在 COVERAGE_EVAL=1 时生效：合并 coverage-raw/*.json，输出
 *   1) 总览 text-summary
 *   2) 按「语句覆盖率升序」的逐文件清单（含 0% 与未覆盖文件）
 *   3) coverage/index.html 供细看
 *
 * 背景：测试经 loadModule 用 new Function 求值，jest 原生 coverage 恒为 0/0；
 * 覆盖率数据在 testUtils.js 里手工插桩产生，由 coverageHook.js 落盘到这里汇总。
 */
const fs = require('fs');
const path = require('path');

module.exports = async function globalTeardown() {
    if (process.env.COVERAGE_EVAL !== '1') return;

    // 稳定定位仓库根（向上找 package.json），与 coverageHook.js 保持一致
    let root = process.cwd();
    let d = root;
    while (d !== path.dirname(d)) {
        if (fs.existsSync(path.join(d, 'package.json'))) { root = d; break; }
        d = path.dirname(d);
    }
    const rawDir = path.join(root, 'coverage-raw');
    if (!fs.existsSync(rawDir)) {
        console.warn('[coverage] 未找到 coverage-raw/，无插桩数据（确认 COVERAGE_EVAL=1 已生效）');
        return;
    }

    const libCoverage = require('istanbul-lib-coverage');
    const libReport = require('istanbul-lib-report');
    const reports = require('istanbul-reports');

    const map = libCoverage.createCoverageMap({});
    let files = 0;
    for (const name of fs.readdirSync(rawDir)) {
        if (!name.endsWith('.json')) continue;
        try {
            map.merge(JSON.parse(fs.readFileSync(path.join(rawDir, name), 'utf8')));
            files += 1;
        } catch (_) { /* 跳过损坏分片 */ }
    }
    if (files === 0) {
        console.warn('[coverage] coverage-raw/ 为空');
        return;
    }

    const outDir = path.join(root, 'coverage');
    fs.mkdirSync(outDir, { recursive: true });
    const context = libReport.createContext({ dir: outDir, coverageMap: map });

    console.log('\n==================== 真实覆盖率（P0-1 摸底） ====================');
    reports.create('text-summary', {}).execute(context);
    reports.create('html', { skipEmpty: false }).execute(context);

    // 逐文件清单：按语句覆盖率升序（最该补测的排最前）
    const rows = [];
    for (const file of map.files()) {
        const fc = map.fileCoverageFor(file);
        const s = fc.toJSON();
        const stmtTotal = Object.keys(s.statementMap || {}).length;
        const stmtHit = Object.values(s.s || {}).filter((n) => n > 0).length;
        const fnTotal = Object.keys(s.fnMap || {}).length;
        const fnHit = Object.values(s.f || {}).filter((n) => n > 0).length;
        const pct = stmtTotal === 0 ? 100 : (stmtHit / stmtTotal) * 100;
        rows.push({
            file: path.relative(process.cwd(), file),
            pct,
            stmtHit,
            stmtTotal,
            fnHit,
            fnTotal,
        });
    }
    rows.sort((a, b) => a.pct - b.pct || b.stmtTotal - a.stmtTotal);

    const zero = rows.filter((r) => r.stmtHit === 0);
    const low = rows.filter((r) => r.pct > 0 && r.pct < 50);
    const totalStmt = rows.reduce((n, r) => n + r.stmtTotal, 0);
    const hitStmt = rows.reduce((n, r) => n + r.stmtHit, 0);

    console.log(`\n被测到的源文件数: ${rows.length}`);
    console.log(`语句总计: ${hitStmt}/${totalStmt} (${totalStmt ? ((hitStmt / totalStmt) * 100).toFixed(2) : 0}%)`);
    console.log(`0 覆盖文件（完全没被任何测试执行到）: ${zero.length}`);
    console.log(`低于 50% 的文件: ${low.length}`);
    console.log('\n--- 最该补测的 25 个文件（语句覆盖率升序）---');
    for (const r of rows.slice(0, 25)) {
        console.log(
            `${r.pct.toFixed(1).padStart(6)}%  ${String(r.stmtHit).padStart(5)}/${String(r.stmtTotal).padEnd(5)}  ${r.file}`
        );
    }
    console.log('\nHTML 明细: coverage/index.html');

    // ---- 覆盖率门禁（防回归）：绝对「已覆盖语句数」不得下降 ----
    //
    // 为什么不用百分比阈值：给未覆盖的大文件补测，会把大量语句带入分母，反而拉低百分比
    // —— 等于惩罚「补测」，形成逆向激励（实测：补 displayManager 后 47.27% → 45.49%，
    // 但绝对覆盖数是上升的 8460 → 8524）。
    // 绝对数只对真实退步敏感：既有覆盖被破坏 → 覆盖语句数下降 → 拦住；
    // 新增大文件测试 → 覆盖数不降反升 → 放行。这才是「防回归」本意。
    //
    // 基线存 coverage-baseline.json（已提交），只升不降；需显式命令抬升：npm run coverage:baseline
    const baselineFile = path.join(root, 'coverage-baseline.json');
    let baseline = Number(process.env.COVERAGE_BASELINE ?? NaN);
    if (!Number.isFinite(baseline)) {
        try {
            baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8')).coveredStatements;
        } catch (_) { baseline = 0; }
    }
    const pct = totalStmt ? (hitStmt / totalStmt) * 100 : 0;

    // 抬升基线（显式命令触发）
    if (process.env.COVERAGE_UPDATE_BASELINE === '1') {
        fs.writeFileSync(
            baselineFile,
            JSON.stringify({ coveredStatements: hitStmt, updatedAt: new Date().toISOString() }, null, 2) + '\n'
        );
        console.log(`\n[coverage] 基线已抬升为 ${hitStmt}（写入 coverage-baseline.json）`);
        console.log('=================================================================\n');
        return;
    }

    // 容差：绝对覆盖数存在**环境相关抖动**（同一份代码，CI 与本地可能差几条 ——
    // 实测 CI 8705 vs 本地 8708，总数一致，属条件分支走了不同路径）。
    // 若不放容差，这种抖动会被误判成「回归」并阻断发布（3.32.2 首次实战即踩到）。
    // 真实回归（删测试/整块逻辑失去覆盖）通常是数十~数百条，故 0.1%（至少 5 条）足够安全。
    const tolerance = Math.max(5, Math.ceil(baseline * 0.001));
    if (hitStmt < baseline - tolerance) {
        console.error(
            `\n[coverage] ❌ 已覆盖语句 ${hitStmt} 低于基线 ${baseline}（容差 ±${tolerance}，减少 ${baseline - hitStmt}）—— 判定为覆盖率回归。`
        );
        console.error('[coverage] 说明：门禁对「补测未覆盖的大文件」免疫（只降百分比、不降绝对数时不拦）。');
        console.error('[coverage] 若确为有意删减测试，请同步下调 coverage-baseline.json。');
        console.log('=================================================================\n');
        throw new Error(`coverage gate: covered ${hitStmt} < baseline ${baseline} - ${tolerance}`);
    }

    if (hitStmt > baseline) {
        console.log(`\n[coverage] 📈 已覆盖语句 ${hitStmt} > 基线 ${baseline}（+${hitStmt - baseline}）：可运行 npm run coverage:baseline 抬升基线`);
    }
    console.log(
        `[coverage] ✅ 已覆盖语句 ${hitStmt} ≥ 基线 ${baseline} − 容差 ${tolerance}（未回归）` +
        `｜语句覆盖率 ${pct.toFixed(2)}%（仅供参考，非门禁）`
    );
    console.log('=================================================================\n');
};
