/**
 * @jest-environment jsdom
 */
// 模式切换「产品级核心路径」集成测试。
//
// 背景（测试盲区）：80 个测试里最大一块是渲染/剔除细节（typewriterCulling 单文件 59 例），
// 而模式切换这条用户每晚会走几十遍的路径只有边界表 + 锁类回归：
//   · 旋钮连拨的 _pendingModeDir 累积与接续 —— 零测试
//   · setMode 主流程顺序（清场→摘 SVG→loadDoc→reset 撤销栈）—— 零测试
//   · 非旋钮路径在 _switching 窗口内的静默丢弃 —— 零测试
// 这些都是「靠注释维持」的契约，本文件把它们变成可检测的断言。
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);   // 副作用：共享常量挂 globalThis
const mp = loadModule('handlers/features/modePolicy.js', ['ModePolicy']);
global.ModePolicy = mp.ModePolicy;
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);
global.TypewriterStore = { setMode: jest.fn().mockResolvedValue(true) };
// 导图层：setMode 的两条分支都会碰它
global.MindmapFeature = {
  activate: jest.fn(),
  deactivate: jest.fn(),
  // 导图档**独立**的撤销栈（与卡片档 ctrl._undoStack 是两份历史）
  _undoStack: { reset: jest.fn() },
};

// 全局 mock 的调用计数会跨用例累积，逐个用例清零
beforeEach(() => {
  global.MindmapFeature.activate.mockClear();
  global.MindmapFeature.deactivate.mockClear();
  global.MindmapFeature._undoStack.reset.mockClear();
  global.TypewriterStore.setMode.mockClear();
  global.TypewriterStore.setMode.mockResolvedValue(true);
});

/** 造一个可观测的 ctrl：把每个关键步骤记进 calls，顺序即可断言 */
function makeCtrl(startMode = 'notes') {
  const calls = [];
  const knob = document.createElement('div');
  knob.id = 'twKnob';
  const el = document.createElement('div');
  el.appendChild(knob);
  // 机身键（applyModeChrome 要按策略表刷它们的 title/aria/disabled）
  ['twPaper', 'twFont', 'twArrange', 'twPrint'].forEach((id) => {
    const b = document.createElement('button');
    b.id = id;
    el.appendChild(b);
  });
  const canvas = document.createElement('div');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  canvas.appendChild(svg);
  const card = document.createElement('div');
  card.className = 'tw-card';
  canvas.appendChild(card);
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 });
  canvas.querySelectorAll = ((sel) =>
    sel === 'svg' ? [svg] : (sel === '.tw-card' ? [card] : []));

  return {
    _el: el, _canvas: canvas, _mode: startMode,
    _input: document.createElement('input'),
    _draft: {}, _switching: false, _pendingModeDir: 0, _saveTimer: null,
    _undoStack: { reset: jest.fn(() => calls.push('undoReset')) },
    _ensureDocCorner: jest.fn(),
    _refreshScreenMeta: jest.fn(),
    calls,
    _ensureAudio: jest.fn(() => calls.push('audio')),
    _playGearSound: jest.fn(() => calls.push('gearSound')),
    _persistDoc: jest.fn(async () => calls.push('persistDoc')),
    _exitAllEdits: jest.fn(() => calls.push('exitAllEdits')),
    _clearSelection: jest.fn(() => calls.push('clearSelection')),
    _parkStickers: jest.fn(async () => calls.push('parkStickers')),
    _refreshModeScope: jest.fn(() => calls.push('refreshModeScope')),
    _applyModeChrome: jest.fn(() => calls.push('applyModeChrome')),
    _buildCards: jest.fn(() => calls.push('buildCards')),
    _loadDoc: jest.fn(async () => calls.push('loadDoc')),
    _reloadStickers: jest.fn(async () => calls.push('reloadStickers')),
    _scheduleRenderLinks: jest.fn(() => calls.push('renderLinks')),
    _showScreenMsg: jest.fn(),
  };
}

