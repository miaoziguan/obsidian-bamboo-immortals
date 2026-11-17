declare const activeDocument: Document;

/** 模块「编辑区顶光」的可调参数；模块是配置真源，宿主只镜像执行与持久化。 */
export interface AmbientConfig {
  enabled: boolean;
  /** 光带不透明度 0..100 */
  intensity: number;
  /** 光带高度 px，40..320 */
  height: number;
  /** 光色 #rrggbb */
  color: string;
  /** focus = 仅编辑区获得焦点时显现；always = 常驻 */
  mode: 'focus' | 'always';
  /** follow = 暗色沿用同一组参数；custom = 暗色独立参数 */
  darkMode: 'follow' | 'custom';
  darkIntensity: number;
  darkColor: string;
  breathe: boolean;
  /** 呼吸周期秒，2..12 */
  period: number;
}

export const DEFAULT_AMBIENT: AmbientConfig = {
  enabled: false,
  intensity: 42,
  height: 148,
  color: '#e0a35c',
  mode: 'focus',
  darkMode: 'follow',
  darkIntensity: 42,
  darkColor: '#6fa8a0',
  breathe: false,
  period: 6,
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const VARS = [
  '--bamboo-ambient-height',
  '--bamboo-ambient-glow',
  '--bamboo-ambient-tail',
  '--bamboo-ambient-dark-glow',
  '--bamboo-ambient-dark-tail',
  '--bamboo-ambient-period',
];

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.max(min, Math.min(max, n)));
}

function hex(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value) ? value.toLowerCase() : fallback;
}

function rgba(color: string, intensity: number, tail: boolean): string {
  const n = parseInt(color.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const alpha = (intensity / 100) * (tail ? 0.16 : 0.62);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

/** 把不可信的模块入参收敛为合法配置；任何字段缺失或越界都退回默认值。 */
function normalizeAmbient(raw: unknown): AmbientConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<AmbientConfig>;
  return {
    enabled: typeof r.enabled === 'boolean' ? r.enabled : DEFAULT_AMBIENT.enabled,
    intensity: num(r.intensity, DEFAULT_AMBIENT.intensity, 0, 100),
    height: num(r.height, DEFAULT_AMBIENT.height, 40, 320),
    color: hex(r.color, DEFAULT_AMBIENT.color),
    mode: r.mode === 'always' ? 'always' : 'focus',
    darkMode: r.darkMode === 'custom' ? 'custom' : 'follow',
    darkIntensity: num(r.darkIntensity, DEFAULT_AMBIENT.darkIntensity, 0, 100),
    darkColor: hex(r.darkColor, DEFAULT_AMBIENT.darkColor),
    breathe: typeof r.breathe === 'boolean' ? r.breathe : DEFAULT_AMBIENT.breathe,
    period: num(r.period, DEFAULT_AMBIENT.period, 2, 12),
  };
}

/**
 * 把顶光参数落到 Obsidian 主文档：body 类切换开关/时机/动画，
 * 颜色与尺寸走独立命名空间的 CSS 变量，不触碰 ThemeBridge 的调色变量。
 */
export function applyAmbient(raw: unknown): AmbientConfig {
  const cfg = normalizeAmbient(raw);
  const body = activeDocument.body;
  body.classList.toggle('bamboo-ambient-on', cfg.enabled);
  body.classList.toggle('bamboo-ambient-always', cfg.enabled && cfg.mode === 'always');
  body.classList.toggle('bamboo-ambient-breathe', cfg.enabled && cfg.breathe);
  body.style.setProperty('--bamboo-ambient-height', `${cfg.height}px`);
  body.style.setProperty('--bamboo-ambient-glow', rgba(cfg.color, cfg.intensity, false));
  body.style.setProperty('--bamboo-ambient-tail', rgba(cfg.color, cfg.intensity, true));
  body.style.setProperty('--bamboo-ambient-period', `${cfg.period}s`);
  if (cfg.darkMode === 'custom') {
    body.style.setProperty('--bamboo-ambient-dark-glow', rgba(cfg.darkColor, cfg.darkIntensity, false));
    body.style.setProperty('--bamboo-ambient-dark-tail', rgba(cfg.darkColor, cfg.darkIntensity, true));
  } else {
    body.style.removeProperty('--bamboo-ambient-dark-glow');
    body.style.removeProperty('--bamboo-ambient-dark-tail');
  }
  return cfg;
}

/** 插件卸载时清掉行内变量与 body 类，避免在 Obsidian 主文档留残留。 */
export function clearAmbient(): void {
  const body = activeDocument.body;
  body.classList.remove('bamboo-ambient-on', 'bamboo-ambient-always', 'bamboo-ambient-breathe');
  for (const key of VARS) body.style.removeProperty(key);
}
