import { describe, it, expect, vi } from 'vitest';
import { runDiagnosis, type DiagnosisDeps } from '../runDiagnosis';
import type { DiagnosisResult, Diagnosis } from '../GoalDiagnoser';
import { TUNING } from '../healthScore';

const plannerSettings = { aiApiKey: 'k', aiBaseUrl: 'https://x', aiModel: 'm', aiDecomposeDepth: '中' as const };

function makeStorage(goals: unknown[]) {
  return {
    getGoals: vi.fn().mockResolvedValue(goals),
    getDayKeys: vi.fn().mockResolvedValue(['2026-07-10', '2026-07-09']),
    getDay: vi.fn().mockResolvedValue(null),
  };
}

function baseDeps(over: Partial<DiagnosisDeps> = {}): DiagnosisDeps {
  return {
    aiEnabled: true,
    plannerSettings,
    storage: makeStorage([{ id: 'g1', title: '减重' }]),
    diagnose: vi.fn().mockResolvedValue({ ok: true, summary: 's', goals: [], nextActions: [] } as DiagnosisResult),
    openDiagnosis: vi.fn(),
    openApplyPreview: vi.fn(),
    openAgentic: vi.fn(),
    writeGoals: vi.fn(),
    notice: vi.fn(),
    ...over,
  };
}

const PHASE_LABELS: Record<string, string> = {
  collect: '收集目标与执行记录',
  analyze: '计算三维健康分与偏差',
  ai: '调用 AI 诊断中…',
  render: '解析诊断结果',
};

