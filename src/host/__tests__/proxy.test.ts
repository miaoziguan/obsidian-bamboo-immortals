import { describe, test, expect } from 'vitest';
import { isValidAudioUrl } from '../AppAPI';

describe('isValidAudioUrl', () => {
  test('放行 http/https 音源链接', () => {
    expect(isValidAudioUrl('http://example.com/a.mp3')).toBe(true);
    expect(isValidAudioUrl('https://example.com/a.ogg')).toBe(true);
  });

  test('拒绝非 http/https 协议与非法输入', () => {
    expect(isValidAudioUrl('file:///etc/passwd')).toBe(false);
    expect(isValidAudioUrl('data:text/html,<script>')).toBe(false);
    expect(isValidAudioUrl('javascript:alert(1)')).toBe(false);
    expect(isValidAudioUrl('ftp://example.com/a.mp3')).toBe(false);
    expect(isValidAudioUrl('')).toBe(false);
    expect(isValidAudioUrl('not-a-url')).toBe(false);
  });

  test('拒绝超长链接', () => {
    expect(isValidAudioUrl('https://example.com/' + 'a'.repeat(3000))).toBe(false);
  });
});
