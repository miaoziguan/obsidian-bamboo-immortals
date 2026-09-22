/**
 * 画中卷「重启后开香道误关打字机」回归测试（源码级）。
 *
 * 根因：openScrollAt 的复用匹配与「清理其它同功能 leaf」循环，原先用贴在 leaf 对象上的
 * 运行时装饰 __scrollFeature 判断功能；该装饰只在 openScrollAt 写入、不持久化，
 * Obsidian 重启/热重载/布局重建后随 leaf 重建而丢失，回退默认 'incense'。
 * 于是「重启后已恢复的打字机 leaf」被误判为香道，打开香道时遭 detach。
 *
 * 修复：功能解析改读 leaf.getViewState().state.feature（ScrollView.getState 持久化、
 * 重启经 setState 回填的权威来源）；且 setViewState 已把 feature/location 写入 state，
 * 使重启后该 leaf 的 getViewState().state.feature 仍是 'typewriter'。
 */
const fs = require('fs');
const path = require('path');

const mainSrc = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', '..', 'main.ts'), 'utf8'
);

describe('画中卷重开焦点回归（香道不应误关打字机）', () => {
  test('根因装饰 __scrollFeature / __scrollLocation 已全部移除', () => {
    expect(mainSrc).not.toContain('__scrollFeature');
    expect(mainSrc).not.toContain('__scrollLocation');
  });

  test('功能解析改读 getViewState 持久化状态（新增 scrollLeafFeature 辅助）', () => {
    expect(mainSrc).toContain('function scrollLeafFeature(');
    // 辅助函数必须从 getViewState 读取，而非瞬时装饰
    const helper = mainSrc.slice(mainSrc.indexOf('function scrollLeafFeature('));
    expect(helper).toContain('getViewState()');
    // 清理循环使用新辅助函数
    expect(mainSrc).toContain('const lf = scrollLeafFeature(l) ?? \'incense\';');
    // 复用匹配也使用新辅助函数
    expect(mainSrc).toContain('const lf = scrollLeafFeature(l) ?? \'incense\';');
  });

  test('setViewState 将 feature / location 写入持久化 state（重启可恢复）', () => {
    const i = mainSrc.indexOf('target.setViewState(');
    const block = mainSrc.slice(i, i + 200);
    expect(block).toContain('state: { feature: incomingFeature, location: loc }');
  });

  test('打开香道时的「清理循环」只关同功能 leaf，且基于 getViewState', () => {
    const i = mainSrc.indexOf('existing.forEach((l) => {');
    const block = mainSrc.slice(i, i + 220);
    expect(block).toContain('if (l === target) return;');
    expect(block).toContain('const lf = scrollLeafFeature(l) ?? \'incense\';');
    expect(block).toContain('if (lf === incomingFeature) l.detach();');
  });
});
