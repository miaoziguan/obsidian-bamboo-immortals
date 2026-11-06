/**
 * @jest-environment jsdom
 *
 * 便签 PNG 导出的编排回归锁：
 *  1) 必须读取 pngExportFolder（与 Markdown 的 noteExportFolder 解耦）；
 *  2) 生成后立刻调用 copyPng 自动复制到剪贴板；
 *  3) 复制失败时提示要明说「剪贴板不可用」，不能让用户以为已复制；
 *  4) 复制失败不影响落盘（PNG 仍写到 vault）。
 */
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
global.ModeController = { downloadPng: jest.fn() };
// 剥离 import 后 exportCardPng 由全局解析；这里替换为固定产物，避免依赖 canvas/SVG 渲染
global.exportCardPng = jest.fn(async () => ({ base64: 'iVBORw0KGgo=', width: 680, height: 682 }));

const { TypewriterFeature: feature } = loadModule(
  'handlers/features/typewriterFeature.js',
  ['TypewriterFeature'],
);

function makeHarness(overrides = {}) {
  const msgs = [];
  const storageManager = {
    getExportFolder: jest.fn(async (key, fallback) => (key === 'pngExportFolder' ? '画中卷/便签图片' : fallback)),
    exportPng: jest.fn(async () => ({ ok: true })),
    copyPng: jest.fn(async () => ({ ok: true, via: 'electron' })),
    ...overrides,
  };
  window.storageManager = storageManager;
  const card = document.createElement('div');
  card.dataset.id = 'n1';
  const ctx = Object.create(feature);
  ctx._notes = [{ id: 'n1', text: '解决用户体验问题' }];
  ctx._showScreenMsg = (m, d) => msgs.push({ m, d });
  return { ctx, card, msgs, storageManager };
}

beforeEach(() => {
  global.exportCardPng.mockClear();
  global.ModeController.downloadPng.mockClear();
});

test('使用 pngExportFolder 而非 noteExportFolder，并按该目录拼接路径', async () => {
  const { ctx, card, storageManager } = makeHarness();
  await ctx._exportCardPng(card);
  expect(storageManager.getExportFolder).toHaveBeenCalledWith('pngExportFolder', '便签');
  expect(storageManager.exportPng).toHaveBeenCalledTimes(1);
  const [path] = storageManager.exportPng.mock.calls[0];
  expect(path.startsWith('画中卷/便签图片/解决用户体验问题 ')).toBe(true);
  expect(path.endsWith('.png')).toBe(true);
});

test('导出成功后自动复制到剪贴板，且提示写明已复制', async () => {
  const { ctx, card, msgs, storageManager } = makeHarness();
  await ctx._exportCardPng(card);
  expect(storageManager.copyPng).toHaveBeenCalledWith('iVBORw0KGgo=');
  return Promise.resolve().then(() => {
    expect(msgs[msgs.length - 1].m).toContain('已复制到剪贴板');
  });
});

test('剪贴板不可用时明确提示，但 PNG 仍正常落盘', async () => {
  const { ctx, card, msgs, storageManager } = makeHarness({
    copyPng: jest.fn(async () => null),
  });
  await ctx._exportCardPng(card);
  expect(storageManager.exportPng).toHaveBeenCalledTimes(1);
  return Promise.resolve().then(() => {
    const last = msgs[msgs.length - 1].m;
    expect(last).toContain('剪贴板不可用');
    expect(last).not.toContain('已复制到剪贴板');
    // 提示里必须给出实际落盘路径，用户仍能找到图片
    expect(last).toContain('画中卷/便签图片/');
  });
});

test('copyPng 抛错不阻断导出（异常被吞掉、仍提示剪贴板不可用）', async () => {
  const { ctx, card, msgs, storageManager } = makeHarness({
    copyPng: jest.fn(async () => { throw new Error('bridge timeout'); }),
  });
  await expect(ctx._exportCardPng(card)).resolves.toBeUndefined();
  expect(storageManager.exportPng).toHaveBeenCalledTimes(1);
  return Promise.resolve().then(() => {
    expect(msgs[msgs.length - 1].m).toContain('剪贴板不可用');
  });
});

test('写盘失败回退浏览器下载，提示同时反映复制结果', async () => {
  const { ctx, card, msgs } = makeHarness({
    exportPng: jest.fn(async () => ({ ok: false })),
  });
  await ctx._exportCardPng(card);
  return Promise.resolve().then(() => {
    expect(global.ModeController.downloadPng).toHaveBeenCalledTimes(1);
    expect(msgs[msgs.length - 1].m).toContain('已通过浏览器下载保存 PNG');
  });
});
