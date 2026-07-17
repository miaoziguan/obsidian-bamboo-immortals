/**
 * 端到端联调（Phase 5 多目标多框架）
 * ----------------------------------------------------------------
 * 与单测不同，本文件【真实发出 HTTP 请求】，验证整条链路在真实网络层下不崩：
 *   澄清简报(GoalBrief) → splitGoals(本地 server) → 各自 selectFramework
 *   → buildMultiPrompt → PlanningSession.init()(本地 server) → 解析映射为 GoalItem[]
 *
 * 两种模式（由环境变量切换）：
 *  - 默认（mock）：起一个本地 OpenAI 兼容 /chat/completions server，确定性回执，不花真钱，可重复。
 *  - live：设 E2E_LIVE=1，读 AI_BASE_URL / AI_API_KEY / AI_MODEL，打到真实模型，
 *          看真实 AI 的「拆分质量 + 各自框架规划质量」，仅打印供人工核对（断言放宽）。
 *
 * 关键断言（仅 mock 模式）：
 *  - 通用量化铁律 system 单一来源：planner 的 system 不含任何框架 fragment（里程碑/阶段）；
 *  - 框架 fragment 只追加在该目标自己的 user 段里；
 *  - 拆出 ≥2 个独立简报、规划出等长 GoalItem，且每个子项 dailyMin 为纯数字字符串。
 */
import { describe, it, expect, afterAll } from 'vitest';
import http from 'node:http';
import { buildMultiPrompt, type AiFetchFn, type PlannerSettings } from '../MarkdownPlanner';
import { PlanningSession } from '../PlanningSession';
import { splitGoals, briefToPlanningText, type ElicitSettings } from '../GoalElicitor';
import { selectFramework, FRAMEWORKS } from '../frameworks';
import type { GoalBrief } from '../../types/data';

const LIVE = process.env.E2E_LIVE === '1';

/** 一篇含多个异质目标的真实笔记（live 模式输入 / 澄清背景） */
const NOTE = `今年想做几件事：
1. 三个月内减重 5kg，主要是控制饮食加每天运动。
2. 今年要把酝酿已久的小说写出来，目前只有个开头。
3. 顺手把每天刷手机的时间压一压。`;

/** 已经过 Layer 0 澄清的单目标总简报（模拟澄清通过后的状态） */
const clarifiedBrief = (): GoalBrief => ({
  rawIntent: NOTE,
  goalKind: 'project',
  clarifiedOutcome: '3 个月内减重 5kg，并今年写完一本小说',
  successMeasure: '体重下降 5kg；小说完成初稿并修订',
  ownedSlice: '个人每日的饮食 / 运动 / 写作时间',
  constraints: '3 个月 / 今年内',
  domain: '健康 + 创作',
  reliabilityStatus: 'clarified',
  diseases: [],
  questions: [{ disease: 'vague', question: '目标之间相互独立吗？', answer: '是，减重与写小说是两个独立目标' }],
  summary: '减重 + 写小说双目标',
  round: 2,
});

/** 把 Node fetch 适配成 AiFetchFn（requestUrl 最小子集） */
const nodeFetchFn: AiFetchFn = async ({ url, method = 'POST', headers, body }) => {
  const res = await fetch(url, { method, headers, body });
  let json: unknown;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    json = await res.json();
  } else {
    try {
      json = await res.json();
    } catch {
      /* 非 JSON 忽略 */
    }
  }
  return { status: res.status, json };
};

