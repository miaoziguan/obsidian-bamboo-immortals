const { loadModule } = require('./__helpers__/testUtils.js');

const { computeFitScale, fitCardText, MIN_FIT_SCALE } = loadModule(
  'utils/cardTextFit.js',
  ['computeFitScale', 'fitCardText', 'MIN_FIT_SCALE'],
  {}
);

describe('便签正文字号自适应（computeFitScale 纯函数）', () => {
  test('放得下 → 不缩放（返回 1）', () => {
    expect(computeFitScale(100, 120)).toBe(1);
    expect(computeFitScale(120, 120)).toBe(1);
  });

  test('无布局信息（jsdom / 未挂载）→ 不缩放', () => {
    expect(computeFitScale(0, 0)).toBe(1);
    expect(computeFitScale(50, 0)).toBe(1);
  });

  test('放不下 → 按可视/内容比估算，并留 2% 余量（未触下限时）', () => {
    // 100/120 = 0.8333，乘 0.98 = 0.8167 → 取两位 0.82
    expect(computeFitScale(120, 100)).toBe(0.82);
  });

  test('估算值低于下限时按下限（可读性保底，宁可滚动也不无限缩小）', () => {
    // 100/200 = 0.5 → 低于下限 0.7
    expect(computeFitScale(200, 100)).toBe(MIN_FIT_SCALE);
  });

  test('再怎么放不下也不低于下限', () => {
    const s = computeFitScale(10000, 100);   // 比例 0.01，远低于下限
    expect(s).toBe(MIN_FIT_SCALE);
  });

  test('下限可配置', () => {
    expect(computeFitScale(10000, 100, 0.5)).toBe(0.5);
  });
});

describe('fitCardText 的适用范围', () => {
  test('自适应高度的正文（overflow 非 auto/scroll）→ 跳过并复原字号', () => {
    const card = document.createElement('div');
    const text = document.createElement('div');
    text.className = 'tw-card-text';
    text.style.fontSize = '12px';           // 假设之前被缩过
    card.appendChild(text);
    expect(fitCardText(card)).toBe(1);
    expect(text.style.fontSize).toBe('');   // 复原为基准
  });

  test('定框正文（overflow:auto）在拿不到布局时不改动（jsdom 无布局）', () => {
    const card = document.createElement('div');
    const text = document.createElement('div');
    text.className = 'tw-card-text';
    text.style.overflowY = 'auto';
    card.appendChild(text);
    expect(fitCardText(card)).toBe(1);      // scrollHeight/clientHeight 均为 0 → 视为放得下
    expect(text.style.fontSize).toBe('');
  });
});
