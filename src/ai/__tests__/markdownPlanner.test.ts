import { describe, it, expect, vi } from 'vitest';
import { buildPrompt, parseGoals, planFromNote, type AiResponse } from '../MarkdownPlanner';

const settings = {
  aiApiKey: 'sk-test',
  aiBaseUrl: 'https://api.deepseek.com/v1',
  aiModel: 'deepseek-chat',
  aiDecomposeDepth: '中' as const,
};

describe('buildPrompt', () => {
  it('包含 JSON Schema 与分类枚举', () => {
    const { system } = buildPrompt('笔记', '中');
    expect(system).toContain('"goals"');
    expect(system).toContain('work | personal | health | study | finance | other');
    expect(system).toContain('{"goals":[]}');
  });

  it('拆解粒度映射正确', () => {
    expect(buildPrompt('x', '粗').system).toContain('2-3');
    expect(buildPrompt('x', '中').system).toContain('3-6');
    expect(buildPrompt('x', '细').system).toContain('5-8');
  });

  it('前置量化 + 日颗粒度产品哲学约束', () => {
    const { system } = buildPrompt('x', '中');
    expect(system).toContain('量化');
    expect(system).toContain('纯数字');
  });

  it('scope 默认 note：user 仍为整篇「笔记正文」（回归）', () => {
    const { user } = buildPrompt('x', '中');
    expect(user).toContain('笔记正文：');
    expect(user).not.toContain('选中的一段文本');
  });

  it('scope=selection：user 标注选中片段、不再当整篇笔记', () => {
    const { system, user } = buildPrompt('选段', '中', 'selection');
    expect(user).toContain('选中的一段文本');
    expect(user).not.toContain('笔记正文：');
    // system 追加「选中片段」专门说明句
    expect(system).toContain('选中的片段');
    expect(system).toContain('不要当成整篇笔记的摘要');
  });
});

describe('parseGoals', () => {
  it('解析裸 JSON 对象', () => {
    const raw = { goals: [{ title: '学前端', category: 'study', items: [{ name: '看文档', dailyMin: '2' }] }] };
    const out = parseGoals(raw);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('学前端');
    expect(out[0].category).toBe('study');
    expect(out[0].items![0].dailyMin).toBe('2');
    expect(out[0].id).toMatch(/^goal_/);
  });

  it('容忍 ```json 围栏', () => {
    const text = '好的，这是规划：\n```json\n{"goals":[{"title":"a","items":[]}]}\n```\n完毕';
    const out = parseGoals(text);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('a');
  });

  it('坏 JSON / 无 goals → 抛错', () => {
    expect(() => parseGoals('not json at all')).toThrow();
    expect(() => parseGoals({ foo: 1 })).toThrow();
  });

  it('非法 category 回落 other，缺字段补默认', () => {
    const out = parseGoals({ goals: [{ title: 'x', category: 'xxx', items: [{ name: 's' }] }] });
    expect(out[0].category).toBe('other');
    expect(out[0].progress).toBe(0);
    expect(out[0].items![0].taskDayType).toBe('daily');
  });

  it('reason 落入 detail（审阅展示用）', () => {
    const out = parseGoals({ goals: [{ title: 'x', items: [{ name: 's', reason: '因为A' }] }] });
    expect(out[0].items![0].detail).toBe('因为A');
  });

  it('dailyMin 含单位时清洗为纯数字', () => {
    const out = parseGoals({
      goals: [{ title: 'x', items: [{ name: '睡觉', dailyMin: '7小时' }, { name: '读书', dailyMin: '30分钟' }] }],
    });
    expect(out[0].items![0].dailyMin).toBe('7');
    expect(out[0].items![1].dailyMin).toBe('30');
  });

  it('日期推算规则：startDate默认填今天 + endDate相对时长推算', () => {
    const { system, user } = buildPrompt('3个月减重5kg', '中');
    // 规则9 必须同时约束 startDate 和 endDate
    expect(system).toMatch(/startDate.*今天|必须填|不要留空/);
    expect(system).toMatch(/endDate.*推算|YYYY-MM-DD/);
    // user 消息包含今天的日期作为锚点
    expect(user).toMatch(/^今天是 \d{4}-\d{2}-\d{2}/);
    // JSON Schema 中 startDate 描述应强调"未提及则填今天"
    expect(system).toContain('startDate');
    expect(system).toMatch(/笔记未提及.*必须填今天/);
  });

  it('时间驱动规划：起止时间反推 dailyMin', () => {
    const { system } = buildPrompt('3个月减重5kg', '中');
    expect(system).toContain('时间驱动规划');
    expect(system).toContain('总天数');
    expect(system).toContain('endDate - startDate');
    expect(system).toMatch(/targetValue/);
  });

  it('子项相关性护栏：禁止离题/跑题子项', () => {
    const { system } = buildPrompt('3个月学会React', '中');
    expect(system).toContain('子项相关性 & 可量化护栏');
    expect(system).toContain('必须围绕目标');
    expect(system).toContain('拒绝跑题');
  });

  it('可量化护栏：拒绝难量化任务并要求改写为可计数动作', () => {
    const { system } = buildPrompt('学英语', '中');
    expect(system).toContain('必须可量化');
    expect(system).toContain('提升语感');
    expect(system).toContain('可数代理指标');
    // 改写范式应出现，给出具体可量化示范
    expect(system).toContain('每天背单词(个)');
  });

  it('硬性两关：难量化/离题子项不得产出，找不到代理指标则 items 留空', () => {
    const { system } = buildPrompt('x', '中');
    expect(system).toContain('硬性两关');
    expect(system).toContain('items 留空');
    expect(system).toContain('伪量化');
  });
});

