/** @type {import('jest').Config} */
const path = require('path');
module.exports = {
  // 配置随工具链迁入 dev/，rootDir 指向仓库根，并让模块解析包含 dev/node_modules
  rootDir: '..',
  modulePaths: [path.resolve(__dirname, 'node_modules')],
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
  transform: {},
  moduleFileExtensions: ['js', 'ts', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
};
