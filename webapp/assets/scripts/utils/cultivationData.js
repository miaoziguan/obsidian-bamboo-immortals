/**
 * 修仙境界体系数据 + 境界计算
 * 纯数据 + 纯计算，从 StatsModal._LAYERS / getRealmData / _checkBreakthrough 提取。
 */
export const CultivationData = (() => {
    const REALM_CONFIG = [
        { name: '凡尘', start: 1,  end: 10,  interval: 1 },
        { name: '练气', start: 11, end: 20,  interval: 1.5 },
        { name: '筑基', start: 21, end: 30,  interval: 2.5 },
        { name: '金丹', start: 31, end: 40,  interval: 4 },
        { name: '元婴', start: 41, end: 50,  interval: 6 },
        { name: '化神', start: 51, end: 60,  interval: 8 },
        { name: '返虚', start: 61, end: 70,  interval: 12 },
        { name: '合道', start: 71, end: 80,  interval: 17 },
        { name: '大乘', start: 81, end: 90,  interval: 23 },
        { name: '飞升', start: 91, end: 100, interval: 28 },
    ];

    const TITLES = {
        1:'初入凡尘',2:'心有所向',3:'灵根初现',4:'道心萌动',5:'天地感应',
        6:'明心见性',7:'初心不改',8:'超凡脱俗',9:'大彻大悟',10:'凡尘圆满',
        11:'引气入体',12:'气感初生',13:'灵气运转',14:'吐纳天地',15:'气贯百脉',
        16:'内气充盈',17:'气凝丹田',18:'气化真元',19:'真气大成',20:'练气圆满',
        21:'道基初筑',22:'洗髓伐骨',23:'固本培元',24:'根基稳固',25:'百炼成钢',
        26:'道基小成',27:'厚积薄发',28:'道基大成',29:'脱胎换骨',30:'筑基圆满',
        31:'丹火初燃',32:'凝丹之法',33:'丹胚初成',34:'丹火淬炼',35:'九转丹成',
        36:'丹心不灭',37:'金丹入腹',38:'丹道大成',39:'金光护体',40:'金丹圆满',
        41:'元神初醒',42:'魂魄凝形',43:'神识初开',44:'元神出窍',45:'遨游太虚',
        46:'元神壮大',47:'分神化念',48:'万念归一',49:'元神大成',50:'元婴圆满',
        51:'化神之初',52:'神识通天',53:'一念千里',54:'化身万千',55:'神游八极',
        56:'万象皆明',57:'神识无边',58:'神通广大',59:'化神大成',60:'化神圆满',
        61:'返璞归真',62:'大道至简',63:'虚室生白',64:'天人感应',65:'道法自然',
        66:'无为而治',67:'上善若水',68:'和光同尘',69:'返虚大成',70:'返虚圆满',
        71:'以身合道',72:'道心通明',73:'万法归宗',74:'天地同寿',75:'道印凝结',
        76:'法则掌控',77:'时空洞悉',78:'因果洞明',79:'合道大成',80:'合道圆满',
        81:'大乘初境',82:'万劫不灭',83:'功德无量',84:'法力无边',85:'超脱轮回',
        86:'不生不灭',87:'万古长存',88:'大道主宰',89:'大乘圆满',90:'半步飞升',
        91:'破碎虚空',92:'三界遨游',93:'九天之上',94:'仙帝之姿',95:'万仙来朝',
        96:'混沌初窥',97:'开天辟地',98:'道之本源',99:'永恒不朽',100:'超脱天道',
    };

    // 构建境界层数表
    const layers = [];
    let goal = 0;
    for (const rc of REALM_CONFIG) {
        for (let i = rc.start; i <= rc.end; i++) {
            layers.push({
                layer: i,
                realm: rc.name,
                title: TITLES[i],
                goal: Math.round(goal)
            });
            goal += rc.interval;
        }
    }

    return {
        LAYERS: layers,

        /** 根据已完成目标数查当前境界 */
        getRealmData(completedGoals) {
            let current = layers[0];
            let next = null;
            for (let i = layers.length - 1; i >= 0; i--) {
                if (completedGoals >= layers[i].goal) {
                    current = layers[i];
                    next = layers[i + 1] || null;
                    break;
                }
            }
            const layersInCurrentRealm = layers.filter(l => l.realm === current.realm);
            return { current, next, layersInCurrentRealm, allLayers: layers };
        },

        /** 检测境界突破并 toast 提示 */
        checkBreakthrough(oldCompleted, newCompleted) {
            const oldData = this.getRealmData(oldCompleted);
            const newData = this.getRealmData(newCompleted);
            if (newData.current.layer > oldData.current.layer) {
                const isRealmBreak = newData.current.realm !== oldData.current.realm;
                if (isRealmBreak) {
                    Toast.showToast(
                        `突破${newData.current.realm}境 · ${newData.current.title}`,
                        'success'
                    );
                } else {
                    Toast.showToast(
                        `第${newData.current.layer}层 · ${newData.current.title}`,
                        'success'
                    );
                }
            }
        }
    };
})();

window.CultivationData = CultivationData;
