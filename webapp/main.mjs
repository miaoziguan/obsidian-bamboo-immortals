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
