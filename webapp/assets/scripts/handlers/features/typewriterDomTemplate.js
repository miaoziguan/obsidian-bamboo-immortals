import {
  FONT_LABELS, PAPER_LABELS, DEFAULT_FONT, MAX_LEN,
  ICON_LAYERS, ICON_FONT, ICON_GRID, ICON_PRINT,
} from './twConfig.js';

/**
 * 打字机机身 / 画布 / 预览弹窗的**静态 DOM 模板**（P2-6 Round 2）。
 *
 * 从 TypewriterFeature._ensureDom 抽出：原方法 = 「模板（约 65 行）+ 接线」。
 * 模板是纯字符串、无副作用，抽出后可独立测试 —— 其中 26 个元素 id 是**跨模块契约**
 * （CardInteractions / ModeController / MaterialMarket 等按 id 取元素），
 * 用测试锁住可防止重构时改坏 id。
 *
 * 常量由 twConfig 提供；它同时发布到 globalThis，故测试加载器剥离 import 后仍可解析。
 *
 * @returns {string} 机身模板 HTML
 */
export function buildTypewriterDomHtml() {
        return `
      <div class="tw-canvas" id="twCanvas" role="region" aria-label="卡片画布"></div>

      <div class="tw-beeper">
        <div class="tw-case">
          <div class="tw-case-label">
            <span class="tw-dot"></span><span class="tw-brand">竹林中国</span>
            <button type="button" class="tw-theme-switch" id="twThemeSwitch" role="switch" aria-checked="false" aria-label="切换 Obsidian 明暗" title="切换 Obsidian 明暗"><span class="tw-theme-switch-knob" aria-hidden="true"></span></button>
            <button type="button" class="tw-theme-switch" id="twZenSwitch" role="switch" aria-checked="false" aria-label="一键全屏：收起左右侧栏" title="一键全屏：收起左右侧栏"><span class="tw-theme-switch-knob" aria-hidden="true"></span></button>
            <span class="tw-case-right">BAMBOO IMMORTALS</span>
          </div>

          <div class="tw-screen">
            <div class="tw-screen-glare" aria-hidden="true"></div>
            <div class="tw-screen-top">
              <span id="twScreenTitle">凝墨成笺</span>
              <span class="tw-screen-font">
                <span id="twMetaNotes">FONT: <b id="twFontLabel">${FONT_LABELS[DEFAULT_FONT]}</b> · <b id="twPaperLabel">${PAPER_LABELS.plain}</b></span>
                <span id="twMetaWrite" hidden>卡片 <b id="twCardCount">0</b> · 连线 <b id="twLinkCount">0</b></span>
                <span id="twMetaMindmap" hidden>子弹 <b id="twNodeCount">0</b> · 连线 <b id="twDepthCount">0</b></span>
              </span>
            </div>
            <div class="tw-screen-input-wrap">
              <!-- 【P1-2】加 role=status + aria-live：_showScreenMsg 是画中卷全部操作反馈的出口
                   （撤销/重做/排版/换纸/导出…共 44+ 处），此前它只改 textContent，读屏用户
                   完全收不到播报；且本视图不像主视图那样有 sr-announcements 容器。 -->
              <div class="tw-screen-msg" id="twScreenMsg" role="status" aria-live="polite"></div>
              <textarea class="tw-input" id="twInput" maxlength="${HTMLUtils.escapeHtmlAttr(HTMLUtils.num(MAX_LEN))}" placeholder="输入文字打印便签..." spellcheck="false" aria-label="输入文字打印便签"></textarea>
              <span class="tw-cursor" id="twCursor" aria-hidden="true"></span>
            </div>
          </div>

          <div class="tw-controls">
            <div class="tw-keys-left">
              <button type="button" class="tw-rbtn" id="twPaper" title="切换便签样式" aria-label="切换便签样式">${ICON_LAYERS}</button>
              <button type="button" class="tw-rbtn" id="twFont" title="切换字体" aria-label="切换字体">${ICON_FONT}</button>
              <button type="button" class="tw-rbtn" id="twArrange" title="一键排版：便签排网格 / 写作顺流重排 / 导图自动布局（选中≥2张时只排选中组，否则排全部）" aria-label="一键排版画布">${ICON_GRID}</button>
            </div>
            <div class="tw-grill" aria-hidden="true"><i></i><i></i><i></i></div>
            <button type="button" class="tw-print" id="twPrint" title="打印" aria-label="打印">${ICON_PRINT}</button>
          </div>

          <button type="button" class="tw-knob" id="twKnob" data-mode="notes" title="拨动齿轮：便签画布 / MD可视化写作 / 思维子弹" aria-label="切换模式：便签画布 / MD可视化写作 / 思维子弹" aria-pressed="false">
            <span class="tw-knob-wheel" aria-hidden="true">
              <i class="tw-knob-rim"></i>
              <i class="tw-knob-mark"></i>
            </span>
          </button>
        </div>
        <div class="tw-desk-shadow" aria-hidden="true"></div>
      </div>

      <!-- MD可视化写作模式：第一个机身键（#twPaper）打开的「整篇预览」弹窗。
           按连线顺序把卡片合成整篇 Markdown 展示（只读、不落盘），确认结构后再用第二个键导出。
           其余模式不开此弹窗（#twPaper 仍是切纸样/切子弹样式）。 -->
      <div class="tw-preview-modal" id="twPreviewModal" hidden>
        <div class="tw-preview-panel" role="dialog" aria-modal="true" aria-label="整篇预览">
          <div class="tw-preview-head">整篇预览 <span class="tw-preview-stat" id="twPreviewStat"></span></div>
          <p class="tw-preview-hint">按连线顺序合成后的整篇 Markdown（只读，不会改动卡片或落盘）。确认无误后用第二个键导出成文。</p>
          <textarea id="twPreviewBody" class="tw-preview-body" readonly spellcheck="false" aria-label="整篇 Markdown 预览"></textarea>
          <div class="tw-preview-actions">
            <button type="button" id="twPreviewClose" class="tw-preview-btn tw-preview-btn-go">关闭</button>
          </div>
        </div>
      </div>`;
}

// 测试加载器（loadModule）会剥离 import/export，调用方按全局名解析依赖。
if (typeof globalThis !== 'undefined') {
    globalThis.buildTypewriterDomHtml = buildTypewriterDomHtml;
}
