/**
 * typewriterFeature.js — 画中卷·复古寻呼机打字应用
 * （视觉移植自 v0「Vintage Pager」的 Motorola Beeper：绿壳 + 黑屏荧光绿 + 橙钮）
 *
 * 作为「画中卷」容器（ScrollManager）注册的独立功能挂载。自包含：
 * 拥有独立 DOM 与全部交互（黑屏荧光绿输入 → 点 PRINT → 生成纸条卡片 →
 * 逐字打出 → 卡片拖拽）。
 *
 * 交互：
 *  - 绿色外壳寻呼机（#8cc63f）+ 近黑屏幕（#0a1205）+ 荧光绿文字（#33ff00）；
 *  - 圆形黑键（相机/字体切换/一键排版）+ 橙色 PRINT 大钮 + MOTOROLA 品牌标；
 *  - 输入文字 → 点 PRINT（或 回车 / Ctrl·Cmd+Enter）→ 画布生成一张米白纸条；
 *  - 卡片逐字缓慢打出（50ms），带脉冲光标；可拖拽到任意位置；可移除。
 *
 * 持久化：写好的便签经 bridge → VaultStorage 落盘到 vault（独立 typewriter-notes.json），
 * 下次打开画中卷自动重建（直接显示全文，不重放打字动画），最多保留 NOTE_CAP 张。
 *
 * 隐私兼容：工作台根 class 为 .scroll-workbench，PrivacyMode.markText 会照常补打
 * data-private-text，进而被 base.css 隐私模糊规则命中（纳入模糊）。
 */

// 存储契约收敛到 TypewriterStore（schema/版本/校验/备份/读后写，绕开只认数组的专用方法）
import { TypewriterStore } from '../../services/TypewriterStore.js';
// P8 空间索引：把「每张卡 occupy 的网格单元」建索引，cull/框选/命中从 O(n) 降到 O(可视)
import { SpatialIndex } from '../../services/SpatialIndex.js';
// 思维子弹（产品名，即原「思维导图」）是**独立文档**（自己的节点树 + 自己的视野），
// 只在旋钮拨到子弹位时挂载显示。便签侧因此彻底不用再管它：
// 不再有「进入导图前的自由布局快照」，也不再改写便签坐标。
import { MindmapFeature } from './mindmapFeature.js';
// 连线层（便签与思维子弹共用的「节点-线」渲染/交互/控件）
import { LinkLayer } from '../../services/LinkLayer.js';
// 写作档便签的纯逻辑数据模型（与 MindmapDoc 同构）：读档净化 / 不可变增改 / 落盘形状。
// 本 feature 以 this._notes 为规范模型，DOM 只是它的投影（详见 _collectNotes / _restore）。
import { WritingDoc } from './writingDoc.js';
// 文本输入来源判定（Shadow DOM 安全）：见 utils/domRef 的 isFromTextEntry 注释
import { isFromTextEntry } from '../../utils/domRef.js';
// 撤销/重做栈（快照式；便签与导图各持一份，见 services/undoStack.js）
import { UndoStack } from '../../services/undoStack.js';

// —— 内联单色 SVG 图标（stroke=currentColor，跟随按钮配色） ——
// 便签样式切换：层叠纸张，表达「多种纸样循环」
const ICON_LAYERS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5"/></svg>`;
const ICON_FONT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M12 6v13"/></svg>`;
const ICON_GRID = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
const ICON_PRINT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2"/><path d="M4 14h16"/><path d="M9 9V4h6v5"/></svg>`;
// 删除用垃圾桶（与思维子弹同一造型，统一「删除」语义）。
// 【光学尺寸】垃圾桶原始几何为 18×20，比同排放大镜（16×16）高出 25%，
// 直接放进 1.5 描边的线性工具条会明显「大一圈」。故整体等比缩放 0.8 装进同一 16×16 光学框
// （两者中心都是 (12,12)，缩放后等高、同心）；stroke 反向补偿 1.5/0.8=1.875，
// 使缩放后视觉描边仍为 1.5，与邻居等粗。
const ICON_X = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(12 12) scale(0.8) translate(-12 -12)"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></g></svg>`;
// —— 外围工具条图标：统一 24 视框 + 1.5 描边 ——
// 不用 A− / A+ 这类文本字符当控件：字体渲染在不同系统下基线、字重、符号长度都不同，
// 是廉价感的主要来源。全部换成统一几何的 SVG，小尺寸下的细描边也更精致。
// 【光学尺寸】原 A↓/A↑ 仅 10.5 高（同排放大镜 16），且重心落在 y=10.75 而非 12：
// 不只是矮，还整体偏上。这里把字形拉高到 15（顶点 5.5→4.5、脚底 16→19.5），
// 箭头同步放大到 10 高以维持「主字形 : 箭头 ≈ 3:2」的原有从属关系，整体重新居中到 (12,12)。
// 宽度刻意控在 15.9（不超放大镜 16 的边界）——等比放大会撑宽到 20+，反而破坏节奏。
// 横杠取脚底起 38% 处（与旧版同一位置比率），端点 5.7/11.1 精确落在两条斜边上。
const ICON_FONT_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5 8.4 4.5 12.8 19.5"/><path d="M5.7 13.8h5.4"/><path d="M17.3 7v7.2"/><path d="m14.7 14.2 2.6 2.8 2.6-2.8"/></svg>`;
const ICON_FONT_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5 8.4 4.5 12.8 19.5"/><path d="M5.7 13.8h5.4"/><path d="M17.3 17v-7.2"/><path d="m14.7 9.8 2.6-2.8 2.6 2.8"/></svg>`;
// 缩放用放大镜 +/−：业界「zoom」通用符号，与字号 A↓/A↑ 区分清晰
const ICON_ZOOM_OUT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.2" y1="15.2" x2="20" y2="20"/><line x1="7.5" y1="10.5" x2="13.5" y2="10.5"/></svg>`;
const ICON_ZOOM_IN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.2" y1="15.2" x2="20" y2="20"/><line x1="10.5" y1="7.5" x2="10.5" y2="13.5"/><line x1="7.5" y1="10.5" x2="13.5" y2="10.5"/></svg>`;
// 切换便签样式：扁平「叠纸」，与工具条其它图标同一语言（线性、stroke 1.5）。
// 不用寻呼机上的 ICON_LAYERS：那是等轴测 3D 造型且描边 2.0，
// 是为大圆钮设计的，放进 1.5 描边的线性工具条里会明显更重、不成系统。
const ICON_PAPER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3.5" width="11" height="11" rx="2"/><path d="M15 8.5H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7"/></svg>`;
// 导出为 Markdown：向下箭头落入托盘（download/export 通用语义），与「切换字体」区分。
// 仅用于思维子弹模式下第二个机身键（便签模式仍是 ICON_FONT，不干扰）。
const ICON_EXPORT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`;
// 整篇预览：眼睛（查看/预览通用语义）。
// 仅用于 MD可视化写作模式下第一个机身键（#twPaper），便签/导图模式仍是 ICON_LAYERS，不干扰。
const ICON_PREVIEW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
// 写作档卡片工具条专用：上移/下移（文章顺序）用「带杆箭头」，层级± 用「双箭头（无杆）」——
// 两组都是上下向，必须靠「有没有杆」拉开辨识度，否则小尺寸下根本分不清。
const ICON_MOVE_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V6"/><path d="m5 13 7-7 7 7"/></svg>`;
const ICON_MOVE_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v14"/><path d="m5 11 7 7 7-7"/></svg>`;
const ICON_LV_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 13 6-6 6 6"/><path d="m6 19 6-6 6 6"/></svg>`;
const ICON_LV_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 5 6 6 6-6"/><path d="m6 11 6 6 6-6"/></svg>`;

// 编辑：双击便签进入编辑（见 _bindEdit），工具条不再放铅笔按钮

