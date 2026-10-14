import { describe, it, expect } from 'vitest';
import { assertSafeAssetId } from '../assetId';

/**
 * 市场素材 id（主题 / 模块 / 便签素材）校验的回归测试。
 *
 * 锁定：这些 id 会直接拼进 Vault 路径（`{dir}/{id}.js`），且可能来自**远程市场清单**，
 * 必须拦住路径分隔符与 `..`，否则安装可越界写入、卸载可删除任意 .js。
 */
describe('assertSafeAssetId：市场素材 id 安全校验', () => {
  it('合法 id 通过（含中文 / 短横线 / 下划线 / 点）', () => {
    expect(assertSafeAssetId('竹林青绿')).toBe('竹林青绿');
    expect(assertSafeAssetId('bamboo-green_v2.0')).toBe('bamboo-green_v2.0');
  });

  it('去首尾空白', () => {
    expect(assertSafeAssetId('  竹林青绿  ')).toBe('竹林青绿');
  });

  it('空值 / 纯空白抛错', () => {
    expect(() => assertSafeAssetId('')).toThrow();
    expect(() => assertSafeAssetId('   ')).toThrow();
  });

  it('路径分隔符抛错', () => {
    expect(() => assertSafeAssetId('a/b')).toThrow();
    expect(() => assertSafeAssetId('a\\b')).toThrow();
  });

  it('路径遍历（..）抛错 —— 卸载时可删任意文件，必须拦死', () => {
    expect(() => assertSafeAssetId('..')).toThrow();
    expect(() => assertSafeAssetId('../../evil')).toThrow();
    expect(() => assertSafeAssetId('a..b')).toThrow();
  });

  it('文件名非法字符抛错', () => {
    for (const bad of ['a:b', 'a*b', 'a?b', 'a"b', 'a<b', 'a>b', 'a|b']) {
      expect(() => assertSafeAssetId(bad)).toThrow();
    }
  });

  it('过长抛错', () => {
    expect(() => assertSafeAssetId('x'.repeat(121))).toThrow();
    expect(() => assertSafeAssetId('x'.repeat(120))).not.toThrow();
  });

  it('控制字符抛错', () => {
    expect(() => assertSafeAssetId('a\u0000b')).toThrow();
  });

  it('错误信息带 label，便于定位来源', () => {
    expect(() => assertSafeAssetId('../x', '主题 id')).toThrow(/主题 id/);
  });
});
