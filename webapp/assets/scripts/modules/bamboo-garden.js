import { byId, getStyleMount } from '../utils/domRef.js';
export const BambooGarden = {
    container: null,
    _leafIntervalId: null,
    _leafCount: 0,
    _MAX_LEAVES: 15,
    _isPageVisible: true,
    _visibilityHandler: null,
    // 飘落竹叶对象池：复用固定数量的 DOM 节点，避免反复创建/销毁导致的重排与 GC
    _leafPool: [],
    _leafPoolInit: false,
    _initialized: false,

    /**
     * 按当前布局模式重渲染诗词卡（切换纵向/横向/看板时调用）。
     * 原因：布局切换只改 CSS 类名、不重建诗词 DOM，否则看板里会残留进看板前
     * 渲染的 horizontal 模板（带「——」、无 meta 容器），导致破折号删不掉、
     * 作者无法绝对定位贴底。这里就地替换 .bamboo-poem-strip 节点。
     */
    rerenderPoem() {
        try {
            const strip = document.querySelector('#themeEffectSection .bamboo-poem-strip');
            if (!strip || typeof BambooPoem === 'undefined') return;
            const mode = (typeof LayoutMode !== 'undefined' && LayoutMode.isKanban && LayoutMode.isKanban())
                ? 'kanban' : 'horizontal';
            // 幂等：已是目标模式则直接返回。切换布局时 _enter 会手动调用一次、
            // sectionsContainer 的 class 变化又会经 MutationObserver 再调一次，
            // 没有这层判断就会把诗词卡 DOM 重建两遍（切换卡顿来源之一）。
            if (strip.getAttribute('data-poem-mode') === mode) return;
            const tmp = document.createElement('div');
            tmp.innerHTML = BambooPoem.render(mode);
            const next = tmp.querySelector('.bamboo-poem-strip');
            if (next) {
                next.setAttribute('data-poem-mode', mode);
                strip.replaceWith(next);
            }
        } catch (e) {
            console.warn('[BambooGarden] rerenderPoem failed', e);
        }
    },

    render() {
        return `
            <section class="bamboo-garden-section" id="bambooGardenSection" role="region">
                <div class="bamboo-garden-container" id="bambooGardenContainer">
                    <div class="moon"></div>
                    <div class="mist-layer-1"></div>
                    <div class="mist-layer-2"></div>
                    <div class="mist-layer-3"></div>
                    <div class="distant-mountains" id="distantMountains">
                        <div class="mountain-layer mountain-3"></div>
                        <div class="mountain-layer mountain-2"></div>
                        <div class="mountain-layer mountain-1"></div>
                        <div class="mountain-mist"></div>
                    </div>
                    <div class="river-surface"></div>
                    <div class="boat-container">
                        <div class="boat"></div>
                    </div>
                    <div class="bamboo-forest" id="bambooForest">
                        <div class="bamboo-layer bamboo-far" id="farBamboo"></div>
                        <div class="bamboo-layer bamboo-mid" id="midBamboo"></div>
                        <div class="bamboo-layer bamboo-near" id="nearBamboo"></div>
                    </div>
                    <div class="forest-floor"></div>
                    <div class="foreground-haze"></div>
                    <div id="leafContainer"></div>
                </div>
                ${typeof BambooPoem !== 'undefined' ? BambooPoem.render(typeof LayoutMode !== 'undefined' && LayoutMode.isKanban && LayoutMode.isKanban() ? 'kanban' : 'horizontal') : ''}
            </section>
        `;
    },

    init() {
        // 防止重复初始化（主题切换时会先 destroy 再 init）
        if (this._initialized) this.destroy();
        this._initialized = true;

        this.createBambooForest();
        this.startLeafAnimation();
        this._setupVisibilityGuard();
        // 初始即按当前明暗模式应用大背景（避免依赖 CSS :host(.dark) 在个别 webview 下未命中）
        this.updateTheme();
        // 明暗切换由 ThemeEffects 统一观察者驱动（合并 observer，避免重复监听 documentElement.class）

        // 看板布局只改 CSS 类名、不重建诗词 DOM，会导致看板里残留进看板前的
        // horizontal 模板（带「——」、无 meta 容器）。监听 sectionsContainer 的
        // class 变化：一旦切到 kanban-layout 就按看板模板重渲染诗词卡。
        this._observeLayoutChange();
    },

    _observeLayoutChange() {
        const sc = byId('sectionsContainer');
        if (!sc || typeof MutationObserver === 'undefined') return;
        if (this._layoutObserver) this._layoutObserver.disconnect();
        this._layoutObserver = new MutationObserver(() => {
            if (sc.classList.contains('kanban-layout')) this.rerenderPoem();
        });
        this._layoutObserver.observe(sc, { attributes: true, attributeFilter: ['class'] });
        // 初始即处于看板也渲染一次
        if (sc.classList.contains('kanban-layout')) this.rerenderPoem();
    },

    _setupVisibilityGuard() {
        // 移除旧的监听器（如果存在）
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
        }
        this._visibilityHandler = () => {
            this._isPageVisible = !document.hidden;
            if (this._isPageVisible) {
                this.startLeafAnimation();
            } else {
                this.stopLeafAnimation();
            }
        };
        document.addEventListener('visibilitychange', this._visibilityHandler);
    },

    stopLeafAnimation() {
        if (this._leafIntervalId) {
            clearInterval(this._leafIntervalId);
            this._leafIntervalId = null;
        }
    },

    destroy() {
        this.stopLeafAnimation();
        const container = byId('leafContainer');
        if (container) container.innerHTML = '';
        this._leafCount = 0;
        this._initialized = false;

        // 清空对象池（DOM 已随 innerHTML 清空，同步重置池状态以便重建）
        this._leafPool = [];
        this._leafPoolInit = false;

        // 移除 visibilitychange 监听器
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            this._visibilityHandler = null;
        }

        // 清理动态创建的 style 元素
        ['bambooSwayStyles', 'windLeafStyles'].forEach(id => {
            const el = byId(id);
            if (el) el.remove();
        });

        // 断开布局监听
        if (this._layoutObserver) {
            this._layoutObserver.disconnect();
            this._layoutObserver = null;
        }
    },
    
    createBambooForest() {
        const farLayer = byId('farBamboo');
        const midLayer = byId('midBamboo');
        const nearLayer = byId('nearBamboo');
        
        if (!farLayer || !midLayer || !nearLayer) return;
        
        farLayer.innerHTML = this.createBambooStalks(30, 280, 380, 2, 0.28, true);
        midLayer.innerHTML = this.createBambooStalks(22, 320, 420, 4, 0.5, true);
        nearLayer.innerHTML = this.createBambooStalks(14, 380, 480, 6, 0.72, false);
    },

    createBambooStalks(count, minH, maxH, width, opacity, leftFade, staticRatio = 0.5) {
        let html = '';
        // 随机均匀：恰好 staticRatio 比例的竹子为静态（洗牌保证位置随机均匀），
        // 静态竹子不做 sway，竹叶也不 tremble —— 动画负载减半，竹林密度不变。
        const isStatic = this._buildStaticMask(count, staticRatio);
        for (let i = 0; i < count; i++) {
            let left;
            if (i < count * 0.7) {
                left = 35 + (i / (count * 0.7)) * 60 + Math.random() * (30 / count);
            } else {
                left = ((i - count * 0.7) / (count * 0.3)) * 35 + Math.random() * (20 / count);
            }
            
            const height = minH + Math.random() * (maxH - minH);
            
            let stalkOpacity = opacity;
            if (leftFade) {
                if (left < 25) {
                    stalkOpacity = opacity * (0.25 + (left / 25) * 0.4);
                } else if (left < 45) {
                    stalkOpacity = opacity * (0.65 + (left - 25) / 20 * 0.25);
                } else {
                    stalkOpacity = opacity * (0.9 + (left - 45) / 55 * 0.15);
                }
            } else {
                if (left < 35) {
                    stalkOpacity = opacity * (0.4 + (left / 35) * 0.45);
                } else if (left < 55) {
                    stalkOpacity = opacity * (0.85 + (left - 35) / 20 * 0.15);
                } else {
                    stalkOpacity = opacity * (1);
                }
            }
            
            const lean = (Math.random() - 0.5) * 2;
            const nodeCount = Math.floor(height / 50);
            
            const layerMultiplier = width <= 2 ? 1.3 : (width <= 4 ? 1 : 0.8);
            const swaySpeed = (6 + Math.random() * 4) * layerMultiplier;
            const static = isStatic[i];
            
            html += `
                <div class="bamboo-stalk" style="left: ${left}%; height: ${height}px; width: ${width}px; opacity: ${stalkOpacity}; transform: rotate(${lean}deg);">
                    <div class="bamboo-inner" ${static ? '' : `style="animation-name: bambooSway${i % 6}; animation-duration: ${swaySpeed}s;"`}>
                        ${this.createBambooNodes(nodeCount, height)}
                        ${this.createLeafCluster(height, static)}
                    </div>
                </div>
            `;
        }
        
        if (!byId('bambooSwayStyles')) {
            const s = document.createElement('style');
            s.id = 'bambooSwayStyles';
            let swayStyles = '';
            for (let i = 0; i < 6; i++) {
                const amp1 = 0.2 + Math.random() * 0.3;
                const amp2 = 0.3 + Math.random() * 0.35;
                const amp3 = 0.15 + Math.random() * 0.2;
                const amp4 = 0.25 + Math.random() * 0.25;
                swayStyles += `
                    @keyframes bambooSway${i} {
                        0% { transform: rotate(0deg); }
                        18% { transform: rotate(${-amp1}deg); }
                        38% { transform: rotate(${amp2}deg); }
                        58% { transform: rotate(${-amp3}deg); }
                        78% { transform: rotate(${amp4}deg); }
                        100% { transform: rotate(0deg); }
                    }
                `;
            }
            s.textContent = swayStyles;
            getStyleMount().appendChild(s);
        }
        
        return html;
    },

    /** 构建恰好 staticRatio 比例的静态掩码（Fisher-Yates 洗牌，位置随机且均匀） */
    _buildStaticMask(count, staticRatio) {
        const staticCount = Math.max(0, Math.floor(count * staticRatio));
        const mask = [];
        for (let i = 0; i < count; i++) mask.push(i < staticCount);
        for (let i = count - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = mask[i]; mask[i] = mask[j]; mask[j] = tmp;
        }
        return mask;
    },

    createBambooNodes(count, height) {
        let html = '';
        const spacing = height / (count + 1);
        for (let i = 1; i <= count; i++) {
            html += `<div style="position: absolute; left: -1px; right: -1px; top: ${i * spacing}px; height: 3px; background: hsla(calc(var(--accent-hue) + -9), 26%, 26%, 0.2); border-radius: 2px;"></div>`;
        }
        return html;
    },

    createLeafCluster(height, isStatic = false) {
        const count = 6 + Math.floor(Math.random() * 7);
        let html = '';
        
        for (let i = 0; i < count; i++) {
            const h = 11 + Math.random() * 13;
            const angle = -75 + i * 26 + (Math.random() - 0.5) * 28;
            const t = -48 - Math.random() * 22;
            const l = -12 + i * 3.5 + (Math.random() - 0.5) * 11;
            const delay = Math.random() * 1.2;
            const dur = 1.6 + Math.random() * 1.2;
            
            html += `
                <div class="bamboo-leaf-tip" style="
                    top: ${t}px;
                    left: ${l}px;
                    height: ${h}px;
                    --r: ${angle}deg;
                    opacity: ${0.38 + Math.random() * 0.32};
                    ${isStatic ? '' : `animation: leafTremble ${dur}s ease-in-out infinite ${delay}s;`}
                "></div>
            `;
        }
        
        return html;
    },

    startLeafAnimation() {
        // 避免重复创建 interval
        if (this._leafIntervalId) return;

        // 初始化对象池（仅首次；主题切换 destroy 后池已清理，会重新建立）
        this._initLeafPool();

        // 确保飘落 keyframes 已注入
        this._ensureLeafKeyframes();

        // 初始几片叶子
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this._spawnLeaf(), i * 300);
        }

        this._leafIntervalId = setInterval(() => {
            if (!this._isPageVisible) return;
            this._spawnLeaf();
            if (Math.random() > 0.6) {
                setTimeout(() => this._spawnLeaf(), 200);
            }
        }, 750);
    },

    /**
     * 预创建固定数量的叶子 DOM 到对象池（display:none 占位）。
     * 复用节点代替反复 createElement/removeChild，消除重排与 GC 抖动，
     * 视觉效果与重建版一致（每片叶子仍独立随机起点/速度/缩放）。
     */
    _initLeafPool() {
        const container = byId('leafContainer');
        if (!container || this._leafPoolInit) return;
        this._leafPoolInit = true;
        // 确保 keyframes 先注入，池节点首次激活即可引用
        this._ensureLeafKeyframes();
        for (let i = 0; i < this._MAX_LEAVES; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'drifting-leaf';
            leaf.style.display = 'none';
            container.appendChild(leaf);
            this._leafPool.push(leaf);
        }
    },

    /** 注入飘落叶子的 keyframes（仅在首次生成时） */
    _ensureLeafKeyframes() {
        if (byId('windLeafStyles')) return;
        const s = document.createElement('style');
        s.id = 'windLeafStyles';
        s.textContent = `
            @keyframes leafDrift0 {
                0% { transform: translate(0, -70px) rotate(0deg); opacity: 0; }
                12% { opacity: 0.45; }
                40% { transform: translate(45px, 90px) rotate(150deg); }
                70% { transform: translate(90px, 210px) rotate(300deg); }
                88% { opacity: 0.3; }
                100% { transform: translate(135px, 360px) rotate(480deg); opacity: 0; }
            }
            @keyframes leafDrift1 {
                0% { transform: translate(0, -70px) rotate(0deg); opacity: 0; }
                15% { opacity: 0.45; }
                35% { transform: translate(30px, 70px) rotate(100deg); }
                55% { transform: translate(75px, 150px) rotate(220deg); }
                80% { transform: translate(110px, 270px) rotate(360deg); }
                85% { opacity: 0.3; }
                100% { transform: translate(140px, 360px) rotate(500deg); opacity: 0; }
            }
            @keyframes leafDrift2 {
                0% { transform: translate(0, -70px) rotate(0deg); opacity: 0; }
                10% { opacity: 0.45; }
                25% { transform: translate(55px, 50px) rotate(180deg); }
                45% { transform: translate(95px, 130px) rotate(320deg); }
                65% { transform: translate(125px, 230px) rotate(460deg); }
                85% { opacity: 0.28; }
                100% { transform: translate(150px, 360px) rotate(600deg); opacity: 0; }
            }
            @keyframes leafDrift3 {
                0% { transform: translate(0, -70px) rotate(0deg); opacity: 0; }
                15% { opacity: 0.45; }
                30% { transform: translate(20px, 60px) rotate(80deg); }
                50% { transform: translate(60px, 150px) rotate(180deg); }
                70% { transform: translate(100px, 240px) rotate(290deg); }
                85% { opacity: 0.28; }
                100% { transform: translate(130px, 360px) rotate(400deg); opacity: 0; }
            }
        `;
        getStyleMount().appendChild(s);
    },

    /**
     * 从对象池取一片空闲叶子并播放一次随机飘落。
     * 池满则跳过（同屏最多 _MAX_LEAVES 片，与原逻辑一致）。
     */
    _spawnLeaf() {
        const leaf = this._leafPool.find(l => l.style.display === 'none');
        if (!leaf) return; // 池满，视觉上与重建版"达到上限"等价

        // 随机参数（与原 createLeaf 一致，保证视觉效果不变）
        const startX = -5 + Math.random() * 40;
        const duration = 4.5 + Math.random() * 3.5;
        const delay = Math.random() * 1;
        const scale = 0.55 + Math.random() * 0.65;
        const animationIndex = Math.floor(Math.random() * 4);

        // 先移除动画，再强制 reflow，最后重新设置参数并激活（CSS 动画重启技巧）
        leaf.style.animationName = 'none';
        leaf.style.left = startX + '%';
        leaf.style.animationDuration = duration + 's';
        leaf.style.animationDelay = delay + 's';
        leaf.style.transform = `scale(${scale})`;
        // 强制同步 reflow，确保上面的 animation:none 已生效，动画可从头重播
        void leaf.offsetWidth;
        leaf.style.animationName = `leafDrift${animationIndex}`;
        leaf.style.display = '';

        // 本次飘落结束后回收复用（保留原有时间节奏，动画为 infinite，不能依赖 animationend）
        const self = this;
        setTimeout(() => {
            if (leaf.style.display !== 'none') {
                leaf.style.animationName = 'none';
                leaf.style.display = 'none';
            }
        }, (duration + delay) * 1000 + 700);
    },

    updateTheme() {
        const container = byId('bambooGardenContainer');
        if (!container) return;
        
        const isDark = document.documentElement.classList.contains('dark');
        const bg = isDark 
            ? 'linear-gradient(180deg, hsl(var(--accent-hue), 47%, calc(7% + var(--accent-lightness-offset))) 0%, hsl(var(--accent-hue), 21%, calc(6% + var(--accent-lightness-offset))) 20%, hsl(var(--accent-hue), 38%, calc(7% + var(--accent-lightness-offset))) 50%, hsl(var(--accent-hue), 50%, calc(4% + var(--accent-lightness-offset))) 100%)'
            : 'linear-gradient(180deg, hsl(var(--accent-hue), 36%, calc(95% + var(--accent-lightness-offset))) 0%, hsl(var(--accent-hue), 29%, calc(92% + var(--accent-lightness-offset))) 20%, hsl(var(--accent-hue), 26%, calc(88% + var(--accent-lightness-offset))) 50%, hsl(var(--accent-hue), 22%, calc(82% + var(--accent-lightness-offset))) 100%)';
        
        container.style.background = bg;
    }
};

window.BambooGarden = BambooGarden;