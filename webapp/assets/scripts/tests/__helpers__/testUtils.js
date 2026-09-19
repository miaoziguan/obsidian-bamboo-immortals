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
            } catch (_) { /* 依赖加载失败不影响主模块求值 */ }
        }
    }

    // 剥离 export 关键字（保留声明本体，使其顶层绑定可被 return 提取）
    src = src
        .replace(/^export\s+(const|var|let|function|class|default)\s+/gm, '$1 ')
        .replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '');

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
