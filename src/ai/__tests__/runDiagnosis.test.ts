import { describe, it, expect, vi } from 'vitest';
import { runDiagnosis, type DiagnosisDeps } from '../runDiagnosis';
import type { DiagnosisResult } from '../GoalDiagnoser';
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

  it('有目标 → diagnose + 打开报告；点「应用」→ 打开 Agentic 预填指令并落库', async () => {
    const diag = {
      ok: true,
      summary: 's',
      goals: [{ title: '减重', status: 'behind', suggestions: ['降 dailyMin'] }],
      nextActions: [],
    } as DiagnosisResult;
    const d = baseDeps({ diagnose: vi.fn().mockResolvedValue(diag) });
    await runDiagnosis(d);

    expect(d.diagnose).toHaveBeenCalledWith([{ id: 'g1', title: '减重' }], [], plannerSettings);
    expect(d.openDiagnosis).toHaveBeenCalledTimes(1);

    const openArgs = (d.openDiagnosis as any).mock.calls[0][0];
    expect(openArgs.diagnosis).toBe(diag);

    // 触发「应用」回调
    if (diag.ok) {
      openArgs.onApply(diag.goals[0]);
    }
    expect(d.openAgentic).toHaveBeenCalledTimes(1);
    const agenticArgs = (d.openAgentic as any).mock.calls[0][0];
    expect(agenticArgs.goals).toEqual([{ id: 'g1', title: '减重' }]); // 载入真实树
    expect(agenticArgs.initialInstruction).toBe('降 dailyMin'); // 建议预填为指令

    // Agentic 确认 → 落库
    agenticArgs.onConfirm([{ id: 'g1', title: '减重', items: [] }]);
    expect(d.writeGoals).toHaveBeenCalledWith([{ id: 'g1', title: '减重', items: [] }]);
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
