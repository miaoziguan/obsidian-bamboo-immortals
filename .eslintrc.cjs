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
  plugins: ['@typescript-eslint'],
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
      // 类型感知 lint：仅在 src 下开启（根配置如 vitest.config.ts 不在 tsconfig 内，
      // 回落到「无 project」模式，类型感知规则静默跳过，避免报「文件不在 project 中」）。
      // 开启后 no-unsafe-assignment 等类型感知规则才真正生效（这才是 OB 审核拦 no-unsafe-assignment 的机制）。
      files: ['src/**/*.ts'],
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
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
        // 类型感知规则（需 parserOptions.project，已在下方 src override 开启）。
        // 它们不在 @typescript-eslint/recommended 内，必须显式启用——这正是 OB 官方审核系统
        // 拦 no-unsafe-assignment 的机制；启用后可挡住 any 从 Obsidian API 边界回潮。
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        // Obsidian 弹窗（popout window）是独立浏览器窗口，裸全局定时器会解析错位；官方审核系统据此判 Warning。
        // 用内置 no-restricted-globals 禁用裸 setTimeout/clearTimeout/setInterval/clearInterval，
        // 强制写 window. 前缀（成员访问不会被误伤，接口方法签名/类方法实现也非全局引用）。
        'no-restricted-globals': [
          'error',
          {
            name: 'setTimeout',
            message:
              "Use 'window.setTimeout()' instead of 'setTimeout()' for popout window compatibility.",
          },
          {
            name: 'clearTimeout',
            message:
              "Use 'window.clearTimeout()' instead of 'clearTimeout()' for popout window compatibility.",
          },
          {
            name: 'setInterval',
            message:
              "Use 'window.setInterval()' instead of 'setInterval()' for popout window compatibility.",
          },
          {
            name: 'clearInterval',
            message:
              "Use 'window.clearInterval()' instead of 'clearInterval()' for popout window compatibility.",
          },
        ],
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
