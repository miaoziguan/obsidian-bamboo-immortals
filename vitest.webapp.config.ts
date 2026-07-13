import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['webapp/assets/scripts/tests/**/*.jest.test.js'],
    globals: true,
    setupFiles: ['./test/setup-vitest-webapp.js'],
    dangerouslyIgnoreUnhandledErrors: true,
  },
});
