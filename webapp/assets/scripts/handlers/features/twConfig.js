/**
 * twConfig.js — typewriterFeature 及其拆分出的子模块（CardViewManager /
 * CardInteractions / ModeController / PersistenceCoordinator / ViewportCuller）
 * 共享的「模块级常量」单一事实来源。
 *
 * 原这些常量散落在 typewriterFeature.js 顶层（裸名 const），被子方法直接引用。
 * 拆分单例后，子模块方法经 `Xxx.call(this, ...)` 委托执行，其体内裸名引用
 * 必须仍可被解析 —— 故收敛到本模块，统一 export；并在加载时挂到 globalThis，
 * 使测试 harness（loadModule 剥离 import）下剥离后的子模块仍能经全局解析到这些常量。
 */

// —— 内联单色 SVG 图标（stroke=currentColor，跟随按钮配色） ——
export const ICON_LAYERS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5"/></svg>`;
export const ICON_FONT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M12 6v13"/></svg>`;
export const ICON_GRID = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
export const ICON_PRINT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2"/><path d="M4 14h16"/><path d="M9 9V4h6v5"/></svg>`;
export const ICON_X = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(12 12) scale(0.8) translate(-12 -12)"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></g></svg>`;
export const ICON_FONT_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5 8.4 4.5 12.8 19.5"/><path d="M5.7 13.8h5.4"/><path d="M17.3 7v7.2"/><path d="m14.7 14.2 2.6 2.8 2.6-2.8"/></svg>`;
export const ICON_FONT_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5 8.4 4.5 12.8 19.5"/><path d="M5.7 13.8h5.4"/><path d="M17.3 17v-7.2"/><path d="m14.7 9.8 2.6-2.8 2.6 2.8"/></svg>`;
export const ICON_ZOOM_OUT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.2" y1="15.2" x2="20" y2="20"/><line x1="7.5" y1="10.5" x2="13.5" y2="10.5"/></svg>`;
export const ICON_ZOOM_IN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.2" y1="15.2" x2="20" y2="20"/><line x1="10.5" y1="7.5" x2="10.5" y2="13.5"/><line x1="7.5" y1="10.5" x2="13.5" y2="10.5"/></svg>`;
export const ICON_PAPER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3.5" width="11" height="11" rx="2"/><path d="M15 8.5H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7"/></svg>`;
export const ICON_EXPORT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`;
export const ICON_PREVIEW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
export const ICON_MOVE_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V6"/><path d="m5 13 7-7 7 7"/></svg>`;
export const ICON_MOVE_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v14"/><path d="m5 11 7 7 7-7"/></svg>`;
export const ICON_LV_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 13 6-6 6 6"/><path d="m6 19 6-6 6 6"/></svg>`;
export const ICON_LV_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 5 6 6 6-6"/><path d="m6 11 6 6 6-6"/></svg>`;
export const ICON_ROTATE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="m21 4-4 1.6L19.5 9"/></svg>`;
export const ICON_SPLIT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="4.5" width="15" height="15" rx="2.5"/><path d="M12 7.5v9"/></svg>`;

// 吐纸位叠放：新纸一律落在出纸口正上方，只做小幅纵向错位，像纸一张张叠出来。
export const STACK_STEP = 24;     // 每张新纸相对上一张的上移错位量(px)
export const STACK_LEVELS = 6;    // 叠放档位数：超过后回到最底层重新叠
export const TYPE_SPEED = 50;     // 每字间隔(ms)：缓慢打出的节奏（对齐 pager 原版）
export const MAX_LEN = 500;       // 单卡最大字数（便签档输入框上限同此值）
export const DRAFT_MAX_LEN = 20000; // 写作档输入框「草稿箱」上限：整篇长文可粘进来，打印时再由 splitDraft 拆成多块（单卡仍 ≤ MAX_LEN）
export const NOTE_CAP = 50;       // 便签上限：防 vault 文件无限膨胀（超出删最早）
export const WRITE_FLOW_GAP = 24; // 写作档「文章流」卡片间距
export const SAVE_DEBOUNCE = 350; // 写盘防抖(ms)，合并拖拽/删除等连续操作

