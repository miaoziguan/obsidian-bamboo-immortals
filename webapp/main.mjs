/**
 * bamboo-daily-review ES 模块入口
 * 
 * 提供命名空间化的模块导入接口。传统脚本（<script> 标签）仍照常工作，
 * 新代码或测试可以通过 import 使用此入口。
 * 
 * 用法：
 *   import { CONSTANTS, formatDate, Store } from './main.mjs';
 */

// 工具层
export {
    CONSTANTS, LucideUtils, EventBus,
    scrollToSection, formatDate, getChineseDateDisplay, getChineseWeekday,
    debounce, throttle, createElement, $, $$, parseTime, calculateCheckInTimes,
    HTML, Toast, ModalStack, PanelManager, ActionDispatcher, ConfirmDialog,
    PopupPositioner, CULTIVATION_DATA,
} from './assets/scripts/utils/index.mjs';

// 状态层
export {
    Store, DataValidator, DATA_VERSION, DEFAULT_DATA, createEmptyDayData,
} from './assets/scripts/state/index.mjs';

// 统一命名空间（H14 解决方案）
window.BambooUtils = {
    CONSTANTS: window.CONSTANTS,
    LucideUtils: window.LucideUtils,
    EventBus: window.EventBus,
    formatDate: window.formatDate,
    getChineseDateDisplay: window.getChineseDateDisplay,
    getChineseWeekday: window.getChineseWeekday,
    debounce: window.debounce,
    throttle: window.throttle,
    createElement: window.createElement,
    $: window.$,
    $$: window.$$,
    parseTime: window.parseTime,
    calculateCheckInTimes: window.calculateCheckInTimes,
    HTML: window.HTML,
    Toast: window.Toast,
    ModalStack: window.ModalStack,
    PanelManager: window.PanelManager,
    ActionDispatcher: window.ActionDispatcher,
    ConfirmDialog: window.ConfirmDialog,
    PopupPositioner: window.PopupPositioner,
    CULTIVATION_DATA: window.CULTIVATION_DATA,
    Store: window.Store,
    DataValidator: window.DataValidator,
    DATA_VERSION: window.DATA_VERSION,
    DEFAULT_DATA: window.DEFAULT_DATA,
    createEmptyDayData: window.createEmptyDayData,
};
