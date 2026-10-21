const { loadModule } = require('./__helpers__/testUtils.js');

const { ModePolicy } = loadModule('handlers/features/modePolicy.js', ['ModePolicy']);

describe('ModePolicy 收敛（第 4 步：消灭散落的 mode === "write" 分支）', () => {
  test('manualCardSize：仅便签档可手动调尺寸（拖角手柄）', () => {
    expect(ModePolicy.manualCardSize('notes')).toBe(true);
    expect(ModePolicy.manualCardSize('write')).toBe(false);   // 写作档尺寸由内容决定
    expect(ModePolicy.manualCardSize('mindmap')).toBe(false);
  });

  test('skipCull：仅写作档豁免剔除（小文档常驻挂载，避免闪烁）', () => {
    // WRITE_NO_CULL_MAX = 300
    expect(ModePolicy.skipCull('write', 300)).toBe(true);
    expect(ModePolicy.skipCull('write', 301)).toBe(false);
    // 便签 / 导图：noCullMax = 0 → 一律按视口剔除，不豁免
    expect(ModePolicy.skipCull('notes', 99999)).toBe(false);
    expect(ModePolicy.skipCull('mindmap', 99999)).toBe(false);
  });

  test('ownsStickers：仅便签档拥有贴纸/装饰层（materialMarket.syncDecoLayer 已改读它）', () => {
    expect(ModePolicy.ownsStickers('notes')).toBe(true);
    expect(ModePolicy.ownsStickers('write')).toBe(false);
    expect(ModePolicy.ownsStickers('mindmap')).toBe(false);
  });

  test('linksDefineOrder：仅写作档连线参与顺序推导（ViewportCuller 剔除后刷新顺序已改读它）', () => {
    expect(ModePolicy.linksDefineOrder('notes')).toBe(false);
    expect(ModePolicy.linksDefineOrder('write')).toBe(true);
    expect(ModePolicy.linksDefineOrder('mindmap')).toBe(false);
  });
});
