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

/**
 * 每个状态：在 shadow host 上加/去 class（与生产 :host(.dark) 一致）。
 *
 * ⚠️ 隐私态（privacy-on）已被排除，原因是**它在 headless 下本质不可复现**：
 *   该态依赖模糊（防偷窥），而模糊为 GPU 光栅化，逐帧存在浮点抖动；
 *   实测即使冻结 CSS 动画 + rAF + 定时器、并加 --disable-gpu /
 *   --force-color-profile=srgb / --disable-lcd-text，三连拍仍不相同。
 *   噪声基线比没有基线更糟（每次跑都"有 diff"），故只保留像素稳定的两态。
 *   若日后要覆盖隐私态，应改用「容差比对」而非逐像素相等。
 */
const STATES = [
  { name: 'light', classes: [] },
  { name: 'dark', classes: ['dark'] },
];

const waitReady = (page) =>
  page.waitForFunction(
    () => {
      const sr = window.__bambooShadowRoot;
      return !!(sr && sr.querySelector('.fab-container'));
    },
    { timeout: 15000 }
  );

/**
 * 固定 Math.random，否则截图不可复现。
 * 根因：utils/quoteService.js 用 Math.random() 抽取「每日箴言」，
 * 同一构建两次截图会因文案不同而 md5 不同 —— 基线就此失去回归意义。
 * 用确定性 LCG 覆写，保证每次抽到同一条。
 */
const FREEZE_RANDOM = () => {
  let s = 42;
  Math.random = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
};

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const st of STATES) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      // 稳定截图：抑制动画（项目自身也遵循 prefers-reduced-motion）
      reducedMotion: 'reduce',
    });
    await page.addInitScript(FREEZE_RANDOM);
    await page.goto(APP, { waitUntil: 'load' });
    await waitReady(page);

    // 先让首屏自身的一次性渲染与定时任务跑完（实测约 1s 内状态才"落地"）
    await page.waitForTimeout(800);

    // 冻结所有可变视觉源，否则同一构建两次截图不同、基线失去意义：
    //  1) CSS 动画/过渡 —— 竹叶有 338 个元素在跑连续动画
    //     （bambooSway1-5 / leafTremble / leafDrift3…），reducedMotion 只设媒体查询、
    //     拦不住这些未响应该查询的动画；且必须注入 shadowRoot（light DOM 样式进不了 shadow）。
    //  2) rAF 与定时器 —— 仅冻结 CSS 仍不稳定（实测前三连拍仍不同），
    //     说明还有 JS 调度的持续变化（香道/星光之类）。
    await page.evaluate(() => {
      const sr = window.__bambooShadowRoot;
      if (!sr) return;
      const s = document.createElement('style');
      s.textContent =
        '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
      sr.appendChild(s);
      window.requestAnimationFrame = () => 0;
      const noop = () => 0;
      window.setInterval = noop;
      window.setTimeout = noop;
    });

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
