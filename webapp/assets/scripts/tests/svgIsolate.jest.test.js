/**
 * @jest-environment jsdom
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('SvgIsolate', () => {
    let S;

    beforeEach(() => {
        jest.resetModules();
        S = loadModule('utils/svgIsolate.js', ['SvgIsolate']).SvgIsolate;
    });

    test('isolateIds: id 与 url(#id) 引用一起加前缀', () => {
        const html = '<svg><defs><clipPath id="a"><path d="M0 0"/></clipPath></defs><g clip-path="url(#a)"><path id="b"/></g></svg>';
        const out = S.isolateIds(html, 'x1-');
        expect(out).toContain('id="x1-a"');
        expect(out).toContain('url(#x1-a)');
        expect(out).toContain('id="x1-b"');
        expect(out).not.toContain('url(#a)');
    });

    test('isolateIds: 覆盖 url 引号三种写法 + href / xlink:href', () => {
        const html = '<svg>'
            + '<defs><linearGradient id="g"><stop/></linearGradient><clipPath id="c"/></defs>'
            + '<rect fill="url(#g)"/><rect fill="url(\'#g\')"/><rect fill="url(\"#g\")"/>'
            + '<g clip-path="url(#c)"><use href="#g"/><use xlink:href="#c"/></g>'
            + '</svg>';
        const out = S.isolateIds(html, 'p-');
        expect(out).toContain('id="p-g"');
        expect(out).toContain('id="p-c"');
        expect(out).toContain('url(#p-g)');
        expect(out).toContain("url('#p-g')");
        expect(out).toContain('url("#p-g")');
        expect(out).toContain('href="#p-g"');
        expect(out).toContain('xlink:href="#p-c"');
        // 原文里不应再残留未加前缀的引用
        expect(out).not.toMatch(/url\(\s*['"]?#g/);
        expect(out).not.toMatch(/href=(["'])#g\1/);
    });

    test('isolateIds: 不存在的 id 引用保持原样（与旧实现一致）', () => {
        const html = '<svg><g clip-path="url(#nope)"><use href="#nope"/></g><path id="real"/></svg>';
        const out = S.isolateIds(html, 'p-');
        expect(out).toContain('url(#nope)');
        expect(out).toContain('href="#nope"');
        expect(out).toContain('id="p-real"');
    });

    test('isolateIds: 大量 id 也只需常数趟扫描（正确性 + 规模）', () => {
        const N = 300;
        let html = '<svg>';
        for (let i = 0; i < N; i++) html += '<path id="i' + i + '"/>';
        for (let i = 0; i < N; i++) html += '<use href="#i' + i + '"/>';
        html += '</svg>';
        const out = S.isolateIds(html, 'z-');
        expect((out.match(/id="z-i/g) || []).length).toBe(N);
        expect((out.match(/href="#z-i/g) || []).length).toBe(N);
        expect(out).not.toContain('href="#i0"');
    });

    test('isolateIds: 不同前缀产出不同结果（实例隔离）', () => {
        const html = '<svg><path id="a"/><use href="#a"/></svg>';
        const a = S.isolateIds(html, 'x-');
        const b = S.isolateIds(html, 'y-');
        expect(a).not.toBe(b);
        expect(a).toContain('id="x-a"');
        expect(b).toContain('id="y-a"');
    });

    test('scopeCss: 给 svg 加作用域类并把选择器前缀化', () => {
        const html = '<svg viewBox="0 0 10 10"><style>.a{fill:#111}</style><path class="a"/></svg>';
        const out = S.scopeCss(html, 'm0-');
        expect(out).toContain('class="bm-svgs-m0"');
        expect(out).toContain('.bm-svgs-m0 .a{fill:#111}');
    });

    test('scopeCss: 无 <style> 的素材原样返回（位图型 foreignObject 预览零副作用）', () => {
        const html = '<svg viewBox="0 0 1 1"><foreignObject><img src="data:image/webp;base64,AA"/></foreignObject></svg>';
        expect(S.scopeCss(html, 'm1-')).toBe(html);
    });

    test('scopeCss: svg 已带 class 时合并而非覆盖', () => {
        const html = '<svg class="keep"><style>.a{fill:#111}</style></svg>';
        expect(S.scopeCss(html, 'm2-')).toContain('class="keep bm-svgs-m2"');
    });

    test('scopeCss: @media 保留、其内部规则被前缀化', () => {
        const html = '<svg><style>@media (min-width:1px){.a{fill:#111}}</style></svg>';
        const out = S.scopeCss(html, 'm3-');
        expect(out).toContain('@media (min-width:1px)');
        expect(out).toContain('.bm-svgs-m3 .a{fill:#111}');
    });

    test('scopeCss: @keyframes 内部不被前缀化（from/to 不是选择器）', () => {
        const html = '<svg><style>@keyframes kf{from{opacity:0}to{opacity:1}}</style></svg>';
        const out = S.scopeCss(html, 'm4-');
        expect(out).toContain('@keyframes kf');
        expect(out).toContain('from{opacity:0}');
        expect(out).not.toContain('.bm-svgs-m4 from');
    });

    test('指向根 svg 自身的选择器应替换为作用域类本身（否则变后代选择器永不命中）', () => {
        const html = '<svg><style>svg{fill:#333}</style></svg>';
        expect(S.scopeCss(html, 'm5-')).toContain('.bm-svgs-m5{fill:#333}');
    });

    test('isolate: 空值安全', () => {
        expect(S.isolate('', 'p-')).toBe('');
        expect(S.isolate(null, 'p-')).toBe(null);
        expect(S.isolate(undefined, 'p-')).toBe(undefined);
    });

    test('回归（腾云/驾雾串色事故）：同名类不同配色的两个素材，隔离后规则互不覆盖', () => {
        const A = '<svg><style>.cls-8{fill:#a63824}</style><path class="cls-8"/></svg>';
        const B = '<svg><style>.cls-8{fill:#467ec0}</style><path class="cls-8"/></svg>';
        const outA = S.isolate(A, 'a-');
        const outB = S.isolate(B, 'b-');
        expect(outA).toContain('.bm-svgs-a .cls-8{fill:#a63824}');
        expect(outB).toContain('.bm-svgs-b .cls-8{fill:#467ec0}');
        // 各自的规则只带自己的作用域，永远不会命中对方的实例
        expect(outA).not.toContain('bm-svgs-b');
        expect(outB).not.toContain('bm-svgs-a');
    });

    test('DOM 级验证：作用域选择器在真实文档里只命中自己的实例', () => {
        const A = '<svg><style>.cls-8{fill:#a63824}</style><path class="cls-8"/></svg>';
        const B = '<svg><style>.cls-8{fill:#467ec0}</style><path class="cls-8"/></svg>';
        document.body.innerHTML = S.isolate(A, 'a-') + S.isolate(B, 'b-');
        const inA = document.querySelectorAll('.bm-svgs-a .cls-8');
        const inB = document.querySelectorAll('.bm-svgs-b .cls-8');
        expect(inA.length).toBe(1);
        expect(inB.length).toBe(1);
        expect(inA[0].closest('svg').getAttribute('class')).toBe('bm-svgs-a');
        expect(inB[0].closest('svg').getAttribute('class')).toBe('bm-svgs-b');
        // 反证：不做作用域化时 '.cls-8' 会同时命中两个实例 —— 这正是串色事故的成因
        expect(document.querySelectorAll('.cls-8').length).toBe(2);
    });

    test('isolate: 同屏多实例各自拿到唯一作用域类', () => {
        const mk = '<svg><style>.cls-1{fill:#aaa}</style><path class="cls-1"/></svg>';
        const seen = new Set();
        for (let i = 0; i < 20; i++) {
            const out = S.isolate(mk, 'mt' + i + '-');
            const m = out.match(/class="(bm-svgs-mt\d+)"/);
            expect(m).toBeTruthy();
            seen.add(m[1]);
        }
        expect(seen.size).toBe(20);
    });
});
