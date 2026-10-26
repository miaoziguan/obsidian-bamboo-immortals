/**
 * 香道 / 雁 / 火折子 —— 带 fixture 的样式回归比对
 *
 * 为什么需要它：
 *   `incense.css` 与 `scroll-overlay.css` 存在大范围逐字重复的规则
 *   （曾达 68 条，覆盖整个香炉/火折子/烟雾/化雁子系统）。去重时若删错一边，
 *   由于两文件在三个视图里按固定顺序加载，中途的同属性规则可能翻上来改写结果。
 *   而 app.html 的样式比对覆盖不到这批组件——它们只在 scroll.html 出现，
 *   且需要真实燃烧数据才渲染。故此处**注入与 scrollManager.js 同款的 fixture DOM**，
 *   再逐元素比对 computed style。
 *
 * 用法（playwright 不在项目依赖内，见 docs §7）：
 *   BAMBOO_REPO=<repo> cp scripts/ui-scroll-fixture-diff.mjs /tmp/uirig/
 *   ( cd /tmp/uirig && node ui-scroll-fixture-diff.mjs [git-ref] )   # 默认 HEAD
 *
 * 退出码：0 = 无差异；1 = 存在差异（可作去重前的安全网）。
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.env.BAMBOO_REPO;
if (!ROOT) { console.error('缺少 BAMBOO_REPO'); process.exit(1); }
const REF = process.argv[2] || 'HEAD';

// 取 ref 版 scroll.html（自包含产物，可直接 file:// 打开）
const REF_FILE = '/tmp/uirig/_ref-scroll.html';
writeFileSync(
  REF_FILE,
  execSync(`git -C "${ROOT}" show ${REF}:webapp/scroll.html`, { maxBuffer: 64 * 1024 * 1024 })
);

const PROPS = ['color', 'backgroundColor', 'backgroundImage', 'borderColor', 'borderTopColor',
               'borderRadius', 'boxShadow', 'opacity', 'fill', 'stroke', 'strokeWidth',
               'filter', 'width', 'height', 'top', 'left', 'transform',
               'animationName', 'transitionDuration'];

/** 与 scrollManager.js 同款的 fixture（id 加 test 前缀，避免与页面内 id 冲突） */
const FIXTURE = `
<div class="scroll-body">
  <aside class="scroll-left">
    <div class="scroll-screen">
      <div class="scroll-screen-glass"></div>
      <div class="scroll-scanlines"></div>
      <div class="scroll-screen-inner">
        <div class="scroll-incense" style="--burn: 0.4">
          <div class="scroll-incense-smoke">
            <svg viewBox="0 0 32 64" fill="none" preserveAspectRatio="none">
              <path class="scroll-smoke-wisp w1" d="M16,14 Q22,-4 14,-22" stroke="url(#testSmokeGrad)" stroke-width="2" stroke-linecap="round"/>
              <defs><linearGradient id="testSmokeGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stop-color="var(--smoke-a)"/>
                <stop offset="60%" stop-color="var(--smoke-b)"/>
                <stop offset="100%" stop-color="var(--smoke-c)"/>
              </linearGradient></defs>
            </svg>
          </div>
          <div class="scroll-incense-ember"><span class="ember-core"></span></div>
          <div class="scroll-incense-flare"></div>
          <div class="scroll-incense-stick">
            <div class="scroll-incense-ash"></div>
            <div class="scroll-incense-transition"></div>
            <div class="scroll-incense-unburnt"></div>
            <div class="scroll-incense-texture"></div>
          </div>
          <div class="scroll-censer" role="button" tabindex="0">
            <div class="scroll-censer-reflect"></div>
            <div class="scroll-censer-shadow"></div>
          </div>
        </div>
        <div class="scroll-firebrand">
          <svg viewBox="0 0 48 96" fill="none">
            <rect class="fb-body" x="14" y="34" width="20" height="56" rx="3"/>
            <path class="fb-stroke" d="M14 52 Q24 49 34 52"/>
            <ellipse class="fb-top" cx="24" cy="34" rx="10" ry="3"/>
            <g class="flame">
              <path class="flame-outer" d="M24 34 Q19 23 24 11 Q29 23 24 34"/>
              <path class="flame-inner" d="M24 34 Q22 27 24 18 Q26 27 24 34"/>
              <circle class="flame-spark spark-a" cx="28" cy="22" r="1.2"/>
            </g>
            <g class="scroll-firebrand-cap">
              <path class="fb-cap-body" d="M11 30 Q11 19 24 17 Q37 19 37 30 Q31 33 24 33 Q17 33 11 30 Z"/>
              <path class="fb-cap-stroke" d="M11 29 Q24 26 37 29"/>
              <ellipse class="fb-cap-edge" cx="24" cy="33" rx="13" ry="2.6"/>
              <path class="fb-cap-knob" d="M24 17 Q21 11 24 8 Q27 11 24 17 Z"/>
            </g>
          </svg>
        </div>
        <div class="scroll-wild-goose">
          <svg viewBox="0 0 26 14" fill="none">
            <path d="M13 10 Q7 2 1 5 Q6 6.5 13 10 Q20 2 25 5 Q19 6.5 13 10 Z"/>
          </svg>
        </div>
      </div>
    </div>
  </aside>
</div>
<div class="scroll-workbench"><div class="scroll-smoke-wisp w2"></div></div>`;

