/**
 * @jest-environment jsdom
 */
// 布局板块回归锁（对应一次系统性审查的 P0 / P1 结论）：
//  1. 【P0】横向模式连续 reflow 必须幂等 —— 摊平列 wrapper 后是「列优先」顺序，
//     再按 idx % cols 交错回填会把板块顺序打乱，且每渲染一次来回跳一次。
//     修复：分列前用 SectionRegistry.getVisible() 的权威顺序，而非 container.children。
//  2. 【P1】退出多列必须同步持久化 displayWidth —— 否则重启后宽度回弹到多列的 800/1200。
//  3. 【P2】_enter 只接受 horizontal / kanban，避免非法值污染跨重启恢复源。
const { loadModule } = require('./__helpers__/testUtils');

/** 读出当前列结构：[[col1 的板块 id...], [col2 的板块 id...], ...] */
function colsOf(sc) {
    return Array.from(sc.querySelectorAll(':scope > .layout-col'))
        .map((c) => Array.from(c.children).map((el) => el.getAttribute('data-section-id') || el.textContent));
}

/**
 * 搭建横向/看板场景。
 * @param {string[]} ids   板块 id，按「注册表权威顺序」给出
 */
function setup(ids) {
    document.body.innerHTML = `
    <div id="reviewContainer">
      <div id="sectionsContainer">
        ${ids.map((id) => `<div class="section" data-section-id="${id}">${id}</div>`).join('')}
      </div>
    </div>
  `;
    global.byId = (id) => document.getElementById(id);
    global.EventBus = { on: () => { } };                 // 屏蔽底部 IIFE 的兜底分支
    global.requestAnimationFrame = (cb) => { cb(); return 0; };
    global.window.__bambooIsMobile = false;
    global.window.__bambooIsMainLeaf = true;
    global.window.__bambooPendingLayoutMode = null;
    global.Toast = { showToast: () => { } };
    // 权威顺序：始终按 ids 给出（模拟 SectionRegistry 拖拽排序后的真源）
    global.SectionRegistry = { getVisible: () => ids.map((id) => ({ id })) };
    global.DisplayManager = {
        _currentWidth: 1200,
        DEFAULT_WIDTH: 800,
        MIN_WIDTH: 400,
        _applyWidth: () => { },
        _applyResponsiveClasses: () => { },
    };
    const put = [];
    global.storageManager = {
        getSetting: async () => null,
        putSetting: (k, v) => { put.push([k, v]); },
        moveToCenter: () => { },
        moveToSidebar: () => { },
        collapseRightSidebar: () => { },
        expandRightSidebar: () => { },
    };

    const { LayoutMode } = loadModule('modules/layout/layoutMode.js', ['LayoutMode']);
    LayoutMode._mode = 'none';
    LayoutMode._columns = 2;
    LayoutMode._justEntered = false;
    LayoutMode._restoring = false;
    LayoutMode._collapsedRightSidebar = false;
    return { LayoutMode, put, sc: document.getElementById('sectionsContainer') };
}

describe('横向模式：reflow 幂等（板块顺序不跳）', () => {
    test('连续两次 reflow 的列结构完全一致', () => {
        const { LayoutMode, sc } = setup(['a', 'b', 'c', 'd']);
        LayoutMode._mode = 'horizontal';

        LayoutMode.reflow();
        const first = colsOf(sc);
        LayoutMode.reflow();
        const second = colsOf(sc);

        // 视觉阅读顺序（左右交替）= a b / c d
        expect(first).toEqual([['a', 'c'], ['b', 'd']]);
        // 关键：第二次不得变成 [['a','b'], ['c','d']]（那是旧实现的错序结果）
        expect(second).toEqual(first);
    });

    test('连续五次 reflow 仍保持初始列结构', () => {
        const { LayoutMode, sc } = setup(['a', 'b', 'c', 'd', 'e']);
        LayoutMode._mode = 'horizontal';

        LayoutMode.reflow();
        const first = colsOf(sc);
        for (let i = 0; i < 4; i++) LayoutMode.reflow();

        expect(colsOf(sc)).toEqual(first);
    });

    test('局部渲染新板块后（appendChild 到容器顶层）仍按注册表顺序归位', () => {
        const { LayoutMode, sc } = setup(['a', 'b', 'c']);
        LayoutMode._mode = 'horizontal';
        LayoutMode.reflow();

        // 模拟 renderScheduler._doPartialRender 的降级路径：新板块被追加到容器顶层
        const extra = document.createElement('div');
        extra.className = 'section';
        extra.setAttribute('data-section-id', 'd');
        sc.appendChild(extra);
        // 注册表顺序变为 a,b,c,d
        global.SectionRegistry = { getVisible: () => ['a', 'b', 'c', 'd'].map((id) => ({ id })) };

        LayoutMode.reflow();
        expect(colsOf(sc)).toEqual([['a', 'c'], ['b', 'd']]);
    });
});

describe('看板模式：reflow 幂等', () => {
    test('连续两次 reflow 每板块仍独占一列且顺序不变', () => {
        const { LayoutMode, sc } = setup(['a', 'b', 'c']);
        LayoutMode._mode = 'kanban';

        LayoutMode.reflow();
        const first = colsOf(sc);
        LayoutMode.reflow();

        expect(first).toEqual([['a'], ['b'], ['c']]);
        expect(colsOf(sc)).toEqual(first);
        expect(LayoutMode.getColumns()).toBe(3);
    });
});

describe('退出多列：宽度持久化与模式白名单', () => {
    test('_forceOff 同步把 displayWidth 落盘，避免重启后回弹到多列宽度', () => {
        const { LayoutMode, put } = setup(['a', 'b']);
        LayoutMode._mode = 'kanban';
        LayoutMode._collapsedRightSidebar = true;

        LayoutMode._forceOff();

        expect(LayoutMode._mode).toBe('none');
        expect(put).toContainEqual(['layoutMode', 'none']);
        // 关键：进入时写过 800/1200，退出必须同样写回，否则重启后纵向布局顶着多列宽度
        expect(put).toContainEqual(['displayWidth', 400]);
    });

    test('_enter 拒绝非法模式，不污染 settings.layoutMode', () => {
        const { LayoutMode, put } = setup(['a', 'b']);

        LayoutMode._enter('evil-mode');

        expect(LayoutMode._mode).toBe('none');
        expect(put.filter(([k]) => k === 'layoutMode')).toHaveLength(0);
    });
});
