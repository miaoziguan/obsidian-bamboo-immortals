import { describe, it, expect, vi } from 'vitest';
import { PlanningSession, type ChatMessage } from '../PlanningSession';
import type { AiResponse } from '../MarkdownPlanner';

const settings = {
  aiApiKey: 'sk-test',
  aiBaseUrl: 'https://api.deepseek.com/v1',
  aiModel: 'deepseek-chat',
  aiDecomposeDepth: '中' as const,
};

/** 构造 OpenAI 风格回执：内层 content 为 { reply?, goals } 的 JSON 文本 */
function aiReply(inner: { reply?: string; goals: unknown }): AiResponse {
  return {
    status: 200,
    json: { choices: [{ message: { content: JSON.stringify(inner) } }] },
  };
}

const goalWithRun = {
  title: '健康减重',
  category: 'health',
  items: [
    { name: '每天跑步(分钟)', dailyMin: '30' },
    { name: '每天饮食热量上限(千卡)', dailyMin: '2000' },
  ],
};
const goalWithoutRun = {
  title: '健康减重',
  category: 'health',
  items: [{ name: '每天饮食热量上限(千卡)', dailyMin: '2000' }],
};

describe('PlanningSession', () => {
  it('init() 返回首版 goals', async () => {
    const fake = vi.fn().mockResolvedValue(aiReply({ goals: [goalWithRun] }));
    const s = new PlanningSession('笔记', settings, fake);
    const out = await s.init();
    expect(fake).toHaveBeenCalledTimes(1);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('健康减重');
    expect(out[0].items).toHaveLength(2);
  });

  it('send("去掉跑步") 后 goals 不含跑步，且返回 reply', async () => {
    const fake = vi
      .fn()
      .mockResolvedValueOnce(aiReply({ goals: [goalWithRun] }))
      .mockResolvedValueOnce(aiReply({ reply: '已删除跑步', goals: [goalWithoutRun] }));
    const s = new PlanningSession('笔记', settings, fake);
    await s.init();
    const res = await s.send('把跑步去掉');
    expect(fake).toHaveBeenCalledTimes(2);
    expect(res.reply).toBe('已删除跑步');
    const names = res.goals[0].items!.map((i) => i.name);
    expect(names).not.toContain('每天跑步(分钟)');
    expect(s.goals[0].items).toHaveLength(1);
  });

  it('坏 JSON：send 抛错且 goals 保持不变（容错核心）', async () => {
    const fake = vi
      .fn()
      .mockResolvedValueOnce(aiReply({ goals: [goalWithRun] }))
      .mockResolvedValueOnce({ status: 200, json: { choices: [{ message: { content: '这不是json' } }] } });
    const s = new PlanningSession('笔记', settings, fake);
    await s.init();
    const before = s.goals;
    await expect(s.send('胡说八道')).rejects.toThrow();
    // 工作副本不受影响
    expect(s.goals).toBe(before);
    expect(s.goals[0].items).toHaveLength(2);
    // 坏那轮的 user 消息被回滚（messages 仍为 init 后的 2 条）
    expect(s.getMessages()).toHaveLength(2);
  });

  it('applyLocalEdit：下一次请求的 messages 含该 system note', async () => {
    const fake = vi
      .fn()
      .mockResolvedValueOnce(aiReply({ goals: [goalWithRun] }))
      .mockResolvedValueOnce(aiReply({ goals: [goalWithoutRun] }));
    const s = new PlanningSession('笔记', settings, fake);
    await s.init();
    s.applyLocalEdit('删除了跑步子项');
    await s.send('再把热量降到1800');
    const body = JSON.parse(fake.mock.calls[1][0].body as string);
    const msgs: ChatMessage[] = body.messages;
    expect(msgs.some((m) => m.role === 'system' && m.content.includes('[用户手动改动] 删除了跑步子项'))).toBe(true);
  });

  it('reset() 回到 AI 首版并清空对话', async () => {
    const fake = vi
      .fn()
      .mockResolvedValueOnce(aiReply({ goals: [goalWithRun] }))
      .mockResolvedValueOnce(aiReply({ goals: [goalWithoutRun] }));
    const s = new PlanningSession('笔记', settings, fake);
    await s.init();
    await s.send('去掉跑步');
    expect(s.goals[0].items).toHaveLength(1);
    s.reset();
    expect(s.goals[0].items).toHaveLength(2);
    expect(s.getMessages()).toHaveLength(2);
  });
});

describe('PlanningSession.loadGoals (edit mode)', () => {
  const existingTree = [
    { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] },
  ];

  it('深拷贝：改工作副本不影响传入原对象与首版快照', () => {
    const s = new PlanningSession('笔记', settings, vi.fn());
    s.loadGoals(existingTree);
    s.goals[0].title = '改了';
    expect(existingTree[0].title).toBe('减重'); // 传入原对象未被改
    s.reset();
    expect(s.goals[0].title).toBe('减重'); // reset 回到首版快照
  });

  it('messages 首条为「编辑现有树」system 上下文（含树 JSON）', () => {
    const s = new PlanningSession('笔记', settings, vi.fn());
    s.loadGoals(existingTree);
    const first = s.getMessages()[0];
    expect(first.role).toBe('system');
    expect(first.content).toContain('目标卡片编辑器');
    expect(first.content).toContain('减重');
  });

  it('edit 模式：send 改树后 reset 回到真实首版快照', async () => {
    const modified = [{ id: 'g1', title: '减重改', items: [{ name: '跑步', dailyMin: '15' }] }];
    const fake = vi.fn().mockResolvedValue(aiReply({ goals: modified }));
    const s = new PlanningSession('笔记', settings, fake);
    s.loadGoals(existingTree);
    await s.send('把跑步降到15');
    expect(s.goals[0].title).toBe('减重改');
    s.reset();
    expect(s.goals[0].title).toBe('减重');
    expect(s.getMessages()[0].content).toContain('目标卡片编辑器');
  });
});
