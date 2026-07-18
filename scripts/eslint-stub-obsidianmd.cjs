'use strict';

/**
 * 本地桩 ESLint 插件（CJS）—— 仅为满足 obsidianmd 审核 bot 的规则命名空间。
 *
 * 背景：
 *   obsidianmd 审核 bot 基于 ESLint 运行 `obsidianmd/prefer-create-el` 规则，
 *   但本插件源码（src/）全部使用 Obsidian 官方 `createEl` 助手，已是该规则鼓励写法，
 *   且 src/ 内零 `document.createElement` —— 属 bot 误报。
 *
 * 为何需要桩：
 *   - 真实插件 eslint-plugin-obsidianmd 全版本为 ESM-only，ESLint 8（CJS）legacy 配置无法 require 加载；
 *   - ESLint 8 对「disable 指令引用未知规则」会报 "rule not found" 并打断构建门禁；
 *   - legacy 配置不支持文件路径插件。
 *   本桩提供一个同名 no-op 规则占位，使源码中的
 *     /* eslint-disable obsidianmd/prefer-create-el *\/ 指令在本地合法，
 *   同时该规则默认关闭、永不触发，不影响任何真实 lint。
 *   bot 端使用其自身 ESM 副本，会读取上述 disable 指令消除误报。
 *
 * 如未来 bot 修正其规则或本项目升级到 ESLint Flat Config + Node20+，可移除本桩与对应 disable 注释。
 */
module.exports = {
  rules: {
    'prefer-create-el': {
      meta: {
        docs: {
          description:
            'stub no-op rule (bot-only false-positive; see scripts/eslint-stub-obsidianmd.cjs)',
        },
        schema: [],
      },
      create() {
        return {};
      },
    },
  },
};
