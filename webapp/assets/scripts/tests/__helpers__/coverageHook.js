/**
 * P0-1 真实覆盖率：把插桩产生的覆盖率数据落盘，供 globalTeardown 汇总。
 *
 * 仅在 COVERAGE_EVAL=1 时生效（默认空操作，不改动既有测试行为与 CI）。
 * 每个测试文件跑完后，把它所在 jsdom 环境里的 globalThis.__coverage__ 写到
 * coverage-raw/<testfile>.json；由 scripts/coverage-report.js 合并出报告。
 */
const fs = require('fs');
const path = require('path');

// 稳定定位仓库根（向上找 package.json），避免产物随 process.cwd() 漂移污染源码目录
function _findRoot(dir) {
    let d = dir;
    while (d !== path.dirname(d)) {
        if (fs.existsSync(path.join(d, 'package.json'))) return d;
        d = path.dirname(d);
    }
    return process.cwd();
}
const OUT_DIR = path.join(_findRoot(__dirname), 'coverage-raw');

afterAll(() => {
    if (process.env.COVERAGE_EVAL !== '1') return;
    const cov = globalThis.__coverage__;
    if (!cov || typeof cov !== 'object') {
        if (process.env.COVERAGE_DEBUG === '1') {
            console.error('[coverageHook] 无 __coverage__（未插桩？）keys=' + Object.keys(cov || {}).length);
        }
        return;
    }
    try {
        fs.mkdirSync(OUT_DIR, { recursive: true });
        let testPath = 'unknown';
        try {
            testPath = (expect && expect.getState && expect.getState().testPath) || 'unknown';
        } catch (_) { /* 保持 unknown */ }
        const safe = String(testPath).replace(/[^a-zA-Z0-9]+/g, '_').slice(-120);
        fs.writeFileSync(path.join(OUT_DIR, safe + '.json'), JSON.stringify(cov));
    } catch (_) { /* 落盘失败不影响测试结果 */ }
});
