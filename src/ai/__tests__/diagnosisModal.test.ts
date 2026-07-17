import { describe, it, expect, vi } from 'vitest';
import { DiagnosisModal, type DiagnosisModalOptions } from '../DiagnosisModal';
import type { DiagnosisResult, Diagnosis } from '../GoalDiagnoser';
import type { ItemEvidence } from '../DeviationCalculator';

/** 轻量 DOM 桩：覆盖 Modal.contentEl，供 onOpen 渲染并断言 */
class FakeEl {
  children: FakeEl[] = [];
  text = '';
  cls = '';
  dataset: Record<string, string> = {};
  style = { setProperty: (_k: string, _v: string) => {} };
  private handlers: Record<string, Array<() => void>> = {};
  empty(): void {
    this.children = [];
    this.text = '';
  }
  addClass(c: string): void {
    this.cls = c;
  }
  createEl(tag: string, opts: { text?: string; cls?: string } = {}): FakeEl {
    const el = new FakeEl();
    el.tag = tag;
    if (opts.text) el.text = opts.text;
    if (opts.cls) el.cls = opts.cls;
    this.children.push(el);
    return el;
  }
  createDiv(opts: { text?: string; cls?: string } = {}): FakeEl {
    return this.createEl('div', opts);
  }
  createSpan(opts: { text?: string; cls?: string } = {}): FakeEl {
    return this.createEl('span', opts);
  }
  addEventListener(ev: string, fn: () => void): void {
    (this.handlers[ev] ||= []).push(fn);
  }
  click(): void {
    (this.handlers['click'] || []).forEach((h) => h());
  }
  find(pred: (e: FakeEl) => boolean): FakeEl | undefined {
    if (pred(this)) return this;
    for (const c of this.children) {
      const r = c.find(pred);
      if (r) return r;
    }
    return undefined;
  }
  tag = 'div';
}

const fakeApp: any = { workspace: {} };

function openModal(
  diagnosis: DiagnosisResult,
  itemEvidence?: Record<string, ItemEvidence[]>,
  extra: Partial<DiagnosisModalOptions> = {}
) {
  const onApply = vi.fn();
  const opts: DiagnosisModalOptions = { diagnosis, onApply, itemEvidence, ...extra };
  const modal = new DiagnosisModal(fakeApp, opts);
  const root = new FakeEl();
  (modal as any).contentEl = root;
  modal.onOpen();
  return { modal, root, onApply };
}

const validDiag: Diagnosis = {
  ok: true,
  summary: '3 目标 1 达标 2 落后',
  goals: [
    {
      title: '健康减重',
      completion: 62,
      status: 'behind',
      bottleneck: '跑步停滞',
      suggestions: [
        {
          id: 's1',
          action: 'adjust_dailyMin',
          goalRef: { goalTitle: '健康减重' },
          target: { subItemName: '跑步' },
          params: { dailyMin: 15 },
          text: '将跑步 dailyMin 降到 15',
        },
        { id: 's2', action: 'note', goalRef: { goalTitle: '健康减重' }, text: '加入周六长距离' },
      ],
    },
  ],
  nextActions: ['整体下调 dailyMin'],
};