/**
 * 覆盖两文件里重复出现的状态类。
 * 注意：应用逻辑必须在浏览器上下文里执行（见下方 acts），
 * 此处只声明名字用于遍历与报告。
 */
const STATE_NAMES = [
  'base', 'incense-lit', 'incense-near', 'incense-blowing', 'incense-glowing',
  'incense-kissing', 'incense-lighting', 'firebrand-capoff', 'firebrand-lit',
  'firebrand-near', 'workbench-dragging',
];

const FREEZE_RANDOM = () => {
  let s = 42;
  Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
};

async function collect(url) {
  const res = [];
  for (const dark of [false, true]) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' });
    await page.addInitScript(FREEZE_RANDOM);
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__bambooShadowRoot, { timeout: 15000 });
    await page.waitForTimeout(600);

    for (let idx = 0; idx < STATE_NAMES.length; idx++) {
      const rows = await page.evaluate(({ fx, idx, dark, props }) => {
        const sr = window.__bambooShadowRoot;
        const host = document.querySelector('.bamboo-shadow-host');
        const old = sr.querySelector('#sgFixture');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'sgFixture';
        wrap.innerHTML = fx;
        sr.appendChild(wrap);
        host.classList.toggle('dark', dark);

        const q = (s) => wrap.querySelector(s);
        const acts = [
          () => {},
          () => q('.scroll-incense').classList.add('is-lit'),
          () => q('.scroll-incense').classList.add('near'),
          () => q('.scroll-incense').classList.add('blowing'),
          () => q('.scroll-incense').classList.add('glowing'),
          () => q('.scroll-incense').classList.add('kissing'),
          () => q('.scroll-incense').classList.add('lighting'),
          () => q('.scroll-firebrand').classList.add('cap-off'),
          () => q('.scroll-firebrand').classList.add('lit'),
          () => q('.scroll-firebrand').classList.add('near'),
          () => q('.scroll-workbench').classList.add('scroll-dragging'),
        ];
        acts[idx]();

        const data = [...wrap.querySelectorAll('*')].map((e) =>
          e.tagName + '.' + String(e.className || '') + '::' +
          props.map((p) => getComputedStyle(e)[p]).join('|')
        );
        wrap.remove();
        host.classList.remove('dark');
        return data;
      }, { fx: FIXTURE, idx, dark, props: PROPS });

      res.push({ key: `${dark ? 'dark' : 'light'}/${STATE_NAMES[idx]}`, rows });
    }
    await page.close();
  }
  return res;
}

const browser = await chromium.launch();
const before = await collect('file://' + REF_FILE);
const after = await collect('file://' + path.join(ROOT, 'webapp', 'scroll.html'));
await browser.close();

let total = 0;
const samples = [];
for (let i = 0; i < before.length; i++) {
  const b = before[i], a = after[i];
  if (b.rows.length !== a.rows.length) {
    samples.push(`  ${b.key}: 元素数 ${b.rows.length} → ${a.rows.length}`);
  }
  const n = Math.min(b.rows.length, a.rows.length);
  for (let j = 0; j < n; j++) {
    if (b.rows[j] !== a.rows[j]) {
      total++;
      if (samples.length < 25) {
        samples.push(`  ${b.key} #${j}\n     ref: ${b.rows[j].slice(0, 160)}\n     now: ${a.rows[j].slice(0, 160)}`);
      }
    }
  }
}

console.log(`比对 ${REF}(scroll.html) ↔ 工作区(scroll.html)：fixture ${STATE_NAMES.length} 状态 × 2 主题`);
console.log(`差异元素: ${total}`);
samples.forEach((s) => console.log(s));
process.exit(total === 0 ? 0 : 1);
