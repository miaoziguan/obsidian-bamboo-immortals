/**
 * @jest-environment jsdom
 */
// 布局「恢复纵向 → 回到右栏」契约回归测试（源码级）。
//
// 设计意图（用户明确）：面板因多列布局从右栏移到中央后，无论是否重启 Obsidian，
// 退出多列（点「恢复纵向」）都应回到右栏——即「回到来处」语义跨重启成立。
// 因此 cameFromSidebar 必须：
//  1. 写进 getState() 随 workspace 布局持久化（否则重启后丢失，回到来处失效）；
//  2. 由 moveViewToCenter 通过 setViewState 显式传入 true（同会话迁移通道）；
//  3. moveToSidebar 以它为守卫（只有「确实来自侧栏」才移回）。
// 这三条缺一不可，测试锁定之，防止将来被误当 bug 改掉。
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', '..', 'src', 'views', 'DailyReviewView.ts'),
  'utf8'
);

function getStateBlock() {
  const start = src.indexOf('getState(): Record<string, unknown> {');
  if (start < 0) throw new Error('getState 签名未找到');
  const end = src.indexOf('\n  async setState', start);
  return src.slice(start, end < 0 ? start + 300 : end);
}

describe('布局「恢复纵向」回到来处契约', () => {
  test('getState() 持久化 cameFromSidebar（跨重启「回到来处」的前提）', () => {
    const block = getStateBlock();
    expect(block).toContain('pendingLayoutMode');
    expect(block).toContain('cameFromSidebar');
  });

  test('同会话迁移通道：moveViewToCenter 显式传入 cameFromSidebar: true', () => {
    const i = src.indexOf('targetLeaf.setViewState(');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(src.slice(i, i + 220)).toContain('cameFromSidebar: true');
  });

  test('moveToSidebar 以 cameFromSidebar 为守卫（只有来自侧栏才移回）', () => {
    expect(src).toContain('if (!this.cameFromSidebar) return;');
  });
});