describe('planFromNote', () => {
  const openAiWrap = (inner: unknown): AiResponse => ({
    status: 200,
    json: { choices: [{ message: { content: JSON.stringify(inner) } }] },
  });

  it('成功：解析 OpenAI 风格 choices.content', async () => {
    const fake = vi.fn().mockResolvedValue(
      openAiWrap({ goals: [{ title: '练琴', category: 'personal', items: [{ name: '每日', dailyMin: '30' }] }] })
    );
    const out = await planFromNote('笔记', settings, fake);
    expect(fake).toHaveBeenCalledTimes(1);
    expect(out[0].title).toBe('练琴');
    // 校验 fetch 的 URL 与鉴权头
    expect(fake.mock.calls[0][0].url).toBe('https://api.deepseek.com/v1/chat/completions');
    expect(fake.mock.calls[0][0].headers!.Authorization).toBe('Bearer sk-test');
  });

  it('首次失败重试一次后成功', async () => {
    const fake = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(openAiWrap({ goals: [{ title: '重试成功', items: [] }] }));
    const out = await planFromNote('笔记', settings, fake);
    expect(fake).toHaveBeenCalledTimes(2);
    expect(out[0].title).toBe('重试成功');
  });

  it('两次都失败 → 抛友好错误', async () => {
    const fake = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(planFromNote('笔记', settings, fake)).rejects.toThrow(/AI 规划失败/);
    expect(fake).toHaveBeenCalledTimes(2);
  });

  it('HTTP 非 2xx → 抛错并重试', async () => {
    const fake = vi.fn().mockResolvedValue({ status: 401, json: { error: 'unauth' } });
    await expect(planFromNote('笔记', settings, fake)).rejects.toThrow(/HTTP 401/);
    expect(fake).toHaveBeenCalledTimes(2);
  });

  it('scope=selection 透传至请求体 user 消息', async () => {
    const fake = vi.fn().mockResolvedValue(
      openAiWrap({ goals: [{ title: '选中转目标', category: 'study', items: [] }] })
    );
    await planFromNote('选中内容', settings, fake, 'selection');
    const body = JSON.parse(fake.mock.calls[0][0].body as string);
    expect(body.messages[1].content).toContain('选中的一段文本');
    expect(body.messages[1].content).not.toContain('笔记正文：');
  });
});
