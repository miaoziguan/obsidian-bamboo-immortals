const { loadModule } = require('./__helpers__/testUtils.js');

// 主题动效面板的 per-theme 饱和度：存进 _themeSettings[主题][亮/暗].saturation，
// 应用到 #themeEffectSection 的 --accent-saturation-scale（主题作者的 --theme-sat = 基础% × 该系数）。
const section = document.createElement('div');
const setSetting = jest.fn();
const { ThemeEffects } = loadModule('modules/theme-effects.js', ['ThemeEffects'], {
  byId: (id) => (id === 'themeEffectSection' ? section : null),
  StorageAdapter: { set: setSetting, get: () => null },
  StorageKeys: { THEME_SETTINGS: 'themeSettings' },
});

function reset(theme) {
  ThemeEffects._themeSettings = {};
  ThemeEffects._settingsLoaded = true;     // 跳过 localStorage 读取
  ThemeEffects.currentTheme = theme || 'th1';
  section.style.cssText = '';
  setSetting.mockClear();
}

describe('主题动效 per-theme 饱和度', () => {
  beforeEach(() => reset('th1'));

  test('默认饱和度为 null（自动，跟随全局）', () => {
    expect(ThemeEffects._getModeSetting('th1', 'light').saturation).toBeNull();
  });

  test('设置 50% → --accent-saturation-scale=0.5 应用到主题区', () => {
    ThemeEffects._setThemeSetting('th1', 'saturation', 50);
    expect(ThemeEffects._getModeSetting('th1', 'light').saturation).toBe(50);
    expect(section.style.getPropertyValue('--accent-saturation-scale')).toBe('0.5');
    expect(setSetting).toHaveBeenCalled();
  });

  test('复位为 null → 移除该变量（回退全局）', () => {
    ThemeEffects._setThemeSetting('th1', 'saturation', 120);
    expect(section.style.getPropertyValue('--accent-saturation-scale')).toBe('1.2');
    ThemeEffects._setThemeSetting('th1', 'saturation', null);
    expect(section.style.getPropertyValue('--accent-saturation-scale')).toBe('');
  });

  test('色相 / 明度 / 饱和度互不干扰（同一模式独立存）', () => {
    ThemeEffects._setThemeSetting('th1', 'hue', 200);
    ThemeEffects._setThemeSetting('th1', 'saturation', 70);
    const cur = ThemeEffects._getModeSetting('th1', 'light');
    expect(cur.hue).toBe(200);
    expect(cur.saturation).toBe(70);
    expect(cur.lightness).toBeNull();
  });

  test('亮/暗两套各自独立保存', () => {
    ThemeEffects._setThemeSetting('th1', 'saturation', 60);
    const html = ThemeEffects._themeSettings['th1'];
    expect(html.light.saturation).toBe(60);
    expect(html.dark.saturation).toBeNull();
  });
});
