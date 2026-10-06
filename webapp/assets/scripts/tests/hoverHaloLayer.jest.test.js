/**
 * @jest-environment jsdom
 */
// 时间线卡片头部「悬停光晕」实现方式的回归锁。
//
// 被锁的根因：光晕原先寄生在 .bamboo-card-header 的 background 上，而九段色阶基态都挂着
// transition: background 0.4s ease-out；每当 mousemove 写入 --mouse-x / --mouse-y，header 的
// background-image 计算值就变一次 → 那段过渡被反复重定向 → 变成「光标停稳后仍继续插值约 400ms」
// 的持续重绘（radial-gradient 的插值不可合成，且 header 背后是 backdrop-filter 卡片，
// paint 成本被放大）。现改为独立伪元素层 .bamboo-card-header::before 承载光晕、由 opacity 控制显隐，
// header 的 background 在悬停期完全恒定，该过渡不再被触发。
//
// 本文件锁死 5 件事，防止实现退回：
//   1) 任何 :hover 规则的 background 都不得再引用 var(--mouse-x)；
//   2) var(--mouse-x) 只能出现在光晕层的 background 里；
//   3) 光晕层自身不得挂 transition（否则原样复现被移除的开销）；
//   4) 显隐必须由 :hover::before 的 opacity 承担，且 header 上不再有别的 :hover 规则；
//   5) 九段色阶的强度表（亮 9 + 暗 9）齐全且数值与迁移前一致；同时校验 JS 侧仍把定位属性写在
//      .bamboo-card-header 上（伪元素靠自定义属性继承取到坐标）。
const fs = require('fs');
const path = require('path');

const read = (...segments) => fs.readFileSync(path.join(__dirname, '..', '..', ...segments), 'utf8');
const TIMELINE_CSS = read('styles', 'timeline.css');
const RENDERERS_JS = read('scripts', 'renderers', 'renderers.js');

const HALO_LAYER_SELECTOR = '.bamboo-card-header::before';

/** 九段时段系统（与 timeline.css 的色阶类名一致） */
const TIERS = ['lateNight', 'dawn', 'earlyMorning', 'morning', 'midday', 'afternoon', 'dusk', 'evening', 'night'];

/** 迁移前的光晕 α（取自被删除的 18 条 :hover 径向渐变首段，值必须保持不变） */
const HALO_ALPHA_LIGHT = {
  lateNight: '0.32',
  dawn: '0.24',
  earlyMorning: '0.18',
  morning: '0.12',
  midday: '0.08',
  afternoon: '0.12',
  dusk: '0.20',
  evening: '0.26',
  night: '0.32',
};
const HALO_ALPHA_DARK = {
  lateNight: '0.30',
  dawn: '0.22',
  earlyMorning: '0.16',
  morning: '0.10',
  midday: '0.06',
  afternoon: '0.10',
  dusk: '0.18',
  evening: '0.24',
  night: '0.30',
};

/**
 * 抽出所有「叶子规则块」（body 内不含花括号），自动穿透 @media 等嵌套：
 * 外层 @media 的 body 含 `{`，正则匹配不到，只有内层真正的规则会被捕获。
 * 返回 [{ sel, body }]，sel 已 trim。
 */
function leafRules(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    sel: m[1].replace(/\s+/g, ' ').trim(),
    body: m[2],
  }));
}

