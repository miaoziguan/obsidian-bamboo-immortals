import { describe, it, expect } from 'vitest';
import { planIframe } from '../iframeNormalize';

describe('协议相对 URL 会让 iframe 必然加载失败（src 需补 https）', () => {
  it('//player.xxx 补成 https://player.xxx', () => {
    expect(planIframe('//player.bilibili.com/player.html?bvid=X', null, null).src).toBe(
      'https://player.bilibili.com/player.html?bvid=X',
    );
  });

  it('已带协议的 URL 保持不动', () => {
    expect(planIframe('https://example.com/a', null, null).src).toBeUndefined();
    expect(planIframe('http://example.com/a', null, null).src).toBeUndefined();
  });

  it('data: / about: / 相对路径不动', () => {
    expect(planIframe('data:text/html,x', null, null).src).toBeUndefined();
    expect(planIframe('about:blank', null, null).src).toBeUndefined();
    expect(planIframe('videos/a.mp4', null, null).src).toBeUndefined();
  });

  it('空值与 null 不报错', () => {
    expect(planIframe(null, null, null).src).toBeUndefined();
    expect(planIframe('', null, null).src).toBeUndefined();
  });
});

describe('把属性宽高转成 aspect-ratio，避免压窄后纵向拉伸', () => {
  it('竖屏 720×1280 → 生成比例字符串', () => {
    expect(planIframe(null, '720', '1280')).toEqual({ aspectRatio: '720 / 1280' });
  });

  it('横屏 560×315 同样处理', () => {
    expect(planIframe(null, '560', '315')).toEqual({ aspectRatio: '560 / 315' });
  });

  it('无宽高属性 → 不推导（交给 CSS 兜底）', () => {
    expect(planIframe(null, null, null)).toEqual({});
    expect(planIframe(null, '', '')).toEqual({});
  });

  it('带单位的百分比不算数值 → 不推导（否则会算出 NaN 比例）', () => {
    expect(planIframe(null, '100%', '100%')).toEqual({});
    expect(planIframe(null, '100%', '315')).toEqual({});
  });

  it('非数字同样不推导', () => {
    expect(planIframe(null, 'abc', '315')).toEqual({});
  });

  it('协议相对 + 宽高：两项同时给出', () => {
    expect(planIframe('//player.example.com/x', '720', '1280')).toEqual({
      src: 'https://player.example.com/x',
      aspectRatio: '720 / 1280',
    });
  });

  it('0 或负数不推导', () => {
    expect(planIframe(null, '0', '315')).toEqual({});
    expect(planIframe(null, '-560', '315')).toEqual({});
  });
});

describe('视频平台分享代码不带宽高时补 16:9（实战样本：B 站新版 embed）', () => {
  // 真实样本：B 站分享面板复制出来的 iframe 只有 src，没有 width/height
  const BILI =
    'https://player.bilibili.com/player.html?isOutside=true&aid=117529716462011&bvid=BV1Pnxq6yEov&cid=43181605861&p=1';

  it('B 站无宽高 → 16:9（否则浏览器退化成 300x150，播放器不可用）', () => {
    expect(planIframe(BILI, null, null)).toEqual({ aspectRatio: '16 / 9' });
  });

  it('B 站协议相对 + 无宽高 → 同时补 https 与 16:9', () => {
    expect(planIframe('//player.bilibili.com/player.html?bvid=X', null, null)).toEqual({
      src: 'https://player.bilibili.com/player.html?bvid=X',
      aspectRatio: '16 / 9',
    });
  });

  it('YouTube / Vimeo 同样识别', () => {
    expect(planIframe('https://www.youtube.com/embed/abc', null, null)).toEqual({ aspectRatio: '16 / 9' });
    expect(planIframe('https://player.vimeo.com/video/123', null, null)).toEqual({ aspectRatio: '16 / 9' });
  });

  it('普通网页 iframe 不擅自改比例', () => {
    expect(planIframe('https://example.com/form', null, null)).toEqual({});
    expect(planIframe('https://map.example.com/embed', null, null)).toEqual({});
  });

  it('视频源若自带宽高，以属性为准而不是 16:9', () => {
    expect(planIframe(BILI, '720', '1280')).toEqual({ aspectRatio: '720 / 1280' });
  });
});
