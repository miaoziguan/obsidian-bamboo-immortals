/**
 * LifeEventService — 年度修为报告的「人生事件」埋点
 *
 * 纯增量写入，落 storageManager 的 setting key 'lifeEvents'（即 settings.json），
 * 与插件端 VaultStorage.getSetting('lifeEvents') 共享同一份数据。
 *
 * 记录两类事件：
 *  - completed：目标进度跨过 100%（达成），并带境界层变化（realmBefore/realmAfter）；
 *  - abandoned：目标被归档（放弃），带放弃那一刻的完成度快照 progressAtEvent。
 *
 * 老用户升级前无历史事件，年报其余指标（连胜/停摆/维度）不受影响，
 * 仅「放弃/突破时间线」从升级日起逐步积累。
 */
export const LifeEventService = (() => {
    const KEY = 'lifeEvents';
    const MAX_EVENTS = 2000; // 防御性上限，避免极端使用下数组无限膨胀

    function _todayStr() {
        const d = new Date();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${m}-${day}`;
    }

    async function getEvents() {
        try {
            const raw = await storageManager.getSetting(KEY);
            if (!Array.isArray(raw)) return [];
            return raw;
        } catch (e) {
            console.warn('[LifeEventService] 读取事件失败，返回空:', e);
            return [];
        }
    }

    async function _append(event) {
        const events = await getEvents();
        events.push(event);
        if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
        await storageManager.putSetting(KEY, events);
    }

    /**
     * 记录「达成」事件。
     * @param {object} goal 目标对象（含 id/title/category/progress）
     * @param {number} oldCompleted 突破前已完成目标数
     * @param {number} newCompleted 突破后已完成目标数
     */
    async function recordCompleted(goal, oldCompleted, newCompleted) {
        if (typeof CultivationData === 'undefined') return;
        const oldData = CultivationData.getRealmData(oldCompleted);
        const newData = CultivationData.getRealmData(newCompleted);
        const layerDelta = newData.current.layer - oldData.current.layer;
        if (layerDelta <= 0) return; // 未真正跨层，不记
        await _append({
            id: `c_${goal.id}_${Date.now()}`,
            type: 'completed',
            goalId: goal.id,
            title: goal.title || '未命名目标',
            category: goal.category || 'other',
            date: _todayStr(),
            progressAtEvent: 100,
            layerDelta,
            realmBefore: { realm: oldData.current.realm, layer: oldData.current.layer },
            realmAfter: { realm: newData.current.realm, layer: newData.current.layer },
        });
    }

    /**
     * 记录「放弃」事件（目标被归档）。
     * @param {object} goal 目标对象（含 id/title/category/progress）
     */
    async function recordAbandoned(goal) {
        await _append({
            id: `a_${goal.id}_${Date.now()}`,
            type: 'abandoned',
            goalId: goal.id,
            title: goal.title || '未命名目标',
            category: goal.category || 'other',
            date: _todayStr(),
            progressAtEvent: Math.round(goal.progress || 0),
        });
    }

    return { getEvents, recordCompleted, recordAbandoned };
})();

window.LifeEventService = LifeEventService;
