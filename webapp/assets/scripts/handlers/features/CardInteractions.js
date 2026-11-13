// CardInteractions — 从 typewriterFeature 巨型单例（B1 解耦）抽出的子系统。
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
import { fitCardText } from '../../utils/cardTextFit.js';
import { CanvasViewport } from '../../services/CanvasViewport.js';
import { CanvasGestures } from '../../services/CanvasGestures.js';
import { CanvasKeys } from '../../services/CanvasKeys.js';
// 三档差异真源（P2 · A 类）：卡片交互归属 / 连线定序，一律查表
import { ModePolicy } from './modePolicy.js';
// 拖拽期帧间隔探针：把「卡不卡」变成 p50/p90/max 的可报数样本（现场诊断用，见 utils/dragPerf.js）
import { DragPerf } from '../../utils/dragPerf.js';
import { plainifyCodeBlocks } from '../../utils/codeHighlight.js';

/** 【连线定序】连线是文章顺序的输入之一：增 / 删连线后按 orderIds（连线优先 → 回退阅读序）
 *  重算一次 seq，并显式刷徽标。真值仍落在 seq 上（读取方 O(1)、不每帧现推），
 *  连线只在变更瞬间参与推导。
 *  是否启用由策略表决定（linksDefineOrder）—— 原先这条规则连同 _mode === 'write'
 *  在 addLink / removeLink / removeLinksOfData 里各写一遍，加档位时极易只改其中一处。 */
function reseqByLinks(ctrl) {
  if (!ModePolicy.linksDefineOrder(ctrl._mode)) return;
  ctrl._notes = WritingDoc.setOrder(ctrl._notes, WritingDoc.orderIds(ctrl._notes, ctrl._links));
  ctrl._refreshWriteOrder();
}

// ── 编辑态格式工具条（无语法编辑的「新增格式 / 增删行列」入口）─────────────────
// 挂在 .tw-card 上而非 .tw-card-main：后者有 overflow:hidden 会把浮层裁掉。
// 所有按钮 pointerdown 时 preventDefault —— 否则点按钮会让 textEl 失焦，
// 直接触发 exitEdit、选区也一起丢了。
/** 光标所在节点：优先用编辑态快照（点工具条后全局 selection 常已失效）。 */
function currentNodeInText(card, textEl) {
  const pick = (n) => (n && n.nodeType === 3 ? n.parentNode : n);
  const inText = (n) => !!(n && textEl.contains(n));
  // ① 实时 selection 最可信：用户刚把光标放到哪，就以哪为准（快照可能已经过时）
  const sel = getSel(textEl);
  if (sel && sel.rangeCount) {
    const live = pick(sel.anchorNode || sel.focusNode);
    if (live && live.closest && inText(live)) return live;
  }
  // ② 选中文字的快照（点工具条时实时选区常已失效）
  const saved = card && card._editRange;
  if (saved && inText(saved.startContainer)) return pick(saved.startContainer);
  // ③ 光标位置快照（列表项 / 单元格定位，只需「停在哪」）
  const caret = card && card._caretRange;
  if (caret && inText(caret.startContainer)) return pick(caret.startContainer);
  return null;
}

function currentRowOf(card, textEl) {
  const node = currentNodeInText(card, textEl);
  const row = node && node.closest('.tw-md-list, .tw-task-row');
  return row && textEl.contains(row) ? row : null;
}

function currentCellOf(card, textEl) {
  const node = currentNodeInText(card, textEl);
  const cell = node && node.closest('td, th');
  return cell && textEl.contains(cell) ? cell : null;
}

/* 浏览器原生行内命令：contentEditable 的标准做法。
   选区由浏览器内部维护，不受 Shadow DOM 里拿到的 Range「容器在卡外」影响 ——
   这正是手搓 Range 包裹一直改不到可见文本的根因。 */
/* 加粗视觉：700 字重 + 字体合成 + 极细描边。
   描边不能大：0.05em 以上叠加会把中文笔画的间隙填满，字反而糊成一片看不清。
   同时清掉上一版留在节点上的临时视觉（底纹 / 四向阴影 / 内边距）。 */
function emphasizeStrong(el) {
  if (!el || !el.style) return;
  el.style.fontWeight = '700';
  el.style.fontSynthesis = 'weight';
  el.style.webkitTextStroke = '0.02em currentColor';
  el.style.background = '';
  el.style.borderRadius = '';
  el.style.padding = '';
  el.style.textShadow = '';
}

/* 行内格式的可见性兜底：原生命令产出的标签在部分字体/主题下看不出差异。 */
function emphasizeInline(el, tag) {
  if (!el || !el.style) return;
  if (tag === 'strong' || tag === 'b') { emphasizeStrong(el); return; }
  if (tag === 'em' || tag === 'i') {
    el.style.fontStyle = 'italic';
    el.style.fontSynthesis = 'style';   // 字体无斜体变体时合成倾斜
    return;
  }
  if (tag === 'del' || tag === 's' || tag === 'strike') {
    el.style.textDecoration = 'line-through';
    el.style.opacity = '0.65';
  }
}

const EXEC_CMD = { strong: 'bold', b: 'bold', em: 'italic', i: 'italic', del: 'strikeThrough', s: 'strikeThrough' };

function execInlineCommand(textEl, tag) {
  const cmd = EXEC_CMD[tag];
  if (!cmd || typeof document.execCommand !== 'function') return null;
  // 只在 textEl 确实是当前编辑宿主时用原生命令，否则会作用到别的元素上。
  // Shadow Root 有自己的 activeElement，document.activeElement 在这里拿到的是 host（甚至 BODY）。
  const root = textEl.getRootNode ? textEl.getRootNode() : null;
  const active = (root && root.activeElement) || document.activeElement;
  if (active !== textEl && !(textEl.contains && textEl.contains(active))) return null;
  const before = textEl.innerHTML;
  try {
    document.execCommand('styleWithCSS', false, false);   // 强制产出 <b>/<i> 标签而非内联 style
    if (!document.execCommand(cmd, false, null)) return null;
  } catch (_) {
    return null;
  }
  if (textEl.innerHTML === before) return null;   // 没有任何实际改动 → 交给快照 Range 兜底
  textEl.dataset.twRich = '1';
  // 原生命令产出的是裸 <b>，同样可能被纸样样式重置字重：补内联兜底
  if (cmd === 'bold') textEl.querySelectorAll('b, strong').forEach(emphasizeStrong);
  let on = false;
  try { on = document.queryCommandState(cmd); } catch (_) { on = false; }
  return on ? 'add' : 'remove';
}

/**
 * 行内格式 toggle（选区已在该标签内则解包，否则用选区包裹）。
 * 优先走浏览器原生命令；不可用时才用手里的 range 快照兜底。
 * 返回 'add' / 'remove' 或失败原因字符串（便于给出具体提示）。
 */
function toggleInlineTag(textEl, tag, range) {
  const native = execInlineCommand(textEl, tag);
  if (native) return native;
  let r = range;
  if (!r) {
    const sel = getSel(textEl);
    if (sel && sel.rangeCount) {
      const cur = sel.getRangeAt(0);
      if (!cur.collapsed && textEl.contains(cur.commonAncestorContainer)) r = cur;
    }
  }
  if (!r) r = rangeFromSelectedText(textEl);   // 容器在 shadow 外层 → 用选中文字重建
  if (!r) return 'no-range';
  if (!textEl.contains(r.commonAncestorContainer)) return 'outside';
  let node = r.commonAncestorContainer;
  if (node.nodeType === 3) node = node.parentNode;
  // execCommand 产出的是 <b>/<i>/<s>，与 strong/em/del 同义，取消时要能一并识别
  // execCommand 产出的是 <b>/<i>/<strike>，与 strong/em/del 同义，取消时必须一并识别，
  // 否则同一段文字只能反复包裹、永远解不掉（I 与 S 按钮「点了没反应」的根因）。
  const WRAP_SEL = {
    strong: 'strong, b', b: 'strong, b',
    em: 'em, i', i: 'em, i',
    del: 'del, s, strike', s: 'del, s, strike',
    code: 'code', mark: 'mark',
  };
  const wrapSel = WRAP_SEL[tag] || tag;
  const wrap = node && node.closest ? node.closest(wrapSel) : null;
  if (wrap && textEl.contains(wrap)) {
    const parent = wrap.parentNode;
    while (wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
    parent.removeChild(wrap);
    textEl.dataset.twRich = '1';              // 一旦进入格式编辑，写回改走序列化
    return 'remove';                          // 已有格式 → 这次是取消
  }
  if (r.collapsed || !String(r).trim()) return 'collapsed';   // 光标态 / 空选区都不造空标签
  const el = document.createElement(tag);
  el.appendChild(r.extractContents());
  r.insertNode(el);
  // 内联兜底：纸样/主题可能用更高特异性的规则重置字重，外部 CSS 一旦被覆盖就是
  // 「节点加了、字没变」。内联样式优先级最高，保证任何字体下都能看出差异。
  emphasizeInline(el, tag);
  // 选中新内容只是体验优化，失败不影响已完成的加粗（必须用 shadow 自己的 selection 才生效）
  try {
    const sel = getSel(textEl);
    if (sel) {
      sel.removeAllRanges();
      const r2 = document.createRange();
      r2.selectNodeContents(el);
      sel.addRange(r2);
    }
  } catch (_) { /* 忽略：选区 API 在 shadow 里可能不可用 */ }
  textEl.dataset.twRich = '1';
  return 'add';                               // 这次是新加上格式
}

/** 表格增删行列：行列都至少保留一。 */
function tableEditOp(card, textEl, op) {
  const cell = currentCellOf(card, textEl);
  if (!cell) return 'no-cell';
  const tr = cell.parentNode;
  const table = cell.closest('table');
  if (!table) return false;
  const idx = Array.prototype.indexOf.call(tr.children, cell);
  if (op === 'row+') {
    const clone = tr.cloneNode(true);
    Array.from(clone.children).forEach((c) => { c.textContent = ''; });
    tr.parentNode.insertBefore(clone, tr.nextSibling);
  } else if (op === 'row-') {
    if (tr.parentNode.children.length <= 1) return false;
    tr.parentNode.removeChild(tr);
  } else if (op === 'col+') {
    Array.from(table.querySelectorAll('tr')).forEach((row) => {
      const ref = row.children[idx];
      const c = document.createElement(ref && ref.tagName === 'TH' ? 'th' : 'td');
      c.textContent = '';
      row.insertBefore(c, ref ? ref.nextSibling : null);
    });
  } else if (op === 'col-') {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (!rows.length || rows[0].children.length <= 1) return false;
    rows.forEach((row) => { if (row.children[idx]) row.removeChild(row.children[idx]); });
  } else {
    return false;
  }
  return true;
}

/**
 * 表格内回车：光标移到下一行同列，已是最后一行则补一行空单元格（纯 md：新的一行 `|  |`）。
 * 以前不拦，浏览器会在单元格里塞 <br>/<div>，序列化时只能压成空格 ——
 * 用户看到换行、保存后却没了。GFM 单元格语法上不支持换行，所以让回车做标准表格动作。
 */
function tableEnterNextRow(card, textEl) {
  const cell = currentCellOf(card, textEl);
  if (!cell) return false;
  const tr = cell.parentNode;
  const table = cell.closest('table');
  if (!table || !tr) return false;
  const idx = Array.prototype.indexOf.call(tr.children, cell);
  const rows = Array.from(table.querySelectorAll('tr'));
  let next = rows[rows.indexOf(tr) + 1] || null;
  let added = false;
  if (!next) {
    next = appendTableRow(table, tr);
    added = true;
  }
  const target = next.children[idx];
  if (!target) return added;
  placeCaretAtEnd(textEl, target, card);
  return added;
}

/** 在 modelRow 之后补一行空单元格；modelRow 属表头时补进 tbody（表格必须有数据行）。
 *  回车与 Tab 共用：两处都要「末行自动补行」，各写一份会漂。 */
function appendTableRow(table, modelRow) {
  const next = document.createElement('tr');
  Array.from(modelRow.children).forEach(() => {
    const c = document.createElement('td');
    c.textContent = '';
    next.appendChild(c);
  });
  if (modelRow.closest('thead')) {
    let body = table.querySelector('tbody');
    if (!body) { body = document.createElement('tbody'); table.appendChild(body); }
    body.appendChild(next);
  } else {
    modelRow.parentNode.appendChild(next);
  }
  return next;
}

/** 把光标落到某个单元格末尾并记进 card._caretRange（序列化与结构操作都读它）。 */
function placeCaretAtEnd(textEl, target, card) {
  if (!target) return false;
  try {
    const r = document.createRange();
    r.setStart(target, target.childNodes.length);
    r.collapse(true);
    const sel = getSel(textEl);
    if (sel) { sel.removeAllRanges(); sel.addRange(r); card._caretRange = r.cloneRange(); }
    return true;
  } catch (_) {
    return false;   // 光标定位失败不影响已完成的跳格/补行
  }
}

/** 表格内 Tab：跳下一格；末格（非反向）补一行并落到新行首格。
 *  必须在 onKey 的 `if (!row) return` 之前处理 —— 表格里没有列表行，
 *  漏拦 Tab 会被浏览器当成焦点切换，直接 blur 退出编辑（旧行为即如此）。
 *  @returns {'moved'|'added'|false} */
function tableTabMove(card, textEl, reverse) {
  const cell = currentCellOf(card, textEl);
  if (!cell) return false;
  const tr = cell.parentNode;
  const table = cell.closest('table');
  if (!table || !tr) return false;
  const rows = Array.from(table.querySelectorAll('tr'));
  const rowIdx = rows.indexOf(tr);
  const colIdx = Array.prototype.indexOf.call(tr.children, cell);
  if (rowIdx < 0 || colIdx < 0) return false;

  if (reverse) {
    // 反向：同一行左一格；行首则落到上一行末格；已是第一格则原地不动
    let target = null;
    if (colIdx > 0) target = tr.children[colIdx - 1];
    else if (rowIdx > 0) {
      const prev = rows[rowIdx - 1];
      target = prev.children[prev.children.length - 1];
    }
    if (!target) return false;
    placeCaretAtEnd(textEl, target, card);
    return 'moved';
  }

  // 正向：同一行右一格；行末则落到下一行首格；最后一格则补行
  if (colIdx < tr.children.length - 1) {
    placeCaretAtEnd(textEl, tr.children[colIdx + 1], card);
    return 'moved';
  }
  if (rowIdx < rows.length - 1) {
    placeCaretAtEnd(textEl, rows[rowIdx + 1].children[0], card);
    return 'moved';
  }
  const next = appendTableRow(table, tr);
  placeCaretAtEnd(textEl, next.children[0], card);
  return 'added';
}

/** GFM 表格分隔行（与渲染层同源判定）：决定「哪一行是分隔行」才能改对齐。 */
const TABLE_DELIM_ROW_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const isTableDelimRow = (s) => String(s).indexOf('|') >= 0 && TABLE_DELIM_ROW_RE.test(s);
const splitTableCells = (s) => String(s).trim().replace(/^\|/, '').replace(/\|$/, '')
  .split('|').map((x) => x.trim());

/** 切换光标所在列的对齐：默认左 → 中 → 右 → 左。写回 GFM 分隔行（语义可表达，安全）。
 *  与行列按钮同一套入口（忽略 range，直接读 card._caretRange 里的单元格）。 */
function cycleColumnAlign(ctrl, card, textEl) {
  const cell = currentCellOf(card, textEl);
  if (!cell) return 'no-cell';
  const tr = cell.parentNode;
  const table = cell.closest('table');
  const note = (ctrl._notes || []).find((n) => n.id === (card && card.dataset.id));
  if (!table || !tr || !note) return false;
  const col = Array.prototype.indexOf.call(tr.children, cell);
  const lines = String(note.text || '').split('\n');
  let delimAt = -1;
  for (let i = 0; i + 1 < lines.length; i += 1) {
    if (lines[i].indexOf('|') >= 0 && isTableDelimRow(lines[i + 1])) { delimAt = i + 1; break; }
  }
  if (delimAt < 0) return false;
  const cells = splitTableCells(lines[delimAt]);
  if (col < 0 || !cells[col]) return false;
  const cur = cells[col];
  const isCenter = /^:.*:$/.test(cur);
  const isRight = !isCenter && /:$/.test(cur);
  const next = isCenter ? '---:' : (isRight ? '---' : ':---:');
  cells[col] = next;
  lines[delimAt] = '|' + cells.join('|') + '|';

  const rowIdx = Array.from(table.querySelectorAll('tr')).indexOf(tr);
  if (ctrl._undoStack) ctrl._undoStack.push();
  ctrl._notes = WritingDoc.setText(ctrl._notes, note.id, lines.join('\n'));
  const fresh = ctrl._notes.find((n) => n.id === note.id);
  const live = card.querySelector('.tw-card-text');
  if (live && typeof ctrl._applyCardText === 'function') ctrl._applyCardText(live, fresh);
  // 重投影会重建表格节点：按「行序 + 列序」把光标放回同一格
  const rowsAfter = live ? Array.from(live.querySelectorAll('tr')) : [];
  const targetRow = rowsAfter[rowIdx] || rowsAfter[0];
  const target = targetRow && targetRow.children[col];
  if (target) placeCaretAtEnd(live, target, card);
  if (typeof fitCardText === 'function') fitCardText(card);
  if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
  return next;
}

/** 空表 md：表头「列1..列N」+ 分隔行 + (rows-1) 行空数据；行列夹在 1..6。 */
function buildEmptyTableMd(rows, cols) {
  const r = Math.max(1, Math.min(6, Math.round(Number(rows) || 0)));
  const c = Math.max(1, Math.min(6, Math.round(Number(cols) || 0)));
  const head = '| ' + Array.from({ length: c }, (_, i) => '列' + (i + 1)).join(' | ') + ' |';
  const delim = '|' + Array.from({ length: c }, () => '---').join('|') + '|';
  const body = Array.from({ length: Math.max(0, r - 1) }, () =>
    '|' + Array.from({ length: c }, () => '  ').join('|') + '|');
  return [head, delim, ...body].join('\n');
}

/** 插入一张空表：空卡整卡变表格卡；已有内容则追加到末尾（表格必须是独立块）。
 *  插入后重建工具条（行列按钮只在有 table 时出现）并把光标落到首格，接上连续录入。 */
function insertTableBlock(ctrl, card, rows, cols) {
  if (!ctrl || !card) return false;
  const note = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
  if (!note) return false;
  const md = buildEmptyTableMd(rows, cols);
  const base = String(note.text || '').replace(/\s+$/, '');
  const next = base ? base + '\n\n' + md : md;
  if (ctrl._undoStack) ctrl._undoStack.push();
  ctrl._notes = WritingDoc.setText(ctrl._notes, note.id, next);
  ctrl._notes = WritingDoc.setLevel(ctrl._notes, note.id, 'table');
  const live = card.querySelector('.tw-card-text');
  const fresh = ctrl._notes.find((n) => n.id === note.id);
  if (live && typeof ctrl._applyCardText === 'function') ctrl._applyCardText(live, fresh);
  ensureEditTools(ctrl, card, live);
  const first = live && live.querySelector('thead th, tbody td');
  if (first) placeCaretAtEnd(live, first, card);
  if (typeof fitCardText === 'function') fitCardText(card);
  if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
  return true;
}

/** 行列选择器（单例，挂功能根）：与 PNG 菜单同一范式，不塞进卡片以免被 overflow 裁掉。 */
function ensureTablePicker(ctrl) {
  if (ctrl._tablePicker) return ctrl._tablePicker;
  if (!ctrl._el) return null;
  if (typeof getComputedStyle === 'function' && getComputedStyle(ctrl._el).position === 'static') {
    ctrl._el.style.position = 'relative';
  }
  const box = document.createElement('div');
  box.className = 'tw-table-picker';
  box.setAttribute('role', 'menu');
  box.setAttribute('aria-label', '插入表格：选择行列数');
  box.hidden = true;
  const label = document.createElement('div');
  label.className = 'tw-table-picker-label';
  label.textContent = '插入表格';
  const grid = document.createElement('div');
  grid.className = 'tw-table-picker-grid';
  const cells = [];
  for (let r = 1; r <= 6; r += 1) {
    for (let c = 1; c <= 6; c += 1) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tw-table-picker-cell';
      b.dataset.rows = String(r);
      b.dataset.cols = String(c);
      b.setAttribute('aria-label', r + ' 行 ' + c + ' 列');
      grid.appendChild(b);
      cells.push(b);
    }
  }
  box.appendChild(label);
  box.appendChild(grid);
  // 浮层内交互不冒泡到画布：否则点格子会同时触发平移/取消选中
  box.addEventListener('pointerdown', (e) => e.stopPropagation());
  box.addEventListener('click', (e) => e.stopPropagation());
  const highlight = (rows, cols) => {
    cells.forEach((b) => {
      b.classList.toggle('is-on',
        Number(b.dataset.rows) <= rows && Number(b.dataset.cols) <= cols);
    });
    label.textContent = rows + ' 行 × ' + cols + ' 列';
  };
  grid.addEventListener('pointerover', (e) => {
    const cell = e.target.closest && e.target.closest('.tw-table-picker-cell');
    if (cell) highlight(Number(cell.dataset.rows), Number(cell.dataset.cols));
  });
  grid.addEventListener('click', (e) => {
    const cell = e.target.closest && e.target.closest('.tw-table-picker-cell');
    const card = ctrl._tablePickerCard;
    if (!cell || !card) return;
    hideTablePicker(ctrl);
    insertTableBlock(ctrl, card, Number(cell.dataset.rows), Number(cell.dataset.cols));
  });
  ctrl._el.appendChild(box);
  ctrl._tablePicker = box;
  return box;
}

