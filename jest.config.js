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
  transform: {},
  moduleFileExtensions: ['js', 'ts', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
};
