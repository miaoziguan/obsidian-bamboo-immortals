/**
 * 便签档 / MD可视化写作档 的 CSS 契约测试。
 *
 * 背景（本次整改的起因）：3.28.21 的「便签定宽」把 .tw-card 的
 *   width: auto; min-width:280px; max-width:400px
 * 改成了
 *   width: calc(340px * var(--tw-card-zoom, 1))
 * 而该规则打在**全局 .tw-card** 上 —— 写作档一并继承，卡片被拉成等宽长条并相互压叠。
 *
 * 根因不是「共用代码」，而是「写作档没有自己的作用域，只能靠覆盖便签的默认值」。
 * 本文件把两档的外观契约钉死：任何一档的默认值外溢到另一档，这里必须红。
 *
 * 实现说明：不用 jsdom 的 getComputedStyle —— 它对多类组合选择器的级联支持不可靠。
 * 这里直接解析样式表文本做结构断言，稳定且与运行环境无关。
 */
const fs = require('fs');
const path = require('path');

const NOTES_CSS = fs.readFileSync(
  path.join(__dirname, '../../styles/notes.css'), 'utf8'
);

/** 剥掉注释（内含 SVG data URI 等，避免干扰花括号解析）后取出所有规则 */
function parseRules(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) {
    out.push({ sel: m[1].replace(/\s+/g, ' ').trim(), body: m[2] });
  }
  return out;
}

const RULES = parseRules(NOTES_CSS);

/** 取选择器（整体包含，兼容逗号分组）命中的规则 */
function rulesMatching(selector) {
  return RULES.filter((r) => r.sel.split(',').some((s) => s.trim() === selector));
}

/** 取某条声明的值（未声明返回 null） */
function decl(body, prop) {
  const m = body.match(new RegExp('(?:^|;|\\n)\\s*' + prop + '\\s*:\\s*([^;]+)'));
  return m ? m[1].trim() : null;
}

/**
 * 同一选择器可能有多条规则（同特异度 → 靠源码顺序决胜，后者生效）。
 * 逐个属性取「最后一条声明」，得到真正生效的值。
 */
function effective(selector, props) {
  const res = {};
  rulesMatching(selector).forEach((r) => {
    props.forEach((p) => {
      const v = decl(r.body, p);
      if (v !== null) res[p] = v;
    });
  });
  return res;
}

describe('写作档（MD可视化写作）卡片外观契约', () => {
  test('写作档卡片宽度贴合内容，且必须有 max-width 封顶', () => {
    const eff = effective('.tw-canvas.tw-mode-write .tw-card', ['width', 'min-width', 'max-width']);
    // 宽度必须是「内在宽度」：max-content / fit-content / auto，不能是被便签定宽钉死的定值。
    // （下方「卡片宽度贴合内容」段用 max-content，以规避绝对定位 width:auto 在
    //   left 超出可见宽度时 shrink-to-fit 塌到 min-content 的问题。）
    expect(['max-content', 'fit-content', 'auto']).toContain(eff.width);
    expect(eff['min-width']).toBeTruthy();
    // 【本次事故的回归锁】3.28.21 定宽时删掉了基础 .tw-card 的 max-width，
    // 写作档的 max-content 失去上限 → 卡片按「最长一行」无限撑宽并相互压叠。
    // 缺了这条，上面的「贴合内容」就会变成「无限宽」。
    expect(eff['max-width']).toBeTruthy();
  });

  test('写作档卸掉便签的装饰资产（齿边 / 纸纹 / 抬头 / 纸样钮）', () => {
    const hidden = (frag) => {
      const hit = RULES.filter(
        (r) => r.sel.includes('tw-mode-write') && r.sel.includes(frag)
      );
      expect(hit.length).toBeGreaterThan(0);   // 针对该资产的隐藏规则必须存在
      return decl(hit[hit.length - 1].body, 'display');
    };
    expect(hidden('.tw-card-noise')).toBe('none');
    expect(hidden('.tw-card-head')).toBe('none');
    expect(hidden('.tw-card-paper')).toBe('none');
  });

  test('写作档卡片表面挂在 .tw-card-main（背景 / 边框 / 圆角）', () => {
    const r = rulesMatching('.tw-canvas.tw-mode-write .tw-card-main');
    expect(r.length).toBeGreaterThan(0);
    const body = r[r.length - 1].body;
    expect(decl(body, 'background')).toBeTruthy();
    expect(decl(body, 'border')).toBeTruthy();
    expect(decl(body, 'border-radius')).toBeTruthy();
  });
});

describe('两档不得互相外溢', () => {
  test('写作档的隐藏规则不得命中便签档（选择器必须带 tw-mode-write）', () => {
    // 「写作档才隐藏齿边/纸纹/抬头」这类规则，若写成不带模式作用域的形式，
    // 就会把便签档的纸样资产一起干掉。
    const offenders = RULES.filter((r) => {
      const hides = decl(r.body, 'display') === 'none';
      if (!hides) return false;
      const targetsNote = /\.tw-card-(noise|head|paper|edge)/.test(r.sel);
      if (!targetsNote) return false;
      if (r.sel.includes('tw-mode-write')) return false;   // 写作档专属隐藏，合法
      if (r.sel.includes('tw-lod')) return false;          // LOD 降级，合法
      if (r.sel.includes('data-paper')) return false;      // 纸样自身的取舍（如 shuyan 无齿边），合法
      return true;                                          // 其余＝无模式作用域地隐藏便签资产 = 外溢
    });
    expect(offenders.map((r) => r.sel)).toEqual([]);
  });

  test('便签档卡片保持定宽（回归锁：写作档不得把它顶掉）', () => {
    // 便签定宽已从基类 .tw-card 迁到便签档作用域（:where(...) 形式）。
    // 无论落在哪一处，便签档的宽度必须是「定值」而非 auto。
    const base = rulesMatching('.tw-card');
    expect(base.length).toBeGreaterThan(0);
    const scoped = rulesMatching('.tw-canvas.tw-mode-notes .tw-card')
      .concat(rulesMatching(':where(.tw-canvas.tw-mode-notes) .tw-card'));
    const bodies = [...base, ...scoped].map((r) => r.body);
    const widths = bodies.map((b) => decl(b, 'width')).filter(Boolean);
    expect(widths.length).toBeGreaterThan(0);
    expect(widths.some((w) => w.startsWith('calc(340px'))).toBe(true);
  });

  test('便签档作用域不得抬高特异度（否则压过市场纸样的覆盖）', () => {
    // 事故：width / box-shadow 从 .tw-card(0,1,0) 搬进 .tw-canvas.tw-mode-notes .tw-card(0,3,0)
    // 后，特异度被抬高 → 市场纸样用 .tw-card[data-paper="X"](0,2,0) 覆盖「不要投影 / 自适应宽度」
    // 的能力被压掉 → 透明切割式纸样多出一圈矩形投影（看起来像「多余的透明背景」）。
    // 故：模式部分必须用 :where() 归零，使本条与旧基类同为 (0,1,0)。
    const raised = RULES.filter((r) =>
      r.sel.split(',').some((s) => s.trim() === '.tw-canvas.tw-mode-notes .tw-card')
    );
    expect(raised.map((r) => r.sel)).toEqual([]);

    const zeroed = RULES.filter((r) => r.sel.includes(':where(.tw-canvas.tw-mode-notes)'));
    expect(zeroed.length).toBeGreaterThan(0);
  });
});
