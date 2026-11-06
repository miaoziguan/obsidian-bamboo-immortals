/**
 * @jest-environment jsdom
 *
 * 便签 PNG 导出的编排回归锁（三项菜单：save / copy / both）：
 *  1) 落盘必须读取 pngExportFolder（与 Markdown 的 noteExportFolder 解耦）；
 *  2) 动作未传时读原生设置 pngExportAction（默认 both，长按/右键走这条）；
 *  3) 各动作只做自己那一路副作用，绝不顺手多做一件；
 *  4) 复制失败时提示要明说「剪贴板不可用」，不能让用户以为已复制；
 *  5) 复制失败不影响落盘，写盘失败回退浏览器下载；任何失败都有可见提示。
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
    getExportAction: jest.fn(async () => 'both'),
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

// ===== 三项菜单：动作分派 =====
// 旧实现无条件「落盘 + 复制」，会让只想复制的用户平白多出一张文件、只想存档的用户
// 丢掉剪贴板里原有的文字。菜单把副作用交还给用户，以下用例锁住三种动作互不相犯。
test('仅导出到指定位置：不调用剪贴板，提示也不提剪贴板', async () => {
  const { ctx, card, msgs, storageManager } = makeHarness();
  await ctx._exportCardPng(card, 'save');
  expect(storageManager.exportPng).toHaveBeenCalledTimes(1);
  expect(storageManager.copyPng).not.toHaveBeenCalled();
  expect(msgs[msgs.length - 1].m).toContain('画中卷/便签图片/');
  expect(msgs[msgs.length - 1].m).not.toMatch(/剪贴板/);
});

test('仅复制到剪贴板：不落盘、不读目录、不触发浏览器下载', async () => {
  const { ctx, card, msgs, storageManager } = makeHarness();
  await ctx._exportCardPng(card, 'copy');
  expect(storageManager.copyPng).toHaveBeenCalledWith('iVBORw0KGgo=');
  expect(storageManager.exportPng).not.toHaveBeenCalled();
  expect(storageManager.getExportFolder).not.toHaveBeenCalled();
  expect(global.ModeController.downloadPng).not.toHaveBeenCalled();
  expect(msgs[msgs.length - 1].m).toBe('已复制到剪贴板');
});

test('仅复制但剪贴板不可用：不假装成功，给出可执行的替代建议', async () => {
  const { ctx, card, msgs, storageManager } = makeHarness({ copyPng: jest.fn(async () => null) });
  await ctx._exportCardPng(card, 'copy');
  expect(storageManager.exportPng).not.toHaveBeenCalled();
  expect(msgs[msgs.length - 1].m).toContain('剪贴板不可用');
  expect(msgs[msgs.length - 1].m).toContain('导出到指定位置');
  expect(msgs[msgs.length - 1].m).not.toContain('已复制到剪贴板');
});

test('动作未传（长按/右键走默认）→ 读原生设置 pngExportAction', async () => {
  const { ctx, card, storageManager } = makeHarness({ getExportAction: jest.fn(async () => 'copy') });
  await ctx._exportCardPng(card);
  expect(storageManager.getExportAction).toHaveBeenCalledWith('pngExportAction', 'both');
  expect(storageManager.exportPng).not.toHaveBeenCalled();
  expect(storageManager.copyPng).toHaveBeenCalledTimes(1);
});

test('脏值动作回退到设置值，绝不变成空操作', async () => {
  const { ctx, card, storageManager } = makeHarness();
  await ctx._exportCardPng(card, 'nope');
  expect(storageManager.getExportAction).toHaveBeenCalledTimes(1);
  expect(storageManager.exportPng).toHaveBeenCalledTimes(1);
  expect(storageManager.copyPng).toHaveBeenCalledTimes(1);
});

test('任意动作都只截图一次（2x foreignObject 是最贵的一步）', async () => {
  const { ctx, card } = makeHarness();
  await ctx._exportCardPng(card, 'both');
  expect(global.exportCardPng).toHaveBeenCalledTimes(1);
});
