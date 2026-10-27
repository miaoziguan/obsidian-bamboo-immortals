#!/usr/bin/env node
/**
 * check:release-drift —— 「用户手上的发布物」与「仓库现状」的差距
 *
 * 其余门禁都在判断 HEAD 是否健康，但用户装的是某个 release tag 的资产，
 * 二者不是一回事，而且不是一回事两次：
 *
 *   main.js     ← main.ts + src/      （宿主侧）
 *   webapp.zip  ← webapp/             （视图侧）
 *
 * 两个产物各由自己的源码构建，各自固化在 release 资产里。只跑 HEAD 的
 * preflight，等于对用户实际运行的那份代码一无所知。3.32.5 → HEAD 的实测就是
 * 例子：40 个提交里 29 个动过 webapp/、1 个动过 src/，两个修复都没进发布物。
 *
 * 本脚本只做一件事：把「最新 tag 到 HEAD 的领先量」按两个产物维度摊开，
 * 让「这次改动进不进发布物」在每次提交时可见，而不是发版后才发现。
 *
 * 默认不阻断 —— 领先 tag 是正常开发状态，阻断会把日常提交变成噪音。
 * --strict 供发版流程使用：有领先即 exit 1。
 *
 * 盲区：只统计已提交内容（未提交的工作区改动不参与）；tag 命名不统一时
 * 依赖 git describe 的图可达性判断，若 tag 打在其他分支上会找不到。
 *
 * 用法：
 *   node scripts/check-release-drift.mjs            # 报告，恒 exit 0
 *   node scripts/check-release-drift.mjs --strict   # 有领先即 exit 1
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.argv.includes('--strict');

// 产物 → 构建源。分开统计才能回答「这个修复进没进发布物」。
const ARTIFACTS = [
  { name: 'main.js', paths: ['main.js', 'main.ts', 'src'] },
  { name: 'webapp.zip', paths: ['webapp'] },
];

function tryGit(args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

// 非 git 工作区（打包分发、CI 只给 tar 包）：跳过而非失败
if (tryGit(['rev-parse', '--is-inside-work-tree']) !== 'true') {
  console.log('release-drift: 非 git 工作区，跳过');
  process.exit(0);
}

// 浅克隆（--depth=1）没有 tag，此时无法判断领先量，跳过而非误报
const tag = tryGit(['describe', '--tags', '--abbrev=0', 'HEAD']);
if (!tag) {
  console.log('release-drift: 找不到可达 tag（浅克隆或全新仓库），跳过');
  process.exit(0);
}

const ahead = Number(tryGit(['rev-list', '--count', `${tag}..HEAD`]) ?? 0);
console.log(`release-drift: ${tag} → HEAD`);

if (ahead === 0) {
  console.log('  与最新 tag 一致，发布物即当前 HEAD');
  process.exit(0);
}

console.log(`  领先提交数   ${ahead}`);

const changed = [];
for (const artifact of ARTIFACTS) {
  const count = Number(
    tryGit(['rev-list', '--count', `${tag}..HEAD`, '--', ...artifact.paths]) ?? 0
  );
  if (count === 0) {
    console.log(`  ${artifact.name.padEnd(12)} 未变更`);
    continue;
  }
  const last = tryGit(['log', '--format=%h %s', '-1', `${tag}..HEAD`, '--', ...artifact.paths]);
  changed.push(artifact.name);
  console.log(`  ${artifact.name.padEnd(12)} 已变更 —— ${count} 个提交，最近 ${last}`);
}

if (changed.length > 0) {
  console.log(`  → ${tag} 的发布资产不含上述改动（${changed.join(' / ')}）`);
  console.log('  → 发版前确认哪些修复必须进版；本条只提示，不阻断');
}

if (STRICT) {
  console.error(`\nrelease-drift: --strict 下领先 ${ahead} 个提交，视为未发布`);
  process.exit(1);
}