describe('DiagnosisModal', () => {
  it('渲染摘要 + 状态徽标 + 每条建议「应用」按钮', () => {
    const { root } = openModal(validDiag);
    // 摘要
    expect(root.find((e) => e.cls.includes('bamboo-diag-summary') && e.text.includes('达标'))).toBeDefined();
    // 状态徽标（柔和化后类名）
    expect(root.find((e) => e.cls.includes('bamboo-diag-status-behind'))).toBeDefined();
    // 应用按钮存在
    const btn = root.find((e) => e.text === '应用');
    expect(btn).toBeDefined();
    // 建议标题显示数量
    expect(root.find((e) => e.cls.includes('bamboo-diag-suggestions-title') && e.text.includes('建议（2）'))).toBeDefined();
  });

  it('点「应用」→ 调用 onApply(该目标诊断) 并关闭', () => {
    const { root, onApply, modal } = openModal(validDiag);
    const btn = root.find((e) => e.text === '应用')!;
    btn.click();
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(validDiag.goals[0], validDiag.goals[0].suggestions[0]);
    expect(() => modal.onClose()).not.toThrow();
  });

  it('坏 JSON 回退（rawText）→ 展示纯文本，无「应用」按钮，不崩', () => {
    const raw: DiagnosisResult = { ok: false, rawText: '模型返回了乱码…' };
    const { root } = openModal(raw);
    expect(root.find((e) => e.cls.includes('bamboo-diag-raw') && e.text.includes('乱码'))).toBeDefined();
    expect(root.find((e) => e.text === '应用')).toBeUndefined();
  });

  it('子项证据默认折叠为 details/summary 形式', () => {
    const ev: ItemEvidence[] = [
      { index: 0, name: '喵字摇滚体', dailyMin: '10', percent: 34, pacePct: 44, paceDeviation: -10, doneDays: 0, lastDone: null },
    ];
    const { root } = openModal(validDiag, { '健康减重': ev });
    // 存在 details 元素（HTML5 原生折叠容器，DOM 子节点始终存在，display 由 [open] 控制）
    const details = root.find((e) => e.tag === 'details' && e.cls.includes('bamboo-diag-evidence'));
    expect(details).toBeDefined();
    // summary 含子项数（左侧「9 个子项 · …」+ 右侧 headline）
    expect(details!.find((e) => e.cls.includes('bamboo-diag-evidence-summary-left'))).toBeDefined();
    expect(details!.find((e) => e.cls.includes('bamboo-diag-evidence-headline'))).toBeDefined();
    // chevron 用于旋转指示展开
    expect(details!.find((e) => e.cls.includes('bamboo-diag-evidence-chevron'))).toBeDefined();
  });

  it('证据行含真实字段（名字/dailyMin/完成度/节奏偏差/天数）', () => {
    const ev: ItemEvidence[] = [
      {
        index: 0,
        name: '喵字摇滚体',
        dailyMin: '10',
        percent: 34,
        pacePct: 44,
        paceDeviation: -10,
        doneDays: 2,
        lastDone: '2026-07-15',
      },
    ];
    const { root } = openModal(validDiag, { '健康减重': ev });
    // 表格行存在（DOM 始终存在，[open] 控制可见性）
    const row = root.find((e) => e.cls.includes('bamboo-diag-evidence-row'));
    expect(row).toBeDefined();
    // 名字
    expect(root.find((e) => e.text === '喵字摇滚体' && e.cls.includes('bamboo-diag-evidence-name'))).toBeDefined();
    // 完成度 34% → mid 等级（30-70）
    expect(root.find((e) => e.cls.includes('bamboo-diag-evidence-pct-mid') && e.text.includes('34%'))).toBeDefined();
    // 节奏偏差（负值用 neg 类）
    expect(root.find((e) => e.cls.includes('bamboo-diag-evidence-pace-neg') && e.text.includes('-10pt'))).toBeDefined();
    // 元信息：完成 N 天 + 最近日期
    expect(root.find((e) => e.cls.includes('bamboo-diag-evidence-foot') && e.text.includes('2 天') && e.text.includes('2026-07-15'))).toBeDefined();
  });

  it('近 7 天 0 完成时折叠摘要显示「全部停滞」红色徽标', () => {
    const ev: ItemEvidence[] = [
      { index: 0, name: 'A', dailyMin: '10', percent: 0, pacePct: 0, paceDeviation: -10, doneDays: 0, lastDone: null },
      { index: 1, name: 'B', dailyMin: '10', percent: 0, pacePct: 0, paceDeviation: -8, doneDays: 0, lastDone: null },
    ];
    const { root } = openModal(validDiag, { '健康减重': ev });
    const headline = root.find((e) => e.cls.includes('bamboo-diag-evidence-headline-bad'));
    expect(headline).toBeDefined();
    expect(headline!.text).toBe('全部停滞');
  });

  it('正节奏偏差渲染为正色（pos 等级）', () => {
    const ev: ItemEvidence[] = [
      { index: 0, name: '未来甲骨文', dailyMin: '5', percent: 80, pacePct: 60, paceDeviation: 20, doneDays: 7, lastDone: '2026-07-16' },
    ];
    const { root } = openModal(validDiag, { '健康减重': ev });
    expect(root.find((e) => e.cls.includes('bamboo-diag-evidence-headline-good'))).toBeDefined();
  });

  it('无 goals.suggestions 时不渲染「建议」块', () => {
    const noSugg: Diagnosis = {
      ok: true,
      summary: '空',
      goals: [{ title: '空目标', completion: 0, status: 'stuck', bottleneck: '', suggestions: [] }],
      nextActions: [],
    };
    const { root } = openModal(noSugg);
    expect(root.find((e) => e.cls.includes('bamboo-diag-suggestions'))).toBeUndefined();
  });

  it('无 itemEvidence 时（向后兼容）不渲染证据块', () => {
    const { root } = openModal(validDiag);
    expect(root.find((e) => e.cls.includes('bamboo-diag-evidence'))).toBeUndefined();
  });

  it('无健康分字段（旧数据）→ 回退旧 status 徽标，不渲染健康等级/三维', () => {
    const { root } = openModal(validDiag);
    expect(root.find((e) => e.cls.includes('bamboo-diag-status-behind'))).toBeDefined();
    expect(root.find((e) => e.cls.includes('bamboo-diag-level'))).toBeUndefined();
    expect(root.find((e) => e.cls.includes('bamboo-diag-dims'))).toBeUndefined();
  });
});