/** 本地 mock server：按 system 内容路由到「拆分器」或「规划器」回执 */
function startServer() {
  const captured: { sys: string; usr: string }[] = [];
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
      captured.push({ sys, usr });

      let content: string;
      if (sys.includes('你是「目标拆分器」')) {
        // 拆分器：把总简报拆成 project(减重) + creative(写小说) 两个独立目标
        content = JSON.stringify({
          goals: [
            {
              goalKind: 'project',
              clarifiedOutcome: '3 个月减重 5kg',
              successMeasure: '体重下降 5kg 并维持',
              ownedSlice: '每日饮食与运动',
              constraints: '3 个月',
              domain: '健康',
              summary: '健康减重',
            },
            {
              goalKind: 'creative',
              clarifiedOutcome: '今年写完并修订一本小说',
              successMeasure: '完成初稿并至少一轮修订',
              ownedSlice: '每日写作时间',
              constraints: '今年内',
              domain: '创作',
              summary: '写小说',
            },
          ],
        });
      } else {
        // 规划器：两个目标各自日级指标（project 偏里程碑/量化，creative 偏阶段推进）
        content = JSON.stringify({
          goals: [
            {
              title: '健康减重',
              category: 'health',
              analysis: '3 个月 5kg，拆为饮食/运动/追踪三类日级指标',
              startDate: '2026-07-18',
              endDate: '2026-10-18',
              items: [
                { name: '每天饮食热量上限(千卡)', dailyMin: '2000', taskDayType: 'daily', reason: '制造热量缺口' },
                { name: '每天运动消耗(千卡)', dailyMin: '400', taskDayType: 'daily', reason: '加速减脂' },
                { name: '每天称重(次)', dailyMin: '1', taskDayType: 'daily', reason: '追踪进度' },
              ],
            },
            {
              title: '写小说',
              category: 'study',
              analysis: '按创作阶段推进，拆为初稿/修订/反馈三类日级动作',
              startDate: '2026-07-18',
              endDate: '2026-12-31',
              items: [
                { name: '每天写初稿(字)', dailyMin: '800', taskDayType: 'daily', reason: '积累初稿体量' },
                { name: '每天大纲修订(分钟)', dailyMin: '20', taskDayType: 'daily', reason: '结构打磨' },
                { name: '每周找反馈(次)', dailyMin: '1', taskDayType: 'weekly', reason: '外部校验' },
              ],
            },
          ],
        });
      }

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ choices: [{ message: { content } }] }));
    });
  });

  return new Promise<{ server: http.Server; baseUrl: string; captured: typeof captured }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as { port: number }).port;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}/v1`, captured });
    });
  });
}

function buildSettings(baseUrl: string): ElicitSettings & PlannerSettings {
  return {
    aiApiKey: LIVE ? process.env.AI_API_KEY ?? '' : 'test-key',
    aiBaseUrl: baseUrl,
    aiModel: LIVE ? process.env.AI_MODEL ?? 'deepseek-chat' : 'mock-model',
    aiDecomposeDepth: '中',
  } as ElicitSettings & PlannerSettings;
}

describe('E2E 多目标多框架', () => {
  const ctx = { server: undefined as http.Server | undefined, captured: [] as { sys: string; usr: string }[] };

  it(
    '本地 HTTP 全链路：拆多目标 → 各自框架规划 → 解析为 GoalItem[]',
    async () => {
    let baseUrl: string;
    let captured: { sys: string; usr: string }[] = [];
    if (LIVE) {
      baseUrl = (process.env.AI_BASE_URL ?? 'https://api.deepseek.com/v1').replace(/\/+$/, '');
    } else {
      const s = await startServer();
      ctx.server = s.server;
      captured = s.captured;
      baseUrl = s.baseUrl;
    }

    const settings = buildSettings(baseUrl);

    // 1) 单澄清简报 → 拆成多目标
    const briefs = await splitGoals(clarifiedBrief(), settings as unknown as ElicitSettings, nodeFetchFn);
    console.log(
      `\n[E2E] splitGoals 拆出 ${briefs.length} 个目标：` +
        briefs.map((b) => `${b.goalKind}:${b.summary}`).join(' | ')
    );
    expect(briefs.length).toBeGreaterThanOrEqual(2);

    // 2) 每个目标各自选框架
    const frameworks = briefs.map((b) => selectFramework(b));
    console.log('[E2E] 各目标框架：', frameworks.map((f) => FRAMEWORKS[f].label).join(' | '));

    // 3) 构造 targets + 校验 buildMultiPrompt 的「框架只在 user 段」
    const targets = briefs.map((b, i) => ({ content: briefToPlanningText(b), framework: frameworks[i] }));
    const { system } = buildMultiPrompt(targets);
    if (!LIVE) {
      expect(system).not.toContain('里程碑拆解');
      expect(system).not.toContain('阶段推进');
    }

    // 4) 真实 HTTP 调用 → PlanningSession 解析为 GoalItem[]
    const session = new PlanningSession('', settings as unknown as PlannerSettings, nodeFetchFn, 'note', undefined, targets);
    const goals = await session.init();
    console.log(`\n[E2E] PlanningSession 规划出 ${goals.length} 个 GoalItem：\n` + JSON.stringify(goals, null, 2));

    if (LIVE) {
      // 真实模型未必严格等长 / 纯数字，仅打印供人工核对
      expect(goals.length).toBeGreaterThanOrEqual(1);
      for (const g of goals) {
        const fw = frameworks[goals.indexOf(g)];
        const winSet = new Set<string>();
        for (const it of g.items ?? []) {
          console.log(
            `  [E2E][live] 【${g.title}】(${fw ? FRAMEWORKS[fw].label : '量化'}) ` +
              `${it.name} → dailyMin=${it.dailyMin} | 窗口=${it.startDate ?? '∅'}~${it.endDate ?? '∅'}`
          );
          winSet.add(`${it.startDate ?? ''}~${it.endDate ?? ''}`);
        }
        // 打磨点验证：专业框架下，子项应拿到【各自窗口】（不同窗口数接近子项数），
        // 而非全部共用目标大区间（窗口数=1 即"粗暴均摊"反模式）。
        const nItems = (g.items ?? []).length;
        let verdict = '';
        if (fw === 'stage' && nItems > 1) {
          // 创作型应为顺序阶段 → 强制要求各阶段分段落窗
          verdict = winSet.size > 1 ? '  ✅ 各创作阶段已分段落窗' : '  ⚠️ 创作阶段仍共用单一窗口（打磨未生效？）';
        } else if (fw === 'milestone' && nItems > 1) {
          // 项目型子项可能并行（贯穿全程）或串行里程碑；并行型共用窗口属正常，仅报告
          verdict = winSet.size > 1 ? '  ✅ 已拆出串行里程碑窗口' : '  （并行动作型项目，子项共用大窗口属正常）';
        }
        console.log(`  [E2E][live] 「${g.title}」子项=${nItems} / 不同窗口数=${winSet.size}${verdict}`);
      }
    } else {
      expect(goals.length).toBe(briefs.length);
      for (const g of goals) {
        expect(Array.isArray(g.items)).toBe(true);
        for (const it of g.items ?? []) {
          expect(it.dailyMin).toMatch(/^\d+$/); // 纯数字字符串
        }
      }
    }

    // 5) mock 模式额外校验：规划器请求里通用铁律单一来源 + 框架指引只在 user
    if (!LIVE) {
      const plannerReq = captured[captured.length - 1];
      expect(plannerReq.sys).not.toContain('里程碑拆解');
      expect(plannerReq.sys).not.toContain('阶段推进');
      for (const f of frameworks) {
        if (f !== 'quantify') {
          expect(plannerReq.usr).toContain(`采用「${FRAMEWORKS[f].label}」`);
          const frag = FRAMEWORKS[f].fragment ?? '';
          expect(plannerReq.usr).toContain(frag.slice(0, 6));
        }
      }
    }
  },
    120000
  );

  afterAll(() => {
    ctx.server?.close();
  });
});
