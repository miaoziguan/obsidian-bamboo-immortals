/**
 * TypewriterStore — 画中卷·打字机便签的「单一存储契约」
 *
 * 设计目标（回应一次「传错结构导致便签被清空」的事故）：
 *  1. 存储契约单一来源在此处，功能代码只调 load()/save()，永远不知道底层 JSON 长相；
 *  2. 底层只用通用 KV（storageManager.putSetting/getSetting，透传任意 JSON），
 *     刻意绕开只认数组的专用 putTypewriterNotes —— TS 端不再持有任何结构假设，
 *     从根上杜绝「结构不匹配 → 静默清空」；
 *  3. 自带 schema 校验 + 版本号 + 写前备份 + read-after-write，损坏可感知、可回滚。
 */
export const TypewriterStore = {
  KEY_NOTES: 'typewriter:notes',         // 新格式：{ version, notes }
  KEY_CANVAS: 'typewriterCanvas',        // 画布平移偏移（独立 key，绝不混入便签数组）
  KEY_NOTES_BAK: 'typewriter:notes:bak', // 写前备份
  KEY_LINKS: 'typewriter:links',     // 便签连线（独立 key：与便签数组分存，互不影响）
  VERSION: 1,

  /**
   * 读取便签 + 画布偏移。
   * 便签优先读新 schema(putSetting)；若不存在，则从旧 typewriter-notes.json 裸数组自动迁移。
   * @returns {{notes: Array, canvasOffset: {x:number,y:number}|null, links: Array}}
   */
  async load() {
    const sm = window.storageManager;
    const result = { notes: [], canvasOffset: null, links: [] };
    if (!sm) return result;
    try {
      // 1) 新格式（自管 schema）
      if (typeof sm.getSetting === 'function') {
        const wrapped = await sm.getSetting(this.KEY_NOTES);
        if (wrapped && Array.isArray(wrapped.notes)) {
          result.notes = this._sanitizeNotes(wrapped.notes);
        } else if (typeof sm.getTypewriterNotes === 'function') {
          // 2) 迁移旧格式：typewriter-notes.json 裸数组
          const legacy = await sm.getTypewriterNotes();
          if (Array.isArray(legacy)) {
            result.notes = this._sanitizeNotes(legacy);
            if (result.notes.length) await this._writeNotes(result.notes); // 首次读即迁到新格式
          }
        }
        // 画布偏移（独立 key）
        const off = await sm.getSetting(this.KEY_CANVAS);
        if (off && (typeof off.x === 'number' || typeof off.y === 'number')) {
          result.canvasOffset = { x: Number(off.x) || 0, y: Number(off.y) || 0 };
        }
        // 连线（独立 key）：存的是 {from,to} 便签 id 对，坐标实时算、不入档
        const links = await sm.getSetting(this.KEY_LINKS);
        if (Array.isArray(links)) result.links = this._sanitizeLinks(links);
      }
    } catch (e) {
      console.warn('[TypewriterStore] 读取失败：', e);
    }
    return result;
  },

  /**
   * 落盘便签 + 画布偏移。带写前备份 + read-after-write 校验。
   * 任何一步失败都只告警、绝不把已有数据静默清空。
   */
  async save(notes, canvasOffset, links) {
    const sm = window.storageManager;
    if (!sm) return;
    try {
      if (Array.isArray(notes)) await this._writeNotes(notes);
      if (canvasOffset) {
        await sm.putSetting(this.KEY_CANVAS, {
          x: Number(canvasOffset.x) || 0,
          y: Number(canvasOffset.y) || 0,
        });
      }
      // 连线独立 key：与便签数组分离，连线出错也绝不波及便签
      if (Array.isArray(links)) {
        await sm.putSetting(this.KEY_LINKS, this._sanitizeLinks(links));
      }
    } catch (e) {
      console.warn('[TypewriterStore] 保存失败：', e);
      if (typeof Toast !== 'undefined') Toast.showToast('便签保存失败（离线）', 'warning');
    }
  },

  /** 写入便签：写前备份上一版 + 写新格式 + 读后校验 */
  async _writeNotes(notes) {
    const sm = window.storageManager;
    const clean = this._sanitizeNotes(notes);
    const payload = { version: this.VERSION, notes: clean };
    // 写前备份（保留上一版，损坏可回滚）
    try {
      const prev = await sm.getSetting(this.KEY_NOTES);
      if (prev !== undefined && prev !== null) await sm.putSetting(this.KEY_NOTES_BAK, prev);
    } catch (_) { /* 备份失败不阻断主写入 */ }
    await sm.putSetting(this.KEY_NOTES, payload);
    // read-after-write：写后读回比对条数，不一致即告警（不静默吞掉）
    try {
      const back = await sm.getSetting(this.KEY_NOTES);
      if (!back || !Array.isArray(back.notes) || back.notes.length !== clean.length) {
        console.warn('[TypewriterStore] read-after-write 不一致：期望', clean.length,
          '条，实得', (back && back.notes) ? back.notes.length : '非数组');
      }
    } catch (_) { /* 校验失败仅告警 */ }
  },

  /**
   * 净化便签数组：仅保留结构合法的项（含 string 类型 id），绝不整体清空。
   * 即便混入脏数据也逐条过滤，而非把整个数组扔掉。
   */
  _sanitizeNotes(notes) {
    if (!Array.isArray(notes)) return [];
    return notes.filter((n) => n && typeof n === 'object' && typeof n.id === 'string');
  },

  /** 净化连线数组：只保留 from/to 均为 string 的合法项；非法项逐条丢弃而非整体清空 */
  _sanitizeLinks(links) {
    if (!Array.isArray(links)) return [];
    return links.filter((l) => l && typeof l === 'object'
      && typeof l.from === 'string' && typeof l.to === 'string');
  },
};

// 双保险：打包器若未解析 import，运行时也能通过 window 取到（与 import 绑定二选一）
if (typeof window !== 'undefined') window.TypewriterStore = TypewriterStore;
