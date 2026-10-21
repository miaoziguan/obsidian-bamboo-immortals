/**
 * @jest-environment jsdom
 */
// 回归锁：贴纸依附便签后的坐标换算与位移抵消。
//
// 1) 依附态贴纸是卡片的 DOM 子元素，父级 transform 已含画布拖拽位移（--tw-drag-x/y）。
//    若贴纸自身 transform 再叠一份 translate(var(--tw-drag-x),var(--tw-drag-y))，
//    拖动卡片时贴纸会被平移两次 → 相对卡片漂移；松手后变量清零才归位（P1-3 实测 bug）。
//    故依附态 transform 只能保留自身 rotate，自由态才需要自带拖拽位移。
// 2) 依附坐标是「相对便签」的 %宽 / em高，屏幕↔本地的换算必须抵消画布缩放与卡片旋转。
const { loadModule } = require('./__helpers__/testUtils');

/** 造一张可预测尺寸的便签卡（jsdom 的 offsetWidth/getComputedStyle 需显式给定） */
function makeCard({ w = 400, h = 300, fs = 16, rot = 0, left = 100, top = 50 } = {}) {
  const card = document.createElement('div');
  card.className = 'tw-card';
  card.dataset.id = 'n1';
  card.style.position = 'absolute';
  card.style.left = left + 'px';
  card.style.top = top + 'px';
  card.style.fontSize = fs + 'px';
  card.style.setProperty('--tw-card-rot', String(rot));
  Object.defineProperty(card, 'offsetWidth', { value: w, configurable: true });
  Object.defineProperty(card, 'offsetHeight', { value: h, configurable: true });
  return card;
}

function setup({ w = 400, h = 300, fs = 16, rot = 0, left = 100, top = 50 } = {}) {
  const canvas = document.createElement('div');
  document.body.appendChild(canvas);
  const card = makeCard({ w, h, fs, rot, left, top });
  canvas.appendChild(card);

  const domref = loadModule('utils/domRef.js', ['getStyleMount', 'byId']);
  const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket'], {
    byId: domref.byId, getStyleMount: domref.getStyleMount,
  });

  const ctrl = { _canvas: canvas, _zTop: 0 };
  MaterialMarket._ctrl = ctrl;
  MaterialMarket._installed = {};
  MaterialMarket._saveStickers = () => {};        // 隔离持久化
  MaterialMarket._ensureDecoLayer = () => canvas;

  return { MaterialMarket, ctrl, canvas, card, restore: () => { canvas.remove(); } };
}

/** 同步执行 rAF，让拖拽 apply() 立刻落定，避免等待帧 */
function withSyncRaf() {
  const prevRaf = global.requestAnimationFrame;
  const prevCancel = global.cancelAnimationFrame;
  global.requestAnimationFrame = (cb) => { cb(); return 0; };
  global.cancelAnimationFrame = () => {};
  return () => { global.requestAnimationFrame = prevRaf; global.cancelAnimationFrame = prevCancel; };
}

describe('依附态贴纸：transform 不得叠加画布拖拽位移', () => {
  test('依附态只保留自身 rotate；自由态才带 translate(--tw-drag-x/y)', () => {
    const { MaterialMarket, restore } = setup();
    try {
      const rec = {
        id: 's1', material: 'm1', parentId: 'n1',
        rx: 10, ry: 2, rw: 35, rh: 5, rot: 7, w: 120, h: 60,
        x: 0, y: 0, el: document.createElement('div'),
      };
      MaterialMarket._applyStickerBox(rec);
      expect(rec.el.style.transform).toBe('rotate(7deg)');
      expect(rec.el.style.transform).not.toContain('--tw-drag');

      rec.parentId = null;                       // 转为自由态
      MaterialMarket._applyStickerBox(rec);
      expect(rec.el.style.transform).toContain('translate(var(--tw-drag-x');
      expect(rec.el.style.transform).toContain('rotate(7deg)');
    } finally {
      restore();
    }
  });
});

