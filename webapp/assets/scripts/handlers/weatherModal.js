import { byId, eventInTargets } from '../utils/domRef.js';
// WeatherRenderer — 头部天气：图标 + 向右横排展开详情
//   - 收起：☀️ 28°
//   - 展开：☀️ 28° 多云 · 18°~29° · 湿度 52% · 北京
//     · 单击空白处（非城市名）→ 刷新天气
//     · 双击城市名 → 进入内联编辑
export const WeatherRenderer = {
    _expanded: false,
    _lastData: null,
    _lastClickTime: 0,

    init() {
        if (typeof store === 'undefined' || !store.state || !store.state.ui) return;
        if (store.state.ui.weatherEnabled) {
            this._expanded = !!store.state.ui.weatherExpanded;
            this.refresh();
        }
    },

    async refresh(forceRefresh) {
        const widget = byId('weatherWidget');
        if (!widget) return;

        if (typeof store !== 'undefined' && store.state && store.state.ui && !store.state.ui.weatherEnabled) {
            widget.hidden = true;
            widget.innerHTML = '';
            return;
        }

        // 从全局设置同步初始展开状态（支持在设置面板切换后即时生效）
        if (typeof store !== 'undefined' && store.state && store.state.ui && typeof store.state.ui.weatherExpanded !== 'undefined') {
            this._expanded = !!store.state.ui.weatherExpanded;
        }

        widget.hidden = false;
        widget.innerHTML = '<div class="weather-core"><span class="weather-loading">⋯</span></div>';
        widget.setAttribute('aria-label', '天气加载中');
        widget.title = '天气加载中…';
        widget.onclick = null;
        widget.ondblclick = null;

        if (typeof WeatherService === 'undefined') {
            this._renderFailed(widget, '天气组件未加载');
            return;
        }

        try {
            const data = await WeatherService.getWeather({ forceRefresh: !!forceRefresh });
            if (!data) {
                this._renderFailed(widget, '获取失败');
                return;
            }
            this._lastData = data;
            this._renderNormal(widget, data);
        } catch (e) {
            this._renderFailed(widget, '获取失败');
        }
    },

    _renderFailed(widget, msg) {
        widget.innerHTML =
            '<div class="weather-core weather-failed">' +
                '<span class="weather-icon">⚠</span>' +
                '<span class="weather-temp">' + msg + '</span>' +
            '</div>';
        widget.setAttribute('aria-label', '天气' + msg);
        widget.title = msg + '，点击重试';
        widget.classList.add('weather-widget-error');
        const self = this;
        widget.onclick = function(ev) {
            if (ev) ev.stopPropagation();
            self.refresh(true);
        };
    },

    _renderNormal(widget, data) {
        const summary = WeatherService.formatSummary(data);
        const d = WeatherService.formatDetail(data);

        widget.classList.remove('weather-widget-error');
        widget.setAttribute('aria-label', summary.label + ' ' + summary.temperature + '度');
        widget.title = '点击展开 · 双击城市名切换城市 · 展开态空白处点击刷新';

        const hasRange = (d.tempMin !== null && d.tempMin !== undefined);
        const hasHumidity = (d.humidity !== undefined && d.humidity !== null);
        const city = (d.cityName && String(d.cityName).trim()) ? String(d.cityName).trim() : '';

        // 核心（始终显示）
        const coreHtml =
            '<span class="weather-icon" aria-hidden="true">' + summary.icon + '</span>' +
            '<span class="weather-temp">' + summary.temperature + '°</span>';

        // 展开部分（横排向右展开）—— 城市在前，不含按钮
        const expandHtml =
            (city ? '<span class="weather-city" data-role="city-name" title="双击切换城市">' + city + '</span>' : '') +
            '<span class="weather-sep">·</span>' +
            '<span class="weather-label">' + summary.label + '</span>' +
            (hasRange ? '<span class="weather-sep">·</span><span class="weather-range">' + d.tempMin + '°~' + d.tempMax + '°</span>' : '') +
            (hasHumidity ? '<span class="weather-sep">·</span><span class="weather-meta">湿度 ' + d.humidity + '%</span>' : '');

        widget.innerHTML =
            '<div class="weather-core">' + coreHtml + '</div>' +
            '<div class="weather-expand">' + expandHtml + '</div>';

        if (this._expanded) {
            widget.classList.add('weather-open');
        }

        const self = this;

        // 交互规则：
        //   · 核心区（☀️ 28°）单击 → 切换展开/收起
        //   · 展开态内非城市名区域单击 → 立即刷新天气
        //   · 展开态内城市名单击 → 不动作（保留给双击编辑）
        widget.onclick = function(ev) {
            if (!ev) return;
            const target = ev.target;
            if (target) {
                const input = target.closest && target.closest('input');
                if (input) return;
                const button = target.closest && target.closest('button');
                if (button) return;
            }
            ev.stopPropagation();

            const core = target.closest && target.closest('.weather-core');
            if (core) {
                self._toggleExpand(widget);
                return;
            }
            const expand = target.closest && target.closest('.weather-expand');
            if (expand) {
                const cityEl = target.closest && target.closest('[data-role="city-name"]');
                if (cityEl) return; // 城市名单击不动作（留给双击）
                self.refresh(true);
                return;
            }
            // 其他空白：走默认切换展开
            self._toggleExpand(widget);
        };

        // 双击城市名 → 进入编辑
        widget.ondblclick = function(ev) {
            if (!ev) return;
            const target = ev.target;
            const cityEl = target.closest && target.closest('[data-role="city-name"]');
            if (!cityEl) return;
            ev.stopPropagation();
            self._showCityEditor(widget);
        };
    },

    _toggleExpand(widget) {
        this._expanded = !this._expanded;
        if (this._expanded) {
            widget.classList.add('weather-open');
            const self = this;
            setTimeout(function() {
                document.addEventListener('click', function outsideClose(e) {
                    if (!self._expanded) {
                        document.removeEventListener('click', outsideClose);
                        return;
                    }
                    const w = byId('weatherWidget');
                    if (!w || !eventInTargets(e, w)) {
                        self._expanded = false;
                        if (w) w.classList.remove('weather-open');
                        document.removeEventListener('click', outsideClose);
                    }
                });
            }, 0);
        } else {
            widget.classList.remove('weather-open');
        }
    },

    _showCityEditor(widget) {
        const expand = widget.querySelector('.weather-expand');
        if (!expand) return;
        const manualCity = (typeof WeatherService !== 'undefined' && typeof WeatherService.getManualCity === 'function')
            ? WeatherService.getManualCity()
            : '';

        expand.innerHTML =
            '<input type="text" class="weather-city-inline" placeholder="城市名，回车保存" value="' + (manualCity || '') + '" />' +
            '<span class="weather-actions">' +
                '<button class="weather-btn weather-btn-active" data-role="submit-city" title="确认" aria-label="确认">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
                '</button>' +
                '<button class="weather-btn" data-role="cancel-city" title="取消" aria-label="取消">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
            '</span>';

        const input = expand.querySelector('.weather-city-inline');
        if (input) {
            input.focus();
            input.select && input.select();
        }

        const self = this;
        const submit = function() {
            const val = input ? (input.value || '').trim() : '';
            if (typeof WeatherService !== 'undefined' && typeof WeatherService.setManualCity === 'function') {
                WeatherService.setManualCity(val.length > 0 ? val : null);
            }
            if (typeof store !== 'undefined' && typeof store.setWeatherCity === 'function') {
                store.setWeatherCity(val.length > 0 ? val : '');
            }
            self.refresh(true);
        };
        const cancel = function() {
            if (self._lastData) self._renderNormal(widget, self._lastData);
        };

        const submitBtn = expand.querySelector('[data-role="submit-city"]');
        if (submitBtn) submitBtn.addEventListener('click', function(ev) { ev.stopPropagation(); submit(); });
        const cancelBtn = expand.querySelector('[data-role="cancel-city"]');
        if (cancelBtn) cancelBtn.addEventListener('click', function(ev) { ev.stopPropagation(); cancel(); });
        if (input) {
            input.addEventListener('keydown', function(ev) {
                ev.stopPropagation();
                if (ev.key === 'Enter') submit();
                else if (ev.key === 'Escape') cancel();
            });
            input.addEventListener('click', function(ev) { ev.stopPropagation(); });
        }
    },

    closeDetail() {
        const widget = byId('weatherWidget');
        if (widget) widget.classList.remove('weather-open');
        this._expanded = false;
    }
};

