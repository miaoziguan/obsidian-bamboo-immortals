/**
 * @jest-environment jsdom
 */
// 回归：恢复期（mount 里 await _restore() 期间）按回车不能被静默丢弃。
// 旧行为：restore 末尾 ctrl._notes = 磁盘数据 + 全量重建 DOM，
//        用户「打开即打字」时打出的卡会被覆盖，凭空消失。
// 新行为：_restoring 期间挂起（不清空输入框），恢复完成后 _flushPendingPrint() 补打一次。
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = {
  isActive: () => false,
  addNodeFromInput: () => true,
  stats: () => ({ count: 0, depth: 0 })
};
// 副作用：把共享常量挂到 globalThis（loadModule 会剥离 import）
loadModule('handlers/features/twConfig.js', []);

const { TypewriterFeature: feature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);

describe('恢复期打印不被覆盖丢失', () => {
  let origSpawn;

  beforeEach(() => {
    feature._state = { mode: 'notes' };
    feature._input = { value: '测试文字', focus() {} };
    feature._restoring = true;
    feature._pendingPrint = false;
    origSpawn = feature._spawn;
  });

  afterEach(() => {
    feature._spawn = origSpawn;
  });

  test('恢复期：挂起、不产出、不清空输入框', () => {
    const spawn = jest.fn();
    feature._spawn = spawn;

    feature._commitInput();

    expect(spawn).not.toHaveBeenCalled();
    expect(feature._pendingPrint).toBe(true);
    expect(feature._input.value).toBe('测试文字');   // 文本必须保留，否则等于丢内容
  });

  test('恢复完成：补打一次，且只补一次', () => {
    const spawn = jest.fn(() => ({ dataset: { id: 'n1' } }));
    feature._spawn = spawn;

    feature._commitInput();        // 恢复期按下回车
    feature._restoring = false;
    feature._flushPendingPrint();  // 恢复完成补打

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith('测试文字');
    expect(feature._pendingPrint).toBe(false);

    feature._flushPendingPrint();  // 再次调用不应重复打印
    expect(spawn).toHaveBeenCalledTimes(1);
  });

  test('非恢复期：直接打印，不挂起', () => {
    const spawn = jest.fn();
    feature._spawn = spawn;
    feature._restoring = false;

    feature._commitInput();

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(feature._pendingPrint).toBe(false);
  });
});
