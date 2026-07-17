import { Plugin, WorkspaceLeaf, Notice, TFile, MarkdownView } from 'obsidian';
import { DailyReviewView, VIEW_TYPE_DAILY_REVIEW } from './src/views/DailyReviewView';
import { AppHost } from './src/host/AppHost';
import { WebappController } from './src/host/WebappController';
import { ThemeBridge } from './src/bridge/ThemeBridge';
import {
  PluginSettings,
  DEFAULT_SETTINGS,
  type BambooReviewSettings,
} from './src/settings/PluginSettings';
import { VaultStorage } from './src/storage/VaultStorage';
import { planFromNote, type PlannerSettings } from './src/ai/MarkdownPlanner';
import { validateGoals } from './src/ai/GoalCardValidator';
// 注意：goalId / idempotency 看似小模块，但被本文件真正使用（非孤儿）：
//  - deriveStableGoalId：规划时由「笔记路径+标题」派生稳定 goalId，重规划原地更新而非追加重复；
//  - shouldSkipPlanned：笔记内容未变时跳过重复规划写入（幂等）。
// 删除前务必确认这两条调用（见 planFromSelection / ai-plan 流程）已迁移，否则会破坏线上功能。
import { deriveStableGoalId } from './src/ai/goalId';
import { shouldSkipPlanned } from './src/ai/idempotency';
import { DiagnosisModal } from './src/ai/DiagnosisModal';
import type { AgenticPlanOptions } from './src/ai/AgenticPlanController';
import { PlanEditorView, VIEW_TYPE_PLAN_EDITOR } from './src/views/PlanEditorView';
import { SuggestionApplyModal } from './src/ai/SuggestionApplyModal';
import { diagnose } from './src/ai/GoalDiagnoser';
import { runDiagnosis } from './src/ai/runDiagnosis';
import { DiagnosisProgressModal } from './src/ai/DiagnosisProgressModal';
import type { GoalItem } from './src/types/data';

