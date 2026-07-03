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

    // 剥离 ES 模块语法（export + import）
    src = src
        .replace(/^export\s+(const|var|let|function|class|default)\s+/gm, '$1 ')
        .replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '')
        .replace(/^import\s+.*?from\s+['"].*?['"]\s*;?\s*$/gm, '')
        .replace(/^import\s+['"].*?['"]\s*;?\s*$/gm, '');

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
