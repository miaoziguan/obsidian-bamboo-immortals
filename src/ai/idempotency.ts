/**
 * AI 规划幂等判定（纯函数、零依赖，便于单测）。
 *
 * 同一笔记 + 相同内容已规划过，且仅当那些目标「仍全部存在于目标库」时才可跳过；
 * 只要有一个目标已丢失（被清/被删），就允许重新写入以恢复——
 * 否则“已规划过”会永久阻塞恢复，表现为「写入了但不显示/丢失」。
 */
export function shouldSkipPlanned(
  plannedIds: string[] | undefined,
  existingIds: Set<string>
): boolean {
  if (!plannedIds || plannedIds.length === 0) return false;
  return plannedIds.every((id) => existingIds.has(id));
}
