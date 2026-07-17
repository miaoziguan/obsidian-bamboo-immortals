import { describe, it, expect, vi } from 'vitest';
import {
  buildPrompt,
  parseGoals,
  planFromNote,
  backfillItemDates,
  type AiResponse,
} from '../MarkdownPlanner';

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

describe('子项日期兜底 backfillItemDates（对齐 web「大目标区间=子项最早/最晚」）', () => {
  it('子项带日期 → 大目标区间被聚合为 min/max（web 口径，即使大目标原为空）', () => {
    const goals = backfillItemDates([
      {
        id: 'g1',
        title: '减重',
        category: 'health',
        startDate: '',
        endDate: '',
        progress: 0,
        items: [
          { name: '启动', dailyMin: '500', taskDayType: 'daily', startDate: '2026-07-18', endDate: '2026-08-15' },
          { name: '减脂', dailyMin: '500', taskDayType: 'daily', startDate: '2026-08-15', endDate: '2026-09-12' },
          { name: '冲刺', dailyMin: '350', taskDayType: 'daily', startDate: '2026-09-12', endDate: '2026-10-18' },
        ],
      },
    ]);
    expect(goals[0].startDate).toBe('2026-07-18');
    expect(goals[0].endDate).toBe('2026-10-18');
  });

  it('单个 daily 子项 + 大目标有区间 → 子项继承全程', () => {
    const goals = backfillItemDates([
      {
        id: 'g1',
        title: 'x',
        category: 'other',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        progress: 0,
        items: [{ name: '每日', dailyMin: '30', taskDayType: 'daily' }],
      },
    ]);
    expect(goals[0].items![0].startDate).toBe('2026-01-01');
    expect(goals[0].items![0].endDate).toBe('2026-12-31');
  });

  it('多个 daily 子项 + 大目标有区间 → 区间按数组顺序等切', () => {
    const goals = backfillItemDates([
      {
        id: 'g1',
        title: 'x',
        category: 'other',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        progress: 0,
        items: [
          { name: '阶段一', dailyMin: '1', taskDayType: 'daily' },
          { name: '阶段二', dailyMin: '1', taskDayType: 'daily' },
          { name: '阶段三', dailyMin: '1', taskDayType: 'daily' },
        ],
      },
    ]);
    const [a, b, c] = goals[0].items!;
    expect(a.startDate).toBe('2026-01-01');
    expect(a.endDate).toBe(b.startDate); // 段段相接
    expect(b.endDate).toBe(c.startDate);
    expect(c.endDate).toBe('2026-01-31'); // 末段落在总终点
  });

  it('非 daily 子项缺日期 → 继承大目标全程', () => {
    const goals = backfillItemDates([
      {
        id: 'g1',
        title: 'x',
        category: 'other',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        progress: 0,
        items: [{ name: '每周体检', dailyMin: '1', taskDayType: 'weekly' }],
      },
    ]);
    expect(goals[0].items![0].startDate).toBe('2026-01-01');
    expect(goals[0].items![0].endDate).toBe('2026-12-31');
  });

  it('大目标与子项都无日期 → 原样返回，不崩溃', () => {
    const goals = backfillItemDates([
      {
        id: 'g1',
        title: 'x',
        category: 'other',
        startDate: '',
        endDate: '',
        progress: 0,
        items: [{ name: '每日', dailyMin: '30', taskDayType: 'daily' }],
      },
    ]);
    expect(goals[0].items![0].startDate).toBeUndefined();
    expect(goals[0].items![0].endDate).toBeUndefined();
  });

  it('模型已给的子项日期不被覆盖', () => {
    const goals = backfillItemDates([
      {
        id: 'g1',
        title: 'x',
        category: 'other',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        progress: 0,
        items: [
          { name: '已有', dailyMin: '1', taskDayType: 'daily', startDate: '2026-03-01', endDate: '2026-03-31' },
          { name: '缺的', dailyMin: '1', taskDayType: 'daily' },
        ],
      },
    ]);
    expect(goals[0].items![0].startDate).toBe('2026-03-01');
    expect(goals[0].items![0].endDate).toBe('2026-03-31');
  });

  it('parseGoals 端到端：阶段子项日期随模型输出保留，并被聚合进大目标', () => {
    const out = parseGoals({
      goals: [
        {
          title: '健康减重',
          category: 'health',
          startDate: '',
          endDate: '',
          items: [
            { name: '快速启动', dailyMin: '500', taskDayType: 'daily', startDate: '2026-07-18', endDate: '2026-08-15' },
            { name: '稳定减脂', dailyMin: '500', taskDayType: 'daily', startDate: '2026-08-15', endDate: '2026-09-12' },
          ],
        },
      ],
    });
    expect(out[0].startDate).toBe('2026-07-18');
    expect(out[0].endDate).toBe('2026-09-12');
    expect(out[0].items![0].startDate).toBe('2026-07-18');
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
