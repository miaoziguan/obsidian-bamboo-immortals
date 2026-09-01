/**
 * @jest-environment node
 *
 * 快照测试：验证所有挂 window 全局桥接的 .js 文件都能从【某入口 HTML】经 ESM 依赖图到达。
 *
 * 核心不变量：
 * 所有包含 window.X = X 桥接的文件（需浏览器运行时挂全局）必须被加载器执行。
 * 破坏条件：拆分新文件 → window.X = X 挂上了，但入口 HTML 既无 <script type="module"> 标签、
 * 也没有任何已加载模块 import 它 → 运行时 ReferenceError。
 *
 * 加载方式有三种，本测试都覆盖：
 *  - 静态 <script type="module" src="...js?__BUILD__"></script>
 *  - 动态 import 字符串 'assets/scripts/...js?__BUILD__'
 *  - ESM import 依赖链（import ... from '...' / export ... from '...' / import('...')）：
 *    被任一入口直接/间接 import 的文件视为已加载，无需单独 <script> 标签。
 *
 * 入口 HTML（webapp 目录下，bundle 各自的独立产物）：
 *  - index.html      → app.html（主日复盘）
 *  - archive-src.html→ archive.html（目标归档）
 *  - scroll-src.html → scroll.html（画中卷）
 * 不同模块挂在不同入口：画中卷专用模块（scrollManager/incenseFeature）仅挂在 scroll-src.html，
 * 主视图模块（scrollFeaturePicker 经 handlers.js）挂在 index.html，二者分别到达即可。
 * 故需遍历全部入口 HTML 取并集，再对并集做依赖图可达性判定。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENTRIES = ['index.html', 'archive-src.html', 'scroll-src.html'].map((f) =>
  path.resolve(ROOT, '../../', f)
);

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

/** 解析单个入口 HTML：提取静态 <script src> 与动态 '...?__BUILD__' 字符串指向的 .js（相对 ROOT） */
function parseEntryFiles(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const entryFiles = new Set();
  let m;
  const staticRe = /<script\s+type="module"\s+src="([^"]+\.js)\?__BUILD__"><\/script>/g;
  while ((m = staticRe.exec(html)) !== null) {
    entryFiles.add(m[1].replace(/^assets\/scripts\//, ''));
  }
  const dynamicRe = /['"]assets\/scripts\/([^'"]+\.js)\?__BUILD__['"]/g;
  while ((m = dynamicRe.exec(html)) !== null) {
    entryFiles.add(m[1]);
  }
  return entryFiles;
}

/** 将相对 import spec（./ 或 ../ 开头）解析为相对 ROOT 的 .js 路径；非相对（包名）返回 null */
function resolveImportSpec(spec, fromRel) {
  if (!spec.startsWith('.')) return null;
  const fromAbs = path.resolve(ROOT, fromRel);
  let rel = path.relative(ROOT, path.resolve(path.dirname(fromAbs), spec));
  rel = rel.split(path.sep).join('/');
  if (!rel.endsWith('.js')) rel += '.js';
  return rel;
}

/**
 * 从入口文件集合出发，BFS 追踪 ESM import / export...from / 动态 import 依赖图，
 * 返回所有可达 .js（相对 ROOT 的 posix 路径）。
 */
function reachableFrom(roots) {
  const reachable = new Set(roots);
  const queue = [...roots];
  while (queue.length) {
    const rel = queue.shift();
    const abs = path.join(ROOT, rel);
    let content;
    try {
      content = fs.readFileSync(abs, 'utf-8');
    } catch (e) {
      continue; // 文件不存在（如带别名解析失败）则跳过，不影响其余判定
    }
    const re = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]/g;
    let mm;
    while ((mm = re.exec(content)) !== null) {
      const r = resolveImportSpec(mm[1], rel);
      if (r && !reachable.has(r)) {
        reachable.add(r);
        queue.push(r);
      }
    }
    const dynRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((mm = dynRe.exec(content)) !== null) {
      const r = resolveImportSpec(mm[1], rel);
      if (r && !reachable.has(r)) {
        reachable.add(r);
        queue.push(r);
      }
    }
  }
  return reachable;
}

function hasWindowBridge(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return /window\.[A-Z]\w*\s*=\s*[A-Z]\w*/.test(content);
}

describe('入口 HTML 脚本加载完整性（多入口 + ESM 依赖图）', () => {
  let allJsFiles, loadedScripts;

  beforeAll(() => {
    allJsFiles = scanJsFiles(ROOT)
      .map((f) => path.relative(ROOT, f))
      .sort();

    const entryFiles = new Set();
    ENTRIES.forEach((html) => {
      parseEntryFiles(html).forEach((f) => entryFiles.add(f));
    });
    loadedScripts = reachableFrom([...entryFiles]);
  });

  test('所有挂 window 全局桥接的文件必须从某入口 HTML 经依赖图到达', () => {
    const bridgeFiles = allJsFiles.filter((f) => {
      const absPath = path.join(ROOT, f);
      return hasWindowBridge(absPath);
    });

    const missingBridge = bridgeFiles.filter((f) => !loadedScripts.has(f));

    if (missingBridge.length > 0) {
      console.error(
        '\n❌ 以下文件包含 window.X = X 桥接但无法从任何入口 HTML 的依赖图到达：\n' +
          missingBridge.map((f) => `   - ${f}`).join('\n') +
          '\n\n这意味着文件的代码不会被加载执行，window 全局不会被赋值（或仅被未挂载的入口引用）。' +
          '\n修复：在对应入口 HTML 加 <script type="module"> 标签，或让已加载模块 import 它。'
      );
    }

    expect(missingBridge).toEqual([]);
  });

  test('loaded set 非空（防止 HTML 路径错误导致虚假通过）', () => {
    expect(loadedScripts.size).toBeGreaterThan(50);
  });

  test('bridge.js 必须被加载（iframe 存储层入口）', () => {
    expect(loadedScripts.has('storage/bridge.js')).toBe(true);
  });
});
