/**
 * @jest-environment jsdom
 *
 * 渲染层 XSS 回归：属性上下文必须用 escapeHtmlAttr，文本上下文用 escapeHtml。
 *
 * 【为什么扩展这个文件】原 xss.jest.test.js 只覆盖 GoalsRenderer.renderGoalView，
 * 而全仓实际有 44 处正确使用 HTMLUtils.escapeHtmlAttr 的先例，也有 20 处偏离——
 * 集中在 todo / timeline / archiver / NoisePanel 四个渲染器。
 * 此前这四个渲染器**零** XSS 覆盖，所以偏离长期未被发现。
 *
 * 【断言策略】不只断言「没生成元素」，还断言「payload 仍作为数据完整保留」。
 * 后者更强：它证明值被正确转义进了属性/文本，而不是被浏览器解析成了新节点。
 */
const { loadModule } = require('./__helpers__/testUtils');

// 建立真实的 window.HTMLUtils / window.escapeHtml（htmlUtils.js 尾部会挂全局）
loadModule('utils/htmlUtils.js', []);

const LucideStub = { createIcon: () => '' };
const ActionDispatcherStub = new Proxy({}, { get: () => () => {} });
const domStubs = {
    byId: () => null,
    $: () => null,
    $$: () => [],
    modalMount: () => document.body,
    eventInTargets: () => false,
};

// 同时含引号（用于属性逃逸）与尖括号（用于标签注入）的复合负载
const PAYLOAD = '"><img src=x onerror=alert(1)>';
const TEXT_PAYLOAD = '<img src=x onerror=alert(1)>';

// 把 HTML 字符串落到真实 DOM 上以便断言"是否生成了新元素"
const mount = (html) => {
    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.appendChild(el);
    return el;
};

