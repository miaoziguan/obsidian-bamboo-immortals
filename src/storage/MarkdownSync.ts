/**
 * MarkdownSync - 将 DayData JSON 转换为可读的 Markdown 摘要
 */
import type { DayData } from '../types/data';

export class MarkdownSync {
  /** 将 DayData 转换为 Markdown */
  static generateMarkdown(data: DayData): string {
    const lines: string[] = [];

    // frontmatter（动态值用双引号包裹防止 YAML 注入）
    lines.push('---');
    lines.push(`date: "${data.date}"`);
    lines.push(`weekday: "${data.weekday}"`);
    lines.push('type: Bamboo Immortals');
    lines.push('---');
    lines.push('');

    // 标题
    lines.push(`# ${data.date} ${data.weekday}复盘`);
    lines.push('');

    // 指标
    if (data.metrics) {
      lines.push('## 指标');
      const m = data.metrics;
      const parts: string[] = [];
      if (m.firstCheckIn) parts.push(`首次打卡: ${m.firstCheckIn}`);
      if (m.lastCheckIn) parts.push(`末次打卡: ${m.lastCheckIn}`);
      if (m.completedTasks) parts.push(`完成任务: ${m.completedTasks}`);
      if (m.inspirationCount) parts.push(`灵感: ${m.inspirationCount}`);
      if (m.activeTime) parts.push(`活跃时长: ${m.activeTime}`);
      if (m.emptySlots) parts.push(`空白时段: ${m.emptySlots}`);

      if (parts.length > 0) {
        lines.push(`- ${parts.slice(0, 2).join(' | ')}`);
        if (parts.length > 2) {
          lines.push(`- ${parts.slice(2).join(' | ')}`);
        }
      }
      lines.push('');
    }

    // 时间线
    if (data.timeline && data.timeline.length > 0) {
      lines.push('## 时间线');
      for (const block of data.timeline) {
        const icon = block.icon ? `${block.icon} ` : '';
        lines.push(`### ${icon}${block.name} (${block.time})`);
        if (block.items) {
          for (const item of block.items) {
            const evalStr = item.eval ? ` - ${item.eval}` : '';
            lines.push(`- ${item.time} ${item.task}${evalStr}`);
          }
        }
        lines.push('');
      }
    }

    // 目标进度
    if (data.goals && data.goals.length > 0) {
      lines.push('## 目标进度');
      for (const goal of data.goals) {
        const icon = goal.icon ? `${goal.icon} ` : '';
        lines.push(`### ${icon}${goal.title}`);
        if (goal.items) {
          for (const item of goal.items) {
            const percent = item.percent !== undefined ? ` ${item.percent}%` : '';
            const detail = item.detail ? ` (${item.detail})` : '';
            lines.push(`- ${item.name}${percent}${detail}`);
          }
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
