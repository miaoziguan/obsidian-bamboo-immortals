/**
 * WeatherService — 天气获取（多后端 fallback）
 *   主后端：wttr.in（免注册、直接用城市名、对国内网络更稳定）
 *   备后端：open-meteo.com（免注册、需经纬度）
 *   缓存：localStorage 2 小时
 *
 * 任何一步失败都不会阻塞页面，最差返回 null，由上层决定显示方式。
 */

// ---------- wttr.in weatherCode (World Weather Online) → 图标 ----------
// 参考：https://github.com/chubin/wttr.in/blob/master/lib/constants.py
export function wttrCodeToType(code) {
    const c = String(code);
    if (c === '113') return 'clear';
    if (c === '116') return 'partlyCloudy';
    if (c === '119' || c === '122') return 'cloudy';
    if (c === '143' || c === '248' || c === '260') return 'fog';
    // 雨 / 毛毛雨
    if (['176','182','185','263','266','281','284','293','296','299','302','305','308','311','314','317','320','353','356','359','362','365'].indexOf(c) >= 0) return 'rain';
    // 雪
    if (['179','227','230','323','326','329','332','335','338','350','368','371','374','377','392','395'].indexOf(c) >= 0) return 'snow';
    // 雷暴
    if (['200','386','389'].indexOf(c) >= 0) return 'thunderstorm';
    return 'unknown';
}

export const WEATHER_ICONS = {
    clear: '☀️',
    partlyCloudy: '⛅',
    cloudy: '☁️',
    fog: '🌫️',
    rain: '🌧️',
    snow: '❄️',
    thunderstorm: '⛈️',
    unknown: '🌤️'
};

export const WEATHER_LABELS = {
    clear: '晴',
    partlyCloudy: '多云',
    cloudy: '阴',
    fog: '雾',
    rain: '雨',
    snow: '雪',
    thunderstorm: '雷暴',
    unknown: ''
};

// ---------- 缓存 ----------
export const CACHE_KEY = 'weather-cache';
export const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 小时

export function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed.fetchedAt) return null;
        if (Date.now() - parsed.fetchedAt > CACHE_TTL) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function writeCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
}

export function clearCache() {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
}

// ---------- 手动城市（优先读 store 持久化值，fallback 到 localStorage）----------
export function getManualCity() {
    try {
        // 优先从 store 读（经 storageManager 持久化，Obsidian 重启不丢失）
        if (typeof store !== 'undefined' && store.state && store.state.ui && store.state.ui.weatherCity) {
            return store.state.ui.weatherCity;
        }
        return StorageAdapter.get(StorageKeys.WEATHER_CITY) || null;
    } catch { return null; }
}
export function setManualCity(name) {
    try {
        if (name) StorageAdapter.set(StorageKeys.WEATHER_CITY, name);
        else StorageAdapter.remove(StorageKeys.WEATHER_CITY);
    } catch {}
}

