import { defineConfig } from 'vitest/config';
import path from 'path';

// 配置随工具链迁入 dev/，root 指向仓库根；include / alias 相对 dev/ 需加 ../
export default defineConfig({
  root: path.resolve(__dirname, '..'),
  test: {
    environment: 'node',
    // include 相对 root（已设为仓库根），故用 src/** 而非 ../src
    include: ['src/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    // 工具链在 dev/，让 Vite 也能从 dev/node_modules 解析 dev-only 裸导入（如 yaml）
    modules: [path.resolve(__dirname, '..', 'dev', 'node_modules'), 'node_modules'],
    alias: {
      // 宿主 TS 依赖 'obsidian'，测试时用内存 mock 替代
      obsidian: path.resolve(__dirname, '../test/mocks/obsidian.ts'),
      // yaml 仅在 dev/ 工具链中，显式指向 dev/node_modules 以通过 Vite 解析
      yaml: path.resolve(__dirname, '..', 'dev', 'node_modules', 'yaml'),
    },
  },
});
