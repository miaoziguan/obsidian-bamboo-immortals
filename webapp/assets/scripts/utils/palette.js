import { getCssVarRoot, getHost } from './domRef.js';

/**
 * HSL → "r, g, b" 通道字符串（供 rgb(var(--x-rgb)) / rgba(var(--x-rgb), a) 使用）。
 * 与 DisplayManager._hslToRgb 逐字一致，抽出为共享工具，便于画中卷等
 * 无 DisplayManager 的精简 iframe 视图也能重算派生 RGB 通道。
 */
function hslToRgbChannels(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))}`;
}

/**
 * 由色相派生并写入约 20 个 RGB 通道变量（--primary-rgb / --deep-rgb / ...），
 * 供 rgba(var(--xx-rgb), a) 半透明色使用。
 *
 * - 主视图 DisplayManager._applyHue 经此重算（lightnessOffset=null → 0，保持历史行为：
 *   明度由 hsl() 令牌承担，这里只用固定明度，避免主视图无关元素被明度滑块牵动）。
 * - 画中卷等无 DisplayManager 的 iframe 经 bridge.js 调用（传入 lightnessOffset 数值），
 *   把明度偏移一并叠入各通道明度，使寻呼机（使用 --*-rgb 静态通道）同时跟随主题
 *   「色相」与「明度」，修复此前停在默认竹青绿的问题。
 *
 * @param {number} hue 色相 0–360
 * @param {number|null} [lightnessOffset=null] 明度偏移百分比（画中卷寻呼机需同时跟随明度，
 *        传入数值；调用方（bridge.js）已有该值，直接传入，切勿在此用 getComputedStyle 读取）。
 */
export function applyDerivedRgb(hue, lightnessOffset = null) {
  const root = getCssVarRoot();
  if (!root) return;

  // 明度偏移由调用方直接传入数值（bridge.js 已有 lightnessOffset）。
  // ⚠️ 不要在此用 getComputedStyle 读取 --accent-lightness-offset：getCssVarRoot() 在
  // shadow 模式下返回的是【代理对象】而非真实元素，getComputedStyle(代理对象) 会抛
  // TypeError，导致整个函数中断、派生变量一个都写不出（画中卷寻呼机因此不跟随主题）。
  // 即使要读，也应改用 getGlobalComputedStyle()（domRef 已提供，从真实 host 读取）。
  const offset = (typeof lightnessOffset === 'number' && !isNaN(lightnessOffset))
    ? lightnessOffset
    : 0;
  // 把明度偏移叠到基础明度上，并夹紧到 [0,100]（hsl 超出范围会被浏览器裁剪，但
  // 这里提前夹紧可避免 JS 端 f() 在 l>1 时出现负系数而算出离谱的通道值）。
  const lift = (base) => Math.max(0, Math.min(100, base + offset));

  const darkHost = getHost();
  const isDark = (darkHost && darkHost.classList.contains('dark')) ||
                 (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const darkLift = isDark ? 10 : 0; // 暗色模式前景色明度提升（%）

  const set = (name, value) => root.style.setProperty(name, value);

  // 竹青绿主色 hsl(hue, 27%, 48%) → 暗色 hsl(hue, 27%, 58%) #5A9A5A → #82C382
  set('--primary-rgb', hslToRgbChannels(hue, 27, lift(48 + darkLift)));

  // 竹青深色 hsl(hue-7, 40%, 25%) → 暗色 hsl(hue-7, 40%, 28%) #2D5A27 → #2D5A35
  const deepRgb = hslToRgbChannels(hue - 7, 40, lift(25 + (isDark ? 3 : 0)));
  set('--deep-rgb', deepRgb);
  set('--bamboo-deep-rgb', deepRgb); // 票面文案 RGB 变量

  // 竹青浅色 hsl(hue, 35%, 75%) → 暗色 hsl(hue, 35%, 80%) #A8D5A8 → #BCE2BC
  set('--pale-rgb', hslToRgbChannels(hue, 35, lift(75 + (isDark ? 5 : 0))));

  // 票根背景 hsl(hue, 36%, 68%) → 暗色 hsl(hue, 36%, 78%) #94C694 → #B4E2B4
  set('--ticket-stub-bg-rgb', hslToRgbChannels(hue, 36, lift(68 + darkLift)));

  // 主色变体 hsl(hue, 28%, 55%) → 暗色 hsl(hue, 28%, 65%) #6BAE6B → #8CC58C
  set('--primary-alt-rgb', hslToRgbChannels(hue, 28, lift(55 + darkLift)));

  // 浅绿 hsl(hue, 27%, 83%) → 暗色 hsl(hue, 27%, 88%) #C8E0C8 → #D9EDD9
  set('--green-pale-rgb', hslToRgbChannels(hue, 27, lift(83 + (isDark ? 5 : 0))));

  // 亮绿 hsl(hue, 47%, 70%) → 暗色 hsl(hue, 47%, 78%) #8FD88F → #B0E7B0
  set('--green-bright-rgb', hslToRgbChannels(hue, 47, lift(70 + (isDark ? 8 : 0))));

  // 次绿 hsl(hue-16, 44%, 75%) → 暗色 hsl(hue-16, 44%, 82%)（hue 偏移较大，保留偏移）
  set('--green-alt-rgb', hslToRgbChannels(hue - 16, 44, lift(75 + (isDark ? 7 : 0))));

  // 极亮绿 hsl(hue, 72%, 79%) → 暗色 hsl(hue, 72%, 85%) #C8FF96 → #D6FFB5
  set('--green-very-bright-rgb', hslToRgbChannels(hue, 72, lift(79 + (isDark ? 6 : 0))));

  // 暗色模式表面色（卡片、面板背景等）
  set('--surface-dark-rgb', hslToRgbChannels(hue, 18, lift(10)));
  set('--surface-dark-rgb-mid', hslToRgbChannels(hue, 18, lift(13)));
  set('--surface-dark-rgb-end', hslToRgbChannels(hue, 18, lift(16)));
  set('--surface-deep-rgb', hslToRgbChannels(hue, 14, lift(8)));
  set('--surface-deep-alt-rgb', hslToRgbChannels(hue, 17, lift(10)));

  // 暗色模式淡绿基底（表面色）
  set('--pale-green-rgb-dark', hslToRgbChannels(hue, 18, lift(10)));
  set('--pale-green-alt-rgb-dark', hslToRgbChannels(hue, 18, lift(13)));
}
