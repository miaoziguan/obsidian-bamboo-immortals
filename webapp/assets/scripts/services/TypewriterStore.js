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
  // 思维子弹是**独立文档**（与便签彻底分家）：便签只管便签的卡片/位置/连线，
  // 导图只管自己的节点树与视野。两边各自增删改，互不可见 —— 详见 mindmapFeature.js 顶部说明。
  KEY_MINDMAP: 'typewriter:mindmap',
  KEY_MINDMAP_BAK: 'typewriter:mindmap:bak',
  // v1：父子树（parent + 自动布局）—— 已废弃
  // v2：自由子弹（{id,text,x,y}）+ 自由连线（{from,to} 多对多）
  MINDMAP_VERSION: 2,
  // MD可视化写作是**第三份独立文档**（便签 / 写作 / 子弹三者彻底分家）：
  // 便签是随手记的自由画布，写作是有结构的成文草稿 —— 卡片、位置、连线、级别互不可见。
  // 卡片结构与便签同源（同一套 _sanitizeNotes），只是多一个 level 字段。
  // 【存储现状】每组卡片现已存独立文件 typewriter-writing/<id>.json（见 _migrateLegacyWriting / saveWriting）；
  // 下列 KEY_WRITING* 仅用于「首启迁移」旧版整组数据（从 settings.json 搬到独立文件后清空），日常读写不再使用。
  KEY_WRITING: 'typewriter:writing',
  KEY_WRITING_BAK: 'typewriter:writing:bak',
  KEY_WRITING_LINKS: 'typewriter:writing:links',
  KEY_WRITING_CANVAS: 'typewriter:writing:canvas',
  WRITING_VERSION: 2,
  // 【性能】写作索引「刷新 updatedAt」的节流窗口(ms)。纯内容保存（拖卡/打字，防抖 350ms 一次）
  // 若每次都刷 updatedAt，就变成每 350ms 一次 settings.json 整文件 read-modify-write，
  // 只为更新时间戳，得不偿失 —— 故只在窗口到期 / 新建组 / current 变化时才写一次索引。
  WRITING_INDEX_THROTTLE: 30000,
  // v1：便签 x/y 存「相对画布宽高的比例」——画布尺寸一变，便签就被按比例甩到视野外。
  // v2：x/y 与画布偏移统一为「绝对 px」，量纲一致，画布缩放不再带偏便签位置。
  VERSION: 2,
  VERSION_RATIO_COORDS: 1,   // 旧版本标记：需按比例→px 迁移

  /**
   * 读取便签 + 画布偏移。
   * 便签优先读新 schema(putSetting)；若不存在，则从旧 typewriter-notes.json 裸数组自动迁移。
   * @returns {{notes: Array, canvasOffset: {x:number,y:number}|null, links: Array}}
   */
  async load() {
    const sm = window.storageManager;
    const result = { notes: [], canvasOffset: null, links: [], version: this.VERSION };
    if (!sm) return result;
    try {
      // 1) 新格式（自管 schema）
      if (typeof sm.getSetting === 'function') {
        const wrapped = await sm.getSetting(this.KEY_NOTES);
        if (wrapped && Array.isArray(wrapped.notes)) {
          result.notes = this._sanitizeNotes(wrapped.notes);
          // 无 version 字段即为最早期数据：x/y 是比例，需迁移
          result.version = Number(wrapped.version) || this.VERSION_RATIO_COORDS;
        } else if (typeof sm.getTypewriterNotes === 'function') {
          // 2) 迁移旧格式：typewriter-notes.json 裸数组
          const legacy = await sm.getTypewriterNotes();
          if (Array.isArray(legacy)) {
            result.notes = this._sanitizeNotes(legacy);
            result.version = this.VERSION_RATIO_COORDS;  // 旧裸数组 = 比例坐标
            // 首次读即迁到新格式，但仍标记为 v1（比例），由功能层按画布尺寸转成 px 后再升 v2
            if (result.notes.length) await this._writeNotes(result.notes, this.VERSION_RATIO_COORDS);
          }
        }
        // 画布偏移（独立 key，缩放与偏移同存）
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

  /**
   * 读取思维子弹文档（独立 key，与便签零耦合）。
   * 只做**形状**净化：v2 是「自由子弹 + 自由连线」，没有任何结构约束；
   * v1（父子树）的 parent 字段原样带出，交给功能层做一次性迁移。
   * @returns {{nodes: Array, links: Array, view: {x:number,y:number}|null, version: number}}
   */
  async loadMindmap() {
    const sm = window.storageManager;
    const result = { nodes: [], links: [], view: null, version: this.MINDMAP_VERSION, style: 0 };
    if (!sm || typeof sm.getSetting !== 'function') return result;
    try {
      const doc = await sm.getSetting(this.KEY_MINDMAP);
      if (doc && Array.isArray(doc.nodes)) {
        result.nodes = this._sanitizeNodes(doc.nodes);
        result.links = this._sanitizeLinks(doc.links);
        result.version = Number(doc.version) || this.MINDMAP_VERSION;
        if (doc.view && (typeof doc.view.x === 'number' || typeof doc.view.y === 'number')) {
          result.view = { x: Number(doc.view.x) || 0, y: Number(doc.view.y) || 0 };
        }
        if (typeof doc.style === 'number') result.style = doc.style;
      }
    } catch (e) {
      console.warn('[TypewriterStore] 思维子弹读取失败：', e);
    }
    return result;
  },

  /** 落盘思维子弹文档（写前备份 + 读后校验条数），与便签写入同一套护栏 */
  async saveMindmap(nodes, links, view, style) {
    const sm = window.storageManager;
    if (!sm || typeof sm.putSetting !== 'function') return;
    const clean = this._sanitizeNodes(nodes);
    const wires = this._sanitizeLinks(links);
    try {
      const prev = await sm.getSetting(this.KEY_MINDMAP);
      if (prev !== undefined && prev !== null) await sm.putSetting(this.KEY_MINDMAP_BAK, prev);
    } catch (_) { /* 备份失败不阻断主写入 */ }
    try {
      await sm.putSetting(this.KEY_MINDMAP, {
        version: this.MINDMAP_VERSION,
        nodes: clean,
        links: wires,
        view: view ? { x: Number(view.x) || 0, y: Number(view.y) || 0 } : null,
        style: (typeof style === 'number') ? style : 0,
      });
      const back = await sm.getSetting(this.KEY_MINDMAP);
      if (!back || !Array.isArray(back.nodes) || back.nodes.length !== clean.length) {
        console.warn('[TypewriterStore] 思维子弹 read-after-write 不一致：期望', clean.length,
          '颗，实得', (back && back.nodes) ? back.nodes.length : '非数组');
      }
    } catch (e) {
      console.warn('[TypewriterStore] 思维子弹保存失败：', e);
    }
  },

  // ---- 写作档：多组卡片，每组独立文件 + 轻量索引 ----
  // 设计（回应「单组无上限 + 未来多组」的性能隐患）：
  //  - 索引(仅 groups 元信息 + current)放 settings.json 的 typewriter:writing-index（极小）；
  //  - 每组卡片(重，且无上限)放独立文件 typewriter-writing/<id>.json，保存只重写该组文件，
  //    不再把多组卡片塞进 settings.json 导致每次保存全量重写。
  // 旧版曾把整组塞进 settings.json 的 typewriter:writing，首启自动迁到新结构（见 _migrateLegacyWriting）。
  // 【性能】上次真正写写作索引的时间戳（配合 WRITING_INDEX_THROTTLE，见 saveWriting）
  _writingIdxTs: 0,
  // 【性能】写作索引内存缓存：读走缓存，避免每次保存都把 settings.json 整份读出来 JSON.parse
  //（那份还含便签等其它 key，解析成本随便签数增长）。
  // 所有索引写入都收敛在 _saveWritingIndex 这一出口，故缓存不会失真；
  // 外部整体改写 settings（数据导入/恢复）后需调 invalidateWritingIndex() 丢弃。
  _writingIdxCache: null,

  async _loadWritingIndex() {
    if (this._writingIdxCache) return this._writingIdxCache;
    const sm = window.storageManager;
    if (!sm || typeof sm.getSetting !== 'function') return null;
    try {
      const raw = await sm.getSetting('typewriter:writing-index');
      if (raw && typeof raw === 'object' && raw.groups) {
        this._writingIdxCache = raw;
        return raw;
      }
    } catch (_) { /* 忽略 */ }
    return null;
  },
  async _saveWritingIndex(idx) {
    this._writingIdxCache = idx || null;
    const sm = window.storageManager;
    if (!sm || typeof sm.putSetting !== 'function') return;
    try { await sm.putSetting('typewriter:writing-index', idx); } catch (_) { /* 忽略 */ }
  },
  /** 丢弃写作索引缓存：数据导入/恢复或卸载重挂后调用，下次读取重新落库读取 */
  invalidateWritingIndex() { this._writingIdxCache = null; this._writingIdxTs = 0; },
  async _writingCurrentId() {
    const idx = await this._loadWritingIndex();
    return (idx && typeof idx.current === 'string' && idx.current) ? idx.current : 'default';
  },
  /** 首启迁移：把旧版 settings.json 里的整组写作数据搬进独立文件 + 索引（仅一次） */
  async _migrateLegacyWriting() {
    const sm = window.storageManager;
    if (!sm || typeof sm.getSetting !== 'function') return false;
    let legacy = null;
    try { const raw = await sm.getSetting(this.KEY_WRITING); if (raw && Array.isArray(raw.notes)) legacy = raw; } catch (_) {}
    if (!legacy) return false;   // 无旧数据 → 无需迁移（首次使用）
    const notes = this._sanitizeNotes(legacy.notes);
    let links = [];
    try { const lk = await sm.getSetting(this.KEY_WRITING_LINKS); if (Array.isArray(lk)) links = this._sanitizeLinks(lk); } catch (_) {}
    let canvasOffset = null;
    try {
      const off = await sm.getSetting(this.KEY_WRITING_CANVAS);
      if (off && (typeof off.x === 'number' || typeof off.y === 'number')) canvasOffset = { x: Number(off.x) || 0, y: Number(off.y) || 0 };
    } catch (_) {}
    const id = 'default';
    let moved = false;
    if (sm.getTypewriterWritingDoc && sm.putTypewriterWritingDoc) {
      try {
        await sm.putTypewriterWritingDoc(id, { version: this.WRITING_VERSION, notes, links, canvasOffset });
        moved = true;
      } catch (e) { console.warn('[TypewriterStore] 旧写作数据迁移写文件失败，保留旧 key 不清理：', e); }
    }
    // 【修复】只有确认已落到独立文件才建索引并清旧 key；
    // 否则会「新位置没写成功 + 旧数据被清空」→ 静默丢数据（下次进来会重试迁移）。
    if (!moved) return false;
    await this._saveWritingIndex({ version: 1, current: id, groups: { [id]: { id, title: '未命名草稿', updatedAt: Date.now() } } });
    // 清掉旧 key：置 null 即不再被读取，亦不再占用 settings.json 体积
    try { await sm.putSetting(this.KEY_WRITING, null); await sm.putSetting(this.KEY_WRITING_LINKS, null); await sm.putSetting(this.KEY_WRITING_CANVAS, null); } catch (_) {}
    return true;
  },

  /**
   * 读取MD可视化写作文档（按组独立文件，与便签零耦合）。
   * 卡片结构与便签同源，故直接复用 _sanitizeNotes；level 字段原样带出。
   * @param {string} [id] 组 id，省略则用当前组（索引.current，缺省 'default'）。
   * @returns {{notes: Array, canvasOffset: {x:number,y:number}|null, links: Array, version: number}}
   */
  async loadWriting(id) {
    const sm = window.storageManager;
    const result = { notes: [], canvasOffset: null, links: [], version: this.WRITING_VERSION };
    if (!sm || typeof sm.getSetting !== 'function') return result;
    const gid = id || (await this._writingCurrentId());
    // 首启：无索引但有旧版整组数据 → 迁移到新结构（独立文件 + 索引）
    if (!id && !await this._loadWritingIndex()) await this._migrateLegacyWriting();
    const doc = (sm.getTypewriterWritingDoc) ? await sm.getTypewriterWritingDoc(gid) : null;
    if (doc && Array.isArray(doc.notes)) {
      result.notes = this._sanitizeNotes(doc.notes);
      result.version = Number(doc.version) || this.WRITING_VERSION;
      if (doc.canvasOffset && (typeof doc.canvasOffset.x === 'number' || typeof doc.canvasOffset.y === 'number')) {
        result.canvasOffset = { x: Number(doc.canvasOffset.x) || 0, y: Number(doc.canvasOffset.y) || 0 };
      }
      result.links = Array.isArray(doc.links) ? this._sanitizeLinks(doc.links) : [];
    }
    return result;
  },

  /** 落盘MD可视化写作文档（每组独立文件 + 轻量索引，与便签零耦合）。
   *  只重写该组文件，绝不波及 settings.json 里的其他组 / 便签；索引仅更新轻量元信息。
   *  @param {Array} notes  @param {{x:number,y:number}} canvasOffset  @param {Array} links  @param {string} [id] 组 id（省略=当前组） */
  async saveWriting(notes, canvasOffset, links, id) {
    const sm = window.storageManager;
    if (!sm || typeof sm.putSetting !== 'function') return;
    const gid = id || (await this._writingCurrentId());
    const clean = this._sanitizeNotes(notes);
    const wires = this._sanitizeLinks(links);
    try {
      if (sm.putTypewriterWritingDoc) await sm.putTypewriterWritingDoc(gid, { version: this.WRITING_VERSION, notes: clean, links: wires, canvasOffset });
    } catch (e) {
      console.warn('[TypewriterStore] 写作档保存失败：', e);
    }
    // 索引：只在「新建组 / current 变了 / 节流窗口到期」时才写 settings.json ——
    // 【性能】纯内容保存（拖卡·打字，防抖 350ms 一次）不再每次刷 updatedAt，
    // 避免每 350ms 一次 settings.json 整文件 read-modify-write（卡片正文已走独立文件，无需进索引）。
    try {
      const idx = (await this._loadWritingIndex()) || { version: 1, current: gid, groups: {} };
      idx.groups = idx.groups || {};
      const isNew = !idx.groups[gid];
      if (isNew) idx.groups[gid] = { id: gid, title: '未命名草稿', updatedAt: Date.now(), notePath: null };
      const curChanged = idx.current !== gid;
      const now = Date.now();
      if (isNew || curChanged || (now - (this._writingIdxTs || 0)) > this.WRITING_INDEX_THROTTLE) {
        idx.current = gid;
        idx.groups[gid].updatedAt = now;
        await this._saveWritingIndex(idx);
        this._writingIdxTs = now;
      }
    } catch (_) { /* 索引失败不阻断主写入 */ }
  },

  /** 净化子弹：逐条过滤非法项，绝不整体清空（与便签同一条原则）。
   *  正常只有 {id,text,x,y}；parent 是 v1 遗留字段，仅在迁移时透传，迁移后不再写入。 */
  _sanitizeNodes(nodes) {
    if (!Array.isArray(nodes)) return [];
    const out = [];
    nodes.forEach((n) => {
      if (!n || typeof n !== 'object' || typeof n.id !== 'string' || !n.id) return;
      const item = {
        id: n.id,
        text: typeof n.text === 'string' ? n.text : '',
        x: Number.isFinite(n.x) ? n.x : 0,
        y: Number.isFinite(n.y) ? n.y : 0,
        color: typeof n.color === 'string' ? n.color : '',   // 每颗子弹可单独着色（'' = 默认），写/读都会过此净化，勿漏
      };
      if (typeof n.parent === 'string' && n.parent) item.parent = n.parent;   // v1 → v2 迁移通道
      out.push(item);
    });
    return out;
  },

  /** 写入便签：写前备份上一版 + 写新格式 + 读后校验
   *  @param {number} [version] 显式指定版本号（迁移旧数据时传 VERSION_RATIO_COORDS） */
  async _writeNotes(notes, version) {
    const sm = window.storageManager;
    const clean = this._sanitizeNotes(notes);
    const payload = { version: version || this.VERSION, notes: clean };
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

  // ---- 写作档：分组（多份卡片组，每份独立文件）管理 ----
  // 索引(轻量)放 settings.json；分组切换 = 换当前组 id。以下方法供 UI 调用。
  async ensureWritingIndex() {
    let idx = await this._loadWritingIndex();
    if (!idx) {
      idx = { version: 1, current: 'default', groups: { default: { id: 'default', title: '未命名草稿', updatedAt: Date.now(), notePath: null } } };
      await this._saveWritingIndex(idx);
    }
    return idx;
  },
  /** 列出全部写作卡片组（按更新时间倒序），供切换面板渲染 */
  async listWritingGroups() {
    const idx = await this.ensureWritingIndex();
    return Object.keys(idx.groups)
      .map((id) => idx.groups[id])
      .map((g) => ({ id: g.id, title: (g && g.title) || '未命名草稿', updatedAt: (g && g.updatedAt) || 0, notePath: (g && g.notePath) || null }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
  /** 当前所在的写作卡片组 {id, title}（无索引时退回 default） */
  async getCurrentWritingGroup() {
    const idx = await this.ensureWritingIndex();
    const id = (idx.current && idx.groups[idx.current]) ? idx.current : 'default';
    const g = idx.groups[id] || { id, title: '未命名草稿', notePath: null };
    return { id, title: g.title || '未命名草稿', notePath: g.notePath || null };
  },
  /** 新建一个空白写作卡片组，并设为当前组；返回 {id, title} */
  async createWritingGroup(title) {
    const idx = await this.ensureWritingIndex();
    const id = 'doc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const cleanTitle = (title && String(title).trim()) || '未命名草稿';
    idx.groups[id] = { id, title: cleanTitle, updatedAt: Date.now(), notePath: null };
    idx.current = id;
    await this._saveWritingIndex(idx);
    return { id, title: cleanTitle };
  },
  /** 重命名某组（空名退回原值） */
  async renameWritingGroup(id, title) {
    const idx = await this.ensureWritingIndex();
    if (!idx.groups[id]) return;
    const v = (title && String(title).trim());
    if (v) idx.groups[id].title = v;
    idx.groups[id].updatedAt = Date.now();
    await this._saveWritingIndex(idx);
  },
  /** 切换当前组（不载入画布，载入由调用方负责） */
  async setWritingCurrent(id) {
    const idx = await this.ensureWritingIndex();
    if (!idx.groups[id]) return;
    idx.current = id;
    await this._saveWritingIndex(idx);
  },
  /** 删除一个写作卡片组：从索引移除 + 删其卡片数据文件；若删的是当前组则退回剩余首组（无剩余则重建 default）。
   *  @returns {Promise<{ok:boolean, id:string, notePath:?string, current:string}>} current 为删除后应载入的组 */
  async deleteWritingGroup(id) {
    const idx = await this.ensureWritingIndex();
    if (!idx.groups[id]) return { ok: false, id, notePath: null, current: (await this._writingCurrentId()) };
    const notePath = idx.groups[id].notePath || null;
    delete idx.groups[id];
    const remaining = Object.keys(idx.groups);
    if (idx.current === id) {
      if (remaining.length === 0) {
        const nid = 'default';
        idx.groups[nid] = { id: nid, title: '未命名草稿', updatedAt: Date.now(), notePath: null };
        idx.current = nid;
      } else {
        idx.current = remaining[0];
      }
    }
    await this._saveWritingIndex(idx);
    // 删该组卡片数据文件（scoped 到 typewriter-writing，安全）
    const sm = window.storageManager;
    try { if (sm && typeof sm.deleteTypewriterWritingDoc === 'function') await sm.deleteTypewriterWritingDoc(id); } catch (_) { /* 忽略 */ }
    return { ok: true, id, notePath, current: idx.current };
  },

  // ---- 思维子弹：分组（多份思维导图，每份独立文档）管理 ----
  // 索引(轻量)放 settings.json；每组文档存独立文件 typewriter-mindmap/<id>.json（与写作档同构，不进 settings.json）。
  // 首次运行会把旧的单文档（KEY_MINDMAP）与旧版 settings 里的 typewriter:mindmap:<id> 一并迁到独立文件，保证存量数据不丢。
  KEY_MINDMAP_INDEX: 'typewriter:mindmap-index',

  async _loadSetting(key) {
    const sm = window.storageManager;
    if (!sm || typeof sm.getSetting !== 'function') return null;
    try { return await sm.getSetting(key); } catch (_) { return null; }
  },
  async _saveSetting(key, val) {
    const sm = window.storageManager;
    if (!sm || typeof sm.putSetting !== 'function') return;
    try { await sm.putSetting(key, val); } catch (_) { /* 忽略 */ }
  },

  async ensureMindmapIndex() {
    let idx = await this._loadSetting(this.KEY_MINDMAP_INDEX);
    if (!idx || typeof idx !== 'object' || !idx.groups) idx = { groups: {}, current: null };
    // 首次：把旧单文档迁入 default 组
    if (Object.keys(idx.groups).length === 0) {
      const legacy = await this.loadMindmap();
      const nid = 'default';
      idx.groups[nid] = { id: nid, title: '未命名思维导图', updatedAt: Date.now(), notePath: null };
      idx.current = nid;
      await this.saveMindmapGroupDoc(nid, legacy);
      await this._saveSetting(this.KEY_MINDMAP_INDEX, idx);
      await this._saveSetting(this.KEY_MINDMAP, null);   // 旧单键已并入 default 组，清掉避免混淆
    }
    // 迁移：把旧版(settings.json 里的 typewriter:mindmap:<id> 每文档)搬到独立文件，只做一次
    if (!idx.docMigrated) {
      await this._migrateLegacyMindmapGroups(idx);
      idx.docMigrated = true;
      await this._saveSetting(this.KEY_MINDMAP_INDEX, idx);
    }
    // 清理历史脏数据：早期版本导图导出会绑定一篇「组名=笔记名」的源笔记(notePath)。
    // 现导图已改为纯快照导出、不再绑定任何笔记，故一次性清空全部残留 notePath，
    // 只解除引用、**不删笔记文件本身**（那些已是库里的普通笔记，内容仍在）。
    if (!idx.notePathCleared) {
      Object.keys(idx.groups).forEach((k) => {
        if (idx.groups[k] && idx.groups[k].notePath) idx.groups[k].notePath = null;
      });
      idx.notePathCleared = true;
      await this._saveSetting(this.KEY_MINDMAP_INDEX, idx);
    }
    // 【修复】清理历史脏数据：早期迁移曾把备份键(typewriter:mindmap:bak)误判成 id='bak' 的分组，
    // 已生成幽灵分组与孤儿文件 typewriter-mindmap/bak.json。此处一次性摘除该组并删除其文件。
    if (!idx.bakCleaned) {
      if (idx.groups['bak']) {
        delete idx.groups['bak'];
        if (idx.current === 'bak') idx.current = Object.keys(idx.groups)[0] || null;
        const smBak = window.storageManager;
        try {
          if (smBak && typeof smBak.deleteTypewriterMindmapDoc === 'function') await smBak.deleteTypewriterMindmapDoc('bak');
        } catch (_) { /* 文件本就不存在亦无妨 */ }
      }
      idx.bakCleaned = true;
      await this._saveSetting(this.KEY_MINDMAP_INDEX, idx);
    }
    return idx;
  },
  /** 一次性迁移：把旧版(settings.json 里的 typewriter:mindmap:<id> 每文档)搬到独立文件 typewriter-mindmap/<id>.json，
   *  并清掉旧 settings key，避免多组文档长期堆在 settings.json 拖慢每次保存。idx 原地更新（新增的组补进索引）。 */
  async _migrateLegacyMindmapGroups(idx) {
    const sm = window.storageManager;
    if (!sm || typeof sm.getAllSettings !== 'function' || typeof sm.putSetting !== 'function') return;
    let all;
    try { all = await sm.getAllSettings(); } catch (_) { return; }
    if (!all || typeof all !== 'object') return;
    const prefix = 'typewriter:mindmap:';
    // 【修复】必须排除备份键 KEY_MINDMAP_BAK（'typewriter:mindmap:bak'）：它同样以冒号前缀开头，
    // 否则会被当成 id='bak' 的分组文档 → 凭空生成幽灵分组 + 孤儿文件 typewriter-mindmap/bak.json。
    // （KEY_MINDMAP_INDEX 是连字符 'typewriter:mindmap-index'，本就不匹配冒号前缀，保留排除仅为语义明确。）
    const keys = Object.keys(all).filter(
      (k) => k.startsWith(prefix) && k !== this.KEY_MINDMAP_INDEX && k !== this.KEY_MINDMAP_BAK
    );
    if (!keys.length) return;
    idx.groups = idx.groups || {};
    for (const k of keys) {
      const id = k.slice(prefix.length);
      const doc = all[k];
      if (!id || !doc || typeof doc !== 'object') { try { await sm.putSetting(k, null); } catch (_) {} continue; }
      const moved = await this.saveMindmapGroupDoc(id, doc);   // true = 确实落到了独立文件
      if (!idx.groups[id]) idx.groups[id] = { id, title: '未命名思维导图', updatedAt: Date.now(), notePath: null };
      // 【修复】只有确认已搬到独立文件才清旧 settings key；
      // 否则会出现「新位置没写成功 + 旧数据被清空」的静默丢数据。
      if (moved) { try { await sm.putSetting(k, null); } catch (_) {} }
    }
    if (!idx.current && Object.keys(idx.groups).length) idx.current = Object.keys(idx.groups)[0];
  },

  async saveMindmapGroupDoc(id, doc) {
    const sm = window.storageManager;
    const payload = {
      version: this.MINDMAP_VERSION,
      nodes: this._sanitizeNodes(doc.nodes),
      links: this._sanitizeLinks(doc.links),
      view: doc.view ? { x: Number(doc.view.x) || 0, y: Number(doc.view.y) || 0 } : null,
      style: (typeof doc.style === 'number') ? doc.style : 0,
    };
    // 主路径：每组独立文件（与写作档同构），不撑大 settings.json、保存只重写该组文件
    // 返回 true 表示确实落到了独立文件；false 表示退化回 settings —— 调用方据此决定是否可安全清理旧 key
    if (sm && typeof sm.putTypewriterMindmapDoc === 'function') {
      try { await sm.putTypewriterMindmapDoc(id, payload); return true; }
      catch (e) { console.warn('[TypewriterStore] 思维子弹组文件写入失败，退化 settings：', e); }
    }
    // 兜底：桥未实现时退回 settings（不应走到）
    await this._saveSetting('typewriter:mindmap:' + id, payload);
    return false;
  },
  async loadMindmapGroupDoc(id) {
    const sm = window.storageManager;
    // 主路径：读独立文件（与写作档同构）
    let doc = null;
    if (sm && typeof sm.getTypewriterMindmapDoc === 'function') {
      try { doc = await sm.getTypewriterMindmapDoc(id); } catch (_) { doc = null; }
    }
    // 兜底：兼容尚未迁移的旧 settings key（不依赖桥也能恢复存量）
    if (!doc && sm && typeof sm.getSetting === 'function') {
      try { doc = await sm.getSetting('typewriter:mindmap:' + id); } catch (_) { doc = null; }
    }
    if (!doc) return { nodes: [], links: [], view: null, style: 0, version: this.MINDMAP_VERSION };
    return {
      nodes: this._sanitizeNodes(doc.nodes),
      links: this._sanitizeLinks(doc.links),
      view: (doc.view && (typeof doc.view.x === 'number' || typeof doc.view.y === 'number'))
        ? { x: Number(doc.view.x) || 0, y: Number(doc.view.y) || 0 } : null,
      style: (typeof doc.style === 'number') ? doc.style : 0,
      version: Number(doc.version) || this.MINDMAP_VERSION,
    };
  },
  async listMindmapGroups() {
    const idx = await this.ensureMindmapIndex();
    return Object.keys(idx.groups)
      .map((id) => idx.groups[id])
      .map((g) => ({ id: g.id, title: (g && g.title) || '未命名思维导图', updatedAt: (g && g.updatedAt) || 0, notePath: (g && g.notePath) || null }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
  async getCurrentMindmapGroup() {
    const idx = await this.ensureMindmapIndex();
    const id = (idx.current && idx.groups[idx.current]) ? idx.current : Object.keys(idx.groups)[0];
    const g = (id && idx.groups[id]) || { id: id || 'default', title: '未命名思维导图', notePath: null };
    return { id: g.id || 'default', title: g.title || '未命名思维导图', notePath: g.notePath || null };
  },
  async createMindmapGroup(title) {
    const idx = await this.ensureMindmapIndex();
    const id = 'mm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const t = (title && String(title).trim()) || '未命名思维导图';
    idx.groups[id] = { id, title: t, updatedAt: Date.now(), notePath: null };
    idx.current = id;
    await this._saveSetting(this.KEY_MINDMAP_INDEX, idx);
    return { id, title: t };
  },
  async renameMindmapGroup(id, title) {
    const idx = await this.ensureMindmapIndex();
    if (!idx.groups[id]) return;
    const v = (title && String(title).trim());
    if (v) idx.groups[id].title = v;
    idx.groups[id].updatedAt = Date.now();
    await this._saveSetting(this.KEY_MINDMAP_INDEX, idx);
  },
  async setMindmapCurrent(id) {
    const idx = await this.ensureMindmapIndex();
    if (!idx.groups[id]) return;
    idx.current = id;
    await this._saveSetting(this.KEY_MINDMAP_INDEX, idx);
  },
  /** 删除一个思维导图组：从索引移除 + 清其文档键；若删当前组则退回剩余首组（无剩余则重建 default）。
   *  @returns {Promise<{ok:boolean, id:string, notePath:?string, current:string}>} */
  async deleteMindmapGroup(id) {
    const idx = await this.ensureMindmapIndex();
    if (!idx.groups[id]) return { ok: false, id, notePath: null, current: (idx.current || 'default') };
    const notePath = idx.groups[id].notePath || null;
    delete idx.groups[id];
    const remaining = Object.keys(idx.groups);
    if (idx.current === id) {
      if (remaining.length === 0) {
        const nid = 'default';
        idx.groups[nid] = { id: nid, title: '未命名思维导图', updatedAt: Date.now(), notePath: null };
        idx.current = nid;
      } else {
        idx.current = remaining[0];
      }
    }
    await this._saveSetting(this.KEY_MINDMAP_INDEX, idx);
    const sm = window.storageManager;
    try {
      if (sm && typeof sm.deleteTypewriterMindmapDoc === 'function') await sm.deleteTypewriterMindmapDoc(id);
      else await this._saveSetting('typewriter:mindmap:' + id, null);
    } catch (_) { /* 忽略 */ }
    return { ok: true, id, notePath, current: idx.current };
  },
};

// 双保险：打包器若未解析 import，运行时也能通过 window 取到（与 import 绑定二选一）
if (typeof window !== 'undefined') window.TypewriterStore = TypewriterStore;
