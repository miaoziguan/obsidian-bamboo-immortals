/**
 * @jest-environment jsdom
 */
// 拖拽帧间隔探针（utils/dragPerf.js）的行为契约。
// 事故背景：用户反馈「贴纸拖久了就卡」，但开发者新开会话复现不出来 —— 缺的是现场数据。
// 探针负责把一次拖动变成 p50/p90/max/掉帧数，超阈值时出声（每会话一次），且绝不影响功能。
const { loadModule } = require('./__helpers__/testUtils');

const { DragPerf } = loadModule('utils/dragPerf.js', ['DragPerf']);

describe('DragPerf：拖拽期帧间隔探针', () => {
  let rafCb = null;
  let rafId = 0;
  let clock = 0;
  const origRaf = global.requestAnimationFrame;
  const origCaf = global.cancelAnimationFrame;

  beforeEach(() => {
    DragPerf.reset();
    DragPerf.setEnabled(true);
    rafCb = null;
    rafId = 0;
    clock = 0;
    global.requestAnimationFrame = (cb) => { rafCb = cb; return ++rafId; };
    global.cancelAnimationFrame = () => { rafCb = null; };
    jest.spyOn(performance, 'now').mockImplementation(() => clock);
    global.Toast = { showToast: jest.fn() };
  });

  afterEach(() => {
    global.requestAnimationFrame = origRaf;
    global.cancelAnimationFrame = origCaf;
    delete global.Toast;
    jest.restoreAllMocks();
  });

  /** 推进时钟到 at 并跑一帧（模拟 rAF 回调） */
  function frame(at) {
    clock = at;
    const cb = rafCb;
    rafCb = null;
    if (cb) cb();
  }

  test('begin 后逐帧采样，end 汇总 p50/p90/max 与掉帧数（丢弃含准备成本的首帧）', () => {
    DragPerf.begin();                 // ts = 0，挂上第一帧
    frame(16);                        // gap 16
    frame(32);                        // gap 16
    frame(82);                        // gap 50
    const rec = DragPerf.end();
    expect(rec).toEqual({ n: 2, p50: 16, p90: 50, max: 50, dropped: 1 });
    expect(DragPerf.last()).toEqual(rec);
  });

  test('没有采到帧（极短拖动 / 未挂 rAF）→ end 返回 null，不入历史', () => {
    DragPerf.begin();
    expect(DragPerf.end()).toBeNull();
    expect(DragPerf.all()).toEqual([]);
  });

  test('未 begin 就 end：静默返回 null，不抛', () => {
    expect(DragPerf.end()).toBeNull();
  });

  test('超过阈值才出声：console.warn + Toast，且 Toast 每会话只提示一次', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // 两次都卡：p90 都是 50ms（> 24ms 阈值）
    for (let i = 0; i < 2; i++) {
      DragPerf.begin();
      frame(i * 1000 + 16);
      frame(i * 1000 + 82);
      DragPerf.end();
    }
    expect(global.Toast.showToast).toHaveBeenCalledTimes(1);   // 防刷屏
    expect(warn).toHaveBeenCalledTimes(2);                     // 但每次仍记录，便于事后取证
  });

  test('流畅拖动（p90 16ms）不出声', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    DragPerf.begin();
    frame(16);
    frame(32);
    frame(48);
    const rec = DragPerf.end();
    expect(rec.dropped).toBe(0);
    expect(warn).not.toHaveBeenCalled();
    expect(global.Toast.showToast).not.toHaveBeenCalled();
  });

  test('关闭采样后 begin 不挂 rAF，也不产生样本', () => {
    DragPerf.setEnabled(false);
    DragPerf.begin();
    expect(rafCb).toBeNull();
    expect(DragPerf.end()).toBeNull();
    expect(DragPerf.all()).toEqual([]);
  });

  test('上一次没正常收尾（手势被吞）时再次 begin：先收掉旧循环，不双开', () => {
    DragPerf.begin();
    frame(16);
    DragPerf.begin();                 // 旧样本 gaps=[16] → 丢首帧后为空 → 不入历史
    expect(DragPerf.all()).toEqual([]);
    frame(100);
    const rec = DragPerf.end();
    expect(rec).toBeNull();           // 只剩一帧，丢首帧后无样本
  });

  test('report：空历史返回 n=0；有样本时给出 avgP90 与逐次明细', () => {
    expect(DragPerf.report()).toEqual({ n: 0, rows: [], avgP90: 0 });
    DragPerf.begin(); frame(16); frame(32); frame(48); DragPerf.end();
    DragPerf.begin(); frame(60); frame(76); frame(92); DragPerf.end();
    const rep = DragPerf.report();
    expect(rep.n).toBe(2);
    expect(rep.avgP90).toBeCloseTo(16, 5);
    expect(rep.rows.every((r) => typeof r.p90 === 'number')).toBe(true);
  });

  test('环形缓冲上限 20：不会随会话无限增长', () => {
    for (let i = 0; i < 25; i++) {
      DragPerf.begin();
      frame(i * 100 + 16);
      frame(i * 100 + 32);
      DragPerf.end();
    }
    expect(DragPerf.all().length).toBe(20);
  });
});
