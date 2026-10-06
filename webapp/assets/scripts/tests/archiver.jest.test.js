/**
 * @jest-environment jsdom
 *
 * GoalsArchiver 事件绑定（目标归档面板 / 独立页）
 *
 * 回归目标：**容器级委托**（click 折叠、click 恢复/删除）必须「按容器只绑一次」。
 *
 * 历史缺陷：这些委托与「每次刷新都必须重绑」的子节点监听混在同一个 _bindEvents 里，
 * 而容器（面板的 .fab-panel-body / 独立页根容器）跨刷新存活 —— 于是每刷新一次就多挂
 * 一层委托：
 *   - 折叠被 toggle 偶数次 → 相消 → 卡片永远展不开（奇数层又"正常"，行为随层数奇偶翻转）
 *   - 恢复/删除被执行多次
 *   - 每次执行又会各自触发一次刷新，于是执行次数 1→2→4→8 翻倍放大
 *
 * 关键区分（下面的用例分别守住两端）：
 *   - 容器元素：不重建 → 委托只能绑一次（重复绑 = bug）
 *   - 子节点：随 innerHTML 重建 → 监听必须每次重绑（不重绑 = 控件真的失效）
 */
const { loadModule } = require('./__helpers__/testUtils');

const ARCHIVED = [
    { id: 'g1', title: '读完一本书', archived: true, archivedAt: '2026-09-20T10:00:00.000Z', items: [], category: 'study', startDate: '2026-01-01' },
    { id: 'g2', title: '跑一百公里', archived: true, archivedAt: '2026-09-21T10:00:00.000Z', items: [], category: 'health', startDate: '2026-01-01' },
];

function makeGlobals() {
    return {
        store: {
            state: {},
            getArchivedGoals: () => ARCHIVED,
            getGlobalGoals: () => ARCHIVED,
            unarchiveGoal: jest.fn().mockResolvedValue(undefined),
            deleteGlobalGoal: jest.fn().mockResolvedValue(undefined),
            notify: () => {},
        },
        GoalService: {
            getCategories: () => [{ id: 'study', name: '学习' }, { id: 'health', name: '健康' }],
            calcProgressFromValues: () => 100,
            _save: jest.fn().mockResolvedValue(undefined),
        },
        LucideUtils: { createIcon: () => '<svg></svg>' },
        HTMLUtils: { escapeHtmlAttr: (s) => String(s) },
        escapeHtml: (s) => String(s == null ? '' : s),
        // 贴近真实 PanelManager：open 会新建面板并回调 onOpen（_bindEvents 的入口）
        PanelManager: {
            activePanel: null,
            open: jest.fn(function (id, title, content, options = {}) {
                const panel = document.createElement('div');
                panel.className = 'fab-panel';
                panel.id = 'panel-' + id;
                panel.innerHTML = `<div class="fab-panel-body">${content}</div>`;
                document.body.appendChild(panel);
                this.activePanel = panel;
                if (options.onOpen) options.onOpen(panel);
                return panel;
            }),
            close: jest.fn(function () { this.activePanel = null; }),
        },
        StorageAdapter: { get: () => null, set: () => {} },
        StorageKeys: { ARCHIVE_FILTER: 'archiveFilter' },
        Toast: { showToast: jest.fn() },
        ConfirmDialog: { confirmDelete: jest.fn().mockResolvedValue(true) },
        DateRangePicker: { show: jest.fn() },
    };
}

function setup() {
    const globals = makeGlobals();
    const { GoalsArchiver } = loadModule('modules/goals/archiver.js', ['GoalsArchiver'], globals);
    GoalsArchiver._state.filter = { category: 'all', keyword: '', dateStart: '', dateEnd: '' };
    return { A: GoalsArchiver, globals };
}

/** 走真实入口：openArchiveManager → _renderArchivePanel → PanelManager.open → onOpen → _bindEvents */
function openPanel(A, globals) {
    A.openArchiveManager();
    return globals.PanelManager.activePanel;
}

const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const settle = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };

/** 精确统计某元素的 class 变更次数 —— 用于数「委托实际执行了几次」 */
async function countClassMutations(el, action) {
    const changes = [];
    const mo = new MutationObserver((recs) => {
        for (const r of recs) if (r.attributeName === 'class') changes.push(el.className);
    });
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    action();
    await settle();
    mo.disconnect();
    return changes.length;
}

