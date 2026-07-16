/**
 * 确定性目标 ID 派生（纯函数、零依赖，便于单测）。
 *
 * 用稳定哈希（FNV-1a 32 位）从 seed 生成 id。
 * 目的：同一笔记 + 同一标题重新规划时，ID 稳定不变；writeAiGoals 按 id 合并即“原地更新”
 * 而非“追加重复”，根治「重复规划 → 目标越积越多」。
 */

/** FNV-1a 32 位哈希，返回无符号 16 进制短串 */
function fnv1a(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/**
 * 从 seed（建议 `file.path + '|' + title`）派生稳定的目标 id。
 * 相同 seed 必得相同 id；不同 seed 极小概率碰撞（32 位哈希）。
 */
export function deriveStableGoalId(seed: string): string {
  return `goal_${fnv1a(seed)}`;
}