/** 内容指纹（djb2），用于 AI 规划幂等判重 */
function hashContent(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/**
 * BambooReviewPlugin - 竹林修仙传 Obsidian 插件入口
 *
 * 职责：
 * 1. 注册 View 类型
 * 2. 注册命令（打开复盘、前/后一天、统计面板）
 * 3. 注册设置面板
 * 4. 管理插件生命周期
 */
export default class BambooReviewPlugin extends Plugin {
  settings: BambooReviewSettings = DEFAULT_SETTINGS;
  private webapp!: WebappController;

  async onload(): Promise<void> {
    // 加载设置
    await this.loadSettings();

    const pluginDir = this.manifest.dir || '';
    const version = this.manifest.version || '';

    // 后台预拉取 webapp：插件加载即触发，打开视图前大概率已就绪，消除「打开空白」体感。
    // 失败不阻塞 onload，打开视图时 buildBlobUrl 会再次尝试。
    void AppHost.prefetch(this.app, pluginDir, version);

    // 注册 View（传递 pluginDir 供 ItemView 加载 webapp 静态资源）
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf: WorkspaceLeaf) => {
      return new DailyReviewView(leaf, pluginDir, this, this.settings, () => this.saveSettings());
    });

    // 注册「AI 规划台」中央窗口视图（对话式规划审阅台，占满编辑器区域）
    // 注意：pendingPlanOpts 是打开时临时塞入的实例字段，重启恢复时必为 undefined，
    // 工厂用可选参数接收，由 PlanEditorView.render() 兜底渲染「遗留占位页」。
    this.registerView(VIEW_TYPE_PLAN_EDITOR, (leaf: WorkspaceLeaf) => {
      return new PlanEditorView(leaf, this.pendingPlanOpts);
    });

    // 宿主 → webapp 直连接口（Phase3 门面，内部仍走 sendCommand 线协议）
    this.webapp = new WebappController(() => {
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
      if (leaves.length === 0) return null;
      return leaves[0].view as DailyReviewView;
    });

    // 注册命令
    this.addCommand({
      id: 'open-daily-review',
      name: '打开今日复盘',
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: 'navigate-prev-day',
      name: '前一天',
      callback: () => this.webapp.navPrevDay(),
    });

    this.addCommand({
      id: 'navigate-next-day',
      name: '后一天',
      callback: () => this.webapp.navNextDay(),
    });

    this.addCommand({
      id: 'navigate-today',
      name: '回到今天',
      callback: () => this.webapp.navToday(),
    });

    this.addCommand({
      id: 'open-stats',
      name: '打开统计分析',
      callback: () => this.webapp.openStats(),
    });

    this.addCommand({
      id: 'open-settings-in-app',
      name: '打开应用设置',
      callback: () => this.webapp.openSettings(),
    });

    this.addCommand({
      id: 'ai-plan-from-note',
      name: 'AI 规划：将当前笔记转为目标卡片',
      callback: () => void this.aiPlanFromNote(),
    });

    this.addCommand({
      id: 'ai-plan-from-selection',
      name: 'AI 规划：将选中文本转为目标卡片',
      callback: () => void this.aiPlanFromSelection(),
    });

    this.addCommand({
      id: 'ai-rebuild-goals',
      name: 'AI 规划：批量重建已规划笔记的目标',
      callback: () => void this.rebuildAiGoals(),
    });

    this.addCommand({
      id: 'ai-diagnose',
      name: 'AI 诊断：分析目标执行情况并给出可落地纠偏建议',
      callback: () => void this.aiDiagnose(),
    });

    this.addCommand({
      id: 'open-plan-editor-goals',
      name: 'AI 规划：打开规划台编辑当前目标库',
      callback: () => void this.openPlanEditorForGoals(),
    });

    // 编辑器右键菜单：选中文本后右键直接出现「转为目标卡片」
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor) => {
        const text = editor.getSelection().trim();
        if (!text) return; // 无选区时不显示，保持菜单干净
        menu.addItem((item) =>
          item
            .setTitle('AI 规划：将选中文本转为目标卡片')
            .setIcon('leaf')
            .onClick(() => {
              void this.aiPlanFromSelection(text);
            })
        );
      })
    );

    // 注册设置面板
    this.addSettingTab(new PluginSettings(this.app, this));

    // 添加左侧 Ribbon 图标
    this.addRibbonIcon('leaf', '竹林修仙传', () => {
      void this.activateView();
    });
  }

  onunload(): void {
    ThemeBridge.restoreDefaults();
  }

  /** AI 规划主流程：取当前笔记 → 调大模型 → 校验 → 审阅弹窗 → 写入目标库 */
  async aiPlanFromNote(): Promise<void> {
    const s = this.settings;
    if (!s.aiEnabled) {
      new Notice('AI 规划未启用：请先在插件设置中开启并填写 API Key');
      return;
    }

    const file = this.app.workspace.getActiveFile();
    if (!file || !(file instanceof TFile) || file.extension !== 'md') {
      new Notice('AI 规划：请先打开一篇 Markdown 笔记');
      return;
    }

    let content = '';
    try {
      content = await this.app.vault.read(file);
    } catch (e) {
      new Notice(`读取笔记失败：${e instanceof Error ? e.message : '未知错误'}`);
      return;
    }
    if (!content.trim()) {
      new Notice('AI 规划：笔记内容为空');
      return;
    }

    const plannerSettings: PlannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth,
    };

    void this.openPlanEditor({
      content,
      scope: 'note',
      settings: plannerSettings,
      onConfirm: (finalGoals) => void this.writeAiGoals(file, content, finalGoals),
    });
  }

  /** 选中文本转目标卡片：取编辑器选区 → 调大模型(标注 selection) → 校验 → 审阅弹窗 → 写入目标库 */
  async aiPlanFromSelection(selectionArg?: string): Promise<void> {
    const s = this.settings;
    if (!s.aiEnabled) {
      new Notice('AI 规划未启用：请先在插件设置中开启并填写 API Key');
      return;
    }

    const file = this.app.workspace.getActiveFile();
    if (!file || !(file instanceof TFile) || file.extension !== 'md') {
      new Notice('AI 规划：请先打开一篇 Markdown 笔记');
      return;
    }

    // 优先用右键菜单传入的精确选区；命令面板调用时不传，则回退到活动编辑器选区
    const selection =
      (selectionArg && selectionArg.trim()) ||
      this.app.workspace.getActiveViewOfType(MarkdownView)?.editor.getSelection()?.trim() ||
      '';
    if (!selection) {
      new Notice('请先选中一段文本，再执行「将选中文本转为目标卡片」');
      return;
    }

    const plannerSettings: PlannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth,
    };

    void this.openPlanEditor({
      content: selection,
      scope: 'selection',
      settings: plannerSettings,
      subtitle: '以下目标基于你在笔记中选中的文本拆解（非整篇笔记）。',
      onConfirm: (finalGoals) => void this.writeAiGoals(file, selection, finalGoals),
    });
  }

  /** 把审阅后的目标追加写入目标库（零污染：existing + parsed）并更新幂等索引 */
  /**
   * 把审阅后的目标追加写入目标库（零污染：existing + parsed）并更新幂等索引。
   * @param silent 批量重建时抑制逐条通知，由调用方统一汇总（默认 false）
   */
  async writeAiGoals(
    file: TFile,
    content: string,
    goals: GoalItem[],
    silent = false
  ): Promise<void> {
    // 统一写入 webapp 实际读取的默认路径（bamboo-review），确保 AI 写入的目标与界面读取一致。
    const storage = new VaultStorage(this.app);
    const existing = await storage.getGoals();

    // 幂等：同一笔记 + 相同内容已规划过，且目标仍全部存在 → 跳过（批量重建模式强制重写）。
    // 关键修复：若目标已被清空/丢失（plans-map 残留旧哈希），则必须允许重新写入以恢复，
    // 否则“已规划过”会永久阻塞恢复，表现为“写入了但不显示/丢失”。
    const index = await storage.getPlansIndex();
    const key = `${file.path}#${hashContent(content)}`;
    const plannedIds = index[key];
    if (!silent && shouldSkipPlanned(plannedIds, new Set(existing.map((g) => g.id)))) {
      new Notice('该笔记已规划过（内容未变），已跳过重复写入');
      return;
    }
    // 部分/全部目标已丢失 → 继续向下重新写入以恢复

    // 旧版随机 id 兼容：同 sourceRef+title 复用旧 id，原地更新不新增重复
    const byRefTitle = new Map<string, string>();
    for (const g of existing) {
      if (g.sourceRef && g.title) byRefTitle.set(`${g.sourceRef}#${g.title}`, g.id);
    }

    const merged = new Map<string, GoalItem>();
    for (const g of existing) if (g.id) merged.set(g.id, g);

    // 最终防线：AI 写入的目标禁止包含 icon 字段（即使审阅弹窗误填入也剥离）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const withRef = goals.map((g) => {
      const { icon: _icon, ...rest } = g as GoalItem & { icon?: unknown };
      void _icon;
      const ref: GoalItem = { ...rest, sourceRef: file.path };
      // 确定性 ID：同笔记+同标题恒得同一 id → 重新规划原地更新而非追加重复；
      // 若该标题的旧随机 id 仍存在于库，则复用它（兼容历史目标）。
      const legacyId = byRefTitle.get(`${file.path}#${g.title}`);
      ref.id = legacyId ?? deriveStableGoalId(`${file.path}|${g.title}`);
      return ref;
    });
    for (const g of withRef) if (g.id) merged.set(g.id, g);
    const finalGoals = [...merged.values()];
    await storage.putGoals(finalGoals);

    // 失效索引清理（F）：剔除“其全部 id 均已不在最终目标库”的陈旧 entry，避免索引无限增长。
    const finalIds = new Set(finalGoals.map((g) => g.id));
    for (const k of Object.keys(index)) {
      const ids = index[k];
      if (ids && ids.length > 0 && ids.every((id) => !finalIds.has(id))) {
        delete index[k];
      }
    }
    index[key] = withRef.map((g) => g.id);
    await storage.putPlansIndex(index);

    // 局部刷新常驻视图（host→webapp goals:changed）
    this.webapp.notifyGoalsChanged();

    if (!silent) {
      new Notice(`已写入 ${withRef.length} 个目标到「竹林修仙传」`);
    }
  }

  /**
   * 批量重建 AI 目标：扫描 plans-map 中「已规划过」的笔记，逐篇重新规划，
   * 以找回那些目标已丢失/被清的历史遗留。笔记已删除则跳过（其 stale entry 由索引清理处理）。
   */
  async rebuildAiGoals(): Promise<void> {
    const storage = new VaultStorage(this.app);
    const index = await storage.getPlansIndex();
    const paths = new Set<string>();
    for (const k of Object.keys(index)) {
      const hashIdx = k.lastIndexOf('#');
      if (hashIdx > 0) paths.add(k.slice(0, hashIdx));
    }
    if (paths.size === 0) {
      new Notice('未发现任何已规划的笔记');
      return;
    }

    const s = this.settings;
    if (!s.aiEnabled) {
      new Notice('AI 规划未启用：请先在插件设置中开启并填写 API Key');
      return;
    }
    const plannerSettings: PlannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth,
    };

    const loading = new Notice(`正在重建 ${paths.size} 篇笔记的 AI 目标…`, 0);
    let ok = 0;
    let failed = 0;
    for (const p of paths) {
      const file = this.app.vault.getAbstractFileByPath(p);
      if (!(file instanceof TFile)) continue; // 笔记已删除 → 跳过
      let content: string;
      try {
        content = await this.app.vault.read(file);
      } catch {
        continue;
      }
      if (!content.trim()) continue;
      try {
        const raw = await planFromNote(content, plannerSettings);
        const parsed = validateGoals(raw);
        if (parsed.length > 0) {
          await this.writeAiGoals(file, content, parsed, true);
          ok++;
        }
      } catch {
        failed++;
      }
    }
    loading.hide();
    new Notice(`已重建 ${ok} 篇笔记的 AI 目标${failed > 0 ? `，${failed} 篇失败` : ''}`);
  }

  /**
   * AI 诊断 → 行动闭环：读目标 + 近 14 天数据 → AI 诊断（GoalDiagnoser）→
   * 只读报告（DiagnosisModal）→ 点「应用」→ 打开 AgenticPlanModal 预填建议指令 →
   * 确认后写回目标库。编排逻辑在 runDiagnosis（纯函数），此处只注入真实依赖。
   */
  async aiDiagnose(): Promise<void> {
    const s = this.settings;
    const plannerSettings: PlannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth,
    };
    const storage = new VaultStorage(this.app);
    const progress = new DiagnosisProgressModal(this.app);
    progress.open();
    await runDiagnosis({
      aiEnabled: s.aiEnabled,
      plannerSettings,
      storage,
      diagnose: diagnose as unknown as typeof diagnose,
      onPhase: (p, l) => progress.setPhase(p, l),
      openDiagnosis: (o) => {
        progress.close();
        new DiagnosisModal(this.app, o).open();
      },
      openApplyPreview: (o) => new SuggestionApplyModal(this.app, o).open(),
      openAgentic: (o) => void this.openPlanEditor(o),
      writeGoals: (g) => void this.writeDiagnosedGoals(g),
      notice: (m) => new Notice(m),
      recentDays: 14,
    });
    progress.close(); // 安全兜底：报告异常未打开时也关闭
  }

  /** 诊断建议应用后的落库：写 goals.json + 刷新常驻视图（不碰幂等索引/ sourceRef） */
  private async writeDiagnosedGoals(goals: GoalItem[]): Promise<void> {
    const storage = new VaultStorage(this.app);
    await storage.putGoals(goals);
    this.webapp.notifyGoalsChanged();
    new Notice(`已写入 ${goals.length} 个目标（应用 AI 诊断建议）`);
  }

  /**
   * 战略复盘面板「用 AI 改进」入口：webapp 健康分详情点按钮 → postMessage(app:aiImproveGoal)
   * → AppAPI.onAiImproveGoal → 此处。复用诊断闭环的 AgenticPlanModal 预填 + 落库链路。
   */
  async requestAiImprove(p: { goalId: string; title?: string; hints?: string }): Promise<void> {
    const s = this.settings;
    if (!s.aiEnabled) {
      new Notice('先到设置里开启 AI 规划，才能用 AI 改进目标');
      return;
    }
    const storage = new VaultStorage(this.app);
    const goals = await storage.getGoals();
    if (goals.length === 0) {
      new Notice('你还没有目标，先跑一次 AI 规划');
      return;
    }
    const goal = goals.find((g) => g.id === p.goalId) ?? goals.find((g) => g.title === p.title);
    if (!goal) {
      new Notice('未在目标库中找到该目标，可能它已被删除');
      return;
    }

    const plannerSettings: PlannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth,
    };
    const hintsLine = p.hints
      ? p.hints
      : '（无具体提示，请结合该目标当前子项与进度自行诊断并改进）';
    const instruction =
      `请根据以下健康分诊断，优化目标「${goal.title}」：\n${hintsLine}\n` +
      '要求：保持量化铁律（纯数字 dailyMin、日颗粒度、可数代理指标），只做必要的增删改。';

    void this.openPlanEditor({
      content: '',
      scope: 'note',
      goals,
      initialInstruction: instruction,
      settings: plannerSettings,
      subtitle: `AI 改进 · ${goal.title}`,
      onConfirm: (g) => void this.writeDiagnosedGoals(g),
    });
  }

  /** 打开「AI 规划台」中央窗口（复用已有标签页，否则新建）并挂载给定 opts */
  private pendingPlanOpts?: AgenticPlanOptions;

  async openPlanEditor(opts: AgenticPlanOptions): Promise<void> {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_PLAN_EDITOR);
    if (leaves.length > 0) {
      const view = leaves[0].view as PlanEditorView;
      await view.reload(opts);
      await workspace.revealLeaf(leaves[0]);
      return;
    }
    const leaf = workspace.getLeaf(false);
    this.pendingPlanOpts = opts;
    await leaf.setViewState({ type: VIEW_TYPE_PLAN_EDITOR, active: true });
    // 消费后立即清理，避免遗留值被后续重启工厂误用（也无法跨重启保留）
    this.pendingPlanOpts = undefined;
    await workspace.revealLeaf(leaf);
  }

  /** 命令面板：直接打开规划台编辑当前目标库（不依赖笔记，随时可调用） */
  private async openPlanEditorForGoals(): Promise<void> {
    const s = this.settings;
    if (!s.aiEnabled) {
      new Notice('AI 规划未启用：请先在插件设置中开启并填写 API Key');
      return;
    }
    const storage = new VaultStorage(this.app);
    const goals = await storage.getGoals();
    if (goals.length === 0) {
      new Notice('你还没有目标，先跑一次 AI 规划');
      return;
    }
    const plannerSettings: PlannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth,
    };
    await this.openPlanEditor({
      content: '',
      scope: 'note',
      settings: plannerSettings,
      goals,
      subtitle: '正在编辑你当前的目标库，可直接改或用自然语言让我调整。',
      onConfirm: (finalGoals) => void this.writeDiagnosedGoals(finalGoals),
    });
  }

  /** 激活或创建复盘视图 */
  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);

    if (leaves.length > 0) {
      // 已有视图，直接聚焦
      leaf = leaves[0];
    } else {
      // 创建新视图
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_DAILY_REVIEW,
        active: true,
      });
    }

    if (leaf) {
      await workspace.revealLeaf(leaf);
    }
  }

  /** 加载设置 */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as BambooReviewSettings;
  }

  /** 保存设置 */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