describe('GoalsArchiver 容器级委托只绑一次', () => {
    test('重复 _bindEvents 不会累积委托（同一容器）', async () => {
        const { A, globals } = setup();
        const panel = openPanel(A, globals);
        const card = panel.querySelector('.arch-card');

        const times = await countClassMutations(card, () => {
            A._bindEvents(panel); // 模拟后续刷新带来的重复绑定
            A._bindEvents(panel);
            click(card.querySelector('.arch-head'));
        });

        expect(times).toBe(1); // 旧实现为 3（每次 _bindEvents 各加一层）
    });

    test('多次刷新后，卡片仍能被正常展开与收起（且只处理一次）', async () => {
        const { A, globals } = setup();
        const panel = openPanel(A, globals);

        A._refreshContent();
        A._refreshContent();

        const card = panel.querySelector('.arch-card');
        // 必须同时断言「执行次数」：只看展开/收起结果会被奇数层的 toggle 相消骗过
        // （旧实现下 2 次刷新 = 3 份委托，toggle 3 次反而"看起来正常"）
        const times = await countClassMutations(card, () => click(card.querySelector('.arch-head')));
        expect(times).toBe(1);
        expect(card.classList.contains('arch-card-expanded')).toBe(true);

        click(card.querySelector('.arch-head'));
        expect(card.classList.contains('arch-card-expanded')).toBe(false);
    });

    test('刷新后点击恢复，只执行一次', async () => {
        const { A, globals } = setup();
        const panel = openPanel(A, globals);

        A._refreshContent();

        click(panel.querySelector('[data-action="archive-restore"]'));
        await settle();

        expect(globals.store.unarchiveGoal).toHaveBeenCalledTimes(1);
    });

    test('删除只弹一次确认框', async () => {
        const { A, globals } = setup();
        const panel = openPanel(A, globals);
        jest.spyOn(A, '_showUndoToast').mockImplementation(() => {});

        A._refreshContent();

        click(panel.querySelector('[data-action="archive-delete"]'));
        await settle();

        expect(globals.ConfirmDialog.confirmDelete).toHaveBeenCalledTimes(1);
    });

    test('新容器仍会被正常绑定（一次性标记不误伤）', () => {
        const { A, globals } = setup();
        openPanel(A, globals);

        // 换一个全新容器（等价于关闭面板后重新打开）
        const panel2 = document.createElement('div');
        panel2.className = 'fab-panel';
        panel2.innerHTML = `<div class="fab-panel-body">${A._buildArchiveContentHTML(ARCHIVED)}</div>`;
        document.body.appendChild(panel2);
        A._bindEvents(panel2);

        const card2 = panel2.querySelector('.arch-card');
        click(card2.querySelector('.arch-head'));
        expect(card2.classList.contains('arch-card-expanded')).toBe(true);
    });

    test('连续多轮操作，执行次数恒为 1（不再翻倍放大）', async () => {
        const { A, globals } = setup();
        const panel = openPanel(A, globals);

        const counts = [];
        for (let round = 0; round < 4; round++) {
            globals.store.unarchiveGoal.mockClear();
            click(panel.querySelector('[data-action="archive-restore"]'));
            await settle();
            counts.push(globals.store.unarchiveGoal.mock.calls.length);
        }

        // 旧实现：[1, 2, 4, 8] —— 每次执行各自触发一次刷新，层数随之翻倍
        expect(counts).toEqual([1, 1, 1, 1]);
    });
});

describe('GoalsArchiver 内容级绑定每次刷新都重绑', () => {
    test('刷新后搜索、下拉、复选框、全选均可用', () => {
        jest.useFakeTimers();
        try {
            const { A, globals } = setup();
            const panel = openPanel(A, globals);

            A._refreshContent();
            A._refreshContent();

            // 搜索（防抖 250ms）——输入框在刷新中被重建，必须已重绑
            const input = panel.querySelector('.arch-filter-input');
            expect(input).not.toBeNull();
            input.value = '读完'; // 必须是标题的真实子串，否则列表被过滤空
            input.dispatchEvent(new Event('input', { bubbles: true }));
            jest.advanceTimersByTime(300);
            expect(A._state.filter.keyword).toBe('读完');
            // 重建后的输入框还应带回筛选值
            expect(panel.querySelector('.arch-filter-input').value).toBe('读完');
            expect(panel.querySelectorAll('.arch-card').length).toBe(1); // 过滤确实生效

            // 下拉（节点同样被重建，需重新取）
            const sel = panel.querySelector('.arch-select-category');
            sel.value = '学习'; // 选项值与 filter.category 都用分类名
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            expect(A._state.filter.category).toBe('学习');

            // 重置走的是容器级 pointerdown 委托。
            // 注意：jsdom 没有实现 onpointerdown 这个 IDL 事件处理器
            // （'onpointerdown' in el === false，dispatch 不会触发；onclick 正常），
            // 因此这里改为断言「处理器仍挂在跨刷新的持久容器上」并直接调用它，
            // 以验证刷新后它依然作用于**当前**（已重建的）DOM。浏览器行为不受此限制影响。
            const bodyEl = panel.querySelector('.fab-panel-body');
            expect(typeof bodyEl.onpointerdown).toBe('function');
            const resetBtn = panel.querySelector('[data-action="arch-reset-filter"]');
            expect(resetBtn).not.toBeNull();
            bodyEl.onpointerdown({ target: resetBtn });
            expect(A._state.filter.category).toBe('all');
            expect(A._state.filter.keyword).toBe('');
            expect(panel.querySelectorAll('.arch-card').length).toBe(ARCHIVED.length);

            // 卡片复选框 → 选中态 + 批量按钮解禁
            const cb = panel.querySelector('.arch-cb');
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
            expect(A._state.selection.has('g1')).toBe(true);
            expect(panel.querySelector('[data-action="archive-batch-restore"]').disabled).toBe(false);

            // 全选
            const allCb = panel.querySelector('.arch-cb-all');
            allCb.checked = true;
            allCb.dispatchEvent(new Event('change', { bubbles: true }));
            expect(A._state.selection.size).toBe(ARCHIVED.length);
        } finally {
            jest.useRealTimers();
        }
    });
});

describe('GoalsArchiver 独立页模式', () => {
    test('同一根容器反复刷新后，折叠与恢复仍只执行一次', async () => {
        const { A, globals } = setup();
        jest.spyOn(A, '_notifyGoalsChanged').mockImplementation(() => {});

        const root = document.createElement('div');
        document.body.appendChild(root);
        A.openStandalone(root);

        A._refreshContent();
        A._refreshContent();

        // 独立页没有 .fab-panel-body，委托直接落在根容器上（同样只绑一次）
        const card = root.querySelector('.arch-card');
        click(card.querySelector('.arch-head'));
        expect(card.classList.contains('arch-card-expanded')).toBe(true);

        click(root.querySelector('[data-action="archive-restore"]'));
        await settle();
        expect(globals.store.unarchiveGoal).toHaveBeenCalledTimes(1);
    });
});
