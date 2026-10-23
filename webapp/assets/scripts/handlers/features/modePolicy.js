/**
 * modePolicy.js — 打字机三档的「差异真源」（P2 · 策略化）
 *
 * 背景：便签 / MD可视化写作 / 思维子弹共用同一张画布、同一台机身（C2 已确认的取舍：
 * 共享画布机制），真正的差异只在「语义」——抬头文案、输入框上限、元信息条、
 * 机身键（纸样 / 字体 / 排版 / 打印）的含义、文档种类、装饰物归属。
 *
 * 此前这些差异以 if (_mode === 'x') 散落在 ModeController / typewriterFeature /
 * CardInteractions 等处约 40 处：加一档要改 N 个文件，漏一处就串味
 * （贴纸漏进写作档就是这条缝的典型产物）。
 *
 * 约定：本文件**只描述差异，不承载行为** —— 行为仍在各 feature 里。
 * 新增档位 = 在此加一条 + 实现对应行为，不再去各处补 if。
 *
 * 收敛判据（A 类）：只收「同一条规则被复制多份」的分支 —— 导图守卫 ×3、
 * 连线定序 ×3、机身键分派 ×3。单点出现且与机制缠绕的落卡定位 / 打字呈现 / 重排
 * 属 B 类，等真要加第四档时再抽，避免无真实需求校准的过度抽象。
 */
import { ICON_LAYERS, ICON_FONT, ICON_EXPORT, ICON_GRID, ICON_PREVIEW, ICON_LINK_ROUTE } from './twConfig.js';
import { MAX_LEN, DRAFT_MAX_LEN, WRITE_NO_CULL_MAX } from './twConfig.js';

/** 旋钮拨齿顺序 */
export const MODE_ORDER = ['notes', 'write', 'mindmap'];

export const MODE_POLICY = {
  notes: {
    id: 'notes',
    docKind: 'notes',                    // 文档种类（TypewriterStore 的分组键）
    screen: { title: '凝墨成笺', ph: '输入文字打印便签...' },
    input: { maxLen: MAX_LEN },          // 单卡上限：写不下即截
    meta: '#twMetaNotes',                // 元信息条：FONT · PAPER
    ownsStickers: true,                  // 贴纸 / 素材市场属于便签档（P1 装饰层归属）
    usesCardInteractions: true,          // 卡片画布手势（平移 / 滚轮 / 空格抓手 / 框选）接管
    linksDefineOrder: false,             // 连线是否参与「文章顺序」推导
    manualCardSize: true,                 // 卡片尺寸可手动调（拖角缩放手柄）
    culling: { noCullMax: 0 },            // 0 = 不豁免：一律按视口剔除
    knobTitle: '拨动齿轮：便签画布 / MD可视化写作 / 思维子弹',
    msg: '已回到便签画布', msgMs: 1900,
    buttons: {
      paper: { title: '切换便签样式', aria: '切换便签样式', icon: ICON_LAYERS, action: '_cyclePaper' },
      font: { title: '切换字体', aria: '切换字体', icon: ICON_FONT, action: '_cycleFont' },
      // 一键排版：便签排成整齐网格（选中≥2张时只排选中组）
      arrange: { title: '一键排版：便签排成整齐网格（选中≥2张时只排选中组）', aria: '一键排版', icon: ICON_GRID, action: '_arrangeNotes' },
      print: { title: '打印' },
    },
  },
  write: {
    id: 'write',
    docKind: 'write',
    // 抬头「列锦成文」：列锦是古典修辞格——意象并置、如锦缎铺陈，正合本模式
    // 「一张张卡片平铺陈列」的可视化特质（而非线性的珠串）；成文 = 落成一篇 Markdown。
    // 与便签「凝墨成笺」、子弹「枝连成图」同为「X → 成 Y」的四字结构，同一套诗意命名。
    screen: { title: '列锦成文', ph: '输入文字打印卡片...' },
    input: { maxLen: DRAFT_MAX_LEN },    // 草稿箱上限：整篇长文可粘进来，打印时再拆卡
    meta: '#twMetaWrite',                // 卡片 · 连线
    ownsStickers: false,
    usesCardInteractions: true,
    linksDefineOrder: true,              // 连线是文章顺序的输入之一
    manualCardSize: false,                // 写作档卡片尺寸由内容决定，不给拖角缩放手柄
    culling: { noCullMax: WRITE_NO_CULL_MAX },  // 小文档常驻挂载，避免剔除反复重建 → 闪烁
    knobTitle: 'MD可视化写作：给每张卡定级别，最后连成一篇 Markdown',
    msg: 'MD可视化写作：用卡片上的级别钮定 H1–H6 / 正文 / 引用', msgMs: 1900,
    buttons: {
      paper: { title: '整篇预览：按连线顺序查看合成后的 Markdown（只读，不落盘）', aria: '整篇预览', icon: ICON_PREVIEW, action: '_openPreviewModal' },
      font: { title: '把卡片连成整篇 Markdown 并新建笔记', aria: '生成 Markdown 笔记', icon: ICON_EXPORT, action: '_saveSnapshot' },
      arrange: { title: '排版轮换：顺流竖排 ⇄ 分幕（按同级标题切块并网格排布；点击切换，选中≥2张时只排选中组）', aria: '排版轮换（顺流竖排 / 分幕）', icon: ICON_GRID, action: '_cycleWriteLayout' },
      print: { title: '打印' },
    },
  },
  mindmap: {
    id: 'mindmap',
    docKind: 'mindmap',
    screen: { title: '枝连成图', ph: '输入文字新建节点...' },
    input: { maxLen: MAX_LEN },
    meta: '#twMetaMindmap',              // 子弹 · 连线
    ownsStickers: false,
    // 导图有自己的文档、历史与手势：卡片画布的交互（双击归位 / 撤销 / 排版 / 手势）一律让位
    usesCardInteractions: false,
    linksDefineOrder: false,
    manualCardSize: false,
    culling: { noCullMax: 0 },
    knobTitle: '思维子弹：打字后回车新建节点',
    msg: '思维子弹模式：打字后回车新建节点', msgMs: 1800,
    buttons: {
      paper: { title: '切换子弹样式', aria: '切换子弹样式', icon: ICON_LAYERS, action: '_cycleBulletStyle' },
      font: { title: '导出为 Markdown 笔记（落库到 Vault）', aria: '导出为 Markdown', icon: ICON_EXPORT, action: '_exportMindmap' },
      // 第三个键：一键切换连线形态（曲线 ⇄ 直线）。
      // 取代原「一键自动布局」—— 布局只吃 links，自由导图没层次时必然退化，价值有限；
      // 形态切换不依赖结构，任何时候都有确定、可见、可撤销的变化。
      arrange: { title: '一键切换连线形态：曲线 ⇄ 直线（有选区时只切换选区内的连线）', aria: '切换连线形态（曲线 / 直线）', icon: ICON_LINK_ROUTE, action: '_cycleLinkRoute' },
      print: { title: '新建节点' },
    },
  },
};

