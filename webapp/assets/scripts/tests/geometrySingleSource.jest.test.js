// 几何单源（【解耦 B2 / 复盘 A4】）：setGeom / removeGeom 是 GeoCache(state.geo) 与空间索引(state.spatial)
// 的唯一写入入口，任何几何变更都应经它，杜绝「只改一处导致另一处停在旧位置」的漂移
//（连线端点指幽灵位置、剔除按旧位置挂卸）。
// 本文件同时验证「模块真解耦」后 ViewportCuller 方法统一收 ctx={state,ctrl}：数据走 state、依赖走 ctrl。
const { loadModule } = require('./__helpers__/testUtils');

const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
const { ViewportCuller } = loadModule('services/ViewportCuller.js', ['ViewportCuller']);

global.GeoCache = GeoCache;
global.SpatialIndex = SpatialIndex;

// 造一个假的宿主：state 与 ctrl 都指向它自己（数据字段用 .geo/.spatial/.mountedCards，依赖字段用 .noteIndex 等）
function fakeHost(extra) {
  return Object.assign({ geo: null, spatial: null, mountedCards: new Map(), _noteIndex() { return new Map(); } }, extra || {});
}
function ctxOf(f) { return { state: f, ctrl: f }; }

describe('几何单源 setGeom / removeGeom（ctx 解耦后）', () => {
  test('setGeom 同时刷新 geo 与 spatial，两处严格一致', () => {
    const f = fakeHost();
    ViewportCuller.setGeom(ctxOf(f), 'a', { x: 10, y: 20, w: 100, h: 50, rot: 30 });
    expect(f.geo.get('a')).toEqual({ x: 10, y: 20, w: 100, h: 50, rot: 30 });
    expect(f.spatial.has('a')).toBe(true);

    // 改尺寸只走 setGeom —— 两处同步更新
    ViewportCuller.setGeom(ctxOf(f), 'a', { x: 10, y: 20, w: 200, h: 80, rot: 0 });
    expect(f.geo.get('a').w).toBe(200);
    const bb = f.spatial._aabb(10, 20, 200, 80, 0);
    expect(f.spatial.queryRect(bb.minX, bb.minY, bb.maxX, bb.maxY).has('a')).toBe(true);
  });

  test('measureCard 经 setGeom 同时入 geo 与 spatial', () => {
    const f = fakeHost();
    const card = {
      dataset: { id: 'c1', rot: '0' },
      style: { left: '5px', top: '7px' },
      offsetWidth: 120, offsetHeight: 60,
    };
    ViewportCuller.measureCard(ctxOf(f), card);
    expect(f.geo.get('c1')).toEqual({ x: 5, y: 7, w: 120, h: 60, rot: 0 });
    expect(f.spatial.has('c1')).toBe(true);
  });

  test('removeGeom 同时清 geo 与 spatial', () => {
    const f = fakeHost({ geo: new GeoCache(), spatial: new SpatialIndex(512) });
    f.geo.set('a', { x: 0, y: 0, w: 1, h: 1, rot: 0 });
    f.spatial.insert('a', 0, 0, 1, 1, 0);
    ViewportCuller.removeGeom(ctxOf(f), 'a');
    expect(f.geo.has('a')).toBe(false);
    expect(f.spatial.has('a')).toBe(false);
  });

  test('syncLayoutGeo 离屏卡：模型坐标经 setGeom 同时刷新 geo 与 spatial', () => {
    const note = { id: 'o1', x: 300, y: 400 };
    const f = fakeHost({
      geo: new GeoCache(),
      spatial: new SpatialIndex(512),
      _noteIndex() { return new Map([[note.id, note]]); },
    });
    f.geo.set('o1', { x: 0, y: 0, w: 100, h: 50, rot: 0 }); // 旧位置
    f.spatial.update('o1', 0, 0, 100, 50, 0);
    ViewportCuller.syncLayoutGeo(ctxOf(f));
    expect(f.geo.get('o1')).toEqual({ x: 300, y: 400, w: 100, h: 50, rot: 0 });
    const bb = f.spatial._aabb(300, 400, 100, 50, 0);
    expect(f.spatial.queryRect(bb.minX, bb.minY, bb.maxX, bb.maxY).has('o1')).toBe(true);
  });
});