// 旋转：环形回带箭头，表达「可绕中心转」
const ICON_ROTATE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="m21 4-4 1.6L19.5 9"/></svg>`;

// 吐纸位叠放：新纸一律落在出纸口正上方，只做小幅纵向错位，像纸一张张叠出来。
// 每档 24px、共 6 档，整叠以吐纸位为中心上下各展 60px，避免单向漂移顶出画布。
const STACK_STEP = 24;     // 每张新纸相对上一张的上移错位量(px)
const STACK_LEVELS = 6;    // 叠放档位数：超过后回到最底层重新叠
const TYPE_SPEED = 50;   // 每字间隔(ms)：缓慢打出的节奏（对齐 pager 原版）
const MAX_LEN = 500;     // 单卡最大字数
const NOTE_CAP = 50;     // 便签上限：防 vault 文件无限膨胀（超出删最早）
// 写作档「文章流」的卡片间距：顺流重排与新卡落点必须共用同一个值 ——
// 两处若各写一份，重排之后打出的新卡会与既有列错开几像素，看着像没对齐。
const WRITE_FLOW_GAP = 24;
const SAVE_DEBOUNCE = 350; // 写盘防抖(ms)，合并拖拽/删除等连续操作
// LOD（Level of Detail）分级渲染，对标 tldraw 的 Level of Detail / built-in shape simplifications。
// 【本应用没有相机缩放】画布固定 100% 不缩放（_applyCanvasTransform 仅 translate），
// 故 LOD 不能按「缩放档位」触发，改为按「交互态 + 可见密度」触发：
//   drag  —— 画布平移拖拽期间（等价于 tldraw 的相机移动期间简化），松手即恢复；
//   dense —— 在屏卡数超阈值，常驻降级（离屏已被 P8 剔除，这里只压在屏卡的绘制成本）。
// 【只关不参与布局的装饰】纸纹(absolute) / 投影(纯绘制) / 工具条(absolute) 全部不影响卡片几何，
// 故 _geo 缓存、连线端点、命中测试、剔除矩形全部继续有效；
// 齿边 .tw-card-edge 与 .tw-card-head/.tw-card-meta 在流内，隐藏会改高度 → 绝不碰。
const LOD_DENSITY = 120;   // 在屏卡数超过此值即常驻 dense 降级
// 手动缩放范围：0.6x（约 180px 宽的小签）~ 2.4x（铺满画布的大签）
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.08;  // ⌘/Ctrl+滚轮 每格步进（乘性，手感均匀）
// 字级档位：离散而非连续 —— 中文排版对字号容错很窄，任意值容易破坏版式。
// 只作用于文字（--tw-text-zoom），与整张便签等比缩放的 ZOOM 正交叠加。
// 以「标准」为中心、约 1.18 倍等比递进：向下 3 档、向上 4 档，
// 足以覆盖「小纸写一句话用大字」到「大纸贴长文用小字」两种反向需求。
const FONT_SCALES = [0.6, 0.72, 0.85, 1, 1.18, 1.4, 1.65, 1.95];
const FONT_SCALE_DEFAULT_IDX = 3;
const FONT_SCALE_LABELS = [
  '极小 60%', '很小 72%', '偏小 85%',
  '标准 100%',
  '偏大 118%', '很大 140%', '特大 165%', '超大 195%',
];
// 便签尺寸档位（整张纸等比）：右下角手柄仍是连续拖拽，这里是离散快捷入口，
// 两者共用同一个 zoom 值 —— 拖出来的任意尺寸不会被档位「吸附」掉。
const CARD_SCALES = [0.7, 1, 1.35, 1.8];
const CARD_SCALE_LABELS = ['S 小', 'M 标准', 'L 大', 'XL 特大'];
const CARD_SCALE_DEFAULT_IDX = 1;

const FONTS = ["classic", "modern", "kai"];
const FONT_LABELS = { classic: "宋 A", modern: "黑 B", kai: "楷 C" };
const FONT_FEEDBACK = { classic: "SERIF 宋体", modern: "SANS 黑体", kai: "KAI 楷体" };

// 便签纸张样式：与 base.css 的 .tw-card[data-paper="x"] 一一对应。
// 新增一种纸 = 这里加一项 + CSS 加一条同名的 [data-paper] 规则。
const PAPERS = ["plain", "night", "shuyan", "redsilk", "ruoshui", "tengyun", "juhuo", "yingyue"];
const PAPER_LABELS = { plain: "素笺", night: "夜光", shuyan: "书燕", redsilk: "红绸", ruoshui: "若水", tengyun: "腾云", juhuo: "举火", yingyue: "映月" };
const PAPER_FEEDBACK = { plain: "素笺 PLAIN", night: "夜光 NIGHT", shuyan: "书燕 SHUYAN", redsilk: "红绸 REDSILK", ruoshui: "若水 RUOSHUI", tengyun: "腾云 TENGYUN", juhuo: "举火 JUHUO", yingyue: "映月 YINGYUE" };
// 卡片抬头随纸样变化，增强「换了台不同的打印机」的代入感
const PAPER_TITLES = { plain: "Bamboo Immortals", night: "Bamboo Immortals", shuyan: "BAMBOO IMMORTALS", redsilk: "BAMBOO IMMORTALS", ruoshui: "BAMBOO IMMORTALS", tengyun: "BAMBOO IMMORTALS", juhuo: "BAMBOO IMMORTALS", yingyue: "BAMBOO IMMORTALS" };

// —— MD可视化写作模式：结构级别 ——
// 【纸色与结构解耦】纸样（PAPERS）只作视觉区分，不表达层级；
// 每张卡的结构角色由它自己的级别控件决定，故颜色改动永远不会误伤文章结构。
// 类型分三族：标题（H1–H6，有序层级）/ 基础（正文、引用）/ 列表（无序、编号、任务）。
// 正文排在最前，因为默认新建的卡就是正文。
const LEVELS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "quote", "ul", "ol", "task"];
const LEVEL_LABELS = { p: "正文", h1: "H1", h2: "H2", h3: "H3", h4: "H4", h5: "H5", h6: "H6", quote: "引用", ul: "列表", ol: "编号", task: "任务" };
const LEVEL_FEEDBACK = { p: "正文 BODY", h1: "标题 H1", h2: "标题 H2", h3: "标题 H3", h4: "标题 H4", h5: "标题 H5", h6: "标题 H6", quote: "引用 QUOTE", ul: "无序列表 LIST", ol: "编号列表 ORDERED", task: "任务清单 TASK" };
// 弹出菜单的分组。11 种类型再靠「点一下换一个」循环就太蠢了（最坏点 10 次），故改为分组菜单一次点选。
const LEVEL_GROUPS = [
  { label: "标题", items: ["h1", "h2", "h3", "h4", "h5", "h6"] },
  { label: "基础", items: ["p", "quote"] },
  { label: "列表", items: ["ul", "ol", "task"] },
];
// 层级升降的「梯子」：H1 最高 → H6 最低的标题 → 正文垫底（正文 + 一次即 h6）。
// 刻意不含 quote/ul/ol/task —— 它们表达的是文本形态而非层级深度，
// 让 ± 去跨这两个维度会把「引用」误变成「H5」，故这几类两端置灰、只走类型菜单。
const LEVEL_LADDER = ["h1", "h2", "h3", "h4", "h5", "h6", "p"];

export const TypewriterFeature = {
  _el: null,
  _canvas: null,
  _input: null,
  _case: null,
  _timers: [],           // 所有卡片打字计时器，供 unmount 精确清理
  _zTop: 10,
  _spawnIdx: 0,
  _fontIdx: 0,
  _paperIdx: 0,
  // 红色齿轮旋钮三档：'notes' 便签画布 → 'write' MD可视化写作 → 'mindmap' 思维子弹（循环）
  // 【单一事实来源】_mode 是权威状态；_mindmap 只是它的派生布尔——存量代码大量读 _mindmap，
  // 故由 _setMode 统一同步维护，其它地方不再各自赋值，避免出现两个互相打架的真值。
  // 三档 = 三份独立文档（便签 / 写作 / 子弹各存各的 key），切档由 _persistDoc / _loadDoc 换档。
  _mode: 'notes',
  _mindmap: false,       // 是否处于「思维子弹模式」（红色齿轮旋钮拨到子弹位）；其数据由 MindmapFeature 自管
  _switching: false,     // 切档重入锁：切档含 await 读盘，连拨会让两份文档的读写交叉
  _levelMenu: null,          // 类型选择浮层（全画布共用一个，按需创建）
  _levelMenuCard: null,      // 浮层当前作用于哪张卡
  _levelMenuDocHandler: null,
  // 输入框草稿按模式各存一份：切模式时带走自己那半截输入，互不污染（打字机分模式工作的另一半）。
  // 三份文档对应三个键：notes / write / mindmap，键名与 _mode 取值一致，便于直接用 _mode 索引。
  _draft: { notes: '', write: '', mindmap: '' },
  _msgTimer: null,
  _saveTimer: null,      // 写盘防抖计时器
  _restored: false,      // 防重复加载：mount 一次只读盘一次
  _fitDone: false,       // 恢复后是否已做过「把便签带进视野」自检（每次 mount 重置）
  _fitRo: null,          // 画布尚未布局时，用于延迟自检的一次性 ResizeObserver
  _audioCtx: null,       // 吐纸音效的 Web Audio 上下文（轻量合成，无需外部音频文件）
  _links: [],            // 便签连线：[{from,to}] 便签 id 对（端点坐标实时算，不入档）
  _linkSvg: null,        // 连线 SVG 层（画布坐标系，随画布平移自动跟随）
  _linkEls: [],          // 每条连线的 SVG 元素引用（结构不变时复用更新，避免每帧重建 DOM）
  _linkSigCache: '',     // 上次渲染的连线结构签名（判断能否走「只更新几何」快路径）
  _ctlEls: null,         // hover 控件的元素引用表（同一条连线时复用更新，避免每帧重建）
  _linkRaf: 0,           // 重绘节流（拖动/旋转/缩放时合并为每帧一次）
  _linkRo: null,         // 观察卡片尺寸变化 → 自动重绘连线
  _hoverLink: null,      // 当前悬浮的连线 {from,to}（用于在其上挂控件）
  _hoverTimer: null,     // 收起悬浮控件的防抖
  _ctlHover: false,      // 指针是否停在连线的控件上（是则不收起）
  _selected: null,       // 多选集合：Set<HTMLElement>(便签卡片)
  _marquee: null,        // 框选矩形 DOM（挂在画布下，随画布一起缩放）
  _marqueeRect: null,    // 框选矩形几何（画布局部 px）
  _selKeyHandler: null,  // 删除/缩放快捷键监听（unmount 时移除）
  _themeMo: null,        // 机型明暗开关：观察 .dark 变化的 MutationObserver（unmount 时断开）
  _undoStack: null,      // 撤销/重做栈（仅便签这份文档；导图那份在 MindmapFeature 自己手里）

  /** 接入画中卷功能舞台 */
  async mount(stageEl) {
    if (this._el) return;
    this._ensureDom(stageEl);
    this._initUndo();
    this._makeCanvasDraggable();
    this._bindSelectionKeys();
    this._bindLevelKeys();
    this._bindInput();
    this._bindThemeSwitch();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
    // 对齐原版：打开即聚焦输入框，便于直接键入
    if (this._input) this._input.focus();
    // 异步加载已保存便签并重建（直接显示全文，不重放动画）
    await this._restore();
  },

  /** 退出：清理全部打字计时器与 DOM 监听，释放引用 */
  unmount() {
    this._timers.forEach((t) => { try { clearInterval(t); } catch (_) { /* 忽略 */ } });
    this._timers = [];
    if (this._msgTimer) { try { clearTimeout(this._msgTimer); } catch (_) { /* 忽略 */ } this._msgTimer = null; }
    // 【P0】退出前无条件落盘一次（fire-and-forget：宿主仍在，bridge 可用）。
    // 原先只在 _saveTimer 存在时才写，若用户恰好在打字动画途中关闭/切走视图，
    // 这张便签可能从未排过保存 → 静默丢失。此处统一兜底（配合 pendingText 拿到全文）。
    if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
    this._saveNow();
    TypewriterStore.invalidateWritingIndex();   // 卸载后 settings 可能被外部改写，丢弃索引缓存
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    this._el = null;
    this._canvas = null;
    this._input = null;
    this._case = null;
    this._tip = null;
    this._tipEl = null;
    this._zTop = 10;
    this._spawnIdx = 0;
    this._fontIdx = 0;
    this._paperIdx = 0;
    this._mode = 'notes';
    this._mindmap = false;
    this._switching = false;
    this._hideLevelMenu();                  // 先摘掉文档级监听，再移除浮层 DOM
    if (this._levelMenu) { this._levelMenu.remove(); this._levelMenu = null; }
    this._levelMenuCard = null;
    this._draft = { notes: '', write: '', mindmap: '' };
    MindmapFeature.teardown();   // 导图层的 DOM 引用一并清掉，下次 mount 重建
    this._restored = false;
    if (this._audioCtx) { try { this._audioCtx.close(); } catch (_) { /* 忽略 */ } this._audioCtx = null; }
    if (this._linkRo) { this._linkRo.disconnect(); this._linkRo = null; }
    if (this._fitRo) { this._fitRo.disconnect(); this._fitRo = null; }
    if (this._themeMo) { this._themeMo.disconnect(); this._themeMo = null; }
    // 历史只属于本次会话的文档：卸载即弃，避免重挂载后把旧状态的快照带回来
    if (this._undoStack) { this._undoStack.reset(); this._undoStack = null; }
    this._fitDone = false;
    if (this._linkRaf) { cancelAnimationFrame(this._linkRaf); this._linkRaf = 0; }
    if (this._geoFlushRaf) { cancelAnimationFrame(this._geoFlushRaf); this._geoFlushRaf = 0; }
    this._geoDirty = null;
    this._linkSvg = null;
    this._linkEls = [];
    this._linkSigCache = '';
    this._ctlEls = null;
    this._links = [];
    this._notes = [];   // 写作档便签的规范数据模型（与 MindmapDoc 同构；落盘/撤销/导出均以此为准）
    // 视口剔除（P8）状态：卸载即弃，下次 mount 由 _buildCards 懒重建
    this._mountedCards = null;   // id → 在屏 DOM 元素
    this._geo = null;            // id → 几何缓存 {x,y,w,h,rot}
    this._spatial = new SpatialIndex(512); // 空间索引：cull/框选/命中 O(可视)，几何入格不读 DOM
    this._noteById = null; this._noteByIdSrc = null; // 懒建 id→note 索引（cull mount 查 note 用）
    // LOD 分级渲染状态（见 LOD_DENSITY 注释）
    this._lodDragging = false;  // 是否处于画布平移拖拽中
    this._lodDense = false;     // 当前是否已 dense 降级
    this._lodDrag = false;      // 当前是否已 drag 降级
    this._geoDirty = null;      // 几何缓存失效集：尺寸已变、待重测的卡 id
    this._geoFlushRaf = 0;      // 重测合帧句柄（多个失效点合并成一帧一次 reflow）
    this._perfOn = false;       // 性能埋点开关（关时热路径只多一次布尔判断，零采样开销）
    this._perf = null;          // key → { n, total, max }
    // 调试出口：控制台可直接 __twPerf.on() → 操作一会儿 → __twPerf.report() 实测
    if (typeof window !== 'undefined') {
      window.__twPerf = {
        on: () => this._setPerf(true),
        off: () => this._setPerf(false),
        report: () => this._perfReport(),
        reset: () => this._perfReset(),
      };
    }
    this._draggingSet = null;    // 拖拽中的卡 id 集（钉屏）
    this._typingIds = null;      // 打字动画中的卡 id 集（钉屏）
    this._editingId = null;      // 正在编辑的卡 id（钉屏）
    this._cullRaf = 0;
    this._CULL_MARGIN = 240;     // 视口外预取边距(px)
    if (this._cullRo) { this._cullRo.disconnect(); this._cullRo = null; }
    clearTimeout(this._hoverTimer);
    this._hoverTimer = null;
    this._hoverLink = null;
    if (this._selKeyHandler) { document.removeEventListener('keydown', this._selKeyHandler); this._selKeyHandler = null; }
    if (this._marquee) { this._marquee.remove(); this._marquee = null; }
    this._marqueeRect = null;
    this._selected = null;
    this._ctlHover = false;
  },

  _ensureDom(stageEl) {
    if (this._el) return;
    const wrap = document.createElement('div');
    wrap.className = 'scroll-typewriter-feature';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', '复古寻呼机打字');

    wrap.innerHTML = `
      <div class="tw-canvas" id="twCanvas" role="region" aria-label="卡片画布"></div>

      <div class="tw-beeper">
        <div class="tw-case">
          <div class="tw-case-label">
            <span class="tw-dot"></span><span class="tw-brand">竹林中国</span>
            <button type="button" class="tw-theme-switch" id="twThemeSwitch" role="switch" aria-checked="false" aria-label="切换 Obsidian 明暗" title="切换 Obsidian 明暗"><span class="tw-theme-switch-knob" aria-hidden="true"></span></button>
            <span class="tw-case-right">BAMBOO IMMORTALS</span>
          </div>

          <div class="tw-screen">
            <div class="tw-screen-glare" aria-hidden="true"></div>
            <div class="tw-screen-top">
              <span id="twScreenTitle">凝墨成笺</span>
              <span class="tw-screen-font">
                <span id="twMetaNotes">FONT: <b id="twFontLabel">${FONT_LABELS.classic}</b> · <b id="twPaperLabel">${PAPER_LABELS.plain}</b></span>
                <span id="twMetaWrite" hidden>卡片 <b id="twCardCount">0</b> · 连线 <b id="twLinkCount">0</b></span>
                <span id="twMetaMindmap" hidden>子弹 <b id="twNodeCount">0</b> · 连线 <b id="twDepthCount">0</b></span>
              </span>
            </div>
            <div class="tw-screen-input-wrap">
              <div class="tw-screen-msg" id="twScreenMsg"></div>
              <textarea class="tw-input" id="twInput" maxlength="${MAX_LEN}" placeholder="输入文字打印便签..." spellcheck="false" aria-label="输入文字打印便签"></textarea>
              <span class="tw-cursor" id="twCursor" aria-hidden="true"></span>
            </div>
          </div>

          <div class="tw-controls">
            <div class="tw-keys-left">
              <button type="button" class="tw-rbtn" id="twPaper" title="切换便签样式" aria-label="切换便签样式">${ICON_LAYERS}</button>
              <button type="button" class="tw-rbtn" id="twFont" title="切换字体" aria-label="切换字体">${ICON_FONT}</button>
              <button type="button" class="tw-rbtn" id="twArrange" title="一键排版：便签排网格 / 写作顺流重排 / 导图自动布局（选中≥2张时只排选中组，否则排全部）" aria-label="一键排版画布">${ICON_GRID}</button>
            </div>
            <div class="tw-grill" aria-hidden="true"><i></i><i></i><i></i></div>
            <button type="button" class="tw-print" id="twPrint" title="打印" aria-label="打印">${ICON_PRINT}</button>
          </div>

          <button type="button" class="tw-knob" id="twKnob" data-mode="notes" title="拨动齿轮：便签画布 / MD可视化写作 / 思维子弹" aria-label="切换模式：便签画布 / MD可视化写作 / 思维子弹" aria-pressed="false">
            <span class="tw-knob-wheel" aria-hidden="true">
              <i class="tw-knob-rim"></i>
              <i class="tw-knob-mark"></i>
            </span>
          </button>
        </div>
        <div class="tw-desk-shadow" aria-hidden="true"></div>
      </div>

      <!-- MD可视化写作模式：第一个机身键（#twPaper）打开的「整篇预览」弹窗。
           按连线顺序把卡片合成整篇 Markdown 展示（只读、不落盘），确认结构后再用第二个键导出。
           其余模式不开此弹窗（#twPaper 仍是切纸样/切子弹样式）。 -->
      <div class="tw-preview-modal" id="twPreviewModal" hidden>
        <div class="tw-preview-panel" role="dialog" aria-modal="true" aria-label="整篇预览">
          <div class="tw-preview-head">整篇预览 <span class="tw-preview-stat" id="twPreviewStat"></span></div>
          <p class="tw-preview-hint">按连线顺序合成后的整篇 Markdown（只读，不会改动卡片或落盘）。确认无误后用第二个键导出成文。</p>
          <textarea id="twPreviewBody" class="tw-preview-body" readonly spellcheck="false" aria-label="整篇 Markdown 预览"></textarea>
          <div class="tw-preview-actions">
            <button type="button" id="twPreviewClose" class="tw-preview-btn tw-preview-btn-go">关闭</button>
          </div>
        </div>
      </div>`;

    stageEl.appendChild(wrap);
    this._el = wrap;
    this._ensureDocCorner();
    this._canvas = wrap.querySelector('.tw-canvas');
    // 连线层（与思维子弹共用 LinkLayer：便签卡片之间的关联连线）
    this._linkLayer = new LinkLayer({
      container: this._canvas,
      nodeSelector: '.tw-card',
      getLinks: () => this._links,
      setLinks: (a) => { this._links = a; },
      addLink: (f, t) => this._addLink(f, t),
      removeLink: (f, t) => this._removeLink(f, t),
      removeLinksOf: (id) => this._removeLinksOfData(id),
      // 【P8 视口剔除】连线端点几何源：挂载卡读活 DOM、离屏卡读几何缓存，使剔除卸载 DOM 后连线不断
      getGeom: (id) => this._getGeom(id),
      onChange: () => this._scheduleSave(),
      anchorClass: 'tw-card-link',
      decorateAnchor: (a) => this._applyKnobSize(a),
    });
    this._input = wrap.querySelector('.tw-input');
    this._case = wrap.querySelector('.tw-case');
    // 点画布空白处取消钉住（工具条收起）；点在便签上由各自的拖拽逻辑处理
    this._canvas.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tw-card')) return;
      this._pinOnly(null);
      this._clearSelection();   // 点空白：清空多选
      this._exitAllEdits(); // 点空白：退出正在编辑的便签并落盘
    });
    // 导图层与便签画布互斥显示：同挂在 wrap 下、同为 flex:1，机身仍是底部那一项
    MindmapFeature.mount(wrap, this);
    this._applyModeChrome();   // 首次挂载即把面板语义对齐（默认便签模式）
    this._observeScale();
    // 视口剔除（P8）：画布尺寸变化即重算挂载（离屏卡卸载、进屏卡重建）
    if (typeof ResizeObserver !== 'undefined' && this._canvas) {
      this._cullRo = new ResizeObserver(() => this._scheduleCull());
      this._cullRo.observe(this._canvas);
    }
  },

  /** 以设备实际渲染宽度驱动 .tw-case 根字号，实现「单一根字号 + em」连续流式缩放。
      不依赖 cqi（当前 Electron 不支持），改用 ResizeObserver 直接量取侧栏真实宽度，兼容性最稳；
      内部所有尺寸已是 em，根字号一变，整台机器等比缩放，永不溢出。 */
  _observeScale() {
    const DESIGN = 420;    // 设计稿设备宽度（max-width）
    const BASE = 14.5;     // 设计稿机身根字号(px)
    const BTN_BASE = 28;   // 设计稿按钮根字号(px)：球体按钮需要比机身字号大得多
    // 整机缩放下限提到 0.75：CSS 用 max() 兜底字号下限（保 12px 可读），
    // 但卡片整体不应再继续缩到比 0.75x 更小（约 315px），
    // 否则布局/留白比例失衡（字号不缩但卡片缩 → 文字撑满）。
    const MIN = 0.75;
    const MAX = 1;         // 上限即设计稿
    const apply = () => {
      if (!this._case || !this._case.isConnected) {
        if (this._ro) this._ro.disconnect();
        return;
      }
      const w = this._case.getBoundingClientRect().width;
      if (!w) return;
      const scale = Math.min(MAX, Math.max(MIN, w / DESIGN));
      const caseFontPx = BASE * scale;
      const btnPx = BTN_BASE * scale;
      this._case.style.fontSize = caseFontPx.toFixed(2) + 'px';
      // 把缩放比写进 --tw-scale，供其余 em 尺寸跟随（本环境不支持 cqi）。
      // 同时写到包裹层 this._el：卡片画布 .tw-canvas 是 .tw-case 的兄弟节点，
      // 不继承 case 上的变量，必须让根层也持有 --tw-scale，卡片字号才能跟随机身缩放。
      this._case.style.setProperty('--tw-scale', scale.toFixed(3));
      this._el.style.setProperty('--tw-scale', scale.toFixed(3));
      // 窄栏正方形构图：量得机身宽度 ≤400px 时切换（本环境不支持 @container，用 class 触发）
      this._case.classList.toggle('tw-square', w <= 400);
      // 根字号一变，所有卡片的 em 尺寸同步变 → 全部几何一次性失效（合帧后统一重测）
      this._invalidateGeoAll();
      // 直接给按钮写像素尺寸/字号（inline 优先级最高），彻底绕开 <button> 不继承字号、
      // 以及 calc(var()) 在本环境可能的兼容问题——按钮独立字号，保证球体有足够尺寸呈现光影
      const rbtns = Array.from(this._case.querySelectorAll('.tw-rbtn'));
      rbtns.forEach((b) => {
        b.style.width = (btnPx * 1.07).toFixed(2) + 'px';
        b.style.height = (btnPx * 1.07).toFixed(2) + 'px';
        b.style.fontSize = btnPx.toFixed(2) + 'px';
      });
      const printBtn = this._case.querySelector('.tw-print');
      if (printBtn) {
        printBtn.style.width = (btnPx * 1.07).toFixed(2) + 'px';
        printBtn.style.height = (btnPx * 1.07).toFixed(2) + 'px';
        printBtn.style.fontSize = btnPx.toFixed(2) + 'px';
      }
      // 卡片悬浮工具条按钮/图标同样内联像素，绕开 calc(var()) 在本环境的兼容问题
      // （与设备圆钮同策略）：否则 --tw-tools-size 整体失效 → 按钮 width 退回 auto、
      // SVG 拿不到 --tw-tools-icon，相邻图标间距/点击区会被撑乱。
      const toolBtns = this._el.querySelectorAll('.tw-card-tools button');
      toolBtns.forEach((b) => {
        b.style.width = (20 * scale).toFixed(2) + 'px';
        b.style.height = (20 * scale).toFixed(2) + 'px';
      });
      const toolSvgs = this._el.querySelectorAll('.tw-card-tools svg');
      toolSvgs.forEach((s) => {
        s.style.width = (18 * scale).toFixed(2) + 'px';
        s.style.height = (18 * scale).toFixed(2) + 'px';
      });
      // 外围圆钮（旋转/连线）同策略内联像素：两钮必须严格等大，缩放变化时跟随刷新
      this._el.querySelectorAll('.tw-card-rotate, .tw-card-link').forEach((k) => this._applyKnobSize(k));
    };
    apply();
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(apply);
      this._ro.observe(this._case);
    }
  },

  /** 机身明暗开关：绑定点击并跟随主题变化同步状态。
   *  画中卷 iframe 内没有 store，bridge.js 的 theme:changed 走 else 分支无条件把 .dark
   *  同步到 <html>/<body>/#bamboo-shadow-host（见 bridge.js / scrollManager._applyDark）；
   *  观察这几个节点的 class 变化，即可让开关状态始终与实际主题一致。 */
  _bindThemeSwitch() {
    const sw = this._el && this._el.querySelector('#twThemeSwitch');
    if (!sw) return;
    sw.addEventListener('click', () => this._toggleObsidianTheme());
    this._syncThemeSwitch();
    if (typeof MutationObserver !== 'undefined') {
      this._themeMo = new MutationObserver(() => this._syncThemeSwitch());
      const opts = { attributes: true, attributeFilter: ['class'] };
      this._themeMo.observe(document.documentElement, opts);
      if (document.body) this._themeMo.observe(document.body, opts);
      const host = document.getElementById('bamboo-shadow-host');
      if (host) this._themeMo.observe(host, opts);
    }
  },

  /** 当前是否为暗色（与 bridge.js / scrollManager 的 .dark 落点保持一致） */
  _isDarkNow() {
    const host = typeof document !== 'undefined' ? document.getElementById('bamboo-shadow-host') : null;
    if (host && host.classList.contains('dark')) return true;
    if (document.documentElement.classList.contains('dark')) return true;
    return !!(document.body && document.body.classList.contains('dark'));
  },

  /** 把开关视觉状态同步到当前明暗（暗 = 拨到右侧并点亮） */
  _syncThemeSwitch() {
    const sw = this._el && this._el.querySelector('#twThemeSwitch');
    if (!sw) return;
    const dark = this._isDarkNow();
    sw.setAttribute('aria-checked', dark ? 'true' : 'false');
    sw.classList.toggle('is-dark', dark);
  },

  /** 切换 Obsidian 明暗：经 bridge 请求宿主改基础主题；宿主改完会重放 css-change，
   *  画中卷据此无条件跟随（本视图无 store，bridge 走 else 分支）。 */
  async _toggleObsidianTheme() {
    const sw = this._el && this._el.querySelector('#twThemeSwitch');
    const next = !this._isDarkNow();
    // 乐观更新：避免宿主往返期间开关「回弹」
    if (sw) {
      sw.setAttribute('aria-checked', next ? 'true' : 'false');
      sw.classList.toggle('is-dark', next);
    }
    const sm = (typeof window !== 'undefined') ? window.storageManager : null;
    if (!sm || typeof sm.toggleObsidianTheme !== 'function') {
      this._syncThemeSwitch();
      this._showScreenMsg('明暗切换不可用', 1200);
      return;
    }
    const res = await sm.toggleObsidianTheme(next);
    if (!res || res.ok === false) {
      this._syncThemeSwitch();
      this._showScreenMsg('明暗切换失败', 1200);
      return;
    }
    const applied = typeof res.isDark === 'boolean' ? res.isDark : next;
    if (sw) {
      sw.setAttribute('aria-checked', applied ? 'true' : 'false');
      sw.classList.toggle('is-dark', applied);
    }
    this._showScreenMsg(applied ? 'DARK MODE' : 'LIGHT MODE', 900);
  },

  _bindInput() {
    const input = this._input;
    const cursor = this._el.querySelector('#twCursor');
    input.addEventListener('focus', () => cursor.classList.add('on'));
    input.addEventListener('blur', () => cursor.classList.remove('on'));

    // 同一个「打印」动作按模式分流：便签模式打印便签，导图模式新建节点。
    // 否则导图里打字回车会打出一张落在隐藏画布上的便签 —— 屏幕上什么都没有。
    const doPrint = () => this._commitInput();
    this._el.querySelector('#twPrint').addEventListener('click', doPrint);
    // 回车即打印：便签模式吐纸条、导图模式射出子弹（Ctrl/Cmd+Enter 亦同）。
    // Shift+Enter 保留换行，便于在便签里写多行；空输入由 _commitInput 各自提示。
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.shiftKey) return;
      e.preventDefault();
      doPrint();
    });

    // 第二个键：便签模式=切换字体；思维子弹模式=导出为 Markdown 落库（两者互不干扰）。
    this._el.querySelector('#twFont').addEventListener('click', () => {
      if (this._mindmap) { this._exportMindmap(); return; }   // 导图模式：第二个键改为「导出为 Markdown」
      // MD可视化写作模式：第二个键 = 保存快照（当前卡片合成整篇 Markdown，写入带时间戳的独立笔记，不覆盖源笔记）
      if (this._mode === 'write') { this._saveSnapshot(); return; }
      this._fontIdx = (this._fontIdx + 1) % FONTS.length;
      const f = FONTS[this._fontIdx];
      this._el.querySelector('#twFontLabel').textContent = FONT_LABELS[f];
      this._showScreenMsg('FONT: ' + FONT_FEEDBACK[f], 1000);
    });

    // 第三个键：便签模式=一键排版（网格）；思维子弹模式=一键自动布局（多种布局循环）。两者互不干扰。
    this._el.querySelector('#twArrange').addEventListener('click', () => {
      if (this._mindmap) {
        const label = MindmapFeature.cycleLayout();
        this._showScreenMsg(label ? ('LAYOUT: ' + label) : '画布为空', 1400);
        return;
      }
      // MD可视化写作模式：第三个键 = 按文章顺序把卡片顺成竖向阅读流（画布即文章骨架）
      if (this._mode === 'write') { this._reflowWriteOrder(); return; }
      this._arrangeNotes();
    });

    // 红色齿轮旋钮：三档循环。点一下拨一齿；在旋钮上滚轮同样拨齿（上滚=后退，下滚=前进），
    // 滚轮方向即拨动方向 —— 与真实旋钮一致，也顺手给了键盘/触控板之外的第三种拨法。
    const knobEl = this._el.querySelector('#twKnob');
    knobEl.addEventListener('click', () => { this._cycleMode(1); });
    knobEl.addEventListener('wheel', (e) => {
      e.preventDefault();                       // 阻止页面随之滚动（旋钮是控件，不是滚动区）
      this._cycleMode(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    // 便签样式切换：循环全部 PAPERS，并更新屏幕 PAPER 标签。
    // 只影响「之后打印」的卡片，已生成的卡片保持其打印时的样式（各自 data-paper 固定）。
    this._el.querySelector('#twPaper').addEventListener('click', () => {
      if (this._mode === 'write') { this._openPreviewModal(); return; }  // 写作档：第一个键改为「整篇预览」
      if (this._mindmap) { MindmapFeature.cycleStyle(); return; }   // 导图模式：第一个键改为切换子弹样式
      this._paperIdx = (this._paperIdx + 1) % PAPERS.length;
      const p = PAPERS[this._paperIdx];
      this._el.querySelector('#twPaperLabel').textContent = PAPER_LABELS[p];
      this._showScreenMsg('PAPER: ' + PAPER_FEEDBACK[p], 1000);
    });

    // 「整篇预览」弹窗：写作档专用，便签/导图模式不绑定（#twPaper 仍是切纸样/子弹样式）
    const previewModal = this._el.querySelector('#twPreviewModal');
    if (previewModal) {
      previewModal.addEventListener('click', (e) => { if (e.target === previewModal) this._closePreviewModal(); });
      previewModal.querySelector('#twPreviewClose').addEventListener('click', () => this._closePreviewModal());
      // Esc 关闭：keydown 从只读框冒泡到弹窗，焦点在框内也生效
      previewModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); this._closePreviewModal(); }
      });
    }
  },

  /** 屏幕系统消息浮层（TRANSMITTING / FONT 反馈） */
  _showScreenMsg(text, duration = 1400) {
    const msg = this._el.querySelector('#twScreenMsg');
    msg.textContent = text;
    msg.classList.add('on');
    if (this._msgTimer) clearTimeout(this._msgTimer);
    this._msgTimer = setTimeout(() => msg.classList.remove('on'), duration);
  },

  /** 文件名时间戳：YYYYMMDD-HHMM（避免与导出头里的人类可读时间重复） */
  _stamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  },

  /** 思维子弹模式：第二个机身键 = 把子弹图导出为 Markdown 并落库到 Vault（画中卷/子弹笔记/）。
   *  便签模式不触发本方法（#twFont 在便签模式仍是切换字体），故完全不干扰便签功能。
   *  落库成功后在 Obsidian 打开该笔记；若桥不可用则兜底下载 .md 并复制到剪贴板。 */
  async _exportMindmap() {
    // 只有「框选(多选)」才导出选中分支；单选一颗子弹视为导出整张图，
    // 避免随手点中一颗就把整图缩成孤零零一支。
    const mm = MindmapFeature;
    const marquee = (mm && mm._selSet && mm._selSet.size) ? Array.from(mm._selSet) : null;
    const data = mm.buildMarkdown(marquee);
    if (!data || !data.content) { this._showScreenMsg('没有可导出的子弹', 1200); return; }
    const grp = await TypewriterStore.getCurrentMindmapGroup();
    const base = (grp.title || '未命名思维导图')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[.\s]+|[.\s]+$/g, '')
      .slice(0, 40) || '未命名思维导图';
    // 落库位置：设置弹窗里的「子弹导出目录」（Vault 相对路径），默认 思维子弹
    const folder = ((window.SettingsModal && window.SettingsModal.mmExportFolder) || '思维子弹').replace(/^\/+/, '');
    // 与写作「保存快照」完全对齐：每次导出生成带时间戳的独立笔记（思维子弹/<组名> 快照 <时间>.md），
    // 互不覆盖，自然形成可回看的版本历史。
    const d = new Date();
    const p2 = (n) => String(n).padStart(2, '0');
    const ts = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}.${p2(d.getMinutes())}.${p2(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`;
    const snapName = `${base} 快照 ${ts}`;
    const filename = `${folder}/${snapName}.md`;
    this._showScreenMsg('EXPORTING...', 1200);
    try {
      const sm = window.storageManager;
      if (sm && typeof sm.exportMindmap === 'function') {
        const res = await sm.exportMindmap(filename, data.content);
        if (res && res.ok) {
          this._showScreenMsg((marquee ? '已落库（选中分支）：' : '已落库：') + snapName, 1900);
          try { if (sm.openFile) await sm.openFile(filename); } catch (_) { /* 打开失败不影响落库 */ }
          return;
        }
      }
      throw new Error('bridge 不可用');
    } catch (e) {
      // 兜底：桥未连接（纯网页/测试环境）时下载 .md，保证按钮永远可用
      this._downloadMarkdown(filename, data.content);
      this._showScreenMsg('已下载 .md（桥未连接）', 2000);
    }
  },

  /** 卡片按阅读顺序（自上而下、同排从左到右）—— 自动串联与「无连线」兜底都用它。 */
  _cardsByReadingOrder() {
    // 【P8】离屏卡已被剔除（不在 DOM），顺序必须改从模型派生：x/y 取模型真值，
    // el 解析自挂载表（离屏卡为 null，但顺序计算不受其影响）。
    if (!this._notes || !this._notes.length) return [];
    return this._notes.map((n) => ({
      el: this._mountedCards ? this._mountedCards.get(n.id) || null : null,
      id: n.id,
      x: (typeof n.x === 'number') ? n.x : 0,
      y: (typeof n.y === 'number') ? n.y : 0,
    })).sort((a, b) => (a.y - b.y) || (a.x - b.x));
  },

  /** MD可视化写作模式：按「连线顺序」把卡片串成文章。
   *  连线即写作顺序：从没有入边的卡出发，沿 from→to 深度优先走。
   *  完全没连线的卡退化为阅读顺序；成环只走一次、残留按阅读顺序补尾 ——
   *  保证任何连线形态下都不丢卡片、不死循环，且顺序稳定可复现。 */
  _orderCards() {
    const cards = this._cardsByReadingOrder();
    if (!cards.length) return [];
    const byPos = (a, b) => (a.y - b.y) || (a.x - b.x);
    const byId = new Map(cards.map((c) => [c.id, c]));
    const links = (this._links || []).filter((l) => byId.has(l.from) && byId.has(l.to));
    if (!links.length) return cards;   // 无连线：退化为阅读顺序

    const adj = new Map();
    const indeg = new Map(cards.map((c) => [c.id, 0]));
    links.forEach((l) => {
      if (!adj.has(l.from)) adj.set(l.from, []);
      adj.get(l.from).push(l.to);
      indeg.set(l.to, (indeg.get(l.to) || 0) + 1);
    });
    // 同一出边按目标位置排序：多分支顺序稳定，不随连线建立的先后而变
    adj.forEach((list) => list.sort((a, b) => byPos(byId.get(a), byId.get(b))));

    const seen = new Set();
    const out = [];
    const walk = (id) => {
      if (seen.has(id)) return;                 // 成环：走到过就不再进，避免死循环
      seen.add(id);
      out.push(byId.get(id));
      (adj.get(id) || []).forEach(walk);
    };
    cards.filter((c) => !indeg.get(c.id)).forEach((c) => walk(c.id));  // 入度为 0 的即开头
    cards.filter((c) => !seen.has(c.id)).forEach((c) => walk(c.id));   // 环内残留：按阅读顺序补尾
    return out;
  },

  /** 写作档：按 _orderCards() 给每张卡贴顺序徽标（连线/阅读顺序）。
   *  非写作档不显示并清理遗留徽标。新增/删除/连线/拖动/切档都会触发刷新，
   *  保证徽标与「整篇预览 / 导出」的顺序严格一致，让文章顺序在画布上可见。 */
  _refreshWriteOrder() {
    if (!this._canvas) return;
    if (this._mode !== 'write') {
      this._canvas.querySelectorAll('.tw-card-order').forEach((b) => b.remove());
      return;
    }
    const ordered = this._orderCards();
    const placed = new Set();
    ordered.forEach((c, i) => {
      if (!c.el) return;   // 离屏（被剔）卡片无 DOM：跳过徽标/可用态，重挂载时 _updateCulling 会再刷
      let badge = c.el.querySelector('.tw-card-order');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'tw-card-order';
        c.el.appendChild(badge);
      }
      badge.textContent = String(i + 1);
      placed.add(c.el);
    });
    // 兜底：清掉不在序列里的（极端时序保护，正常不会进 here）
    this._canvas.querySelectorAll('.tw-card-order').forEach((b) => {
      if (!placed.has(b.parentElement)) b.remove();
    });
    // 上移/下移的可用态跟着顺序走：首位不能上移、末位不能下移。
    // 放在这里统一刷 —— _refreshWriteOrder 已覆盖增删卡/连线/拖动/切档全部时机。
    ordered.forEach((c, k) => {
      const pos = `（文章顺序，当前第 ${k + 1} 位）`;
      const up = c.el.querySelector('.tw-card-move-up');
      const dn = c.el.querySelector('.tw-card-move-down');
      if (up) {
        up.disabled = k === 0;
        up._tipText = k === 0 ? '已在最前' : '上移' + pos;
      }
      if (dn) {
        dn.disabled = k === ordered.length - 1;
        dn._tipText = k === ordered.length - 1 ? '已在最后' : '下移' + pos;
      }
    });
    this._refreshScreenMeta();   // 右上角「卡片 N · 连线 M」随之刷新
  },

  /** 写作档新卡的落点锚：有选中卡时取「选中组里排在最末的那张」（新卡接其后 = 续写），
   *  否则取文章末尾那张。顺序取自 _orderCards()（优先连线、回退阅读顺序）—— 与徽标 /
   *  预览 / 导出同一套，故「末尾」是真·文末，而非画布上碰巧最靠下的那张。
   *  exclude：刚 append 进 DOM 的新卡必须排除，否则它会把自己当成锚点。 */
  _spawnAnchorCard(exclude) {
    const seq = this._orderCards().filter((c) => c.el !== exclude);
    if (!seq.length) return null;
    const sel = this._selected;
    if (sel && sel.size) {
      for (let i = seq.length - 1; i >= 0; i -= 1) {
        if (sel.has(seq[i].el)) return seq[i].el;   // 选中组里最靠后的那张
      }
    }
    return seq[seq.length - 1].el;
  },

  /** 写作档：把卡片平移进视野 —— 仅在它确实看不见时才动，免得每打一张画布都跳一下。
   *  只调画布偏移，绝不改卡片坐标：坐标是「文章顺序」的真值，不能为了可见性去动它。 */
  _ensureCardVisible(cardOrId) {
    const canvas = this._canvas;
    if (!canvas) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    if (!VW || !VH) return;
    const id = (cardOrId && cardOrId.dataset) ? cardOrId.dataset.id : cardOrId;
    if (!id) return;
    // 【P8】钉屏卡已在屏无需动；离屏卡用几何缓存/模型定位（无需 DOM），照样能把视野平移到它身上
    if (this._pinnedIds().has(id)) return;
    const g = this._geo ? this._geo.get(id) : null;
    const n = (this._notes || []).find((x) => x.id === id);
    const rawL = (g ? g.x : (n && typeof n.x === 'number' ? n.x : 0));
    const rawT = (g ? g.y : (n && typeof n.y === 'number' ? n.y : 0));
    const w = g ? g.w : 340;
    const h = g ? g.h : 200;
    const off = this._canvasOffset || { x: 0, y: 0 };
    const M = 24;                                   // 边距：别让卡片贴着画布边
    let ox = off.x, oy = off.y;
    if (h + 2 * M < VH) {
      // 夹到「顶不越上边、底不越下边」的区间（h + 2M < VH 保证 min <= max）
      oy = Math.min(VH - M - h - rawT, Math.max(M - rawT, oy));
    } else {
      oy = M - rawT;                                // 卡片比视野还高：顶对齐
    }
    if (w + 2 * M < VW) {
      ox = Math.min(VW - M - w - rawL, Math.max(M - rawL, ox));
    } else {
      ox = M - rawL;
    }
    if (ox === off.x && oy === off.y) return;
    this._setCanvasOffset(ox, oy);   // → _applyCanvasTransform → _scheduleCull 挂载该卡
  },

  /** 把排好序的卡片渲染成 Markdown。
   *  - h1..h6：首行做标题；卡内若还有余下的行，紧跟着成段落
   *  - p：原文照排（卡内换行保留为软换行），卡片之间空一行分段
   *  - quote：逐行加 "> " 前缀 */
  _buildCardsMarkdown(ordered) {
    // 【P8 视口剔除】文本/层级必须来自模型真源，绝不能再读 c.el.dataset/innerText：
    // 离屏卡被剔、c.el 为 null，读 DOM 会抛「Cannot read dataset of null」→ 导出/快照/预览直接崩。
    // 仅「正在打字动画中」的卡用 dataset.pendingText（此时它必在屏、被钉屏，不会是离屏卡）。
    const byId = this._notes ? new Map(this._notes.map((n) => [n.id, n])) : null;
    const blocks = [];
    ordered.forEach((c, i) => {
      const id = c.id;
      let text = '';
      let lv = 'p';
      if (c.el && c.el.dataset && c.el.dataset.pendingText != null) {
        text = c.el.dataset.pendingText;          // 打字中途：未落模型，用 DOM 暂存全文
      } else if (byId) {
        const note = byId.get(id);
        if (note) { text = note.text || ''; lv = note.level || 'p'; }   // 真源：模型
      } else if (c.el) {
        text = ((c.el.querySelector('.tw-card-text') || {}).innerText) || '';
      }
      const trimmed = String(text).replace(/\s+$/, '');
      if (!trimmed.trim()) return;
      const lines = trimmed.split('\n');
      if (/^h[1-6]$/.test(lv)) {
        blocks.push('#'.repeat(Number(lv.slice(1))) + ' ' + (lines[0] || '').trim());
        const rest = lines.slice(1).join('\n').trim();
        if (rest) blocks.push(rest);
      } else if (lv === 'quote') {
        blocks.push(lines.map((s) => '> ' + s.trim()).join('\n'));
      } else if (lv === 'ul' || lv === 'ol' || lv === 'task') {
        // 列表三兄弟：一行一项，空行跳过。
        // 编号列表自动累加序号 —— 不要求用户在卡里手写「1. 2. 3.」，手写反而会因增删项而错乱。
        const items = lines.map((s) => s.trim()).filter(Boolean);
        if (!items.length) return;
        if (lv === 'ul') blocks.push(items.map((s) => '- ' + s).join('\n'));
        else if (lv === 'ol') blocks.push(items.map((s) => (i + 1) + '. ' + s).join('\n'));
        else blocks.push(items.map((s) => '- [ ] ' + s).join('\n'));
      } else {
        blocks.push(trimmed.trim());
      }
    });
    return blocks.join('\n\n') + '\n';
  },

  /** 写作模式第 2 个键 = 保存快照：把当前卡片合成整篇 Markdown，写入一份「带时间戳」的独立笔记。
   *  每次都生成新文件（MD可视化写作/<组名> 快照 <时间>.md），互不覆盖，自然形成可回看的版本历史。 */
  async _saveSnapshot() {
    if (!this._canvas || this._mode !== 'write') return;
    const ordered = this._orderCards();
    if (!ordered.length) { this._showScreenMsg('画布上还没有卡片', 1400); return; }
    const content = this._buildCardsMarkdown(ordered);
    if (!content.trim()) { this._showScreenMsg('卡片都是空的', 1400); return; }
    const g = await TypewriterStore.getCurrentWritingGroup();
    const base = (g.title || '未命名草稿')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[.\s]+|[.\s]+$/g, '')
      .slice(0, 40) || '未命名草稿';
    const d = new Date();
    const p2 = (n) => String(n).padStart(2, '0');
    const ts = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}.${p2(d.getMinutes())}.${p2(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`;
    const snapName = `${base} 快照 ${ts}`;
    const snapPath = `MD可视化写作/${snapName}.md`;
    this._showScreenMsg('SAVING SNAPSHOT...', 1200);
    try {
      const sm = window.storageManager;
      if (sm && typeof sm.exportMindmap === 'function') {
        const res = await sm.exportMindmap(snapPath, content);
        if (res && res.ok) {
          this._showScreenMsg('已保存快照：' + snapName, 2200);
          // 与思维子弹导出对齐：保存后自动打开这份快照笔记，便于立即查看/续写
          try { if (sm.openFile) await sm.openFile(snapPath); } catch (_) { /* 打开失败不影响落库 */ }
          return;
        }
      }
      throw new Error('bridge 不可用');
    } catch (e) {
      this._downloadMarkdown(snapPath, content);
      this._showScreenMsg('已下载快照 .md（桥未连接）', 2000);
    }
  },

  /** MD可视化写作模式：机身第三个键 —— 按「文章顺序」（优先连线、无连线回退阅读顺序，
   *  与顺序徽标/整篇预览/导出完全一致）把卡片顺成一条干净的竖向阅读流，让画布本身成为文章骨架。
   *  只改位置、不动卡片尺寸/旋转（非破坏性），原有连线保留（端点随位置更新）。
   *  与便签模式的「网格排版」区分：那边是无序网格，这边是有序竖列（顺序即文章顺序）。 */
  _reflowWriteOrder() {
    if (!this._canvas) return;
    const seq = this._orderCards();                 // 全部卡（模型派生，剔除态也完整）
    if (!seq.length) { this._showScreenMsg('画布上还没有卡片', 1000); return; }
    const selCount = this._selected ? this._selected.size : 0;
    // 选中集以 DOM 元素为键：映射回 id（剔除态下能选中的必是可见卡）
    const selIds = new Set();
    if (selCount >= 2 && this._selected) {
      this._selected.forEach((c) => { const id = c.dataset && c.dataset.id; if (id) selIds.add(id); });
    }
    const target = (selCount >= 2) ? seq.filter((c) => selIds.has(c.id)) : seq;
    if (target.length < 2) { this._showScreenMsg('至少两张卡片才能顺流', 1500); return; }

    if (this._undoStack) this._undoStack.push();   // 重排覆盖手工布局，提前留档（撤销可还原）

    // 【P8 视口剔除】重排必须作用于全部卡（含离屏），不能只排可见 DOM：模型位置对所有卡更新，
    // 在屏卡再同步 DOM；离屏卡用几何缓存尺寸累计高度（未测量回退默认），保证整列顺序与高度正确。
    const GAP = WRITE_FLOW_GAP;                     // 与新卡落点同一间距，重排后接着打也不错位
    let y = 0, maxW = 0;
    target.forEach((c) => {
      this._notes = WritingDoc.setPos(this._notes, c.id, 0, y);   // 位置即数据：同步模型（含离屏卡）
      const el = c.el;
      if (el) { el.style.left = '0px'; el.style.top = y + 'px'; }  // 在屏卡同步 DOM
      const g = this._geo ? this._geo.get(c.id) : null;
      const w = g ? g.w : (el ? el.offsetWidth : 340);
      const h = g ? g.h : (el ? el.offsetHeight : 200);
      maxW = Math.max(maxW, w);
      y += (h || 200) + GAP;                        // 按各卡实际高度累计，竖向顺流
    });

    this._scheduleRenderLinks();                    // 连线端点随位置更新（原有连线保留）
    this._scheduleSave();                           // 持久化新位置
    this._refreshWriteOrder();                      // 顺序徽标随新位置刷新
    this._scheduleCull();                           // 重排后重算挂载：移出视野的卡卸载

    // 居中到顺流后的卡片列：左对齐 x=0，仅垂直堆叠，故只取最大宽与总高做居中
    const totalH = y - GAP;
    const VW = this._canvas.clientWidth, VH = this._canvas.clientHeight;
    this._setCanvasOffset(VW / 2 - maxW / 2, VH / 2 - totalH / 2);

    const scope = selCount >= 2 ? '选中的 ' : '全部 ';
    this._showScreenMsg('已顺流重排' + scope + target.length + ' 张（文章顺序，尺寸不变）', 1800);
  },

  /** 兜底：把 Markdown 作为 .md 文件下载到本地（桥不可用环境） */
  _downloadMarkdown(filename, content) {
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (filename.split('/').pop() || '子弹图.md');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (_) { /* 兜底也失败则静默 */ }
  },

  /** MD可视化写作模式：第一个机身键打开的「整篇预览」。
   *  按连线顺序（无连线则回退阅读顺序）把卡片合成整篇 Markdown 展示，
   *  与保存快照（_saveSnapshot → _buildCardsMarkdown）共用同一套排序与合成逻辑，
   *  所以这里看到的内容与导出得到的完全一致 —— 导出前先确认结构，避免反复开文件核对。
   *  只读展示：不新建也不改动任何卡片，更不落盘，因此没有任何性能负担。 */
  _openPreviewModal() {
    const modal = this._el.querySelector('#twPreviewModal');
    if (!modal || !this._canvas) return;
    const ordered = this._orderCards();
    if (!ordered.length) { this._showScreenMsg('画布上还没有卡片', 1400); return; }
    const content = this._buildCardsMarkdown(ordered);
    if (!content.trim()) { this._showScreenMsg('卡片都是空的', 1400); return; }
    const body = modal.querySelector('#twPreviewBody');
    body.value = content;
    // 结构概览：卡片数与（去空白）字数，便于快速判断整篇规模是否符合预期
    modal.querySelector('#twPreviewStat').textContent =
      ordered.length + ' 张 · ' + content.replace(/\s/g, '').length + ' 字';
    modal.hidden = false;
    body.scrollTop = 0;   // 每次打开都从开头看起
    setTimeout(() => body.focus(), 0);
  },

  /** 关闭整篇预览 */
  _closePreviewModal() {
    const modal = this._el.querySelector('#twPreviewModal');
    if (modal) modal.hidden = true;
  },

  /** 提交输入框内容：按当前模式决定产出（便签 / 导图节点）。
   *  机身是同一台，但「敲字之后会得到什么」必须跟模式走 —— 这是打字机分模式工作的核心。 */
  _commitInput() {
    const input = this._input;
    if (!input) return;
    const text = input.value.trim();
    if (this._mindmap) {
      if (!text) { this._showScreenMsg('先输入文字，再新建节点', 1200); return; }
      if (!MindmapFeature.addNodeFromInput(text)) { this._showScreenMsg('新建节点失败', 1200); return; }
      this._playBulletSound();   // 子弹从打字机射出时的音效（与飞出动画配对）
      input.value = '';
      this._draft.mindmap = '';
      this._showScreenMsg('已新建节点', 1000);
      this._refreshScreenMeta();
      return;
    }
    if (this._mode === 'write') {
      const { level, text: clean } = this._detectWriteLevel(text);
      this._spawn(clean, level);
    } else {
      this._spawn(text);
    }
  },

  /** 面板语义随模式切换：屏幕标题/右侧元信息、输入框 placeholder 与草稿、按钮可用性。
   *  纸样/字体/排版只对便签有意义，导图模式下必须置灰 —— 否则用户点了会作用到看不见的便签上，
   *  这正是「两个模式互相干扰」的典型表现。 */
  _applyModeChrome() {
    const root = this._el;
    if (!root) return;
    this._ensureDocCorner();   // 先确保画布角控件已创建，下面的 set('#twDocCorner') 才不会因元素不存在而跳过
    const mm = !!this._mindmap;
    const wr = this._mode === 'write';
    const T = {
      notes: { title: '凝墨成笺', ph: '输入文字打印便签...' },
      // 抬头「列锦成文」：列锦是古典修辞格——意象并置、如锦缎铺陈，正合本模式
      // 「一张张卡片平铺陈列」的可视化特质（而非线性的珠串）；成文=落成一篇 Markdown。
      // 与便签「凝墨成笺」、子弹「枝连成图」同为「X → 成 Y」的四字结构，同一套诗意命名。
      write: { title: '列锦成文', ph: '输入文字打印卡片...' },
      mindmap: { title: '枝连成图', ph: '输入文字新建节点...' },
    }[this._mode] || { title: '凝墨成笺', ph: '输入文字打印便签...' };
    const set = (sel, fn) => { const el = root.querySelector(sel); if (el) fn(el); };
    set('#twScreenTitle', (el) => { el.textContent = T.title; });
    // 元信息分档：便签=FONT·PAPER；写作=卡片·连线；导图=子弹·连线。
    // 此前写作档借用便签那条（显隐判据只是「非导图」），漏出 FONT·PAPER ——
    // 而写作档根本没有字体/纸样：工具条两键已改作预览/导出，卡片的纸样钮也被隐藏。
    set('#twMetaNotes', (el) => { el.hidden = mm || wr; });
    set('#twMetaWrite', (el) => { el.hidden = !wr; });
    set('#twMetaMindmap', (el) => { el.hidden = !mm; });
    const input = this._input;
    if (input) {
      input.placeholder = T.ph;
      input.setAttribute('aria-label', T.ph.replace('...', ''));
      input.value = (this._draft && this._draft[this._mode]) || '';
    }
    // #twPaper 三档语义不同：便签=切换便签样式；写作=整篇预览；导图=切换子弹样式。
    set('#twPaper', (el) => {
      el.disabled = false;
      if (this._mode === 'write') {
        el.title = '整篇预览：按连线顺序查看合成后的 Markdown（只读，不落盘）';
        el.setAttribute('aria-label', '整篇预览');
        el.innerHTML = ICON_PREVIEW;
      } else if (mm) {
        el.title = '切换子弹样式';
        el.setAttribute('aria-label', '切换子弹样式');
        el.innerHTML = ICON_LAYERS;
      } else {
        el.title = '切换便签样式';
        el.setAttribute('aria-label', '切换便签样式');
        el.innerHTML = ICON_LAYERS;
      }
    });
    // #twFont 三档语义不同：便签=切换字体；写作=保存快照（带时间戳的独立笔记）；导图=导出为 Markdown。
    set('#twFont', (el) => {
      el.disabled = false;
      if (mm) {
        el.title = '导出为 Markdown 笔记（落库到 Vault）';
        el.setAttribute('aria-label', '导出为 Markdown');
        el.innerHTML = ICON_EXPORT;
      } else if (this._mode === 'write') {
        el.title = '把卡片连成整篇 Markdown 并新建笔记';
        el.setAttribute('aria-label', '生成 Markdown 笔记');
        el.innerHTML = ICON_EXPORT;
      } else {
        el.title = '切换字体';
        el.setAttribute('aria-label', '切换字体');
        el.innerHTML = ICON_FONT;
      }
    });
    const notesOnly = [];
    notesOnly.forEach(([sel, tip]) => set(sel, (el) => {
      el.disabled = mm;
      el.title = mm ? '便签模式专用（思维子弹是自由子弹，可任意拖动、互相连线）' : tip;
    }));
    // #twArrange 三档语义不同：便签=一键排版（网格）；写作=顺流重排（文章顺序→竖向阅读流）；
    // 导图=一键自动布局（多种布局循环）。
    set('#twArrange', (el) => {
      el.disabled = false;
      if (mm) {
        el.title = '一键自动布局（多种布局循环：树状 / 横向 / 放射）';
        el.setAttribute('aria-label', '一键自动布局');
        el.innerHTML = ICON_LAYERS;
      } else if (this._mode === 'write') {
        el.title = '顺流重排：按文章顺序把卡片排成竖向阅读流（选中≥2张时只排选中组）';
        el.setAttribute('aria-label', '顺流重排卡片');
        el.innerHTML = ICON_GRID;
      } else {
        el.title = '一键排版：便签排成整齐网格（选中≥2张时只排选中组）';
        el.setAttribute('aria-label', '一键排版');
        el.innerHTML = ICON_GRID;
      }
    });
    // 写作卡片组切换控件：仅写作模式可见，浮于画布右上角（异步刷新组名，不阻塞 Chrome）
    set('#twDocCorner', (el) => {
      const kind = this._mindmap ? 'mindmap' : (this._mode === 'write' ? 'write' : null);
      el.hidden = !kind;
      if (kind) this._refreshDocBtnLabel();
    });
    set('#twPrint', (el) => { el.title = mm ? '新建节点' : '打印'; });
    this._refreshScreenMeta();
  },

  /** 屏幕右上角元信息按档回显：导图=子弹数/连线数；写作=卡片数/连线数；便签是静态的 FONT·PAPER。
   *  写作档的数字由 _refreshWriteOrder 驱动刷新 —— 它覆盖了增删卡/连线/拖动/切档全部时机。 */
  _refreshScreenMeta() {
    if (!this._el) return;
    const root = this._el;
    const set = (sel, v) => { const el = root.querySelector(sel); if (el) el.textContent = v; };
    if (this._mindmap) {
      let s = { count: 0, depth: 0 };
      if (MindmapFeature.isActive && MindmapFeature.isActive()) s = MindmapFeature.stats();
      set('#twNodeCount', String(s.count));
      set('#twDepthCount', String(s.depth));
      return;
    }
    if (this._mode === 'write') {
      // 【P8 视口剔除】卡片 DOM 会被卸载 → 数挂载 DOM 只得到可见卡数；总数以模型 _notes 为准
      const n = this._notes ? this._notes.length : 0;
      set('#twCardCount', String(n));
      set('#twLinkCount', String((this._links || []).length));
    }
  },

  /** 构建一张卡片 DOM（不含定位与文本填充），绑定删除与拖拽。
   *  note: { id, font, paper, date, level } —— 数据属性写入 dataset 供落盘收集。 */
  _createCardEl(note) {
    const id = note.id || Math.random().toString(36).slice(2, 8).toUpperCase();
    const font = note.font || 'classic';
    const paper = note.paper || 'plain';
    const date = note.date || this._now();
    const level = (LEVELS.indexOf(note.level) >= 0) ? note.level : 'p';   // 旧数据无 level → 正文
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.setAttribute('role', 'note');
    card.dataset.id = id;
    card.dataset.font = font;
    card.dataset.paper = paper;
    card.dataset.date = date;
    card.dataset.level = level;
    // 手动缩放：读落盘值（旧数据无 zoom → 默认 1，观感与历史便签一致）
    this._applyZoom(card, note.zoom);
    this._applyRot(card, note.rot);
    card.innerHTML = `
      <div class="tw-card-edge tw-card-edge-top" aria-hidden="true"></div>
      <div class="tw-card-main">
        <div class="tw-card-noise" aria-hidden="true"></div>
        <div class="tw-card-head">
          <span class="tw-card-title">${PAPER_TITLES[paper] || PAPER_TITLES.plain}</span>
        </div>
        <div class="tw-card-meta">
          <span class="tw-card-date"></span>
        </div>
        <div class="tw-card-text"></div>
      </div>
      <div class="tw-card-edge tw-card-edge-bottom" aria-hidden="true"></div>
      <button type="button" class="tw-card-level" aria-label="切换结构级别"></button>
      <div class="tw-card-tools">
        <button type="button" class="tw-card-paper" aria-label="切换便签样式">${ICON_PAPER}</button>
        <button type="button" class="tw-card-move tw-card-move-up" aria-label="上移（文章顺序）">${ICON_MOVE_UP}</button>
        <button type="button" class="tw-card-move tw-card-move-down" aria-label="下移（文章顺序）">${ICON_MOVE_DOWN}</button>
        <button type="button" class="tw-card-lv tw-card-lv-up" aria-label="提升层级">${ICON_LV_UP}</button>
        <button type="button" class="tw-card-lv tw-card-lv-down" aria-label="降低层级">${ICON_LV_DOWN}</button>
        <button type="button" class="tw-card-font tw-card-font-down" aria-label="缩小字号">${ICON_FONT_DOWN}</button>
        <button type="button" class="tw-card-font tw-card-font-up" aria-label="放大字号">${ICON_FONT_UP}</button>
        <button type="button" class="tw-card-zoom-out" aria-label="缩小便签">${ICON_ZOOM_OUT}</button>
        <button type="button" class="tw-card-zoom-in" aria-label="放大便签">${ICON_ZOOM_IN}</button>
        <button type="button" class="tw-card-del" aria-label="移除卡片">${ICON_X}</button>
      </div>`;

    // 工具条按钮/图标内联像素尺寸（与 apply() 中同策略），新卡片立即定型，
    // 不依赖 CSS 的 calc(var()) 在本环境是否可靠。
    const _ctScale = parseFloat(this._el.style.getPropertyValue('--tw-scale')) || 1;
    card.querySelectorAll('.tw-card-tools button').forEach((b) => {
      // 级别钮是文字标签（「正文 / H1 / 引用」），宽度须自适应，不能钉成方钮
      if (b.classList.contains('tw-card-level')) return;
      b.style.width = (20 * _ctScale).toFixed(2) + 'px';
      b.style.height = (20 * _ctScale).toFixed(2) + 'px';
    });
    card.querySelectorAll('.tw-card-tools svg').forEach((s) => {
      s.style.width = (18 * _ctScale).toFixed(2) + 'px';
      s.style.height = (18 * _ctScale).toFixed(2) + 'px';
    });

    card.querySelector('.tw-card-date').textContent = date;

    // 纸样：写入抬头与按钮提示（显示当前纸样名）
    this._applyPaper(card, paper);
    // 结构级别：写入 dataset 与按钮文字（仅MD可视化写作模式下该钮可见）
    this._applyLevel(card, level);
    // 字级档位：旧数据无 fontScale → 落到默认档（1.0）
    this._applyFontScale(card, this._fontIdxOf(note.fontScale, paper));
    this._bindFontSteps(card);
    this._bindZoomSteps(card);
    this._bindPaperSwitch(card);
    this._bindLevelSwitch(card);
    this._bindOrderSteps(card);
    this._bindLevelSteps(card);
    this._bindTools(card);
    this._bindTips(card);
    this._bindEdit(card);

    card.querySelector('.tw-card-del').addEventListener('click', (e) => {
      e.stopPropagation();
      // 单张删除同样要留档：这是最常用的删除入口，漏掉的话 Cmd+Z 就找不回来
      if (this._undoStack) this._undoStack.push();
      this._removeCard(card);
      this._scheduleSave();
    });
    this._makeDraggable(card);
    this._makeResizable(card);
    this._makeRotatable(card);
    this._makeLinkable(card);
    this._watchCardSize(card);
    return card;
  },

  /** 写作档：从输入框文本里嗅出结构级别（Markdown 行首前缀）。
   *  "# "→h1 … "###### "→h6、" > "→引用、" - "/" * "→无序、" 1. "/" 1)"→有序、
   *  " - [ ] "→待办；其余当正文。只解析首行，剥掉前缀后把余文交回正文。 */
  _detectWriteLevel(raw) {
    const lines = String(raw).split('\n');
    const first = lines[0] || '';
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(first))) { lines[0] = m[2]; return { level: 'h' + m[1].length, text: lines.join('\n') }; }
    if ((m = /^>\s+(.*)$/.exec(first))) { lines[0] = m[1]; return { level: 'quote', text: lines.join('\n') }; }
    if ((m = /^[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(first))) { lines[0] = m[2]; return { level: 'task', text: lines.join('\n') }; }
    if ((m = /^[-*]\s+(.*)$/.exec(first))) { lines[0] = m[1]; return { level: 'ul', text: lines.join('\n') }; }
    if ((m = /^\d+[.)]\s+(.*)$/.exec(first))) { lines[0] = m[1]; return { level: 'ol', text: lines.join('\n') }; }
    return { level: 'p', text: raw };
  },

  /** 生成一张纸条卡片：文本呈现 + 可拖拽 + 落盘。
   *  write 模式允许传入 level（由输入框的 Markdown 前缀推导，如 "# " → h1），
   *  便签/导图模式不传，落到默认正文。
   *  【呈现方式按模式分流】写作档一次性落全文（连续成文不该等字一个个蹦）；
   *  便签档才是逐字打字 —— 那是寻呼机的签名动效。 */
  _spawn(text, level) {
    if (!text) {
      if (typeof Toast !== 'undefined') Toast.showToast('请先输入文字', 'error');
      return;
    }
    this._showScreenMsg('TRANSMITTING...', 1500);
    // 吐纸音效（在用户手势内触发：点 PRINT / Cmd+Enter 已建立并 resume 音频上下文）
    this._ensureAudio();
    this._playFeedSound();
    const canvas = this._canvas;
    const font = FONTS[this._fontIdx];
    const paper = PAPERS[this._paperIdx];
    const date = this._now();
    const id = WritingDoc.newId();
    const card = this._createCardEl({ id, font, paper, date, level });

    // 落点按模式分流：
    //  便签档 —— 以打字机中轴线吐纸，垂直停在画布中央略偏上（纸是从机器里吐出来的）。
    //  写作档 —— 接在文章末尾（有选中卡时接在选中组之后）。
    //            画布此时是一篇自上而下的文章，新卡落在中央会打断成文流，
    //            每打一张都得手动归位（或重跑一次顺流重排）—— 这是本档最大的日常摩擦。
    card.style.zIndex = String(++this._zTop);
    canvas.appendChild(card);
    const cr = canvas.getBoundingClientRect();
    const cw = card.offsetWidth || 340;
    const ch = card.offsetHeight || 200;
    const anchor = (this._mode === 'write') ? this._spawnAnchorCard(card) : null;
    if (anchor) {
      // 文章流：与锚点卡左对齐、落在其下方 WRITE_FLOW_GAP 处（与顺流重排同一间距）。
      // 刻意不做吐纸堆叠错位：那是为了「看见下面压着纸」，文章里没有这个语义。
      const ax = parseFloat(anchor.style.left) || 0;
      const ay = parseFloat(anchor.style.top) || 0;
      card.style.left = ax + 'px';
      card.style.top = (ay + (anchor.offsetHeight || 0) + WRITE_FLOW_GAP) + 'px';
      card.style.bottom = 'auto';
    } else {
      const beeperEl = this._el.querySelector('.tw-beeper');
      const br = beeperEl.getBoundingClientRect();
      const deviceCenterX = br.left + br.width / 2 - cr.left;
      // 吐纸位叠放：新纸一律落在出纸口正上方（寻呼机中轴、画布中央略偏上），
      // 只逐张做小幅上错位 —— 像纸一张张叠出来，能看到下面还压着纸。
      // 刻意不做「互不重叠」的搬移：那样纸就不是从打印机吐出来的了，
      // 且画布下方紧邻机身（机身 z-index 30 > 便签 20），往下搬会被机身挡住。
      const stackIdx = this._spawnIdx++ % STACK_LEVELS;
      const stackOffset = ((STACK_LEVELS - 1) / 2 - stackIdx) * STACK_STEP;  // 新纸逐张上叠
      card.style.left = (deviceCenterX - cw / 2) + 'px';
      card.style.top = ((cr.height - ch) / 2 - 24 + stackOffset) + 'px';
      card.style.bottom = 'auto';
    }
    // 连续编辑改走 WritingDoc 原语：新卡即时进入规范模型（x/y 取刚算出的落点、
    // 视觉属性取卡片实际应用的 dataset 值），保存/撤销/导出自此同源。
    this._notes = this._notes.concat([{
      id,
      text: text || '',
      x: parseFloat(card.style.left) || 0,
      y: parseFloat(card.style.top) || 0,
      font: card.dataset.font || 'classic',
      paper: card.dataset.paper || 'plain',
      level: card.dataset.level || 'p',
      date: card.dataset.date || '',
      zoom: parseFloat(card.dataset.zoom) || 1,
      fontScale: Number(card.dataset.fontScale) || 1,
      rot: Number(card.dataset.rot) || 0,
      }]);
      this._mountedCards.set(id, card);   // 登记到挂载表（视口剔除据此判断在屏/离屏；须早于任何 cull 触发，避免重复建卡）
      // 【P8 空间索引】新卡立刻进索引（用落点 + 默认尺寸），否则打字中途的 cull pass 会把它误卸载
      if (this._spatial) this._spatial.insert(id, parseFloat(card.style.left) || 0, parseFloat(card.style.top) || 0, 340, 200, Number(card.dataset.rot) || 0);
    // 注：写作档的「把新卡带进视野」不在这里做 —— 此刻文本还没落、卡片高度是空卡高度，
    // 算出来的偏移会白校正一次。挪到下面文本写完之后（详见 write 分支内的调用）。

    // 吐纸入场：从打印口下方弹入就位（.tw-feed 关键帧在 base.css）。
    // 仅新打的便签挂此 class；_restore 重建历史便签不挂，故重开不重放动画。
    card.classList.add('tw-feed');
    card.addEventListener('animationend', () => card.classList.remove('tw-feed'), { once: true });

    const textEl = card.querySelector('.tw-card-text');

    // 吐字与否按模式分流：
    //  写作档 —— 卡片是「文章的一块」，逐字吐字（TYPE_SPEED=50ms/字，一张长卡要几秒）
    //            会拖慢连续成文，故直接落全文一次性展现。
    //            刻意保留吐纸入场 .tw-feed：它不是逐字累进，不拖慢阅读，且让新卡有
    //            「落到画布上」的存在感（_reflowWriteOrder 也依赖卡片已是最终尺寸）。
    //  便签档 —— 保留逐字打字的设备签名动效（PWM 脉冲光标 + 字一个个蹦出来）。
    if (this._mode === 'write') {
      textEl.textContent = text;
      this._scheduleSave();
      // 追加到文末的新卡多半在视野之外，且此刻文本刚落定、卡片才是最终高度 ——
      // 必须等到这里再校正，否则按空卡高度算是白校正一次（成文流会看着是断的）。
      this._ensureCardVisible(card);
    } else {
      textEl.classList.add('is-typing');

      // 【P0】落盘与打字动画解耦：把「目标全文」先写进 dataset.pendingText 并立刻排一次落盘，
      // 使便签在动画刚开始时就已经落盘（_collectNotes 优先读 pendingText）。
      // 否则若用户在打字途中关闭/切走视图，磁盘上根本没有这张便签 → 静默丢数据。
      card.dataset.pendingText = text;
      if (!this._typingIds) this._typingIds = new Set();
      this._typingIds.add(id);   // 打字中：钉在屏上，剔除跳过（避免动画被打断/焦点丢失）
      this._scheduleSave();
      // 新便签进画布

      // 逐字缓慢打出；打完即补齐全文并落盘
      let i = 0;
      const timer = setInterval(() => {
        if (i >= text.length) { this._finishTyping(card); return; }
        textEl.textContent += text[i++];
      }, TYPE_SPEED);
      card._typing = { timer, textEl, text };
      this._timers.push(timer);
    }

    // 清空输入，便于连续生成
    this._input.value = '';
    this._input.focus();

    this._measureCard(card);            // 文本已落定：量一次几何进缓存，连线/剔除都读它
    this._refreshWriteOrder();          // 新卡入画布：刷新写作档顺序徽标

    // 超出上限删最早（DOM 顺序即时间序），并在落盘时同步
    this._enforceCap();
  },

  /** 结束某张卡片的打字动画：停表、补齐全文、清 pendingText 并落盘。
   *  动画自然结束、或用户中途进入编辑时调用 —— 后者若不先补齐，
   *  逐字写入会持续覆写 contentEditable，光标被打飞、内容残缺。 */
  _finishTyping(card) {
    const t = card._typing;
    if (!t) return;
    card._typing = null;
    try { clearInterval(t.timer); } catch (_) { /* 忽略 */ }
    const k = this._timers.indexOf(t.timer);
    if (k >= 0) this._timers.splice(k, 1);
    t.textEl.textContent = t.text;          // 补齐全文，杜绝残留半截字
    t.textEl.classList.remove('is-typing');
    delete card.dataset.pendingText;        // 全文已进 DOM，之后以 DOM（可编辑）为准
    this._notes = WritingDoc.setText(this._notes, card.dataset.id, t.text);  // 打字完成：同步模型
    if (this._typingIds) this._typingIds.delete(card.dataset.id);
    this._measureCard(card);   // 全文落定，重测几何（尺寸变终值）
    this._scheduleSave();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
  },

  // —— 吐纸音效（Web Audio 轻量合成，无需外部音频文件，对齐 incense 火折子音效范式） ——
  /** 提前在用户手势（点 PRINT / Cmd+Enter）内创建并恢复音频上下文，
   *  保证随后的吐纸音效能正常出声（自动播放策略：非手势内 resume 会被拒绝 → 静音）。 */
  _ensureAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      if (this._audioCtx.state === 'suspended') { try { this._audioCtx.resume(); } catch (_) { /* 忽略 */ } }
    } catch (_) { /* 音频不可用时静默 */ }
  },

  /** 吐纸音效：模拟齿轮棘轮逐齿送纸的"咔哒"——几声极轻的带通噪声脉冲 + 高频金属"哒"，
   *  末声稍重作"出纸落定"。整体增益很低（极轻），不打断打字专注。 */
  _playFeedSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) { /* 忽略 */ } }
      const now = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.value = 0.13;            // 整体增益（较明显但不刺耳）
      out.connect(ctx.destination);

      // 棘轮：4 齿轻咔 + 末声落定，间隔 ~70ms 似纸张被逐齿送出
      const teeth = 4;
      const gap = 0.07;
      for (let k = 0; k < teeth; k++) this._feedTick(ctx, out, now + k * gap, false);
      this._feedTick(ctx, out, now + teeth * gap + 0.05, true);
    } catch (_) { /* 音频不可用时静默 */ }
  },

  /** 子弹音效：打字机「射出」一颗子弹时的 "咔——咻"。
   *  先一声机械字锤击打（高频短噪），紧接一段快速下滑的方波 "pew"，极轻、短促，
   *  与齿轮转动音（呜+咔）、吐纸音（棘轮咔哒）都区分开，不淹没打字。 */
  _playBulletSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) { /* 忽略 */ } }
      const now = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.value = 0.14;
      out.connect(ctx.destination);

      // 字锤击打「咔」：极短高通噪声脉冲
      const tl = 0.035;
      const tlBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * tl), ctx.sampleRate);
      const td = tlBuf.getChannelData(0);
      for (let i = 0; i < td.length; i++) td[i] = (Math.random() * 2 - 1) * (1 - i / td.length);
      const ts = ctx.createBufferSource(); ts.buffer = tlBuf;
      const tf = ctx.createBiquadFilter(); tf.type = 'highpass'; tf.frequency.value = 2000;
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0.5, now);
      tg.gain.exponentialRampToValueAtTime(0.001, now + tl);
      ts.connect(tf); tf.connect(tg); tg.connect(out);
      ts.start(now); ts.stop(now + tl + 0.01);

      // 子弹「咻」：快速下滑方波（pew）
      const osc = ctx.createOscillator(); osc.type = 'square';
      osc.frequency.setValueAtTime(820, now + 0.012);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.13);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, now + 0.012);
      og.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.connect(og); og.connect(out);
      osc.start(now + 0.012); osc.stop(now + 0.16);
    } catch (_) { /* 音频不可用时静默 */ }
  },

  /** 单声"咔"：极短带通噪声脉冲（机械感）叠一个高频方波"哒"（金属齿感）。
   *  @param {AudioContext} ctx
   *  @param {GainNode} dest 总输出增益
   *  @param {number} t 起始时间(ctx.currentTime 偏移)
   *  @param {boolean} settle 末声：更沉更重，作纸张送抵落定 */
  _feedTick(ctx, dest, t, settle) {
    const dur = settle ? 0.05 : 0.028;
    // 机械噪声脉冲（带通，短促）
    const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = settle ? 1500 : 2200;
    bp.Q.value = 7;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(settle ? 0.9 : 0.5, t + 0.002);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(ng); ng.connect(dest);
    src.start(t); src.stop(t + dur + 0.01);
    // 高频"哒"（齿轮金属齿感）
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(settle ? 2400 : 3000, t);
    osc.frequency.exponentialRampToValueAtTime(settle ? 1100 : 1500, t + dur);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(settle ? 0.22 : 0.12, t + 0.001);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(og); og.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.01);
  },

  /** 齿轮转动音效：模拟拨动旋钮时齿轮转一齿的"呜——咔"。
   *  带通噪声随转动上扫再回落（机械呜声）+ 首尾两声金属"咔"（齿咬合），
   *  增益极轻，与吐纸音效同源但更短促，不打断打字。 */
  _playGearSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) { /* 忽略 */ } }
      const now = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.value = 0.12;            // 整体增益（与吐纸音效同级，极轻）
      out.connect(ctx.destination);

      // 转动"呜"：带通噪声，频率随转动上扫再回落，像齿轮转半圈
      const dur = 0.16;
      const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(700, now);
      bp.frequency.exponentialRampToValueAtTime(1400, now + dur * 0.5);
      bp.frequency.exponentialRampToValueAtTime(800, now + dur);
      bp.Q.value = 3;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, now);
      ng.gain.exponentialRampToValueAtTime(0.6, now + 0.02);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(bp); bp.connect(ng); ng.connect(out);
      src.start(now); src.stop(now + dur + 0.01);

      // 两声金属"咔"（齿咬合）：落在转动的首尾
      this._feedTick(ctx, out, now, false);
      this._feedTick(ctx, out, now + dur - 0.03, true);
    } catch (_) { /* 音频不可用时静默 */ }
  },

  /** 卡片拖拽：相对画布定位，限制在画布范围内；松手即落盘 */
  _makeDraggable(card) {
    const canvas = this._canvas;
    let dragging = false;
    let startX = 0, startY = 0;
    let moved = false;   // 区分「轻点」与「拖动」：轻点 = 钉住外围工具条
    let raf = 0;
    let dx = 0, dy = 0;     // 本帧位移（画布局部 px，已按缩放比换算）
    let dragSet = null;     // 拖动集合快照：[{card, lx, ly}]（成组移动用）
    const apply = () => {
      raf = 0;
      if (!dragSet) return;
      dragSet.forEach((d) => {
        d.card.style.left = (d.lx + dx) + 'px';
        d.card.style.top = (d.ly + dy) + 'px';
      });
      this._scheduleRenderLinks();   // 便签移动，连线端点跟随
    };
    const onMove = (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) moved = true;
      // 无限画布：坐标相对 .tw-canvas（含其 transform 平移），不 clamp；
      // 画布固定 100%，屏幕位移即局部位移
      dx = (e.clientX - startX);
      dy = (e.clientY - startY);
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      dragging = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (moved && dragSet) {
        dragSet.forEach((d) => {
          // 连续编辑改走 WritingDoc 原语：拖动结束即把最终落点写回规范模型
          this._notes = WritingDoc.setPos(this._notes, d.card.dataset.id,
            parseFloat(d.card.style.left) || 0, parseFloat(d.card.style.top) || 0);
        });
        dragSet.forEach((d) => this._measureCard(d.card)); // 拖完重测几何→刷新 geo+空间索引（修复剔除/连线端点陈旧）
        this._scheduleRenderLinks();
      }
      card.classList.remove('dragging');
      card.style.willChange = '';   // 拖拽结束撤掉合成层提升
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (moved) this._scheduleSave();  // 真拖动落盘
      else this._pinOnly(card);         // 轻点：钉住工具条（触屏无 hover 时的入口）
      this._draggingSet = null;         // 拖拽结束：解除钉屏
      this._scheduleCull();             // 重算挂载：被拖出视野的卡卸载
      dragSet = null;
    };
    const onDown = (e) => {
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link')) return; // 删除/字级/缩放/连线锚点不触发拖拽
      // 编辑态下点在文本区不拖拽（让浏览器处理选字/光标）；点标题或纸边仍可移动便签
      if (card.classList.contains('editing') && e.target.closest('.tw-card-text')) return;
      // Shift 点击 = 切换选中（不进入拖拽）；其余点击决定选择集
      if (e.shiftKey) { this._toggleSelect(card); return; }
      if (!this._selected || !this._selected.has(card)) this._selectOnly(card);
      // 拖动集合 = 当前选中集（含本卡）；若本卡未选中则上方已使其成为唯一选中
      const set = (this._selected && this._selected.size) ? this._selected : new Set([card]);
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      dx = 0; dy = 0;
      dragSet = Array.from(set).map((c) => ({
        card: c,
        lx: parseFloat(c.style.left) || 0,
        ly: parseFloat(c.style.top) || 0,
      }));
      this._draggingSet = new Set(dragSet.map((d) => d.card.dataset.id));  // 拖拽中：这些卡钉在屏上，剔除跳过
      card.classList.add('dragging');
      card.style.willChange = 'transform';   // 仅拖拽期间临时提升，松手即撤
      card.style.zIndex = String(++this._zTop);
      // 拖拽置顶后同步层叠快照，避免 mouseleave 时把便签回落回旧层级
      if (card.dataset.zLifted === '1') card._zPrev = card.style.zIndex;
      e.preventDefault();
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    };
    card.addEventListener('pointerdown', onDown);
  },

  /** 画布桌面整体拖拽：机身(.tw-beeper)固定在文档流不动，便签桌面(.tw-canvas)用 transform 平移，
      便签作为画布子元素自然跟随。点便签(.tw-card)或按钮时交给各自逻辑，不触发画布拖动。 */
  _makeCanvasDraggable() {
    const canvas = this._canvas;
    const root = this._el;
    if (!canvas || !root) return;
    let dragging = false;
    let startX = 0, startY = 0;
    let baseX = 0, baseY = 0;
    const onMove = (e) => {
      if (!dragging) return;
      // 真无限画布：不做 clamp，画布可平移到任意远处，靠双击空白 fit-all 找回
      const x = baseX + (e.clientX - startX);
      const y = baseY + (e.clientY - startY);
      this._canvasOffset = { x, y };
      this._applyCanvasTransform();   // 平移（origin 0,0）
    };
    const onUp = () => {
      dragging = false;
      this._setLodDragging(false);   // 松手即恢复满细节
      root.classList.remove('dragging');
      canvas.style.willChange = '';   // 平移结束即撤掉合成层提升，避免常驻巨型层拖垮整页合成器
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      this._scheduleSave();   // 持久化画布偏移
    };
    // 双击空白：归位所有便签到视野中心(fit-all)；无便签则复位画布
    root.addEventListener('dblclick', (e) => {
      if (this._mindmap) return;                 // 导图模式：归位交互属于导图，便签不接手
      if (e.target.closest('.tw-card, button, .tw-card-resize, input, textarea')) return;
      this._recenterNotes();
    });
    const onDown = (e) => {
      if (this._mindmap) return;                 // 导图模式：便签画布既不平移也不框选（否则会连带动到便签的落盘偏移）
      if (e.target.closest('.tw-card')) return;   // 点便签：交给便签拖拽
      // 交互控件不触发画布拖动，其余整块区域全局可平移画布
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link, input, textarea')) return;
      // Shift + 空白拖拽 = 框选（替代平移）；其余空白拖拽 = 平移画布
      if (e.shiftKey) { this._startMarquee(e); return; }
      dragging = true;
      this._setLodDragging(true);   // 平移期间降级（对标 tldraw 相机移动时简化）
      startX = e.clientX;
      startY = e.clientY;
      baseX = (this._canvasOffset && this._canvasOffset.x) || 0;
      baseY = (this._canvasOffset && this._canvasOffset.y) || 0;
      canvas.style.willChange = 'transform';   // 仅平移期间临时提升合成层，保证拖拽顺滑；松手即撤
      root.classList.add('dragging');
      e.preventDefault();
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    };
    // 监听挂在功能根(wrap)而非 canvas：机身区(绿壳空白处)也能拖动画布，实现全局平移
    root.addEventListener('pointerdown', onDown);
    // 【根因修复·退不出编辑态】编辑态下，点便签文本/控件以外的任意处即退出编辑（捕获阶段，
    // 先于画布平移的 preventDefault 生效——否则 preventDefault 会抑制默认失焦、导致 blur 兜底失效）。
    root.addEventListener('pointerdown', (e) => {
      const editing = this._canvas && this._canvas.querySelector('.tw-card.editing');
      if (!editing) return;
      if (e.target.closest('.tw-card-text')) return;            // 仍在文本内：继续编辑
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link, input, textarea')) return;
      this._exitAllEdits();
    }, true);
  },

  /** 把画布平移到指定偏移并持久化 */
  _setCanvasOffset(x, y) {
    this._canvasOffset = { x, y };
    this._applyCanvasTransform();
    this._scheduleSave();
  },

  /** 画布 transform：仅平移（画布固定 100% 不缩放），transform-origin 固定 0,0（见 CSS） */
  _applyCanvasTransform() {
    if (!this._canvas) return;
    const o = this._canvasOffset || { x: 0, y: 0 };
    this._canvas.style.transform = `translate(${o.x}px, ${o.y}px)`;
    this._scheduleCull();   // 画布平移即重算挂载（视口剔除）
  },

  /** 恢复后把便签群居中到当前视野（仅平移、不缩放）。
   *  画布固定 100% 不缩放；画布尚未布局时挂一次性 ResizeObserver 等拿到尺寸再居中。
   *  每次 mount（含「侧边栏↔中央」重建）都跑一次，保证切到更宽视图时便签重新居中；
   *  运行中手动平移因 _fitDone 已置真、本函数不再触发，故视角仍被保留。 */
  _ensureNotesVisible() {
    const canvas = this._canvas;
    if (!canvas || this._fitDone) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    if (!VW || !VH) {
      if (this._fitRo || typeof ResizeObserver === 'undefined') return;
      this._fitRo = new ResizeObserver(() => {
        const r = canvas.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (this._fitRo) { this._fitRo.disconnect(); this._fitRo = null; }
        this._ensureNotesVisible();
      });
      this._fitRo.observe(canvas);
      return;
    }
    this._fitDone = true;
    const cards = Array.from(canvas.querySelectorAll('.tw-card'));
    if (!cards.length) return;
    // 始终按当前视野宽高把便签群居中：侧边栏↔中央 重建后宽度变化，旧偏移不再适配，
    // 必须重新居中（否则便签偏在一侧，需手动双击空白才能归位）。
    // 运行中手动平移因 _fitDone 已置真、本函数不再触发，故视角仍被保留。
    this._recenterNotes();
  },

  /** 把便签群归位到视野中心（仅平移、不缩放）：便签被拖出视野后，双击空白或按 F 找回 */
  _recenterNotes() {
    const canvas = this._canvas;
    if (!canvas) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    // 【P8 视口剔除】必须按模型真源算包围盒：离屏卡不在 DOM，querySelectorAll 只得到可见卡 → 居中偏掉。
    // 尺寸取几何缓存（已测量），未测量（罕见）回退默认尺寸。
    if (!this._notes || !this._notes.length) { this._setCanvasOffset(0, 0); return; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of this._notes) {
      const x = (typeof n.x === 'number') ? n.x : 0;
      const y = (typeof n.y === 'number') ? n.y : 0;
      const g = this._geo ? this._geo.get(n.id) : null;
      const w = g ? g.w : 340, h = g ? g.h : 200;
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
    }
    const bcx = (minX + maxX) / 2, bcy = (minY + maxY) / 2;
    this._setCanvasOffset(VW / 2 - bcx, VH / 2 - bcy);
  },

  /** 一键排版：把便签按创建顺序排成整齐网格（列数随画布可用宽自适应：窄栏单列竖排，宽栏至多√n列；列宽统一、行高随行内最高、间距统一、不重叠）；并顺带把尺寸档位与旋转归零到标准态。
   *  选中 ≥2 张时只对选中组排版；选中 0 或 1 张则对整个画布排版
   *  （单张排版本无意义，按用户「整理整体」的意图处理）；排完居中显示成果。 */
  _arrangeNotes() {
    const canvas = this._canvas;
    if (!canvas) return;
    // 导图有自己的文档与布局，排版只管便签：导图模式下直接提示，不静默切换模式（更不再丢弃导图）
    if (this._mindmap) { this._showScreenMsg('先拨回便签画布再排版', 1200); return; }
    const seq = this._orderCards();                        // 全部卡（模型，剔除态完整）
    const selCount = this._selected ? this._selected.size : 0;
    // 只有选中 ≥2 张才「对选中组」排版；选中 0 张或仅 1 张，都按全局排版处理。
    // 选中单张不再报错拒绝：单张排版本身没有意义（只会把它独自拽到网格原点），
    // 而用户在这个状态下点排版，意图多半是「整理整体」，直接排全部更符合预期。
    const selIds = new Set();
    if (selCount >= 2 && this._selected) {
      this._selected.forEach((c) => { const id = c.dataset && c.dataset.id; if (id) selIds.add(id); });
    }
    const target = (selCount >= 2) ? seq.filter((c) => selIds.has(c.id)) : seq;
    if (!target.length) { this._showScreenMsg('无便签可排版', 1000); return; }

    // 一键排版会覆盖用户手工摆好的自由布局（位置即数据），不可逆 ——
    // 必须在任何变更（缩放 / 旋转 / 坐标）之前留档。此处所有提前 return 都已走完。
    if (this._undoStack) this._undoStack.push();
    // 重排即「标准化」：把每张便签的尺寸档位与旋转归零到标准态（S/M/L/XL→M、角度→0），
    // 让网格按统一标准尺寸排布；先复位再量尺寸，列宽/间距才准确。
    // 【P8 视口剔除】挂载卡走 DOM（_applyZoom/_applyRot 会重测几何），离屏卡只改模型，
    // 重挂载时按模型重建 —— 保证全部卡（含离屏）都被标准化、进网格。
    target.forEach((c) => {
      if (c.el) { this._applyZoom(c.el, 1); this._applyRot(c.el, 0); }
      this._notes = WritingDoc.setZoom(this._notes, c.id, 1);
      this._notes = WritingDoc.setRot(this._notes, c.id, 0);
    });

    const GAP = 24;                                       // 统一间距(px)
    const sizes = target.map((c) => {
      const g = this._geo ? this._geo.get(c.id) : null;
      return { w: (g ? g.w : (c.el ? c.el.offsetWidth : 340)) || 340, h: (g ? g.h : (c.el ? c.el.offsetHeight : 200)) || 200 };
    });
    const colW = Math.max(1, ...sizes.map((s) => s.w));   // 等宽网格：列宽取最大卡宽
    // 宽度自适应：按当前画布可用宽推算可容纳列数，窄栏自然落 1 列（竖排），
    // 宽栏在「√n」上限内尽量多列，避免单行铺太长。
    const availW = canvas.clientWidth || (colW + GAP);
    const fitCols = Math.max(1, Math.floor((availW + GAP) / (colW + GAP)));
    const cols = Math.min(fitCols, Math.max(1, Math.ceil(Math.sqrt(target.length))));

    let x = 0, y = 0, rowMaxH = 0;
    target.forEach((c, i) => {
      this._notes = WritingDoc.setPos(this._notes, c.id, x, y);  // 位置即数据：同步模型（含离屏卡）
      if (c.el) { c.el.style.left = x + 'px'; c.el.style.top = y + 'px'; }  // 在屏卡同步 DOM
      rowMaxH = Math.max(rowMaxH, sizes[i].h);
      if ((i + 1) % cols === 0 || i === target.length - 1) {   // 行末 → 换行
        x = 0;
        y += rowMaxH + GAP;
        rowMaxH = 0;
      } else {
        x += colW + GAP;
      }
    });

    this._scheduleRenderLinks();                            // 连线端点随位置更新
    this._scheduleSave();                                  // 持久化新位置
    this._scheduleCull();                                  // 网格排版后重算挂载：移出视野的卡卸载

    // 居中到排版后的便签群（按模型网格坐标 + 缓存尺寸算包围盒，含离屏卡）
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    x = 0; y = 0; rowMaxH = 0;
    target.forEach((c, i) => {
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + sizes[i].w); maxY = Math.max(maxY, y + sizes[i].h);
      rowMaxH = Math.max(rowMaxH, sizes[i].h);
      if ((i + 1) % cols === 0 || i === target.length - 1) { x = 0; y += rowMaxH + GAP; rowMaxH = 0; }
      else { x += colW + GAP; }
    });
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    this._setCanvasOffset(VW / 2 - (minX + maxX) / 2, VH / 2 - (minY + maxY) / 2);

    // 明确作用范围：单张/未选中时其实动了全部，不说明会让人困惑「我只选了一张，怎么全动了」
    const scope = selCount >= 2 ? '选中的 ' : '全部 ';
    this._showScreenMsg('已排版' + scope + target.length + ' 张便签（尺寸/旋转已归零）', 1200);
  },

  /** 红色齿轮旋钮：三档循环 —— 便签画布 → MD可视化写作 → 思维子弹 → 便签画布。
   *  dir=+1 前进一齿，dir=-1 后退一齿。 */
  _cycleMode(dir) {
    const order = ['notes', 'write', 'mindmap'];
    const cur = Math.max(0, order.indexOf(this._mode));
    const step = dir >= 0 ? 1 : -1;
    this._setMode(order[(cur + step + order.length) % order.length]);
  },

  /** 拨到指定档位。
   *  【三份独立文档】便签 / MD可视化写作 / 思维子弹各存各的 key，互不可见。
   *  切档 = 先把画布写回「离开的那一份」，再清空画布、载入「进入的那一份」；
   *  于是两篇稿子永远不会混在一起，来回拨动也不会互相覆盖。 */
  async _setMode(mode) {
    if (!this._canvas) return;
    const order = ['notes', 'write', 'mindmap'];
    if (order.indexOf(mode) < 0 || mode === this._mode) return;
    const knob = this._el && this._el.querySelector('#twKnob');
    const prev = this._mode;
    // 切档含 await（要读盘）：期间再拨会与上一次的读写交叉，两份文档互相覆盖。
    // 用一把重入锁挡住连拨；finally 保证任何异常都解锁，不会把旋钮永久锁死。
    if (this._switching) return;
    this._switching = true;
    this._ensureAudio();          // 必须在用户手势（点击旋钮）内恢复音频上下文，否则出声被浏览器拦截
    this._playGearSound();        // 拨动齿轮的转动音效
    try {
      // ① 取消挂起的防抖落盘：它会在切档「之后」才触发，届时档位已变，
      //    就会拿新档的 key 去写旧档的卡片 —— 文档串味最隐蔽的一条路径。
      if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }

      // ② 离开当前档：草稿各自带走；半截编辑先提交，避免文本挂在即将隐藏/清空的 DOM 上
      if (this._input) this._draft[this._mindmap ? 'mindmap' : 'notes'] = this._input.value;
      if (this._mindmap) {
        MindmapFeature.deactivate();
      } else {
        await this._persistDoc(prev);   // 把这一档的卡片写回它自己的文档
      }
      this._exitAllEdits();
      this._clearSelection();

      this._mode = mode;
      this._mindmap = (mode === 'mindmap');
      // 导图自绘层；便签/写作共用同一张卡片画布作为渲染介质，但数据各存各的
      this._canvas.hidden = this._mindmap;
      // 写作档外观必须**先于**载入卡片生效：_loadDoc 会量卡片尺寸并做「带入视野」校正，
      // 若此刻还挂着便签的纸样样式，量到的是纸样尺寸（连 aspect-ratio 都不同），位置会算歪。
      this._refreshWriteMode();

      if (knob) {
        knob.dataset.mode = mode;
        knob.classList.toggle('is-on', this._mindmap);
        knob.setAttribute('aria-pressed', this._mindmap ? 'true' : 'false');
        const TITLES = {
          notes: '拨动齿轮：便签画布 / MD可视化写作 / 思维子弹',
          write: 'MD可视化写作：给每张卡定级别，最后连成一篇 Markdown',
          mindmap: '思维子弹：打字后回车新建节点',
        };
        knob.title = TITLES[mode] || TITLES.notes;
      }
      if (this._mindmap) {
        MindmapFeature.activate();
      } else {
        // ③ 进入卡片档：载入这一档自己的文档，并重置撤销栈（两份卡片文档的历史不该串味）
        await this._loadDoc(mode);
        if (this._undoStack) this._undoStack.reset();
      }

      this._applyModeChrome();       // 换语义：标题/元信息/placeholder/按钮/草稿
      this._scheduleRenderLinks();
      const MSGS = {
        notes: '已回到便签画布',
        write: 'MD可视化写作：用卡片上的级别钮定 H1–H6 / 正文 / 引用',
        mindmap: '思维子弹模式：打字后回车新建节点',
      };
      this._showScreenMsg(MSGS[mode] || '', mode === 'mindmap' ? 1800 : 1900);
    } finally {
      this._switching = false;
    }
  },

  /** 导图「沿便签连线建树」的只读数据源：只读文本与连线快照，绝不回写便签 */
  getSeedSource() {
    // 【P8 视口剔除】卡片文本必须来自模型真源，不能读 querySelectorAll('.tw-card')：
    // 离屏卡被剔不在 DOM → 读 DOM 会漏掉这些卡，喂出的导图树残缺。
    // 仅「正在打字动画中」的卡用 dataset.pendingText（此时必在屏、被钉屏，不会是离屏卡）。
    const mounted = this._mountedCards || new Map();
    const cards = (this._notes || []).map((n) => {
      const el = mounted.get(n.id);
      const text = (el && el.dataset && el.dataset.pendingText != null)
        ? el.dataset.pendingText
        : (n.text || '');
      return { id: n.id, text };
    });
    return { cards, links: (this._links || []).slice() };
  },

  // ===== 多选 / 框选 / 成组操作 =====

  /** 仅选中一张（清空其余高亮） */
  _selectOnly(card) {
    if (!this._selected) this._selected = new Set();
    this._selected.forEach((c) => { if (c !== card) c.classList.remove('selected'); });
    this._selected.clear();
    if (card) { this._selected.add(card); card.classList.add('selected'); }
  },

  /** Shift 点击：在选中集合里切换该卡 */
  _toggleSelect(card) {
    if (!this._selected) this._selected = new Set();
    if (this._selected.has(card)) { this._selected.delete(card); card.classList.remove('selected'); }
    else { this._selected.add(card); card.classList.add('selected'); }
  },

  /** 清空全部选中 */
  _clearSelection() {
    if (!this._selected) return;
    this._selected.forEach((c) => c.classList.remove('selected'));
    this._selected.clear();
  },

  /** 删除单张便签（统一入口）：级联删连线 + 摘掉选中态 + 移除 DOM。
   *  收敛成一处，是为了让「卡片工具条 ×」「多选快捷键删除」「超上限自动归档」
   *  三条删除路径共用同一套清理 —— 此前 × 按钮独自实现、漏掉撤销留档，
   *  于是点 × 删掉的便签 Cmd+Z 找不回来。 */
  _removeCard(card) {
    if (!card) return;
    const id = card.dataset.id;
    this._removeLinksOf(id);   // 级联删掉与它相连的连线（DOM 层），避免悬空线
    // 连续编辑改走 WritingDoc 原语：从规范模型删卡 + 连带删相关连线
    const r = WritingDoc.removeNote(this._notes, this._links, id);
    this._notes = r.notes;
    this._links = r.links;
    // 视口剔除：从挂载表/几何缓存/钉屏集合里清掉这张卡
    if (this._mountedCards) this._mountedCards.delete(id);
    if (this._geo) this._geo.delete(id);
    if (this._spatial) this._spatial.remove(id); // 【P8 空间索引】删卡同步出索引
    if (this._typingIds) this._typingIds.delete(id);
    if (this._editingId === id) this._editingId = null;
    if (this._linkLayer) this._linkLayer.clearControls();
    if (this._selected) this._selected.delete(card);
    card.classList.remove('selected');
    card.remove();
    this._refreshWriteOrder();   // 卡片减少/重排：刷新写作档顺序徽标
  },

  /** 删除当前选中的所有便签（级联删连线） */
  _deleteSelected() {
    if (!this._selected || !this._selected.size) return false;
    if (this._undoStack) this._undoStack.push();   // 整批一次快照：撤销时一起回来
    // 先快照成数组再删：_removeCard 会改动 _selected，边遍历 Set 边删会漏
    Array.from(this._selected).forEach((c) => this._removeCard(c));
    this._clearSelection();
    this._scheduleSave();
    return true;
  },

  /** 在画布上拉出框选矩形（Shift+空白拖拽触发） */
  _startMarquee(e) {
    const canvas = this._canvas;
    if (!canvas) return;
    if (this._marquee) this._marquee.remove();
    const m = document.createElement('div');
    m.className = 'tw-marquee';
    canvas.appendChild(m);
    this._marquee = m;
    this._marqueeRect = null;
    const cr = canvas.getBoundingClientRect();
    const sx0 = e.clientX - cr.left;   // 画布局部坐标（画布只平移不缩放，屏幕位移即局部位移）
    const sy0 = e.clientY - cr.top;
    const move = (ev) => {
      const sx1 = ev.clientX - cr.left;
      const sy1 = ev.clientY - cr.top;
      const x = Math.min(sx0, sx1), y = Math.min(sy0, sy1);
      const w = Math.abs(sx1 - sx0), h = Math.abs(sy1 - sy0);
      m.style.left = x + 'px'; m.style.top = y + 'px';
      m.style.width = w + 'px'; m.style.height = h + 'px';
      this._marqueeRect = { x, y, w, h };
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      if (this._marquee) { this._marquee.remove(); this._marquee = null; }
      this._selectInRect(this._marqueeRect || { x: sx0, y: sy0, w: 0, h: 0 });
      this._marqueeRect = null;
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    move(e);
  },

  /** 框选矩形与卡片求交，选中相交者（矩形与卡片任一角落入或相互包含即算） */
  _selectInRect(r) {
    if (!this._spatial) this._spatial = new SpatialIndex(512);
    // 【P8 空间索引】框选候选由索引 queryRect 给出（O(可视)），不再 querySelectorAll 全量读 DOM；
    // 离屏卡未进 DOM，虚拟化下框选只选可见卡（合理行为：与原「全量挂载」等价地不漏选可见卡）。
    const hits = this._spatial.queryRect(r.x, r.y, r.x + r.w, r.y + r.h);
    this._clearSelection();
    if (!this._mountedCards) return;
    hits.forEach((id) => {
      const card = this._mountedCards.get(id);
      if (!card) return;
      const g = this._geo ? this._geo.get(id) : null;
      const lx = g ? g.x : (parseFloat(card.style.left) || 0);
      const ly = g ? g.y : (parseFloat(card.style.top) || 0);
      const w = g ? g.w : (card.offsetWidth || 0);
      const h = g ? g.h : (card.offsetHeight || 0);
      if (lx + w >= r.x && lx <= r.x + r.w && ly + h >= r.y && ly <= r.y + r.h) {
        if (!this._selected) this._selected = new Set();
        this._selected.add(card);
        card.classList.add('selected');
      }
    });
  },

  /** 绑定快捷键：Delete/Backspace 删选中；F 将便签重新归位到视野中心 */
  _bindSelectionKeys() {
    const root = this._el;
    if (!root) return;
    this._selKeyHandler = (e) => {
      // 不能直接判 e.target.tagName：机身输入框在 shadow 树内，事件穿出 shadow 边界后
      // target 会被重定向成 host(div)，该守卫会失效 → 在输入框里按退格会误删选中的便签、
      // 按 F 会触发归位。改用 composedPath() 取真实路径判定。
      if (isFromTextEntry(e)) return;
      // 撤销 / 重做：Cmd/Ctrl+Z、Cmd/Ctrl+Shift+Z。
      // 导图模式下让位给 MindmapFeature（它有自己的文档与历史），否则一次按键会被两边各撤一次。
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        if (this._mindmap) return;
        e.preventDefault();
        this._undoRedo(e.shiftKey ? 'redo' : 'undo');
        return;
      }
      const cv = this._canvas;
      if (!cv || !cv.isConnected || cv.getBoundingClientRect().width < 2) return;
      if (cv.querySelector('.tw-card.editing')) return;   // 编辑中不打断
      // 删除选中（仅当选中非空）
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this._selected && this._selected.size) { e.preventDefault(); this._deleteSelected(); }
        return;
      }
      // F：便签被拖出视野后，重新归位到视野中心
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); this._recenterNotes(); }
    };
    document.addEventListener('keydown', this._selKeyHandler);
    },

    /** 写作档快捷键：Cmd/Ctrl + 1..6 把选中卡设为 H1..H6。
    *  仅在写作档且已有选中卡时生效；与输入框的 Markdown 前缀（"# 标题"）互为补充——
    *  前缀用于「新卡即定级」，快捷键用于「事后改级」。 */
    _bindLevelKeys() {
    this._levelKeyHandler = (e) => {
    if (this._mode !== 'write') return;
    if (!(e.metaKey || e.ctrlKey)) return;
    if (!this._selected || !this._selected.size) return;
    const n = '123456'.indexOf(e.key);
    if (n < 0) return;
    e.preventDefault();   // 拦掉浏览器 Cmd/Ctrl+1..6（切标签页等）
    const lv = 'h' + (n + 1);
    this._selected.forEach((card) => this._applyLevel(card, lv));
    this._scheduleSave();
    this._showScreenMsg('LEVEL: ' + (LEVEL_LABELS[lv] || lv), 900);
    };
    document.addEventListener('keydown', this._levelKeyHandler);
    },

  // ===== 手动调整大小 =====

  /** 缩放系数安全化：非法值回落 1（默认尺寸），并夹到 [ZOOM_MIN, ZOOM_MAX] */
  _clampZoom(z) {
    const n = Number(z);
    if (!isFinite(n) || n <= 0) return 1;
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, n));
  },

  /** 应用缩放：只写 --tw-card-zoom。卡片内所有尺寸都由 em 推导，
      改这一个变量即整体等比（框宽、字号、留白、装饰全部同步）。 */
  _applyZoom(card, zoom) {
    const z = this._clampZoom(zoom);
    card.dataset.zoom = z.toFixed(3);
    if (z === 1) card.style.removeProperty('--tw-card-zoom');
    else card.style.setProperty('--tw-card-zoom', z.toFixed(3));
    // 拖拽手柄 / ⌘+滚轮 改完缩放后，尺寸档位按钮的可用态也要跟着更新
    this._syncCardScaleButtons(card);
    // 连续编辑改走 WritingDoc 原语：缩放即改规范模型（与落盘/撤销/导出同源）
    this._notes = WritingDoc.setZoom(this._notes, card.dataset.id, this._clampZoom(card.dataset.zoom));
    this._invalidateGeo(card.dataset.id);   // 缩放改了卡片尺寸 → 几何失效（滚轮/双击复位/档位钮都走这里）
    return z;
  },

  /** 当前 zoom 最接近哪一档（拖拽出来的连续值也能给出可读的档位名） */
  _zoomIdxOf(zoom) {
    const z = this._clampZoom(zoom);
    let idx = CARD_SCALE_DEFAULT_IDX;
    let bestD = Infinity;
    CARD_SCALES.forEach((s, i) => {
      const d = Math.abs(s - z);
      if (d < bestD) { bestD = d; idx = i; }
    });
    return idx;
  },

  /** 尺寸档位步进：从当前值（哪怕是被拖出来的连续值）跳到相邻的下一档 */
  _stepCardScale(card, dir) {
    const z = this._clampZoom(card.dataset.zoom);
    let idx = -1;
    if (dir > 0) {
      for (let i = 0; i < CARD_SCALES.length; i++) {
        if (CARD_SCALES[i] > z + 0.01) { idx = i; break; }
      }
    } else {
      for (let i = CARD_SCALES.length - 1; i >= 0; i--) {
        if (CARD_SCALES[i] < z - 0.01) { idx = i; break; }
      }
    }
    if (idx < 0) return false;
    this._applyZoom(card, CARD_SCALES[idx]);
    return true;
  },

  /** 同步 ⊟/⊞ 的可用态与提示文案 */
  _syncCardScaleButtons(card) {
    const out = card.querySelector('.tw-card-zoom-out');
    const inc = card.querySelector('.tw-card-zoom-in');
    if (!out || !inc) return;
    const z = this._clampZoom(card.dataset.zoom);
    const label = CARD_SCALE_LABELS[this._zoomIdxOf(z)];
    out.disabled = (z <= CARD_SCALES[0] + 0.01);
    inc.disabled = (z >= CARD_SCALES[CARD_SCALES.length - 1] - 0.01);
    out._tipText = `缩小便签（当前：${label}）`;
    inc._tipText = `放大便签（当前：${label}）`;
    this._refreshTip();
  },

  /** ⊟/⊞ 步进便签尺寸档位（S/M/L/XL） */
  _bindZoomSteps(card) {
    const step = (dir) => {
      if (!this._stepCardScale(card, dir)) return;
      this._scheduleSave();
    };
    const out = card.querySelector('.tw-card-zoom-out');
    const inc = card.querySelector('.tw-card-zoom-in');
    if (out) out.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    if (inc) inc.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
    this._syncCardScaleButtons(card);
  },

  /** 写入便签纸样：更新 dataset、抬头与按钮提示（提示里带当前纸样名）。
   *  只作用于这一张便签 —— 与寻呼机上的 PAPER 键（只影响「之后打印」的便签）互不干扰。 */
  _applyPaper(card, paper) {
    const p = (PAPERS.indexOf(paper) >= 0) ? paper : 'plain';
    card.dataset.paper = p;
    const title = card.querySelector('.tw-card-title');
    if (title) title.textContent = PAPER_TITLES[p] || PAPER_TITLES.plain;
    const btn = card.querySelector('.tw-card-paper');
    if (btn) btn._tipText = `切换便签样式（当前：${PAPER_LABELS[p] || p}）`;
    this._refreshTip();
    this._notes = WritingDoc.setPaper(this._notes, card.dataset.id, p);
    this._invalidateGeo(card.dataset.id);   // 纸样改了 padding/比例 → 尺寸变，几何失效
    return p;
    },

  /** 切换纸样：在这张便签上循环 PAPERS。
   *  两处副作用必须一并处理：
   *   1) 定版纸样（书燕等）字级封顶更低，切过去要把字级夹回新上限；
   *   2) 纸样会改变卡片尺寸/比例，连线端点要重算。 */
  _bindPaperSwitch(card) {
    const btn = card.querySelector('.tw-card-paper');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cur = card.dataset.paper || 'plain';
      const next = PAPERS[(PAPERS.indexOf(cur) + 1) % PAPERS.length];
      this._applyPaper(card, next);
      this._applyFontScale(card, Number(card.dataset.fontIdx));  // ① 夹回新纸样的字级上限
      this._scheduleRenderLinks();                                // ② 尺寸/比例变了，端点重算
      this._scheduleSave();
      if (typeof Toast !== 'undefined') {
        Toast.showToast('已切换为「' + (PAPER_LABELS[next] || next) + '」', 'success');
      }
    });
  },

  /** 写入结构级别：更新 dataset 与按钮文字标签。
   *  与纸样互不干扰 —— 纸样只管视觉，级别只管结构（两者彻底解耦）。 */
  _applyLevel(card, level) {
    const lv = (LEVELS.indexOf(level) >= 0) ? level : 'p';
    card.dataset.level = lv;
    const btn = card.querySelector('.tw-card-level');
    if (btn) {
      const label = LEVEL_LABELS[lv] || LEVEL_LABELS.p;
      btn.textContent = label;
      btn.title = '结构级别：' + (LEVEL_FEEDBACK[lv] || LEVEL_FEEDBACK.p) + '（点击切换）';
      btn.setAttribute('aria-label', '结构级别 ' + label + '，点击切换');
    }
    this._refreshLevelSteps(card);   // 层级变了：± 钮的可用态与「→ 下一级」提示要跟着变
    this._notes = WritingDoc.setLevel(this._notes, card.dataset.id, lv);
    this._invalidateGeo(card.dataset.id);   // 级别改了 padding/行高/最大宽度 → 几何失效
    return lv;
  },

  /** 写作档：工具条「上移 / 下移」—— 把这张卡在文章顺序里与相邻卡互换一位。
   *  顺序的真值是 _orderCards()（优先连线、回退阅读顺序），故分两步走：
   *   1) 先交换相邻两张的位置 —— 无连线的常态下阅读顺序随之交换，这一步就够；
   *   2) 若画布已串成链，顺序由连线而非位置决定，只换位置顺序不变、按钮会像失灵 ——
   *      此时把连线按新顺序重接（_rewireChain 只在确认是单链时才动手，有分叉一律不碰，
   *      绝不替用户把分支拍平成一条链）。 */
  _moveCardInOrder(card, dir) {
    if (!this._canvas || this._mode !== 'write') return;
    const seq = this._orderCards();
    const i = seq.findIndex((c) => c.el === card);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= seq.length) {
      this._showScreenMsg(dir < 0 ? '已经是最前面一张' : '已经是最后面一张', 1200);
      return;
    }
    const next = seq.slice();
    next[i] = seq[j]; next[j] = seq[i];       // 新顺序 = 相邻两位互换
    const a = seq[i].el, b = seq[j].el;
    if (this._undoStack) this._undoStack.push();
    const al = a.style.left, at = a.style.top;
    a.style.left = b.style.left; a.style.top = b.style.top;
    b.style.left = al; b.style.top = at;
    // 连续编辑改走 WritingDoc 原语：上移/下移即交换两张卡在模型里的坐标
    this._notes = WritingDoc.setPos(this._notes, a.dataset.id, parseFloat(a.style.left) || 0, parseFloat(a.style.top) || 0);
    this._notes = WritingDoc.setPos(this._notes, b.dataset.id, parseFloat(b.style.left) || 0, parseFloat(b.style.top) || 0);
    this._rewireChain(next);
    this._scheduleRenderLinks();
    this._scheduleSave();
    this._refreshWriteOrder();                // 徽标 + 上移/下移可用态
    this._scheduleCull();                     // 上移/下移后重算挂载
    this._showScreenMsg((dir < 0 ? '已上移到第 ' : '已下移到第 ') + (j + 1) + ' 位', 1400);
  },

  /** 若现有连线是一条单链（每卡最多一出、最多一入），按给定序列把整条链重接；否则原样返回 false。
   *  刻意不动分叉结构：那是用户有意为之的分支，重接会不可逆地把它拍平。 */
  _rewireChain(seq) {
    const L = this._links || [];
    if (L.length < 1 || seq.length < 2) return false;
    const out = new Map(), inn = new Map();
    for (const l of L) {
      out.set(l.from, (out.get(l.from) || 0) + 1);
      inn.set(l.to, (inn.get(l.to) || 0) + 1);
      if (out.get(l.from) > 1 || inn.get(l.to) > 1) return false;   // 有分叉 → 不擅自动
    }
    const route = L[0].route || 'bezier';
    const dash = L[0].dash || 'solid';
    this._links = seq.slice(0, -1).map((c, k) => ({
      from: seq[k].id, to: seq[k + 1].id, route, bend: 0, dash,
    }));
    return true;
  },

  /** 上移/下移的点击绑定。两个钮在非写作档被 CSS 隐藏，故无需再判模式。 */
  _bindOrderSteps(card) {
    const go = (dir) => (e) => { e.stopPropagation(); this._moveCardInOrder(card, dir); };
    const up = card.querySelector('.tw-card-move-up');
    const dn = card.querySelector('.tw-card-move-down');
    if (up) up.addEventListener('click', go(-1));
    if (dn) dn.addEventListener('click', go(1));
  },

  /** 层级 ± 的点击绑定：沿 LEVEL_LADDER 走一格，到边界时按钮已被 _refreshLevelSteps 置灰。 */
  _bindLevelSteps(card) {
    const step = (dir) => (e) => {
      e.stopPropagation();
      if (this._mode !== 'write') return;
      const idx = LEVEL_LADDER.indexOf(card.dataset.level || 'p');
      if (idx < 0) return;
      const nxt = LEVEL_LADDER[idx + dir];
      if (!nxt || nxt === card.dataset.level) return;
      if (this._undoStack) this._undoStack.push();
      this._applyLevel(card, nxt);
      this._scheduleSave();
      this._showScreenMsg('LEVEL: ' + (LEVEL_LABELS[nxt] || nxt), 1000);
    };
    const up = card.querySelector('.tw-card-lv-up');    // 提升 = 往 H1 方向 = 下标 -1
    const dn = card.querySelector('.tw-card-lv-down');  // 降低 = 往正文方向 = 下标 +1
    if (up) up.addEventListener('click', step(-1));
    if (dn) dn.addEventListener('click', step(1));
  },

  /** 层级 ± 的可用态与提示：按 LEVEL_LADDER 夹边界。
   *  引用 / 列表不在梯子上（它们表达文本形态而非层级深度），两端置灰并说明改用类型菜单。 */
  _refreshLevelSteps(card) {
    const up = card.querySelector('.tw-card-lv-up');
    const dn = card.querySelector('.tw-card-lv-down');
    if (!up && !dn) return;
    const lv = card.dataset.level || 'p';
    const idx = LEVEL_LADDER.indexOf(lv);
    const cur = LEVEL_LABELS[lv] || lv;
    const off = idx < 0;
    const offTip = cur + ' 不参与层级升降（用类型菜单切换）';
    if (up) {
      const top = idx === 0;
      up.disabled = off || top;
      up._tipText = off ? offTip
        : (top ? '已是最高层级 H1' : `提升层级：${cur} → ${LEVEL_LABELS[LEVEL_LADDER[idx - 1]]}`);
    }
    if (dn) {
      const bottom = idx === LEVEL_LADDER.length - 1;
      dn.disabled = off || bottom;
      dn._tipText = off ? offTip
        : (bottom ? '已是最低（正文）' : `降低层级：${cur} → ${LEVEL_LABELS[LEVEL_LADDER[idx + 1]]}`);
    }
    this._refreshTip();
  },

  /** 类型控件：点一下弹出分组菜单。
   *  11 种类型若还靠「点一下换一个」循环，最坏要连点 10 次，已不可用，故改为菜单一次点选。
   *  改的只是结构角色，纸样与位置一概不动。 */
  _bindLevelSwitch(card) {
    const btn = card.querySelector('.tw-card-level');
    if (!btn) return;
    // 徽章已移出工具条，直接挂在卡片下：挡掉 pointerdown，卡片拖拽与画布都不感知这次按下
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 同一张卡的菜单已开着 → 再点是收起，避免想关却只是重开
      if (this._levelMenuCard === card && this._levelMenu && !this._levelMenu.hidden) {
        this._hideLevelMenu();
        return;
      }
      this._showLevelMenu(card, btn);
    });
  },

  /** 类型菜单（全画布共用一个浮层，按需创建）。
   *  挂在功能根元素上：卡片在画布里带 transform、且 .tw-card-main 有 overflow:hidden，
   *  浮层若塞进卡片会被裁掉，也会被 z-index 更高的邻卡盖住。 */
  _ensureLevelMenu() {
    if (this._levelMenu || !this._el) return;
    // 浮层用 absolute 定位，需根元素作为定位基准；根元素若为 static 就补一个 relative
    if (getComputedStyle(this._el).position === 'static') this._el.style.position = 'relative';
    const menu = document.createElement('div');
    menu.className = 'tw-level-menu';
    menu.hidden = true;
    LEVEL_GROUPS.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'tw-level-menu-group';
      const cap = document.createElement('span');
      cap.className = 'tw-level-menu-cap';
      cap.textContent = g.label;
      row.appendChild(cap);
      g.items.forEach((lv) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tw-level-menu-item';
        b.dataset.level = lv;
        // 圆点颜色交给 CSS 的 --lv-* 变量（见 notes.css），此处不写死色值
        b.innerHTML = '<i class="tw-level-dot" data-level="' + lv + '"></i>'
          + '<span>' + (LEVEL_LABELS[lv] || lv) + '</span>';
        row.appendChild(b);
      });
      menu.appendChild(row);
    });
    // 浮层内的交互不冒泡到画布（否则会触发平移 / 框选）
    menu.addEventListener('pointerdown', (e) => e.stopPropagation());
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.tw-level-menu-item');
      const card = this._levelMenuCard;
      if (!item || !card) return;
      const lv = item.dataset.level;
      this._applyLevel(card, lv);
      this._scheduleSave();
      this._showScreenMsg('LEVEL: ' + (LEVEL_FEEDBACK[lv] || lv), 900);
      this._hideLevelMenu();
    });
    this._el.appendChild(menu);
    this._levelMenu = menu;
  },

  /** 在按钮旁展开菜单：优先贴下方，下方放不下翻到上方，再夹回视口内。 */
  _showLevelMenu(card, btn) {
    this._ensureLevelMenu();
    const menu = this._levelMenu;
    if (!menu) return;
    this._levelMenuCard = card;
    const cur = card.dataset.level || 'p';
    menu.querySelectorAll('.tw-level-menu-item').forEach((it) => {
      it.classList.toggle('is-on', it.dataset.level === cur);
    });
    menu.hidden = false;                       // 先显示再量：隐藏元素量不到尺寸
    const r = btn.getBoundingClientRect();
    const mr = menu.getBoundingClientRect();
    const host = this._el.getBoundingClientRect();
    const M = 8;                               // 视口安全边距
    let vt = r.bottom + 4;
    if (vt + mr.height > window.innerHeight - M) vt = Math.max(M, r.top - mr.height - 4);
    let vl = r.left;
    if (vl + mr.width > window.innerWidth - M) vl = Math.max(M, window.innerWidth - mr.width - M);
    menu.style.top = (vt - host.top) + 'px';
    menu.style.left = (vl - host.left) + 'px';
    // 打开期间接管：点空白处或按 Esc 收起（捕获阶段，确保早于画布的 pointerdown）
    if (!this._levelMenuDocHandler) {
      this._levelMenuDocHandler = (ev) => {
        if (ev.type === 'keydown' && ev.key !== 'Escape') return;
        if (this._isInLevelMenu(ev)) return;
        this._hideLevelMenu();
      };
    }
    document.addEventListener('pointerdown', this._levelMenuDocHandler, true);
    document.addEventListener('keydown', this._levelMenuDocHandler, true);
  },

  _hideLevelMenu() {
    if (this._levelMenu) this._levelMenu.hidden = true;
    this._levelMenuCard = null;
    if (this._levelMenuDocHandler) {
      document.removeEventListener('pointerdown', this._levelMenuDocHandler, true);
      document.removeEventListener('keydown', this._levelMenuDocHandler, true);
    }
  },

  // ===== 写作卡片组 / 思维导图组 切换器（列 / 选 / 新建 / 改名）=====
  // 复用 level-menu 的浮层范式：挂在功能根、absolute 定位、外部点击用 composedPath 判定
  // （Shadow DOM 事件重定向，closest 会失效，见 _isInLevelMenu 的坑）。
  // kind = 'write'（写作卡片组）| 'mindmap'（思维导图组）| null（便签模式不显示切换器）
  _getDocKind() {
    if (this._mindmap) return 'mindmap';
    if (this._mode === 'write') return 'write';
    return null;
  },
  _ensureDocCorner() {
    if (this._docCorner || !this._el) return;
    if (getComputedStyle(this._el).position === 'static') this._el.style.position = 'relative';
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'tw-doc-corner';
    c.id = 'twDocCorner';
    c.hidden = true;
    c.textContent = '';
    const label = document.createElement('span');
    label.className = 'tw-doc-corner-label';
    label.textContent = '未命名草稿';
    c.appendChild(label);
    c.addEventListener('click', () => {
      if (this._getDocKind() == null) return;
      if (this._docPanel && !this._docPanel.hidden) this._hideDocPanel();
      else this._showDocPanel();
    });
    // 阻止画布平移吞掉点击（机身区平移绑在 feature 根上）
    c.addEventListener('pointerdown', (e) => e.stopPropagation());
    this._el.appendChild(c);
    this._docCorner = c;
  },
  _ensureDocPanel() {
    if (this._docPanel || !this._el) return;
    if (getComputedStyle(this._el).position === 'static') this._el.style.position = 'relative';
    const panel = document.createElement('div');
    panel.className = 'tw-doc-panel';
    panel.hidden = true;
    panel.addEventListener('pointerdown', (e) => e.stopPropagation());   // 浮层内交互不冒泡到画布
    this._el.appendChild(panel);
    this._docPanel = panel;
  },
  async _renderDocPanel() {
    this._ensureDocPanel();
    const panel = this._docPanel;
    if (!panel) return;
    const kind = this._getDocKind();
    if (!kind) { panel.hidden = true; return; }
    let groups, curId, headText, addText;
    if (kind === 'mindmap') {
      groups = await TypewriterStore.listMindmapGroups();
      const cur = await TypewriterStore.getCurrentMindmapGroup();
      curId = cur ? cur.id : null;
      headText = '思维导图组'; addText = '＋ 新建思维导图组';
    } else {
      groups = await TypewriterStore.listWritingGroups();
      const cur = await TypewriterStore.getCurrentWritingGroup();
      curId = cur ? cur.id : null;
      headText = '写作卡片组'; addText = '＋ 新建卡片组';
    }
    const fallback = kind === 'mindmap' ? '未命名思维导图' : '未命名草稿';
    panel.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'tw-doc-head';
    const t1 = document.createElement('span'); t1.textContent = headText;
    const t2 = document.createElement('span'); t2.className = 'tw-doc-count'; t2.textContent = String(groups.length);
    head.appendChild(t1); head.appendChild(t2);
    panel.appendChild(head);
    const list = document.createElement('div');
    list.className = 'tw-doc-list';
    groups.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'tw-doc-row' + (g.id === curId ? ' is-on' : '');
      row.dataset.id = g.id;
      const name = document.createElement('button');
      name.type = 'button';
      name.className = 'tw-doc-name';
      name.dataset.id = g.id;
      name.textContent = g.title || fallback;
      name.title = '单击切换组';
      name.addEventListener('click', () => this._switchDocGroup(kind, g.id));
      row.appendChild(name);
      // 编辑图标：单击即改组名（比双击更直观，也避免与画布双击误触）
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'tw-doc-edit';
      edit.title = '重命名该组';
      edit.textContent = '✎';
      edit.addEventListener('click', (e) => {
        e.stopPropagation();
        this._beginRenameDoc(kind, g.id, name);
      });
      row.appendChild(edit);
      // 删除图标：点击经确认后删除该组（含其绑定笔记）
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'tw-doc-del';
      del.title = '删除该组';
      del.textContent = '✕';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        this._deleteDocGroup(kind, g.id, g.title);
      });
      row.appendChild(del);
      list.appendChild(row);
    });
    panel.appendChild(list);
    const foot = document.createElement('div');
    foot.className = 'tw-doc-foot';
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'tw-doc-add';
    add.textContent = addText;
    add.addEventListener('click', () => this._createDocGroup(kind));
    foot.appendChild(add);
    panel.appendChild(foot);
  },
  async _showDocPanel() {
    // 写作与思维导图两种组都用同一套面板；角控件只在有效模式可见（_applyModeChrome），
    // 故此处用 _getDocKind() 判空即可，不再限定写作模式。
    if (this._getDocKind() == null) return;
    this._ensureDocCorner();
    await this._renderDocPanel();
    const panel = this._docPanel;
    const btn = this._el.querySelector('#twDocCorner');
    if (!panel || !btn) return;
    panel.hidden = false;
    const br = btn.getBoundingClientRect();
    const root = this._el.getBoundingClientRect();
    const panelW = panel.offsetWidth || 200;
    const panelH = panel.offsetHeight || 160;
    // 右对齐到按钮右侧：面板向左展开，避免画布右上角时面板被右边界截断
    let left = br.right - root.left - panelW;
    left = Math.max(8, Math.min(left, root.width - panelW - 8));
    panel.style.left = left + 'px';
    panel.style.right = 'auto';
    // 垂直：默认在按钮下方；空间不足则翻到上方
    let top = br.bottom - root.top + 6;
    if (top + panelH > root.height - 8) {
      top = br.top - root.top - panelH - 6;
      if (top < 8) top = 8;
    }
    panel.style.top = top + 'px';
    if (!this._docDocHandler) {
      this._docDocHandler = (ev) => {
        if (panel.hidden) return;
        const path = (typeof ev.composedPath === 'function') ? ev.composedPath() : [];
        for (let i = 0; i < path.length; i += 1) {
          const n = path[i];
          if (n && n.classList && (n.classList.contains('tw-doc-panel') || n.id === 'twDocCorner')) return;
        }
        this._hideDocPanel();
      };
      document.addEventListener('pointerdown', this._docDocHandler, true);
    }
  },
  _hideDocPanel() {
    if (this._docPanel) this._docPanel.hidden = true;
    if (this._docDocHandler) {
      document.removeEventListener('pointerdown', this._docDocHandler, true);
      this._docDocHandler = null;
    }
  },
  async _switchWritingGroup(id) {
    if (this._mode !== 'write' || this._docBusy) return;
    const cur = (await TypewriterStore.getCurrentWritingGroup()).id;
    this._hideDocPanel();
    if (id === cur) return;
    this._docBusy = true;
    try {
      this._exitAllEdits();
      if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
      await this._persistDoc('write');          // 当前组落盘到它自己的独立文件
      await TypewriterStore.setWritingCurrent(id);
      await this._loadDoc('write');             // 清空当前画布并载入目标组
      if (this._undoStack) this._undoStack.reset();
      this._scheduleRenderLinks();
      await this._refreshDocBtnLabel();
      this._showScreenMsg('已切换卡片组', 1200);
    } finally {
      this._docBusy = false;
    }
  },
  async _createWritingGroup() {
    if (this._mode !== 'write' || this._docBusy) return;
    this._docBusy = true;
    try {
      this._exitAllEdits();
      if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
      await this._persistDoc('write');          // 先存好当前组
      await TypewriterStore.createWritingGroup('未命名草稿');
      await this._loadDoc('write');             // 新组为空，画布清空
      if (this._undoStack) this._undoStack.reset();
      await this._refreshDocBtnLabel();
      await this._renderDocPanel();             // 刷新列表（面板保持打开）
      this._showScreenMsg('已新建卡片组', 1200);
    } finally {
      this._docBusy = false;
    }
  },
  _beginRenameDoc(kind, id, nameEl) {
    if (!nameEl || !nameEl.isConnected) return;
    const cur = nameEl.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tw-doc-rename-input';
    input.value = cur;
    nameEl.replaceWith(input);
    input.focus(); input.select();
    let done = false;
    const commit = async () => {
      if (done) return; done = true;
      const v = input.value.trim();
      if (kind === 'mindmap') {
        // 思维导图是纯快照导出、不绑定笔记，改名只改组名
        await MindmapFeature.renameGroup(id, v || cur);
      } else {
        await TypewriterStore.renameWritingGroup(id, v || cur);
      }
      await this._refreshDocBtnLabel();
      await this._renderDocPanel();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.preventDefault(); this._renderDocPanel(); }
    });
    input.addEventListener('blur', commit);
  },

  async _deleteWritingGroup(id, title) {
    if (this._mode !== 'write' || this._docBusy) return;
    const idx = await TypewriterStore.ensureWritingIndex();
    const g = idx.groups[id];
    if (!g) return;
    const warn = '确定删除卡片组「' + (title || '未命名草稿') + '」？此操作无法撤销。';
    if (!window.confirm(warn)) return;
    this._docBusy = true;
    try {
      this._exitAllEdits();
      if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
      const wasCurrent = (await TypewriterStore.getCurrentWritingGroup()).id === id;
      await TypewriterStore.deleteWritingGroup(id);
      if (wasCurrent) await this._loadDoc('write');   // 删的是当前组 → 载入新的当前组
      if (this._undoStack) this._undoStack.reset();
      await this._refreshDocBtnLabel();
      await this._renderDocPanel();
      this._showScreenMsg('已删除卡片组', 1200);
    } finally {
      this._docBusy = false;
    }
  },

  // ===== 通用（写作 / 思维导图）组切换调度：按 kind 分流到各自实现 =====
  async _switchDocGroup(kind, id) {
    if (kind === 'mindmap') {
      if (this._docBusy) return;
      this._docBusy = true;
      try {
        this._hideDocPanel();
        const cur = (await TypewriterStore.getCurrentMindmapGroup()).id;
        if (id !== cur) {
          await MindmapFeature.switchGroup(id);
          await this._refreshDocBtnLabel();
          await this._renderDocPanel();
          this._showScreenMsg('已切换思维导图组', 1200);
        }
      } finally { this._docBusy = false; }
    } else {
      await this._switchWritingGroup(id);
    }
  },
  async _createDocGroup(kind) {
    if (kind === 'mindmap') {
      if (this._docBusy) return;
      this._docBusy = true;
      try {
        this._exitAllEdits();
        await MindmapFeature.newGroup();
        await this._refreshDocBtnLabel();
        await this._renderDocPanel();
        this._showScreenMsg('已新建思维导图组', 1200);
      } finally { this._docBusy = false; }
    } else {
      await this._createWritingGroup();
    }
  },
  async _deleteDocGroup(kind, id, title) {
    if (kind === 'mindmap') await this._deleteMindmapGroup(id, title);
    else await this._deleteWritingGroup(id, title);
  },
  async _deleteMindmapGroup(id, title) {
    if (this._docBusy) return;
    const idx = await TypewriterStore.ensureMindmapIndex();
    const g = idx.groups[id];
    if (!g) return;
    const warn = '确定删除思维导图组「' + (title || '未命名思维导图') + '」？此操作无法撤销。';
    if (!window.confirm(warn)) return;
    this._docBusy = true;
    try {
      this._exitAllEdits();
      const wasCurrent = (await TypewriterStore.getCurrentMindmapGroup()).id === id;
      await MindmapFeature.deleteGroup(id);   // 导图不绑定笔记：删组只删文档与索引
      // MindmapFeature.deleteGroup 已载入新当前组并重绘；这里只需刷新角标与面板
      await this._refreshDocBtnLabel();
      await this._renderDocPanel();
      this._showScreenMsg('已删除思维导图组', 1200);
    } finally {
      this._docBusy = false;
    }
  },

  async _refreshDocBtnLabel() {
    this._ensureDocCorner();
    const btn = this._el && this._el.querySelector('#twDocCorner');
    if (!btn) return;
    const kind = this._getDocKind();
    let title = '未命名草稿';
    let prefix = '当前写作卡片组：';
    if (kind === 'mindmap') {
      const g = await TypewriterStore.getCurrentMindmapGroup();
      title = (g && g.title) || '未命名思维导图';
      prefix = '当前思维导图组：';
    } else if (kind === 'write') {
      const g = await TypewriterStore.getCurrentWritingGroup();
      title = (g && g.title) || '未命名草稿';
    } else {
      btn.title = '当前没有可切换的组';
      return;
    }
    const label = btn.querySelector('.tw-doc-corner-label');
    if (label) label.textContent = title;
    btn.title = prefix + title + '（点击切换 / 新建）';
  },

  /** 事件是否发生在类型菜单（或其触发徽章）内部。
   *  【坑·真根因】菜单在 Shadow DOM 内，事件冒泡到 document 时会被**重定向（retargeting）**：
   *  ev.target 变成影子宿主元素，于是 closest('.tw-level-menu') 恒为 null，
   *  「点菜单里的选项」被误判成「点空白处」而提前收起，随后 click 抵达时
   *  _levelMenuCard 已被清空 → 选项永远点不动。
   *  故必须用 composedPath() —— 它保留影子内部的真实节点链路。
   *  徽章一并纳入：让「再点徽章收起」由徽章自己的 click 处理，不被这里提前清掉。 */
  _isInLevelMenu(ev) {
    const path = (typeof ev.composedPath === 'function') ? ev.composedPath() : [];
    for (let i = 0; i < path.length; i += 1) {
      const n = path[i];
      if (!n || n.nodeType !== 1 || !n.classList) continue;
      if (n.classList.contains('tw-level-menu')) return true;
      if (n.classList.contains('tw-card-level')) return true;
    }
    // 兜底：无 composedPath 的老环境退回 target
    return !!(ev.target && ev.target.closest && ev.target.closest('.tw-level-menu'));
  },

  /** 写作档的专属外观开关：画布上挂一个类，切档时无需重建任何卡片 DOM。
   *  这个类同时管两件事：① 显示结构级别钮；② 启用写作档自己的国际化卡片体系
   *  （压过便签的纸样样式，见 notes.css 的 .tw-mode-write 段落）。 */
  _refreshWriteMode() {
    if (!this._canvas) return;
    this._canvas.classList.toggle('tw-mode-write', this._mode === 'write');
  },

  /** 字级档位上限：定版纸样（书燕）的文本区是按百分比预留的、纸面高度固定，
      字放太大撑出留白区会破坏版式，故封顶「很大 140%」（文本区已加 overflow 兜底）；
      流式纸样字变大纸自然变长，可一路到最大档。 */
  _maxFontIdx(paper) {
    return (paper === 'shuyan' || paper === 'redsilk' || paper === 'ruoshui' || paper === 'tengyun' || paper === 'juhuo' || paper === 'yingyue') ? 5 : FONT_SCALES.length - 1;
  },

  /** 落盘值 → 档位索引：取最接近的一档（兼容浮点误差与历史数据） */
  _fontIdxOf(scale, paper) {
    const max = this._maxFontIdx(paper);
    const n = Number(scale);
    let idx = FONT_SCALE_DEFAULT_IDX;
    if (isFinite(n) && n > 0) {
      let bestD = Infinity;
      FONT_SCALES.forEach((s, i) => {
        if (i > max) return;
        const d = Math.abs(s - n);
        if (d < bestD) { bestD = d; idx = i; }
      });
    }
    return Math.min(max, idx);
  },

  /** 应用字级：只写 --tw-text-zoom（→ --tw-type-fs），纸面大小与留白不动 */
  _applyFontScale(card, idx) {
    const max = this._maxFontIdx(card.dataset.paper);
    const raw = Number(idx);
    const i = Math.min(max, Math.max(0, isFinite(raw) ? raw : FONT_SCALE_DEFAULT_IDX));
    card.dataset.fontIdx = String(i);
    card.dataset.fontScale = String(FONT_SCALES[i]);
    card.style.setProperty('--tw-text-zoom', String(FONT_SCALES[i]));
    const down = card.querySelector('.tw-card-font-down');
    const up = card.querySelector('.tw-card-font-up');
    const label = FONT_SCALE_LABELS[i];
    if (down) {
      down.disabled = (i === 0);
      down._tipText = `缩小字号（当前：${label}）`;
    }
    if (up) {
      up.disabled = (i >= max);
      up._tipText = `放大字号（当前：${label}）`;
    }
    this._refreshTip();
    this._notes = WritingDoc.setFontScale(this._notes, card.dataset.id, card.dataset.fontScale);
    this._invalidateGeo(card.dataset.id);   // 字级改了文字尺寸 → 卡片高度随之变，几何失效
    return i;
  },

  /** A−/A+ 步进：点一次走一档，到边界自动置灰，改完即落盘 */
  _bindFontSteps(card) {
    const step = (dir) => {
      const cur = Number(card.dataset.fontIdx);
      const next = isFinite(cur) ? cur + dir : FONT_SCALE_DEFAULT_IDX;
      const applied = this._applyFontScale(card, next);
      if (applied === cur) return;   // 已达上下限，无变化
      this._scheduleSave();
    };
    const down = card.querySelector('.tw-card-font-down');
    const up = card.querySelector('.tw-card-font-up');
    if (down) down.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    if (up) up.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  },

  /** 外围工具条的配套行为：
      1) hover/钉住时把便签临时提到最上层 —— 否则贴在纸外的工具条会被相邻便签盖住；
      2) 便签贴画布顶部时工具条翻到下方，避免被画布裁掉；
      3) 轻点便签（未拖动）钉住工具条，点画布空白处取消 —— 触屏没有 hover 也能用。 */
  _bindTools(card) {
    const placeTools = () => {
      const canvas = this._canvas;
      if (!canvas) return;
      const cr = canvas.getBoundingClientRect();
      const kr = card.getBoundingClientRect();
      card.classList.toggle('tw-tools-below', (kr.top - cr.top) < 46);
    };
    const lift = () => {
      placeTools();
      if (card.dataset.zLifted === '1') return;
      card.dataset.zLifted = '1';
      card._zPrev = card.style.zIndex;
      card.style.zIndex = '5000';
    };
    const drop = () => {
      if (card.dataset.zLifted !== '1') return;
      // 钉住态与拖拽中保持置顶，不回落
      if (card.classList.contains('is-pinned') || card.classList.contains('dragging')) return;
      card.dataset.zLifted = '';
      card.style.zIndex = card._zPrev || '';
    };
    card.addEventListener('mouseenter', lift);
    card.addEventListener('mouseleave', drop);
    card.addEventListener('focusin', lift);
    card.addEventListener('focusout', drop);
  },

  /** 只钉住某张便签（传 null = 全部取消）；同时把其余便签的临时置顶还原 */
  _pinOnly(card) {
    const canvas = this._canvas;
    if (!canvas) return;
    Array.from(canvas.querySelectorAll('.tw-card')).forEach((c) => {
      if (c === card) return;
      c.classList.remove('is-pinned');
      if (c.dataset.zLifted === '1' && !c.classList.contains('dragging')) {
        c.dataset.zLifted = '';
        c.style.zIndex = c._zPrev || '';
      }
    });
    if (!card) return;
    card.classList.add('is-pinned');
    card.dataset.zLifted = '1';
    card._zPrev = card._zPrev || card.style.zIndex;
    card.style.zIndex = '5000';
  },

  // ===== 二次编辑 =====

  /** 入口：双击便签 = 进入编辑（编辑态内双击交给浏览器选词）；
      工具条已无铅笔按钮，编辑只靠双击触发。 */
  _bindEdit(card) {
    card.addEventListener('dblclick', (e) => {
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate')) return;
      if (card.classList.contains('editing')) return;
      this._enterEdit(card);
    });
  },

  /** 同一时刻只编辑一张：进入新卡片前先收起其它正在编辑的 */
  _exitAllEdits() {
    if (!this._canvas) return;
    Array.from(this._canvas.querySelectorAll('.tw-card.editing')).forEach((c) => this._exitEdit(c));
  },

  _enterEdit(card) {
    if (card.classList.contains('editing')) return;
    this._exitAllEdits();
    const text = card.querySelector('.tw-card-text');
    if (!text) return;
    // 若还在打字动画中就进入编辑：先补齐全文并停表。
    // 否则逐字写入会持续覆写 contentEditable —— 光标被打飞、用户输入与动画互覆，
    // 且 pendingText 一除，落盘就会拿到「半截 + 手输」的残缺内容。
    this._finishTyping(card);
    card.classList.add('editing');
    this._editingId = card.dataset.id;   // 编辑中：钉在屏上，剔除跳过
    text.setAttribute('contenteditable', 'true'); // 所见即所得：直接在纸样内改，样式已就位
    text.focus();
    // 光标落到末尾
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    // 【根因修复】事件回调必须用闭包绑定 this：浏览器触发 addEventListener 时 this 会指向
    // text 元素而非 feature 实例，否则 _exitEdit/_scheduleSave 变成 undefined ——
    // 表现为 Escape 退出失效、输入不自动落盘。处理器存到 card._editHandlers 以便对称移除。
    const onInput = (e) => {
      if (e && e.isComposing) { this._scheduleSave(); return; }  // 输入法组字中：先不截断
      this._enforceEditLimit(text);
      this._notes = WritingDoc.setText(this._notes, card.dataset.id, text.innerText);  // 连续编辑改走 WritingDoc 原语
      this._scheduleSave();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this._exitEdit(card); // Enter 不拦截：contenteditable 内回车即多行便签
      }
    };
    const onPaste = (e) => {
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData('text/plain');
      const room = MAX_LEN - (text.innerText.length || 0);
      if (room <= 0) {
        if (typeof Toast !== 'undefined') Toast.showToast(`便签最多 ${MAX_LEN} 字`, 'info');
        return;
      }
      const allowed = t.length > room ? t.slice(0, room) : t;
      document.execCommand('insertText', false, allowed); // 只粘纯文本，不把网页样式带进便签
    };
    card._editHandlers = { onInput, onKey, onPaste };
    text.addEventListener('input', onInput);
    text.addEventListener('keydown', onKey);
    text.addEventListener('paste', onPaste);
    // 【根因修复·退不出编辑态】失焦即退出：点了便签以外的任何地方（空白画布 / 其它便签 /
    // 卡片纸边）都算「完成编辑」，避免卡在编辑态出不去。
    // 必须在 _exitEdit 里先移除本监听、再 removeAttribute('contenteditable')，
    // 否则移除 contenteditable 触发的 blur 会二次进入 _exitEdit。
    const onBlur = () => this._exitEdit(card);
    card._editBlur = onBlur;
    text.addEventListener('blur', onBlur);
  },

  _exitEdit(card) {
    if (!card.classList.contains('editing')) return;
    const text = card.querySelector('.tw-card-text');
    card.classList.remove('editing');
    if (this._editingId === card.dataset.id) this._editingId = null;   // 退出编辑：解除钉屏
    const h = card._editHandlers;
    card._editHandlers = null;
    if (text) {
      if (card._editBlur) { text.removeEventListener('blur', card._editBlur); card._editBlur = null; }
      text.removeAttribute('contenteditable');
      if (h) {
        text.removeEventListener('input', h.onInput);
        text.removeEventListener('keydown', h.onKey);
        text.removeEventListener('paste', h.onPaste);
      }
      if (window.getSelection) window.getSelection().removeAllRanges();
      this._notes = WritingDoc.setText(this._notes, card.dataset.id, text.innerText);  // 退出编辑：落盘前同步模型
      this._scheduleSave(); // 落盘：_collectNotes 读的是 .tw-card-text 内容
      if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
    }
    this._invalidateGeo(card.dataset.id);   // 编辑可能改变了卡片高度 → 几何失效
  },

  /** 编辑态强制字数上限：超过则截断到 MAX_LEN，并把光标移到末尾。
   *  防单个便签文本无限增长撑爆 vault 文件（剪贴板/输入法超长、外部粘贴等场景）。 */
  _enforceEditLimit(text) {
    if (!text) return;
    const full = text.innerText || '';
    if (full.length <= MAX_LEN) return;
    text.innerText = full.slice(0, MAX_LEN);
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(text);
      range.collapse(false);   // 光标落到末尾
      sel.removeAllRanges();
      sel.addRange(range);
    }
    if (typeof Toast !== 'undefined') Toast.showToast(`便签最多 ${MAX_LEN} 字`, 'info');
  },

  /** 右下角手柄拖拽缩放 + 双击手柄复位 + ⌘/Ctrl 滚轮微调。
      缩放以卡片左上角为锚（left/top 不变，向右下生长），与拖拽定位逻辑一致。 */
  _makeResizable(card) {
    const handle = document.createElement('div');
    handle.className = 'tw-card-resize';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', '调整便签大小');
    handle.title = '拖动调整大小 · 双击复位 · ⌘/Ctrl+滚轮微调';
    card.appendChild(handle);

    let resizing = false;
    let startX = 0;
    let startY = 0;
    let baseW = 1;      // zoom=1 时的卡片宽度：拖拽位移统一折算到这个基准上
    let startZoom = 1;
    // 【帧预算】缩放是重活：_applyZoom 会写 style + WritingDoc.setZoom（全量模型重写）
    // + _syncCardScaleButtons（DOM 查询）。pointermove 可达 120Hz，照原样每个事件同步跑一次
    // 会远超帧预算。故与旋转手势同一策略：目标值在本次手势内本地累计，rAF 合帧后每帧只落一次
    // （对标 tldraw 的 batched store updates）。
    let pendingZoom = 1;
    let raf = 0;
    // ⌘/Ctrl+滚轮缩放同理：触控板可在一帧内连发多次，需合帧
    let wheelRaf = 0;
    let pendingZoomW = null;   // null = 本帧无待落的滚轮缩放值

    const apply = () => {
      raf = 0;
      this._applyZoom(card, pendingZoom);
      this._scheduleRenderLinks();   // 尺寸变化会移动端点
    };
    const onMove = (e) => {
      if (!resizing) return;
      // 对角手势：向右下拖 = 放大（横向与纵向位移都计入，手感更自然）
      const delta = (e.clientX - startX) + (e.clientY - startY);
      pendingZoom = ((baseW + delta) / baseW) * startZoom;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      if (!resizing) return;
      resizing = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      this._applyZoom(card, pendingZoom);   // 补写最后一帧，避免丢掉末尾增量
      card.classList.remove('is-resizing');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      this._measureCard(card); // 缩放手势结束重测几何→刷新 geo+空间索引
      this._scheduleSave(); // 落盘新尺寸
    };

    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startZoom = this._clampZoom(card.dataset.zoom);
      pendingZoom = startZoom;
      const w = card.getBoundingClientRect().width || card.offsetWidth;
      baseW = (w || 340) / startZoom;
      card.classList.add('is-resizing');
      card.style.zIndex = String(++this._zTop);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._applyZoom(card, 1);
      this._scheduleSave();
    });

    // 滚轮：Shift = 调字级（档位多，滚轮比连点快）；⌘/Ctrl = 整张等比缩放（乘性步进，手感对称）
    card.addEventListener('wheel', (e) => {
      if (e.shiftKey && !(e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const cur = Number(card.dataset.fontIdx);
        const base = isFinite(cur) ? cur : FONT_SCALE_DEFAULT_IDX;
        if (this._applyFontScale(card, base + (e.deltaY > 0 ? -1 : 1)) !== base) this._scheduleSave();
        return;
      }
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      e.stopPropagation();   // 避免冒泡到画布层触发「画布整体缩放」
      // 【帧预算】触控板滚轮可在一帧内连发多次 → 步进先本地累计，rAF 合帧后只落一次。
      // 基准必须读「本帧已累计值」而非 dataset.zoom：一帧内第二个事件若读到尚未落盘的旧值会丢步进
      // （与旋转手势 pendingDeg 同一个坑，见 _makeRotatable 内注释）。
      const base = (pendingZoomW != null) ? pendingZoomW : this._clampZoom(card.dataset.zoom);
      pendingZoomW = base * (e.deltaY > 0 ? (1 - ZOOM_STEP) : (1 + ZOOM_STEP));
      if (!wheelRaf) {
        wheelRaf = requestAnimationFrame(() => {
          wheelRaf = 0;
          this._applyZoom(card, pendingZoomW);
          pendingZoomW = null;
          this._scheduleSave();
        });
      }
    }, { passive: false });
  },

  /** 应用旋转：只写 --tw-card-rot（与 hover 微放 --tw-card-scale 同处一张 transform 上，互不覆盖）。
   *  角度归一化到 (-180, 180]，便签无论转多少圈都落在可读区间。 */
  _applyRot(card, deg) {
    let d = Number(deg);
    if (!isFinite(d)) d = 0;
    d = ((d % 360) + 540) % 360 - 180;   // 归一到 (-180, 180]
    card.dataset.rot = d.toFixed(2);
    card.style.setProperty('--tw-card-rot', d + 'deg');
    this._notes = WritingDoc.setRot(this._notes, card.dataset.id, d);
    return d;
  },

  /** 外围圆钮（旋转 .tw-card-rotate / 连线 .tw-card-link）统一内联像素尺寸。
   *  【真根因】设计系统全局触控目标规则（base-foundation.css）把 [role="button"]
   *  地板到 min-width/min-height:44px，且 min-width 压过一切 width（含内联）——
   *  连线锚点(role=button)中招被撑到 44px，旋转握柄(role=slider)不命中 → 一大一小。
   *  故除 width/height 外还须内联同值 min-width/min-height，保证左右严格等大。 */
  _applyKnobSize(el) {
    const scale = parseFloat(this._el && this._el.style.getPropertyValue('--tw-scale')) || 1;
    const px = Math.min(38, Math.max(26, 30 * scale));
    const iconPx = Math.min(21, Math.max(15, 17 * scale));
    el.style.width = px.toFixed(2) + 'px';
    el.style.height = px.toFixed(2) + 'px';
    el.style.minWidth = px.toFixed(2) + 'px';
    el.style.minHeight = px.toFixed(2) + 'px';
    const svg = el.querySelector('svg');
    if (svg) {
      svg.style.width = iconPx.toFixed(2) + 'px';
      svg.style.height = iconPx.toFixed(2) + 'px';
    }
  },

  /** 左侧中部旋转握柄（与右侧连线锚点对称，下方通道留给工具条）：
      拖动绕卡片中心自由旋转；Shift 吸附 15°；双击握柄归零。 */
  _makeRotatable(card) {
    const handle = document.createElement('div');
    handle.className = 'tw-card-rotate';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', '旋转便签');
    handle.title = '拖动旋转 · Shift 吸附 15° · 双击归零';
    handle.innerHTML = ICON_ROTATE;
    this._applyKnobSize(handle);   // 内联像素：与右侧连线锚点严格等大
    card.appendChild(handle);

    let rotating = false;
    let lastAngle = 0;
    // 【性能】旋转是绕卡片中心的，中心在旋转下不变 → pointerdown 时取一次即可复用。
    // 原先每次 move 都 getBoundingClientRect()，且与 _applyRot 的写入交替 → 强制同步重排。
    let cx0 = 0;
    let cy0 = 0;
    // 目标角度在本次手势内本地累计：合帧后 _applyRot 每帧才写一次 dataset，
    // 若仍像原先那样「读 dataset.rot + 增量」，一帧内的第二个事件会读到未更新的旧值 → 丢增量。
    let pendingDeg = 0;
    let raf = 0;
    const angleOf = (ax, ay, px, py) => Math.atan2(py - ay, px - ax) * 180 / Math.PI;
    const apply = () => {
      raf = 0;
      this._applyRot(card, pendingDeg);
      this._scheduleRenderLinks();   // 旋转后端点沿旋转矩形重算
    };
    const onMove = (e) => {
      if (!rotating) return;
      const a = angleOf(cx0, cy0, e.clientX, e.clientY);
      let delta = a - lastAngle;
      // 跨越 ±180° 时 atan2 会跳变，归一化增量避免「猛地多转一圈」
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;
      lastAngle = a;
      pendingDeg += delta;
      // Shift 吸附到 15° 网格；吸附值写回累计量，保证松手后不回弹
      if (e.shiftKey) pendingDeg = Math.round(pendingDeg / 15) * 15;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      if (!rotating) return;
      rotating = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      this._applyRot(card, pendingDeg);   // 补写最后一帧，避免丢掉末尾增量
      this._measureCard(card);            // 旋转手势结束重测几何→刷新 geo+空间索引
      this._scheduleRenderLinks();
      card.classList.remove('is-rotating');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      this._scheduleSave();   // 落盘新角度
    };
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rotating = true;
      const r = card.getBoundingClientRect();
      cx0 = r.left + r.width / 2;
      cy0 = r.top + r.height / 2;
      pendingDeg = Number(card.dataset.rot) || 0;
      lastAngle = angleOf(cx0, cy0, e.clientX, e.clientY);
      card.classList.add('is-rotating');
      card.style.zIndex = String(++this._zTop);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
    // 双击握柄归零（stopPropagation 避免冒泡到卡片/画布触发编辑或 fit-all）
    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._applyRot(card, 0);
      this._scheduleSave();
    });
  },

  // ===== 便签连线（委托给共享 LinkLayer；与思维子弹共用同一套渲染/交互/控件） =====

  _ensureLinkLayer() { return this._linkLayer.ensureLayer(); },
  _scheduleRenderLinks() {
    if (this._mode === 'write') this._refreshWriteOrder();
    this._linkLayer.scheduleRender();
  },
  _edgePoint(c, tx, ty) { return this._linkLayer.edgePoint(c, tx, ty); },
  _renderLinks() { this._linkLayer.render(); },
  _buildLink(svg, it) { return this._linkLayer.buildLink(svg, it); },
  _linkGeom(it) { return this._linkLayer.linkGeom(it); },
  _applyLinkGeom(g, geo) { this._linkLayer.applyGeom(g, geo); },
  _anchorOn(c, t) { return this._linkLayer.anchorOn(c, t); },
  _routePath(p1, ua, p2, ub, mode, bend) { return this._linkLayer.routePath(p1, ua, p2, ub, mode, bend); },
  _clearLinkControls() { this._linkLayer.clearControls(); },
  _endLinkHover() { this._linkLayer.endHover(); },
  _scheduleEndHover() { this._linkLayer.scheduleEndHover(); },
  _renderLinkControls(f, t) { this._linkLayer.renderControls(f, t); },
  _linkOf(f, t) { return this._linkLayer.linkOf(f, t); },
  _buildLinkControls(svg, f, t, key) { return this._linkLayer.buildControls(svg, f, t, key); },
  _applyLinkControlsGeom(c) { this._linkLayer.applyControlsGeom(c); },
  _highlightLinksOf(cardId, on) { this._linkLayer.highlightFor(cardId, on); },
  _setLinkActive(f, t, on) { this._linkLayer.setActive(f, t, on); },
  _watchCardSize(card) { this._linkLayer.watchSize(card); },
  _cardAtPoint(cx, cy, exclude) { return this._linkLayer.nodeAtPoint(cx, cy, exclude); },
  _makeLinkable(card) { this._linkLayer.makeLinkable(card); },

  /** 连线数据原语（供 LinkLayer 的 addLink/removeLink/removeLinksOf 选项调用；不自带渲染/落盘） */
  _addLink(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return false;
    const dup = this._links.some((l) =>
      (l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId));
    if (dup) return false;
    this._links.push({ from: fromId, to: toId, route: 'bezier', bend: 0, dash: 'solid' });
    return true;
  },
  _removeLink(fromId, toId) {
    this._links = this._links.filter((l) =>
      !((l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId)));
  },
  _removeLinksOf(cardId) { this._linkLayer.removeLinksOf(cardId); },
  _removeLinksOfData(cardId) {
    if (!cardId) return;
    this._links = this._links.filter((l) => l.from !== cardId && l.to !== cardId);
  },

  // ===== 自绘 tooltip =====

  /** 整块画布共用一个浮层（挂在功能根元素上），不每张便签各建一个 */
  _ensureTip() {
    if (this._tip && this._tip.isConnected) return this._tip;
    const tip = document.createElement('div');
    tip.className = 'tw-tip';
    tip.setAttribute('role', 'tooltip');
    this._el.appendChild(tip);
    this._tip = tip;
    return tip;
  },

  /** 定位在按钮正上方、6px 偏移处；顶部放不下则翻到下方 */
  _positionTip(el) {
    const tip = this._tip;
    if (!tip) return;
    const r = el.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    const maxLeft = (window.innerWidth || document.documentElement.clientWidth) - tr.width - 6;
    let left = r.left + r.width / 2 - tr.width / 2;
    left = Math.max(6, Math.min(left, maxLeft));
    let top = r.top - tr.height - 6;
    if (top < 6) top = r.bottom + 6;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  },

  /** 文案存在 el._tipText 上 —— 档位一变就能就地刷新，
      避免提示还写着「当前：M」而实际已经变成 L。 */
  _bindTips(card) {
    const targets = [
      [card.querySelector('.tw-card-paper'), '切换便签样式'],
      [card.querySelector('.tw-card-move-up'), '上移（文章顺序）'],
      [card.querySelector('.tw-card-move-down'), '下移（文章顺序）'],
      [card.querySelector('.tw-card-lv-up'), '提升层级'],
      [card.querySelector('.tw-card-lv-down'), '降低层级'],
      [card.querySelector('.tw-card-font-down'), '缩小字号'],
      [card.querySelector('.tw-card-font-up'), '放大字号'],
      [card.querySelector('.tw-card-zoom-out'), '缩小便签'],
      [card.querySelector('.tw-card-zoom-in'), '放大便签'],
      [card.querySelector('.tw-card-del'), '移除便签'],
    ];
    targets.forEach(([el, fallback]) => {
      if (!el) return;
      const show = () => {
        const tip = this._ensureTip();
        this._tipEl = el;
        tip.textContent = el._tipText || fallback;
        tip.classList.add('on');
        this._positionTip(el);
      };
      const hide = () => {
        if (this._tipEl === el) this._tipEl = null;
        if (this._tip) this._tip.classList.remove('on');
      };
      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);
      el.addEventListener('click', show); // 点完立刻用新文案重画
    });
  },

  /** 档位变化后就地刷新当前显示的提示 */
  _refreshTip() {
    const tip = this._tip;
    if (!tip || !this._tipEl || !tip.classList.contains('on')) return;
    const el = this._tipEl;
    const text = el._tipText || el.getAttribute('aria-label');
    if (!text) return;
    tip.textContent = text;
    this._positionTip(el);
  },

  // ===== 持久化 =====

  /** 从 vault 加载已保存便签并重建（直接显示全文，不重放打字动画） */
  async _restore() {
    if (this._restored) return;
    this._restored = true;
    // 存储契约收敛到 TypewriterStore：便签(新 schema) + 画布偏移，含版本/校验/备份/读后校验
    const { notes, canvasOffset, links, version } = await TypewriterStore.load();
    const canvas = this._canvas;
    const cr = canvas.getBoundingClientRect();
    const w = cr.width || 1;
    const h = cr.height || 1;
    // v1 的 x/y 是「相对画布宽高的比例」：画布尺寸一变，便签就按比例被甩出视野（量纲与
    // 画布偏移的绝对 px 不一致）。先按当前画布尺寸换算成绝对 px，随后以 v2 落盘，
    // 之后画布尺寸再变也不会带偏便签位置。
    const ratioCoords = (Number(version) || 1) < TypewriterStore.VERSION;
    const absNotes = ratioCoords
      ? (Array.isArray(notes) ? notes : []).map((n) => Object.assign({}, n, {
          x: (typeof n.x === 'number') ? n.x * w : n.x,
          y: (typeof n.y === 'number') ? n.y * h : n.y,
        }))
      : (Array.isArray(notes) ? notes : []);
    // 信任边界：读档数据经 WritingDoc.normalize 净化（补齐缺省、枚举/范围校正、丢非法项、
    // 连线去自环/悬空/重复），从此 this._notes 为便签的规范模型；_buildCards 再用它建 DOM。
    const doc = WritingDoc.normalize(absNotes, links || [], canvasOffset || { x: 0, y: 0 });
    this._notes = doc.notes;
    this._seedSpatial(); // 【P8 空间索引】恢复后重建索引（_buildCards 会逐个测量→精确入格）
    this._links = doc.links;
    this._canvasOffset = doc.canvasOffset;
    this._buildCards(this._notes, false, w, h);   // ratioCoords=false：坐标已是绝对 px
    this._applyCanvasTransform();
    this._renderLinks();   // 便签就位后再画连线（端点依赖布局尺寸）
    this._ensureNotesVisible();  // 便签若在视野外，自动归位（不必再手动双击空白）

    // 迁移：比例→px 换算完成后立刻以 v2 落盘，避免每次打开都重算
    if (ratioCoords && this._notes.length) this._scheduleSave();
  },

  /** 从便签数据数组重建卡片 DOM（被 _restore 与撤销重做复用）。
   *  ratioCoords=true 时 x/y 是「相对画布比例」，需按画布尺寸换算成绝对 px（v1 迁移）。 */
  _buildCards(notes, ratioCoords, w, h) {
    const canvas = this._canvas;
    // 全量重建：清掉旧 DOM + 挂载表 + 几何缓存，避免残留/串档
    if (!this._mountedCards) this._mountedCards = new Map();
    if (!this._geo) this._geo = new Map();
    this._mountedCards.clear();
    this._geo.clear();
    Array.from(canvas.querySelectorAll('.tw-card')).forEach((c) => c.remove());
    notes.forEach((n) => {
      const nn = Object.assign({}, n);
      // v1 比例坐标 → 绝对 px（坐标已是 px 后由 _mountCard 直接落位）
      if (ratioCoords) {
        nn.x = (typeof n.x === 'number') ? n.x * w : (w - 340) / 2;
        nn.y = (typeof n.y === 'number') ? n.y * h : 24;
      }
      this._mountCard(nn);
    });
    this._applyLod();
  },

  /** 收集画布上所有卡片为落盘数据（坐标存绝对 px，与画布偏移量纲一致；可超出画布以支持无限画布） */
  _collectNotes() {
    if (!this._canvas) return null;
    // 画布未布局（功能页被隐藏 / 刚挂载）时不落盘：返回 null 让调用方跳过，
    // 否则会存进「空便签列表」把已有数据覆盖掉。
    const cr = this._canvas.getBoundingClientRect();
    if (cr.width < 2 || cr.height < 2) return null;
    // 【P8 视口剔除】卡片 DOM 会被卸载，故不再从 DOM 收集；模型由 T0c 连续编辑原语实时保鲜，即唯一真源。
    // 深拷贝：避免撤销快照与活动模型共享引用（历史行为 _collectNotes 本就返回新数组）。
    return this._notes.map((n) => Object.assign({}, n));
  },

  // ===== 视口剔除（P8）=====
  // 卡片只挂载在屏内的；离屏卡从 DOM 卸载（模型/几何缓存仍留，连线照画），把 500+ 卡的布局成本压到视野内。
  // 被编辑 / 选中 / 拖拽中 / 打字中的卡「钉」在屏上，剔除跳过，避免焦点丢失 / 交互中断。

  /** 连线层取端点的几何源：挂载卡读活 DOM（与旧行为一致），离屏卡读几何缓存（最后测量值）。 */
  _getGeom(id) {
    if (!this._mountedCards || !this._geo) return null;
    const card = this._mountedCards.get(id);
    if (card) {
      return {
        cx: card.offsetLeft + card.offsetWidth / 2,
        cy: card.offsetTop + card.offsetHeight / 2,
        hw: card.offsetWidth / 2 || 1,
        hh: card.offsetHeight / 2 || 1,
        rot: Number(card.dataset.rot) || 0,
      };
    }
    const g = this._geo.get(id);
    if (g) return { cx: g.x + g.w / 2, cy: g.y + g.h / 2, hw: g.w / 2 || 1, hh: g.h / 2 || 1, rot: g.rot || 0 };
    return null;
  },

  /** 把一张模型卡建回 DOM 并挂进挂载表 + 量几何。culling 进屏时调用。 */
  _mountCard(note) {
    const _t0 = this._perfBegin();     // 【埋点】挂载成本是「DOM 池化是否值得做」的判据
    const card = this._createCardEl({
      id: note.id, font: note.font, paper: note.paper, date: note.date,
      zoom: note.zoom, fontScale: note.fontScale, rot: note.rot, level: note.level,
    });
    card.style.zIndex = String(++this._zTop);
    card.style.left = (typeof note.x === 'number' ? note.x : 0) + 'px';
    card.style.top = (typeof note.y === 'number' ? note.y : 0) + 'px';
    card.style.bottom = 'auto';
    const textEl = card.querySelector('.tw-card-text');
    textEl.textContent = (typeof note.text === 'string') ? note.text : '';
    this._canvas.appendChild(card);
    if (!this._mountedCards) this._mountedCards = new Map();
    if (!this._geo) this._geo = new Map();
    this._mountedCards.set(note.id, card);
    this._measureCard(card);
    this._perfEnd('mount', _t0);
    return card;
  },

  /** 量一张卡进几何缓存（坐标取 style.left/top；尺寸取 offset*，一次 reflow 摊销）。 */
  _measureCard(card) {
    const id = card.dataset.id;
    if (!id) return;
    if (!this._geo) this._geo = new Map();
    const g = {
      x: parseFloat(card.style.left) || 0,
      y: parseFloat(card.style.top) || 0,
      w: card.offsetWidth || 340,
      h: card.offsetHeight || 200,
      rot: Number(card.dataset.rot) || 0,
    };
    this._geo.set(id, g);
    // 【P8 空间索引】几何同步进索引，cull/框选只读索引、不读活 DOM
    if (!this._spatial) this._spatial = new SpatialIndex(512);
    this._spatial.update(id, g.x, g.y, g.w, g.h, g.rot);
  },

  /** 离屏卡卸载 DOM（保留模型/几何缓存/连线）。 */
  _unmountCard(id) {
    if (!this._mountedCards) return false;
    const card = this._mountedCards.get(id);
    if (!card) return false;
    card.remove();
    this._mountedCards.delete(id);
    return true;
  },

  /** 懒建 id→note 索引（cull mount 时按 id 取 note 内容，避免每次 O(n) find）。
   *  _notes 引用变更（WritingDoc 不可变更新）即失效重建，O(n) 仅发生在数据变更、非每帧 cull。 */
  _noteIndex() {
    if (this._noteById && this._noteByIdSrc === this._notes) return this._noteById;
    this._noteById = new Map();
    if (this._notes) for (const n of this._notes) this._noteById.set(n.id, n);
    this._noteByIdSrc = this._notes;
    return this._noteById;
  },

  /** 用模型坐标重建整张空间索引（默认尺寸占位；_buildCards 测量后精确入格）。
   *  保证「全量扫 _notes」只在加载/撤销时发生一次，而非每帧 cull。 */
  _seedSpatial() {
    if (!this._spatial) this._spatial = new SpatialIndex(512);
    this._spatial.clear();
    if (!this._notes) return;
    for (const n of this._notes) {
      const x = typeof n.x === 'number' ? n.x : 0;
      const y = typeof n.y === 'number' ? n.y : 0;
      this._spatial.insert(n.id, x, y, 340, 200, Number(n.rot) || 0);
    }
  },

  /** 必须钉在屏上、剔除跳过的卡（编辑 / 选中 / 拖拽中 / 打字中）。 */
  _pinnedIds() {
    const s = new Set();
    if (this._selected) this._selected.forEach((c) => { if (c.dataset && c.dataset.id) s.add(c.dataset.id); });
    if (this._draggingSet) this._draggingSet.forEach((id) => s.add(id));
    if (this._typingIds) this._typingIds.forEach((id) => s.add(id));
    if (this._editingId) s.add(this._editingId);
    return s;
  },

  /** 【几何缓存失效】标记一张卡的几何已不可信（尺寸/比例可能变了），待合帧重测。
   *  _geo 是命中测试、连线端点、框选、剔除矩形的唯一真源 —— 任何会改变卡片尺寸的操作
   *  都必须走这里，否则缓存陈旧会让连线端点、框选、剔除全部错位。
   *  重测是 reflow，故这里只打标记，真正的测量合帧批量做
   *  （对标 tldraw 的 geometry caching：失效廉价、测量合批、只在 prop 变化时失效）。 */
  _invalidateGeo(id) {
    if (!id) return;
    if (!this._geoDirty) this._geoDirty = new Set();
    this._geoDirty.add(id);
    this._scheduleGeoFlush();
  },

  /** 整机根字号变化 → 所有卡片的 em 尺寸全变 → 几何整体失效 */
  _invalidateGeoAll() {
    if (!this._geoDirty) this._geoDirty = new Set();
    if (this._geo) this._geo.forEach((_g, id) => this._geoDirty.add(id));
    if (this._mountedCards) this._mountedCards.forEach((_c, id) => this._geoDirty.add(id));
    this._scheduleGeoFlush();
  },

  _scheduleGeoFlush() {
    if (this._geoFlushRaf) return;
    this._geoFlushRaf = requestAnimationFrame(() => {
      this._geoFlushRaf = 0;
      this._flushGeo();
    });
  },

  // ===== 性能埋点（对标 tldraw PerformanceManager / PerformanceApiAdapter）=====
  // 默认关闭：_perfBegin 在关闭时只做一次布尔判断，热路径零开销。
  // 用途：用真实数据判定瓶颈（例如「DOM 卡节点池化」到底值不值得做），不凭印象优化。

  /** 开/关采样（开启后累计，用 reset 清零） */
  _setPerf(on) {
    this._perfOn = !!on;
    if (this._perfOn && !this._perf) this._perf = new Map();
  },

  _perfBegin() {
    if (!this._perfOn) return 0;
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  },

  _perfEnd(key, t0) {
    if (!t0 || !this._perfOn || !this._perf) return;
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const ms = now - t0;
    const p = this._perf.get(key) || { n: 0, total: 0, max: 0 };
    p.n += 1; p.total += ms; if (ms > p.max) p.max = ms;
    this._perf.set(key, p);
  },

  /** 读数：{ key: { n, avg, max, total } }（ms） */
  _perfReport() {
    const out = {};
    if (!this._perf) return out;
    this._perf.forEach((p, k) => {
      out[k] = { n: p.n, avg: +(p.total / p.n).toFixed(3), max: +p.max.toFixed(3), total: +p.total.toFixed(2) };
    });
    return out;
  },

  _perfReset() { if (this._perf) this._perf.clear(); },

  /** 合帧重测所有失效卡。离屏卡不在 DOM 无法测，保持旧值即可 —— 重挂载时 _mountCard 会测。 */
  _flushGeo() {
    const dirty = this._geoDirty;
    this._geoDirty = null;
    if (!dirty || !dirty.size) return;
    const _t0 = this._perfBegin();
    let changed = false;
    dirty.forEach((id) => {
      const card = this._mountedCards ? this._mountedCards.get(id) : null;
      if (!card) return;                 // 离屏：等重挂载时再测
      this._measureCard(card);
      changed = true;
    });
    if (changed) this._scheduleRenderLinks();   // 几何变了 → 连线端点要跟着走
    this._perfEnd('geoFlush', _t0);
  },

  _scheduleCull() {
    if (this._cullRaf) return;
    this._cullRaf = requestAnimationFrame(() => {
      this._cullRaf = 0;
      this._updateCulling();
    });
  },

  /** 重算挂载：离屏卸载、进屏重建。
   *  【P8 空间索引】可见集由索引 queryRect 直接给出（O(可视) 单元查询），不再全量扫 _notes；
   *  卸载只遍历挂载表（O(在屏)）。几何入格不读活 DOM，剔除态/虚拟化下照常工作。 */
  _updateCulling() {
    if (!this._restored || !this._canvas) return;
    if (!this._mountedCards) this._mountedCards = new Map();
    if (!this._geo) this._geo = new Map();
    if (!this._spatial) this._spatial = new SpatialIndex(512);
    if (this._CULL_MARGIN == null) this._CULL_MARGIN = 240;
    const cr = this._canvas.getBoundingClientRect();
    const VW = cr.width, VH = cr.height;
    if (VW < 2 || VH < 2) return;
    const _t0 = this._perfBegin();     // 【埋点】守卫之后才计时
    const off = this._canvasOffset || { x: 0, y: 0 };
    const M = this._CULL_MARGIN;
    const vx0 = -off.x - M, vy0 = -off.y - M, vx1 = VW - off.x + M, vy1 = VH - off.y + M;
    const pinned = this._pinnedIds();
    const noteIdx = this._noteIndex();
    // 可见集：空间索引按视口矩形查询（含旋转 AABB 跨单元的卡），返回量与可见卡数成正比
    const visible = this._spatial.queryRect(vx0, vy0, vx1, vy1);
    let changed = false;
    // 进屏 / 钉屏：挂载不在屏的
    visible.forEach((id) => {
      if (pinned.has(id) || this._mountedCards.has(id)) return;
      const note = noteIdx.get(id);
      if (note) { this._mountCard(note); changed = true; }
    });
    pinned.forEach((id) => {
      if (this._mountedCards.has(id)) return;
      const note = noteIdx.get(id);
      if (note) { this._mountCard(note); changed = true; }
    });
    // 离屏：卸载在屏但不在可见集的（遍历挂载表，O(在屏) 而非 O(总量)）
    this._mountedCards.forEach((card, id) => {
      if (pinned.has(id)) return;
      if (!visible.has(id)) { this._unmountCard(id); changed = true; }
    });
    if (changed) {
      this._linkLayer.clearControls();
      this._scheduleRenderLinks();
      if (this._mode === 'write') this._refreshWriteOrder();
    }
    this._applyLod();   // 在屏卡数变化 → 重算密集降级档
    this._perfEnd('cull', _t0);
  },

  /** LOD：按「交互态 + 可见密度」算出应有的降级档并应用。
   *  drag（画布平移中）> dense（在屏卡密集）> full（常态）。
   *  幂等：档位未变则不碰 DOM，避免每帧 classList 抖动。 */
  _applyLod() {
    if (!this._canvas) return;
    const dense = (this._mountedCards ? this._mountedCards.size : 0) > LOD_DENSITY;
    const drag = !!this._lodDragging;
    if (dense !== this._lodDense) {
      this._lodDense = dense;
      this._canvas.classList.toggle('tw-lod-dense', dense);
    }
    if (drag !== this._lodDrag) {
      this._lodDrag = drag;
      this._canvas.classList.toggle('tw-lod-drag', drag);
    }
  },

  /** 进入/退出「拖拽降级」：画布平移期间用最高降级，松手即恢复。
   *  幂等：状态未变则不触发 _applyLod。 */
  _setLodDragging(on) {
    const next = !!on;
    if (this._lodDragging === next) return;
    this._lodDragging = next;
    this._applyLod();
  },

  /** 防抖写盘：合并拖拽/删除/新增等连续操作 */
  _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this._saveNow();
    }, SAVE_DEBOUNCE);
  },

  /** 立即写盘（fire-and-forget）。
   *  【按档分流】便签写便签的 key、MD可视化写作写作的 key，两份文档永远不互相覆盖。
   *  导图档直接跳过（画布已隐藏、数据由 MindmapFeature 自管），避免空数据盖掉卡片。 */
  async _saveNow() {
    if (!this._canvas || this._mindmap) return;
    const notes = this._collectNotes();
    // 画布尚未布局时 _collectNotes 返回 null：跳过本次落盘，避免写入失真坐标覆盖好数据
    if (!notes) return;
    // 存储契约收敛到 TypewriterStore：自管 schema(putSetting)，画布偏移独立 KV。
    // 彻底绕开只认数组的 putTypewriterNotes，TS 端再也无法因结构假设清空数据。
    const off = this._canvasOffset || { x: 0, y: 0 };
    if (this._mode === 'write') {
      await TypewriterStore.saveWriting(notes, off, this._links);
    } else {
      await TypewriterStore.save(notes, off, this._links);
    }
  },

  /** 把画布现状写回「指定档位那份文档」（切档前调用）。
   *  与 _saveNow 的区别：这里显式指定档位 —— 切档时 this._mode 还没变，
   *  但为了不依赖调用顺序、且读的是「离开前」的 DOM，故由调用方点名档位。 */
  async _persistDoc(mode) {
    if (!this._canvas) return;
    const notes = this._collectNotes();
    if (!notes) return;   // 画布未布局：跳过，绝不写入失真数据
    const off = this._canvasOffset || { x: 0, y: 0 };
    if (mode === 'write') await TypewriterStore.saveWriting(notes, off, this._links);
    else await TypewriterStore.save(notes, off, this._links);
  },

  /** 把「指定档位那份文档」载入画布：清空当前卡片后重建。
   *  与 _restore 的区别：这是切档热换 —— 不重置 _restored，也不做比例坐标迁移
   *  （写作档生而为 v2，没有 v1 历史包袱）。 */
  async _loadDoc(mode) {
    const canvas = this._canvas;
    if (!canvas) return;
    const data = (mode === 'write')
      ? await TypewriterStore.loadWriting()
      : await TypewriterStore.load();
    // 先停掉进行中的打字计时器：否则它们会继续往已被移除的卡片里写字
    this._timers.forEach((t) => { try { clearInterval(t); } catch (_) { /* 忽略 */ } });
    this._timers = [];
    Array.from(canvas.querySelectorAll('.tw-card')).forEach((c) => c.remove());
    this._clearSelection();
    // 信任边界：读档数据经 WritingDoc.normalize 净化；从此 this._notes 为规范模型
    const doc = WritingDoc.normalize(data.notes || [], data.links || [], data.canvasOffset || { x: 0, y: 0 });
    this._notes = doc.notes;
    this._seedSpatial(); // 【P8 空间索引】加载后重建索引
    this._links = doc.links;
    this._canvasOffset = doc.canvasOffset;
    this._applyCanvasTransform();
    const cr = canvas.getBoundingClientRect();
    this._buildCards(this._notes, false, cr.width || 1, cr.height || 1);
    this._renderLinks();          // 卡片就位后再画连线（端点依赖布局尺寸）
    this._ensureNotesVisible();   // 卡片若在视野外自动归位，避免出现「空画布」的错觉
  },

  // ===== 撤销 / 重做（快照式，见 services/undoStack.js） =====

  /** 建立撤销栈：capture / restore 直接复用现有的 _collectNotes / _buildCards，
   *  不引入第二套数据表示，避免两边悄悄不同步。 */
  _initUndo() {
    this._undoStack = new UndoStack({
      capture: () => this._snapshot(),
      restore: (s) => this._restoreSnapshot(s),
      onChange: () => this._scheduleSave(),
    });
  },

  /** 采集当前状态：便签 + 连线 + 画布偏移（画布尚未布局时返回 null，本次不入栈） */
  _snapshot() {
    const notes = this._collectNotes();
    if (!notes) return null;
    return {
      notes,
      links: this._links.map((l) => Object.assign({}, l)),
      offset: Object.assign({}, this._canvasOffset || { x: 0, y: 0 }),
    };
  },

  /** 用快照整体重建画布：先清场（含打字计时器），再按数据重建 */
  _restoreSnapshot(s) {
    if (!s || !this._canvas) return;
    // 必须先停掉进行中的打字计时器：否则它们会继续往已被移除的卡片里写字
    this._timers.forEach((t) => { try { clearInterval(t); } catch (_) { /* 忽略 */ } });
    this._timers = [];
    Array.from(this._canvas.querySelectorAll('.tw-card')).forEach((c) => c.remove());
    this._clearSelection();
    this._links = (s.links || []).map((l) => Object.assign({}, l));
    this._canvasOffset = Object.assign({}, s.offset || { x: 0, y: 0 });
    this._applyCanvasTransform();
    const cr = this._canvas.getBoundingClientRect();
    this._buildCards(s.notes || [], false, cr.width || 1, cr.height || 1);
    this._notes = (s.notes || []).slice();   // 撤销恢复后回填规范模型，使保存/计数与 DOM 一致
    this._seedSpatial(); // 【P8 空间索引】撤销恢复后重建索引
    this._scheduleRenderLinks();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
  },

  /**
   * 执行撤销 / 重做。
   * @param {'undo'|'redo'} kind
   */
  _undoRedo(kind) {
    const stack = this._undoStack;
    if (!stack) return;
    const ok = (kind === 'redo') ? stack.redo() : stack.undo();
    if (!ok) {
      this._showScreenMsg(kind === 'redo' ? '没有可重做的操作' : '没有可撤销的操作', 1400);
      return;
    }
    this._showScreenMsg(kind === 'redo' ? '已重做' : '已撤销', 900);
  },

  /** 超出上限删最早（canvas 子节点顺序即时间序） */
  _enforceCap() {
    // 写作档不设上限：画布是一篇文档，把硬上限套在文档上会在写到第 (NOTE_CAP+1) 张时
    // 静默删掉开头（数据损失）；而「单卡 ≤500 字 + 独立文档 key」下 1000 张也才 ~300KB，
    // 无 vault 膨胀风险。上限原本承担的「防无限堆积」职责，改由「导出后清空 / 归档」这类
    // 主动、可撤销的出口承担（见导出成功后的处理）。
    // 便签档保留 NOTE_CAP 上限：随手记越积越多，删最早 + Toast + 可撤销是自洽的。
    if (this._mode === 'write') return;
    const canvas = this._canvas;
    if (!canvas) return;
    const cards = Array.from(canvas.querySelectorAll('.tw-card'));
    if (cards.length <= NOTE_CAP) return;
    const overflow = cards.slice(0, cards.length - NOTE_CAP);
    // 自动归档属于「用户没让它删」的删除，同样要留档可撤销
    if (this._undoStack) this._undoStack.push();
    overflow.forEach((c) => this._removeCard(c));
    this._scheduleSave();
    if (typeof Toast !== 'undefined') {
      Toast.showToast(`已达 ${NOTE_CAP} 张上限，自动归档最早的 ${overflow.length} 张`, 'info');
    } else {
      this._showScreenMsg(`已达上限，归档最早 ${overflow.length} 张`, 2200);
    }
  },

  _now() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },
};

window.TypewriterFeature = TypewriterFeature;
