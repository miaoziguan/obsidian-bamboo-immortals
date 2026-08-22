/**
 * 竹林诗词区 — 横向布局模式下填充竹林动效卡片下方的空白
 * - 内置竹林主题诗词，按日期轮换（day-of-year 取模）
 * - 底部显示中文日期（如「八月廿一日」）
 * - 纯装饰，不持久化、不交互
 */
/**
 * 竹林诗词库 — 经核查的可靠诗句
 * 每一条均核实作者与出处；存疑/拼凑条目已移除。
 * 注：「虚心竹有低头叶」为郑燮楹联，非完整诗作，标注为楹联。
 */
const POEMS = [
    { text: '宁可食无肉，不可居无竹', author: '苏轼', source: '《於潜僧绿筠轩》' },
    { text: '独坐幽篁里，弹琴复长啸', author: '王维', source: '《竹里馆》' },
    { text: '竹外桃花三两枝，春江水暖鸭先知', author: '苏轼', source: '《惠崇春江晚景》' },
    { text: '咬定青山不放松，立根原在破岩中', author: '郑燮', source: '《竹石》' },
    { text: '绿竹入幽径，青萝拂行衣', author: '李白', source: '《下终南山过斛斯山人宿置酒》' },
    { text: '衙斋卧听萧萧竹，疑是民间疾苦声', author: '郑燮', source: '《潍县署中画竹呈年伯包大中丞括》' },
    { text: '无数春笋满林生，柴门密掩断人行', author: '杜甫', source: '《咏春笋》' },
    { text: '竹深树密虫鸣处，时有微凉不是风', author: '杨万里', source: '《夏夜追凉》' },
    { text: '新竹高于旧竹枝，全凭老干为扶持', author: '郑燮', source: '《新竹》' },
    { text: '虚心竹有低头叶，傲骨梅无仰面花', author: '郑燮', source: '楹联' },
];

/** 中文数字 0-9 */
const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

function toCnNumber(n) {
    if (n <= 0 || n > 99) return String(n);
    if (n < 10) return CN_NUM[n];
    if (n < 20) return '十' + (n % 10 === 0 ? '' : CN_NUM[n % 10]);
    const tens = CN_NUM[Math.floor(n / 10)];
    const ones = n % 10 === 0 ? '' : CN_NUM[n % 10];
    return tens + '十' + ones;
}

function cnDate(date = new Date()) {
    const month = toCnNumber(date.getMonth() + 1);
    const day = toCnNumber(date.getDate());
    return `${month}月${day}日`;
}

function dayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
}

function poemForDate(date = new Date()) {
    return POEMS[dayOfYear(date) % POEMS.length];
}

/** 竖排短句：取第一分句（逗号/句号/顿号前），最多 8 字（书签竖排不宜过长） */
function shortLine(text) {
    const seg = text.split(/[，。、；！？\s]/)[0] || text;
    return seg.length > 8 ? seg.slice(0, 8) : seg;
}

export const BambooPoem = {
    /**
     * @param {'horizontal'|'kanban'} mode 排版模式：kanban 用竖排短句
     */
    render(mode = 'horizontal') {
        const poem = poemForDate();
        const dateText = cnDate();
        const authorLine = `${poem.author} · ${poem.source}`;
        if (mode === 'kanban') {
            return `
                <div class="bamboo-poem-strip">
                    <div class="bamboo-poem-text">${shortLine(poem.text)}</div>
                    <div class="bamboo-poem-author">—— ${authorLine}</div>
                    <div class="bamboo-poem-date">${dateText}</div>
                </div>
            `;
        }
        return `
            <div class="bamboo-poem-strip">
                <div class="bamboo-poem-text">「${poem.text}」</div>
                <div class="bamboo-poem-author">—— ${authorLine}</div>
                <div class="bamboo-poem-date">${dateText}</div>
            </div>
        `;
    }
};

window.BambooPoem = BambooPoem;
