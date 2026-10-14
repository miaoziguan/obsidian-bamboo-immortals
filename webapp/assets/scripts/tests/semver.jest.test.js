/**
 * semver.js 单测 —— 素材 minAppVersion 门控的比较逻辑
 *
 * 版本号解析/比较是经典易错点，且这条判定决定「素材能否装载」，
 * 故对边界（多位数段、缺段、预发布后缀、非数字段、空值）逐条钉住。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('semver · 版本比较', () => {
    let s;

    beforeEach(() => {
        jest.resetModules();
        s = loadModule('utils/semver.js', ['parseSemver', 'compareSemver', 'meetsMinVersion']);
    });

    test('parseSemver: 常规版本号', () => {
        expect(s.parseSemver('3.28.13')).toEqual([3, 28, 13]);
        expect(s.parseSemver(' 3.28.13 ')).toEqual([3, 28, 13]);
    });

    test('parseSemver: 截断 -prerelease / +build 元数据', () => {
        expect(s.parseSemver('3.28.13-beta.1')).toEqual([3, 28, 13]);
        expect(s.parseSemver('1.2.3+build.9')).toEqual([1, 2, 3]);
    });

    test('parseSemver: 非数字段按 0，空值返回 null', () => {
        expect(s.parseSemver('3.x')).toEqual([3, 0]);
        expect(s.parseSemver('')).toBeNull();
        expect(s.parseSemver(null)).toBeNull();
        expect(s.parseSemver(undefined)).toBeNull();
    });

    test('compareSemver: 逐段数值比较，不是字符串比较', () => {
        // 经典陷阱：字符串比较会得到 '1.10.0' < '1.9.9'
        expect(s.compareSemver('1.10.0', '1.9.9')).toBe(1);
        expect(s.compareSemver('2.0.0', '10.0.0')).toBe(-1);
        expect(s.compareSemver('3.28.13', '3.28.13')).toBe(0);
    });

    test('compareSemver: 缺段补 0（1.2 等价 1.2.0）', () => {
        expect(s.compareSemver('1.2', '1.2.0')).toBe(0);
        expect(s.compareSemver('1.2.1', '1.2')).toBe(1);
    });

    test('compareSemver: 预发布后缀不参与比较', () => {
        expect(s.compareSemver('3.28.13-beta.1', '3.28.13')).toBe(0);
    });

    test('compareSemver: 空值视为最小版本', () => {
        expect(s.compareSemver('', '1.0.0')).toBe(-1);
        expect(s.compareSemver('1.0.0', '')).toBe(1);
        expect(s.compareSemver('', '')).toBe(0);
    });

    test('meetsMinVersion: 达标放行、不达标拒绝', () => {
        expect(s.meetsMinVersion('3.28.13', '3.0.0')).toBe(true);
        expect(s.meetsMinVersion('3.28.13', '3.28.13')).toBe(true);
        expect(s.meetsMinVersion('3.28.13', '3.29.0')).toBe(false);
        expect(s.meetsMinVersion('3.28.13', '4.0.0')).toBe(false);
    });

    test('meetsMinVersion: 任一侧缺失一律放行（旧宿主 / 旧素材不误杀）', () => {
        expect(s.meetsMinVersion('3.28.13', '')).toBe(true);   // 素材没声明要求
        expect(s.meetsMinVersion('3.28.13', null)).toBe(true);
        expect(s.meetsMinVersion('', '4.0.0')).toBe(true);     // 宿主未上报版本
        expect(s.meetsMinVersion(null, '4.0.0')).toBe(true);
    });
});