// LOD 分级渲染阈值（带滞回，见 LOD_DENSITY_EXIT）
export const LOD_DENSITY = 120;       // 在屏卡数超过此值 → 进入 dense 降级
export const LOD_DENSITY_EXIT = 100;  // 已降级时，低于此值才退出（滞回带 = 20 张）
// 【写作档不做视口剔除】文章是线性文档、规模有限（通常几十~几百块），
// 而剔除会随「新建卡自动归位」/ 画布平移不断销毁重建卡片 DOM —— 这是可视化写作闪烁的根因
// （卡片甚至不到 20 张就开始闪）。文章块既少又便宜，虚拟化零收益、纯属负担。
// 故写作档在卡片数不超过此值时一律常驻挂载；超过才回退剔除，作安全兜底。
// 【补注·抖动根因已可治】上述「反复销毁重建」抖动的根因（每帧 createElement + 逐卡测量强制重排）
// 已在导图侧以「DOM 回收池复用 + 批量测量」根治（见 mindmapFeature._mountNode / _cullView / _batchMeasure）。
// 卡片画布（便签 + 超阈值的写作档）仍按此模式逐卡重建 DOM；若日后观测到可感知抖动，
// 可复用同一手法给 ViewportCuller.mountCard/unmountCard 上回收池，而无需放宽本阈值。
export const WRITE_NO_CULL_MAX = 300;
// 手动缩放范围
export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 2.4;
export const ZOOM_STEP = 0.08;    // ⌘/Ctrl+滚轮 每格步进（乘性，手感均匀）

// 字级档位
export const FONT_SCALES = [0.6, 0.72, 0.85, 1, 1.18, 1.4, 1.65, 1.95];
export const FONT_SCALE_DEFAULT_IDX = 3;
export const FONT_SCALE_LABELS = [
  '极小 60%', '很小 72%', '偏小 85%',
  '标准 100%',
  '偏大 118%', '很大 140%', '特大 165%', '超大 195%',
];
// 便签尺寸档位
export const CARD_SCALES = [0.7, 1, 1.35, 1.8];
export const CARD_SCALE_LABELS = ['S 小', 'M 标准', 'L 大', 'XL 特大'];
export const CARD_SCALE_DEFAULT_IDX = 1;

export const FONTS = ["classic", "modern", "kai"];
export const FONT_LABELS = { classic: "宋 A", modern: "黑 B", kai: "楷 C" };
export const FONT_FEEDBACK = { classic: "SERIF 宋体", modern: "SANS 黑体", kai: "KAI 楷体" };

// 便签纸张样式：与 base.css 的 .tw-card[data-paper="x"] 一一对应。
export const PAPERS = ["plain", "night", "shuyan", "redsilk", "ruoshui", "tengyun", "juhuo", "yingyue"];
export const PAPER_LABELS = { plain: "素笺", night: "夜光", shuyan: "书燕", redsilk: "红绸", ruoshui: "若水", tengyun: "腾云", juhuo: "举火", yingyue: "映月" };
export const PAPER_FEEDBACK = { plain: "素笺 PLAIN", night: "夜光 NIGHT", shuyan: "书燕 SHUYAN", redsilk: "红绸 REDSILK", ruoshui: "若水 RUOSHUI", tengyun: "腾云 TENGYUN", juhuo: "举火 JUHUO", yingyue: "映月 YINGYUE" };
export const PAPER_TITLES = { plain: "Bamboo Immortals", night: "Bamboo Immortals", shuyan: "BAMBOO IMMORTALS", redsilk: "BAMBOO IMMORTALS", ruoshui: "BAMBOO IMMORTALS", tengyun: "BAMBOO IMMORTALS", juhuo: "BAMBOO IMMORTALS", yingyue: "BAMBOO IMMORTALS" };

// MD可视化写作模式：结构级别
export const LEVELS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "quote", "ul", "ol", "task"];
export const LEVEL_LABELS = { p: "正文", h1: "H1", h2: "H2", h3: "H3", h4: "H4", h5: "H5", h6: "H6", quote: "引用", ul: "列表", ol: "编号", task: "任务" };
export const LEVEL_FEEDBACK = { p: "正文 BODY", h1: "标题 H1", h2: "标题 H2", h3: "标题 H3", h4: "标题 H4", h5: "标题 H5", h6: "标题 H6", quote: "引用 QUOTE", ul: "无序列表 LIST", ol: "编号列表 ORDERED", task: "任务清单 TASK" };
export const LEVEL_GROUPS = [
  { label: "标题", items: ["h1", "h2", "h3", "h4", "h5", "h6"] },
  { label: "基础", items: ["p", "quote"] },
  { label: "列表", items: ["ul", "ol", "task"] },
];
export const LEVEL_LADDER = ["h1", "h2", "h3", "h4", "h5", "h6", "p"];

// 定版纸样（书燕等）：文本区按比例预留、纸高固定，字放太大撑破留白 → 字级封顶见 FONT_MAX_IDX_FIXED；
// 流式纸样（素笺/夜光）字变大纸自然变长，可一路到最大档。固定集由 PAPERS 派生（去掉流式两类），新增定版纸样无需改 maxFontIdx。
export const FLOWING_PAPER_SET = new Set(['plain', 'night']);
export const FONT_MAX_IDX_FIXED = 5;   // 定版纸样字级封顶档位（对应 FONT_SCALES[5] = 很大 140%）

