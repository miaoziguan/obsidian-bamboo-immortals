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
    expect(openArgs.diagnosis).toBe(diag);

    // 触发逐条「应用」回调（#7 结构化）
    openArgs.onApply(diag.goals[0], diag.goals[0].suggestions[0]);
    expect(d.openApplyPreview).toHaveBeenCalledTimes(1);
    const pv = (d.openApplyPreview as any).mock.calls[0][0];
    // after 中跑步 dailyMin 已被确定性改成 15（命中具体子项）
    const edited = pv.after.find((g: any) => g.id === 'g1');
    expect(edited.items[0].dailyMin).toBe('15');
    expect(pv.before).toEqual([goal]);

    // 确认写入
    pv.onConfirm(edited);
    expect(d.writeGoals).toHaveBeenCalledWith(edited);
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
});
