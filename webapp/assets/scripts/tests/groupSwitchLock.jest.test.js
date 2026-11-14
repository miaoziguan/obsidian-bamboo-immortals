/**
 * @jest-environment jsdom
 */
// 切组/新建组窗口的「_switching 锁」回归锁（对应批次一 A2）。
// 背景：切组/新建组期间有多处 await（_persistDoc → setCurrent → _loadDoc），
// 若期间有防抖保存（_scheduleSave）落地，会用「旧组的画布内容」写进「新组的文件」。
// 而 scheduleSave 只挡 ctrl._switching、不挡 ctrl._docBusy；这些组操作此前只置 _docBusy。
// 修复：组操作复用 setMode 已有的 _switching 语义，在 await 窗口内持锁、finally 复位。
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false };
const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/ModeController.js', 'ModeController');

function makeCtrl() {
    return {
        _mode: 'write',
        _docBusy: false,
        _switching: false,
        _saveTimer: null,
        _exitAllEdits() { },
        _hideDocPanel() { },
        _persistDoc: async () => { },
        _loadDoc: async () => { },
        _scheduleRenderLinks() { },
        _refreshDocBtnLabel: async () => { },
        _renderDocPanel: async () => { },
        _showScreenMsg() { },
        _undoStack: { reset() { } },
    };
}

describe('切组/新建组窗口持有 _switching 锁', () => {
    beforeEach(() => {
        global.TypewriterStore = {
            getCurrentWritingGroup: async () => ({ id: 'a' }),
            setWritingCurrent: async () => { },
            createWritingGroup: async () => ({ id: 'b', title: 'x' }),
            getCurrentNotesGroup: async () => ({ id: 'a' }),
            setNotesCurrent: async () => { },
            createNotesGroup: async () => ({ id: 'b', title: 'x' }),
        };
    });

    test('switchWritingGroup：await 窗口内 _switching=true，结束后复位', async () => {
        const ctrl = makeCtrl();
        let during = null;
        ctrl._persistDoc = async () => { during = ctrl._switching; };

        await ModeController.switchWritingGroup({ state: {}, ctrl }, 'b');

        expect(during).toBe(true);       // 锁在 persistDoc 的 await 期间已持有
        expect(ctrl._switching).toBe(false); // finally 复位
        expect(ctrl._docBusy).toBe(false);
    });

    test('createWritingGroup：await 窗口内 _switching=true，结束后复位', async () => {
        const ctrl = makeCtrl();
        let during = null;
        ctrl._persistDoc = async () => { during = ctrl._switching; };

        await ModeController.createWritingGroup({ state: {}, ctrl });

        expect(during).toBe(true);
        expect(ctrl._switching).toBe(false);
        expect(ctrl._docBusy).toBe(false);
    });

    // 返回值契约：调用方（从笔记导入）要靠它区分「真建好了」与「被锁拒掉」，
    // 否则会静默失败却报成功。
    test('createWritingGroup 成功返回 true', async () => {
        const ctrl = makeCtrl();
        expect(await ModeController.createWritingGroup({ state: {}, ctrl })).toBe(true);
    });

    test('createWritingGroup 被忙碌锁拒绝返回 false，且不改锁状态', async () => {
        const ctrl = makeCtrl();
        ctrl._switching = true;   // 模拟另一处组操作/切档正在进行
        ctrl._persistDoc = jest.fn(async () => { });
        expect(await ModeController.createWritingGroup({ state: {}, ctrl })).toBe(false);
        expect(ctrl._persistDoc).not.toHaveBeenCalled();
        expect(ctrl._docBusy).toBe(false);
    });

    test('createWritingGroup 非写作档返回 false', async () => {
        const ctrl = makeCtrl();
        ctrl._mode = 'notes';
        expect(await ModeController.createWritingGroup({ state: {}, ctrl })).toBe(false);
    });

    test('switchNotesGroup：await 窗口内 _switching=true，结束后复位', async () => {
        const ctrl = makeCtrl();
        ctrl._mode = 'notes';
        let during = null;
        ctrl._persistDoc = async () => { during = ctrl._switching; };

        await ModeController.switchNotesGroup({ state: {}, ctrl }, 'b');

        expect(during).toBe(true);
        expect(ctrl._switching).toBe(false);
        expect(ctrl._docBusy).toBe(false);
    });

    test('createNotesGroup：await 窗口内 _switching=true，结束后复位', async () => {
        const ctrl = makeCtrl();
        ctrl._mode = 'notes';
        let during = null;
        ctrl._persistDoc = async () => { during = ctrl._switching; };

        await ModeController.createNotesGroup({ state: {}, ctrl });

        expect(during).toBe(true);
        expect(ctrl._switching).toBe(false);
        expect(ctrl._docBusy).toBe(false);
    });
});
