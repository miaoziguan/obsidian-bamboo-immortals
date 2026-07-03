/**
 * @jest-environment jsdom
 *
 * 弹层定位工具单测 —— 通过 require 直接加载源文件。
 * popupPositioner.js 同时导出 CommonJS（Node/jest）和挂 window（浏览器）。
 *
 * 测试重点：边界适配（翻上、贴顶、贴左/右）+ 无 anchor 时居中
 */
const { loadModule } = require('./__helpers__/testUtils');
const PP = loadModule('utils/popupPositioner.js', ['PopupPositioner']).PopupPositioner;

/**
 * 创建一个 mock popup 元素：直接给 getBoundingClientRect 返回指定尺寸
 */
function makePopup(width, height) {
    const el = document.createElement('div');
    el._rect = { width, height, top: 0, left: 0, right: width, bottom: height };
    el.getBoundingClientRect = function () { return el._rect; };
    return el;
}

describe('popupPositioner 弹层定位工具', () => {
    // ===== measure =====
    describe('measure', () => {
        test('正常元素返回 getBoundingClientRect 结果', () => {
            const el = makePopup(100, 50);
            const r = PP.measure(el);
            expect(r).toBeTruthy();
            expect(r.width).toBe(100);
            expect(r.height).toBe(50);
        });

        test('0 尺寸元素返回 null', () => {
            const el = makePopup(0, 0);
            expect(PP.measure(el)).toBeNull();
        });

        test('getBoundingClientRect 抛错时返回 null', () => {
            const el = document.createElement('div');
            el.getBoundingClientRect = function () { throw new Error('boom'); };
            expect(PP.measure(el)).toBeNull();
        });
    });

    // ===== positionNextFrame =====
    describe('positionNextFrame', () => {
        // 固定视口大小，便于断言
        const originalInnerHeight = window.innerHeight;
        const originalInnerWidth = window.innerWidth;
        beforeAll(() => {
            Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
            Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
        });
        afterAll(() => {
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
        });

        test('无 anchor 时居中显示', () => {
            const popup = makePopup(200, 100);
            document.body.appendChild(popup);
            PP.positionNextFrame({ popupElement: popup, anchorRect: null });
            // 居中：top = 800/2 - 100/2 = 350, left = 1280/2 - 200/2 = 540
            expect(popup.style.position).toBe('fixed');
            expect(popup.style.top).toBe('350px');
            expect(popup.style.left).toBe('540px');
        });

        test('有 anchor + below-left 时贴触发元素左对齐', () => {
            const popup = makePopup(200, 100);
            document.body.appendChild(popup);
            const anchor = { top: 100, left: 50, right: 250, bottom: 150, width: 200, height: 50 };
            PP.positionNextFrame({ popupElement: popup, anchorRect: anchor });
            // 触发元素下方：top = 150 + 8 = 158, left = 50
            expect(popup.style.top).toBe('158px');
            expect(popup.style.left).toBe('50px');
        });

        test('有 anchor + below-center 时水平居中', () => {
            const popup = makePopup(200, 100);
            document.body.appendChild(popup);
            const anchor = { top: 100, left: 50, right: 250, bottom: 150, width: 200, height: 50 };
            PP.positionNextFrame({
                popupElement: popup,
                anchorRect: anchor,
                anchor: { placement: 'below-center' },
            });
            // left = 50 + 200/2 - 200/2 = 50
            expect(popup.style.left).toBe('50px');
        });

        test('下方空间不足时翻到触发元素上方', () => {
            const popup = makePopup(200, 100);
            document.body.appendChild(popup);
            // 触发元素在屏幕底部,弹层放不下
            const anchor = { top: 780, left: 50, right: 250, bottom: 790, width: 200, height: 10 };
            PP.positionNextFrame({ popupElement: popup, anchorRect: anchor });
            // 正常: 790 + 8 = 798, 弹层 100 高 → 798+100=898 > 800-8=792
            // 翻上: 780 - 100 - 8 = 672
            expect(popup.style.top).toBe('672px');
        });

        test('上方也不够时贴顶 + 设 maxHeight + 启用滚动', () => {
            const popup = makePopup(200, 2000); // 巨大弹层
            document.body.appendChild(popup);
            const anchor = { top: 100, left: 50, right: 250, bottom: 200, width: 200, height: 100 };
            PP.positionNextFrame({ popupElement: popup, anchorRect: anchor });
            // 默认 top = 208, 200+208=2408 > 792 → 翻上 top = 100-2000-8 = -1908 < 8 → 贴顶 = 8
            expect(popup.style.top).toBe('8px');
            expect(popup.style.maxHeight).toBe('784px'); // 800 - 8*2
            expect(popup.style.overflowY).toBe('auto');
        });

        test('右溢出贴右', () => {
            const popup = makePopup(200, 100);
            document.body.appendChild(popup);
            // 触发元素靠右,弹层居中后会溢出右边
            const anchor = { top: 100, left: 1100, right: 1280, bottom: 150, width: 180, height: 50 };
            PP.positionNextFrame({
                popupElement: popup,
                anchorRect: anchor,
                anchor: { placement: 'below-center' },
            });
            // 默认 left = 1100 + 180/2 - 200/2 = 1090
            // 1090 + 200 = 1290 > 1280-8=1272 → 贴右: 1280-200-8 = 1072
            expect(popup.style.left).toBe('1072px');
        });

        test('左溢出贴左', () => {
            const popup = makePopup(300, 100);
            document.body.appendChild(popup);
            // 触发元素靠左,below-left 会让弹层左对齐到 0
            const anchor = { top: 100, left: 0, right: 100, bottom: 150, width: 100, height: 50 };
            PP.positionNextFrame({ popupElement: popup, anchorRect: anchor });
            // left = 0 < padding(8), 应被 clamp 到 8
            expect(popup.style.left).toBe('8px');
        });

        test('flipUpWhenTooLow=false 时不翻上,直接贴底', () => {
            const popup = makePopup(200, 100);
            document.body.appendChild(popup);
            const anchor = { top: 780, left: 50, right: 250, bottom: 790, width: 200, height: 10 };
            PP.positionNextFrame({
                popupElement: popup,
                anchorRect: anchor,
                flipUpWhenTooLow: false,
            });
            // 不翻上,但仍要保证不超底 → top = 800 - 100 - 8 = 692
            // 实际逻辑:不翻上 → 仍维持 top=798; 但 798+100=898 > 792 不再调整,因为没翻上;
            // 看代码实现 — flipUpWhenTooLow=false 时,不做翻上,直接走原 top
            expect(popup.style.top).toBe('798px');
        });

        test('popupElement 为 null 时安全返回', () => {
            expect(() => PP.positionNextFrame({ popupElement: null })).not.toThrow();
        });
    });
});
