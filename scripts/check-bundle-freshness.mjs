/**
 * 产物新鲜度门禁（bundle freshness）：产物必须含有关键实现的痕迹。
 *
 * 为什么需要它：本仓产物由人工触发构建，源码与产物之间没有强制对应关系。
 * 实证：7116613c（2026-10-27）—— 上一个提交的 main.js 是在 VaultStorage.ts 处于
 * 「手动回退版」时构建的，缺失 quarantineCorruptFile / readJsonFile，也就是
 * 「损坏文件隔离留档」这个防数据丢失的机制从产物中消失了，而发现方式是人工。
 * 当时 preflight 全绿：所有闸门看的都是源码，没有一个看产物。
 *
 * 做法：维护「必须出现在产物中的字符串字面量」清单，缺失即失败。
 *
 * 为什么只查字面量、不查函数名（重要，踩过）：esbuild 会 minify 重命名标识符，
 * 函数名 / 局部变量名在产物里根本不存在，选它们会恒红或恒绿地骗人。
 * 字符串字面量、对象键、模板字符串片段会被保留，所以清单只收这一类。
 * 同理：中文会被 charset=ascii 转成大写 \uXXXX 转义，故清单只用 ASCII。
 *
 * 盲区（宁可漏报，不误伤）：
 * - 只证明「这段逻辑进了包」，不证明「它逻辑正确」——后者归测试管
 * - webapp 的 *.html 是 gzip+base64 内联载荷，需解压后检索；解压失败则退回原文，
 *   此时可能漏报，但不会误报成「实现缺失」
 * - 不做版本号比对（那是 check-release-drift 的职责）
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 产物 → 必须出现的字面量。每条都要能回答「它消失了我怎么知道」。
 */
const EXPECT = {
  'main.js': [
    // quarantineCorruptFile 的路径模板 `${path}.corrupt-${stamp}`：损坏文件隔离留档。
    // 它曾从产物中消失过一次（7116613c），后果是防数据丢失机制静默失效且无人察觉。
    '.corrupt-',
    // app:ready 版本协商读取的 payload 键。曾长期「定义了但没人读」，是装饰品。
    'protocolVersion',
  ],
  'webapp/app.html': [
    'protocolVersion',
    // 协议注册表的补登记项（曾 8 个类型两边都漏登）；兼作「webapp 产物确实重建过」的探针
    'app:revealed',
  ],
  'webapp/scroll.html': ['protocolVersion'],
  'webapp/archive.html': ['protocolVersion'],
};

/** 取出产物的可检索文本：自包含 HTML 先解 gz 内联载荷 */
function readableText(rel) {
  const raw = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const m = raw.match(/id="__bamboo_gz"[^>]*>([^<]+)</);
  if (!m) return raw;
  try {
    return zlib.gunzipSync(Buffer.from(m[1], 'base64')).toString('utf8');
  } catch {
    return raw;
  }
}

const failures = [];
for (const [rel, needles] of Object.entries(EXPECT)) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel} —— 产物不存在`);
    continue;
  }
  const text = readableText(rel);
  const missing = needles.filter((n) => !text.includes(n));
  if (missing.length) failures.push(`${rel} —— 缺失 ${missing.join(', ')}`);
}

if (failures.length) {
  console.error('[bundle-freshness] ❌ 产物与源码不一致：关键实现未进产物。');
  for (const f of failures) console.error(`  ${f}`);
  console.error('  修复：重新构建（npm run build / ./sync.sh）后再提交产物。');
  process.exit(1);
}

const total = Object.values(EXPECT).reduce((n, a) => n + a.length, 0);
console.log(
  `[bundle-freshness] ✅ ${Object.keys(EXPECT).length} 个产物的 ${total} 项关键实现痕迹齐全。`,
);