describe('旋钮连拨：净步数累积与接续', () => {
  test('切换窗口内的连拨不静默丢弃，而是累积净步数', () => {
    const ctrl = makeCtrl('notes');
    ctrl._switching = true;                       // 模拟正在切档
    ModeController.cycleMode({ state: {}, ctrl }, 1);
    ModeController.cycleMode({ state: {}, ctrl }, 1);
    ModeController.cycleMode({ state: {}, ctrl }, -1);
    expect(ctrl._pendingModeDir).toBe(1);         // 1+1-1 = 净 1 步
    expect(ctrl._mode).toBe('notes');             // 窗口内不真的切
  });

  test('非切换窗口：cycleMode 直接拨到下一档', () => {
    const ctrl = makeCtrl('notes');
    ctrl._setMode = jest.fn();
    ModeController.cycleMode({ state: {}, ctrl }, 1);
    expect(ctrl._setMode).toHaveBeenCalledWith('write');
    expect(ctrl._pendingModeDir).toBe(0);         // 未累积
  });

  test('后退方向累积负步数', () => {
    const ctrl = makeCtrl('write');
    ctrl._switching = true;
    ModeController.cycleMode({ state: {}, ctrl }, -1);
    ModeController.cycleMode({ state: {}, ctrl }, -1);
    expect(ctrl._pendingModeDir).toBe(-2);
  });
});

describe('setMode 的 _switching 契约', () => {
  test('非旋钮路径在切换窗口内被静默丢弃（不累积、不抛错）', async () => {
    const ctrl = makeCtrl('notes');
    ctrl._switching = true;
    await ModeController.setMode({ state: {}, ctrl }, 'mindmap');
    expect(ctrl._mode).toBe('notes');             // 未切换
    expect(ctrl._pendingModeDir).toBe(0);         // 也不累积（与旋钮路径刻意不同）
  });

  test('非法档位 / 目标即当前档 → 直接返回', async () => {
    const ctrl = makeCtrl('notes');
    await ModeController.setMode({ state: {}, ctrl }, 'nope');
    expect(ctrl._mode).toBe('notes');
    await ModeController.setMode({ state: {}, ctrl }, 'notes');
    expect(ctrl._mode).toBe('notes');
  });

  test('【顺序】先退出编辑、再落盘（否则半截编辑既不进存档、又被 _loadDoc 覆盖）', async () => {
    // 根因：文本是「退出编辑时才写进模型」的（CardInteractions.exitEdit 里的 WritingDoc.setText）。
    // 原先 setMode 先 _persistDoc 后 _exitAllEdits：这次编辑既没进本档存档，随后 _loadDoc 又用
    // 新档卡片覆盖 _notes → 丢失。与 switchWritingGroup 的正确顺序（先 exit 再 persist）对齐。
    const ctrl = makeCtrl('notes');
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    const iEdit = ctrl.calls.indexOf('exitAllEdits');
    const iPersist = ctrl.calls.indexOf('persistDoc');
    expect(iEdit).toBeGreaterThanOrEqual(0);      // 确实退出了编辑
    expect(iPersist).toBeGreaterThanOrEqual(0);   // 确实落了盘
    expect(iEdit).toBeLessThan(iPersist);         // 且退出编辑在前
  });

  test('_loadDoc 抛错也必须解锁（finally 保证，否则旋钮永久锁死）', async () => {
    const ctrl = makeCtrl('notes');
    ctrl._loadDoc = jest.fn(async () => { throw new Error('读盘失败'); });
    await expect(ModeController.setMode({ state: {}, ctrl }, 'write')).rejects.toThrow('读盘失败');
    expect(ctrl._switching).toBe(false);          // 已解锁
  });

  test('切档成功后消费累积的净步数并接续（3 档循环按净步数落地）', async () => {
    const ctrl = makeCtrl('notes');
    ctrl._pendingModeDir = 1;                     // 切档期间又拨了 1 齿
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    expect(ctrl._pendingModeDir).toBe(0);         // 已消费
    expect(ctrl._mode).toBe('mindmap');           // write 再接续 1 齿 → mindmap
    // 接续的 setMode 是 fire-and-forget（finally 里未 await），需让微任务链跑完再断言副作用
    await new Promise((r) => setTimeout(r, 0));
    expect(ctrl._loadDoc).toHaveBeenCalledTimes(1);       // 首次：write 档载入
    expect(global.MindmapFeature.activate).toHaveBeenCalledTimes(1);  // 接续落点是导图分支
  });

  test('净 2 步在 3 档循环里走 2 格回到起点（接续不是只拨一齿）', async () => {
    const ctrl = makeCtrl('notes');
    ctrl._pendingModeDir = 2;
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    expect(ctrl._pendingModeDir).toBe(0);
    expect(ctrl._mode).toBe('notes');             // notes→write→mindmap→notes
    expect(ctrl._loadDoc).toHaveBeenCalledTimes(2);
  });
});

