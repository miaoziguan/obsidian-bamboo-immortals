// 共享状态单主（解耦 B5 / 复盘 4.2）：_notes/_geo/_spatial/_mountedCards/_links/_selected/_canvasOffset/_mode
// 经存取器代理到 _state（NotesState 实例），确保数据真源唯一、与「方法集合」解耦。
const { loadModule } = require('./__helpers__/testUtils');
const { TypewriterFeature: feature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);

describe('共享状态单主 NotesState（解耦 B5）', () => {
  test('8 字段经存取器代理到 _state，数据真源唯一', () => {
    expect(feature._state).toBeDefined();
    // 读取走 getter：与 _state 同源
    expect(feature._notes).toBe(feature._state.notes);
    expect(feature._geo).toBe(feature._state.geo);
    expect(feature._spatial).toBe(feature._state.spatial);
    expect(feature._mountedCards).toBe(feature._state.mountedCards);
    expect(feature._links).toBe(feature._state.links);
    expect(feature._selected).toBe(feature._state.selected);
    expect(feature._canvasOffset).toBe(feature._state.canvasOffset);
    expect(feature._mode).toBe(feature._state.mode);
  });

  test('写入走 setter：改动反映到 _state（杜绝镜像漂移）', () => {
    const arr = [{ id: 'x', text: 'hi' }];
    feature._notes = arr;
    expect(feature._state.notes).toBe(arr);
    feature._mode = 'write';
    expect(feature._state.mode).toBe('write');
    feature._mode = 'notes'; // 复位，避免影响后续
  });
});
