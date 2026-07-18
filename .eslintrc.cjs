/**
 * ESLint 配置（方案 B：补充宿主 TS 的 lint 缺口）
 *
 * 设计原则：
 *  - 生产代码（src 下非测试 .ts）严格约束，重点锁死 any 回潮 / 未用变量 / console 泄漏
 *  - 测试文件（*.test.ts）放宽：mock 与断言中 `as any` 是合理写法，不应被 no-explicit-any 刁难
 *  - 已收窄的 Obsidian API 边界（as unknown as / as AnyBridgeMessage）不触发 no-explicit-any，无需豁免
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'obsidianmd'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    browser: true,
    es2020: true,
  },
  ignorePatterns: [
    'main.js',        // esbuild 产物
    'node_modules/',
    'webapp/',        // 预编译前端，独立工具链
    'coverage/',
    'test/',          // 测试 mock 与基础设施，不约束 any/console
    'scripts/',       // 构建工具链（CSS 作用域化等），不参与应用 lint
    'src/host/webappAssets.generated.ts', // 自动生成的大文件，不参与 lint
    '*.config.js',
    '*.config.mjs',
  ],
  overrides: [
    {
      // 生产代码：严格
      files: ['src/**/*.ts'],
      excludedFiles: ['src/**/*.test.ts', 'src/**/__tests__/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/no-non-null-assertion': 'warn',
        'no-console': 'warn',
        'no-debugger': 'error',
      },
    },
    {
      // 测试代码：放宽 any（mock / 断言需要）
      files: ['src/**/*.test.ts', 'src/**/__tests__/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-console': 'off',
      },
    },
  ],
};