/** 元信息条全集：当前档位只显示自己那条，其余隐藏（替代原先的三条 hidden 表达式） */
export const META_IDS = ['#twMetaNotes', '#twMetaWrite', '#twMetaMindmap'];

export const ModePolicy = {
  /** 取档位策略（未知档位回退便签，与原先 `|| { title: 凝墨成笺... }` 的兜底语义一致） */
  of(mode) { return MODE_POLICY[mode] || MODE_POLICY.notes; },
  /** 文档种类：未知档位返回 null（原先 getDocKind 的兜底） */
  docKind(mode) { const p = MODE_POLICY[mode]; return p ? p.docKind : null; },
  isMode(mode) { return Object.prototype.hasOwnProperty.call(MODE_POLICY, mode); },
  /** 旋钮拨齿：按 MODE_ORDER 循环 */
  next(mode, dir) {
    const i = Math.max(0, MODE_ORDER.indexOf(mode));
    const step = dir >= 0 ? 1 : -1;
    return MODE_ORDER[(i + step + MODE_ORDER.length) % MODE_ORDER.length];
  },
  /** 装饰物（贴纸）归属：只有便签档拥有 */
  ownsStickers(mode) { return ModePolicy.of(mode).ownsStickers === true; },
  /** 卡片画布交互是否接管：导图自带文档/历史/手势，卡片侧一律让位（原「_mode !== 'mindmap'」×3） */
  usesCardInteractions(mode) { return ModePolicy.of(mode).usesCardInteractions === true; },
  /** 连线是否参与「文章顺序」推导：目前只有写作档（原「_mode === 'write'」×3） */
  linksDefineOrder(mode) { return ModePolicy.of(mode).linksDefineOrder === true; },
  /** 卡片是否提供手动尺寸调节（拖角缩放手柄）：写作档尺寸由内容决定（原「_mode === \'write\'」） */
  manualCardSize(mode) { return ModePolicy.of(mode).manualCardSize === true; },
  /**
   * 视口剔除豁免：卡数不超过 noCullMax 时常驻挂载、不剔除。
   * 仅写作档开启 —— 文章是线性文档、规模有限，而剔除会随「新建卡自动归位」/画布平移
   * 不断销毁重建卡片 DOM，是可视化写作闪烁的根因（原「_mode === \'write\' && <= WRITE_NO_CULL_MAX」）。
   */
  skipCull(mode, noteCount) {
    const c = ModePolicy.of(mode).culling;
    return !!(c && c.noCullMax > 0 && (Number(noteCount) || 0) <= c.noCullMax);
  },
};

// 测试 harness（loadModule 剥离 import）兼容：挂到 globalThis。
if (typeof globalThis !== 'undefined') {
  globalThis.ModePolicy = ModePolicy;
  globalThis.MODE_POLICY = MODE_POLICY;
  globalThis.MODE_ORDER = MODE_ORDER;
  globalThis.META_IDS = META_IDS;
}
