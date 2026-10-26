/**
 * UI 计算样式回归比对（替代不可靠的截图基线）
 *
 * 为什么不用截图：headless Chromium 下本项目的视觉并非像素可复现——
 *   竹叶有 338 个元素在跑连续动画；隐私态模糊为 GPU 光栅化存在浮点抖动；
 *   应用初始化时可能捕获原始 rAF/定时器引用，事后覆写不生效。
 *   实测即使冻结动画+rAF+定时器+GPU 参数，跨运行仍偶发差异。
 *
 * 改用 computed-style 逐元素比对：
 *   · 免疫渲染抖动；
 *   · 能精确定位到元素与属性（曾用它抓到 2191 个元素中唯一一处
 *     border-radius 11px→12px）；
 *   · 覆盖 color / background / font-size / border-radius / box-shadow /
 *     transition-duration / animation-duration。
 *
 * 用法（playwright 不列入项目依赖，需外部安装，见 docs §7）：
 *   npm --prefix /tmp/uirig i playwright@1.49.1
 *   BAMBOO_REPO=<repo> cp scripts/ui-style-diff.mjs /tmp/uirig/
 *   ( cd /tmp/uirig && node ui-style-diff.mjs [git-ref] )   # 默认 HEAD
 *
 * 退出码：0 = 无差异；1 = 存在差异（可作门禁用）。
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.env.BAMBOO_REPO;
if (!ROOT) {
  console.error('缺少 BAMBOO_REPO 环境变量');
  process.exit(1);
}
const REF = process.argv[2] || 'HEAD';
const CUR = 'file://' + path.join(ROOT, 'webapp', 'app.html');
const BASE = '/tmp/uirig/_ref-app.html';

// 取 ref 版本的 app.html（自包含产物，可直接 file:// 打开）
const html = execSync(`git -C "${ROOT}" show ${REF}:webapp/app.html`, { maxBuffer: 64 * 1024 * 1024 });
writeFileSync(BASE, html);
const REFURL = 'file://' + BASE;

const PROPS = ['color', 'backgroundColor', 'fontSize', 'borderRadius', 'boxShadow',
               'transitionDuration', 'animationDuration'];

const FREEZE_RANDOM = () => {
  let s = 42;
  Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
};

async function grab(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await page.addInitScript(FREEZE_RANDOM);
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(
    () => window.__bambooShadowRoot?.querySelector('.fab-container'),
    { timeout: 15000 }
  );
  await page.waitForTimeout(800);
  // 注意：这里**不能**注入 transition:none / animation:none ——
  // 那会把要比较的 transitionDuration / animationDuration 清零，
  // 导致动效改动被完全掩盖（初版就踩了这个坑，误报「0 差异」）。
  // 计算样式是瞬时快照，无需冻结动画。
  const rows = await page.evaluate((props) => {
    const sr = window.__bambooShadowRoot;
    const els = [...sr.querySelectorAll('*')]
      .filter((e) => !['STYLE', 'LINK', 'META', 'TITLE', 'SCRIPT'].includes(e.tagName));
    return els.map((e) => {
      const c = getComputedStyle(e);
      return { tag: e.tagName, cls: String(e.className || '').slice(0, 40),
               vals: props.map((p) => c[p]) };
    });
  }, PROPS);
  await page.close();
  return rows;
}

const browser = await chromium.launch();
const before = await grab(browser, REFURL);
const after = await grab(browser, CUR);
await browser.close();

console.log(`比对 ${REF}(webapp/app.html) ↔ 工作区(webapp/app.html)`);
console.log(`元素数: ${before.length} → ${after.length}`);
if (before.length !== after.length) {
  console.log('⚠️ 元素数量不同：可能是结构变更（也可能是数据/随机文案差异）');
}

let diffCount = 0;
const samples = [];
const n = Math.min(before.length, after.length);
for (let i = 0; i < n; i++) {
  const b = before[i], a = after[i];
  const changed = [];
  for (let k = 0; k < PROPS.length; k++) {
    if (b.vals[k] !== a.vals[k]) changed.push(`${PROPS[k]}: ${b.vals[k]} → ${a.vals[k]}`);
  }
  if (changed.length) {
    diffCount++;
    if (samples.length < 20) samples.push(`  #${i} ${b.tag}.${b.cls}\n     ${changed.join('\n     ')}`);
  }
}

console.log(`差异元素数: ${diffCount}`);
samples.forEach((s) => console.log(s));
if (diffCount > samples.length) console.log(`  …另有 ${diffCount - samples.length} 个未列出`);

process.exit(diffCount === 0 ? 0 : 1);
