/**
 * @jest-environment jsdom
 */
// SpatialIndex（P8 空间索引）单测：正确性 + 旋转 AABB + 增量更新 + O(可视) 行为。
const { loadModule } = require('./__helpers__/testUtils');

const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);

describe('SpatialIndex 均匀网格空间哈希', () => {
  test('insert + queryRect：相交即命中，远离不命中', () => {
    const idx = new SpatialIndex(512);
    idx.insert('a', 100, 100, 200, 100, 0); // AABB ≈ [100,300]×[100,200]
    const hit = idx.queryRect(250, 150, 400, 300); // 与 a 相交
    expect(hit.has('a')).toBe(true);
    const miss = idx.queryRect(2000, 2000, 2100, 2100); // 远离
    expect(miss.has('a')).toBe(false);
    expect(miss.size).toBe(0);
  });

  test('旋转卡的 AABB：rot=90 把 200×100 卡变成 100×200 包围盒', () => {
    const idx = new SpatialIndex(512);
    // 中心 (200,150)，rot=90 → AABB ≈ [150,250]×[100,200]
    idx.insert('r', 100, 100, 200, 100, 90);
    expect(idx.queryRect(180, 50, 220, 250).has('r')).toBe(true);   // 竖向条带命中
    expect(idx.queryRect(50, 180, 90, 220).has('r')).toBe(false);   // 左侧空白不命中（原未旋转会命中）
  });

  test('update 把卡移出视口后 queryRect 不再返回', () => {
    const idx = new SpatialIndex(512);
    idx.insert('a', 100, 100, 200, 100, 0);
    expect(idx.queryRect(250, 150, 400, 300).has('a')).toBe(true);
    idx.update('a', 5000, 5000, 200, 100, 0); // 移到远处
    expect(idx.queryRect(250, 150, 400, 300).has('a')).toBe(false);
    expect(idx.queryRect(5000, 5000, 5200, 5100).has('a')).toBe(true);
  });

  test('remove / has / clear', () => {
    const idx = new SpatialIndex(512);
    idx.insert('a', 0, 0, 100, 100, 0);
    expect(idx.has('a')).toBe(true);
    idx.remove('a');
    expect(idx.has('a')).toBe(false);
    expect(idx.size).toBe(0);
    expect(idx.queryRect(-10, -10, 110, 110).size).toBe(0);
    idx.insert('b', 0, 0, 10, 10, 0);
    idx.clear();
    expect(idx.size).toBe(0);
  });

  test('bounds 返回全部几何包围盒', () => {
    const idx = new SpatialIndex(512);
    expect(idx.bounds()).toBeNull();
    idx.insert('a', 0, 0, 100, 100, 0);
    idx.insert('b', 900, 900, 100, 100, 0);
    const b = idx.bounds();
    expect(b).toEqual({ minX: 0, minY: 0, maxX: 1000, maxY: 1000 });
  });

  test('O(可视)：5000 张卡散布大画布，视口查询返回量远小于总量', () => {
    const N = 5000;
    const AREA = 10000; // 10000×10000 画布
    const idx = new SpatialIndex(512);
    let seeded = 0;
    // 固定种子伪随机，保证可复现
    let s = 123456789;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    for (let i = 0; i < N; i++) {
      const x = rnd() * (AREA - 300);
      const y = rnd() * (AREA - 200);
      idx.insert('n' + i, x, y, 300, 200, rnd() * 360);
      seeded++;
    }
    expect(seeded).toBe(N);
    // 视口 1200×800 覆盖约 1200*800/(10000*10000)=9.6% → 期望 ~480 张以内
    const hits = idx.queryRect(0, 0, 1200, 800);
    expect(hits.size).toBeGreaterThan(0);
    expect(hits.size).toBeLessThan(N / 2); // 严格小于总量，证明不是全量扫
  });
});
