/**
 * UI 视觉回归基线（UI 系统梳理地基 · 交付物 ⑤）
 *
 * 为什么必须「穿透 shadowRoot」：webapp 用 attachShadow(open) 渲染，
 * 整套 UI 在 shadow 内；对 iframe/DOM 外层截图只会得到空白。
 *
 * 为什么用 file:// 直开 app.html：webview 是自包含产物（内联 CSS+JS），
 * 可脱离 Obsidian 宿主独立渲染；仅存储桥接不可用（控制台一条
 * "Failed to load from storage"，无害，不影响样式基线）。
 *
 * 依赖说明：playwright 体积大且会触发浏览器下载，故**不列入本项目依赖**
 * （避免 CI 的 npm ci 拉取浏览器）。运行方式：
 *   npm --prefix /tmp/uirig i playwright@1.49.1
 *   BAMBOO_REPO=/path/to/obsidian-bamboo-review \
 *     cp scripts/ui-visual-baseline.mjs /tmp/uirig/ && \
 *     ( cd /tmp/uirig && node ui-visual-baseline.mjs )
 * 输出：docs/ui-baseline/app-<state>.png
 *
 * 局限（诚实声明）：scroll.html（画中卷三模式）/archive.html 在无数据时
 * 近乎空白，需先注入文档数据才有回归价值，故本版仅覆盖 app.html 外壳。
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.env.BAMBOO_REPO;
if (!ROOT) {
  console.error('缺少 BAMBOO_REPO 环境变量（指向仓库根目录）');
  process.exit(1);
}
const APP = 'file://' + path.join(ROOT, 'webapp', 'app.html');
const OUT = path.join(ROOT, 'docs', 'ui-baseline');

/** 每个状态：在 shadow host 上加/去 class（与生产 :host(.dark) 一致） */
const STATES = [
  { name: 'light', classes: [] },
  { name: 'dark', classes: ['dark'] },
  { name: 'privacy', classes: ['privacy-on'] },
  { name: 'dark-privacy', classes: ['dark', 'privacy-on'] },
];

const waitReady = (page) =>
  page.waitForFunction(
    () => {
      const sr = window.__bambooShadowRoot;
      return !!(sr && sr.querySelector('.fab-container'));
    },
    { timeout: 15000 }
  );

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const st of STATES) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      // 稳定截图：抑制动画（项目自身也遵循 prefers-reduced-motion）
      reducedMotion: 'reduce',
    });
    await page.goto(APP, { waitUntil: 'load' });
    await waitReady(page);

    if (st.classes.length) {
      await page.evaluate((cls) => {
        const host = document.querySelector('.bamboo-shadow-host');
        if (host) host.classList.add(...cls);
      }, st.classes);
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(600);

    const file = path.join(OUT, `app-${st.name}.png`);
    await page.screenshot({ path: file });
    console.log('✓', path.relative(ROOT, file));
    await page.close();
  }

  // 说明：FAB 展开 / 各类面板（display-panel、modal-panel）的内容由
  // moduleManager 等依据宿主数据动态生成；脱离宿主独立运行时为空，
  // 截图与 light 态完全相同、无回归价值，故不纳入基线。
  // 待二阶段「注入种子数据」后再补面板级基线。

  await browser.close();
  console.log('\n基线已生成 →', path.relative(ROOT, OUT));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