describe('DiagnosisModal — 健康分三维渲染', () => {
  const healthDiag: Diagnosis = {
    ok: true,
    summary: '整体节奏可持续',
    goals: [
      {
        title: '字库研发',
        completion: 40,
        status: 'behind',
        healthScore: 62,
        level: 'warning',
        L1: 70,
        L2: 65,
        L3: 55,
        weakest: 'L3',
        bottleneck: '子项进度不均衡',
        suggestions: [
          {
            id: 's1',
            action: 'note',
            goalRef: { goalTitle: '字库研发' },
            dimension: 'L3',
            text: '关注边缘子项 B：先完成一次以激活惯性',
          },
        ],
      },
    ],
    nextActions: [],
  };

  it('有 level → 渲染健康等级徽标（文案+类名）与健康分', () => {
    const { root } = openModal(healthDiag);
    const badge = root.find((e) => e.cls.includes('bamboo-diag-level-warning'));
    expect(badge).toBeDefined();
    expect(badge!.text).toContain('需关注');
    // 健康分数值展示
    expect(root.find((e) => e.cls.includes('bamboo-diag-healthscore') && e.text.includes('62'))).toBeDefined();
    // 不再渲染旧 status 徽标（有健康分时以健康等级为准）
    expect(root.find((e) => e.cls.includes('bamboo-diag-status-behind'))).toBeUndefined();
  });

  it('渲染 L1/L2/L3 三维 chips（履约/动力/节奏 + 分数）', () => {
    const { root } = openModal(healthDiag);
    expect(root.find((e) => e.cls.includes('bamboo-diag-dims'))).toBeDefined();
    const l1 = root.find((e) => e.cls.includes('bamboo-diag-dim-L1'));
    const l2 = root.find((e) => e.cls.includes('bamboo-diag-dim-L2'));
    const l3 = root.find((e) => e.cls.includes('bamboo-diag-dim-L3'));
    expect(l1).toBeDefined();
    expect(l2).toBeDefined();
    expect(l3).toBeDefined();
    expect(l1!.text).toContain('履约');
    expect(l1!.text).toContain('70');
    expect(l2!.text).toContain('动力');
    expect(l3!.text).toContain('节奏');
  });

  it('最弱维度 chip 带 weakest 高亮类', () => {
    const { root } = openModal(healthDiag);
    const weak = root.find((e) => e.cls.includes('bamboo-diag-dim-L3'));
    expect(weak!.cls).toContain('bamboo-diag-dim-weakest');
    // 非最弱维度不带高亮
    const l1 = root.find((e) => e.cls.includes('bamboo-diag-dim-L1'));
    expect(l1!.cls).not.toContain('bamboo-diag-dim-weakest');
  });

  it('点「应用」回传（该目标诊断, 该条建议）', () => {
    const { root, onApply } = openModal(healthDiag);
    const btn = root.find((e) => e.text === '应用')!;
    btn.click();
    expect(onApply).toHaveBeenCalledWith(healthDiag.goals[0], healthDiag.goals[0].suggestions[0]);
  });

  it('提供 onApplyAll → 显示「应用全部」按钮，点击回传该目标', () => {
    const onApplyAll = vi.fn();
    const { root } = openModal(validDiag, undefined, { onApplyAll });
    const allBtn = root.find((e) => e.text === '应用全部');
    expect(allBtn).toBeDefined();
    allBtn!.click();
    expect(onApplyAll).toHaveBeenCalledWith(validDiag.goals[0]);
  });

  it('未提供 onApplyAll → 不显示「应用全部」按钮', () => {
    const { root } = openModal(validDiag);
    expect(root.find((e) => e.text === '应用全部')).toBeUndefined();
  });

  it('建议分组标题带「聚焦<维度>」标签（当 weakest 存在）', () => {
    const { root } = openModal(healthDiag);
    const title = root.find((e) => e.cls.includes('bamboo-diag-suggestions-title'));
    expect(title).toBeDefined();
    // weakest === 'L3' → 节奏
    const chip = title!.find((c) => c.cls.includes('bamboo-diag-focus-dim'));
    expect(chip).toBeDefined();
    expect(chip!.text).toBe('聚焦节奏');
  });

  it('无 weakest（旧数据）时不渲染聚焦维度标签', () => {
    const { root } = openModal(validDiag);
    const title = root.find((e) => e.cls.includes('bamboo-diag-suggestions-title'));
    expect(title).toBeDefined();
    expect(title!.text).not.toContain('聚焦');
    expect(title!.find((c) => c.cls.includes('bamboo-diag-focus-dim'))).toBeUndefined();
  });
});
