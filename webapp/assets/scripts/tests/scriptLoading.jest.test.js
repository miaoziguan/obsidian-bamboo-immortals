/**
 * @jest-environment node
 *
 * 快照测试：验证所有挂 window 全局桥接的 .js 文件都被 index.html 加载。
 *
 * 核心不变量：
 * 所有包含 window.X = X 桥接的文件（需要浏览器运行时挂全局）必须被加载器执行。
 * 破坏条件：拆分新文件 → window.X = X 挂上了但 index.html 忘加 <script type="module"> → 运行时 ReferenceError
 *
 * 注意：
 * - 纯 import/export 模块（无 window 桥接）由 ESM 静态依赖自动加载，无需单独 <script> 标签
 * - bridge.js/storageManager.js 通过 document.write 动态加载，也在扫描范围内
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_HTML = path.resolve(ROOT, '../../index.html');

function scanJsFiles(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'tests') continue;
            results.push(...scanJsFiles(full));
        } else if (entry.name.endsWith('.js')) {
            results.push(full);
        }
    }
    return results;
}

function parseLoadedScripts(htmlPath) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const loaded = new Set();

    // 1. 静态 <script type="module" src="..."?__BUILD__"></script>
    const staticRe = /<script\s+type="module"\s+src="([^"]+\.js)\?__BUILD__"><\/script>/g;
    let m;
    while ((m = staticRe.exec(html)) !== null) {
        loaded.add(m[1].replace(/^assets\/scripts\//, ''));
    }

    // 2. 动态 src 变量赋值 ('assets/scripts/...' 串)
    const dynamicRe = /['"]assets\/scripts\/([^'"]+\.js)\?__BUILD__['"]/g;
    while ((m = dynamicRe.exec(html)) !== null) {
        loaded.add(m[1]);
    }

    return loaded;
}

function hasWindowBridge(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return /window\.[A-Z]\w*\s*=\s*[A-Z]\w*/.test(content);
}

describe('index.html 脚本加载完整性', () => {
    let allJsFiles, loadedScripts;

    beforeAll(() => {
        allJsFiles = scanJsFiles(ROOT)
            .map(f => path.relative(ROOT, f))
            .sort();

        loadedScripts = parseLoadedScripts(INDEX_HTML);
    });

    test('所有挂 window 全局桥接的文件必须被加载', () => {
        const bridgeFiles = allJsFiles.filter(f => {
            const absPath = path.join(ROOT, f);
            return hasWindowBridge(absPath);
        });

        const missingBridge = bridgeFiles.filter(f => !loadedScripts.has(f));

        if (missingBridge.length > 0) {
            console.error(
                '\n❌ 以下文件包含 window.X = X 桥接但未在 index.html 加载：\n' +
                missingBridge.map(f => `   - ${f}`).join('\n') +
                '\n\n这意味着文件的代码根本不会执行，window 全局不会被赋值。' +
                '\n修复：在 index.html 对应引用方之前加 <script type="module"> 标签。'
            );
        }

        expect(missingBridge).toEqual([]);
    });

    test('loaded set 非空（防止 HTML 路径错误导致虚假通过）', () => {
        expect(loadedScripts.size).toBeGreaterThan(50);
    });

    test('bridge.js / storageManager.js 二选一被加载（iframe 判断走 document.write）', () => {
        const hasBridge = loadedScripts.has('storage/bridge.js');
        const hasStorage = loadedScripts.has('storage/storageManager.js');
        expect(hasBridge || hasStorage).toBe(true);
    });
});
