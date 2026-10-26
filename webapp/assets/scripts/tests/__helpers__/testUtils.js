/**
 * 共享测试辅助工具
 * 
 * 由于源码已转为 ES 模块（含 export 关键字），
 * new Function() 会因 export 在非模块上下文报 SyntaxError，
 * 此处提供 loadModule() 自动剥离 export 前缀后加载。
 */
const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = path.join(__dirname, '..', '..');

// P0-1 真实覆盖率摸底（可选，默认关闭，仅 COVERAGE_EVAL=1 时启用）。
// 背景：本加载器是「读源码文本 → 剥离 import/export → new Function 求值」，模块从不经 require，
// jest/istanbul 因此永不插桩，`jest --coverage` 恒为 Unknown% (0/0) —— 1016 个绿灯无法证明覆盖。
// 解法：在求值前对源码手工插桩，让 globalThis.__coverage__ 产生真实数据（由 coverageHook 落盘汇总）。
let _instrumenter = null;
if (process.env.COVERAGE_EVAL === '1') {
    try {
        _instrumenter = require('istanbul-lib-instrument').createInstrumenter({
            coverageVariable: '__coverage__',
            preserveComments: true,
        });
    } catch (_) { _instrumenter = null; }
}

// 跨 loadModule 调用共享的已加载模块集合，避免循环依赖导致的无限递归。
const _loadedModules = new Set();

/**
 * 加载一个 JS 模块源文件，返回其顶层绑定构成的映射对象。
 * 
 * @param {string} relativePath  — 相对于 webapp/assets/scripts 的路径，如 'utils/helpers.js'
 * @param {string[]} bindings    — 要提取的顶层变量名列表
 * @param {object}  [globals={}] — 注入的全局 mock
 * @returns {object}              — { name: value } 的映射
 */
function loadModule(relativePath, bindings, globals = {}) {
    const filePath = path.join(SCRIPTS_DIR, relativePath);
    let src = fs.readFileSync(filePath, 'utf8');

    // 注意：插桩必须放在「剥离 import/export 之后」。若对原始 ESM 源码插桩，babel 会重打印
    // import/export 语句，导致上面的剥离正则匹配不到 → 求值时报
    // "Cannot use import statement outside a module"。代价是行号可能因剥离而轻微偏移，
    // 但覆盖率结论（哪些语句被执行）依然有效。

    // 解析并剥离 ES import，同时递归加载被依赖模块（使其 globalThis 副作用生效：
    // 例如 twConfig.js 在求值时把共享常量挂到 globalThis，供剥离 import 后的模块经全局解析）。
    // 用 _loadedModules 去重，避免循环依赖导致的无限递归。
    const importPaths = [];
    src = src.replace(/^\s*import\s+(?:[^;]*?\s+from\s+)?['"]([^'"]+)['"]\s*;?\s*$/gm, (m, p) => {
        importPaths.push(p);
        return '';
    });
    for (const p of importPaths) {
        const abs = path.resolve(path.dirname(filePath), p);
        if (!_loadedModules.has(abs)) {
            _loadedModules.add(abs);
            try {
                loadModule(path.relative(SCRIPTS_DIR, abs).split(path.sep).join('/'), [], globals);
            } catch (e) {
                // 依赖加载失败：此前静默吞掉，会残留「全 0 覆盖率」条目且无任何告警，
                // 使 B 类（0 执行）判定失真（死代码审计已证实此伪影）。这里显式告警，
                // 便于发现「被递归加载但从未求值」的依赖。
                console.warn(`[testUtils] 依赖加载失败（不影响主模块求值）: ${path.relative(SCRIPTS_DIR, abs)} -> ${e && e.message ? e.message : e}`);
            }
        }
    }

    // 剥离 export 关键字（保留声明本体，使其顶层绑定可被 return 提取）
    src = src
        .replace(/^export\s+(const|var|let|function|class|default)\s+/gm, '$1 ')
        .replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '');

    // P0-1 插桩：此时已剥离 import/export，是纯脚本源码，可安全插桩。
    // 失败则退回未插桩源码，保证测试照常运行（不因覆盖率而阻塞开发）。
    if (_instrumenter) {
        try { src = _instrumenter.instrumentSync(src, filePath); } catch (_) { /* 插桩失败不阻塞测试 */ }
    }

    // 注入全局 mock
    const globalAssignments = Object.entries(globals)
        .map(([k, v]) => `globalThis.${k} = arguments[0].${k};`)
        .join('\n');

    const returnExpr = bindings.length === 0
        ? ''
        : `\nreturn { ${bindings.join(', ')} };`;

    const wrappedSrc = `
        ${globalAssignments}
        ${src}
        ${returnExpr}
    `;

    return new Function('globals', wrappedSrc)(globals);
}

/**
 * 快速创建 DOM mock 容器
 */
function createMockContainer(innerHTML = '') {
    const container = document.createElement('div');
    if (innerHTML) container.innerHTML = innerHTML;
    return container;
}

module.exports = { loadModule, createMockContainer, SCRIPTS_DIR };
