/**
 * @jest-environment jsdom
 *
 * gestures.js 去重守卫：scrollToSection 必须委托 utils/helpers.js 的唯一实现。
 * 背景：此前 gestures.js 与 helpers.js 各有一份逐字相同的副本（含 headerOffset=100）且都活
 * （quickNav.js 走 Gestures.scrollToSection；QuickNav.scrollToSection 又裸调全局 = helpers 版）。
 */
const { loadModule } = require('./__helpers__/testUtils');

const { formatDate } = loadModule('utils/dateUtils.js', ['formatDate']);
const { getScrollHost } = loadModule('utils/domRef.js', ['getScrollHost']);
const helpers = loadModule('utils/helpers.js', ['scrollToSection'], {
    byId: (id) => document.getElementById(id),
    getScrollHost,
    formatDate
});

function loadGestures(globals = {}) {
    return loadModule('handlers/gestures.js', ['Gestures'], globals).Gestures;
}

describe('Gestures.scrollToSection 委托 helpers', () => {
    test('应调用注入的 scrollToSectionImpl，不再内联副本', () => {
        const spy = jest.fn();
        loadGestures({ scrollToSectionImpl: spy }).scrollToSection('section-todo');
        expect(spy).toHaveBeenCalledWith('section-todo');
    });

    test('注入真实实现时 headerOffset = 100 生效', () => {
        const el = document.createElement('div');
        el.id = 'section-todo';
        document.body.appendChild(el);
        el.getBoundingClientRect = () => ({ top: 300, width: 100, height: 50, bottom: 350, left: 0, right: 100 });
        Object.defineProperty(window, 'pageYOffset', { value: 120, configurable: true });
        const scrollTo = jest.fn();
        window.scrollTo = scrollTo;

        loadGestures({ scrollToSectionImpl: helpers.scrollToSection }).scrollToSection('section-todo');

        expect(scrollTo).toHaveBeenCalledWith({ top: 320, behavior: 'smooth' });
        el.remove();
    });

    test('元素不存在 → 委托链静默返回，不滚动、不抛错', () => {
        const scrollTo = jest.fn();
        window.scrollTo = scrollTo;
        const Gestures = loadGestures({ scrollToSectionImpl: helpers.scrollToSection });
        expect(() => Gestures.scrollToSection('not-exist')).not.toThrow();
        expect(scrollTo).not.toHaveBeenCalled();
    });
});