describe('setMode 主流程顺序（卡片档）', () => {
  test('便签 → 写作：落盘旧档 → 同步清场 → 载入新档 → reset 撤销栈', async () => {
    const ctrl = makeCtrl('notes');
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    expect(ctrl.calls).toEqual([
      'audio', 'gearSound',
      // ① 先退出编辑、再落盘：文本是退出编辑时才写进模型的，顺序颠倒会让半截编辑不进存档
      //    （原先这里固化的是 persistDoc → exitAllEdits 的错误顺序，已修）
      'exitAllEdits', 'persistDoc',
      'clearSelection',
      'parkStickers',      // ② 档位所有权：离开便签档「停放」贴纸（仅隐藏，不销毁；切回免重建）
      'refreshModeScope',  // ③ 外观先于载入生效
      'applyModeChrome',   // ④ chrome 先行（空窗期不露上一档外壳）
      'buildCards',        // ⑤ 同步清场：露空画布而非上一份文档
      'loadDoc',           // ⑥ 载入新档文档
      'undoReset',         // ⑦ 两份卡片文档的历史不该串味
      'applyModeChrome',   // ⑧ 载入后再刷一次（计数取新文档真值）
      'renderLinks',
    ]);
    expect(ctrl._mode).toBe('write');
    expect(ctrl._canvas.hidden).toBe(false);
  });

  test('离开便签档要「停放」贴纸（档位所有权：只隐藏不销毁，切回免重建）', async () => {
    const ctrl = makeCtrl('notes');
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    expect(ctrl._parkStickers).toHaveBeenCalledTimes(1);
  });

  test('切回便签档要重建贴纸', async () => {
    const ctrl = makeCtrl('write');
    await ModeController.setMode({ state: {}, ctrl }, 'notes');
    expect(ctrl._reloadStickers).toHaveBeenCalledTimes(1);
  });

  test('进导图档：隐藏卡片画布 + 激活导图层（不 reset 卡片撤销栈）', async () => {
    const ctrl = makeCtrl('notes');
    await ModeController.setMode({ state: {}, ctrl }, 'mindmap');
    expect(ctrl._canvas.hidden).toBe(true);
    expect(global.MindmapFeature.activate).toHaveBeenCalledTimes(1);
    expect(ctrl._undoStack.reset).not.toHaveBeenCalled();   // 走的是导图分支
    expect(ctrl._loadDoc).not.toHaveBeenCalled();
  });

  /**
   * P2-7 契约：撤销栈的**刻意不对称**（不是缺陷，是设计）。
   *
   * · 卡片档（notes/write）共用同一个 ctrl._undoStack，且两份文档不同 → 切档必须 reset，
   *   否则栈里旧文档的快照会在新文档被 undo 回去 = 文档串味（见上一条用例）。
   * · 导图档有**自己**的一份历史（MindmapFeature._undoStack），跨档保留：
   *   在导图里做的一串操作，切走再切回仍可继续撤销。
   *
   * 这条用例锁住后半句，避免将来「统一成切档一律 reset」时把导图的历史误清空。
   */
  test('切档进出导图档：不清空导图自己的撤销栈（与卡片档 reset 形成刻意对照）', async () => {
    const ctrl = makeCtrl('notes');

    await ModeController.setMode({ state: {}, ctrl }, 'mindmap');   // 进导图档
    expect(global.MindmapFeature._undoStack.reset).not.toHaveBeenCalled();

    const ctrl2 = makeCtrl('mindmap');
    await ModeController.setMode({ state: {}, ctrl: ctrl2 }, 'notes');  // 离开导图档
    expect(global.MindmapFeature._undoStack.reset).not.toHaveBeenCalled();
  });

  test('离开导图档：deactivate 导图层', async () => {
    const ctrl = makeCtrl('mindmap');
    await ModeController.setMode({ state: {}, ctrl }, 'notes');
    expect(global.MindmapFeature.deactivate).toHaveBeenCalledTimes(1);
  });

  test('草稿按档位各自带走（离开时存、进入时由 applyModeChrome 恢复）', async () => {
    const ctrl = makeCtrl('notes');
    ctrl._input.value = '便签草稿';
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    expect(ctrl._draft.notes).toBe('便签草稿');   // 以被离开的档为键
  });

  test('取消挂起的防抖落盘（防「新档 key + 旧档数据」串味）', async () => {
    const ctrl = makeCtrl('notes');
    const spy = jest.spyOn(global, 'clearTimeout');
    ctrl._saveTimer = 12345;
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    expect(spy).toHaveBeenCalledWith(12345);
    expect(ctrl._saveTimer).toBeNull();
    spy.mockRestore();
  });

  test('档位选择持久化（best-effort，失败不阻断切换）', async () => {
    const ctrl = makeCtrl('notes');
    global.TypewriterStore.setMode.mockRejectedValueOnce(new Error('boom'));
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    expect(ctrl._mode).toBe('write');             // 持久化失败不影响切换本身
  });
});

