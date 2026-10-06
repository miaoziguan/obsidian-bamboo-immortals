/**
 * GoalStatsCalculator 目标统计纯计算单测
 * 无 DOM 依赖，需 mock window.GOAL_CATEGORIES。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('GoalStatsCalculator 目标统计计算', () => {
  let calc;

  beforeAll(() => {
    window.GOAL_CATEGORIES = [
      { id: 'work', name: '工作', color: '#3B82F6' },
      { id: 'personal', name: '个人', color: '#10B981' },
      { id: 'health', name: '健康', color: '#EF4444' },
    ];
    // 该模块 import 了 utils/dateUtils 的两个函数，而 loadModule 会剥离 import 且不接线
    // → 按仓库惯例把它们当 globals 注入（同 archiver.jest.test.js 注入 DateRangePicker）
    const dateUtils = loadModule('utils/dateUtils.js', ['parseLocalDate', 'diffLocalDays']);
    calc = loadModule('services/goalStatsCalculator.js', ['GoalStatsCalculator'], dateUtils).GoalStatsCalculator;
  });

  afterAll(() => {
    delete window.GOAL_CATEGORIES;
  });

  // ---- A14-2：按天判定走本地日历口径 ----
  // 基准一律用**显式本地时刻**构造（本地凌晨 2:00）。旧实现把 'YYYY-MM-DD' 按 UTC 午夜解析，
  // 等价于把日界挪到本地 08:00，此刻所有「还剩/逾期」判定整体错 1 档；当天还会算出 -0。
  describe('本地日历口径（截止/停滞/跨度）', () => {
    const now = new Date(2026, 9, 6, 2, 0);
    const calcAt = (goal) => calc.calculate([goal], now);

    test('今天到期：归 urgent，daysLeft 为 0 且不是 -0', () => {
      const r = calcAt({ id: '1', progress: 30, endDate: '2026-10-06' });
      expect(r.urgentGoals.length).toBe(1);
      expect(r.urgentGoals[0].daysLeft).toBe(0);
      expect(Object.is(r.urgentGoals[0].daysLeft, -0)).toBe(false);
      expect(r.overdueGoals.length).toBe(0);
    });

    test('昨天到期：归 overdue 1 天（旧实现算出 -0 → 误报「还剩 0 天」）', () => {
      const r = calcAt({ id: '1', progress: 30, endDate: '2026-10-05' });
      expect(r.overdueGoals.length).toBe(1);
      expect(r.overdueGoals[0].daysOverdue).toBe(1);
      expect(r.urgentGoals.length).toBe(0);
    });

    test('前天到期：daysOverdue 为 2（旧实现少算 1 天）', () => {
      const r = calcAt({ id: '1', progress: 30, endDate: '2026-10-04' });
      expect(r.overdueGoals[0].daysOverdue).toBe(2);
    });

    test('3 天后到期归 urgent（旧实现按 08:00 日界算成 4 天 → 掉进 upcoming）', () => {
      const r = calcAt({ id: '1', progress: 30, endDate: '2026-10-09' });
      expect(r.urgentGoals.length).toBe(1);
      expect(r.urgentGoals[0].daysLeft).toBe(3);
      expect(r.upcomingGoals.length).toBe(0);
    });

    test('4 天后到期归 upcoming，天数为 4', () => {
      const r = calcAt({ id: '1', progress: 30, endDate: '2026-10-10' });
      expect(r.upcomingGoals.length).toBe(1);
      expect(r.upcomingGoals[0].daysLeft).toBe(4);
      expect(r.urgentGoals.length).toBe(0);
    });

    test('7 天档边界：7 天归 upcoming，8 天不归类', () => {
      expect(calcAt({ id: '1', progress: 30, endDate: '2026-10-13' }).upcomingGoals.length).toBe(1);
      const r8 = calcAt({ id: '1', progress: 30, endDate: '2026-10-14' });
      expect(r8.upcomingGoals.length).toBe(0);
      expect(r8.urgentGoals.length).toBe(0);
      expect(r8.overdueGoals.length).toBe(0);
    });

    test('非法 endDate 串不归类（原为 NaN 静默穿透，现显式跳过）', () => {
      const r = calcAt({ id: '1', progress: 30, endDate: '2026-02-31' });
      expect(r.overdueGoals.length).toBe(0);
      expect(r.urgentGoals.length).toBe(0);
      expect(r.upcomingGoals.length).toBe(0);
    });

    test('停滞阈值按本地日历日：第 14 天不算，第 15 天算', () => {
      expect(calcAt({ id: '1', progress: 30, startDate: '2026-09-22' }).stagnantGoals.length).toBe(0);
      expect(calcAt({ id: '1', progress: 30, startDate: '2026-09-21' }).stagnantGoals.length).toBe(1);
    });

    test('跨度档位（30/90 天）在本地日历口径下不变', () => {
      expect(calcAt({ id: '1', progress: 30, startDate: '2026-01-01', endDate: '2026-01-30' }).timeSpanStats.shortTerm).toBe(1);
      expect(calcAt({ id: '1', progress: 30, startDate: '2026-01-01', endDate: '2026-04-01' }).timeSpanStats.mediumTerm).toBe(1);
      expect(calcAt({ id: '1', progress: 30, startDate: '2026-01-01', endDate: '2026-04-02' }).timeSpanStats.longTerm).toBe(1);
    });
  });

  // ---- 空输入 ----
  test('空目标数组返回全零统计', () => {
    const r = calc.calculate([]);
    expect(r.totalGoals).toBe(0);
    expect(r.completedGoals).toBe(0);
    expect(r.inProgressGoals).toBe(0);
    expect(r.notStartedGoals).toBe(0);
    expect(r.avgProgress).toBe(0);
    expect(r.catStats).toEqual([]);
    expect(r.progressTiers.tier100).toBe(0);
    expect(r.stagnantGoals).toEqual([]);
    expect(r.subItemCompletionRate).toBe(0);
  });

  // ---- 基础计数 ----
  test('正确统计完成/进行中/未开始数量', () => {
    const goals = [
      { id: '1', progress: 100 },
      { id: '2', progress: 50 },
      { id: '3', progress: 0 },
      { id: '4', progress: 100 },
      { id: '5', progress: 75 },
    ];
    const r = calc.calculate(goals);
    expect(r.totalGoals).toBe(5);
    expect(r.completedGoals).toBe(2);
    expect(r.inProgressGoals).toBe(2); // 50, 75
    expect(r.notStartedGoals).toBe(1);
  });

  test('平均进度计算正确（Math.round）', () => {
    const goals = [
      { id: '1', progress: 100 },
      { id: '2', progress: 33 },
    ];
    const r = calc.calculate(goals);
    expect(r.avgProgress).toBe(67); // (100+33)/2 = 66.5 → Math.round = 67
  });

  // ---- 子项统计 ----
  test('子项完成率和计数正确', () => {
    const goals = [
      {
        id: '1',
        progress: 50,
        items: [
          { currentValue: 10, targetValue: 10 },
          { currentValue: 5, targetValue: 10 },
        ],
      },
      {
        id: '2',
        progress: 100,
        items: [
          { currentValue: 20, targetValue: 20 },
          { currentValue: '15', targetValue: 15 },
        ],
      },
    ];
    const r = calc.calculate(goals);
    expect(r.totalSubItems).toBe(4);
    expect(r.completedSubItems).toBe(3); // 10/10, 20/20, 15/15
    expect(r.subItemCompletionRate).toBe(75);
  });

  test('targetValue 为 0 时子项不计入已完成', () => {
    const goals = [
      {
        id: '1',
        progress: 0,
        items: [
          { currentValue: 10, targetValue: 0 },
          { currentValue: 5, targetValue: 5 },
        ],
      },
    ];
    const r = calc.calculate(goals);
    expect(r.completedSubItems).toBe(1); // only 5/5 counts
  });

  // ---- 优先级统计 ----
  test('高优先级完成率计算正确', () => {
    const goals = [
      { id: '1', priority: 'high', progress: 100 },
      { id: '2', priority: 'high', progress: 0 },
      { id: '3', priority: 'low', progress: 100 },
    ];
    const r = calc.calculate(goals);
    expect(r.highPriorityRate).toBe(50); // 1/2 → 50%
  });

  test('无高优先级目标时 highPriorityRate = 0', () => {
    const goals = [{ id: '1', priority: 'low', progress: 100 }];
    const r = calc.calculate(goals);
    expect(r.highPriorityRate).toBe(0);
  });

  // ---- 分类统计 ----
  test('按分类分组统计', () => {
    const goals = [
      { id: '1', category: 'work', progress: 100 },
      { id: '2', category: 'work', progress: 0 },
      { id: '3', category: 'personal', progress: 40 },
    ];
    const r = calc.calculate(goals);
    expect(r.catStats.length).toBe(2);
    const work = r.catStats.find((s) => s.category.id === 'work');
    expect(work.goalCount).toBe(2);
    expect(work.avgProgress).toBe(50);
    const personal = r.catStats.find((s) => s.category.id === 'personal');
    expect(personal.goalCount).toBe(1);
    expect(personal.avgProgress).toBe(40);
  });

  test('无目标的分类被过滤', () => {
    const goals = [{ id: '1', category: 'work', progress: 50 }];
    const r = calc.calculate(goals);
    expect(r.catStats.length).toBe(1);
    expect(r.catStats[0].category.id).toBe('work');
  });

  // ---- 截止日期分类 ----
  test('逾期目标（endDate < now 且未完成）归入 overdueGoals', () => {
    const pastDate = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
    const goals = [
      { id: '1', endDate: pastDate, progress: 50 },
    ];
    const r = calc.calculate(goals);
    expect(r.overdueGoals.length).toBe(1);
    expect(r.overdueGoals[0].daysOverdue).toBeGreaterThanOrEqual(4);
  });

  test('已完成的逾期目标不纳入 overdueGoals', () => {
    const pastDate = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
    const goals = [
      { id: '1', endDate: pastDate, progress: 100 },
    ];
    const r = calc.calculate(goals);
    expect(r.overdueGoals.length).toBe(0);
  });

  test('3天内截止归入 urgentGoals', () => {
    const soon = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
    const goals = [
      { id: '1', endDate: soon, progress: 30 },
    ];
    const r = calc.calculate(goals);
    expect(r.urgentGoals.length).toBe(1);
    expect(r.urgentGoals[0].daysLeft).toBeLessThanOrEqual(3);
  });

  test('4-7天内截止归入 upcomingGoals', () => {
    const mid = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
    const goals = [
      { id: '1', endDate: mid, progress: 20 },
    ];
    const r = calc.calculate(goals);
    expect(r.upcomingGoals.length).toBe(1);
    expect(r.upcomingGoals[0].daysLeft).toBeGreaterThanOrEqual(4);
    expect(r.upcomingGoals[0].daysLeft).toBeLessThanOrEqual(7);
  });

  // ---- 进度分层 ----
  test('progressTiers 分层计数正确', () => {
    const goals = [
      { id: '1', progress: 0 },
      { id: '2', progress: 25 },
      { id: '3', progress: 50 },
      { id: '4', progress: 80 },
      { id: '5', progress: 100 },
    ];
    const r = calc.calculate(goals);
    expect(r.progressTiers.tier0_25).toBe(2);   // 0, 25
    expect(r.progressTiers.tier26_50).toBe(1);  // 50
    expect(r.progressTiers.tier51_75).toBe(0);
    expect(r.progressTiers.tier76_99).toBe(1);  // 80
    expect(r.progressTiers.tier100).toBe(1);    // 100
  });

  // ---- 停滞检测 ----
  test('超过14天未完成的目标归入 stagnantGoals', () => {
    const oldDate = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);
    const goals = [
      { id: '1', startDate: oldDate, progress: 30 },
    ];
    const r = calc.calculate(goals);
    expect(r.stagnantGoals.length).toBe(1);
  });

  test('无 startDate 的目标视为停滞', () => {
    const goals = [
      { id: '1', progress: 30 },
    ];
    const r = calc.calculate(goals);
    expect(r.stagnantGoals.length).toBe(1);
  });

  test('14天内开始的目标不视为停滞', () => {
    const recent = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
    const goals = [
      { id: '1', startDate: recent, progress: 30 },
    ];
    const r = calc.calculate(goals);
    expect(r.stagnantGoals.length).toBe(0);
  });

  // ---- 时间跨度统计 ----
  test('timeSpanStats 按短期/中期/长期分类', () => {
    const shortStart = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
    const shortEnd = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10); // ~20 days
    const midEnd = new Date(Date.now() + 50 * 86400000).toISOString().slice(0, 10);   // ~60 days
    const longEnd = new Date(Date.now() + 100 * 86400000).toISOString().slice(0, 10); // ~110 days

    const goals = [
      { id: '1', startDate: shortStart, endDate: shortEnd },
      { id: '2', startDate: shortStart, endDate: midEnd },
      { id: '3', startDate: shortStart, endDate: longEnd },
    ];
    const r = calc.calculate(goals);
    expect(r.timeSpanStats.shortTerm).toBe(1);   // < 30 days
    expect(r.timeSpanStats.mediumTerm).toBe(1);  // 30-90 days
    expect(r.timeSpanStats.longTerm).toBe(1);    // > 90 days
  });

  // ---- recentlyCompleted ----
  test('已完成目标纳入 recentlyCompleted', () => {
    const goals = [
      { id: '1', progress: 100, endDate: '2026-06-01' },
    ];
    const r = calc.calculate(goals);
    expect(r.recentlyCompleted.length).toBe(1);
  });

  // ---- activeGoals ----
  test('activeGoals 统计进度>0的目标', () => {
    const goals = [
      { id: '1', progress: 0 },
      { id: '2', progress: 50 },
      { id: '3', progress: 100 },
    ];
    const r = calc.calculate(goals);
    expect(r.activeGoals).toBe(2); // 50 and 100
  });
});
