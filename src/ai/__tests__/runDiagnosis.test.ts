import { describe, it, expect, vi } from 'vitest';
import { runDiagnosis, type DiagnosisDeps } from '../runDiagnosis';
import type { DiagnosisResult } from '../GoalDiagnoser';

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
});