function hideTablePicker(ctrl) {
  if (!ctrl) return;
  if (ctrl._tablePicker) ctrl._tablePicker.hidden = true;
  ctrl._tablePickerCard = null;
  ctrl._tablePickerText = null;
}

/** 打开行列选择器，贴在「插入表格」按钮下方（用 rect 换算到功能根坐标，不受画布缩放影响）。 */
function openTablePicker(ctrl, card, textEl) {
  if (!ctrl || !ctrl._el || !card) return;
  const box = ensureTablePicker(ctrl);
  if (!box) return;
  ctrl._tablePickerCard = card;
  ctrl._tablePickerText = textEl;
  box.hidden = false;
  const host = box.parentNode;
  const btn = ctrl._editToolsBar && ctrl._editToolsBar.querySelector('.tw-edit-table');
  if (host && btn) {
    const hr = host.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    box.style.left = Math.round(br.left - hr.left) + 'px';
    box.style.top = Math.round(br.bottom - hr.top + 6) + 'px';
  } else {
    box.style.left = '8px';
    box.style.top = '8px';
  }
  // 点浮层外部关闭。挂一次即可，capture 阶段避免被画布的 pointerdown 抢先。
  if (!ctrl._tablePickerDocOff) {
    const doc = ctrl._el.ownerDocument || document;
    ctrl._tablePickerDocOff = (e) => {
      const b = ctrl._tablePicker;
      if (!b || b.hidden) return;
      if (b.contains(e.target)) return;
      hideTablePicker(ctrl);
    };
    doc.addEventListener('pointerdown', ctrl._tablePickerDocOff, true);
  }
}

/** 有序项重新编号：同缩进层级连续成组、各组独立递增；回到外层时延续外层序号。
    以前直接跳过所有嵌套项，导致在嵌套项上「+项」后出现两个相同的 1.。 */
function renumberList(textEl) {
  const counters = new Map();          // indent → 该层当前序号
  let lastIndent = -1;
  Array.from(textEl.querySelectorAll('.tw-md-list')).forEach((row) => {
    const marker = row.querySelector('.tw-md-marker');
    if (!marker || !/^\d/.test(marker.textContent)) return;   // 无序项不参与编号
    const indent = Math.round((parseFloat(row.style.getPropertyValue('padding-left')) || 0) / 1.2);
    if (indent > lastIndent) counters.set(indent, 0);
    else if (indent < lastIndent) {
      Array.from(counters.keys()).forEach((k) => { if (k > indent) counters.delete(k); });
    }
    lastIndent = indent;
    const n = (counters.get(indent) || 0) + 1;
    counters.set(indent, n);
    marker.textContent = n + '.';
  });
}

/**
 * 编辑态当前字数：富卡按序列化后的模型算（语法标记也占字数，和截断口径一致），
 * 纯文本卡按可见文本算。用 innerText 数富卡会低估已用字数 → 高估剩余空间 →
 * 粘完再被截模型，等于把用户内容连同语法一起切掉。
 */
function editModelLen(ctrl, card, text) {
  if (!text) return 0;
  const rich = !!text.dataset.twRich
    || !!(text.querySelector
      && text.querySelector('strong,em,code,del,s,mark,table,pre,img,.tw-md-list,.tw-task-row,.tw-md-quote'));
  if (rich && typeof ctrl._serializeCardText === 'function') {
    const note = (ctrl._notes || []).find((n) => n.id === (card && card.dataset.id));
    return ctrl._serializeCardText(text, note).length;
  }
  const s = typeof text.innerText === 'string' ? text.innerText : text.textContent;
  return s ? s.length : 0;
}

/**
 * 编辑态投影 DOM → 模型。工具条与键盘结构操作（回车拆项 / Tab 缩进）共用。
 * 只改投影 DOM 而不立刻序列化，会导致随后 blur → exitEdit 按旧模型重投影，
 * 刚做的修改被整个冲掉（表现就是「提示已应用、但内容没变」）。
 */
function commitEditModel(ctrl, card, text) {
  if (!ctrl || typeof ctrl._serializeCardText !== 'function') return;
  const note = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
  const md = ctrl._serializeCardText(text, note);
  if (typeof WritingDoc !== 'undefined' && WritingDoc.setText) {
    ctrl._notes = WritingDoc.setText(ctrl._notes, card.dataset.id, md);
  }
  if (ctrl._undoStack && !card._editUndoPushed) {
    card._editUndoPushed = true;
    ctrl._undoStack.push();
  }
  if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
  if (typeof fitCardText === 'function') fitCardText(card);
}

// ── 图片：粘贴 / 拖入 → 落盘到画中卷 → 卡片里插一行 md 链接 ────────────────────
// md 里只留 `![](画中卷/assets/xxx.png)`，图片本体是 vault 里的真文件：
// 导出/同步出去仍是 Obsidian 原生笔记，不把 base64 灌进正文。
const IMG_MIME_EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp',
  'image/bmp': 'bmp', 'image/avif': 'avif', 'image/svg+xml': 'svg',
};

/** 从 DataTransfer 里同步取出图片文件（粘贴时 items 在事件返回后即失效，必须当场取）。 */
function imageFilesFrom(dt) {
  if (!dt) return [];
  const out = [];
  try {
    const files = dt.files ? Array.from(dt.files) : [];
    for (const f of files) if (f && /^image\//i.test(f.type || '')) out.push(f);
    if (!out.length && dt.items) {
      for (const it of Array.from(dt.items)) {
        if (!it || it.kind !== 'file' || !/^image\//i.test(it.type || '')) continue;
        const f = it.getAsFile ? it.getAsFile() : null;
        if (f) out.push(f);
      }
    }
  } catch (_) { /* 剪贴板不可读时按「没有图片」处理 */ }
  return out;
}

function bytesToBase64(bytes) {
  let out = '';
  const CHUNK = 0x8000;   // 分块：一次性 apply 整个数组会爆栈（大图尤甚）
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += btoa(String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK)));
  }
  return out;
}

