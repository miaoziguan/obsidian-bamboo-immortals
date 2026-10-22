/**
 * 贴纸 SVG 隔离结果缓存（性能）。
 *
 * 背景：贴纸渲染走 SvgIsolate.isolate(render(), recId + '-')。
 *   其中 isolateIds 是「每个 id 做 7~9 轮全串 split/join」——对大素材极贵
 *   （实测：东方.js 176 个 id × 94KB ≈ 150MB 字符串处理/实例）。
 *   而「切回便签档 / 切换便签组 / 新建组」都会 _clearStickerDom + 全量重建贴纸，
 *   同一张贴纸（rec.id 持久化、跨恢复稳定）会被反复 isolate，成本被重复支付。
 *
 * 做法：以 (material 对象, rec.id) 为键缓存 isolate 后的 HTML。
 *   · rec.id 在落盘/恢复前后不变 → 切档/切组重建时直接命中，跳过字符串处理；
 *   · material 用 WeakMap 作键：素材更新会重新 register（新对象）→ 旧缓存自动失效，
 *     不会把旧版本素材的隔离结果用在新版本上；
 *   · render() 均为纯函数（只包裹 this.preview），故缓存输出是安全的。
 *
 * 内存：每个条目是一段已隔离的 SVG 字符串（几十~百 KB），按素材设上限，防长尾堆积。
 */
import { SvgIsolate } from './svgIsolate.js';

const CACHE = new WeakMap();          // material 对象 -> Map<recId, isolatedHtml>
const MAX_PER_MATERIAL = 200;         // 单素材缓存上限（便签组内贴纸数远小于此）

/**
 * 取得（并缓存）一张贴纸隔离后的 HTML。
 * @param {object} material 素材对象（需有 render()）
 * @param {string} recId    贴纸记录 id（持久化、跨恢复稳定）
 * @returns {string} 已做 id 前缀 + CSS 作用域隔离的 HTML
 */
export function isolateStickerHtml(material, recId) {
    if (!material || typeof material.render !== 'function') return '';
    const key = (recId === undefined || recId === null || recId === '') ? '' : String(recId);

    let map = CACHE.get(material);
    if (!map) { map = new Map(); CACHE.set(material, map); }

    if (key) {
        const hit = map.get(key);
        if (hit !== undefined) return hit;
    }

    const html = SvgIsolate.isolate(material.render(), key ? key + '-' : '-');

    if (key) {
        if (map.size >= MAX_PER_MATERIAL) {
            const oldest = map.keys().next();
            if (!oldest.done) map.delete(oldest.value);
        }
        map.set(key, html);
    }
    return html;
}

/** 贴纸删除时清掉它的缓存条目（recId 不复用，留着只是占内存） */
export function evictStickerIsolate(material, recId) {
    const map = material ? CACHE.get(material) : null;
    if (map && recId !== undefined && recId !== null) map.delete(String(recId));
}
