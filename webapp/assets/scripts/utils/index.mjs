/**
 * 工具层 barrel 模块
 * 
 * 由于 ES 模块与普通 script 标签的加载时序差异，此处通过 window 全局
 * 桥接现有传统脚本暴露的对象，提供类型安全的 ES 模块导入接口。
 * 
 * 待全部文件迁移至 ES 模块后，每个文件直接 export，此处可改为 re-export。
 */

// 传统脚本已设置 window.CONSTANTS
export const CONSTANTS = window.CONSTANTS;

// LucideUtils
export const LucideUtils = window.LucideUtils;

// EventBus
export const EventBus = window.EventBus;

// Helpers（通过 window 全局访问）
export const scrollToSection = window.scrollToSection;
export const formatDate = window.formatDate;
export const getChineseDateDisplay = window.getChineseDateDisplay;
export const getChineseWeekday = window.getChineseWeekday;
export const debounce = window.debounce;
export const throttle = window.throttle;
export const createElement = window.createElement;
export const $ = window.$;
export const $$ = window.$$;
export const parseTime = window.parseTime;
export const calculateCheckInTimes = window.calculateCheckInTimes;

// 其他工具模块
export const HTML = window.HTML;
export const Toast = window.Toast;
export const ModalStack = window.ModalStack;
export const PanelManager = window.PanelManager;
export const ActionDispatcher = window.ActionDispatcher;
export const ConfirmDialog = window.ConfirmDialog;
export const PopupPositioner = window.PopupPositioner;

// 常量/数据
export const CULTIVATION_DATA = window.CULTIVATION_DATA;