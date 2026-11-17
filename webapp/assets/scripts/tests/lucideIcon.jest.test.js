/**
 * @jest-environment node
 */
const { loadModule } = require('./__helpers__/testUtils');

/**
 * 宿主的 FAB 入口图标契约：模块在 __bamboo_module_ 头里写 fab.icon，
 * moduleManager 直接把它交给 LucideUtils.createIcon(name)。名字不在 ICONS 表里时
 * createIcon 静默回退 circle —— 于是「将进酒（杯莫停）」的入口长期是一个空心圆，
 * 而不会有任何报错。此文件把「gourd 必须存在」钉成回归锁（入口已不再用红酒杯）。
 *
 * 依赖说明：源码里 num() 与 HTMLUtils.escapeHtmlAttr() 是宿主全局
 * （utils/htmlUtils.js 末尾挂在 window 上），模块本身不 import；
 * loadModule 会剥离 import，故必须显式注入，否则 _svg 求值期直接 ReferenceError。
 */
const num = (v) => Number(v) || 0;
const HTMLUtils = { escapeHtmlAttr: (s) => String(s).replace(/"/g, '&quot;') };

function loadLucide() {
    return loadModule('utils/lucideUtils.js', ['LucideUtils'], {
        num,
        HTMLUtils,
        window: {},
    }).LucideUtils;
}

afterAll(() => {
    delete globalThis.num;
    delete globalThis.HTMLUtils;
});

describe('LucideUtils 图标表', () => {
    test('酒模块声明的 fab.icon="gourd" 必须命中真实图标，而非圆圈兜底', () => {
        const LucideUtils = loadLucide();
        const svg = LucideUtils.createIcon('gourd', { size: 18 });
        expect(svg).toContain('class="icon icon-gourd"');
        // 葫芦下半腔的肩线在场 = 不是兜底的 <circle>
        expect(svg).toContain('C15.6 9.85 17.2 12 17.2 14.5');
        expect(svg).not.toContain('icon-circle');
    });

    test('红酒杯 wine 已从图标表移除，入口不会误用', () => {
        const LucideUtils = loadLucide();
        expect(Object.prototype.hasOwnProperty.call(LucideUtils.ICONS, 'wine')).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(LucideUtils.ICONS, 'gourd')).toBe(true);
    });

    test('gourd 图标用 24 网格、18 尺寸，与其它 FAB 图标同一规格', () => {
        const LucideUtils = loadLucide();
        const svg = LucideUtils.createIcon('gourd', { size: 18 });
        expect(svg).toContain('viewBox="0 0 24 24"');
        expect(svg).toContain('width="18"');
        expect(svg).toContain('height="18"');
    });

    test('未知图标仍按原约定回退 circle（不要静默返回空串）', () => {
        const LucideUtils = loadLucide();
        const svg = LucideUtils.createIcon('definitely-not-an-icon');
        expect(svg).toContain('icon-circle');
    });

    test('全表每个图标都能求值，不含 undefined/NaN', () => {
        const LucideUtils = loadLucide();
        Object.keys(LucideUtils.ICONS).forEach((name) => {
            const svg = LucideUtils.createIcon(name);
            expect(svg).toContain('class="icon icon-');
            expect(svg).not.toContain('undefined');
            expect(svg).not.toContain('NaN');
        });
    });
});