// 撤销栈「三档不对称」是设计约束的必然结果，不是疏漏 —— 本组把它固化为契约。
//   · notes/write 共用同一个 _undoStack（共模型、共画布、共 NotesState）→ 切档必须 reset，
//     否则栈里旧档的快照会在新档被 undo 回去 = 文档串味。
//   · mindmap 持自己独立的 UndoStack（独立文档/独立层/独立落盘）→ 不存在串味风险，
//     故历史可跨档保留（拨走再拨回仍能撤销之前的操作）。
// 用户可感知的不一致暂按「显式契约」处理而非强行统一：要统一就得把 notes/write 也拆成
// 各自独立的栈（动 B5 状态结构，风险高于收益）。
describe('撤销栈语义契约', () => {
  test('notes ⇄ write 互切：每次都 reset（共栈防串味）', async () => {
    const ctrl = makeCtrl('notes');
    await ModeController.setMode({ state: {}, ctrl }, 'write');
    expect(ctrl._undoStack.reset).toHaveBeenCalledTimes(1);
    ctrl._undoStack.reset.mockClear();
    ctrl._mode = 'write';
    await ModeController.setMode({ state: {}, ctrl }, 'notes');
    expect(ctrl._undoStack.reset).toHaveBeenCalledTimes(1);
  });

  test('进/出导图档都不碰卡片撤销栈（导图历史由它自己的栈管）', async () => {
    const ctrl = makeCtrl('notes');
    await ModeController.setMode({ state: {}, ctrl }, 'mindmap');
    expect(ctrl._undoStack.reset).not.toHaveBeenCalled();
    ctrl._mode = 'mindmap';
    await ModeController.setMode({ state: {}, ctrl }, 'notes');
    // 回到 notes 这一次仍会 reset（进卡片档的统一规则），但导图期间的历史未被清
    expect(ctrl._undoStack.reset).toHaveBeenCalledTimes(1);
    expect(global.MindmapFeature.deactivate).toHaveBeenCalled();
  });
});

// 机身键「永不置灰」契约。
// 2026-10-14 更正：原注释称「纸样/字体/排版只对便签有意义，导图模式下必须置灰」——
// 那是 ModePolicy 策略表上线前的过时描述。三档经表分派后各有真实动作
// （导图：子弹样式 / 导出落库 / 曲线⇄直线），置灰反而是功能倒退。
describe('机身键三档永可用', () => {
  test('paper/font/arrange 在三档下均 enabled，且 title/aria 随策略表切换', async () => {
    const seen = {};
    for (const mode of ['notes', 'write', 'mindmap']) {
      const ctrl = makeCtrl(mode);
      await ModeController.setMode({ state: {}, ctrl }, mode === 'notes' ? 'write' : mode);
      // 直接测 applyModeChrome（setMode 内部已调，这里单独验证三档各自的状态）
      const c2 = makeCtrl(mode);
      ModeController.applyModeChrome({ state: {}, ctrl: c2 });
      ['paper', 'font', 'arrange'].forEach((k) => {
        const el = c2._el.querySelector('#tw' + k[0].toUpperCase() + k.slice(1));
        expect(el.disabled).toBe(false);
        const P = ModePolicy.of(mode);       // 策略表：该档这套机身键语义
        expect(el.title).toBe(P.buttons[k].title);
        expect(el.getAttribute('aria-label')).toBe(P.buttons[k].aria);
      });
      seen[mode] = true;
    }
    expect(Object.keys(seen)).toHaveLength(3);
  });
});
