/**
 * @jest-environment jsdom
 *
 * protocol.js 测试（阶段3 · 契约化 第一批）：
 * - APP_MESSAGE_TYPES 覆盖 §1 全部已知类型（单一事实源）；
 * - parseAppMessage 统一「来源校验 + type 合法性」，替代散落的裸 event.source 比较；
 * - PROTOCOL_VERSION 供后续版本协商。
 */
const { loadModule } = require('./__helpers__/testUtils');
const {
  PROTOCOL_VERSION,
  APP_MESSAGE_TYPES,
  parseAppMessage,
  isKnownType,
} = loadModule('utils/protocol.js', [
  'PROTOCOL_VERSION',
  'APP_MESSAGE_TYPES',
  'parseAppMessage',
  'isKnownType',
]);

function makeEvent(type, payload, source) {
  return new MessageEvent('message', {
    source: source ?? window,
    data: payload !== undefined ? { type, payload } : { type },
  });
}

describe('protocol.js 协议单一事实源', () => {
  test('PROTOCOL_VERSION 为数字', () => {
    expect(typeof PROTOCOL_VERSION).toBe('number');
  });

  test('APP_MESSAGE_TYPES 覆盖 §1 全部已知类型', () => {
    const must = [
      'app:ready', 'app:close', 'app:saveSectionConfig', 'app:saveCustomNoises',
      'app:theme:sync', 'theme:syncPalette', 'app:listVaultAudioFiles',
      'app:readVaultFile', 'app:readLocalFile', 'app:proxyAudioUrl',
      'app:aiImproveGoal',
      'storage:readDay', 'storage:writeDay', 'storage:clearAll',
      'theme:changed', 'theme:followDisabled', 'theme:syncPaletteEnabled',
      'nav:prevDay', 'nav:nextDay', 'nav:today',
      'action:openStats', 'action:openSettings',
    ];
    for (const t of must) expect(APP_MESSAGE_TYPES).toContain(t);
  });

  test('isKnownType：精确匹配 + storage: 前缀；拒绝未知/非法', () => {
    expect(isKnownType('nav:prevDay')).toBe(true);
    expect(isKnownType('storage:getDaysPaginated')).toBe(true);
    expect(isKnownType('storage:whatever')).toBe(true);
    expect(isKnownType('evil:hack')).toBe(false);
    expect(isKnownType(123)).toBe(false);
  });

  test('parseAppMessage：来源相符 + 已知 type → 返回解析结果', () => {
    const evt = makeEvent('nav:nextDay', { x: 1 }, window);
    const r = parseAppMessage(evt, window);
    expect(r).not.toBeNull();
    expect(r.type).toBe('nav:nextDay');
    expect(r.payload).toEqual({ x: 1 });
  });

  test('parseAppMessage：来源不符 → null', () => {
    const evt = makeEvent('nav:nextDay', undefined, {});
    expect(parseAppMessage(evt, window)).toBeNull();
  });

  test('parseAppMessage：未知 type → null', () => {
    const evt = makeEvent('evil:hack', undefined, window);
    expect(parseAppMessage(evt, window)).toBeNull();
  });

  test('parseAppMessage：无 data → null', () => {
    const evt = new MessageEvent('message', { source: window, data: null });
    expect(parseAppMessage(evt, window)).toBeNull();
  });

  test('parseAppMessage：透传 protocolVersion', () => {
    const evt = new MessageEvent('message', {
      source: window,
      data: { type: 'app:ready', protocolVersion: 2 },
    });
    const r = parseAppMessage(evt, window);
    expect(r.protocolVersion).toBe(2);
  });
});
