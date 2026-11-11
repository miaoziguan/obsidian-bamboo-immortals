/**
 * 写作档「层级配色」开关的契约测试。
 *
 * 背景：给不同级别的卡片铺不同底色，历史上做过又被否决过（notes.css 里
 * 「已废弃·勿再加回」注释），当时失败点是「无条件整卡 8% 平涂 → 白卡糊成淡紫」。
 * 本次改为「默认关的可选开关 + 彩虹色相 + 正文也参与」，本文件把这几条不变量
 * 钉死，避免以后被当成「旧方案复活」误删，或被改回无条件铺色。
 *
 * 四个已踩过的坑，各有断言守着：
 *   ① 强度太低（5%–12%）在白底上肉眼不可见 → 混色比例下限断言；
 *   ② 用 color-mix 与 --surface-solid 混色 → 暗色深绿底把 11 个色相全拉成黄绿
 *      （实测 h1 粉红变 100,84,15），故必须「半透明层叠加」而非「两色混合」；
 *   ③ 徽章与卡面各持一套色板（靛蓝阶 vs 彩虹）→ 用户反馈「各自为政」，现有
 *      「单一真源」断言：色值只存于 --bm-tint-src-*，--lv-* 一律转发，暗色不得重设；
 *   ④ 徽章文字直接用满饱和色相 → 同色淡底上糊掉；用 oklch 混墨色又会转色相
 *      （黄字偏成红棕），故钉死「srgb 混 --tw-write-ink」这一种写法。
 *
 * 与 modeCssContract 同一套实现思路：直接解析 notes.css 文本做结构断言，
 * 不依赖 jsdom 的级联计算。
 */
const fs = require('fs');
const path = require('path');

const NOTES_CSS = fs.readFileSync(
  path.join(__dirname, '../../styles/notes.css'), 'utf8'
);
const ZOOM_JS = fs.readFileSync(
  path.join(__dirname, '../services/CanvasZoomUI.js'), 'utf8'
);
const TWF_JS = fs.readFileSync(
  path.join(__dirname, '../handlers/features/typewriterFeature.js'), 'utf8'
);
const MODE_JS = fs.readFileSync(
  path.join(__dirname, '../handlers/features/ModeController.js'), 'utf8'
);

/** 剥注释后取出所有规则 */
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

const LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'quote', 'ul', 'ol', 'task', 'p'];

/** 命中「按层级铺色」的规则（带 data-level 且声明 --bm-tint-mix） */
function tintMixRules(dark) {
  return RULES.filter((r) => {
    const sels = r.sel.split(',').map((s) => s.trim());
    return sels.some((s) => {
      const wantDark = s.startsWith(':root.dark') || s.startsWith(':host(.dark)');
      return wantDark === dark
        && /\.tw-card\[data-level="[a-z0-9]+"\]$/.test(s)
        && /--bm-tint-mix:/.test(r.body);
    });
  });
}