describe('依附坐标换算：抵消卡片旋转', () => {
  test('attach → detach 往返无损（旋转 30°，坐标与尺寸复原）', () => {
    const { MaterialMarket, card, restore } = setup({ rot: 30 });
    try {
      const rec = {
        id: 's2', material: 'm1', parentId: null,
        x: 150, y: 80, w: 120, h: 60, rot: 0, el: document.createElement('div'),
      };
      expect(MaterialMarket._attachSticker(rec, card)).toBe(true);
      expect(rec.parentId).toBe('n1');

      MaterialMarket._detachSticker(rec);
      expect(rec.parentId).toBeNull();
      expect(rec.x).toBeCloseTo(150, 3);
      expect(rec.y).toBeCloseTo(80, 3);
      expect(rec.w).toBe(120);
      expect(rec.h).toBe(60);
    } finally {
      restore();
    }
  });

  test('由 rx/ry 还原的本地中心，正向旋转后回到原屏幕偏移（证明旋转被抵消而非忽略）', () => {
    const mw = 400, mh = 300, fs = 16, rot = 30;
    const { MaterialMarket, card, restore } = setup({ w: mw, h: mh, fs, rot });
    try {
      const rec = {
        id: 's3', material: 'm1', parentId: null,
        x: 150, y: 80, w: 120, h: 60, rot: 0, el: document.createElement('div'),
      };
      MaterialMarket._attachSticker(rec, card);

      const cx = 100 + mw / 2, cy = 50 + mh / 2;
      const ox = (150 + 120 / 2) - cx;            // 原屏幕偏移（贴纸中心 - 卡片中心）
      const oy = (80 + 60 / 2) - cy;

      const localCx = (rec.rx / 100) * mw + 120 / 2 - mw / 2;
      const localCy = rec.ry * fs + 60 / 2 - mh / 2;
      const f = (rot * Math.PI) / 180;
      expect(localCx * Math.cos(f) - localCy * Math.sin(f)).toBeCloseTo(ox, 4);
      expect(localCx * Math.sin(f) + localCy * Math.cos(f)).toBeCloseTo(oy, 4);
    } finally {
      restore();
    }
  });
});

describe('依附态拖拽：抵消画布缩放与卡片旋转', () => {
  test('屏幕位移先除以画布缩放（scale=0.5 → 本地位移翻倍）', () => {
    const restoreRaf = withSyncRaf();
    const { MaterialMarket, ctrl, card, restore } = setup({ rot: 0 });
    const prevVp = global.CanvasViewport;
    global.CanvasViewport = { getScale: () => 0.5 };
    try {
      const el = document.createElement('div');
      const rec = { id: 's4', material: 'm1', parentId: 'n1', rx: 10, ry: 2, rw: 35, rh: 5, rot: 0, el };
      MaterialMarket._startAttachedDrag(ctrl, el, rec, { clientX: 0, clientY: 0 });

      document.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 0 }));
      // dx=100 / 0.5 = 200 本地 px → 200/400*100 = 50%
      expect(rec.rx).toBeCloseTo(60, 5);          // 10 + 50
      expect(rec.ry).toBeCloseTo(2, 5);           // 纵向无位移
      expect(el.style.left).toBe('60%');

      document.dispatchEvent(new MouseEvent('pointerup', {}));
    } finally {
      global.CanvasViewport = prevVp;
      restoreRaf();
      restore();
    }
  });

  test('卡片旋转 90°：水平屏幕拖拽只产生本地纵向位移（rx 不变）', () => {
    const restoreRaf = withSyncRaf();
    const { MaterialMarket, ctrl, card, restore } = setup({ rot: 90 });
    const prevVp = global.CanvasViewport;
    global.CanvasViewport = { getScale: () => 1 };
    try {
      const el = document.createElement('div');
      const rec = { id: 's5', material: 'm1', parentId: 'n1', rx: 10, ry: 2, rw: 35, rh: 5, rot: 0, el };
      MaterialMarket._startAttachedDrag(ctrl, el, rec, { clientX: 0, clientY: 0 });

      document.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 0 }));
      // th=-90° → lx=0, ly=-100 → ry = 2 + (-100/16) = -4.25
      expect(rec.rx).toBeCloseTo(10, 5);          // 旋转被抵消，横向不动
      expect(rec.ry).toBeCloseTo(-4.25, 5);       // 屏幕右移 → 卡片本地上移

      document.dispatchEvent(new MouseEvent('pointerup', {}));
    } finally {
      global.CanvasViewport = prevVp;
      restoreRaf();
      restore();
    }
  });
});