// MD可视化写作文档 schema 版本（与 TypewriterStore.WRITING_VERSION / WritingDoc.VERSION 同值，单一真源在此）
// v2 = x/y 与画布偏移统一绝对 px
// v3 = 引入 seq（顺序一等数据，唯一且连续 0..N-1）；x/y 自此退化为纯呈现。
//      迁移是**惰性**的：旧档无 seq，由 WritingDoc.normalize → normalizeSeq 按 orderIds
//      推导补齐（读档即升维、幂等、无需独立迁移脚本；_sanitizeNotes 透传新字段，落盘无损）。
export const WRITING_SCHEMA_VERSION = 3;

// 测试 harness（loadModule 剥离 import）兼容：把常量挂到 globalThis，
// 使剥离 import 后的子模块体内裸名引用仍可经全局解析。
if (typeof globalThis !== 'undefined') {
  globalThis.ICON_LAYERS = ICON_LAYERS;
  globalThis.ICON_FONT = ICON_FONT;
  globalThis.ICON_GRID = ICON_GRID;
  globalThis.ICON_PRINT = ICON_PRINT;
  globalThis.ICON_X = ICON_X;
  globalThis.ICON_FONT_DOWN = ICON_FONT_DOWN;
  globalThis.ICON_FONT_UP = ICON_FONT_UP;
  globalThis.ICON_ZOOM_OUT = ICON_ZOOM_OUT;
  globalThis.ICON_ZOOM_IN = ICON_ZOOM_IN;
  globalThis.ICON_PAPER = ICON_PAPER;
  globalThis.ICON_EXPORT = ICON_EXPORT;
  globalThis.ICON_PREVIEW = ICON_PREVIEW;
  globalThis.ICON_MOVE_UP = ICON_MOVE_UP;
  globalThis.ICON_MOVE_DOWN = ICON_MOVE_DOWN;
  globalThis.ICON_LV_UP = ICON_LV_UP;
  globalThis.ICON_LV_DOWN = ICON_LV_DOWN;
  globalThis.ICON_ROTATE = ICON_ROTATE;
  globalThis.ICON_SPLIT = ICON_SPLIT;
  globalThis.STACK_STEP = STACK_STEP;
  globalThis.STACK_LEVELS = STACK_LEVELS;
  globalThis.TYPE_SPEED = TYPE_SPEED;
  globalThis.MAX_LEN = MAX_LEN;
  globalThis.DRAFT_MAX_LEN = DRAFT_MAX_LEN;
  globalThis.NOTE_CAP = NOTE_CAP;
  globalThis.WRITE_FLOW_GAP = WRITE_FLOW_GAP;
  globalThis.SAVE_DEBOUNCE = SAVE_DEBOUNCE;
  globalThis.LOD_DENSITY = LOD_DENSITY;
  globalThis.LOD_DENSITY_EXIT = LOD_DENSITY_EXIT;
  globalThis.WRITE_NO_CULL_MAX = WRITE_NO_CULL_MAX;
  globalThis.ZOOM_MIN = ZOOM_MIN;
  globalThis.ZOOM_MAX = ZOOM_MAX;
  globalThis.ZOOM_STEP = ZOOM_STEP;
  globalThis.FONT_SCALES = FONT_SCALES;
  globalThis.FONT_SCALE_DEFAULT_IDX = FONT_SCALE_DEFAULT_IDX;
  globalThis.FONT_SCALE_LABELS = FONT_SCALE_LABELS;
  globalThis.CARD_SCALES = CARD_SCALES;
  globalThis.CARD_SCALE_LABELS = CARD_SCALE_LABELS;
  globalThis.CARD_SCALE_DEFAULT_IDX = CARD_SCALE_DEFAULT_IDX;
  globalThis.FONTS = FONTS;
  globalThis.FONT_LABELS = FONT_LABELS;
  globalThis.FONT_FEEDBACK = FONT_FEEDBACK;
  globalThis.PAPERS = PAPERS;
  globalThis.PAPER_LABELS = PAPER_LABELS;
  globalThis.PAPER_FEEDBACK = PAPER_FEEDBACK;
  globalThis.PAPER_TITLES = PAPER_TITLES;
  globalThis.LEVELS = LEVELS;
  globalThis.LEVEL_LABELS = LEVEL_LABELS;
  globalThis.LEVEL_FEEDBACK = LEVEL_FEEDBACK;
  globalThis.LEVEL_GROUPS = LEVEL_GROUPS;
  globalThis.LEVEL_LADDER = LEVEL_LADDER;
  globalThis.FLOWING_PAPER_SET = FLOWING_PAPER_SET;
  globalThis.FONT_MAX_IDX_FIXED = FONT_MAX_IDX_FIXED;
  globalThis.WRITING_SCHEMA_VERSION = WRITING_SCHEMA_VERSION;
}
