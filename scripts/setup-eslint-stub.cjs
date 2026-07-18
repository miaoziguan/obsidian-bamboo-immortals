'use strict';

/**
 * 将本地桩插件 eslint-plugin-obsidianmd 安装进 node_modules，
 * 使 ESLint 8（CJS）能解析 obsidianmd/* 规则命名空间。
 *
 * 设计为幂等且非致命：拷贝失败仅告警，绝不中断 npm install。
 */
const fs = require('fs');
const path = require('path');

try {
  const repoRoot = path.resolve(__dirname, '..');
  const src = path.join(__dirname, 'eslint-stub-obsidianmd.cjs');
  const destDir = path.join(repoRoot, 'node_modules', 'eslint-plugin-obsidianmd');

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, path.join(destDir, 'index.js'));
  fs.writeFileSync(
    path.join(destDir, 'package.json'),
    JSON.stringify(
      { name: 'eslint-plugin-obsidianmd', version: '0.0.0-stub', main: 'index.js', private: true },
      null,
      2,
    ),
  );
  console.log('[eslint-stub] obsidianmd stub plugin installed into node_modules.');
} catch (e) {
  console.warn('[eslint-stub] skipped (non-fatal):', e && e.message ? e.message : e);
}
