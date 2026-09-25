import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      // 宿主 TS 依赖 'obsidian'，测试时用内存 mock 替代
      obsidian: path.resolve(__dirname, 'test/mocks/obsidian.ts'),
    },
  },
});
