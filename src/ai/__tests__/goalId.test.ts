import { describe, it, expect } from 'vitest';
import { deriveStableGoalId } from '../goalId';

describe('deriveStableGoalId', () => {
  it('相同 seed 输出稳定（纯函数）', () => {
    const seed = 'notes/目标.md|健康减重';
    expect(deriveStableGoalId(seed)).toBe(deriveStableGoalId(seed));
  });

  it('不同 seed 输出不同 id', () => {
    const a = deriveStableGoalId('notes/a.md|目标A');
    const b = deriveStableGoalId('notes/a.md|目标B');
    expect(a).not.toBe(b);
  });

  it('id 以 goal_ 前缀且为 36 进制短串', () => {
    const id = deriveStableGoalId('notes/x.md|标题');
    expect(id.startsWith('goal_')).toBe(true);
    expect(id.length).toBeLessThan(20);
  });

  it('空串 seed 仍稳定且非碰撞（不同长度区分）', () => {
    expect(deriveStableGoalId('')).toBe(deriveStableGoalId(''));
    expect(deriveStableGoalId('')).not.toBe(deriveStableGoalId('a'));
  });
});