describe('runDiagnosis', () => {
  it('aiEnabled=false → notice 且不调 getGoals/diagnose', async () => {
    const d = baseDeps({ aiEnabled: false });
    await runDiagnosis(d);
    expect(d.notice).toHaveBeenCalled();
    expect(d.storage.getGoals).not.toHaveBeenCalled();
    expect(d.diagnose).not.toHaveBeenCalled();
  });

  it('无目标 → notice 且不打开报告/不诊断', async () => {
    const d = baseDeps({ storage: makeStorage([]) });
    await runDiagnosis(d);
    expect(d.notice).toHaveBeenCalledWith('你还没有目标，先跑一次 AI 规划');
    expect(d.diagnose).not.toHaveBeenCalled();
    expect(d.openDiagnosis).not.toHaveBeenCalled();
  });

  it('有目标 → diagnose + 打开报告；点「应用」→ 确定性改写 + 打开预览并落库', async () => {
    const goal = { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] };
    const diag = {
      ok: true,
      summary: 's',
      goals: [
        {
          title: '减重',
          status: 'behind',
          suggestions: [
            {
              id: 's1',
              action: 'adjust_dailyMin',
              goalRef: { goalId: 'g1', goalTitle: '减重' },
              target: { subItemName: '跑步' },
              params: { dailyMin: 15 },
              text: '跑步降到 15',
            },
          ],
        },
      ],
      nextActions: [],
    } as Diagnosis;
    const d = baseDeps({ diagnose: vi.fn().mockResolvedValue(diag), storage: makeStorage([goal]) });
    await runDiagnosis(d);

    expect(d.diagnose).toHaveBeenCalledWith([goal], [], plannerSettings);
    expect(d.openDiagnosis).toHaveBeenCalledTimes(1);

    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    // M9: 诊断结果按 title 补全原目标 id（goalDiagnoses 带上 GoalItem.id）
    expect(openArgs.diagnosis.ok).toBe(true);
    expect(openArgs.diagnosis.goals[0]).toMatchObject({ title: '减重', id: 'g1' });

    // 触发逐条「应用」回调（#7 结构化）
    openArgs.onApply(diag.goals[0], diag.goals[0].suggestions[0]);
    expect(d.openApplyPreview).toHaveBeenCalledTimes(1);
    const pv = (d.openApplyPreview as any).mock.calls[0][0];
    // after 中跑步 dailyMin 已被确定性改成 15（命中具体子项）
    const edited = pv.after.find((g: any) => g.id === 'g1');
    expect(edited.items[0].dailyMin).toBe('15');
    expect(pv.before).toEqual([goal]);

    // 确认写入（H6: 写回前重新拉库合并，异步落库）
    pv.onConfirm(edited);
    await new Promise((r) => setTimeout(r, 0));
    expect(d.writeGoals).toHaveBeenCalledWith(edited);
  });

  it('提供 onPhase → 按 collect→analyze→ai→render 顺序收到阶段事件且 label 正确', async () => {
    const onPhase = vi.fn();
    const d = baseDeps({ onPhase });
    await runDiagnosis(d);
    const calls = onPhase.mock.calls.map((c) => c[0]);
    expect(calls).toEqual(['collect', 'analyze', 'ai', 'render']);
    onPhase.mock.calls.forEach((c) => {
      expect(c[1]).toBe(PHASE_LABELS[c[0] as string]);
    });
  });

  it('不提供 onPhase → 仍正常完成诊断（可选字段无副作用）', async () => {
    const d = baseDeps(); // 无 onPhase
    await runDiagnosis(d);
    expect(d.diagnose).toHaveBeenCalled();
    expect(d.openDiagnosis).toHaveBeenCalledTimes(1);
  });

  it('「应用」建议未命中目标/子项 → notice 且不打开预览/不落库', async () => {
    const goal = { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] };
    const diag = {
      ok: true,
      summary: 's',
      goals: [
        {
          title: '减重',
          status: 'behind',
          suggestions: [
            {
              id: 's1',
              action: 'adjust_dailyMin',
              goalRef: { goalId: 'g1' },
              target: { subItemName: '不存在' },
              params: { dailyMin: 15 },
              text: 'x',
            },
          ],
        },
      ],
      nextActions: [],
    } as Diagnosis;
    const d = baseDeps({ diagnose: vi.fn().mockResolvedValue(diag), storage: makeStorage([goal]) });
    await runDiagnosis(d);
    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    openArgs.onApply(diag.goals[0], diag.goals[0].suggestions[0]);
    expect(d.notice).toHaveBeenCalled();
    expect(d.openApplyPreview).not.toHaveBeenCalled();
    expect(d.writeGoals).not.toHaveBeenCalled();
  });

  it('一键应用全部建议（MVP-2）→ 跨多目标确定性批量改写 + 单次预览', async () => {
    const goals = [
      { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] },
      { id: 'g2', title: '读书', items: [{ name: '晨读', dailyMin: '10' }] },
    ];
    const diag = {
      ok: true,
      summary: 's',
      goals: [
        {
          title: '减重',
          status: 'behind',
          suggestions: [
            { id: 's1', action: 'adjust_dailyMin', goalRef: { goalId: 'g1', goalTitle: '减重' }, target: { subItemName: '跑步' }, params: { dailyMin: 15 }, text: '跑步 15' },
          ],
        },
        {
          title: '读书',
          status: 'behind',
          suggestions: [
            { id: 's2', action: 'adjust_dailyMin', goalRef: { goalId: 'g2', goalTitle: '读书' }, target: { subItemName: '晨读' }, params: { dailyMin: 5 }, text: '晨读 5' },
          ],
        },
      ],
      nextActions: [],
    } as Diagnosis;
    const d = baseDeps({ diagnose: vi.fn().mockResolvedValue(diag), storage: makeStorage(goals) });
    await runDiagnosis(d);
    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    expect(typeof openArgs.onApplyAllDiagnosis).toBe('function');
    // 触发报告级批量应用
    openArgs.onApplyAllDiagnosis();
    expect(d.openApplyPreview).toHaveBeenCalledTimes(1);
    const pv = (d.openApplyPreview as any).mock.calls[0][0];
    expect(pv.suggestions).toHaveLength(2);
    const g1 = pv.after.find((g: any) => g.id === 'g1');
    const g2 = pv.after.find((g: any) => g.id === 'g2');
    expect(g1.items[0].dailyMin).toBe('15'); // 跨目标 1 命中
    expect(g2.items[0].dailyMin).toBe('5'); // 跨目标 2 命中
    expect(pv.before).toEqual(goals);
    // 确认写入（H6: 写回前重新拉库合并，异步落库）
    pv.onConfirm(pv.after);
    await new Promise((r) => setTimeout(r, 0));
    expect(d.writeGoals).toHaveBeenCalledWith(pv.after);
  });

  it('一键应用：全部建议未命中 → notice 且不打开预览/不落库', async () => {
    const goals = [{ id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] }];
    const diag = {
      ok: true,
      summary: 's',
      goals: [
        {
          title: '减重',
          status: 'behind',
          suggestions: [
            { id: 's1', action: 'adjust_dailyMin', goalRef: { goalId: 'g1' }, target: { subItemName: '不存在' }, params: { dailyMin: 15 }, text: 'x' },
          ],
        },
      ],
      nextActions: [],
    } as Diagnosis;
    const d = baseDeps({ diagnose: vi.fn().mockResolvedValue(diag), storage: makeStorage(goals) });
    await runDiagnosis(d);
    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    openArgs.onApplyAllDiagnosis();
    expect(d.notice).toHaveBeenCalled();
    expect(d.openApplyPreview).not.toHaveBeenCalled();
    expect(d.writeGoals).not.toHaveBeenCalled();
  });

  it('过滤 archived：只把活跃目标送进 diagnose', async () => {
    const storage = makeStorage([
      { id: 'a', title: '归档', archived: true },
      { id: 'b', title: '活跃' },
    ]);
    const d = baseDeps({ storage });
    await runDiagnosis(d);
    expect(d.diagnose).toHaveBeenCalledWith([{ id: 'b', title: '活跃' }], [], plannerSettings);
  });

  it('仅 archived 目标 → notice 且不诊断', async () => {
    const storage = makeStorage([{ id: 'a', title: '归档', archived: true }]);
    const d = baseDeps({ storage });
    await runDiagnosis(d);
    expect(d.notice).toHaveBeenCalledWith('当前没有进行中的目标（已归档目标不参与诊断）');
    expect(d.diagnose).not.toHaveBeenCalled();
  });

  it('默认拉取窗口≥停滞窗口(60 天)，保证健康分停滞判定有足够历史', async () => {
    // 造 100 个日期键 + 每个都能取到 DayData
    const keys = Array.from({ length: 100 }, (_, i) => `2026-day-${i}`);
    const storage = {
      getGoals: vi.fn().mockResolvedValue([{ id: 'g1', title: '减重' }]),
      getDayKeys: vi.fn().mockResolvedValue(keys),
      getDay: vi.fn().mockImplementation(async (k: string) => ({ date: k })),
    };
    const diagnose = vi.fn().mockResolvedValue({ ok: true, summary: 's', goals: [], nextActions: [] } as DiagnosisResult);
    const d = baseDeps({ storage, diagnose });
    await runDiagnosis(d);
    const daysArg = (diagnose as any).mock.calls[0][1] as unknown[];
    expect(daysArg.length).toBe(TUNING.STAGNATION_WINDOW);
    expect(TUNING.STAGNATION_WINDOW).toBeGreaterThanOrEqual(60);
  });

  it('把真实子项证据 itemEvidence 传给报告弹窗', async () => {
    const d = baseDeps();
    await runDiagnosis(d);
    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    expect(openArgs.itemEvidence).toBeTypeOf('object');
    // 本次 getDay 返回 null → 无完成记录，证据列表为空
    expect(Array.isArray(openArgs.itemEvidence['减重'])).toBe(true);
  });

  it('H6 写回前重新拉库：仅覆盖被建议命中的目标，尊重外部增删', async () => {
    const startGoals = [
      { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] },
      { id: 'g-del', title: '将被外部删除', items: [] },
    ];
    const diag = {
      ok: true,
      summary: 's',
      goals: [
        {
          title: '减重',
          status: 'behind',
          suggestions: [
            { id: 's1', action: 'adjust_dailyMin', goalRef: { goalId: 'g1', goalTitle: '减重' }, target: { subItemName: '跑步' }, params: { dailyMin: 15 }, text: '跑步 15' },
          ],
        },
      ],
      nextActions: [],
    } as Diagnosis;
    // 启动诊断时库含 g1+g-del；确认写回时库已变（用户删除 g-del、新增 g-other）
    const latest = [
      { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] },
      { id: 'g-other', title: '外部新增', items: [] },
    ];
    const storage = {
      getGoals: vi
        .fn()
        .mockResolvedValueOnce(startGoals) // collect（诊断启动）
        .mockResolvedValueOnce(latest) // onConfirm 重新拉库
        .mockResolvedValue(latest), // 兜底
      getDayKeys: vi.fn().mockResolvedValue([]),
      getDay: vi.fn().mockResolvedValue(null),
    };
    const d = baseDeps({ diagnose: vi.fn().mockResolvedValue(diag), storage });
    await runDiagnosis(d);

    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    openArgs.onApply(diag.goals[0], diag.goals[0].suggestions[0]);
    const pv = (d.openApplyPreview as any).mock.calls[0][0];
    pv.onConfirm(pv.after); // pv.after 仅 g1 被建议改成 15
    await new Promise((r) => setTimeout(r, 0));
    expect(d.writeGoals).toHaveBeenCalledTimes(1);

    const written = (d.writeGoals as any).mock.calls[0][0] as any[];
    // g1 应用了诊断建议（15），外部新增 g-other 保留，被外部删除的 g-del 不回写
    expect(written.find((g) => g.id === 'g1').items[0].dailyMin).toBe('15');
    expect(written.find((g) => g.id === 'g-other')).toBeDefined();
    expect(written.find((g) => g.id === 'g-del')).toBeUndefined();
  });

  it('L10 单条应用写回失败 → 通过 notice 暴露而非 void 静默吞掉', async () => {
    const goal = { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] };
    const diag = {
      ok: true,
      summary: 's',
      goals: [
        {
          title: '减重',
          status: 'behind',
          suggestions: [
            { id: 's1', action: 'adjust_dailyMin', goalRef: { goalId: 'g1', goalTitle: '减重' }, target: { subItemName: '跑步' }, params: { dailyMin: 15 }, text: '跑步 15' },
          ],
        },
      ],
      nextActions: [],
    } as Diagnosis;
    const writeGoals = vi.fn().mockRejectedValue(new Error('磁盘写满'));
    const d = baseDeps({ diagnose: vi.fn().mockResolvedValue(diag), storage: makeStorage([goal]), writeGoals });
    await runDiagnosis(d);
    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    openArgs.onApply(diag.goals[0], diag.goals[0].suggestions[0]);
    const pv = (d.openApplyPreview as any).mock.calls[0][0];
    pv.onConfirm(pv.after); // 触发写回（void 调用）
    await new Promise((r) => setTimeout(r, 0));
    expect(d.writeGoals).toHaveBeenCalledTimes(1); // 仍尝试写入
    // 关键修复：异常被 notice 暴露给用户，而非被 void 调用静默吞掉
    expect(d.notice).toHaveBeenCalledWith(expect.stringContaining('磁盘写满'));
  });

  it('L10 escalate(AI 接管)写回失败 → 同样通过 notice 暴露', async () => {
    const goal = { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] };
    const diag = {
      ok: true,
      summary: 's',
      goals: [
        {
          title: '减重',
          status: 'behind',
          suggestions: [
            { id: 's1', action: 'adjust_dailyMin', goalRef: { goalId: 'g1', goalTitle: '减重' }, target: { subItemName: '跑步' }, params: { dailyMin: 15 }, text: '跑步 15' },
          ],
        },
      ],
      nextActions: [],
    } as Diagnosis;
    const writeGoals = vi.fn().mockRejectedValue(new Error('权限不足'));
    const d = baseDeps({ diagnose: vi.fn().mockResolvedValue(diag), storage: makeStorage([goal]), writeGoals });
    await runDiagnosis(d);
    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    openArgs.onApply(diag.goals[0], diag.goals[0].suggestions[0]);
    const pv = (d.openApplyPreview as any).mock.calls[0][0];
    pv.onEscalateAI(pv.after); // 进入 AI 接管，触发 openAgentic
    const agenticArgs = (d.openAgentic as any).mock.calls[0][0];
    agenticArgs.onConfirm(pv.after); // 触发写回（void 调用）
    await new Promise((r) => setTimeout(r, 0));
    expect(d.writeGoals).toHaveBeenCalledTimes(1);
    expect(d.notice).toHaveBeenCalledWith(expect.stringContaining('权限不足'));
  });
});