/** 判定：该规则是否把光晕坐标变量写进了 background（即旧的寄生写法） */
const haloInBackground = (rule) => /background[^;]*var\(--mouse-x/.test(rule.body);

describe('时间线头部悬停光晕：独立层实现', () => {
  const rules = leafRules(TIMELINE_CSS);

  test('解析器自检：本锁能抓住旧的寄生写法', () => {
    const legacy = `
      /* 注释应被剥离 */
      .bamboo-card.lateNight .bamboo-card-header:hover {
        background:
          radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--primary-rgb), 0.32) 0%, transparent 60%),
          rgba(var(--primary-rgb), 0.24);
      }
    `;
    const parsed = leafRules(legacy);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].sel).toBe('.bamboo-card.lateNight .bamboo-card-header:hover');
    expect(parsed[0].sel.includes(':hover')).toBe(true);
    expect(haloInBackground(parsed[0])).toBe(true); // 旧写法必须被判定为违规
  });

  test('没有任何 :hover 规则再把 var(--mouse-x) 写进 background', () => {
    const offenders = rules.filter((r) => r.sel.includes(':hover') && haloInBackground(r));
    expect(offenders.map((r) => r.sel)).toEqual([]);
  });

  test('var(--mouse-x) 只出现在光晕层的 background 里', () => {
    const consumers = rules.filter((r) => /var\(--mouse-x/.test(r.body));
    expect(consumers.map((r) => r.sel)).toEqual([HALO_LAYER_SELECTOR]);
  });

  test('光晕层：基态 opacity 0、绝对定位铺满、不挂任何 transition', () => {
    const layer = rules.find((r) => r.sel === HALO_LAYER_SELECTOR);
    expect(layer).toBeDefined();
    expect(layer.body).toMatch(/position:\s*absolute/);
    expect(layer.body).toMatch(/inset:\s*0/);
    expect(layer.body).toMatch(/opacity:\s*0/);
    expect(layer.body).toMatch(/--bamboo-halo-alpha/);
    // 关键：不得挂 background / 定位变量的过渡，否则等于把被移除的插值开销搬回来
    expect(layer.body).not.toMatch(/transition/);
  });

  test('显隐由 :hover::before 的 opacity 承担，且 header 上再无其他 :hover 规则', () => {
    const hovers = rules.filter((r) => r.sel.includes('bamboo-card-header:hover'));
    expect(hovers.map((r) => r.sel)).toEqual(['.bamboo-card-header:hover::before']);
    expect(hovers[0].body).toMatch(/opacity:\s*1/);
    expect(hovers[0].body).not.toMatch(/background/);
  });

  test('九段强度表齐全：亮色 9 条 + 暗色 9 条，数值与迁移前逐条一致', () => {
    for (const tier of TIERS) {
      const light = rules.find((r) => r.sel === `.bamboo-card.${tier}`);
      expect(light).toBeDefined();
      expect(light.body).toMatch(new RegExp(`--bamboo-halo-alpha:\\s*${HALO_ALPHA_LIGHT[tier]}`));

      const dark = rules.find((r) => r.sel === `:host(.dark) .bamboo-card.${tier}`);
      expect(dark).toBeDefined();
      expect(dark.body).toMatch(new RegExp(`--bamboo-halo-alpha:\\s*${HALO_ALPHA_DARK[tier]}`));
    }
  });

  test('基态未受影响：九段底色规则（亮/暗各 9 条）与 background 过渡仍在', () => {
    for (const tier of TIERS) {
      const light = rules.find((r) => r.sel === `.bamboo-card.${tier} .bamboo-card-header`);
      expect(light).toBeDefined();
      expect(light.body).toMatch(/background:\s*rgba\(var\(--primary-rgb\)/);
      expect(light.body).toMatch(/transition:\s*background/);

      const dark = rules.find((r) => r.sel === `:host(.dark) .bamboo-card.${tier} .bamboo-card-header`);
      expect(dark).toBeDefined();
      expect(dark.body).toMatch(/background:\s*rgba\(var\(--primary-rgb\)/);
      expect(dark.body).toMatch(/transition:\s*background/);
    }
  });

  test('JS 侧仍把 --mouse-x/--mouse-y 写在 .bamboo-card-header 上（伪元素靠继承取坐标）', () => {
    expect(RENDERERS_JS).toMatch(/header\.style\.setProperty\(\s*['"]--mouse-x['"]/);
    expect(RENDERERS_JS).toMatch(/header\.style\.setProperty\(\s*['"]--mouse-y['"]/);
    // 派发点在 header 上（closest 到 .bamboo-card-header），否则伪元素继承不到
    expect(RENDERERS_JS).toMatch(/closest\(\s*['"]\.bamboo-card-header['"]\s*\)/);
  });
});

// ---------------------------------------------------------------------------
// 同源件 .goal-row：本轮只删「只服务光晕」的 background 过渡，未迁层（已记档不做）。
//
// 为什么不迁层：该行两个伪元素都已被占用（暗色流光用 ::before/::after；亮色 .goal-row::before 恒
// opacity:0 + z-index:-1，把光晕并进去会让亮色下光晕直接消失），要迁就得新增节点，ROI 为负。
//
// 为什么可以删过渡（删除依据，防止日后有人「顺手加回来」）：
//   1) 行自身 background 的运行期变化只有 :hover 一处 —— goal-complete / goal-overdue / goal-soon
//      三个状态类只出现在 modules/goals/renderer.js:314 的模板串里（构建期即决定，插入后不再切类），
//      列表刷新走 container.innerHTML 整段重建，新节点不会触发过渡；
//   2) 基态 2 层渐变 → :hover 3 层，层数不同不可插值，过渡降级为「50% 离散翻转」，
//      即光晕进入/离开各自白等 200ms；删掉即变成瞬时，同时消除这段待机过渡；
//   3) 代价（已知并接受）：亮暗主题切换是同 DOM 切类（state/store.js:833、storage/bridge.js:1101），
//      本行背景不再参与那 0.4s 渐隐，与其余绝大多数元素一致地瞬时切换。
// ---------------------------------------------------------------------------
const GOALS_MAP_CSS = read('styles', 'goals-map.css');
const DARK_CSS = read('styles', 'dark.css');
const GOALS_RENDERER_JS = read('scripts', 'modules', 'goals', 'renderer.js');

const baseGoalRowRules = (css) => leafRules(css).filter((r) => r.sel === '.goal-row' || r.sel === ':host(.dark) .goal-row');

describe('目标行 .goal-row：不再挂「只服务光晕」的 background 过渡', () => {
  test('解析器自检：本锁能识别出 .goal-row 上的 background 过渡', () => {
    const legacy = `.goal-row {\n  background: rgba(var(--primary-rgb), 0.04);\n  transition: background 0.4s ease-out;\n}`;
    const parsed = baseGoalRowRules(legacy);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].body).toMatch(/transition:\s*background/); // 旧写法必须被判为违规
  });

  test('亮色基态 .goal-row 与暗色 :host(.dark) .goal-row 均不含任何 transition', () => {
    for (const [name, css] of [['goals-map.css', GOALS_MAP_CSS], ['dark.css', DARK_CSS]]) {
      const bases = baseGoalRowRules(css);
      expect(bases.length).toBeGreaterThan(0);
      for (const rule of bases) {
        expect({ file: name, sel: rule.sel, body: rule.body }).toEqual(
          expect.objectContaining({ body: expect.not.stringMatching(/transition/) })
        );
      }
    }
  });

  test('三个状态类仍只在渲染模板里出现（运行期不切类，故无过渡可依赖）', () => {
    for (const cls of ['goal-complete', 'goal-overdue', 'goal-soon']) {
      const hits = GOALS_RENDERER_JS.split(cls).length - 1;
      expect({ cls, hits }).toEqual({ cls, hits: 1 });
    }
    // 且这几个状态类只在模板串那一行，不在任何 classList / className 赋值里
    expect(GOALS_RENDERER_JS).not.toMatch(/classList\.(add|toggle)\(\s*['"]goal-(complete|overdue|soon)/);
  });

  test('已知现状：.goal-row:hover 的光晕仍寄生在 background 上（迁层属独立决策，动它须一并更新本锁）', () => {
    const hover = leafRules(GOALS_MAP_CSS).find((r) => r.sel === '.goal-row:hover');
    expect(hover).toBeDefined();
    expect(haloInBackground(hover)).toBe(true);
  });
});