describe('写作档层级配色开关', () => {
  /** 真正执行铺色的规则（既有 background 声明、又消费 --bm-tint-mix） */
  const paintRules = () => RULES.filter(
    (r) => /background/.test(r.body) && /var\(--bm-tint-mix/.test(r.body)
  );

  test('铺色规则全部受 .tw-lv-tint 门控（默认关时不改任何卡面）', () => {
    const paint = paintRules();
    expect(paint.length).toBeGreaterThan(0);
    paint.forEach((r) => {
      r.sel.split(',').forEach((s) => {
        expect(s).toContain('.tw-lv-tint');
      });
    });
  });

  test('铺色用 oklch（感知均匀）而非 srgb，避免多层级叠成灰', () => {
    const paint = paintRules();
    expect(paint.length).toBeGreaterThan(0);
    paint.forEach((r) => {
      expect(r.body).toContain('color-mix(in oklch');
      expect(r.body).not.toContain('color-mix(in srgb, var(--bm-tint');
    });
  });

  test('用「半透明层叠加」而非「与表面色混色」（混色会被主题底色污染色相）', () => {
    // 曾经的 bug：color-mix(in oklch, tint 40%, var(--surface-solid))。
    // 暗色表面是深绿(hue≈145)，与粉红(hue≈15)混后 hue≈93 —— 11 个色相全成黄绿，
    // 彩虹彻底失效（实测 h1 = 100,84,15）。叠加则色相只由 tint 决定。
    paintRules().forEach((r) => {
      expect(r.body).toMatch(/background-color:\s*var\(--surface-solid\)/);
      expect(r.body).toMatch(/background-image:\s*linear-gradient\(/);
      // color-mix 的第二个颜色必须是 transparent，而不是 var(--surface-solid)
      expect(r.body).toMatch(/var\(--bm-tint-mix[^)]*\)\s*,\s*transparent\s*\)/);
    });
  });

  test('亮/暗两套都定义了全部具名级别（h1-h6 / quote / ul / ol / task）', () => {
    const named = LEVELS.filter((lv) => lv !== 'p');
    [false, true].forEach((dark) => {
      const covered = tintMixRules(dark).map((r) => {
        const m = r.sel.match(/data-level="([a-z0-9]+)"/);
        return m ? m[1] : '';
      });
      named.forEach((lv) => {
        expect(covered).toContain(lv);
      });
    });
  });

  test('正文 p 参与铺色，但强度必低于任一标题（不能抢标题）', () => {
    [false, true].forEach((dark) => {
      const mixOf = (lv) => {
        const r = tintMixRules(dark).find((x) => new RegExp('data-level="' + lv + '"').test(x.sel));
        const m = r && r.body.match(/--bm-tint-mix:\s*([\d.]+)%/);
        return m ? parseFloat(m[1]) : NaN;
      };
      // 用户要求「正文也得有颜色」→ 不再允许 0%（0% 会在满屏彩卡里露出一张白纸）
      expect(mixOf('p')).toBeGreaterThan(0);
      LEVELS.filter((lv) => lv.startsWith('h')).forEach((lv) => {
        expect(mixOf('p')).toBeLessThan(mixOf(lv));
      });
    });
  });

  test('正文 p 取低彩度中性色（有颜色，但不与标题抢戏）', () => {
    // 11 个色相里 p 的彩度必须是最低档：彩虹可以有，但正文不能变成第 12 个主角。
    const chromaOf = (hex) => {
      const n = parseInt(hex.replace('#', ''), 16);
      const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      const X = (rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805) / 0.95047;
      const Y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      const Z = (rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505) / 1.08883;
      const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
      return Math.hypot(500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z)));
    };
    const srcOf = (lv) => {
      const m = NOTES_CSS.match(new RegExp('--bm-tint-src-' + lv + ':\\s*(#[0-9A-Fa-f]{6})'));
      expect(m).toBeTruthy();
      return m[1];
    };
    const pChroma = chromaOf(srcOf('p'));
    LEVELS.filter((lv) => lv !== 'p').forEach((lv) => {
      expect(pChroma).toBeLessThan(chromaOf(srcOf(lv)));
    });
  });

  test('徽章与卡面同源：--lv-* 只做转发，色值仅存于 --bm-tint-src-*', () => {
    // 用户反馈「左上角徽章要和卡片配色统一，不要各自为政」：当时徽章/描边走一套
    // 有序靛蓝阶、卡面走彩虹 —— 同一张卡上两个颜色，像两套体系。
    // 现收敛为单一真源：色值只在 --bm-tint-src-* 出现一次，--lv-* 一律转发。
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'quote', 'ul', 'ol', 'task'].forEach((lv) => {
      expect(NOTES_CSS).toMatch(new RegExp('--lv-' + lv + ':\\s*var\\(--bm-tint-' + lv + '\\)'));
    });
    LEVELS.forEach((lv) => {
      expect(NOTES_CSS).toMatch(new RegExp('--bm-tint-src-' + lv + ':\\s*#[0-9A-Fa-f]{6}'));
      expect(NOTES_CSS).toMatch(
        new RegExp('--bm-tint-' + lv + ':\\s*var\\(--bm-tint-src-' + lv + '\\)')
      );
    });
    // 卡面铺色不得再引用 --lv-color（反向依赖会让两套色板再次纠缠）
    paintRules().forEach((r) => expect(r.body).not.toContain('var(--lv-color)'));
    // 而 --lv-color 的消费方（徽章底/描边/文字）必须还在
    expect(RULES.some((r) => /var\(--lv-color\)/.test(r.body))).toBe(true);
  });

  test('暗色块不得重设 --lv-h*/--lv-quote/--lv-ul/--lv-ol/--lv-task', () => {
    // 一旦暗色再写一遍 --lv-*，就又回到「卡面换了、徽章没换」的两套色板。
    // 只允许 --lv-p 例外（正文徽章用的中绿，深底需提亮，理由见 notes.css）。
    const darkBlocks = RULES.filter((r) => /^:host\(\.dark\)\s*$/.test(r.sel));
    expect(darkBlocks.length).toBeGreaterThan(0);
    darkBlocks.forEach((r) => {
      expect(r.body).not.toMatch(/--lv-(h[1-6]|quote|ul|ol|task)\s*:/);
    });
  });

  test('徽章文字：同色相但要偏墨（srgb 混 --tw-write-ink），不能直接用满饱和色', () => {
    // 同一选择器在本文件里出现两次（定位块 / 文字色块），故按「声明了 color:」筛选。
    const inkRules = RULES
      .filter((r) => r.sel === '.tw-canvas.tw-mode-write .tw-card-level')
      .filter((r) => /(?:^|;)\s*color:/.test(r.body));
    expect(inkRules.length).toBeGreaterThan(0);
    inkRules.forEach((r) => {
      // 直接 var(--lv-color) 会在「同色淡底」上糊掉（实测黄字压黄底仅 2.8，低于 AA）
      expect(r.body).not.toMatch(/(?:^|;)\s*color:\s*var\(--lv-color\)/);
      // 必须 srgb 而非 oklch：oklch 沿色相环较短弧插值，会把色相一起转走
      // （实测亮色 h2 橙字偏 61°、h3 黄字偏成红棕 62°，徽章又和卡面不是一个颜色）
      expect(r.body).toMatch(/color:\s*color-mix\(in srgb, var\(--lv-color\)/);
      // 混色对象必须是模式墨色（亮=墨黑 / 暗=亮灰），才能两套主题都读出字来
      expect(r.body).toMatch(/color:\s*color-mix\(in srgb[^;]*var\(--tw-write-ink\)/);
      // 反向锁死 oklch 写法（会被色相环插值带偏）
      expect(r.body).not.toMatch(/color:\s*color-mix\(in oklch, var\(--lv-color\)/);
    });
  });

  test('徽章底也从 --lv-color 派生（同色相），且 hover 不把文字改回满饱和', () => {
    const bgRules = RULES.filter((r) => /\.tw-card-level/.test(r.sel)
      && /background:.*var\(--lv-color\)/.test(r.body));
    expect(bgRules.length).toBeGreaterThan(0);
    bgRules.forEach((r) => expect(r.body).toMatch(/color-mix\(in srgb, var\(--lv-color\)/));
    RULES.filter((r) => /hover/.test(r.sel) && /tw-card-level/.test(r.sel))
      .forEach((r) => expect(r.body).not.toMatch(/color:\s*var\(--lv-color\)/));
  });

  test('标题梯度递减：H1 混色比例 > H6（层级是序数，不能乱序）', () => {
    [false, true].forEach((dark) => {
      const mixOf = (lv) => {
        const r = tintMixRules(dark).find((x) => new RegExp('data-level="' + lv + '"').test(x.sel));
        const m = r && r.body.match(/--bm-tint-mix:\s*([\d.]+)%/);
        return m ? parseFloat(m[1]) : NaN;
      };
      expect(mixOf('h1')).toBeGreaterThan(mixOf('h6'));
    });
  });

  test('ul / ol / task 三者混色比例互不相同（暗底上靠明度错开而非只靠色相）', () => {
    [false, true].forEach((dark) => {
      const vals = ['ul', 'ol', 'task'].map((lv) => {
        const r = tintMixRules(dark).find((x) => new RegExp('data-level="' + lv + '"').test(x.sel));
        const m = r && r.body.match(/--bm-tint-mix:\s*([\d.]+)%/);
        return m ? parseFloat(m[1]) : NaN;
      });
      expect(new Set(vals).size).toBe(3);
    });
  });

  test('铺色档下分幕不再改底色（避免与层级色叠加成第三种颜色）', () => {
    const actRule = RULES.filter((r) => {
      const sels = r.sel.split(',').map((s) => s.trim());
      return sels.some((s) => s.includes('.tw-lv-tint') && s.includes('[data-act="1"]'));
    });
    expect(actRule.length).toBeGreaterThan(0);
    actRule.forEach((r) => {
      // 背景必须仍是「层级色 + 底色」的同一套算法，而不是另一层 data-act 底纹
      expect(r.body).not.toMatch(/var\(--tw-write-ink\)\s*\)/);
    });
  });

  test('工具栏按钮：data-act="tint" 存在，且有 [hidden] 兜底（button 的 inline-flex 会压过 UA）', () => {
    expect(ZOOM_JS).toContain('data-act="tint"');
    // CanvasZoomUI 只负责「读」adapter，赋值在 typewriterFeature 的 adapter 对象里：
    // 这里分开断言，避免「只加按钮不接回调」也能蒙混过关。
    expect(ZOOM_JS).toMatch(/adapter\.onTint/);
    expect(ZOOM_JS).toMatch(/adapter\.isTintActive/);
    expect(TWF_JS).toMatch(/onTint:\s*\(\)\s*=>/);
    expect(TWF_JS).toMatch(/isTintActive:\s*\(\)\s*=>/);
    expect(NOTES_CSS).toContain('.tw-zoom-bar .tw-zoom-tint[hidden]');
  });

  test('层级配色键的图标用业务色板绘制（不是与配色无关的 currentColor 线条）', () => {
    // 用户反馈：原来的「三条递减横线」读起来像列表/对齐，跟这套配色对不上。
    // 现改成六段色环 —— 六段分别取 --bm-tint-h1/h3/h4/h5/h6/quote，图标本身就是功能预览。
    const btn = ZOOM_JS.match(/data-act="tint"[\s\S]*?<\/button>/);
    expect(btn).toBeTruthy();
    const html = btn[0];
    const hues = new Set(html.match(/var\(--bm-tint-[a-z0-9]+\)/g) || []);
    expect(hues.size).toBeGreaterThanOrEqual(5);
    // 反向锁：不许退回那三条 currentColor 横线
    expect(html).not.toMatch(/d="M4 6h16"/);
    expect(html).not.toMatch(/stroke="currentColor"/);
  });

  test('按档位显隐：只有写作档露出层级配色键', () => {
    expect(MODE_JS).toContain("querySelector('.tw-zoom-tint')");
    expect(MODE_JS).toMatch(/tintBtn\.hidden\s*=\s*P\.id\s*!==\s*'write'/);
  });

  test('开关默认关，且持久化走 storageManager（不动卡片数据模型）', () => {
    expect(TWF_JS).toMatch(/_levelTint\s*=\s*false/);
    expect(TWF_JS).toContain("putSetting('typewriter:levelTint'");
    expect(TWF_JS).toContain("getSetting('typewriter:levelTint'");
    // 只切 canvas class，不改 note 字段
    expect(TWF_JS).toMatch(/classList\.toggle\('tw-lv-tint'/);
    expect(TWF_JS).not.toMatch(/notes.*levelTint|levelTint.*notes/);
  });
});