// 外部仍可通过 ActionDispatcher 触发刷新/切换
ActionDispatcher.registerMany({
    'toggle-weather': async function() {
        const next = !(store.state.ui.weatherEnabled);
        await store.setWeatherEnabled(next);
        WeatherRenderer.refresh();
        if (typeof Toast !== 'undefined' && typeof Toast.showToast === 'function') {
            Toast.showToast(next ? '已打开天气显示' : '已关闭天气显示', 'success');
        }
    },
    'refresh-weather': async function() {
        WeatherRenderer.closeDetail();
        WeatherRenderer.refresh(true);
    }
});

window.WeatherRenderer = WeatherRenderer;

// QuoteRenderer — 头部语录：右侧对齐，短文字 + 作者
//   · 点击 → 换一条
//   · 数据优先来自 store.state.ui.quoteSource（Obsidian 笔记）
//     若无或为空，使用 QuoteService 内置竹林七贤语录
export const QuoteRenderer = {
    _lastQuote: null,

    init() {
        if (typeof store === 'undefined' || !store.state || !store.state.ui) return;
        if (store.state.ui.quoteEnabled) this.refresh();
    },

    async refresh() {
        const widget = byId('quoteWidget');
        if (!widget) return;

        if (typeof store !== 'undefined' && store.state && store.state.ui && !store.state.ui.quoteEnabled) {
            widget.hidden = true;
            widget.innerHTML = '';
            return;
        }

        if (typeof QuoteService === 'undefined') {
            widget.hidden = true;
            return;
        }

        widget.hidden = false;
        widget.setAttribute('aria-label', '语录');
        widget.title = '点击换一条';

        const quote = await QuoteService.getRandomQuote();
        this._lastQuote = quote;

        const text = (quote && quote.text) ? String(quote.text) : '';
        const author = (quote && quote.author) ? String(quote.author) : '';
        if (!text) {
            widget.hidden = true;
            return;
        }

        widget.innerHTML =
            '<span class="quote-text">' +
                '<span class="quote-mark quote-open">「</span>' +
                '<span class="quote-content">' + text + '</span>' +
                '<span class="quote-mark quote-close">」</span>' +
            '</span>' +
            (author ? '<span class="quote-author">— ' + author + '</span>' : '');

        const self = this;
        widget.onclick = function(ev) {
            if (ev) ev.stopPropagation();
            self.refresh();
        };
    }
};

window.QuoteRenderer = QuoteRenderer;
