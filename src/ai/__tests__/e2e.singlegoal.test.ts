/**
 * 单目标 live 验证（Phase 5 · goalKind 判别 + 框架回落）
 * ----------------------------------------------------------------
 * 与 e2e.multigoal.test.ts 同源：真实发 HTTP 请求，验证「单句意图 → 澄清器判别 goalKind
 * → selectFramework 选框架」在真实模型下的表现。
 *
 * 两种模式（环境变量切换）：
 *  - 默认（mock）：起本地 /chat/completions server，按 user 关键词确定性回执，不花真钱。
 *  - live：设 E2E_LIVE=1，读 AI_BASE_URL / AI_API_KEY / AI_MODEL，打真实 DeepSeek。
 *
 * 重点验证（④ 关心的）：
 *  - habit 现已有专属「习惯回路框架」；borrowed / vision 仍回落默认「量化日级框架」；
 *  - creative 应命中「创作阶段框架」、project 命中「项目里程碑框架」；
 *  - creative 绝不能被误判为 project（上轮修复点的回归）。
 */
import { describe, it, expect, afterAll } from 'vitest';
import http from 'node:http';
import { elicitGoal, type ElicitSettings } from '../GoalElicitor';
import { selectFramework, FRAMEWORKS } from '../frameworks';
import type { GoalBrief, GoalKind } from '../../types/data';
import type { AiFetchFn } from '../MarkdownPlanner';

const LIVE = process.env.E2E_LIVE === '1';

/** 单句意图用例：覆盖 5 类，含回落默认「量化日级框架」的 borrowed/vision */
const CASES: { key: string; intent: string; expectKind: GoalKind; expectFramework: string }[] = [
  { key: 'habit', intent: '我想养成每天早起跑步半小时的习惯', expectKind: 'habit', expectFramework: 'habit' },
  { key: 'creative', intent: '我想写一本关于修仙的小说', expectKind: 'creative', expectFramework: 'stage' },
  { key: 'project', intent: '我想三个月内减重5公斤', expectKind: 'project', expectFramework: 'milestone' },
  { key: 'borrowed', intent: '老板要求我今年必须把 PMP 证书考下来', expectKind: 'borrowed', expectFramework: 'quantify' },
  { key: 'vision', intent: '我想成为一个更好的人', expectKind: 'vision', expectFramework: 'quantify' },
];

/** Node fetch 适配 AiFetchFn */
const nodeFetchFn: AiFetchFn = async ({ url, method = 'POST', headers, body }) => {
  const res = await fetch(url, { method, headers, body });
  let json: unknown;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) json = await res.json();
  else {
    try {
      json = await res.json();
    } catch {
      /* ignore */
    }
  }
  return { status: res.status, json };
};

/** mock：按 user 关键词回确定性澄清结果（仅校验「判别 → 框架」链路，不验模型） */
function elicitMock(usr: string): Record<string, unknown> {
  if (usr.includes('早起') || usr.includes('习惯'))
    return { goalKind: 'habit', diseases: [], summary: '每天早起跑步', clarifiedOutcome: '养成早起跑步习惯', successMeasure: '连续21天', ownedSlice: '每日晨跑', constraints: '长期坚持', domain: '健康' };
  if (usr.includes('小说'))
    return { goalKind: 'creative', diseases: [], summary: '写修仙小说', clarifiedOutcome: '完成一部小说', successMeasure: '初稿+修订', ownedSlice: '每日写作', constraints: '今年', domain: '创作' };
  if (usr.includes('减重'))
    return { goalKind: 'project', diseases: [], summary: '减重5kg', clarifiedOutcome: '减重5kg', successMeasure: '体重降5kg', ownedSlice: '饮食运动', constraints: '3个月', domain: '健康' };
  if (usr.includes('老板') || usr.includes('PMP'))
    return { goalKind: 'borrowed', diseases: ['non_owned'], summary: '考PMP', clarifiedOutcome: '考下PMP', successMeasure: '拿证', ownedSlice: '备考时间', constraints: '今年', domain: '工作' };
  if (usr.includes('更好的人'))
    return { goalKind: 'vision', diseases: ['vague'], summary: '成为更好的人', clarifiedOutcome: '', successMeasure: '', ownedSlice: '', constraints: '', domain: '' };
  return { goalKind: 'unclear', diseases: ['vague'], summary: '', questions: [{ disease: 'vague', question: '具体点？' }] };
}

function startServer() {
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      let body: any = {};
      try {
        body = JSON.parse(raw);
      } catch {
        /* ignore */
      }
      const msgs: any[] = body.messages ?? [];
      const sys = msgs.find((m) => m.role === 'system')?.content ?? '';
      const usr = msgs.find((m) => m.role === 'user')?.content ?? '';
      const content = sys.includes('目标澄清教练') ? JSON.stringify(elicitMock(usr)) : JSON.stringify({ goals: [] });
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ choices: [{ message: { content } }] }));
    });
  });
  return new Promise<{ server: http.Server; baseUrl: string }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as { port: number }).port;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}/v1` });
    });
  });
}

function buildSettings(baseUrl: string): ElicitSettings {
  return {
    aiApiKey: LIVE ? process.env.AI_API_KEY ?? '' : 'test-key',
    aiBaseUrl: baseUrl,
    aiModel: LIVE ? process.env.AI_MODEL ?? 'deepseek-chat' : 'mock-model',
  };
}

describe('E2E 单目标 goalKind 判别 + 框架回落', () => {
  const ctx = { server: undefined as http.Server | undefined };

  it(
    '单句意图 → 澄清判别 goalKind → 选框架（5 类覆盖）',
    async () => {
      let baseUrl: string;
      if (LIVE) {
        baseUrl = (process.env.AI_BASE_URL ?? 'https://api.deepseek.com/v1').replace(/\/+$/, '');
      } else {
        const s = await startServer();
        ctx.server = s.server;
        baseUrl = s.baseUrl;
      }
      const settings = buildSettings(baseUrl);

      for (const c of CASES) {
        let res;
        try {
          res = await elicitGoal(c.intent, settings, nodeFetchFn);
        } catch (e) {
          console.log(`[E2E][single][${c.key}] 调用抛错：${(e as Error).message}`);
          if (LIVE) continue; // live 单条失败不阻断其余
          throw e;
        }

        const kind = res.goalKind ?? '∅';
        const framework = res.goalKind
          ? FRAMEWORKS[selectFramework({ goalKind: res.goalKind } as GoalBrief)].label
          : '(无 goalKind，不选框架)';
        const match = !LIVE ? kind === c.expectKind : true;
        console.log(
          `[E2E][single][${c.key}] 期望=${c.expectKind} | 实得=${kind} ${LIVE ? '' : match ? '✓' : '✗'} | ` +
            `diseases=[${res.diseases.join(',')}] | 框架=${framework}\n       summary=${res.summary ?? '-'}`
        );

        if (!LIVE) {
          expect(res.goalKind).toBe(c.expectKind);
          const fw = selectFramework({ goalKind: res.goalKind } as GoalBrief);
          expect(fw).toBe(c.expectFramework);
        } else {
          expect(['habit', 'project', 'creative', 'vision', 'borrowed', 'unclear']).toContain(res.goalKind ?? 'unclear');
        }
      }
    },
    120000
  );

  afterAll(() => {
    ctx.server?.close();
  });
});
