/**
 * @jest-environment jsdom
 *
 * 阶段1（收口）门面模块测试：
 * - createFacade 正常挂载与读取；
 * - register 重名时触发告警并记录 duplicate（重名守卫）；
 * - buildFacadeFromWindow 从来源复制已存在成员、跳过缺失成员。
 */
const { loadModule } = require('./__helpers__/testUtils');
const { createFacade, buildFacadeFromWindow } = loadModule('utils/facade.js', [
  'createFacade',
  'buildFacadeFromWindow',
]);

describe('WebApp Facade 门面', () => {
  test('register 正常挂载并可读取', () => {
    const f = createFacade();
    const store = { initPromise: Promise.resolve() };
    f.register('store', store);
    expect(f.get('store')).toBe(store);
    expect(f.toObject().store).toBe(store);
    expect(f.duplicates).toEqual([]);
  });

  test('重名挂载触发告警并记录 duplicate（重名守卫）', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const f = createFacade();
    f.register('store', { a: 1 });
    f.register('store', { a: 2 });
    expect(f.duplicates).toContain('store');
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('重名挂载 "store"')
    );
    spy.mockRestore();
  });

  test('buildFacadeFromWindow 从来源复制已存在的成员', () => {
    const fakeWin = {
      store: { v: 1 },
      Handlers: { v: 2 },
      Navigation: { v: 3 },
    };
    const f = buildFacadeFromWindow(
      ['store', 'Handlers', 'Navigation'],
      fakeWin
    );
    const obj = f.toObject();
    expect(obj.store).toBe(fakeWin.store);
    expect(obj.Handlers).toBe(fakeWin.Handlers);
    expect(obj.Navigation).toBe(fakeWin.Navigation);
  });

  test('buildFacadeFromWindow 跳过来源中缺失的成员（不报错）', () => {
    const fakeWin = { store: { v: 1 } };
    const f = buildFacadeFromWindow(['store', 'Missing'], fakeWin);
    const obj = f.toObject();
    expect(obj.store).toBeDefined();
    expect(obj.Missing).toBeUndefined();
    expect(f.duplicates).toEqual([]);
  });
});
