import { describe, it, expect } from 'vitest';
import { shouldSkipPlanned } from '../idempotency';

describe('shouldSkipPlanned', () => {
  it('plannedIds 为 undefined → 不跳过（允许写入）', () => {
    expect(shouldSkipPlanned(undefined, new Set(['g1']))).toBe(false);
  });

  it('plannedIds 为空数组 → 不跳过', () => {
    expect(shouldSkipPlanned([], new Set(['g1']))).toBe(false);
  });

  it('全部目标仍存在 → 跳过（幂等命中）', () => {
    const existing = new Set(['g1', 'g2', 'g3']);
    expect(shouldSkipPlanned(['g1', 'g2'], existing)).toBe(true);
  });

  it('存在部分目标丢失 → 不跳过（允许重写恢复，锁住“丢失可重写”修复）', () => {
    const existing = new Set(['g1']);
    expect(shouldSkipPlanned(['g1', 'g2'], existing)).toBe(false);
  });

  it('全部目标丢失 → 不跳过', () => {
    expect(shouldSkipPlanned(['g1', 'g2'], new Set())).toBe(false);
  });
});