describe('渲染层 XSS 防护（属性/文本上下文）', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        jest.resetModules();
    });

    describe('TodoRenderer.renderTodoItem —— title 属性承载目标标题', () => {
        const build = () => {
            const { TodoRenderer } = loadModule('modules/todo/renderer.js', ['TodoRenderer'], {
                LucideUtils: LucideStub,
                ActionDispatcher: ActionDispatcherStub,
                store: { getState: () => ({ currentDate: '2026-01-01' }), state: {} },
                ...domStubs,
            });
            return TodoRenderer;
        };

        test('恶意目标标题不得闭合 title 属性', () => {
            const el = mount(build().renderTodoItem(
                { id: 'g1', description: PAYLOAD, hasValues: false, completed: false },
                0,
                false,
            ));
            expect(el.querySelector('img')).toBeNull();
            // payload 应作为纯数据留在 title 里
            const span = el.querySelector('.todo-goal-source');
            expect(span.getAttribute('title')).toBe(PAYLOAD);
        });

        test('data-todo-id 属性不得被注入', () => {
            const el = mount(build().renderTodoItem(
                { id: PAYLOAD, description: '正常', hasValues: false, completed: false },
                0,
                false,
            ));
            expect(el.querySelector('img')).toBeNull();
            expect(el.querySelector('.todo-item').getAttribute('data-todo-id')).toBe(PAYLOAD);
        });
    });

    describe('TimelineRenderer.render —— aria-label / class 属性', () => {
        // render() 是"写进容器"而非返回字符串，且容器缺失时直接 return
        const render = (period) => {
            const container = document.createElement('div');
            container.id = 'timelinePath';
            document.body.appendChild(container);
            const { TimelineRenderer } = loadModule('modules/timeline/renderer.js', ['TimelineRenderer'], {
                LucideUtils: LucideStub,
                ActionDispatcher: ActionDispatcherStub,
                ...domStubs,
                byId: (id) => (id === 'timelinePath' ? container : null),
            });
            TimelineRenderer.render({
                timeline: [{
                    period: period.period,
                    name: period.name,
                    time: '09:00',
                    icon: '',
                    // 至少一条活动，否则会走"无任务"空态分支
                    items: [{ time: '09:00', task: '任务' }],
                }],
            });
            return container;
        };

        test('恶意时段名不得闭合 aria-label 属性', () => {
            const el = render({ period: 'dawn', name: PAYLOAD });
            expect(el.querySelector('img')).toBeNull();
            const card = el.querySelector('.bamboo-card');
            expect(card.getAttribute('aria-label')).toBe(PAYLOAD + '时间段');
        });

        test('时段类型（class 属性）被约束，不产生注入', () => {
            const el = render({ period: PAYLOAD, name: '正常' });
            expect(el.querySelector('img')).toBeNull();
        });
    });

    describe('GoalsArchiver._buildArchiveFilterHTML —— 持久化搜索词', () => {
        test('归档搜索词不得闭合 value 属性', () => {
            const { GoalsArchiver } = loadModule('modules/goals/archiver.js', ['GoalsArchiver'], {
                LucideUtils: LucideStub,
                GoalService: { getCategories: () => [{ name: PAYLOAD }] },
                StorageAdapter: { get: () => null, set: () => {} },
                StorageKeys: { ARCHIVE_FILTER: 'x' },
                Toast: { showToast: () => {} },
                store: { state: {} },
                ...domStubs,
            });
            GoalsArchiver._state.filter = {
                category: 'all', keyword: PAYLOAD, dateStart: '', dateEnd: '',
            };
            const el = mount(GoalsArchiver._buildArchiveFilterHTML());
            expect(el.querySelector('img')).toBeNull();
            expect(el.querySelector('.arch-filter-input').getAttribute('value')).toBe(PAYLOAD);
        });

        test('分类名（option value 属性）——select 解析规则本身已阻止注入', () => {
            // 注意：本例在**旧代码上同样通过**——因为 HTML 解析器规定 <select> 内只允许
            // option/optgroup/hr/script/template，注入的 <img> 会被直接丢弃。
            // 即这里的兜底来自解析器而非转义，故此用例只作行为锁定，不算回归依据。
            // 转义本身仍属正确（value 与 selected 判定都需要它）。
            const { GoalsArchiver } = loadModule('modules/goals/archiver.js', ['GoalsArchiver'], {
                LucideUtils: LucideStub,
                GoalService: { getCategories: () => [{ name: PAYLOAD }] },
                StorageAdapter: { get: () => null, set: () => {} },
                StorageKeys: { ARCHIVE_FILTER: 'x' },
                Toast: { showToast: () => {} },
                store: { state: {} },
                ...domStubs,
            });
            GoalsArchiver._state.filter = {
                category: 'all', keyword: '', dateStart: '', dateEnd: '',
            };
            const el = mount(GoalsArchiver._buildArchiveFilterHTML());
            expect(el.querySelector('img')).toBeNull();
        });
    });

    describe('NoisePanel.renderHTML —— 自定义音源名', () => {
        test('恶意音源名不得注入元素', () => {
            const { NoisePanel } = loadModule('utils/NoisePanel.js', ['NoisePanel'], {
                LucideUtils: LucideStub,
                NoisePlayer: {
                    currentType: '', isPlaying: false,
                    getVolume: () => 50, setVolume: () => {},
                },
                WhiteNoiseManager: {
                    customNoises: [{ id: 'custom_1', name: TEXT_PAYLOAD }],
                    NOISE_TYPES: [],
                    NOISE: {}, TIMER: {},
                    currentType: '',
                    isPlaying: false,
                    customEnabled: true,
                    timerMinutes: 0,
                    getTimerRemaining: () => '',
                    play: () => {}, pause: () => {}, setTimer: () => {},
                    addCustomNoise: () => {}, removeCustomNoise: () => {}, renameCustomNoise: () => {},
                },
                ...domStubs,
            });
            const el = mount(NoisePanel.renderHTML());
            expect(el.querySelector('img')).toBeNull();
            expect(el.textContent).toContain('onerror');   // 仍作为文本存在
        });
    });

    describe('ConfirmDialog —— message 文本上下文', () => {
        test('message 中的标签应被转义（当前无调用方传插值，属纵深防御）', () => {
            const { ConfirmDialog } = loadModule('utils/confirmDialog.js', ['ConfirmDialog'], {
                ...domStubs,
            });
            const inst = new ConfirmDialog();
            inst.show({ title: 't', message: TEXT_PAYLOAD });
            const el = document.querySelector('.confirm-message');
            expect(el.querySelector('img')).toBeNull();
            expect(el.textContent).toBe(TEXT_PAYLOAD);
            inst.closeCurrent();
        });
    });
});
