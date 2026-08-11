import { Plugin, WorkspaceLeaf, Notice, TFile, MarkdownView } from 'obsidian';
import { DailyReviewView, VIEW_TYPE_DAILY_REVIEW } from './src/views/DailyReviewView';
import { AppHost } from './src/host/AppHost';
import { WebappController } from './src/host/WebappController';
import { ThemeBridge } from './src/bridge/ThemeBridge';
import { LicenseStore } from './src/license/licenseStore';
import {
  PluginSettings,
  DEFAULT_SETTINGS,
  type BambooReviewSettings,
} from './src/settings/PluginSettings';
import { VaultStorage } from './src/storage/VaultStorage';
import { type PlannerSettings } from './src/ai/MarkdownPlanner';
// 注意：goalId / idempotency 看似小模块，但被本文件真正使用（非孤儿）：
//  - deriveStableGoalId：规划时由「笔记路径+标题」派生稳定 goalId，重规划原地更新而非追加重复；
//  - shouldSkipPlanned：笔记内容未变时跳过重复规划写入（幂等）。
// 删除前务必确认这两条调用（见 planFromSelection / ai-plan 流程）已迁移，否则会破坏线上功能。
import { deriveStableGoalId } from './src/ai/goalId';
import { shouldSkipPlanned } from './src/ai/idempotency';
import { DiagnosisModal } from './src/ai/DiagnosisModal';
import { briefToPlanningText, type ElicitSettings } from './src/ai/GoalElicitor';
import { GoalElicitorModal } from './src/ai/GoalElicitorModal';
import { frameworkLabel, type FrameworkType } from './src/ai/frameworks';
import type { PlanTarget } from './src/ai/MarkdownPlanner';
import type { GoalBrief } from './src/types/data';
import type { AgenticPlanOptions } from './src/ai/AgenticPlanController';
import { PlanEditorView, VIEW_TYPE_PLAN_EDITOR } from './src/views/PlanEditorView';
import { ArchiveView, VIEW_TYPE_ARCHIVE } from './src/views/ArchiveView';
import { SuggestionApplyModal } from './src/ai/SuggestionApplyModal';
import { diagnose } from './src/ai/GoalDiagnoser';
import { ConsultModal, type ConsultOptions } from './src/consult/ConsultModal';
import { isSmtpAvailable } from './src/consult/smtpSender';
import { runDiagnosis } from './src/ai/runDiagnosis';
import { DiagnosisProgressModal } from './src/ai/DiagnosisProgressModal';
import type { GoalItem } from './src/types/data';
import { buildCache } from './src/ai/DeviationCalculator';
import { buildStrategyOverview, type StrategyOverview } from './src/ai/strategyOverview';
import { toCultivationRealm, type CultivationRealm } from './src/cultivation';

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
  /** 激活门控单一数据源（全插件共享，未激活时 webapp 内显示激活遮罩） */
  license!: LicenseStore;
  /**
   * 插件卸载中标记（禁用/热更新）。onunload 先于核心 detach 视图执行，
   * 视图 onClose 据此判断本次关闭来自卸载而非用户操作，不清除 reviewViewOpen 标记。
   */
  pluginUnloading = false;
  /** 重载后的面板恢复只执行一次（onLayoutReady 可能多次触发） */
  private reviewViewRecovered = false;

  async onload(): Promise<void> {
    // 加载设置
    await this.loadSettings();

    // ───── 激活门控（License Gate）─────
    // 设计：插件始终正常注册（视图/命令/Ribbon 全在），门控落在 webapp 内部。
    // 未激活时，复盘视图加载 webapp 后显示全屏「激活」遮罩（含激活码输入），
    // 用户输入激活码 → 宿主侧校验 → 写盘 → 移除遮罩即时解锁。无需重启插件。
    this.license = new LicenseStore(this);

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

    // 注册「目标归档」独立页视图
    this.registerView(VIEW_TYPE_ARCHIVE, (leaf: WorkspaceLeaf) => {
      return new ArchiveView(leaf, pluginDir, this, this.settings, () => this.saveSettings());
    });

    // 宿主 → webapp 直连接口（Phase3 门面，内部仍走 sendCommand 线协议）
    this.webapp = new WebappController(() => {
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
      if (leaves.length === 0) return null;
      return leaves[0].view as DailyReviewView;
    });

    // 注册命令
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
      id: 'open-annual-report',
      name: '生成年度修为报告',
      callback: () => this.webapp.openAnnualReport(),
    });

    this.addCommand({
      id: 'open-archive',
      name: '打开目标归档',
      callback: () => void this.openArchive(),
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
      id: 'ai-elicit-from-note',
      name: 'AI 澄清：先把模糊目标 sharpen 成可规划简报（当前笔记）',
      callback: () => void this.elicitFromNote(),
    });

    this.addCommand({
      id: 'ai-elicit-from-selection',
      name: 'AI 澄清：先把模糊目标 sharpen 成可规划简报（选中文本）',
      callback: () => void this.elicitFromSelection(),
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

    this.addCommand({
      id: 'bamboo-consult',
      name: '竹林咨询：发送选中内容给羽鳞君',
      callback: () => void this.openConsult(),
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
        menu.addItem((item) =>
          item
            .setTitle('AI 澄清：先把模糊目标 sharpen 成简报')
            .setIcon('quote')
            .onClick(() => {
              void this.elicitFromSelection(text);
            })
        );
        menu.addItem((item) =>
          item
            .setTitle('竹林咨询：发送选中内容给羽鳞君')
            .setIcon('send')
            .onClick(() => {
              void this.openConsult(text);
            })
        );
      })
    );

    // 注册设置面板
    const settingsTab = new PluginSettings(this.app, this);
    this.addSettingTab(settingsTab);

    // 设置面板已通过上方 addSettingTab(settingsTab) 注册，并采用 1.13.0+ 声明式
    // getSettingDefinitions()（内部仍为命令式 SettingPage 子页渲染）。
    // 保留一个无害的手动兜底命令：极端情况下重新评估定义并重渲染。
    this.addCommand({
      id: 'render-bamboo-settings',
      name: '竹林修仙传：重新渲染设置面板',
      callback: () => {
        try {
          settingsTab.update();
          new Notice('已重新渲染「竹林修仙传」设置面板');
        } catch (e) {
          console.error('[竹林修仙传] 手动 update 抛错', e);
        }
      },
    });

    // 添加左侧 Ribbon 图标
    this.addRibbonIcon('leaf', '竹林修仙传', () => {
      void this.activateView();
    });

    // 插件更新/重载后面板恢复：
    // 禁用插件时 Obsidian 核心会自动 detach 本插件所有视图 leaf（个别场景也可能残留
    // 旧实例），重新启用时核心不会自动恢复 —— 此前用户只能重启 Obsidian 靠布局恢复找回。
    // 等布局就绪后统一处理（冷启动时布局恢复已带回面板，各分支会自动跳过）。
    this.app.workspace.onLayoutReady(() => {
      void this.recoverReviewViewAfterReload();
    });

    // 用户主动关闭面板的检测：onClose 不再清除 reviewViewOpen（避免热更新误清），
    // 改由布局变化判断。热更新时核心会瞬时 detach 再重建，故延迟一帧二次确认：
    // 若届时面板 leaf 仍未恢复且非插件卸载中，才清除标记。
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        if (this.pluginUnloading) return;
        window.requestAnimationFrame(() => {
          if (this.pluginUnloading) return;
          const stillOpen = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW).length > 0;
          if (!stillOpen && this.settings.reviewViewOpen) {
            this.settings.reviewViewOpen = false;
            void this.saveSettings();
          }
        });
      })
    );
  }

  onunload(): void {
    // 先于核心 detach 视图执行：标记本次为插件卸载（禁用/热更新），
    // 让 layout-change 检测跳过清除 reviewViewOpen，供重载后自动恢复面板。
    this.pluginUnloading = true;
    ThemeBridge.default.restoreDefaults();
  }

  /**
   * 热更新/重载后的复盘面板恢复。
   *
   * 判定：
   * - 布局中已有本类型 leaf 且视图由本次会话创建（instanceof 命中本 bundle 的类）
   *   → 冷启动布局恢复，健康，不动；
   * - 布局中已有 leaf 但视图是旧插件实例（持有 pluginDir 但 instanceof 不命中）
   *   → detach 旧叶并重建；
   * - 布局中无 leaf，但 reviewViewOpen 标记记录面板此前开着（典型：热更新被核心
   *   detach；onunload 先于核心 detach 执行，标记得以保留）→ 自动重建面板。
   */
  private async recoverReviewViewAfterReload(): Promise<void> {
    if (this.reviewViewRecovered) return;
    this.reviewViewRecovered = true;

    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
    if (leaves.length > 0) {
      const stale = leaves.filter((l) => {
        if (l.view instanceof DailyReviewView) return false;
        // 仅把「真正的旧版视图实例」视为残留；核心布局恢复产生的占位视图不动
        const v = l.view as unknown as Record<string, unknown> | null;
        return !!v && 'pluginDir' in v;
      });
      if (stale.length === 0) return;
      for (const leaf of stale) leaf.detach();
      await this.activateView();
      return;
    }

    if (this.settings.reviewViewOpen) {
      await this.activateView();
    }
  }

  /**
   * 竹林咨询：打开确认弹窗，将选中文字发送到羽鳞君邮箱。
   *
   * 同时服务三种调用场景：
   * 1. 命令面板调用（无参）：自动从当前 Markdown 编辑器取选区；
   * 2. 编辑器右键菜单（单字符串）：传入笔记中选中的文字；
   * 3. 外部插件联动（字符串 + opts.sourceLabel）：如竹杖芒鞋阅读器选中文章文字，
   *    此时不再要求当前处于 MarkdownView，直接使用外部传入的选区与来源标签。
   */
  async openConsult(
    selectionArg?: string,
    opts?: { sourceLabel?: string }
  ): Promise<void> {
    const s = this.settings;

    if (!isSmtpAvailable()) {
      new Notice('竹林咨询仅支持桌面端（移动端无法直连 SMTP）');
      return;
    }

    if (!s.smtpUser || !s.smtpPass) {
      new Notice('竹林咨询未配置：请先在插件设置中填写发件人邮箱和 SMTP 授权码');
      return;
    }

    const externalLabel = opts?.sourceLabel?.trim();
    let text: string;
    let sourceLabel: string;

    if (externalLabel || (selectionArg !== undefined && selectionArg !== '')) {
      // 外部插件联动 或 编辑器右键直接传入选区：跳过 MarkdownView 强校验
      text = (selectionArg ?? '').trim();
      sourceLabel = externalLabel || '笔记选中';
    } else {
      // 命令面板调用：兼容原生笔记场景，从当前 Markdown 编辑器取选区
      const editor = this.app.workspace.activeEditor?.editor;
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!editor || !view || !view.file) {
        new Notice('竹林咨询：请先打开一篇笔记并选中要咨询的文字');
        return;
      }
      text = editor.getSelection().trim();
      if (!text) {
        new Notice('竹林咨询：请先选中一段文字');
        return;
      }
      sourceLabel = `笔记《${view.file.basename}》`;
    }

    const options: ConsultOptions = {
      selectedText: text,
      sourceLabel,
      smtpConfig: {
        host: s.smtpHost || 'smtp.qq.com',
        port: s.smtpPort || 465,
        secure: s.smtpSecure,
        user: s.smtpUser,
        pass: s.smtpPass,
      },
    };

    new ConsultModal(this.app, options).open();
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

  /**
   * Layer 0 入口：先把模糊意图送进「目标澄清」弹窗（压力测试 + 苏格拉底追问），
   * 拿到一份通过/强制跳过的 GoalBrief 后，再把它编译成「已澄清文本」交给下游规划器拆解。
   * 这是规划的前门——避免把"成为行业第一"这类不靠谱目标直接喂给除法式拆解。
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- _scope 保留以对齐规划入口统一形参（当前未使用，维持签名一致）
  async runElicit(rawIntent: string, file: TFile, _scope: 'note' | 'selection'): Promise<void> {
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
    const elicitorSettings: ElicitSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
    };
    new GoalElicitorModal(this.app, {
      rawIntent,
      settings: elicitorSettings,
      onConfirm: (briefs: GoalBrief[], frameworks: FrameworkType[]) => {
        const targets: PlanTarget[] = briefs.map((b, i) => ({
          content: briefToPlanningText(b),
          framework: frameworks[i],
        }));
        const fwNote =
          targets.length > 1
            ? `（多目标 · 分别采用 ${targets
                .map((t) => frameworkLabel(t.framework ?? 'quantify'))
                .join(' / ')}）`
            : `（采用「${frameworkLabel(frameworks[0])}」）`;
        const primary = briefs[0];
        const planningText = targets.map((t) => t.content).join('\n\n');
        void this.openPlanEditor({
          targets,
          scope: 'note',
          settings: plannerSettings,
          subtitle:
            (primary.reliabilityStatus === 'forced'
              ? '目标未完全澄清（已强制提交），下面是规划拆解，请谨慎核对其量化口径。'
              : '目标已澄清（可靠性通过），下面是规划拆解。可继续调整。') + fwNote,
          onConfirm: (goals) => void this.writeAiGoals(file, planningText, goals),
        });
      },
    }).open();
  }

  /** 选中文本先澄清：取编辑器选区 → 澄清弹窗 → 简报 → 下游规划 */
  async elicitFromSelection(selectionArg?: string): Promise<void> {
    const s = this.settings;
    if (!s.aiEnabled) {
      new Notice('AI 规划未启用：请先在插件设置中开启并填写 API Key');
      return;
    }
    const file = this.app.workspace.getActiveFile();
    if (!file || !(file instanceof TFile) || file.extension !== 'md') {
      new Notice('AI 澄清：请先打开一篇 Markdown 笔记');
      return;
    }
    const selection =
      (selectionArg && selectionArg.trim()) ||
      this.app.workspace.getActiveViewOfType(MarkdownView)?.editor.getSelection()?.trim() ||
      '';
    if (!selection) {
      new Notice('请先选中一段文本，再执行「先把模糊目标 sharpen」');
      return;
    }
    void this.runElicit(selection, file, 'selection');
  }

  /** 整篇笔记先澄清：取当前笔记 → 澄清弹窗 → 简报 → 下游规划 */
  async elicitFromNote(): Promise<void> {
    const s = this.settings;
    if (!s.aiEnabled) {
      new Notice('AI 规划未启用：请先在插件设置中开启并填写 API Key');
      return;
    }
    const file = this.app.workspace.getActiveFile();
    if (!file || !(file instanceof TFile) || file.extension !== 'md') {
      new Notice('AI 澄清：请先打开一篇 Markdown 笔记');
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
      new Notice('AI 澄清：笔记内容为空');
      return;
    }
    void this.runElicit(content, file, 'note');
  }

  /**
   * 把审阅后的目标合并写入目标库的核心逻辑（零污染：existing + parsed）并更新幂等索引。
   * sourceRef 标识来源（笔记路径或外部来源标识），用于 sourceRef 标注与幂等判重；
   * 抽成独立方法以便「笔记入口」(writeAiGoals) 与「外部联动入口」(planExternalText) 共用。
   */
  private async mergeAndWriteGoals(
    sourceRef: string,
    content: string,
    goals: GoalItem[]
  ): Promise<void> {
    // 统一写入 webapp 实际读取的默认路径（bamboo-review），确保 AI 写入的目标与界面读取一致。
    const storage = new VaultStorage(this.app);
    const existing = await storage.getGoals();

    // 幂等：同一来源 + 相同内容已规划过，且目标仍全部存在 → 跳过；
    // 若目标已被清空/丢失（plans-map 残留旧哈希），则继续向下重新写入以恢复。
    const index = await storage.getPlansIndex();
    const key = `${sourceRef}#${hashContent(content)}`;
    const plannedIds = index[key];
    if (shouldSkipPlanned(plannedIds, new Set(existing.map((g) => g.id)))) {
      new Notice('该内容已规划过（内容未变），已跳过重复写入');
      return;
    }
    // 部分/全部目标已丢失 → 继续向下重新写入以恢复

    // 旧版随机 id 兼容：同 sourceRef+title 复用旧 id，原地更新不新增重复
    const byRefTitle = new Map<string, string>();
    for (const g of existing) {
      if (g.sourceRef && g.title) byRefTitle.set(`${g.sourceRef}#${g.title}`, g.id);
    }

    // 跳过同来源且标题已不在本次规划新标题集中的旧目标：视为被重命名，
    // 由新目标以新派生 id 上位，避免「旧标题残留 + 新标题」形成双条
    const newTitles = new Set(goals.map((g) => g.title));
    const merged = new Map<string, GoalItem>();
    for (const g of existing) {
      if (g.sourceRef === sourceRef && g.title && !newTitles.has(g.title)) continue;
      if (g.id) merged.set(g.id, g);
    }

    // 最终防线：AI 写入的目标禁止包含 icon 字段（即使审阅弹窗误填入也剥离）
    const withRef = goals.map((g) => {
      const { icon: _icon, ...rest } = g as GoalItem & { icon?: unknown };
      void _icon;
      const ref: GoalItem = { ...rest, sourceRef };
      // 确定性 ID：同来源+同标题恒得同一 id → 重新规划原地更新而非追加重复；
      // 若该标题的旧随机 id 仍存在于库，则复用它（兼容历史目标）。
      const legacyId = byRefTitle.get(`${sourceRef}#${g.title}`);
      ref.id = legacyId ?? deriveStableGoalId(`${sourceRef}|${g.title}`);
      return ref;
    });
    for (const g of withRef) if (g.id) merged.set(g.id, g);
    const finalGoals = [...merged.values()];
    await storage.putGoals(finalGoals);

    // 失效索引清理：剔除“其全部 id 均已不在最终目标库”的陈旧 entry，避免索引无限增长。
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

    new Notice(`已写入 ${withRef.length} 个目标到「竹林修仙传」`);
  }

  /** 把审阅后的目标追加写入目标库（零污染：existing + parsed）并更新幂等索引 */
  async writeAiGoals(
    file: TFile,
    content: string,
    goals: GoalItem[]
  ): Promise<void> {
    // 笔记来源：以文件 vault 路径作为 sourceRef，复用核心合并逻辑。
    await this.mergeAndWriteGoals(file.path, content, goals);
  }

  /**
   * 外部联动入口（供「竹杖芒鞋」等插件调用）：把一段外部文本（如阅读中选中的金句）
   * 经大模型拆解为修行目标卡片，无需当前打开 Markdown 笔记。
   * 这是「金句 → 修行目标」跨插件联动的稳定契约方法。
   *
   * @param text 待拆解的原文（金句/段落）
   * @param opts.sourceLabel 来源展示名（如「竹杖芒鞋·金句」），仅用于规划台副标题
   * @param opts.sourceRef 来源标识（默认由 sourceLabel 推导），写入目标 sourceRef 用于溯源与幂等
   */
  async planExternalText(
    text: string,
    opts?: { sourceLabel?: string; sourceRef?: string }
  ): Promise<void> {
    const s = this.settings;
    if (!s.aiEnabled) {
      new Notice('AI 规划未启用：请先在插件设置中开启并填写 API Key');
      return;
    }
    const trimmed = (text ?? '').trim();
    if (!trimmed) {
      new Notice('传入文本为空，无法规划');
      return;
    }
    const plannerSettings: PlannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth,
    };
    const sourceLabel = opts?.sourceLabel?.trim() || '外部文本';
    const sourceRef = opts?.sourceRef?.trim() || `external:${sourceLabel}`;
    void this.openPlanEditor({
      content: trimmed,
      scope: 'selection',
      settings: plannerSettings,
      subtitle: `以下目标基于「${sourceLabel}」中的文本拆解（非整篇笔记）。`,
      onConfirm: (finalGoals) => void this.mergeAndWriteGoals(sourceRef, trimmed, finalGoals),
    });
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
      diagnose,
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

  /**
   * 实时战略复盘总览（供竹杖芒鞋侧栏 / 阅读抽屉消费）。
   * 零 AI、纯计算、确定性：每次调用重读 vault 的 goals.json + 每日执行数据并即时核算，
   * 即竹杖芒鞋「一键重新诊断」的底层实现。未安装目标数据或无目标时返回 null。
   */
  async getStrategyOverview(): Promise<StrategyOverview | null> {
    const storage = new VaultStorage(this.app);
    const all = await storage.getGoals();
    if (!all || all.length === 0) return null;

    // 与 webapp「综合健康分」环一致：已归档目标不参与整体健康分核算
    const goals = all.filter((g) => !g.archived);
    if (goals.length === 0) return null;

    const daysMap = await storage.getAllDays();
    const days = Object.values(daysMap);
    const cache = buildCache(goals, days);
    const today = new Date();

    return buildStrategyOverview(goals, cache, today);
  }

  /**
   * 当前修行境界（供竹杖芒鞋侧栏常驻展示）。
   * 由「已完成目标数」经纯函数映射出境界层/称号，零 AI、确定性。
   * 即使无任何目标，亦返回「凡尘·第1层」（与 webapp 境界体系一致）；
   * 仅当无法读取目标数据（如竹林未启用）时返回 null。
   */
  async getCultivationRealm(): Promise<CultivationRealm | null> {
    const storage = new VaultStorage(this.app);
    const goals = (await storage.getGoals()) ?? [];
    const toN = (v: unknown): number =>
      typeof v === 'number' ? v : parseFloat(String(v ?? '')) || 0;
    const completedGoals = goals.filter((g: GoalItem) => toN(g.progress) >= 100).length;
    return toCultivationRealm(completedGoals);
  }

  /**
   * 当前竹币余额（供竹杖芒鞋侧栏常驻展示）。
   * 读取 VaultStorage 的 balance 设置项（与 webapp WalletService 持久化落点一致）。
   * 未设置时返回 0（而非 null），使展示端无需区分「未启用」与「0 余额」。
   */
  async getBambooCoinBalance(): Promise<number | null> {
    const storage = new VaultStorage(this.app);
    const raw = await storage.getSetting('balance');
    if (raw == null) return 0;
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  /**
   * 当前「可用竹币余额」（供竹杖芒鞋侧栏常驻展示，与 webapp 商店界面口径对齐）。
   * 可用余额 = 总额 balance − 今日收入（今日收入次日才可用，界面标注为「冻结」）。
   * 逻辑与 webapp WalletService.getAvailableBalance() 保持一致，避免两侧漂移。
   * 未启用 / 无余额设置时返回 0。
   */
  async getBambooCoinAvailableBalance(): Promise<number | null> {
    const storage = new VaultStorage(this.app);
    const raw = await storage.getSetting('balance');
    const total = raw == null ? 0 : typeof raw === 'number' ? raw : Number(raw);
    const income = await storage.getIncomeHistory();
    const today = new Date().toDateString();
    const todayEarnings = ((income?.records) ?? []).reduce((sum: number, r) => {
      const d = r.date;
      if (d == null) return sum;
      try {
        return new Date(String(d)).toDateString() === today
          ? sum + (Number(r.amount) || 0)
          : sum;
      } catch {
        return sum;
      }
    }, 0);
    const available = total - todayEarnings;
    return Number.isFinite(available) ? Math.max(0, parseFloat(available.toFixed(2))) : 0;
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
    const allGoals = await storage.getGoals();
    // 归档目标不进规划台编辑（避免误改/误删）；但写回时必须并回，否则 putGoals 整体覆盖会丢失它们
    const activeGoals = allGoals.filter((g) => !g.archived);
    const archivedGoals = allGoals.filter((g) => g.archived);
    if (activeGoals.length === 0) {
      new Notice(
        archivedGoals.length > 0
          ? '当前没有活跃目标（目标都已归档），无需编辑。'
          : '你还没有目标，先跑一次 AI 规划',
      );
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
      goals: activeGoals,
      subtitle: '正在编辑你当前的目标库，可直接改或用自然语言让我调整。',
      onConfirm: (finalGoals) =>
        void this.writeDiagnosedGoals([...finalGoals, ...archivedGoals]),
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
      // 创建新视图（默认落在右侧栏）
      const rightLeaf = workspace.getRightLeaf(false);
      if (!rightLeaf) return;
      leaf = rightLeaf;
      await leaf.setViewState({
        type: VIEW_TYPE_DAILY_REVIEW,
        active: true,
      });
      // 展开右栏并给面板一个舒适宽度。
      // 注意：setViewState 异步，视图真正挂载完成后右栏布局才稳定，
      // 必须等下一帧再读/写宽度，否则读到 0 或被框架 CSS 覆盖。
      const rightSplit = workspace.rightSplit as unknown as {
        containerEl: HTMLElement;
        expand(): void;
      };
      rightSplit.expand();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const el = rightSplit.containerEl;
          if (el.offsetWidth < 420) {
            el.setCssStyles({ width: '420px' });
          }
        });
      });
    }

    if (leaf) {
      await workspace.revealLeaf(leaf);
    }
  }

  /** 激活或创建目标归档独立页 */
  async openArchive(): Promise<void> {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_ARCHIVE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_ARCHIVE,
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
