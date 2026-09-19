// PersistenceCoordinator — 从 typewriterFeature 巨型单例（B1 解耦）抽出的子系统。
// 方法体逐字搬运，所有内部调用经 ctrl._xxx 由 feature 委托壳自动解析回原对象。
// 共享常量（裸名引用由本 import 提供；测试 harness 剥离 import 时由 twConfig 挂 globalThis 兜底）
import { ICON_LAYERS, ICON_FONT, ICON_GRID, ICON_PRINT, ICON_X, ICON_FONT_DOWN, ICON_FONT_UP, ICON_ZOOM_OUT, ICON_ZOOM_IN, ICON_PAPER, ICON_EXPORT, ICON_PREVIEW, ICON_MOVE_UP, ICON_MOVE_DOWN, ICON_LV_UP, ICON_LV_DOWN, ICON_ROTATE } from './twConfig.js';
import { STACK_STEP, STACK_LEVELS, TYPE_SPEED, MAX_LEN, NOTE_CAP, WRITE_FLOW_GAP, SAVE_DEBOUNCE, LOD_DENSITY, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from './twConfig.js';
import { FONT_SCALES, FONT_SCALE_DEFAULT_IDX, FONT_SCALE_LABELS, CARD_SCALES, CARD_SCALE_LABELS, CARD_SCALE_DEFAULT_IDX } from './twConfig.js';
import { FONTS, FONT_LABELS, FONT_FEEDBACK } from './twConfig.js';
import { PAPERS, PAPER_LABELS, PAPER_FEEDBACK, PAPER_TITLES } from './twConfig.js';
import { LEVELS, LEVEL_LABELS, LEVEL_FEEDBACK, LEVEL_GROUPS, LEVEL_LADDER } from './twConfig.js';
import { TypewriterStore } from '../../services/TypewriterStore.js';
import { SpatialIndex } from '../../services/SpatialIndex.js';
import { GeoCache } from '../../services/GeoCache.js';
import { MindmapFeature } from './mindmapFeature.js';
import { LinkLayer } from '../../services/LinkLayer.js';
import { WritingDoc } from './writingDoc.js';
import { UndoStack } from '../../services/undoStack.js';
import { isFromTextEntry } from '../../utils/domRef.js';

export const PersistenceCoordinator = {
  // (was _scheduleSave)
  scheduleSave(ctx) {
    const { state, ctrl } = ctx;
    // 切档窗口内丢弃落盘：_setMode 先把 _mode 翻成新档、_loadDoc 的 await 才把 _notes 换成新档，
    // 这段窗口内若仍有旧档的打字计时器触发 save，会用「新档 key + 旧档数据」盖写新档（档位串味）。
    // 旧档已在 _persistDoc(prev) 用 pendingText 完整落盘，故直接丢弃窗口内的 save 安全。
    if (ctrl._switching) return;
    if (ctrl._saveTimer) clearTimeout(ctrl._saveTimer);
    ctrl._saveTimer = setTimeout(() => {
      ctrl._saveTimer = null;
      ctrl._saveNow();
    }, SAVE_DEBOUNCE);
  
  },
  // (was _saveNow)
  async saveNow(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas || ctrl._mode === 'mindmap') return;
    const notes = ctrl._collectNotes();
    // 画布尚未布局时 _collectNotes 返回 null：跳过本次落盘，避免写入失真坐标覆盖好数据
    if (!notes) return;
    // 存储契约收敛到 TypewriterStore：自管 schema(putSetting)，画布偏移独立 KV。
    // 彻底绕开只认数组的 putTypewriterNotes，TS 端再也无法因结构假设清空数据。
    const off = ctrl._canvasOffset || { x: 0, y: 0 };
    if (ctrl._mode === 'write') {
      await TypewriterStore.saveWriting(notes, off, ctrl._links);
    } else {
      await TypewriterStore.save(notes, off, ctrl._links);
    }
  
  },
  // (was _persistDoc)
  async persistDoc(ctx, mode) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    const notes = ctrl._collectNotes();
    if (!notes) return;   // 画布未布局：跳过，绝不写入失真数据
    const off = ctrl._canvasOffset || { x: 0, y: 0 };
    if (mode === 'write') await TypewriterStore.saveWriting(notes, off, ctrl._links);
    else await TypewriterStore.save(notes, off, ctrl._links);
  
  },
  // (was _loadDoc)
  async loadDoc(ctx, mode) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    const data = (mode === 'write')
      ? await TypewriterStore.loadWriting()
      : await TypewriterStore.load();
    // 先停掉进行中的打字计时器：否则它们会继续往已被移除的卡片里写字
    ctrl._timers.forEach((t) => { try { clearInterval(t); } catch (_) { /* 忽略 */ } });
    ctrl._timers = [];
    Array.from(canvas.querySelectorAll('.tw-card')).forEach((c) => c.remove());
    ctrl._clearSelection();
    // 信任边界：读档数据经 WritingDoc.normalize 净化；从此 ctrl._notes 为规范模型
    const doc = WritingDoc.normalize(data.notes || [], data.links || [], data.canvasOffset || { x: 0, y: 0 });
    ctrl._notes = doc.notes;
    ctrl._seedSpatial(); // 【P8 空间索引】加载后重建索引
    ctrl._links = doc.links;
    ctrl._canvasOffset = doc.canvasOffset;
    ctrl._applyCanvasTransform();
    const cr = canvas.getBoundingClientRect();
    ctrl._buildCards(ctrl._notes, false, cr.width || 1, cr.height || 1);
    ctrl._renderLinks();          // 卡片就位后再画连线（端点依赖布局尺寸）
    ctrl._ensureNotesVisible();   // 卡片若在视野外自动归位，避免出现「空画布」的错觉
  
  },
  // (was _initUndo)
  initUndo(ctx) {
    const { state, ctrl } = ctx;
    ctrl._undoStack = new UndoStack({
      capture: () => ctrl._snapshot(),
      restore: (s) => ctrl._restoreSnapshot(s),
      onChange: () => ctrl._scheduleSave(),
    });
  
  },
  // (was _snapshot)
  snapshot(ctx) {
    const { state, ctrl } = ctx;
    const notes = ctrl._collectNotes();
    if (!notes) return null;
    return {
      notes,
      links: ctrl._links.map((l) => Object.assign({}, l)),
      offset: Object.assign({}, ctrl._canvasOffset || { x: 0, y: 0 }),
    };
  
  },
  // (was _restoreSnapshot)
  restoreSnapshot(ctx, s) {
    const { state, ctrl } = ctx;
    if (!s || !ctrl._canvas) return;
    // 必须先停掉进行中的打字计时器：否则它们会继续往已被移除的卡片里写字
    ctrl._timers.forEach((t) => { try { clearInterval(t); } catch (_) { /* 忽略 */ } });
    ctrl._timers = [];
    Array.from(ctrl._canvas.querySelectorAll('.tw-card')).forEach((c) => c.remove());
    ctrl._clearSelection();
    ctrl._links = (s.links || []).map((l) => Object.assign({}, l));
    ctrl._canvasOffset = Object.assign({}, s.offset || { x: 0, y: 0 });
    ctrl._applyCanvasTransform();
    const cr = ctrl._canvas.getBoundingClientRect();
    ctrl._buildCards(s.notes || [], false, cr.width || 1, cr.height || 1);
    ctrl._notes = (s.notes || []).slice();   // 撤销恢复后回填规范模型，使保存/计数与 DOM 一致
    ctrl._seedSpatial(); // 【P8 空间索引】撤销恢复后重建索引
    ctrl._scheduleRenderLinks();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
  
  },
  // (was _undoRedo)
  undoRedo(ctx, kind) {
    const { state, ctrl } = ctx;
    const stack = ctrl._undoStack;
    if (!stack) return;
    const ok = (kind === 'redo') ? stack.redo() : stack.undo();
    if (!ok) {
      ctrl._showScreenMsg(kind === 'redo' ? '没有可重做的操作' : '没有可撤销的操作', 1400);
      return;
    }
    ctrl._showScreenMsg(kind === 'redo' ? '已重做' : '已撤销', 900);
  
  },
  // (was _restore)
  async restore(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._restored) return;
    ctrl._restored = true;
    // 存储契约收敛到 TypewriterStore：便签(新 schema) + 画布偏移，含版本/校验/备份/读后校验
    const { notes, canvasOffset, links, version } = await TypewriterStore.load();
    const canvas = ctrl._canvas;
    const cr = canvas.getBoundingClientRect();
    const w = cr.width || 1;
    const h = cr.height || 1;
    // v1 的 x/y 是「相对画布宽高的比例」：画布尺寸一变，便签就按比例被甩出视野（量纲与
    // 画布偏移的绝对 px 不一致）。先按当前画布尺寸换算成绝对 px，随后以 v2 落盘，
    // 之后画布尺寸再变也不会带偏便签位置。
    const ratioCoords = (Number(version) || 1) < TypewriterStore.VERSION;
    const absNotes = ratioCoords
      ? (Array.isArray(notes) ? notes : []).map((n) => Object.assign({}, n, {
          x: (typeof n.x === 'number') ? n.x * w : n.x,
          y: (typeof n.y === 'number') ? n.y * h : n.y,
        }))
      : (Array.isArray(notes) ? notes : []);
    // 信任边界：读档数据经 WritingDoc.normalize 净化（补齐缺省、枚举/范围校正、丢非法项、
    // 连线去自环/悬空/重复），从此 ctrl._notes 为便签的规范模型；_buildCards 再用它建 DOM。
    const doc = WritingDoc.normalize(absNotes, links || [], canvasOffset || { x: 0, y: 0 });
    ctrl._notes = doc.notes;
    ctrl._seedSpatial(); // 【P8 空间索引】恢复后重建索引（_buildCards 会逐个测量→精确入格）
    ctrl._links = doc.links;
    ctrl._canvasOffset = doc.canvasOffset;
    ctrl._buildCards(ctrl._notes, false, w, h);   // ratioCoords=false：坐标已是绝对 px
    ctrl._applyCanvasTransform();
    ctrl._renderLinks();   // 便签就位后再画连线（端点依赖布局尺寸）
    ctrl._ensureNotesVisible();  // 便签若在视野外，自动归位（不必再手动双击空白）

    // 迁移：比例→px 换算完成后立刻以 v2 落盘，避免每次打开都重算
    if (ratioCoords && ctrl._notes.length) ctrl._scheduleSave();
  
  },
  // (was _buildCards)
  buildCards(ctx, notes, ratioCoords, w, h) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    // 全量重建：清掉旧 DOM + 挂载表 + 几何缓存，避免残留/串档
    if (!ctrl._mountedCards) ctrl._mountedCards = new Map();
    if (!ctrl._geo) ctrl._geo = new GeoCache();
    ctrl._mountedCards.clear();
    ctrl._geo.clear();
    Array.from(canvas.querySelectorAll('.tw-card')).forEach((c) => c.remove());
    notes.forEach((n) => {
      const nn = Object.assign({}, n);
      // v1 比例坐标 → 绝对 px（坐标已是 px 后由 _mountCard 直接落位）
      if (ratioCoords) {
        nn.x = (typeof n.x === 'number') ? n.x * w : (w - 340) / 2;
        nn.y = (typeof n.y === 'number') ? n.y * h : 24;
      }
      ctrl._mountCard(nn);
    });
    ctrl._applyLod();
  
  },
  // (was _collectNotes)
  collectNotes(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return null;
    // 画布未布局（功能页被隐藏 / 刚挂载）时不落盘：返回 null 让调用方跳过，
    // 否则会存进「空便签列表」把已有数据覆盖掉。
    const cr = ctrl._canvas.getBoundingClientRect();
    if (cr.width < 2 || cr.height < 2) return null;
    // 【P8 视口剔除】卡片 DOM 会被卸载，故不再从 DOM 收集；模型由 T0c 连续编辑原语实时保鲜，即唯一真源。
    // 深拷贝：避免撤销快照与活动模型共享引用（历史行为 _collectNotes 本就返回新数组）。
    return ctrl._notes.map((n) => Object.assign({}, n));
  
  },
  // (was _saveSnapshot)
  async saveSnapshot(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas || ctrl._mode !== 'write') return;
    const ordered = ctrl._orderCards();
    if (!ordered.length) { ctrl._showScreenMsg('画布上还没有卡片', 1400); return; }
    const content = ctrl._buildCardsMarkdown(ordered);
    if (!content.trim()) { ctrl._showScreenMsg('卡片都是空的', 1400); return; }
    const g = await TypewriterStore.getCurrentWritingGroup();
    const base = (g.title || '未命名草稿')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[.\s]+|[.\s]+$/g, '')
      .slice(0, 40) || '未命名草稿';
    const d = new Date();
    const p2 = (n) => String(n).padStart(2, '0');
    const ts = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}.${p2(d.getMinutes())}.${p2(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`;
    const snapName = `${base} 快照 ${ts}`;
    const snapPath = `MD可视化写作/${snapName}.md`;
    ctrl._showScreenMsg('SAVING SNAPSHOT...', 1200);
    try {
      const sm = window.storageManager;
      if (sm && typeof sm.exportMindmap === 'function') {
        const res = await sm.exportMindmap(snapPath, content);
        if (res && res.ok) {
          ctrl._showScreenMsg('已保存快照：' + snapName, 2200);
          // 与思维子弹导出对齐：保存后自动打开这份快照笔记，便于立即查看/续写
          try { if (sm.openFile) await sm.openFile(snapPath); } catch (_) { /* 打开失败不影响落库 */ }
          return;
        }
      }
      throw new Error('bridge 不可用');
    } catch (e) {
      ctrl._downloadMarkdown(snapPath, content);
      ctrl._showScreenMsg('已下载快照 .md（桥未连接）', 2000);
    }
  
  },
  // (was _reflowWriteOrder)
  reflowWriteOrder(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    const seq = ctrl._orderCards();                 // 全部卡（模型派生，剔除态也完整）
    if (!seq.length) { ctrl._showScreenMsg('画布上还没有卡片', 1000); return; }
    const selCount = ctrl._selected ? ctrl._selected.size : 0;
    // 选中集以 DOM 元素为键：映射回 id（剔除态下能选中的必是可见卡）
    const selIds = new Set();
    if (selCount >= 2 && ctrl._selected) {
      ctrl._selected.forEach((c) => { const id = c.dataset && c.dataset.id; if (id) selIds.add(id); });
    }
    const target = (selCount >= 2) ? seq.filter((c) => selIds.has(c.id)) : seq;
    if (target.length < 2) { ctrl._showScreenMsg('至少两张卡片才能顺流', 1500); return; }

    if (ctrl._undoStack) ctrl._undoStack.push();   // 重排覆盖手工布局，提前留档（撤销可还原）

    // 【P8 视口剔除】重排必须作用于全部卡（含离屏），不能只排可见 DOM：模型位置对所有卡更新，
    // 在屏卡再同步 DOM；离屏卡用几何缓存尺寸累计高度（未测量回退默认），保证整列顺序与高度正确。
    const GAP = WRITE_FLOW_GAP;                     // 与新卡落点同一间距，重排后接着打也不错位
    let y = 0, maxW = 0;
    target.forEach((c) => {
      ctrl._notes = WritingDoc.setPos(ctrl._notes, c.id, 0, y);   // 位置即数据：同步模型（含离屏卡）
      const el = c.el;
      if (el) { el.style.left = '0px'; el.style.top = y + 'px'; }  // 在屏卡同步 DOM
      const g = ctrl._geo ? ctrl._geo.get(c.id) : null;
      const w = g ? g.w : (el ? el.offsetWidth : 340);
      const h = g ? g.h : (el ? el.offsetHeight : 200);
      maxW = Math.max(maxW, w);
      y += (h || 200) + GAP;                        // 按各卡实际高度累计，竖向顺流
    });

    ctrl._syncLayoutGeo();                          // 位置已改写 → 几何缓存/空间索引同步（否则连线端点指向重排前的幽灵位置）
    ctrl._scheduleRenderLinks();                    // 连线端点随位置更新（原有连线保留）
    ctrl._scheduleSave();                           // 持久化新位置
    ctrl._refreshWriteOrder();                      // 顺序徽标随新位置刷新
    ctrl._scheduleCull();                           // 重排后重算挂载：移出视野的卡卸载

    // 居中到顺流后的卡片列：左对齐 x=0，仅垂直堆叠，故只取最大宽与总高做居中
    const totalH = y - GAP;
    const VW = ctrl._canvas.clientWidth, VH = ctrl._canvas.clientHeight;
    ctrl._setCanvasOffset(VW / 2 - maxW / 2, VH / 2 - totalH / 2);

    const scope = selCount >= 2 ? '选中的 ' : '全部 ';
    ctrl._showScreenMsg('已顺流重排' + scope + target.length + ' 张（文章顺序，尺寸不变）', 1800);
  
  },
  // (was _refreshWriteOrder)
  refreshWriteOrder(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    if (ctrl._mode !== 'write') {
      ctrl._canvas.querySelectorAll('.tw-card-order').forEach((b) => b.remove());
      return;
    }
    const ordered = ctrl._orderCards();
    const placed = new Set();
    ordered.forEach((c, i) => {
      if (!c.el) return;   // 离屏（被剔）卡片无 DOM：跳过徽标/可用态，重挂载时 _updateCulling 会再刷
      let badge = c.el.querySelector('.tw-card-order');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'tw-card-order';
        c.el.appendChild(badge);
      }
      badge.textContent = String(i + 1);
      placed.add(c.el);
    });
    // 兜底：清掉不在序列里的（极端时序保护，正常不会进 here）
    ctrl._canvas.querySelectorAll('.tw-card-order').forEach((b) => {
      if (!placed.has(b.parentElement)) b.remove();
    });
    // 上移/下移的可用态跟着顺序走：首位不能上移、末位不能下移。
    // 放在这里统一刷 —— _refreshWriteOrder 已覆盖增删卡/连线/拖动/切档全部时机。
    ordered.forEach((c, k) => {
      const pos = `（文章顺序，当前第 ${k + 1} 位）`;
      const up = c.el.querySelector('.tw-card-move-up');
      const dn = c.el.querySelector('.tw-card-move-down');
      if (up) {
        up.disabled = k === 0;
        up._tipText = k === 0 ? '已在最前' : '上移' + pos;
      }
      if (dn) {
        dn.disabled = k === ordered.length - 1;
        dn._tipText = k === ordered.length - 1 ? '已在最后' : '下移' + pos;
      }
    });
    ctrl._refreshScreenMeta();   // 右上角「卡片 N · 连线 M」随之刷新
  
  },
  // (was _cardsByReadingOrder)
  cardsByReadingOrder(ctx) {
    const { state, ctrl } = ctx;
    // 【P8】离屏卡已被剔除（不在 DOM），顺序必须改从模型派生：x/y 取模型真值，
    // el 解析自挂载表（离屏卡为 null，但顺序计算不受其影响）。
    if (!ctrl._notes || !ctrl._notes.length) return [];
    return ctrl._notes.map((n) => ({
      el: ctrl._mountedCards ? ctrl._mountedCards.get(n.id) || null : null,
      id: n.id,
      x: (typeof n.x === 'number') ? n.x : 0,
      y: (typeof n.y === 'number') ? n.y : 0,
    })).sort((a, b) => (a.y - b.y) || (a.x - b.x));
  
  },
  // (was _orderCards)
  orderCards(ctx) {
    const { state, ctrl } = ctx;
    const cards = ctrl._cardsByReadingOrder();
    if (!cards.length) return [];
    const byPos = (a, b) => (a.y - b.y) || (a.x - b.x);
    const byId = new Map(cards.map((c) => [c.id, c]));
    const links = (ctrl._links || []).filter((l) => byId.has(l.from) && byId.has(l.to));
    if (!links.length) return cards;   // 无连线：退化为阅读顺序

    const adj = new Map();
    const indeg = new Map(cards.map((c) => [c.id, 0]));
    links.forEach((l) => {
      if (!adj.has(l.from)) adj.set(l.from, []);
      adj.get(l.from).push(l.to);
      indeg.set(l.to, (indeg.get(l.to) || 0) + 1);
    });
    // 同一出边按目标位置排序：多分支顺序稳定，不随连线建立的先后而变
    adj.forEach((list) => list.sort((a, b) => byPos(byId.get(a), byId.get(b))));

    const seen = new Set();
    const out = [];
    const walk = (id) => {
      if (seen.has(id)) return;                 // 成环：走到过就不再进，避免死循环
      seen.add(id);
      out.push(byId.get(id));
      (adj.get(id) || []).forEach(walk);
    };
    cards.filter((c) => !indeg.get(c.id)).forEach((c) => walk(c.id));  // 入度为 0 的即开头
    cards.filter((c) => !seen.has(c.id)).forEach((c) => walk(c.id));   // 环内残留：按阅读顺序补尾
    return out;
  
  },
};