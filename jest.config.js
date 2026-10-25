/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/webapp/assets/scripts/tests'],
  testMatch: ['**/*.jest.test.js'],
  collectCoverageFrom: [
    'webapp/assets/scripts/**/*.js',
    'src/**/*.ts',
    '!webapp/assets/scripts/tests/**',
    '!webapp/assets/scripts/storage/IndexedDBAdapter.*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  // P0-1：真实覆盖率。两者在 COVERAGE_EVAL!=1 时均为空操作，不改动默认测试行为与 CI。
  // 启用方式：COVERAGE_EVAL=1 npx jest
  setupFilesAfterEnv: ['<rootDir>/webapp/assets/scripts/tests/__helpers__/coverageHook.js'],
  globalTeardown: '<rootDir>/scripts/coverage-report.js',
  transform: {},
  moduleFileExtensions: ['js', 'ts', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
};