/** 落盘用的文件名时间戳（秒级 + 4 位随机，避免同一秒粘两张撞名）。 */
function imageStamp() {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}`
    + `-${p2(d.getHours())}${p2(d.getMinutes())}${p2(d.getSeconds())}`
    + `-${Math.random().toString(36).slice(2, 6)}`;
}

/** 一张图片文件 → md 链接字符串（失败返回 ''，调用方只跳过这张）。 */
async function saveImageFile(store, file) {
  const type = String(file.type || '').toLowerCase();
  let ext = IMG_MIME_EXT[type] || '';
  if (!ext) {
    const m = /\.([a-z0-9]+)$/i.exec(String(file.name || ''));
    if (m && IMG_MIME_EXT['image/' + m[1].toLowerCase()]) ext = m[1].toLowerCase();
    else if (m && /^jpe?g$/i.test(m[1])) ext = 'jpg';
  }
  if (!ext) ext = 'png';
  let b64 = '';
  try { b64 = bytesToBase64(new Uint8Array(await file.arrayBuffer())); } catch (_) { return ''; }
  if (!b64) return '';
  const res = await store.writeVaultImage(`assets/pasted-${imageStamp()}.${ext}`, b64);
  if (!res || !res.ok || !res.path) return '';
  // alt 只做提示：截图类默认名（image / blob）不写，免得每张都挂个无意义的 "image"
  const name = String(file.name || '').replace(/\.[^.]+$/, '').replace(/[[\]\r\n]/g, '').trim();
  const alt = /^(image|blob|pasted|clipboard)$/i.test(name) ? '' : name.slice(0, 40);
  return `![${alt}](${res.path})`;
}

/** 把纯文本插到卡片当前光标处（返回是否走的手动插入）。 */
/** 粘贴前的撤销留档：与 _handleEditInput 同一时机（一次编辑会话只在首次改动前压一帧）。 */
function pushEditUndo(ctrl, card) {
  if (!ctrl || !ctrl._undoStack || card._editUndoPushed) return;
  card._editUndoPushed = true;
  ctrl._undoStack.push();
}

function insertEditText(card, text, str) {
  let inserted = false;
  try {
    const sel = getSel(text);
    const r = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    if (r && text.contains(r.commonAncestorContainer)) {
      r.deleteContents();
      const node = document.createTextNode(str);
      r.insertNode(node);
      r.setStartAfter(node);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
      card._caretRange = r.cloneRange();
      inserted = true;
    }
  } catch (_) { /* 回退到命令式 */ }
  if (!inserted) document.execCommand('insertText', false, str);
  return inserted;
}

/** 列表 / 任务：增删项、增减缩进。 */
function listEditOp(card, textEl, op) {
  const row = currentRowOf(card, textEl);
  if (!row) return 'no-row';
  if (op === 'indent+' || op === 'indent-') {
    if (!row.classList.contains('tw-md-list')) return false;
    const cur = Math.round((parseFloat(row.style.getPropertyValue('padding-left')) || 0) / 1.2);
    const depth = Math.max(0, cur + (op === 'indent+' ? 1 : -1));
    if (depth === cur) return false;
    if (depth) {
      row.style.setProperty('padding-left', (depth * 1.2) + 'em', 'important');
      row.dataset.indent = '  '.repeat(depth);
    } else {
      row.style.removeProperty('padding-left');
      delete row.dataset.indent;
    }
    return true;
  }
  if (op === 'item+') {
    const clone = row.cloneNode(true);
    if (clone.classList.contains('tw-task-row')) {
      const cb = clone.querySelector('.tw-task-cb');
      if (cb) cb.checked = false;
      const lab = clone.querySelector('.tw-task-label');
      if (lab) lab.textContent = '';
    } else {
      Array.from(clone.childNodes).forEach((n) => {
        if (!(n.nodeType === 1 && n.classList.contains('tw-md-marker'))) clone.removeChild(n);
      });
    }
    row.parentNode.insertBefore(clone, row.nextSibling);
    renumberList(textEl);
    // 光标必须落到新行：否则用户以为在新行打字，字符却插到别处，表现为「输入了但不显示」
    const target = clone.classList.contains('tw-task-row')
      ? (clone.querySelector('.tw-task-label') || clone)
      : clone;
    try {
      const r = document.createRange();
      r.setStart(target, target.childNodes.length);
      r.collapse(true);
      const sel = getSel(textEl);
      if (sel) { sel.removeAllRanges(); sel.addRange(r); card._caretRange = r.cloneRange(); }
    } catch (_) { /* 光标定位失败不影响已插入的行 */ }
    return true;
  }
  if (op === 'item-') {
    const siblings = Array.from(row.parentNode.children).filter(
      (n) => n.classList.contains('tw-md-list') || n.classList.contains('tw-task-row'),
    );
    if (siblings.length <= 1) return false;
    // 删的是当前行：先把落点挑好（上一行；删首行时用后一行），删完再把光标放过去。
    // 否则光标随节点一起消失，用户接着打字会落到正文开头或别处。
    const at = siblings.indexOf(row);
    const next = siblings[at > 0 ? at - 1 : 1] || null;
    row.parentNode.removeChild(row);
    renumberList(textEl);
    if (next && next.parentNode) {
      try {
        const target = next.querySelector('.tw-task-label') || next;
        const r = document.createRange();
        r.setStart(target, target.childNodes.length);
        r.collapse(true);
        const sel = getSel(textEl);
        if (sel) { sel.removeAllRanges(); sel.addRange(r); card._caretRange = r.cloneRange(); }
      } catch (_) { /* 光标定位失败不影响删除结果 */ }
    }
    return true;
  }
  return false;
}

const INLINE_TOOL_DEFS = [
  { label: 'B', title: '粗体', tag: 'strong' },
  { label: 'I', title: '斜体', tag: 'em' },
  { label: '</>', title: '行内代码', tag: 'code' },
  { label: 'S', title: '删除线', tag: 'del' },
  { label: 'H', title: '高亮', tag: 'mark' },
];

/**
 * 取「用户最后一次真正选中的**非空**选区」：当前选区 → 编辑态快照。
 * 只接受非空 range：快照一旦被 collapsed 光标覆盖，加粗会永远提示「先选中要格式化的文字」。
 */
/**
 * 取当前 selection。
 * **Shadow Root 必须优先**：Chrome 里 Shadow 内部有独立的 selection 树，
 * document.getSelection() / window.getSelection() 对它返回 rangeCount===0，
 * 即使画面上文字明明被高亮选中。这正是「明明选了却一直提示没选中」的根因。
 */
function getSel(node) {
  try {
    const root = node && node.getRootNode ? node.getRootNode() : null;
    if (root && root.nodeType === 11 && typeof root.getSelection === 'function') {
      const s = root.getSelection();
      if (s && s.rangeCount) return s;
    }
  } catch (_) { /* 部分实现不支持，继续回退 */ }
  try {
    const sr = (typeof window !== 'undefined') ? window.__bambooShadowRoot : null;
    if (sr && typeof sr.getSelection === 'function') {
      const s = sr.getSelection();
      if (s && s.rangeCount) return s;
    }
  } catch (_) { /* 继续回退 */ }
  if (typeof window === 'undefined') return null;
  const a = typeof window.getSelection === 'function' ? window.getSelection() : null;
  if (a && a.rangeCount) return a;
  const b = (typeof document !== 'undefined' && typeof document.getSelection === 'function')
    ? document.getSelection() : null;
  return (b && b.rangeCount) ? b : (a || b || null);
}

/**
 * 用「选中文字」在卡片内重建一个可操作的 Range。
 * 起因：Shadow DOM 下 window/document 的 selection 会把卡片内选区「上提」到 host 层，
 * commonAncestorContainer 落在 .tw-card-text 之外，Range 无法直接操作卡内文本 ——
 * 此时只能拿选中的字符串回到卡内文本节点里重新定位。
 * 只有**唯一匹配**才动手，避免改错地方。
 */
function rangeFromSelectedText(textEl) {
  const sel = getSel(textEl);
  if (!sel) return null;
  const want = String(sel.toString ? sel.toString() : '').trim();
  if (!want) return null;
  const hits = [];
  const walker = document.createTreeWalker(textEl, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();
  while (node) {
    const idx = node.nodeValue.indexOf(want);
    if (idx >= 0) {
      hits.push({ node, idx });
      if (hits.length > 1) return null;   // 多处匹配，宁可不改
    }
    node = walker.nextNode();
  }
  if (hits.length !== 1) return null;
  const r = document.createRange();
  r.setStart(hits[0].node, hits[0].idx);
  r.setEnd(hits[0].node, hits[0].idx + want.length);
  return r;
}

function pickEditRange(card, textEl) {
  const sel = getSel(textEl);
  if (sel && sel.rangeCount) {
    const r = sel.getRangeAt(0);
    if (!r.collapsed && textEl.contains(r.commonAncestorContainer)) return r;
  }
  const saved = card._editRange;
  if (saved && !saved.collapsed && textEl.contains(saved.commonAncestorContainer)) return saved;
  // 容器在 shadow 外层时，用选中文字在卡内重建
  return rangeFromSelectedText(textEl);
}

/** 把工具条摆到卡片上方（画布坐标系，用 offset* 避免受视口 transform 缩放影响）。
 *  光标在表格里时改贴「当前行」上方：表格可能很长，仍贴卡片顶部会让 +行/-行 离光标太远。 */
function placeEditTools(ctrl, card) {
  const bar = ctrl && ctrl._editToolsBar;
  if (!bar || bar.hidden) return;
  const host = bar.parentNode;
  if (!host || host === card) return;
  const textEl = card.querySelector('.tw-card-text');
  const cell = textEl ? currentCellOf(card, textEl) : null;
  const tr = cell && cell.closest('tr');
  let top = card.offsetTop;
  if (tr) {
    // tr.offsetTop 相对最近的定位祖先，未必就是 card：逐级累加到卡为止
    let y = tr.offsetTop;
    let p = tr.offsetParent;
    while (p && p !== card) { y += p.offsetTop; p = p.offsetParent; }
    top = card.offsetTop + y;
  }
  bar.style.left = (card.offsetLeft + card.offsetWidth / 2) + 'px';
  bar.style.top = top + 'px';
}

/**
 * 编辑态按当前内容重建工具条（隐藏时保留 DOM，避免反复插入）。
 * 挂在**画布层**而不是卡片内：.tw-card 带 transform 会自成层叠上下文，卡内 z-index 再高
 * 也只在本卡内有效，会被相邻卡片盖住 —— 视觉上看得见、点击却落到上面那张卡，
 * 表现为「按钮完全没反应，也没有任何提示」。
 */
function ensureEditTools(ctrl, card, text) {
  const host = (ctrl && ctrl._canvas) || card;
  let bar = (ctrl && ctrl._editToolsBar) || null;
  if (!bar || !bar.isConnected || bar.parentNode !== host) {
    bar = document.createElement('div');
    bar.className = 'tw-edit-tools';
    host.appendChild(bar);
    if (ctrl) ctrl._editToolsBar = bar;
  }
  bar.textContent = '';
  bar.classList.remove('tw-src-on');   // 上次会话若停在源码视图，按钮集合要复原
  const tip = (msg) => {
    if (ctrl && typeof ctrl._showScreenMsg === 'function') ctrl._showScreenMsg(msg, 1500);
  };
  const REASON = {
    'no-range': '没有取到选区，请重新选中文字',
    outside: '选区不在卡片内，请重新选中文字',
    collapsed: '选区已塌陷，请重新选中文字',
    'no-cell': '把光标放到表格单元格里',
    'no-row': '把光标放到列表项/任务项里',
  };
  // 工具条只改投影 DOM，必须立刻序列化回模型（见 commitEditModel）。
  const syncModel = () => commitEditModel(ctrl, card, text);
  /* 模型已更新，但当前投影 DOM 未必反映它 —— 实测「加粗要切走再切回（重挂）才可见」。
     既然重挂能显示，就点完按钮按最新模型就地重投影一次，不再等重挂时机。 */
  const rerenderCurrent = () => {
    const fresh = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
    const live = card.querySelector('.tw-card-text');
    if (!live || !fresh || typeof ctrl._applyCardText !== 'function') return;
    ctrl._applyCardText(live, fresh);
    if (live.querySelector('strong, b, em, i, code, del, s, mark')) live.dataset.twRich = '1';
    if (typeof fitCardText === 'function') fitCardText(card);
    // 重投影会重建节点、冲掉选区：把刚格式化的元素重新选中。
    // 不恢复的话，再点一次同一按钮点不到东西，只会又包一层（而不是解包）。
    const el = live.querySelector('strong, b, em, i, del, s, code, mark');
    try {
      const sel = getSel(live);
      if (el && sel && typeof sel.removeAllRanges === 'function') {
        const r = document.createRange();
        r.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(r);
      }
    } catch (_) { /* 选区恢复失败不影响已完成的格式 */ }
  };
  const runOp = (fn, hint) => {
    if (typeof fn !== 'function') return;
    // 纯 UI 动作（源码切换）：不参与选区判定，也不弹「已应用」
    if (fn._direct) { try { fn(); } finally { text.focus(); } return; }
    // 源码视图里卡上是原始 md，格式/结构按钮按投影语义理解会改坏文本 → 直接拦
    if (card._srcMode) { tip('源码视图：按 ⌘/ 回到可视化编辑'); return; }
    // 直接把手里的快照 range 交给操作，不试图靠 window.getSelection() 恢复 ——
    // Shadow DOM 里点工具条后全局 selection 多已清空，恢复不回来就永远判「没选中」。
    const range = pickEditRange(card, text);
    try {
      const res = fn(range);
      if (res === 'add' || res === 'remove') {
        syncModel();        // 先写回模型：否则退出编辑重投影会把刚加的格式冲掉
        rerenderCurrent();  // 再按新模型重投影：否则要切组重挂才看得到效果
        const n = text.querySelectorAll('strong, b, em, i, code, del, s, mark').length;
        tip((res === 'add' ? '已加格式' : '已取消格式') + '（' + n + ' 处）');
        return;
      }
      // 结构操作（增删项 / 增删行列）已直接改好 DOM：再重投影会重建节点，
      // 把光标和刚输入的内容一起冲掉 —— 表现为「点了 +项 后打字不显示」。
      if (res === true) { syncModel(); tip('已应用'); return; }
      // 不再回默认文案：把具体失败原因显出来，便于一次定位
      tip(REASON[res] || (typeof res === 'string' ? ('未执行：' + res) : hint));
    } catch (err) {
      tip('操作失败：' + ((err && err.message) || err));
    } finally {
      text.focus();
      // focus() 可能把光标重置到正文开头：之后打的字会变成容器上的裸文本节点，
      // 序列化只遍历元素子节点 → 一退出编辑字就没了。操作里定好的光标要抢回来。
      const caret = card._caretRange;
      if (caret && text.contains(caret.startContainer)) {
        try {
          const s = getSel(text);
          if (s) { s.removeAllRanges(); s.addRange(caret); }
        } catch (_) { /* 恢复失败不影响已经完成的结构操作 */ }
      }
    }
  };
  // 一次点击会连发 pointerdown / mousedown / click（三个不同事件对象）。
  // 用「本次点击已处理」标记去重：pointerdown 置位，抬手(pointerup)复位；
  // 不复位就会让 toggle 执行两次（加粗后立刻解包，看起来就是「没反应」）。
  const runFrom = (e, btn) => {
    if (card._toolHandled) return;
    const type = e && e.type;
    if (type === 'pointerdown' || type === 'mousedown') {
      card._toolHandled = true;
      if (card._toolHandledTimer) clearTimeout(card._toolHandledTimer);
      // 兜底：pointerup 丢失（指针移出等）时 600ms 后自动复位，不会把按钮永久锁死
      card._toolHandledTimer = setTimeout(() => { card._toolHandled = false; }, 600);
    }
    // 捕获阶段也要拦住：不让画布把这次点击当拖拽，也不让按钮抢走 textEl 焦点
    if (e && e.cancelable !== false && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    card._toolPressAt = Date.now();     // 让 onBlur 在短窗口内忽略失焦
    runOp(btn._editOp, btn._editHint);
  };
  card._runEditOp = runFrom;
  const addBtn = (label, title, handler, hint) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tw-edit-tool';
    b.textContent = label;
    b.title = title;
    b.setAttribute('aria-label', title);
    b._editOp = handler;
    b._editHint = hint;
    // 必须走 pointerdown：click 会被画布的 preventDefault 抑制（「点了没反应」的根因之一）。
    // mousedown 再兜一层：个别 webview / 触控板路径下 pointerdown 可能被上游 passive 监听吃掉。
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      runFrom(e, b);
    });
    b.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      runFrom(e, b);
    });
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      runFrom(e, b);                   // 键盘 Enter / 测试环境
    });
    // 抬手不能立即复位：pointerup 早于 click，立即复位会让同一次点击的 click
    // 再执行一遍 toggle —— 加粗后立刻被解包，表现就是「飞快闪一下粗体又变回去」。
    // 延后复位：期间 click 仍被拦住，350ms 后恢复，不影响下一次点击。
    const resetHandled = () => {
      if (card._toolHandledTimer) clearTimeout(card._toolHandledTimer);
      card._toolHandledTimer = setTimeout(() => { card._toolHandled = false; }, 350);
    };
    b.addEventListener('pointerup', resetHandled);
    b.addEventListener('pointercancel', resetHandled);
    b.addEventListener('mouseup', resetHandled);
    bar.appendChild(b);
    return b;
  };
  INLINE_TOOL_DEFS.forEach((t) => addBtn(
    t.label, t.title, (range) => toggleInlineTag(text, t.tag, range), '先选中要格式化的文字',
  ));
  // 插入表格：投影表达不了「建表」，此前只能进源码视图手写 md。
  // 纯 UI 动作（_direct）：不需要选区，点开 6×6 网格选行列后插入。
  const tableInsertOp = () => openTablePicker(ctrl, card, text);
  tableInsertOp._direct = true;
  const tableInsertBtn = addBtn('⊞', '插入表格：选行列后插入一张空表', tableInsertOp);
  if (tableInsertBtn) tableInsertBtn.classList.add('tw-edit-table');
  if (text.querySelector('table')) {
    [['+行', 'row+', '新增一行'], ['-行', 'row-', '删除当前行'],
      ['+列', 'col+', '新增一列'], ['-列', 'col-', '删除当前列']].forEach(([label, op, title]) => {
      addBtn(label, title, () => tableEditOp(card, text, op), '把光标放到表格单元格里');
    });
    // 列对齐：渲染一直支持 `:---:`，但此前没有任何设置入口，只能进源码视图手写
    addBtn('对齐', '切换当前列对齐：左 / 中 / 右',
      () => cycleColumnAlign(ctrl, card, text), '把光标放到表格单元格里');
  }
  if (text.querySelector('.tw-md-list')) {
    [['+项', 'item+', '新增列表项'], ['-项', 'item-', '删除当前项'],
      ['→', 'indent+', '增加缩进'], ['←', 'indent-', '减少缩进']].forEach(([label, op, title]) => {
      addBtn(label, title, () => listEditOp(card, text, op), '把光标放到列表项里');
    });
  } else if (text.querySelector('.tw-task-row')) {
    [['+项', 'item+', '新增任务项'], ['-项', 'item-', '删除当前项']].forEach(([label, op, title]) => {
      addBtn(label, title, () => listEditOp(card, text, op), '把光标放到任务项里');
    });
  }
  // 兜底出口（任何卡都可用）：投影表达不了的语法（图片 / 公式 / frontmatter / 项内换行）
  // 直接改这张卡的原始 md。不引入额外语法 —— 写回模型的就是用户看到的纯文本。
  const srcOp = () => CardInteractions.toggleSource({ ctrl }, card);
  srcOp._direct = true;          // 纯 UI 动作：不需要选区，也不弹「已应用」
  const srcBtn = addBtn('md', '源码模式：直接编辑这张卡的 Markdown（⌘/）', srcOp);
  if (srcBtn) srcBtn.classList.add('tw-edit-src');
  bar.hidden = false;
  // 卡片 z-index 是单调递增的（_zTop），固定 999 迟早会被盖住：工具条参与同一计数器
  if (typeof ctrl._zTop === 'number') bar.style.zIndex = String(++ctrl._zTop);
  placeEditTools(ctrl, card);
  return bar;
}

function hideEditTools(ctrl) {
  const bar = ctrl && ctrl._editToolsBar;
  if (bar) bar.hidden = true;
}

export const CardInteractions = {
  // (was _makeDraggable)
  makeDraggable(ctx, card) {
    const { state, ctrl } = ctx;
    const onDown = (e) => {
      // 抓手/空格态：不在卡片上起拖拽，让位给画布平移（对齐 Excalidraw 手工具）。
      // 卡片触点本就不进 CanvasGestures 的 ptrs；若这里不拦，会「卡片拖拽 + 画布平移」同时发生
      // （卡片 pointerdown 在卡片上先于根节点的 CanvasGestures 触发）。
      if (ctrl._hand && ctrl._hand.state && (ctrl._hand.state.handTool || ctrl._hand.state.spaceDown)) return;
      // 点任务卡清单（整行，含复选框与文字）：交给原生 toggle，不起拖拽、不进编辑、不改选区
      if (e.target.closest('.tw-task-row')) return;
      // 双击 → 编辑：原生 dblclick 被 startGroupDrag 的 e.preventDefault() 抑制，这里手动判定。
      // 命中即进入编辑并 return，不再起拖拽（避免一次手势同时触发「双击编辑 + 拖拽」）。
      // 此分支在上面的「抓手早退」之后，故抓手态仍走原生 dblclick（无 preventDefault）。
      if (CardInteractions.cardDoubleTapHit(ctrl, card.dataset.id) &&
          !card.classList.contains('editing') &&
          !e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link')) {
        ctrl._enterEdit(card);
        return;
      }
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link')) return; // 删除/字级/缩放/连线锚点不触发拖拽
      // 编辑态下点在文本区不拖拽（让浏览器处理选字/光标）；点标题或纸边仍可移动便签
      if (card.classList.contains('editing') && e.target.closest('.tw-card-text')) return;
      // Shift 点击 = 切换选中（不进入拖拽）；其余点击决定选择集
      if (e.shiftKey) { ctrl._toggleSelect(card); return; }
      if (!ctrl._selected || !ctrl._selected.has(card)) ctrl._selectOnly(card);
      // 拖动集合 = 当前选中集（卡片 + 贴纸，统一选区）；startGroupDrag 内部处理整体平移与分类型落盘
      CardInteractions.startGroupDrag(ctx, e, card);
    };
    card.addEventListener('pointerdown', onDown);
  },

  /**
   * 统一选区的「整体拖动」：拖动 primaryEl 时把当前选中集（卡片 + 贴纸）一起平移。
   * 坐标在 .tw-canvas 内容空间（含 transform 平移 / 缩放），屏幕位移需除以缩放比。
   * 落盘分流：卡片 → WritingDoc.setPos + _scheduleSave；贴纸 → rec.x/rec.y + _saveStickers。
   * 供卡片（makeDraggable）与贴纸（MaterialMarket._makeStickerDraggable）共用，保证混合选区一视同仁。
   */
  startGroupDrag(ctx, e, primaryEl) {
    const ctrl = ctx.ctrl;
    // 已有进行中的卡片手势（拖拽/缩放/旋转）：先取消，避免两套 document 监听并存
    // （第二根手指落在另一张卡上会再起一套 startGroupDrag → 两张卡一起跑）。
    if (typeof ctrl._cardGestureCancel === 'function') ctrl._cardGestureCancel();
    const mm = ctrl._materialMarket || null;
    // 【对齐 Excalidraw】只认起始这一根手指；第二指的 move/up 不得驱动或掐断本次拖拽。
    const dragPointerId = e.pointerId;
    const captureEl = ctrl._canvas || primaryEl;
    if (captureEl && captureEl.setPointerCapture && dragPointerId != null) {
      try { captureEl.setPointerCapture(dragPointerId); } catch (_) {}
    }
    const set = (ctrl._selected && ctrl._selected.size) ? ctrl._selected : new Set([primaryEl]);
    let dragging = true, moved = false, startX = e.clientX, startY = e.clientY, dx = 0, dy = 0, raf = 0;
    let dragSet = Array.from(set).map((el) => ({
      el,
      lx: parseFloat(el.style.left) || 0,
      ly: parseFloat(el.style.top) || 0,
    }));
    // 拖拽中：选中的卡钉在屏上、剔除跳过（贴纸不在剔除系统内，其 undefined id 自然忽略）
    ctrl._draggingSet = new Set(dragSet.map((d) => d.el.dataset && d.el.dataset.id).filter(Boolean));
    primaryEl.classList.add('dragging');
    primaryEl.style.willChange = 'transform';   // 仅拖拽期间临时提升，松手即撤
    // 多选整体拖动：非主元素同样每帧改 transform，需一并提升合成层并挂 .dragging
    // （贴纸的 .dragging 会把 drop-shadow 置 none，否则内容复杂的贴纸会掉帧）。
    dragSet.forEach((d) => {
      if (d.el === primaryEl) return;
      d.el.classList.add('dragging');
      d.el.style.willChange = 'transform';
    });
    primaryEl.style.zIndex = String(++ctrl._zTop);
    // 拖拽期帧间隔采样（p50/p90/max）。只挂一个 rAF，手势结束即收，零常驻成本；
    // 现场"跑一阵就卡"的反馈靠它取证，而不是靠"感觉顺不顺"。
    if (typeof DragPerf !== 'undefined' && DragPerf) DragPerf.begin();
    const apply = () => {
      raf = 0;
      // 【性能】拖拽期只写 translate 变量：transform 走合成，不触发布局；
      // left/top 留到松手时一次性提交（见 onUp）。
      dragSet.forEach((d) => {
        d.el.style.setProperty('--tw-drag-x', dx + 'px');
        d.el.style.setProperty('--tw-drag-y', dy + 'px');
      });
      // 同一帧内同步重画连线：与卡片位移同帧完成，消除「卡片先动、连线冻住/慢一帧、松手才追」的滞后感
      if (ctrl._linkLayer && typeof ctrl._linkLayer.render === 'function') ctrl._linkLayer.render();
    };
    const onMove = (ev) => {
      if (!dragging) return;
      if (dragPointerId != null && ev.pointerId !== dragPointerId) return;   // 第二指不驱动本次拖拽
      if (!moved && (Math.abs(ev.clientX - startX) > 4 || Math.abs(ev.clientY - startY) > 4)) {
        moved = true;
        ctrl._lastCardTap = null;   // 真拖拽：作废刚记录的「单击」，否则拖完快速点一下会被误判成双击编辑
        if (ctrl._undoStack) ctrl._undoStack.push();   // 变更前留档：拖动位置可撤销（Cmd+Z 不再回退更早快照）
      }
      // 无限画布：坐标相对 .tw-canvas（含其 transform 平移），不 clamp。
      // 画布带缩放后「屏幕位移 ≠ 局部位移」：必须除以缩放比，否则放大后拖不动、缩小后拖过头。
      const s = CanvasViewport.getScale(ctrl);
      dx = (ev.clientX - startX) / s;
      dy = (ev.clientY - startY) / s;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    // 系统取消指针（触控板手势接管 / 失焦 / 来电）时也必须走同一收尾路径：
    // 否则 _draggingSet 永不复位 → 卡片永久钉屏（剔除不再卸载）、document 监听残留。
    const onUp = (ev) => {
      if (!dragging) return;
      if (ev && dragPointerId != null && ev.pointerId !== dragPointerId) return;   // 只认起始指抬起；第二指抬起不得掐断拖拽
      const cancelled = !!(ev && ev.type === 'pointercancel');
      dragging = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      // 收采样并汇总（无有效帧时静默返回 null；超阈值才出声，每会话一次）
      if (typeof DragPerf !== 'undefined' && DragPerf) DragPerf.end();
      if (moved && dragSet) {
        let stickerMoved = false;
        dragSet.forEach((d) => {
          // 拖拽期位移在 --tw-drag-* 上，这里一次性提交为 left/top 并清空变量
          // （顺序不可反：先写 left/top 再清变量，避免视觉闪回。
          const nx = d.lx + dx;
          const ny = d.ly + dy;
          d.el.style.left = nx + 'px';
          d.el.style.top = ny + 'px';
          d.el.style.removeProperty('--tw-drag-x');
          d.el.style.removeProperty('--tw-drag-y');
          if (d.el.classList && d.el.classList.contains('bm-sticker')) {
            const rec = mm && mm.recForEl(d.el);
            if (rec) { rec.x = nx; rec.y = ny; stickerMoved = true; }
          } else {
            const id = d.el.dataset && d.el.dataset.id;
            if (id) ctrl._notes = WritingDoc.setPos(ctrl._notes, id, nx, ny);
          }
        });
        // 卡片拖完重测几何 → 刷新 geo + 空间索引（修复剔除 / 连线端点陈旧）；贴纸不在剔除系统内，跳过
        dragSet.forEach((d) => { if (d.el.classList && !d.el.classList.contains('bm-sticker')) ctrl._measureCard(d.el); });
        ctrl._scheduleRenderLinks();   // 便签移动，连线端点跟随
        if (mm && stickerMoved) mm._saveStickers();
      }
      primaryEl.classList.remove('dragging');
      primaryEl.style.willChange = '';
      if (dragSet) dragSet.forEach((d) => {
        if (d.el === primaryEl) return;
        d.el.classList.remove('dragging');
        d.el.style.willChange = '';
      });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      // 拖拽落位：结构性变更（位置即数据），跳过防抖立即写盘，避免松手即硬杀丢掉这次移动
      if (moved) {
        if (typeof ctrl._flushSave === 'function') ctrl._flushSave();
        else if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
      }
      else if (!cancelled && primaryEl.classList.contains('tw-card')) ctrl._pinOnly(primaryEl);   // 轻点：钉住工具条（触屏无 hover 入口）；指针被取消时不钉
      ctrl._draggingSet = null;     // 拖拽结束：解除钉屏
      ctrl._scheduleCull();         // 重算挂载：被拖出视野的卡卸载
      // 兜底清空位移变量（无论是否真的移动过），避免残留 translate 造成「视觉位置 ≠ 模型 left/top」
      if (dragSet) {
        dragSet.forEach((d) => {
          if (d.el && d.el.style) {
            d.el.style.removeProperty('--tw-drag-x');
            d.el.style.removeProperty('--tw-drag-y');
          }
        });
      } else if (primaryEl && primaryEl.style) {
        primaryEl.style.removeProperty('--tw-drag-x');
        primaryEl.style.removeProperty('--tw-drag-y');
      }
      if (captureEl && captureEl.releasePointerCapture && dragPointerId != null && captureEl.hasPointerCapture && captureEl.hasPointerCapture(dragPointerId)) {
        try { captureEl.releasePointerCapture(dragPointerId); } catch (_) {}
      }
      if (ctrl._cardGestureCancel === cancel) ctrl._cardGestureCancel = null;
      dragSet = null;
    };
    // 供「第二指落下 / 捏合开始」取消：复用收尾路径（提交当前位置、不回弹），让位给捏合
    const cancel = () => { if (dragging) onUp({ type: 'pointercancel', pointerId: dragPointerId }); };
    e.preventDefault();
    ctrl._cardGestureCancel = cancel;
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  },

  // (was _makeCanvasDraggable)
  // 画布级手势（平移 / 双指捏合 / 空格抓手 / 滚轮）统一走共享 CanvasGestures（C3 机制收敛），
  // 模式专属的「卡片拖拽 / 框选」经 onEmptyPointerDown 回调注入，避免三模式各自维护一份漂移。
  makeCanvasDraggable(ctx) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    const root = ctrl._el;
    if (!canvas || !root) return;
    // 幂等重挂载：先销毁上一次的共享接线（指针手势 / 滚轮 / 空格抓手）。
    // 关键：installSpaceHand 挂的是 document 级 keydown，不销毁会随 mount 次数叠加。
    if (ctrl._gestureDetach) { ctrl._gestureDetach(); ctrl._gestureDetach = null; }
    if (ctrl._wheelDetach) { ctrl._wheelDetach(); ctrl._wheelDetach = null; }
    if (ctrl._hand && typeof ctrl._hand.destroy === 'function') { ctrl._hand.destroy(); ctrl._hand = null; }

    // 双击空白：归位所有便签到视野中心(fit-all)；无便签则复位画布
    root.addEventListener('dblclick', (e) => {
      // 导图有自己文档与手势：归位交互归导图，卡片侧不接手（判据查表，与 undo / 排版守卫同源）
      if (!ModePolicy.usesCardInteractions(ctrl._mode)) return;
      if (e.target.closest('.tw-card, button, .tw-card-resize, input, textarea')) return;
      ctrl._recenterNotes();
    });

    // 任务卡勾选框：toggle 即回写 markdown（见 onTaskToggle）。幂等挂载：先撤上一次的接线，
    // 避免 makeCanvasDraggable 被多次调用时 change 监听叠加、一次点击触发多次回写。
    if (ctrl._taskChangeDetach) { ctrl._taskChangeDetach(); ctrl._taskChangeDetach = null; }
    const onTaskChange = (e) => {
      const cb = e.target && e.target.closest && e.target.closest('.tw-task-cb');
      if (!cb) return;
      // 编辑态由无语法编辑的序列化统一回写，避免 onTaskToggle 与退出编辑重复改模型
      const card = cb.closest ? cb.closest('.tw-card') : null;
      if (card && card.classList.contains('editing')) return;
      CardInteractions.onTaskToggle(ctrl, cb);
    };
    root.addEventListener('change', onTaskChange);
    // 任务行是 div（不用 <label>，否则编辑态焦点会被复选框劫持），
    // 这里用委托补回「点文字也能勾选」：非编辑态点行内任意位置即可切换。
    const onTaskRowClick = (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('.tw-task-cb')) return;              // 复选框本身走原生 change
      const row = t.closest('.tw-task-row');
      if (!row) return;
      const card = t.closest('.tw-card');
      if (card && card.classList.contains('editing')) return;  // 编辑态点文字＝定位光标，不勾选
      const cb = row.querySelector('.tw-task-cb');
      if (!cb) return;
      cb.checked = !cb.checked;
      cb.dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    root.addEventListener('click', onTaskRowClick);
    ctrl._taskChangeDetach = () => {
      root.removeEventListener('change', onTaskChange);
      root.removeEventListener('click', onTaskRowClick);
    };

    // 空格=临时抓手 / Hand 工具：统一接线（含状态对象 state，供 attach 读取）
    const hand = CanvasGestures.installSpaceHand(root, { isActive: () => ModePolicy.usesCardInteractions(ctrl._mode) });
    ctrl._hand = hand;

    // 滚轮：统一接线（⌘/Ctrl=缩放、Shift=横移、普通=平移；Alt+滚轮也走正常平移，单卡缩放快捷键已移除）
    ctrl._wheelDetach = CanvasGestures.installWheel(root, {
      isActive: () => ModePolicy.usesCardInteractions(ctrl._mode),
      getView: () => ({
        x: CanvasViewport.getOffset(ctrl).x,
        y: CanvasViewport.getOffset(ctrl).y,
        scale: CanvasViewport.getScale(ctrl),
      }),
      zoomAt: (cx, cy, f) => CanvasViewport.zoomAt(ctx, cx, cy, f),
      panBy: (dx, dy) => CanvasViewport.panBy(ctx, dx, dy),
    });

    // 平移 / 捏合 / 空白判定：统一接管；空缺点交给便签的「清选 + 框选」
    const detach = CanvasGestures.attach(root, {
      isActive: () => ModePolicy.usesCardInteractions(ctrl._mode),
      state: hand.state,
      getView: () => ({
        x: CanvasViewport.getOffset(ctrl).x,
        y: CanvasViewport.getOffset(ctrl).y,
        scale: CanvasViewport.getScale(ctrl),
      }),
      setView: (v) => CanvasViewport.set(ctx, v.x, v.y, v.scale),
      getScale: () => CanvasViewport.getScale(ctrl),
      zoomAt: (cx, cy, f) => CanvasViewport.zoomAt(ctx, cx, cy, f),
      panBy: (dx, dy) => CanvasViewport.panBy(ctx, dx, dy),
      onPointerDownAny: () => { if (ctrl._pinOnly) ctrl._pinOnly(null); },   // 点空白清钉
      onBeforePan: () => { if (ctrl._clearSelection) ctrl._clearSelection(); },
      onPanStart: () => {
        ctrl._setLodDragging(true);                 // 平移期间降级（对标 tldraw 相机移动时简化）
        canvas.style.willChange = 'transform';      // 仅平移期间临时提升合成层，松手即撤
        root.classList.add('dragging');
      },
      onPanEnd: () => {
        ctrl._setLodDragging(false);                // 松手即恢复满细节
        root.classList.remove('dragging');
        canvas.style.willChange = '';               // 撤掉合成层提升，避免常驻巨型层拖垮整页合成器
        ctrl._scheduleSave();                       // 持久化画布偏移
      },
      onPinchWillStart: () => {
        // 二指起捏合：取消框选 + 取消进行中的卡片拖拽/缩放/旋转，让位给捏合
        if (typeof ctrl._cardGestureCancel === 'function') ctrl._cardGestureCancel();
        if (ctrl._cancelMarquee) ctrl._cancelMarquee();
      },
      onPinchStart: () => {
        ctrl._setLodDragging(true);
        canvas.style.willChange = 'transform';
      },
      onPinchEnd: () => {
        ctrl._setLodDragging(false);
        canvas.style.willChange = '';
        ctrl._scheduleSave();
      },
      onEmptyPointerDown: (e) => {
        // 第二根手指落在空白时若正在拖卡片/缩放/旋转：取消该手势并让位，绝不起框选、绝不吞掉选中。
        // （卡片在 CONTROL_SEL 内，其触点不进 ptrs；第二指落空白凑不成双指，会走到这里。）
        if (typeof ctrl._cardGestureCancel === 'function') { ctrl._cardGestureCancel(); return; }
        // Excalidraw 语义：拖空白 = 框选（Shift = 追加）；平移改由 空格/中键/抓手/滚轮/双指 承担
        // 阻止默认：避免拖拽触发原生「文本选择 / 自动滚动」与画布 transform 打架（表现为画面跳动）
        if (e.cancelable !== false && typeof e.preventDefault === 'function') e.preventDefault();
        if (!e.shiftKey && ctrl._clearSelection) ctrl._clearSelection();
        ctrl._startMarquee(e, e.shiftKey);
      },
    });
    ctrl._gestureDetach = detach;

    // 【根因修复·退不出编辑态】编辑态下，点便签文本/控件以外的任意处即退出编辑（捕获阶段，
    // 先于画布平移的 preventDefault 生效——否则 preventDefault 会抑制默认失焦、导致 blur 兜底失效）。
    root.addEventListener('pointerdown', (e) => {
      const editing = ctrl._canvas && ctrl._canvas.querySelector('.tw-card.editing');
      if (!editing) return;
      if (e.target.closest('.tw-card-text')) return;            // 仍在文本内：继续编辑
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link, input, textarea')) return;
      ctrl._exitAllEdits();
    }, true);
  },
  // (was _setCanvasOffset)
  setCanvasOffset(ctx, x, y) {
    const { state, ctrl } = ctx;
    // 只改平移、保留当前缩放比：缩放由 CanvasViewport.set / zoomAt 单独管理，
    // 避免「重排后居中」等只传 x/y 的调用把用户的缩放级别抹回 100%。
    CanvasViewport.set(ctx, x, y, CanvasViewport.getScale(ctrl));
  
  },
  // (was _applyCanvasTransform)
  applyCanvasTransform(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    // 平移 + 缩放的唯一写入口（内部已含 _scheduleCull 重算挂载）
    CanvasViewport.apply(ctx);
  
  },
  // (was _selectOnly)
  selectOnly(ctx, card) {
    const { state, ctrl } = ctx;
    if (!ctrl._selected) ctrl._selected = new Set();
    ctrl._selected.forEach((c) => { if (c !== card) c.classList.remove('selected'); });
    ctrl._selected.clear();
    if (card) { ctrl._selected.add(card); card.classList.add('selected'); ctrl._blurInput(); }
    if (ctrl._updateSelBar) ctrl._updateSelBar();

  },
  // (was _toggleSelect)
  toggleSelect(ctx, card) {
    const { state, ctrl } = ctx;
    if (!ctrl._selected) ctrl._selected = new Set();
    if (ctrl._selected.has(card)) { ctrl._selected.delete(card); card.classList.remove('selected'); }
    else { ctrl._selected.add(card); card.classList.add('selected'); ctrl._blurInput(); }
    if (ctrl._updateSelBar) ctrl._updateSelBar();

  },
  // (was _blurInput)
  blurInput(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._input && document.activeElement === ctrl._input) ctrl._input.blur();
  
  },
  // (was _clearSelection)
  clearSelection(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._selected) return;
    ctrl._selected.forEach((c) => c.classList.remove('selected'));
    ctrl._selected.clear();
    if (ctrl._updateSelBar) ctrl._updateSelBar();

  },
  // (was _removeCard)
  removeCard(ctx, card) {
    const { state, ctrl } = ctx;
    if (!card) return;
    if (ctrl._undoStack) ctrl._undoStack.push();   // 单卡删除同样可撤销（与批量删除一致）
    ctrl._removeNoteById(card.dataset.id);
    if (ctrl._updateSelBar) ctrl._updateSelBar();   // 删后刷新浮动条计数，避免残留「合并 N 张」
    // 删除卡片是结构性变更：此前这里完全不落盘，要等下一次任意保存才把「删除」写进去，
    // 期间硬杀就会让被删的卡片「复活」。改为跳过防抖立即写盘。
    if (typeof ctrl._flushSave === 'function') ctrl._flushSave();
    else if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
  },
  // (was _deleteSelected)
  deleteSelected(ctx) {
    const { state, ctrl } = ctx;
    const mm = ctrl._materialMarket || null;
    if (!ctrl._selected || !ctrl._selected.size) return false;
    if (ctrl._undoStack) ctrl._undoStack.push();   // 整批一次快照：撤销时一起回来
    // 先快照成数组再删：_removeCard / removeStickerEl 会改动 _selected 或 DOM，边遍历 Set 边删会漏
    // 统一选区：卡片走 _removeCard（含连线/子卡级联），贴纸走 MaterialMarket.removeStickerEl
    Array.from(ctrl._selected).forEach((el) => {
      if (el.classList && el.classList.contains('bm-sticker')) {
        if (mm) mm.removeStickerEl(el);
      } else {
        ctrl._removeCard(el);
      }
    });
    ctrl._clearSelection();
    if (typeof ctrl._flushSave === 'function') ctrl._flushSave();
    else if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
    return true;

  },
  // (was _marqueeEdgeDir) 框选时指针相对「视口(固定、不随画布平移)」的边缘方向（Figma 式自动平移触发）
  //   ⚠️ 必须用视口 rect，绝不能用被 transform 的画布 rect：画布 rect 含 canvasOffset 偏移，
  //      偏移一偏触发区就错位 → 拖到视口内就误触发、且越平移越靠内 → 整块画布失控漂移。
  marqueeEdgeDir(clientX, clientY, vp, edge) {
    const lx = clientX - vp.left, ly = clientY - vp.top;
    let dx = 0, dy = 0;
    if (lx < edge) dx = 1; else if (lx > vp.width - edge) dx = -1;
    if (ly < edge) dy = 1; else if (ly > vp.height - edge) dy = -1;
    return (dx || dy) ? { dx, dy } : null;
  },
  /** 边缘自动平移的「方向 + 步长」：步长随「深入边缘区的程度」渐变。
   *  刚跨入边缘区约 1px/帧，贴到边缘才到 max —— 避免 0→全速 的阶跃
   *  （阶跃会让画布看起来"跳/被甩走"，是框选时画布乱动的直接原因）。 */
  marqueeEdgeStep(clientX, clientY, vp, edge, max) {
    const d = CardInteractions.marqueeEdgeDir(clientX, clientY, vp, edge);
    if (!d) return null;
    const lx = clientX - vp.left;
    const ly = clientY - vp.top;
    const depth = (v, dir, size) => {
      if (!dir) return 0;
      const gap = dir > 0 ? v : (size - v);        // 距所选侧边缘的距离
      return Math.min(1, Math.max(0, (edge - gap) / edge));
    };
    const k = Math.max(depth(lx, d.dx, vp.width), depth(ly, d.dy, vp.height));
    return { dx: d.dx, dy: d.dy, step: Math.max(1, Math.round((Number(max) || 0) * k)) };
  },
  // (was _startMarquee)  additive=true 表示 Shift 追加框选（不清空已有选中）
  startMarquee(ctx, e, additive) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    ctrl._marqueeCancelled = false;
    if (ctrl._marquee) ctrl._marquee.remove();
    const m = document.createElement('div');
    m.className = 'tw-marquee';
    const badge = document.createElement('span');
    badge.className = 'tw-marquee-count';
    m.appendChild(badge);
    canvas.appendChild(m);
    ctrl._marquee = m;
    ctrl._marqueeRect = null;

    // 框选起点（画布内容坐标，恒定）：走统一换算，自动扣除缩放比
    const p0 = CanvasViewport.screenToCanvas(ctx, e.clientX, e.clientY);
    const sx0 = p0.x;
    const sy0 = p0.y;
    // 视口（固定、不随画布平移）：边缘判定必须基于它，不能用被 transform 的画布 rect
    const vpRect = (canvas.parentElement || canvas).getBoundingClientRect();
    let lastX = e.clientX, lastY = e.clientY;
    let rafId = 0;         // 自动平移动画
    let refreshRaf = 0;    // 框选矩形刷新（rAF 合帧，与拖拽/缩放/选区条一致）

    const EDGE = 48;   // 距视口边缘多近开始自动平移
    const MAX = 14;    // 每帧最大平移像素（原 26：60fps 下约 1560px/s，且进入边缘区瞬间就全速 → 画布像被甩走）

    // 用当前屏幕坐标刷新框选矩形：画布随平移移动后，内容坐标会自然外扩 → 框得够画布外
    const refresh = () => {
      const p1 = CanvasViewport.screenToCanvas(ctx, lastX, lastY);
      const sx1 = p1.x, sy1 = p1.y;   // 终点内容坐标（已按缩放比换算）
      const x = Math.min(sx0, sx1), y = Math.min(sy0, sy1);
      const w = Math.abs(sx1 - sx0), h = Math.abs(sy1 - sy0);
      m.style.left = x + 'px'; m.style.top = y + 'px';
      m.style.width = w + 'px'; m.style.height = h + 'px';
      const r = { x, y, w, h };
      ctrl._marqueeRect = r;
      badge.textContent = (ctrl._countInRect ? ctrl._countInRect(r) : 0) + '';
    };

    // rAF 合帧刷新：把一帧内多次 pointermove 收敛为一次 refresh（读 canvas rect + 写 4 样式 + 计数查询），
    // 与 group-drag/resize/选区条同模式，消除框选逐事件的 read-after-write 强制回流。
    const scheduleRefresh = () => { if (refreshRaf) return; refreshRaf = requestAnimationFrame(() => { refreshRaf = 0; refresh(); }); };

    // 指针是否贴「视口」边缘 → 自动平移方向 + 随深度渐变的步长（在左/上缘往对应方向平移露出那侧内容）
    const edgeStep = () => CardInteractions.marqueeEdgeStep(lastX, lastY, vpRect, EDGE, MAX);

    // 贴边时持续平移（Figma 式）：画布滚动、矩形内容坐标外扩，松手即选中画布外那片
    const tick = () => {
      rafId = 0;
      const s = edgeStep();
      if (s) {
        // 用「实际生效的偏移」getOffset（与 apply 写 transform 同源）：canvasOffset 初值为 null，
        // 若用 state.canvasOffset || {0,0} 兜底，第一帧会把画布直接搬到 (step,step) 附近 → 跳变。
        const off = CanvasViewport.getOffset(ctrl);
        ctrl._setCanvasOffset(off.x + s.dx * s.step, off.y + s.dy * s.step);
        refresh();
      }
      if (s) rafId = requestAnimationFrame(tick);
    };

    const move = (ev) => {
      lastX = ev.clientX; lastY = ev.clientY;
      scheduleRefresh();
      if (edgeStep() && !rafId) rafId = requestAnimationFrame(tick);
    };
    // 指针被系统取消 → 中止本次框选（不把半途矩形当成选中结果），并走统一收尾
    const onCancel = () => { ctrl._marqueeCancelled = true; up(); };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', onCancel);
      if (rafId) cancelAnimationFrame(rafId);
      if (refreshRaf) { cancelAnimationFrame(refreshRaf); refreshRaf = 0; }
      refresh();   // 松手前同步刷一次，保证 _marqueeRect 反映最新指针位置（_selectInRect 依赖它）
      if (ctrl._marquee) { ctrl._marquee.remove(); ctrl._marquee = null; }
      // 被双指捏合接管（_cancelMarquee）：不做任何选中变更，避免捏合时把已选清空
      if (ctrl._marqueeCancelled) { ctrl._marqueeCancelled = false; ctrl._marqueeRect = null; return; }
      ctrl._selectInRect(ctrl._marqueeRect || { x: sx0, y: sy0, w: 0, h: 0 }, additive);
      ctrl._marqueeRect = null;
      if (ctrl._revealSelection) ctrl._revealSelection();   // 兜底：选区超视口则平移露出
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', onCancel);
    refresh();
  },
  // (was _countInRect) 统计落在矩形内（含画布外）的卡片数，供框选实时数量提示（不挂载、不选中）
  countInRect(ctx, r) {
    const { state, ctrl } = ctx;
    const sp = ctrl._spatial;
    const hits = sp ? sp.queryRect(r.x, r.y, r.x + r.w, r.y + r.h) : [];
    const noteIdx = ctrl._noteIndex ? ctrl._noteIndex() : null;
    let n = 0;
    hits.forEach((id) => {
      const g = ctrl._geo ? ctrl._geo.get(id) : null;
      const note = noteIdx ? noteIdx.get(id) : null;
      const lx = g ? g.x : (note ? note.x : 0);
      const ly = g ? g.y : (note ? note.y : 0);
      const w = g ? g.w : (note && note.w ? note.w : 340);
      const h = g ? g.h : (note && note.h ? note.h : 120);
      if (lx + w >= r.x && lx <= r.x + r.w && ly + h >= r.y && ly <= r.y + r.h) n++;
    });
    return n;
  },
  // (was _selectInRect)
  selectInRect(ctx, r, additive) {
    const { state, ctrl } = ctx;
    if (!ctrl._spatial) ctrl._spatial = new SpatialIndex(512);
    // 候选由空间索引 queryRect 给出（O(命中)），不再全量读 DOM。关键点：空间索引在剔除卸载时
    // 不清空，故**候选含离屏卡**。离屏卡无 DOM，无法被选中 —— 先按需挂载（进入 _selected 后即被
    // pinnedIds 钉住，后续剔除不会再卸载它），再判相交选中。这样 Shift 框选就能覆盖视口之外的内容。
    const hits = ctrl._spatial.queryRect(r.x, r.y, r.x + r.w, r.y + r.h);
    if (!additive) ctrl._clearSelection();   // Shift 追加框选：保留已有选中
    if (!ctrl._mountedCards) return;
    const noteIdx = ctrl._noteIndex ? ctrl._noteIndex() : null;
    // 【性能·两趟】第一趟：把离屏候选批量挂载（defer 测量）。
    // 旧实现是「挂一张 → 立刻读 offsetWidth 判相交」→ 每张离屏卡一次同步重排（N 次）。
    let deferredAny = false;
    if (noteIdx) {
      hits.forEach((id) => {
        if (ctrl._mountedCards.get(id)) return;
        const note = noteIdx.get(id);
        if (!note) return;
        const mounted = ctrl._mountCard ? ctrl._mountCard(note, { defer: true }) : null;
        if (mounted) deferredAny = true;
      });
    }
    // 集中量一次：所有新挂载卡在同一批里写入 _geo（只付一次 reflow）
    if (deferredAny && typeof ctrl._flushMountMeasure === 'function') ctrl._flushMountMeasure();

    // 第二趟：只用 _geo 判相交（零 DOM 读取）；仅当缓存缺失时才回退读 style/offset
    hits.forEach((id) => {
      const card = ctrl._mountedCards.get(id);
      if (!card) return;
      const g = ctrl._geo ? ctrl._geo.get(id) : null;
      const lx = g ? g.x : (parseFloat(card.style.left) || 0);
      const ly = g ? g.y : (parseFloat(card.style.top) || 0);
      const w = g ? g.w : (card.offsetWidth || 0);
      const h = g ? g.h : (card.offsetHeight || 0);
      if (lx + w >= r.x && lx <= r.x + r.w && ly + h >= r.y && ly <= r.y + r.h) {
        if (!ctrl._selected) ctrl._selected = new Set();
        ctrl._selected.add(card);
        card.classList.add('selected');
      }
    });
    // 贴纸：与卡片同一内容坐标系，矩形相交即纳入统一选区（便签档专属装饰，非便签档不挂载故无需判定档位）
    const mm = ctrl._materialMarket;
    if (mm && mm._canvasStickers) {
      for (const rec of mm._canvasStickers) {
        if (!rec.el) continue;
        const ix = rec.x + rec.w >= r.x && rec.x <= r.x + r.w && rec.y + rec.h >= r.y && rec.y <= r.y + r.h;
        if (ix) {
          if (!ctrl._selected) ctrl._selected = new Set();
          ctrl._selected.add(rec.el);
          rec.el.classList.add('selected');
        }
      }
    }
    if (ctrl._updateSelBar) ctrl._updateSelBar();

  },
  // (was _revealSelection)
  // 框选松手后「不」自动平移画布：选择期间画布保持原位，视野外被选中的内容由用户手动平移查看 ——
  // 彻底消除「松手瞬间整块移动」（此前的居中 / 最小平移都会让画面跳）。仅刷新选区工具条
  // （计数 / 合并入口随选中集变化），不触碰 canvasOffset。
  revealSelection(ctx) {
    const { ctrl } = ctx;
    if (ctrl._updateSelBar) ctrl._updateSelBar();
  },
  // (was _bindSelectionKeys)
  bindSelectionKeys(ctx) {
    const { state, ctrl } = ctx;
    const root = ctrl._el;
    if (!root) return;
    // 幂等：重复绑定时先摘掉旧监听，避免 document 级 keydown 叠加。
    if (ctrl._selKeyHandler) { document.removeEventListener('keydown', ctrl._selKeyHandler); ctrl._selKeyHandler = null; }
    ctrl._selKeyHandler = (e) => {
      // 不能直接判 e.target.tagName：机身输入框在 shadow 树内，事件穿出 shadow 边界后
      // target 会被重定向成 host(div)，该守卫会失效 → 在输入框里按退格会误删选中的便签、
      // 按 F 会触发归位。改用 composedPath() 取真实路径判定。
      if (isFromTextEntry(e)) {
        // 例外：焦点在全局打印框（twInput）且已选中卡片、且打印框为空时，
        // Delete/Backspace 视作「删卡」指令（空打印框退格本无意义）。
        // 打印框非空（正在打字）则保留原意：拦掉、让浏览器删字，避免误删选中的卡。
        // 主路径由「选中卡片时 _blurInput 让打印框失焦」保证，这里只是兜底。
        if ((e.key === 'Delete' || e.key === 'Backspace') && ctrl._selected && ctrl._selected.size) {
          const inp = ctrl._input;
          const inPrint = inp && e.composedPath && e.composedPath().some((n) => n === inp);
          if (inPrint && !inp.value) { e.preventDefault(); ctrl._deleteSelected(); }
        }
        return;
      }
      // 撤销 / 重做：Cmd/Ctrl+Z、Cmd/Ctrl+Shift+Z。
      // 导图模式下让位给 MindmapFeature（它有自己的文档与历史），否则一次按键会被两边各撤一次。
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        if (!ModePolicy.usesCardInteractions(ctrl._mode)) return;
        e.preventDefault();
        ctrl._undoRedo(e.shiftKey ? 'redo' : 'undo');
        return;
      }
      // ⌘±/0、Shift+1/2、H 等「画布缩放/适应/抓手」键已统一收口到 CanvasKeys（C2）：
      // 便签与导图各注册一份、命中且本模式激活时 stopImmediatePropagation，杜绝双响。
      // 以下仅处理便签模式专属键（撤销/重做、删除、F 归位）。

      const cv = ctrl._canvas;
      if (!cv || !cv.isConnected || cv.getBoundingClientRect().width < 2) return;
      if (cv.querySelector('.tw-card.editing')) return;   // 编辑中不打断
      // 删除选中（仅当选中非空）
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (ctrl._selected && ctrl._selected.size) { e.preventDefault(); ctrl._deleteSelected(); }
        return;
      }
      // F：便签被拖出视野后，重新归位到视野中心（Cmd/Ctrl+F 是宿主查找快捷键，必须放行，不在此拦截）
      if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); ctrl._recenterNotes(); }
    };
    document.addEventListener('keydown', ctrl._selKeyHandler);

    // 通用画布键位（⌘±/0、Shift+1/2、H）统一收口到 CanvasKeys（C2）：与导图共用同一份逻辑，
    // 命中且便签激活时 stopImmediatePropagation，避免事件继续到导图处理器造成双响。
    // 幂等：CanvasKeys 挂 document 级捕获监听，重复绑定会叠加（且旧 handler 先执行并
    // stopImmediatePropagation，会把新 handler 挡掉），故先销毁旧的。
    if (ctrl._canvasKeysDetach) { ctrl._canvasKeysDetach(); ctrl._canvasKeysDetach = null; }
    ctrl._canvasKeysDetach = CanvasKeys.bind({
      isActive: () => ModePolicy.usesCardInteractions(ctrl._mode),
      zoomByCenter: (f) => ctrl._zoomByCenter(f),
      zoomReset: () => ctrl._zoomReset(),
      fitView: () => ctrl._fitNotesToView(),
      fitSelection: () => ctrl._fitSelectionToView(),
      toggleHand: () => ctrl._hand.toggleHand(),
      zoomStep: 1.25,
    });
  },
  // (was _enforceEditLimit)
  enforceEditLimit(ctx, text) {
    const { ctrl } = ctx;
    if (!text) return;
    const limit = ModePolicy.cardMaxLen(ctrl._mode);   // 便签 500 / 写作 20000，见 ModePolicy
    const full = text.innerText || '';
    if (full.length <= limit) return;
    text.innerText = full.slice(0, limit);
    const sel = getSel(text);   // 全局 selection 在 Shadow DOM 里恒空
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(text);
      range.collapse(false);   // 光标落到末尾
      sel.removeAllRanges();
      sel.addRange(range);
    }
    if (typeof Toast !== 'undefined') Toast.showToast(`最多 ${limit} 字`, 'info');
  
  },
  // (was _makeResizable)
  makeResizable(ctx, card) {
    const { state, ctrl } = ctx;
    // 写作档（MD可视化写作）：卡片尺寸由内容决定，不提供拖角缩放手柄——
    // 单卡缩放是便签维度，文章里没有这语义（与纸样 / 旋转在写作档被隐藏 / 归零同理）。
    if (!ModePolicy.manualCardSize(ctrl._mode)) return;
    const handle = document.createElement('div');
    handle.className = 'tw-card-resize';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', '调整便签大小');
    handle.title = '拖动调整大小 · 双击复位 · ⌘/Ctrl+滚轮微调';
    card.appendChild(handle);

    let resizing = false;
    let resizePointerId = null;
    let startX = 0;
    let startY = 0;
    let baseW = 1;      // zoom=1 时的卡片宽度：拖拽位移统一折算到这个基准上
    let startZoom = 1;
    // 【帧预算】缩放是重活：_applyZoom 会写 style + WritingDoc.setZoom（全量模型重写）
    // + _syncCardScaleButtons（DOM 查询）。pointermove 可达 120Hz，照原样每个事件同步跑一次
    // 会远超帧预算。故与旋转手势同一策略：目标值在本次手势内本地累计，rAF 合帧后每帧只落一次
    // （对标 tldraw 的 batched store updates）。
    let pendingZoom = 1;
    let raf = 0;
    // ⌘/Ctrl+滚轮缩放同理：触控板可在一帧内连发多次，需合帧
    const apply = () => {
      raf = 0;
      ctrl._applyZoom(card, pendingZoom);
      ctrl._scheduleRenderLinks();   // 尺寸变化会移动端点
    };
    const onMove = (e) => {
      if (!resizing) return;
      if (resizePointerId != null && e.pointerId !== resizePointerId) return;   // 第二指不驱动本次缩放
      // 对角手势：向右下拖 = 放大（横向与纵向位移都计入，手感更自然）
      const delta = (e.clientX - startX) + (e.clientY - startY);
      pendingZoom = ((baseW + delta) / baseW) * startZoom;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = (e) => {
      if (!resizing) return;
      if (e && resizePointerId != null && e.pointerId !== resizePointerId) return;   // 只认起始指抬起
      resizing = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      ctrl._applyZoom(card, pendingZoom);   // 补写最后一帧，避免丢掉末尾增量
      card.classList.remove('is-resizing');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      const capEl = ctrl._canvas || card;
      if (capEl && capEl.releasePointerCapture && resizePointerId != null && capEl.hasPointerCapture && capEl.hasPointerCapture(resizePointerId)) {
        try { capEl.releasePointerCapture(resizePointerId); } catch (_) {}
      }
      if (ctrl._cardGestureCancel === cancel) ctrl._cardGestureCancel = null;
      ctrl._measureCard(card); // 缩放手势结束重测几何→刷新 geo+空间索引
      ctrl._scheduleSave(); // 落盘新尺寸
    };
    // 供「第二指落下 / 捏合开始」取消：复用收尾路径（在当前位置定住），让位给捏合
    const cancel = () => { if (resizing) onUp({ type: 'pointercancel', pointerId: resizePointerId }); };

    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof ctrl._cardGestureCancel === 'function') ctrl._cardGestureCancel();   // 取消其他进行中的手势
      const captureEl = ctrl._canvas || card;
      resizePointerId = e.pointerId;
      if (captureEl && captureEl.setPointerCapture && resizePointerId != null) {
        try { captureEl.setPointerCapture(resizePointerId); } catch (_) {}
      }
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startZoom = ctrl._clampZoom(card.dataset.zoom);
      pendingZoom = startZoom;
      // 基准 = 拖拽起始的「视觉宽度」(屏幕像素，已含画布缩放与卡片缩放)；pendingZoom 按视觉宽度比例变化，
      // 与画布缩放/卡片缩放解耦——此前多除了一次 startZoom，导致已缩放过的卡片再次拖拽时灵敏度翻 startZoom 倍。
      const w = card.getBoundingClientRect().width || card.offsetWidth;
      baseW = (w || 340);
      card.classList.add('is-resizing');
      card.style.zIndex = String(++ctrl._zTop);
      ctrl._cardGestureCancel = cancel;   // 供第二指/捏合取消
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);   // 系统取消指针时同样收尾，避免监听残留
    });

    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ctrl._applyZoom(card, 1);
      ctrl._scheduleSave();
    });

    // 卡片滚轮快捷键已全部移除：
    //   · Alt+滚轮（单卡缩放）—— 移除，改由卡片上的 S/M/L/XL 档位按钮操作；
    //   · Shift+滚轮（调字号）—— 移除，改由卡片上的「放大/缩小字号」圆钮或右侧字号面板操作。
    // 所有滚轮事件一律放行给画布层做平移/缩放，卡片不再拦截滚轮。
  
  },
  // (was _makeRotatable)
  makeRotatable(ctx, card) {
    const { state, ctrl } = ctx;
    const handle = document.createElement('div');
    handle.className = 'tw-card-rotate';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', '旋转便签');
    handle.title = '拖动旋转 · Shift 吸附 15° · 双击归零';
    handle.innerHTML = ICON_ROTATE;
    ctrl._applyKnobSize(handle);   // 内联像素：与右侧连线锚点严格等大
    card.appendChild(handle);

    let rotating = false;
    let rotatePointerId = null;
    let lastAngle = 0;
    // 【性能】旋转是绕卡片中心的，中心在旋转下不变 → pointerdown 时取一次即可复用。
    // 原先每次 move 都 getBoundingClientRect()，且与 _applyRot 的写入交替 → 强制同步重排。
    let cx0 = 0;
    let cy0 = 0;
    // 目标角度在本次手势内本地累计：合帧后 _applyRot 每帧才写一次 dataset，
    // 若仍像原先那样「读 dataset.rot + 增量」，一帧内的第二个事件会读到未更新的旧值 → 丢增量。
    let pendingDeg = 0;
    let raf = 0;
    const angleOf = (ax, ay, px, py) => Math.atan2(py - ay, px - ax) * 180 / Math.PI;
    const apply = () => {
      raf = 0;
      ctrl._applyRot(card, pendingDeg);
      ctrl._scheduleRenderLinks();   // 旋转后端点沿旋转矩形重算
    };
    const onMove = (e) => {
      if (!rotating) return;
      if (rotatePointerId != null && e.pointerId !== rotatePointerId) return;   // 第二指不驱动本次旋转
      const a = angleOf(cx0, cy0, e.clientX, e.clientY);
      let delta = a - lastAngle;
      // 跨越 ±180° 时 atan2 会跳变，归一化增量避免「猛地多转一圈」
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;
      lastAngle = a;
      pendingDeg += delta;
      // Shift 吸附到 15° 网格；吸附值写回累计量，保证松手后不回弹
      if (e.shiftKey) pendingDeg = Math.round(pendingDeg / 15) * 15;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = (e) => {
      if (!rotating) return;
      if (e && rotatePointerId != null && e.pointerId !== rotatePointerId) return;   // 只认起始指抬起
      rotating = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      ctrl._applyRot(card, pendingDeg);   // 补写最后一帧，避免丢掉末尾增量
      ctrl._measureCard(card);            // 旋转手势结束重测几何→刷新 geo+空间索引
      ctrl._scheduleRenderLinks();
      card.classList.remove('is-rotating');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      const capEl = ctrl._canvas || card;
      if (capEl && capEl.releasePointerCapture && rotatePointerId != null && capEl.hasPointerCapture && capEl.hasPointerCapture(rotatePointerId)) {
        try { capEl.releasePointerCapture(rotatePointerId); } catch (_) {}
      }
      if (ctrl._cardGestureCancel === cancel) ctrl._cardGestureCancel = null;
      ctrl._scheduleSave();   // 落盘新角度
    };
    // 供「第二指落下 / 捏合开始」取消：复用收尾路径（在当前位置定住），让位给捏合
    const cancel = () => { if (rotating) onUp({ type: 'pointercancel', pointerId: rotatePointerId }); };
    // 双击归零：**不能用原生 dblclick**。
    // 下面 pointerdown 里的 setPointerCapture 会把后续 pointer 事件的 target 定向到 canvas，
    // 而 dblclick 是由 pointer 事件序列合成的 —— 于是 handle 上的原生 dblclick 永远收不到。
    // 实测（Chromium）：仅 preventDefault 时 dblclick=1；再加上 setPointerCapture 后 dblclick=0。
    // 故在 pointerdown 里手动判定双击，与 mindmapFeature._handleDoubleTap 同一范式。
    const ZERO_TAP_MS = 320;
    let lastTapAt = 0;
    // 本次双击「已被旋转手柄消费」的时刻。用于阻止该次原生 dblclick 泄漏到画布：
    // setPointerCapture 会把 dblclick 的 target 定向到 canvas，从而绕过
    // makeCanvasDraggable 里的守卫（e.target.closest('.tw-card, ...') 判定不到手柄），
    // 于是每次双击手柄都会连带触发 _recenterNotes —— 把全部便签归位到视野中心。
    let lastZeroAt = 0;
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const nowTap = Date.now();
      if (nowTap - lastTapAt < ZERO_TAP_MS) {
        lastTapAt = 0;
        lastZeroAt = nowTap;
        // 双击语义：归零并落盘，且不启动这次旋转手势
        if (rotating) onUp({ type: 'pointerup', pointerId: rotatePointerId });
        ctrl._applyRot(card, 0);
        ctrl._measureCard(card);
        ctrl._scheduleRenderLinks();
        ctrl._scheduleSave();
        return;
      }
      lastTapAt = nowTap;

      if (typeof ctrl._cardGestureCancel === 'function') ctrl._cardGestureCancel();   // 取消其他进行中的手势
      const captureEl = ctrl._canvas || card;
      rotatePointerId = e.pointerId;
      if (captureEl && captureEl.setPointerCapture && rotatePointerId != null) {
        try { captureEl.setPointerCapture(rotatePointerId); } catch (_) {}
      }
      rotating = true;
      const r = card.getBoundingClientRect();
      cx0 = r.left + r.width / 2;
      cy0 = r.top + r.height / 2;
      pendingDeg = Number(card.dataset.rot) || 0;
      lastAngle = angleOf(cx0, cy0, e.clientX, e.clientY);
      card.classList.add('is-rotating');
      card.style.zIndex = String(++ctrl._zTop);
      ctrl._cardGestureCancel = cancel;   // 供第二指/捏合取消
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);   // 系统取消指针时同样收尾，避免监听残留
    });
    // 这里曾监听原生 dblclick 做「双击归零」，但它从未生效（setPointerCapture 吞掉了 dblclick，
    // 见上方 pointerdown 里的说明）。归零逻辑已并入 pointerdown 的手动双击判定，此处不再重复绑定。

    // 但那次 dblclick 并不会消失 —— 它只是换了 target（canvas）继续冒泡，于是绕过画布守卫
    // 触发 _recenterNotes，把全部便签归位。捕获阶段吞掉它：归零已由手动判定完成，
    // 这一次 dblclick 不应再产生任何全局副作用。
    const rootEl = ctrl._el || ctrl._canvas;
    if (rootEl) {
      rootEl.addEventListener('dblclick', (e) => {
        if (Date.now() - lastZeroAt < 400) { e.stopPropagation(); e.preventDefault(); }
      }, true);   // 捕获阶段：赶在画布的 dblclick（冒泡阶段）之前拦截
    }
  
  },
  // (was _bindEdit)
  bindEdit(ctx, card) {
    const { state, ctrl } = ctx;
    card.addEventListener('dblclick', (e) => {
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate')) return;
      if (card.classList.contains('editing')) return;
      ctrl._enterEdit(card);
    });

  },
  /**
   * 双击进入编辑的手动判定（绕开被抑制的原生 dblclick）。
   * startGroupDrag 在 pointerdown 上 e.preventDefault() —— 浏览器因此不再派发原生 dblclick，
   * 卡片上的「双击编辑」入口（bindEdit 的 dblclick 监听）在普通模式下永远不触发
   * （表现为「双击进不去编辑」，而开启抓手工具后因早退、没有 preventDefault，原生 dblclick 反而生效）。
   * 这里用「时间点 + 同卡片」手动判定；命中返回 true（调用方进入编辑并跳过拖拽）。
   * 抓手/空格态不走 makeDraggable 的 onDown（早退让位平移），那路没有 preventDefault，
   * 原生 dblclick 仍有效，故该态不依赖本判定。
   */
  cardDoubleTapHit(ctrl, id) {
    const now = Date.now();
    const last = ctrl._lastCardTap;
    if (last && last.id === id && (now - last.t) < 350) {
      ctrl._lastCardTap = null;
      return true;
    }
    ctrl._lastCardTap = { id, t: now };
    return false;
  },
  // (was _exitAllEdits)
  exitAllEdits(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    Array.from(ctrl._canvas.querySelectorAll('.tw-card.editing')).forEach((c) => ctrl._exitEdit(c));
  
  },
  /** 编辑输入的统一处理。
   *  【根因修复·字号自适应不及时】输入法组字中（isComposing）原先是「直接 return」，
   *  把 fitCardText 也一并跳过了 —— 中文打字全程都处在组字中，于是整个组字过程字号不缩、
   *  组字结束才跳一下，体感就是「不够及时」。现改为：组字中只跳过【截断 + 写模型】，
   *  字号自适应照常执行（它只读布局、不改模型，不会打断组字）。 */
  _handleEditInput(ctrl, card, e) {
    const text = card.querySelector('.tw-card-text');
    if (!text) return;
    const composing = !!(e && e.isComposing);
    if (!composing) {
      // innerText 是强制同步布局读：常规（未超限）只读一次；仅当超限才走截断+选区间恢复（罕见）
      const curNote = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
      // 源码视图：卡上就是这张卡的原始 md，原样写回，不做任何「投影 → 语法」的猜测
      const rawSrc = !!card._srcMode;
      // 「是否富结构」不能只看 dataset.twRich：纯文本卡在编辑态被工具条加粗/加代码后
      // DOM 里会生成 <strong>/<code>，此时仍读 innerText 会把标记冲掉 ——
      // 表现为「点了加粗、接着打字，加粗就没了」。
      const rich = !rawSrc && typeof ctrl._serializeCardText === 'function'
        && (!!text.dataset.twRich
          || !!text.querySelector('strong,em,code,del,s,mark,table,pre,img,.tw-md-list,.tw-task-row,.tw-md-quote'));
      let full = rawSrc
        ? (typeof text.innerText === 'string' ? text.innerText : text.textContent)
        : (rich ? ctrl._serializeCardText(text, curNote) : text.innerText);
      // 上限按档位取：写作档的卡片是 md 块（表格/围栏/并卡本就允许超 MAX_LEN），
      // 用便签的 500 字去截会把用户的 md 切坏。
      const limit = ModePolicy.cardMaxLen(ctrl._mode);
      if (full.length > limit) {
        // 富渲染卡只截模型文本，绝不用 innerText 覆盖投影 DOM（会把表格/列表结构冲成纯文本）
        if (rich) full = full.slice(0, limit);
        else if (rawSrc) { full = full.slice(0, limit); text.textContent = full; }
        else { ctrl._enforceEditLimit(text); full = text.innerText; }
      }
      // 【撤销】一次编辑 = 一步撤销：在**首次真正改动前**留档，捕获「编辑前」状态。
      // 不放在 enterEdit 里 push —— 那会给「打开但一个字没改」的编辑也压一条空撤销帧。
      // 组字期间（composing）不写模型，故首个非组字 input（含组字结束那次）才留档，时机正确。
      if (!card._editUndoPushed) {
        card._editUndoPushed = true;
        if (ctrl._undoStack) ctrl._undoStack.push();
      }
      ctrl._notes = WritingDoc.setText(ctrl._notes, card.dataset.id, full);  // 连续编辑改走 WritingDoc 原语
    }
    ctrl._scheduleSave();
    fitCardText(card);   // 定框纸样：边打边把字号调进框里（组字期间也生效）
  },
  /** 粘贴：只粘纯文本；粘贴后立即做一次字号自适应（个别环境下 execCommand 不派发 input）。 */
  _handleEditPaste(ctrl, card, e) {
    const dt = e.clipboardData || window.clipboardData;
    const imgs = imageFilesFrom(dt);
    if (imgs.length) {          // 截图 / 复制的图片：落盘成 md 链接，不走纯文本通道
      e.preventDefault();
      this.insertImageFiles(ctrl, card, imgs);
      return;
    }
    e.preventDefault();
    const text = card.querySelector('.tw-card-text');
    const t = dt.getData('text/plain');
    const limit = ModePolicy.cardMaxLen(ctrl._mode);
    // 剩余空间按模型字数算：富卡投影里没有 ** 这些标记，用 innerText 会高估空间
    const room = limit - editModelLen(ctrl, card, text);
    if (room <= 0) {
      if (typeof Toast !== 'undefined') Toast.showToast('最多 ' + limit + ' 字', 'info');
      return;
    }

    const allowed = t.length > room ? t.slice(0, room) : t;
    // 纯文本通道：不把网页样式带进便签。
    // Shadow DOM 里 document.execCommand 依赖宿主焦点，常常静默失败（粘贴没反应），
    // 因此优先直接往当前选区插文本节点，命令式作为兜底。
    pushEditUndo(ctrl, card);   // 顺手补上：粘贴此前不进撤销栈
    insertEditText(card, text, allowed);
    fitCardText(card);   // 兜底：粘贴后立即自适应一次
  },

  /**
   * 粘贴 / 拖入的图片：先落盘到画中卷/assets/，再把 `![](路径)` 插进正文。
   * 正文里只留一行链接（不是 base64）——md 仍是干净、可导出、可 diff 的纯文本。
   *
   * 两条插入路径：
   *  - 编辑态（contenteditable=true）：插到当前光标处，插完把光标放到最后一张图后面；
   *  - 非编辑态（直接把图拖到卡片上）：追加到正文末尾 —— 不去碰 contenteditable 的
   *    焦点/选区（从没进入编辑时不保证有 range，execCommand 会静默失败）。
   */
  async insertImageFiles(ctrl, card, files) {
    const text = card.querySelector('.tw-card-text');
    if (!text) return 0;
    const store = (typeof window !== 'undefined') ? window.storageManager : null;
    if (!store || typeof store.writeVaultImage !== 'function') {
      if (typeof Toast !== 'undefined') Toast.showToast('当前环境不支持写入图片', 'info');
      return 0;
    }
    const list = (Array.isArray(files) ? files : Array.from(files || []))
      .filter((f) => f && /^image\//i.test(f.type || ''));
    if (!list.length) return 0;
    const editing = text.getAttribute('contenteditable') === 'true';
    const limit = ModePolicy.cardMaxLen(ctrl._mode);
    const insertedMd = [];
    // 追加模式下模型由这里直接改，撤销点必须自己压（commitEditModel 那条路走不到）
    if (!editing && ctrl._undoStack && typeof ctrl._undoStack.push === 'function') ctrl._undoStack.push();
    for (let k = 0; k < list.length; k += 1) {
      const room = limit - editModelLen(ctrl, card, text);
      if (room <= 0) {
        if (typeof Toast !== 'undefined') Toast.showToast('最多 ' + limit + ' 字', 'info');
        break;
      }
      // 逐张串行落盘：并发写会让插入顺序与光标位置乱掉
      // eslint-disable-next-line no-await-in-loop -- 顺序语义优先，图片数量个位数
      const md = await saveImageFile(store, list[k]);
      if (!md) {
        if (typeof Toast !== 'undefined') Toast.showToast('图片保存失败', 'info');
        continue;
      }
      if (md.length > room) {
        if (typeof Toast !== 'undefined') Toast.showToast('最多 ' + limit + ' 字', 'info');
        break;
      }
      if (editing) {
        insertEditText(card, text, md);
      } else {
        const cur = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
        if (!cur) break;
        const base = String(cur.text || '');
        const next = base + (base && !/\n$/.test(base) ? '\n' : '') + md;
        if (typeof WritingDoc !== 'undefined' && WritingDoc.setText) {
          ctrl._notes = WritingDoc.setText(ctrl._notes, card.dataset.id, next);
        }
        const after = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
        // 非编辑态一律走富投影重绘：源码视图（_srcMode）下保持纯文本，由它自己决定
        if (after && typeof ctrl._applyCardText === 'function') ctrl._applyCardText(text, after);
      }
      insertedMd.push(md);
    }
    if (!insertedMd.length) return 0;
    if (editing) {
      // 先把插进去的 md 落进模型，再按新模型重投影：图片当场显示，不用退出重进
      commitEditModel(ctrl, card, text);
      const note = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
      if (note && !card._srcMode && typeof ctrl._applyCardText === 'function') {
        ctrl._applyCardText(text, note);
        // 光标落到最后插入的那张图后面，接着打字不用自己找位置
        const lastMd = insertedMd[insertedMd.length - 1];
        let target = null;
        const imgs = text.querySelectorAll('img.tw-md-img');
        for (let i = 0; i < imgs.length; i += 1) {
          if (imgs[i].dataset && imgs[i].dataset.mdRaw === lastMd) target = imgs[i];
        }
        try {
          const sel = getSel(text);
          if (sel) {
            const r = document.createRange();
            if (target) r.setStartAfter(target);
            else { r.selectNodeContents(text); r.collapse(false); }
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
            card._caretRange = r.cloneRange();
          }
        } catch (_) { /* 光标定位失败不影响插入 */ }
      }
    }
    fitCardText(card);
    if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
    return insertedMd.length;
  },
  // (was _enterEdit)
  onTaskToggle(ctrl, cb) {
    const row = cb.closest('.tw-task-row');
    const card = cb.closest('.tw-card');
    if (!row || !card || !card.dataset.id) return;
    const id = card.dataset.id;
    const note = (ctrl._notes || []).find((n) => n.id === id);
    if (!note) return;
    // 用渲染时记下的行号回写对应行 marker（行号与 note.text 的物理行一一对应，
    // 不能靠「第几个勾选框」数，因为卡里可能夹着非任务行）。
    const i = Number(row.dataset.line);
    const lines = String(note.text).split('\n');
    if (!(i >= 0 && i < lines.length)) return;
    lines[i] = lines[i].replace(/^([-*]\s+)\[[ xX]\]/, (_, p) => p + '[' + (cb.checked ? 'x' : ' ') + ']');
    ctrl._notes = WritingDoc.setText(ctrl._notes, id, lines.join('\n'));
    row.classList.toggle('done', cb.checked);
    ctrl._scheduleSave();
  },
  enterEdit(ctx, card) {
    const { state, ctrl } = ctx;
    if (card.classList.contains('editing')) return;
    ctrl._exitAllEdits();
    const text = card.querySelector('.tw-card-text');
    if (!text) return;
    card.classList.add('editing');
    ctrl._editingId = card.dataset.id;   // 编辑中：钉在屏上，剔除跳过
    card._editUndoPushed = false;   // 本次编辑会话是否已为撤销留档（首次真正改动时才 push）
    text.setAttribute('contenteditable', 'true'); // 所见即所得：直接在纸样内改，样式已就位
    // 代码块先拍平成纯文本再给用户改：带 tk-* span 时新打的字会继承上一个 token 的颜色、
    // 着色又不会随输入重算（看着像坏）。文本完全不变，只是去掉包装；退出编辑按新模型重绘。
    if (typeof plainifyCodeBlocks === 'function') plainifyCodeBlocks(text);
    // 无语法编辑：富渲染卡保留投影 DOM 直接编辑，不再 textContent = 原始 markdown。
    // 文字与勾选态的改动由 _handleEditInput / exitEdit 的 serializeRichText 反向写回模型。
    // 编辑态提到最上层：工具条挂在画布层，若本卡 z-index 低于邻卡，浮层会被压在下面
    if (typeof ctrl._zTop === 'number') card.style.zIndex = String(++ctrl._zTop);
    ensureEditTools(ctrl, card, text);   // 格式 / 结构编辑入口（纯文本卡也要能新增格式）
    // 卡片被拖动（点纸边）后工具条跟随
    const onMove = () => placeEditTools(ctrl, card);
    card.addEventListener('transitionend', onMove);
    card._toolFollow = onMove;
    // 选区快照：**只记非空选区**。把 collapsed 光标也记进来的话（enterEdit 末尾就会设一次），
    // 点按钮时回退到这份空快照，加粗就会永远提示「先选中要格式化的文字」。
    card._editRange = null;
    const onSel = () => {
      const sel = getSel(text);
      if (!sel || !sel.rangeCount) return;
      const r = sel.getRangeAt(0);
      // 光标态（塌陷）也要留住：列表增删项 / 表格增删行列判断的是「停在哪一行/哪个单元格」，
      // 根本不依赖选中文字。以前这里直接 return，导致那些按钮永远提示「把光标放到列表项里」。
      if (r.collapsed) {
        if (text.contains(r.startContainer)) card._caretRange = r.cloneRange();
        // 光标落点变了：工具条跟着走（表格里贴当前行，普通卡回到卡顶）
        placeEditTools(ctrl, card);
        return;
      }
      // Shadow DOM 下容器可能挂在 host 侧：能直接用于卡内就直接存，否则用选中文字重建
      if (text.contains(r.commonAncestorContainer)) { card._editRange = r.cloneRange(); return; }
      const rebuilt = rangeFromSelectedText(text);
      if (rebuilt) card._editRange = rebuilt;
    };
    // 在文本内单击只移动光标：清掉「选中文字」快照，但必须记下光标位置（列表/表格操作要用）
    const onTextUp = () => {
      const sel = getSel(text);
      if (!sel || !sel.rangeCount) return;
      const r = sel.getRangeAt(0);
      if (r.collapsed && text.contains(r.startContainer)) {
        card._caretRange = r.cloneRange();
        card._editRange = null;
      }
    };
    document.addEventListener('selectionchange', onSel);
    text.addEventListener('pointerup', onTextUp);
    text.addEventListener('mouseup', onSel);   // selectionchange 在部分 webview 不触发，再挂两道
    text.addEventListener('keyup', onSel);
    card._editSelHandler = { doc: onSel, text: onTextUp };
    // 兜底：若按钮自身监听被中间层吞掉，捕获阶段再拿一次（同一事件按对象去重）
    const onToolDown = (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('.tw-edit-tool') : null;
      // 工具条挂在画布层、不在 card 内，这里不能用 card.contains 判断（曾因此兜底恒失效）
      const bar = ctrl._editToolsBar;
      if (!btn || !bar || !bar.contains(btn)) return;
      // 捕获阶段早于任何焦点/选区变化：先把当前选区快照下来，按钮逻辑就不怕选区被清
      const sel = getSel(text);
      if (sel && sel.rangeCount) {
        const r = sel.getRangeAt(0);
        if (r.collapsed) {
          if (text.contains(r.startContainer)) card._caretRange = r.cloneRange();
        } else {
          card._editRange = r.cloneRange();
        }
      }
      if (typeof card._runEditOp === 'function') card._runEditOp(e, btn);
    };
    document.addEventListener('pointerdown', onToolDown, true);
    card._toolDocHandler = onToolDown;
    text.focus();
    // 光标落到末尾：必须用 shadow root 自己的 selection。
    // window.getSelection() 在 Shadow DOM 内恒为空 → 光标根本不会落下，甚至为 null 时直接抛错，
    // 让后面所有监听器绑定都不执行（编辑态看似进来了，其实什么都没绑上）。
    try {
      const sel = getSel(text);
      const range = document.createRange();
      range.selectNodeContents(text);
      range.collapse(false);
      if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    } catch (_) { /* 定位失败不应阻断进入编辑态 */ }
    // 【根因修复】事件回调必须用闭包绑定 this：浏览器触发 addEventListener 时 this 会指向
    // text 元素而非 feature 实例，否则 _exitEdit/_scheduleSave 变成 undefined ——
    // 表现为 Escape 退出失效、输入不自动落盘。处理器存到 card._editHandlers 以便对称移除。
    const onInput = (e) => this._handleEditInput(ctrl, card, e);
    // 列表 / 任务项内是否为空（marker、复选框都是装饰，不算内容）
    const rowIsEmpty = (row) => {
      if (row.classList.contains('tw-task-row')) {
        const lab = row.querySelector('.tw-task-label');
        return !lab || !lab.textContent.trim();
      }
      const box = row.cloneNode(true);
      Array.from(box.querySelectorAll('.tw-md-marker')).forEach((m) => m.remove());
      return !box.textContent.trim();
    };
    /* 列表/任务项的结构键按业界标准语义处理（ProseMirror splitListItem 那一套）：
       Enter 拆项、空项 Enter/Backspace 收掉这一项、Tab / Shift+Tab 增减缩进。
       全部只产生纯 markdown（`- ` / `1. ` / 缩进空格），不写 <br> 之类额外语法。
       非列表行不拦截：普通便签里回车仍由浏览器产生 <div>，序列化时还原成换行。 */
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        ctrl._exitEdit(card);
        return;
      }
      if (card._composing || e.isComposing) return;   // 输入法组字期间不抢键
      // ⌘/（Ctrl+/）：写作档在「可视化投影」与「原始 md」之间切换。
      // 便签档不放行：格式工具条（含 md 出口按钮）已按档位隐藏，放行会进入
      // 「卡上是纯 md、却没有任何可见出口」的坏状态。
      // 单点守卫不抽进 ModePolicy：策略表只收「同一规则被复制多份」的 A 类分支。
      if ((e.metaKey || e.ctrlKey) && (e.key === '/' || e.key === '?') && ctrl._mode === 'write') {
        e.preventDefault();
        this.toggleSource(ctx, card);
        return;
      }
      // 表格单元格内回车：跳到下一行同列 / 末行补一行（单元格里不能有换行）
      if (e.key === 'Enter' && currentCellOf(card, text)) {
        e.preventDefault();
        if (tableEnterNextRow(card, text)) commitEditModel(ctrl, card, text);
        return;
      }
      // 表格内 Tab：跳格 / 末格补行。必须赶在下面的「非列表行直接 return」之前 ——
      // 表格里 row 为空，漏拦 Tab 会被浏览器当焦点切换，直接 blur 退出编辑。
      if (e.key === 'Tab' && currentCellOf(card, text)) {
        e.preventDefault();
        if (tableTabMove(card, text, e.shiftKey)) commitEditModel(ctrl, card, text);
        return;
      }
      const row = currentRowOf(card, text);
      if (!row) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          // 项内换行（软换行）在扁平列表模型里无法无损表达：写进 md 的续行读回来会
          // 变成一个没有 marker 的项。宁可明确不支持，也不产出读回会变形的 markdown。
          if (typeof ctrl._showScreenMsg === 'function') {
            ctrl._showScreenMsg('列表项内不支持换行，按 Enter 新建一项', 1500);
          }
          return;
        }
        // 标准语义：先删掉选中内容再拆项，否则选中文字会被原样复制进新项
        try {
          const sel = getSel(text);
          const r = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
          if (r && !r.collapsed && text.contains(r.commonAncestorContainer)) r.deleteContents();
        } catch (_) { /* 选区异常时按原样拆项 */ }
        const op = rowIsEmpty(row) ? 'item-' : 'item+';
        if (listEditOp(card, text, op) === true) commitEditModel(ctrl, card, text);
        return;
      }
      if (e.key === 'Tab') {
        // 必须拦：不拦浏览器会把焦点移出卡片，直接触发 blur 退出编辑
        e.preventDefault();
        if (listEditOp(card, text, e.shiftKey ? 'indent-' : 'indent+') === true) {
          commitEditModel(ctrl, card, text);
        }
        return;
      }
      if (e.key === 'Backspace' && rowIsEmpty(row)) {
        e.preventDefault();
        if (listEditOp(card, text, 'item-') === true) commitEditModel(ctrl, card, text);
      }
    };
    const onPaste = (e) => this._handleEditPaste(ctrl, card, e);
    /* 字数上限在「输入前」拦：事后 slice 会把富文本切在 ** 或反引号中间，留下半截标记，
       而 md 是唯一真源，坏标记会被原样写进文件。组字期间不拦（preventDefault 会打断输入法）。 */
    const onBeforeInput = (e) => {
      if (card._composing || e.isComposing) return;
      if (typeof e.inputType !== 'string' || e.inputType.indexOf('insert') !== 0) return;
      const data = typeof e.data === 'string' ? e.data : '';
      if (!data) return;
      // 上限按档位取：便签 500，写作档是 md 块（表格/围栏/并卡本就超 500），不能按便签尺寸拦
      const limit = ModePolicy.cardMaxLen(ctrl._mode);
      if (editModelLen(ctrl, card, text) + data.length <= limit) return;
      e.preventDefault();
      if (typeof ctrl._showScreenMsg === 'function') {
        ctrl._showScreenMsg(`最多 ${limit} 字`, 1500);
      }
    };
    // 组字状态：中文输入法打字全程都是「组字中」，此时 DOM 里看到的候选还没上屏。
    // exitEdit 若在这时移除 contenteditable，这段临时文本会被直接丢弃。
    const onCompStart = () => { card._composing = true; };
    const onCompEnd = () => { card._composing = false; };
    card._editHandlers = { onInput, onKey, onPaste, onBeforeInput, onCompStart, onCompEnd };
    text.addEventListener('input', onInput);
    text.addEventListener('keydown', onKey);
    text.addEventListener('paste', onPaste);
    // 拖入图片不在这里挂：画布层有统一的委托监听（typewriterFeature._bindFileDropGuards），
    // 编辑态与非编辑态共用一条路径 —— 否则「卡片上拖一次、编辑态再拖一次」会插两遍。
    text.addEventListener('beforeinput', onBeforeInput);
    text.addEventListener('compositionstart', onCompStart);
    text.addEventListener('compositionend', onCompEnd);
    // 【根因修复·退不出编辑态】失焦即退出：点了便签以外的任何地方（空白画布 / 其它便签 /
    // 卡片纸边）都算「完成编辑」，避免卡在编辑态出不去。
    // 必须在 _exitEdit 里先移除本监听、再 removeAttribute('contenteditable')，
    // 否则移除 contenteditable 触发的 blur 会二次进入 _exitEdit。
    const onBlur = () => {
      // 点工具条按钮导致的失焦不算退出编辑：部分 webview 里 pointerdown.preventDefault
      // 拦不住 blur，一失焦工具条就消失，表现为「点了没反应」。
      if (card._toolPressAt && Date.now() - card._toolPressAt < 500) return;
      ctrl._exitEdit(card);
    };
    card._editBlur = onBlur;
    text.addEventListener('blur', onBlur);
  
  },
  // (was _exitEdit)
  /**
   * 单卡源码视图：把这张卡切成原始 markdown 直接编辑（⌘/ 或工具条 `md` 切换）。
   * 投影表达不了的语法（图片 / 公式 / frontmatter / 项内软换行…）都可以在这里改：
   * 卡上是纯文本节点，写回模型的就是用户看见的那段 md，不做任何「投影 → 语法」的猜测。
   * 只在编辑态有效，退出编辑自动还原成投影。
   */
  toggleSource(ctx, card) {
    const { ctrl } = ctx;
    if (!card || !card.classList.contains('editing')) return false;
    const text = card.querySelector('.tw-card-text');
    const note = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
    if (!text || !note) return false;
    const toSrc = !card._srcMode;
    if (toSrc) {
      // 先按投影序列化一次落盘：进源码看到的必须就是模型里那个 md
      const md = (typeof ctrl._serializeCardText === 'function')
        ? ctrl._serializeCardText(text, note) : note.text;
      if (ctrl._undoStack && !card._editUndoPushed) {
        card._editUndoPushed = true;
        ctrl._undoStack.push();   // 与普通输入同一粒度：一次编辑会话 = 一步
      }
      ctrl._notes = WritingDoc.setText(ctrl._notes, note.id, md);
      card._srcMode = true;
      card.classList.add('tw-src-mode');
      text.textContent = md;     // 纯文本：不解析任何语法，原样呈现
    } else {
      const raw = typeof text.innerText === 'string' ? text.innerText : text.textContent;
      ctrl._notes = WritingDoc.setText(ctrl._notes, note.id, raw);
      card._srcMode = false;
      card.classList.remove('tw-src-mode');
      const fresh = (ctrl._notes || []).find((n) => n.id === note.id);
      if (fresh && typeof ctrl._applyCardText === 'function') ctrl._applyCardText(text, fresh);
      // 源码里可能新增了表格/列表：按新投影重建按钮组，否则「加完表格还是没有行列按钮」
      ensureEditTools(ctrl, card, text);
    }
    // 源码视图里格式/结构按钮没有意义（按投影语义理解会改坏纯文本），只留 `</>` 自己
    const bar = ctrl._editToolsBar;
    if (bar) bar.classList.toggle('tw-src-on', toSrc);
    if (typeof fitCardText === 'function') fitCardText(card);
    if (typeof ctrl._scheduleSave === 'function') ctrl._scheduleSave();
    if (typeof ctrl._invalidateGeo === 'function') ctrl._invalidateGeo(card.dataset.id);
    text.focus();
    try {
      const sel = getSel(text);
      const r = document.createRange();
      r.selectNodeContents(text);
      r.collapse(toSrc);         // 进源码：光标到末尾；回投影：回到开头
      if (sel) { sel.removeAllRanges(); sel.addRange(r); }
      card._caretRange = r.cloneRange();
    } catch (_) { /* 光标定位失败不影响切换 */ }
    return true;
  },
  exitEdit(ctx, card) {
    const { state, ctrl } = ctx;
    if (!card.classList.contains('editing')) return;
    hideTablePicker(ctrl);   // 编辑结束：行列选择器不该留在屏上
    // 输入法还在组字：屏幕上的候选文本尚未上屏，此刻移除 contenteditable 会把它整段丢掉
    // （「打字时明明有字，一退出就没了」）。等 compositionend 再走真正的退出流程。
    if (card._composing) {
      if (card._exitRetryTimer) clearTimeout(card._exitRetryTimer);
      card._exitRetryTimer = setTimeout(() => this.exitEdit(ctx, card), 80);
      return;
    }
    const text = card.querySelector('.tw-card-text');
    const wasSrc = !!card._srcMode;   // 源码视图退出：要还原成投影，别把原始 md 留在卡上
    card._srcMode = false;
    card.classList.remove('tw-src-mode');
    card.classList.remove('editing');
    if (ctrl._editingId === card.dataset.id) ctrl._editingId = null;   // 退出编辑：解除钉屏
    const h = card._editHandlers;
    card._editHandlers = null;
    if (card._exitRetryTimer) { clearTimeout(card._exitRetryTimer); card._exitRetryTimer = null; }
    card._composing = false;
    if (text) {
      if (card._editBlur) { text.removeEventListener('blur', card._editBlur); card._editBlur = null; }
      text.removeAttribute('contenteditable');
      hideEditTools(ctrl);
      if (card._toolFollow) {
        card.removeEventListener('transitionend', card._toolFollow);
        card._toolFollow = null;
      }
      if (card._editSelHandler) {
        const h = card._editSelHandler;
        document.removeEventListener('selectionchange', h.doc);
        text.removeEventListener('pointerup', h.text);
        text.removeEventListener('mouseup', h.doc);
        text.removeEventListener('keyup', h.doc);
        card._editSelHandler = null;
      }
      if (card._toolDocHandler) {
        document.removeEventListener('pointerdown', card._toolDocHandler, true);
        card._toolDocHandler = null;
      }
      card._lastToolEvent = null;
      card._toolPressAt = 0;
      card._editRange = null;
      if (h) {
        text.removeEventListener('input', h.onInput);
        text.removeEventListener('keydown', h.onKey);
        text.removeEventListener('paste', h.onPaste);
        if (h.onBeforeInput) text.removeEventListener('beforeinput', h.onBeforeInput);
        if (h.onCompStart) text.removeEventListener('compositionstart', h.onCompStart);
        if (h.onCompEnd) text.removeEventListener('compositionend', h.onCompEnd);
      }
      // Shadow DOM 下 window.getSelection() 恒为空，清的是另一份选区（等于没清）
      const exitSel = getSel(text);
      if (exitSel) exitSel.removeAllRanges();
      // 与 _handleEditInput 同一口径：只看 dataset.twRich 会漏掉「编辑态里新加的 <strong>/<code>」，
      // 那样退出编辑按 innerText 写回模型，加粗就在落盘那一刻丢了。
      // 源码视图例外：卡上就是原始 md，原样写回，不走序列化（走的话表格/列表会被再套一层语法）。
      const curNote = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
      const richDom = !wasSrc && !!text && (!!text.dataset.twRich
        || !!text.querySelector('strong,em,code,del,s,mark,table,pre,img,.tw-md-list,.tw-task-row,.tw-md-quote'));
      const modelText = wasSrc
        ? ((typeof text.innerText === 'string' ? text.innerText : text.textContent) || '')
        : ((richDom && typeof ctrl._serializeCardText === 'function')
          ? ctrl._serializeCardText(text, curNote)
          : text.innerText);
      ctrl._notes = WritingDoc.setText(ctrl._notes, card.dataset.id, modelText);   // 退出编辑：落盘前同步模型
      card._editUndoPushed = false;   // 编辑会话结束：下次进入编辑重新留档
      ctrl._scheduleSave(); // 落盘：collectNotes 读 _notes 模型（P8 后不再读 DOM），上面已把 innerText 写回模型
      if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
    }
    // 富渲染卡：退出编辑后按最新模型重新投影（勾选框 / 表格），而非残留 raw markdown 文本。
    // 经宿主委托壳走 ViewportCuller 的同一渲染口径，避免交互层再引一份渲染器。
    const upd = (ctrl._notes || []).find((n) => n.id === card.dataset.id);
    const needRich = !!text && (wasSrc || text.dataset.twRich || (upd && upd.level === 'task'));
    if (needRich && upd && typeof ctrl._applyCardText === 'function') {
      ctrl._applyCardText(text, upd);
    }
    ctrl._invalidateGeo(card.dataset.id);   // 编辑可能改变了卡片高度 → 几何失效
    fitCardText(card);                      // 退出编辑再自适应一次：兜住最后一次输入/组字收尾的布局变化

  },
  // (was _pinOnly)
  pinOnly(ctx, card) {
    const { ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    // 取消其它卡片的钉住（不再把任何便签临时置顶；工具条可见性由 CSS `.is-pinned` 驱动）
    Array.from(canvas.querySelectorAll('.tw-card')).forEach((c) => {
      if (c === card) return;
      c.classList.remove('is-pinned');
    });
    if (!card) return;
    card.classList.add('is-pinned');
  },
  // (was _addLink)
  addLink(ctx, fromId, toId) {
    const { state, ctrl } = ctx;
    if (!fromId || !toId || fromId === toId) return false;
    const dup = ctrl._links.some((l) =>
      (l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId));
    if (dup) return false;
    ctrl._links.push({ from: fromId, to: toId, route: 'bezier', bend: 0, dash: 'solid' });
    reseqByLinks(ctrl);   // 顺序真变了（连线定序）→ 重算 seq 并刷徽标
    return true;
  
  },
  // (was _removeLink)
  removeLink(ctx, fromId, toId) {
    const { state, ctrl } = ctx;
    ctrl._links = ctrl._links.filter((l) =>
      !((l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId)));
    // 【连线定序】删连线同样要重算 seq，与 addLink 同一处理（单一实现）
    reseqByLinks(ctrl);
  
  },
  // (was _removeLinksOfData)
  removeLinksOfData(ctx, cardId) {
    const { state, ctrl } = ctx;
    if (!cardId) return;
    ctrl._links = ctrl._links.filter((l) => l.from !== cardId && l.to !== cardId);
    // 【连线定序】级联删线同样重算 seq，与 addLink / removeLink 保持一致（单一实现）
    reseqByLinks(ctrl);
  
  },
  // (was _ensureNotesVisible)
  ensureNotesVisible(ctx) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas || ctrl._fitDone) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    if (!VW || !VH) {
      if (ctrl._fitRo || typeof ResizeObserver === 'undefined') return;
      ctrl._fitRo = new ResizeObserver(() => {
        const r = canvas.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (ctrl._fitRo) { ctrl._fitRo.disconnect(); ctrl._fitRo = null; }
        ctrl._ensureNotesVisible();
      });
      ctrl._fitRo.observe(canvas);
      return;
    }
    ctrl._fitDone = true;
    const cards = Array.from(canvas.querySelectorAll('.tw-card'));
    if (!cards.length) return;
    // 始终按当前视野宽高把便签群居中：侧边栏↔中央 重建后宽度变化，旧偏移不再适配，
    // 必须重新居中（否则便签偏在一侧，需手动双击空白才能归位）。
    // 运行中手动平移因 _fitDone 已置真、本函数不再触发，故视角仍被保留。
    ctrl._recenterNotes();
  
  },
  // (was _recenterNotes)
  recenterNotes(ctx) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    // 【P8 视口剔除】必须按模型真源算包围盒：离屏卡不在 DOM，querySelectorAll 只得到可见卡 → 居中偏掉。
    // 尺寸取几何缓存（已测量），未测量（罕见）回退默认尺寸。
    if (!ctrl._notes || !ctrl._notes.length) { ctrl._setCanvasOffset(0, 0); return; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of ctrl._notes) {
      const x = (typeof n.x === 'number') ? n.x : 0;
      const y = (typeof n.y === 'number') ? n.y : 0;
      const g = ctrl._geo ? ctrl._geo.get(n.id) : null;
      const w = g ? g.w : 340, h = g ? g.h : 200;
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
    }
    const bcx = (minX + maxX) / 2, bcy = (minY + maxY) / 2;
    // 缩放后：可见区宽（画布坐标）= 布局宽 / s。平移量 tx 作用在 scale 之前，
    // 故让包围盒中心落在视口中心的平移量 = 布局宽/2 - s * 中心。
    const s = CanvasViewport.getScale(ctrl);
    ctrl._setCanvasOffset(VW / 2 - s * bcx, VH / 2 - s * bcy);
  
  },
  // (was _arrangeNotes)
  arrangeNotes(ctx) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    // 导图有自己的文档与布局，排版只管便签：导图模式下直接提示，不静默切换模式（更不再丢弃导图）
    if (!ModePolicy.usesCardInteractions(ctrl._mode)) { ctrl._showScreenMsg('先拨回便签画布再排版', 1200); return; }
    const seq = ctrl._orderCards();                        // 全部卡（模型，剔除态完整）
    const selCount = ctrl._selected ? ctrl._selected.size : 0;
    // 只有选中 ≥2 张才「对选中组」排版；选中 0 张或仅 1 张，都按全局排版处理。
    // 选中单张不再报错拒绝：单张排版本身没有意义（只会把它独自拽到网格原点），
    // 而用户在这个状态下点排版，意图多半是「整理整体」，直接排全部更符合预期。
    const selIds = new Set();
    if (selCount >= 2 && ctrl._selected) {
      ctrl._selected.forEach((c) => { const id = c.dataset && c.dataset.id; if (id) selIds.add(id); });
    }
    const target = (selCount >= 2) ? seq.filter((c) => selIds.has(c.id)) : seq;
    if (!target.length) { ctrl._showScreenMsg('无便签可排版', 1000); return; }

    // 一键排版会覆盖用户手工摆好的自由布局（位置即数据），不可逆 ——
    // 必须在任何变更（缩放 / 旋转 / 坐标）之前留档。此处所有提前 return 都已走完。
    if (ctrl._undoStack) ctrl._undoStack.push();
    // 重排即「标准化」：把每张便签的尺寸档位与旋转归零到标准态（S/M/L/XL→M、角度→0），
    // 让网格按统一标准尺寸排布；先复位再量尺寸，列宽/间距才准确。
    // 【P8 视口剔除】挂载卡走 DOM（_applyZoom/_applyRot 会重测几何），离屏卡只改模型，
    // 重挂载时按模型重建 —— 保证全部卡（含离屏）都被标准化、进网格。
    target.forEach((c) => {
      if (c.el) { ctrl._applyZoom(c.el, 1); ctrl._applyRot(c.el, 0); }
      ctrl._notes = WritingDoc.setZoom(ctrl._notes, c.id, 1);
      ctrl._notes = WritingDoc.setRot(ctrl._notes, c.id, 0);
    });

    const GAP = 24;                                       // 统一间距(px)
    const sizes = target.map((c) => {
      const g = ctrl._geo ? ctrl._geo.get(c.id) : null;
      return { w: (g ? g.w : (c.el ? c.el.offsetWidth : 340)) || 340, h: (g ? g.h : (c.el ? c.el.offsetHeight : 200)) || 200 };
    });
    const colW = Math.max(1, ...sizes.map((s) => s.w));   // 等宽网格：列宽取最大卡宽
    // 宽度自适应：按当前画布可用宽推算可容纳列数，窄栏自然落 1 列（竖排），
    // 宽栏在「√n」上限内尽量多列，避免单行铺太长。
    const availW = canvas.clientWidth || (colW + GAP);
    const fitCols = Math.max(1, Math.floor((availW + GAP) / (colW + GAP)));
    const cols = Math.min(fitCols, Math.max(1, Math.ceil(Math.sqrt(target.length))));

    let x = 0, y = 0, rowMaxH = 0;
    target.forEach((c, i) => {
      ctrl._notes = WritingDoc.setPos(ctrl._notes, c.id, x, y);  // 位置即数据：同步模型（含离屏卡）
      if (c.el) { c.el.style.left = x + 'px'; c.el.style.top = y + 'px'; }  // 在屏卡同步 DOM
      rowMaxH = Math.max(rowMaxH, sizes[i].h);
      if ((i + 1) % cols === 0 || i === target.length - 1) {   // 行末 → 换行
        x = 0;
        y += rowMaxH + GAP;
        rowMaxH = 0;
      } else {
        x += colW + GAP;
      }
    });

    ctrl._syncLayoutGeo();                          // 网格位置已改写 → 几何缓存/空间索引同步（否则连线端点指向幽灵位置）
    ctrl._scheduleRenderLinks();                            // 连线端点随位置更新
    ctrl._scheduleSave();                                  // 持久化新位置
    ctrl._scheduleCull();                                  // 网格排版后重算挂载：移出视野的卡卸载

    // 居中到排版后的便签群（按模型网格坐标 + 缓存尺寸算包围盒，含离屏卡）
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    x = 0; y = 0; rowMaxH = 0;
    target.forEach((c, i) => {
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + sizes[i].w); maxY = Math.max(maxY, y + sizes[i].h);
      rowMaxH = Math.max(rowMaxH, sizes[i].h);
      if ((i + 1) % cols === 0 || i === target.length - 1) { x = 0; y += rowMaxH + GAP; rowMaxH = 0; }
      else { x += colW + GAP; }
    });
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    // 【缩放标准化】一键排版即「回归标准态」：当前缩放只要不是 100%（无论放大或缩小，
    // 用户约定「偏离 100% 都算」），排版后把缩放比也拉回 100%。
    // 顺序关键：先 _zoomReset() 把 scale 拉回 1（保持视口中心内容点不动），再按 100% 居中排版后内容。
    // 不可先居中后重置——旧居中公式未乘 scale，在 scale≠1 时会算错位移，_zoomReset 再把错误中心锁死，
    // 导致要再点一次才归位（recenterNotes 的正确写法即居中需乘 s；scale=1 时 *s 等价本公式）。
    if (Math.abs(CanvasViewport.getScale(ctrl) - 1) > 1e-3) ctrl._zoomReset();
    // 此刻 scale=1，居中公式无需乘 s
    ctrl._setCanvasOffset(VW / 2 - (minX + maxX) / 2, VH / 2 - (minY + maxY) / 2);

    // 明确作用范围：单张/未选中时其实动了全部，不说明会让人困惑「我只选了一张，怎么全动了」
    const scope = selCount >= 2 ? '选中的 ' : '全部 ';
    ctrl._showScreenMsg('已排版' + scope + target.length + ' 张便签（尺寸/旋转已归零）', 1200);
  
  },
  // (was _moveCardInOrder)
  moveCardInOrder(ctx, card, dir) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas || ctrl._mode !== 'write') return;
    const seq = ctrl._orderCards();
    const i = seq.findIndex((c) => c.el === card);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= seq.length) {
      ctrl._showScreenMsg(dir < 0 ? '已经是最前面一张' : '已经是最后面一张', 1200);
      return;
    }
    const a = seq[i], b = seq[j];
    if (ctrl._undoStack) ctrl._undoStack.push();
    // 写作档开启视口剔除：相邻卡可能离屏（el === null）。位置即数据 —— 先交换模型坐标（含离屏卡），
    // 在屏卡再同步 DOM；离屏卡交由剔除按新模型坐标挂回，绝不手工搬（原代码直接读 b.style 会空指针崩溃）。
    const next = seq.slice();
    next[i] = seq[j]; next[j] = seq[i];       // 新顺序 = 相邻两位互换（供 _rewireChain 重接整条链）
    // 【顺序一等数据】顺序真值是 seq：坐标已退化为纯呈现，只换坐标不足以改变顺序，
    // 必须显式重写 seq，否则徽标 / 导出 / 预览仍按旧顺序（_orderCards 现按 seq 排序）。
    ctrl._notes = WritingDoc.setOrder(ctrl._notes, next.map((c) => c.id));
    const ax = a.x, ay = a.y, bx = b.x, by = b.y;
    ctrl._notes = WritingDoc.setPos(ctrl._notes, a.id, bx, by);
    ctrl._notes = WritingDoc.setPos(ctrl._notes, b.id, ax, ay);
    if (a.el && b.el) {
      const al = a.el.style.left, at = a.el.style.top;
      a.el.style.left = b.el.style.left; a.el.style.top = b.el.style.top;
      b.el.style.left = al; b.el.style.top = at;
    } else if (a.el) {
      a.el.style.left = bx + 'px'; a.el.style.top = by + 'px';   // a 在屏→搬去 b 的模型坐标
    } else if (b.el) {
      b.el.style.left = ax + 'px'; b.el.style.top = ay + 'px';   // b 在屏→搬去 a 的模型坐标
    }
    ctrl._syncLayoutGeo();                          // 两张卡位置互换 → 几何缓存/空间索引同步（否则连线端点指向幽灵位置）
    ctrl._rewireChain(next);
    ctrl._scheduleRenderLinks();
    ctrl._scheduleSave();
    ctrl._refreshWriteOrder();                // 徽标 + 上移/下移可用态
    ctrl._scheduleCull();                     // 上移/下移后重算挂载
    ctrl._showScreenMsg((dir < 0 ? '已上移到第 ' : '已下移到第 ') + (j + 1) + ' 位', 1400);
  
  },
  // (was _rewireChain)
  rewireChain(ctx, seq) {
    const { state, ctrl } = ctx;
    const L = ctrl._links || [];
    if (L.length < 1 || seq.length < 2) return false;
    const out = new Map(), inn = new Map();
    for (const l of L) {
      out.set(l.from, (out.get(l.from) || 0) + 1);
      inn.set(l.to, (inn.get(l.to) || 0) + 1);
      if (out.get(l.from) > 1 || inn.get(l.to) > 1) return false;   // 有分叉 → 不擅自动
    }
    const route = L[0].route || 'bezier';
    const dash = L[0].dash || 'solid';
    ctrl._links = seq.slice(0, -1).map((c, k) => ({
      from: seq[k].id, to: seq[k + 1].id, route, bend: 0, dash,
    }));
    return true;
  
  },
  // (was _bindOrderSteps)
  bindOrderSteps(ctx, card) {
    const { state, ctrl } = ctx;
    const go = (dir) => (e) => { e.stopPropagation(); ctrl._moveCardInOrder(card, dir); };
    const up = card.querySelector('.tw-card-move-up');
    const dn = card.querySelector('.tw-card-move-down');
    if (up) up.addEventListener('click', go(-1));
    if (dn) dn.addEventListener('click', go(1));
  
  },
};