// QuoteService — 竹林七贤语录服务
// 1. 内置 40+ 条竹林七贤语录
// 2. 支持从 Obsidian 笔记读取（每行一条，格式："正文" 或 "正文 — 作者"
// 3. 优先级：用户笔记 > 内置
export const QuoteService = {
    _builtinQuotes: [
        { text: '目送归鸿，手挥五弦。', author: '嵇康' },
        { text: '俯仰自得，游心太玄。', author: '嵇康' },
        { text: '息徒兰圃，秣马华山。', author: '嵇康' },
        { text: '流磻平皋，垂纶长川。', author: '嵇康' },
        { text: '弦以园客之丝，徽以钟山之玉。', author: '嵇康' },
        { text: '风驰电逝，蹑景追飞。', author: '嵇康' },
        { text: '越名教而任自然。', author: '嵇康' },
        { text: '贵得肆志，纵心无悔。', author: '嵇康' },
        { text: '轻肆直言，遇事即发，刚肠嫉恶。', author: '嵇康' },
        { text: '人无志，非人也。', author: '嵇康' },
        { text: '自非重怨，不至于此也。', author: '嵇康' },
        { text: '疾而不速，留而不滞。', author: '嵇康' },
        { text: '傲睨滑稽，挟智任术。', author: '嵇康' },
        { text: '交不为利，仕不谋禄。', author: '嵇康' },
        { text: '嘉彼钓叟，得鱼忘筌。', author: '嵇康' },
        { text: '郢人逝矣，谁与尽言？', author: '嵇康' },
        { text: '凌厉中原，顾盼生姿。', author: '嵇康' },
        { text: '循性而动，各附所安。', author: '嵇康' },
        { text: '夫人之相知，贵识其天性，因而济之。', author: '嵇康' },
        { text: '鸿鹄相随飞，飞飞适荒裔。', author: '阮籍' },
        { text: '林中有奇鸟，自言是凤凰。', author: '阮籍' },
        { text: '清朝饮醴泉，日夕栖山冈。', author: '阮籍' },
        { text: '高鸣彻九州，延颈望八荒。', author: '阮籍' },
        { text: '适逢商风起，羽翼自摧藏。', author: '阮籍' },
        { text: '一去昆仑西，何时复回翔。', author: '阮籍' },
        { text: '但恨处非位，怆悢使心伤。', author: '阮籍' },
        { text: '谁言万事艰，逍遥可终生。', author: '阮籍' },
        { text: '时无英雄，使竖子成名。', author: '阮籍' },
        { text: '人生若尘露，天道邈悠悠。', author: '阮籍' },
        { text: '孤鸿号外野，翔鸟鸣北林。', author: '阮籍' },
        { text: '夜中不能寐，起坐弹鸣琴。', author: '阮籍' },
        { text: '薄帷鉴明月，清风吹我襟。', author: '阮籍' },
        { text: '徘徊将何见？忧思独伤心。', author: '阮籍' },
        { text: '朝阳不再盛，白日忽西幽。', author: '阮籍' },
        { text: '繁华有憔悴，堂上生荆杞。', author: '阮籍' },
        { text: '终身履薄冰，谁知我心焦。', author: '阮籍' },
        { text: '生命几何时，慷慨各努力。', author: '阮籍' },
        { text: '昔李斯之受罪兮，叹黄犬而长吟。', author: '向秀' },
        { text: '听鸣笛之慷慨兮，妙声绝而复寻。', author: '向秀' },
        { text: '停驾言其将迈兮，遂援翰而写心。', author: '向秀' },
        { text: '济黄河以泛舟兮，经山阳之旧居。', author: '向秀' },
        { text: '以天地为一朝，万期为须臾。', author: '刘伶' },
        { text: '日月为扃牖，八荒为庭衢。', author: '刘伶' },
        { text: '幕天席地，纵意所如。', author: '刘伶' },
        { text: '静听不闻雷霆之声，熟视不睹泰山之形。', author: '刘伶' },
        { text: '行无辙迹，居无室庐。', author: '刘伶' },
        { text: '止则操卮执觚，动则挈榼提壶。', author: '刘伶' },
        { text: '唯酒是务，焉知其余？', author: '刘伶' },
        { text: '俯观万物，扰扰焉如江汉之载浮萍。', author: '刘伶' },
        { text: '二豪侍侧焉，如蜾蠃之与螟蛉。', author: '刘伶' },
        { text: '兀然而醉，豁尔而醒。', author: '刘伶' },
        { text: '无思无虑，其乐陶陶。', author: '刘伶' },
        { text: '圣人忘情，最下不及情。', author: '王戎' },
        { text: '情之所钟，正在我辈。', author: '王戎' },
        { text: '视之虽近，邈若山河。', author: '王戎' },
        { text: '未能免俗，聊复尔耳。', author: '阮咸' }
    ],

    parseQuoteText(raw) {
        if (!raw) return [];
        const lines = String(raw).split(/\r?\n/);
        const out = [];
        for (let i = 0; i < lines.length; i++) {
            const line = (lines[i] || '').trim();
            if (!line) continue;
            if (line.startsWith('#')) continue;

            // 支持 "正文 — 作者 / 正文-作者 / 正文·作者 / 正文—作者 / 正文——作者 等常见中文标点
            const m = line.match(/^(.+?)[\s—\-·\-–—]+(.+?)$/);
            if (m) {
                out.push({ text: m[1].trim(), author: m[2].trim() });
            } else {
                out.push({ text: line, author: '' });
            }
        }
        return out;
    },

    async getUserQuotesFromNote(noteName) {
        const name = (noteName || '').trim();
        if (!name) return null;

        // 优先使用 obsidian bridge 有 getFile 方法；否则退化为内置
        if (typeof storageManager !== 'undefined' && typeof storageManager.getFile === 'function') {
            try {
                const content = await storageManager.getFile(name);
                if (content && content.length > 0) {
                    const lines = this.parseQuoteText(content);
                    if (lines.length > 0) return lines;
                }
            } catch (e) {
                console.warn('[QuoteService] 读取笔记失败:', e.message || e);
            }
        }
        return null;
    },

    async getRandomQuote() {
        const source = (typeof store !== 'undefined' && store.state && store.state.ui && store.state.ui.quoteSource) || '';
        if (source) {
            const userQuotes = await this.getUserQuotesFromNote(source);
            if (userQuotes && userQuotes.length > 0) {
                const idx = Math.floor(Math.random() * userQuotes.length);
                return userQuotes[idx];
            }
        }
        const builtin = this._builtinQuotes;
        const idx = Math.floor(Math.random() * builtin.length);
        return builtin[idx];
    }
};

window.QuoteService = QuoteService;
