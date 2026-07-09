import { byId, getStyleMount } from '../utils/domRef.js';
export const BambooGarden = {
    container: null,
    _leafIntervalId: null,
    _leafCount: 0,
    _MAX_LEAVES: 15,
    _isPageVisible: true,
    _observer: null,
    _visibilityHandler: null,

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
            </section>
        `;
    },

    init() {
        // 防止重复初始化（主题切换时会先 destroy 再 init）
        if (this._observer) this.destroy();

        this.createBambooForest();
        this.startLeafAnimation();
        this._setupVisibilityGuard();
        // 初始即按当前明暗模式应用大背景（避免依赖 CSS :host(.dark) 在个别 webview 下未命中）
        this.updateTheme();

        this._observer = new MutationObserver(() => {
            this.updateTheme();
        });
        this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
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

        // 断开 MutationObserver
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }

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

    createBambooStalks(count, minH, maxH, width, opacity, leftFade) {
        let html = '';
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
            
            html += `
                <div class="bamboo-stalk" style="left: ${left}%; height: ${height}px; width: ${width}px; opacity: ${stalkOpacity}; transform: rotate(${lean}deg);">
                    <div class="bamboo-inner" style="animation-name: bambooSway${i % 6}; animation-duration: ${swaySpeed}s;">
                        ${this.createBambooNodes(nodeCount, height)}
                        ${this.createLeafCluster(height)}
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

    createBambooNodes(count, height) {
        let html = '';
        const spacing = height / (count + 1);
        for (let i = 1; i <= count; i++) {
            html += `<div style="position: absolute; left: -1px; right: -1px; top: ${i * spacing}px; height: 3px; background: hsla(calc(var(--accent-hue) + -9), 26%, 26%, 0.2); border-radius: 2px;"></div>`;
        }
        return html;
    },

    createLeafCluster(height) {
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
                    animation: leafTremble ${dur}s ease-in-out infinite ${delay}s;
                "></div>
            `;
        }
        
        return html;
    },

    startLeafAnimation() {
        // 避免重复创建 interval
        if (this._leafIntervalId) return;

        // 初始几片叶子
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.createLeaf(), i * 300);
        }

        this._leafIntervalId = setInterval(() => {
            if (!this._isPageVisible) return;
            this.createLeaf();
            if (Math.random() > 0.6) {
                setTimeout(() => this.createLeaf(), 200);
            }
        }, 750);
    },

    createLeaf() {
        const container = byId('leafContainer');
        if (!container) return;

        // 限制最大同时存在的叶子数量
        if (this._leafCount >= this._MAX_LEAVES) return;

        const leaf = document.createElement('div');
        leaf.className = 'drifting-leaf';

        const startX = -5 + Math.random() * 40;
        const duration = 4.5 + Math.random() * 3.5;
        const delay = Math.random() * 1;

        leaf.style.left = startX + '%';
        leaf.style.animationDuration = duration + 's';
        leaf.style.animationDelay = delay + 's';

        const scale = 0.55 + Math.random() * 0.65;
        leaf.style.transform = `scale(${scale})`;

        const animationIndex = Math.floor(Math.random() * 4);
        leaf.style.animationName = `leafDrift${animationIndex}`;

        if (!byId('windLeafStyles')) {
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
        }

        this._leafCount++;
        container.appendChild(leaf);

        setTimeout(() => {
            if (leaf.parentNode === container) {
                container.removeChild(leaf);
            }
            this._leafCount = Math.max(0, this._leafCount - 1);
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