// ---------- 带超时的 fetch ----------
async function fetchWithTimeout(url, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

// ---------- 后端 1：wttr.in（推荐，直接用城市名）----------
async function fetchFromWttr(cityName) {
    // URL encode 城市名（支持中文）
    const encoded = encodeURIComponent(cityName || 'Beijing');
    const url = 'https://wttr.in/' + encoded + '?format=j1';
    try {
        const json = await fetchWithTimeout(url, 8000);
        const cur = json.current_condition && json.current_condition[0];
        if (!cur) return null;
        const today = json.weather && json.weather[0];
        const type = wttrCodeToType(cur.weatherCode);
        return {
            cityName: cityName || 'Beijing',
            temperature: parseInt(cur.temp_C, 10),
            apparentTemperature: parseInt(cur.FeelsLikeC, 10),
            weatherCode: cur.weatherCode,
            humidity: parseInt(cur.humidity, 10),
            windSpeed: Math.round(parseFloat(cur.windspeedKmph) * 0.62), // km/h → mph no, 显示保持 km/h
            windSpeedKmph: parseInt(cur.windspeedKmph, 10),
            tempMax: today ? parseInt(today.maxtempC, 10) : null,
            tempMin: today ? parseInt(today.mintempC, 10) : null,
            fetchedAt: Date.now(),
            icon: WEATHER_ICONS[type] || WEATHER_ICONS.unknown,
            label: WEATHER_LABELS[type] || '',
            source: 'wttr.in'
        };
    } catch (err) {
        return null;
    }
}

// ---------- 后端 2：open-meteo（需经纬度，作为 fallback）----------
async function fetchFromOpenMeteo(cityName) {
    try {
        // 先用 geocoding 解析城市名 → 经纬度
        const geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(cityName || 'Beijing') + '&count=1&language=zh';
        const geo = await fetchWithTimeout(geoUrl, 6000);
        if (!geo || !geo.results || !geo.results.length) return null;
        const loc = geo.results[0];
        const lat = loc.latitude, lon = loc.longitude;

        const fUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
            '&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m' +
            '&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1';
        const f = await fetchWithTimeout(fUrl, 6000);
        const cur = f.current || {};
        const daily = f.daily || {};
        const omCode = String(cur.weather_code);
        // open-meteo 用 WMO 编码，粗略映射
        let type = 'unknown';
        const c = parseInt(omCode, 10);
        if (c === 0) type = 'clear';
        else if (c >= 1 && c <= 2) type = 'partlyCloudy';
        else if (c === 3) type = 'cloudy';
        else if (c === 45 || c === 48) type = 'fog';
        else if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) type = 'rain';
        else if (c >= 71 && c <= 77) type = 'snow';
        else if (c >= 95 && c <= 99) type = 'thunderstorm';
        return {
            cityName: loc.name || cityName || '',
            temperature: Math.round(cur.temperature_2m),
            apparentTemperature: Math.round(cur.apparent_temperature),
            weatherCode: cur.weather_code,
            humidity: cur.relative_humidity_2m,
            windSpeedKmph: Math.round(cur.wind_speed_10m),
            windSpeed: Math.round(cur.wind_speed_10m),
            tempMax: daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : null,
            tempMin: daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : null,
            fetchedAt: Date.now(),
            icon: WEATHER_ICONS[type] || WEATHER_ICONS.unknown,
            label: WEATHER_LABELS[type] || '',
            source: 'open-meteo'
        };
    } catch (err) {
        return null;
    }
}

// ---------- 顶层：试多个后端，按顺序返回第一个成功的 ----------
export const WeatherService = {
    async getWeather(opts) {
        const options = opts || {};

        // 命中缓存直接返回
        if (!options.forceRefresh) {
            const cached = readCache();
            if (cached) return cached;
        }
        if (options.forceRefresh) clearCache();

        const city = options.manualCity || getManualCity() || '北京';

        // 后端 1：wttr.in（首选）
        let result = await fetchFromWttr(city);
        if (result) {
            writeCache(result);
            return result;
        }

        // 后端 2：open-meteo（fallback）
        result = await fetchFromOpenMeteo(city);
        if (result) {
            writeCache(result);
            return result;
        }

        // 都失败：返回 null，上层显示"获取失败"
        return null;
    },

    formatSummary(data) {
        if (!data) return null;
        return {
            icon: data.icon || WEATHER_ICONS.unknown,
            label: data.label || '',
            temperature: data.temperature,
            text: (data.icon || WEATHER_ICONS.unknown) + ' ' + data.temperature + '°'
        };
    },

    formatDetail(data) {
        if (!data) return null;
        return {
            icon: data.icon || WEATHER_ICONS.unknown,
            label: data.label || '',
            temperature: data.temperature,
            apparentTemperature: data.apparentTemperature,
            tempMax: data.tempMax,
            tempMin: data.tempMin,
            humidity: data.humidity,
            windSpeed: data.windSpeedKmph || data.windSpeed,
            cityName: data.cityName || ''
        };
    },

    getLast() {
        return readCache();
    },

    setManualCity(name) {
        setManualCity(name);
        clearCache();
    },

    getManualCity() {
        return getManualCity();
    }
};

window.WeatherService = WeatherService;
