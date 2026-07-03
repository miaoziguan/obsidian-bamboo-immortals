export const PERIOD_CONFIG = {
    lateNight:  { period: 'lateNight',  name: '凌晨',  time: '00:00 - 04:00', icon: 'moon', eval: 'good', hours: [0, 4] },
    dawn:       { period: 'dawn',       name: '黎明',  time: '04:00 - 05:30', icon: 'sunrise', eval: 'good', hours: [4, 5.5] },
    earlyMorning: { period: 'earlyMorning', name: '清晨', time: '05:30 - 07:00', icon: 'sun', eval: 'good', hours: [5.5, 7] },
    morning:    { period: 'morning',    name: '上午',  time: '07:00 - 12:00', icon: 'briefcase', eval: 'good', hours: [7, 12] },
    midday:     { period: 'midday',     name: '中午',  time: '12:00 - 13:00', icon: 'utensils', eval: 'good', hours: [12, 13] },
    afternoon:  { period: 'afternoon',  name: '下午',  time: '13:00 - 17:00', icon: 'sun', eval: 'good', hours: [13, 17] },
    dusk:       { period: 'dusk',       name: '傍晚',  time: '17:00 - 18:30', icon: 'sunset', eval: 'good', hours: [17, 18.5] },
    evening:    { period: 'evening',    name: '晚上',  time: '18:30 - 22:00', icon: 'coffee', eval: 'good', hours: [18.5, 22] },
    night:      { period: 'night',      name: '深夜',  time: '22:00 - 24:00', icon: 'moon', eval: 'good', hours: [22, 24] }
};

export const TimelineService = {
    getCurrentPeriod() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour + minute / 60;

        if (currentTime >= 0 && currentTime < 4) return 'lateNight';
        if (currentTime >= 4 && currentTime < 5.5) return 'dawn';
        if (currentTime >= 5.5 && currentTime < 7) return 'earlyMorning';
        if (currentTime >= 7 && currentTime < 12) return 'morning';
        if (currentTime >= 12 && currentTime < 13) return 'midday';
        if (currentTime >= 13 && currentTime < 17) return 'afternoon';
        if (currentTime >= 17 && currentTime < 18.5) return 'dusk';
        if (currentTime >= 18.5 && currentTime < 22) return 'evening';
        return 'night';
    },

    getCurrentTime() {
        return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    },

    getPeriodConfig(periodKey) {
        return PERIOD_CONFIG[periodKey] || null;
    },

    getAllPeriodConfigs() {
        return PERIOD_CONFIG;
    },

    ensurePeriod(dayData, periodKey) {
        if (!dayData.timeline) dayData.timeline = [];

        let periodItem = dayData.timeline.find(p => p.period === periodKey);

        if (!periodItem) {
            const config = PERIOD_CONFIG[periodKey];
            if (!config) return null;
            periodItem = {
                period: config.period,
                name: config.name,
                time: config.time,
                icon: config.icon,
                eval: config.eval,
                items: []
            };
            dayData.timeline.push(periodItem);
        }

        if (!periodItem.items) periodItem.items = [];

        return periodItem;
    },

    addEvent(dayData, taskText, evalLabel, refId) {
        const periodKey = this.getCurrentPeriod();
        const periodItem = this.ensurePeriod(dayData, periodKey);
        if (!periodItem) return;

        const eventItem = {
            time: this.getCurrentTime(),
            task: taskText,
            eval: evalLabel || '完成'
        };
        if (refId) {
            eventItem.refId = refId;
        }
        periodItem.items.push(eventItem);
    },

    removeEvent(dayData, identifier) {
        if (!dayData.timeline) return;

        let removed = false;

        dayData.timeline.forEach(periodItem => {
            if (removed || !periodItem.items) return;

            const refIdx = periodItem.items.findIndex(i => identifier && i.refId && i.refId === identifier);
            if (refIdx !== -1) {
                periodItem.items.splice(refIdx, 1);
                removed = true;
                return;
            }

            if (typeof identifier === 'string') {
                const textIdx = periodItem.items.findIndex(i => !i.refId && i.task === identifier);
                if (textIdx !== -1) {
                    periodItem.items.splice(textIdx, 1);
                    removed = true;
                }
            }
        });

        dayData.timeline = dayData.timeline.filter(periodItem => {
            return periodItem.items && periodItem.items.length > 0;
        });
    },

    parseTime(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return null;
        const match = timeStr.trim().match(/(\d{1,2}):(\d{2})/);
        if (!match) return null;
        return { hour: parseInt(match[1]), minute: parseInt(match[2]) };
    },

    calculateCheckInTimes(timeline) {
        if (!timeline || !Array.isArray(timeline)) {
            return { firstCheckIn: '--:--', lastCheckIn: '--:--' };
        }

        const allTimes = [];
        timeline.forEach(period => {
            if (period.items && Array.isArray(period.items)) {
                period.items.forEach(item => {
                    const parsed = this.parseTime(item.time);
                    if (parsed) allTimes.push(parsed);
                });
            }
        });

        if (allTimes.length === 0) {
            return { firstCheckIn: '--:--', lastCheckIn: '--:--' };
        }

        allTimes.sort((a, b) => {
            if (a.hour !== b.hour) return a.hour - b.hour;
            return a.minute - b.minute;
        });

        const formatTime = (t) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;

        return {
            firstCheckIn: formatTime(allTimes[0]),
            lastCheckIn: formatTime(allTimes[allTimes.length - 1])
        };
    },

    updateMetrics(dayData) {
        const checkInTimes = this.calculateCheckInTimes(dayData.timeline);
        if (!dayData.metrics) dayData.metrics = {};
        dayData.metrics.firstCheckIn = checkInTimes.firstCheckIn;
        dayData.metrics.lastCheckIn = checkInTimes.lastCheckIn;
    }
};

window.TimelineService = TimelineService;
