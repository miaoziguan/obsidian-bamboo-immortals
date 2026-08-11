/**
 * 年度修为报告 —— 纯本地聚合一年修仙数据，生成可视化年报。
 *
 * 数据全来自本 vault（dayData / goals / settings.lifeEvents），零网络、零上传。
 * - aggregate(year)：返回结构化报告数据（Markdown 与 webapp 全屏页共用同一份）；
 * - generateAnnualReport(year)：落盘 Markdown 到 reviews/年度修为报告-YYYY.md，并返回摘要。
 */
import { getRealmData } from './cultivation';
import type { DayData, GoalItem, LifeEvent } from './types/data';

const CATEGORY_LABELS: Record<string, string> = {
  work: '事业',
  personal: '生活',
  health: '健康',
  study: '修学',
  finance: '财运',
  other: '其他',
};

function hasAnyCompletion(day: DayData | undefined): boolean {
  if (!day) return false;
  const completions = day.goalTaskCompletions as
    | Record<string, Record<number, boolean>>
    | undefined;
  if (!completions) return false;
  for (const goalId of Object.keys(completions)) {
    const items = completions[goalId];
    for (const idx of Object.keys(items)) {
      if (items[Number(idx)]) return true;
    }
  }
  return false;
}

function dayKeyOf(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export interface AnnualReport {
  year: number;
  generatedAt: string;
  isPartial: boolean; // 不满一年 → true
  daysTracked: number; // 实际覆盖天数（自然年内有数据的天）
  activeDays: number; // 至少完成一项的天数
  activeRate: number; // activeDays / daysTracked
  longestStreak: number; // 最长连续活跃天数
  currentStreak: number; // 截至年末连续活跃天数
  stagnationSpells: number; // 停摆次数（连续0达标 >= STAGNATION_THRESHOLD 天）
  realmLayerGain: number; // 年内境界层突破次数（走了几境）
  realmStart: { realm: string; layer: number } | null;
  realmEnd: { realm: string; layer: number } | null;
  strongestCategory: { key: string; label: string; rate: number } | null;
  categoryRates: { key: string; label: string; rate: number }[];
  mostRebelliousAbandon: {
    title: string;
    category: string;
    date: string;
    progressAtEvent: number;
  } | null;
  completionsInYear: number;
  abandonmentsInYear: number;
  monthlyActivity: { month: number; activeDays: number; totalDays: number }[];
}

const STAGNATION_THRESHOLD = 7; // 连续 7 天无达标算一次停摆

export function aggregate(
  year: number,
  allDays: Record<string, DayData> | DayData[],
  goals: GoalItem[],
  events: LifeEvent[],
): AnnualReport {
  const yearStr = String(year);
  const dayList = Array.isArray(allDays) ? allDays : Object.values(allDays);
  // 仅取本自然年的日数据（date 形如 YYYY-MM-DD）
  const yearDays = dayList.filter((d) => (d.date || '').startsWith(yearStr));
  const daysTracked = yearDays.length;

  // 逐日活跃判定
  const activeByDate: { dateKey: string; active: boolean }[] = yearDays.map((d) => ({
    dateKey: d.date,
    active: hasAnyCompletion(d),
  }));
  const activeDays = activeByDate.filter((x) => x.active).length;

  // 连胜 / 停摆
  let longestStreak = 0;
  let run = 0;
  let stagnationSpells = 0;
  let zeroRun = 0;
  for (const x of activeByDate) {
    if (x.active) {
      run += 1;
      zeroRun = 0;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 0;
      zeroRun += 1;
      if (zeroRun === STAGNATION_THRESHOLD) stagnationSpells += 1;
    }
  }
  // 当前连胜（从年末往前数）
  let currentStreak = 0;
  for (let i = activeByDate.length - 1; i >= 0; i--) {
    if (activeByDate[i].active) currentStreak += 1;
    else break;
  }

  // 月度活跃分布
  const monthly = new Map<number, { active: number; total: number }>();
  for (const d of yearDays) {
    const mm = Number(d.date.slice(5, 7));
    const cur = monthly.get(mm) || { active: 0, total: 0 };
    cur.total += 1;
    if (hasAnyCompletion(d)) cur.active += 1;
    monthly.set(mm, cur);
  }
  const monthlyActivity = Array.from(monthly.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([month, v]) => ({ month, activeDays: v.active, totalDays: v.total }));

  // 境界层变化（来自 completed 事件）
  const completionsInYear = events.filter(
    (e) => e.type === 'completed' && (e.date || '').startsWith(yearStr),
  );
  const abandonmentsInYear = events.filter(
    (e) => e.type === 'abandoned' && (e.date || '').startsWith(yearStr),
  );
  let realmLayerGain = 0;
  for (const e of completionsInYear) {
    realmLayerGain += e.layerDelta || 0;
  }
  // 年末境界（用累计完成数推导）
  const completedNow = goals.filter((g) => (g.progress || 0) >= 100).length;
  const realmEndData = getRealmData(completedNow);
  // 年初境界（年末层 - 年内层增量，层下限为 1）
  const startLayer = Math.max(1, realmEndData.current.layer - realmLayerGain);
  const realmStartData = getRealmData(Math.max(0, completedNow - completionsInYear.length));
  const realmEnd = { realm: realmEndData.current.realm, layer: realmEndData.current.layer };
  const realmStart = { realm: realmStartData.current.realm, layer: startLayer };

  // 维度完成率（按 category 聚合：该维度下目标的平均完成度）
  const catAgg: Record<string, { sum: number; count: number }> = {};
  for (const g of goals) {
    const cat = g.category || 'other';
    const bucket = catAgg[cat] || { sum: 0, count: 0 };
    bucket.sum += Math.min(100, Math.max(0, g.progress || 0));
    bucket.count += 1;
    catAgg[cat] = bucket;
  }
  const categoryRates = Object.keys(catAgg)
    .map((key) => ({
      key,
      label: CATEGORY_LABELS[key] || key,
      rate: catAgg[key].count ? Math.round(catAgg[key].sum / catAgg[key].count) : 0,
    }))
    .sort((a, b) => b.rate - a.rate);
  const strongestCategory = categoryRates.length ? categoryRates[0] : null;

  // 最叛逆放弃（progressAtEvent 最低）
  let mostRebelliousAbandon: AnnualReport['mostRebelliousAbandon'] = null;
  for (const e of abandonmentsInYear) {
    const cand = {
      title: e.title,
      category: CATEGORY_LABELS[e.category] || e.category,
      date: e.date,
      progressAtEvent: e.progressAtEvent ?? 0,
    };
    if (!mostRebelliousAbandon || cand.progressAtEvent < mostRebelliousAbandon.progressAtEvent) {
      mostRebelliousAbandon = cand;
    }
  }

  const now = new Date();
  const isPartial = !(now.getFullYear() === year && now.getMonth() === 11 && now.getDate() === 31);

  return {
    year,
    generatedAt: dayKeyOf(now),
    isPartial,
    daysTracked,
    activeDays,
    activeRate: daysTracked ? Math.round((activeDays / daysTracked) * 100) : 0,
    longestStreak,
    currentStreak,
    stagnationSpells,
    realmLayerGain,
    realmStart,
    realmEnd,
    strongestCategory,
    categoryRates,
    mostRebelliousAbandon,
    completionsInYear: completionsInYear.length,
    abandonmentsInYear: abandonmentsInYear.length,
    monthlyActivity,
  };
}

function radarChart(report: AnnualReport): string {
  // mermaid radar：六维完成率
  const axes = report.categoryRates;
  if (!axes.length) return '';
  const axisLabels = axes.map((a) => `"${a.label}"`).join(' ');
  const values = axes.map((a) => a.rate).join(' ');
  return [
    '```mermaid',
    'radar-beta',
    `    title 六维修为强度`,
    `    axis ${axisLabels}`,
    `    curve 年内 ["${report.year}"]{${values}}`,
    '```',
  ].join('\n');
}

function lineChart(report: AnnualReport): string {
  const pts = report.monthlyActivity
    .map((m) => `${m.month}月:${m.activeDays}`)
    .join(' ');
  if (!pts) return '';
  return [
    '```mermaid',
    'xychart-beta',
    '    title "月度活跃天数"',
    '    x-axis 月份',
    '    y-axis "活跃天数" 0 --> 31',
    `    bar ${pts}`,
    '```',
  ].join('\n');
}

function buildMarkdown(report: AnnualReport): string {
  const L: string[] = [];
  L.push(`# 竹林修仙传 · 年度修为报告 ${report.year}`);
  L.push('');
  L.push(`> 生成于 ${report.generatedAt} ｜ 数据全部存于本地 vault，零上传、零隐私风险。`);
  L.push('');
  if (report.isPartial) {
    L.push(`> ⚠️ 本年度尚未结束，以下为截至当前的进度快照（已修行 ${report.daysTracked} 天）。`);
    L.push('');
  }

  // 概览
  L.push('## 一、年度概览');
  L.push('');
  L.push(`- **活跃天数**：${report.activeDays} / ${report.daysTracked} 天（达标率 ${report.activeRate}%）`);
  L.push(`- **最长连胜**：${report.longestStreak} 天`);
  L.push(`- **当前连胜**：${report.currentStreak} 天`);
  L.push(`- **停摆次数**：${report.stagnationSpells} 次（连续 ${STAGNATION_THRESHOLD} 天无达标记 1 次）`);
  L.push(`- **走了几境**：年内境界突破 **${report.realmLayerGain} 层**`);
  L.push(
    `  - 年初：${report.realmStart ? `${report.realmStart.realm} 第 ${report.realmStart.layer} 层` : '—'}`,
  );
  L.push(
    `  - 年末：${report.realmEnd ? `${report.realmEnd.realm} 第 ${report.realmEnd.layer} 层` : '—'}`,
  );
  L.push(
    `- **最强维度**：${report.strongestCategory ? `${report.strongestCategory.label}（${report.strongestCategory.rate}%）` : '—'}`,
  );
  L.push(`- **达成目标**：${report.completionsInYear} 个 ｜ **放弃目标**：${report.abandonmentsInYear} 个`);
  L.push('');

  // 图表
  L.push('## 二、可视化');
  L.push('');
  L.push('### 月度活跃');
  L.push('');
  L.push(lineChart(report));
  L.push('');
  L.push('### 六维强度');
  L.push('');
  L.push(radarChart(report));
  L.push('');

  // 叙事卡片
  L.push('## 三、年度高光与暗礁');
  L.push('');
  if (report.mostRebelliousAbandon) {
    const a = report.mostRebelliousAbandon;
    L.push(
      `### 🔥 最叛逆的一次放弃：${a.title}`,
    );
    L.push('');
    L.push(
      `在仅完成 **${a.progressAtEvent}%** 时选择了放弃（${a.category} ｜ ${a.date}）。道心未稳，来日方长。`,
    );
  } else {
    L.push('### 🔥 最叛逆的一次放弃');
    L.push('');
    L.push('本年度暂无放弃记录 —— 心如磐石。');
  }
  L.push('');
  L.push(`### 🏔️ 最长连胜：${report.longestStreak} 天`);
  L.push('');
  L.push(report.longestStreak >= 30
    ? '一月有余未曾停摆，已具宗门长老之风。'
    : '连胜尚可加长，来年再战。');
  L.push('');
  L.push(`### 🕳️ 停摆黑洞：${report.stagnationSpells} 次`);
  L.push('');
  L.push(report.stagnationSpells === 0
    ? '全年无一次长停摆，修行从未断档。'
    : '每次停摆都是蓄势，复盘后重新提剑上路。');
  L.push('');

  // 维度明细
  L.push('## 四、六维明细');
  L.push('');
  L.push('| 维度 | 完成率 |');
  L.push('| --- | --- |');
  for (const c of report.categoryRates) {
    L.push(`| ${c.label} | ${c.rate}% |`);
  }
  L.push('');
  L.push('---');
  L.push('*本年报由「竹林修仙传」本地生成，可常驻 vault 留存、跨年对比。*');
  return L.join('\n');
}

/**
 * 生成年度报告：聚合 + 落盘 Markdown + 返回摘要（供 webapp 全屏页复用）。
 */
export async function generateAnnualReport(
  storage: { getAllDays(): Promise<Record<string, DayData>>; getGoals(): Promise<GoalItem[]>; getSetting(key: string): Promise<unknown>; putAnnualReport(year: number, md: string): Promise<string> },
  year: number,
): Promise<{ report: AnnualReport; markdownPath: string }> {
  const [allDays, goals, rawEvents] = await Promise.all([
    storage.getAllDays(),
    storage.getGoals(),
    storage.getSetting('lifeEvents'),
  ]);
  const events = Array.isArray(rawEvents) ? (rawEvents as LifeEvent[]) : [];
  const report = aggregate(year, allDays, goals, events);
  const markdown = buildMarkdown(report);
  const markdownPath = await storage.putAnnualReport(year, markdown);
  return { report, markdownPath };
}
