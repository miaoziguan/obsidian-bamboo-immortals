import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webappDir = path.join(__dirname, "..", "webapp");
const indexPath = path.join(webappDir, "index.html");

// 1. 从 index.html 自动提取所有 <script src="..."> 的路径（保持原始加载顺序）
const html = fs.readFileSync(indexPath, "utf-8");
const scriptRegex = /<script\s+[^>]*?src=["']([^"']+)["'][^>]*?>/gi;
const modules = [];
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const src = match[1];
  // 跳过外部 URL、非本地脚本
  if (!src || src.startsWith("http://") || src.startsWith("https://")) continue;
  // 去掉 ?__BUILD__ 查询参数，去掉 ./ 前缀
  let clean = src.split("?")[0].replace(/^\.\//, "");
  // 确保路径相对于 webapp 目录
  if (!clean.startsWith("assets/scripts/")) continue;
  modules.push(clean);
}

if (modules.length === 0) {
  console.error("未在 index.html 中找到任何 <script src>");
  process.exit(1);
}

// 2. 生成入口文件
const modVars = modules.map((_, i) => `_m${i}`).join(", ");
const imports = modules
  .map((m, i) => `import * as _m${i} from "./${m}";`)
  .join("\n");

const entryFile = path.join(webappDir, "_bundle_entry.js");
const entryContent = [
  imports,
  "",
  "// 将所有模块导出暴露到 window",
  "[" + modVars + "].forEach(function(mod) {",
  "  Object.keys(mod).forEach(function(key) { window[key] = mod[key]; });",
  "});",
  "",
  "window.__WEBAPP_BUNDLE_READY = true;",
].join("\n");

fs.writeFileSync(entryFile, entryContent);

// 3. 打包（不落盘，直接取产物字符串用于内联）
const bundleResult = await esbuild.build({
  entryPoints: [entryFile],
  bundle: true,
  write: false,
  format: "iife",
  target: "es2020",
  logLevel: "info",
  minify: true,
  absWorkingDir: webappDir,
});

// 4. 清理临时入口
fs.unlinkSync(entryFile);

const bundleOut =
  bundleResult.outputFiles.find((f) => f.path.endsWith("bundle.js")) ||
  bundleResult.outputFiles[0];
const bundleCode = bundleOut.text;
const sizeKB = (Buffer.byteLength(bundleCode, "utf-8") / 1024).toFixed(1);
console.log(`Bundle: ${modules.length} modules (${sizeKB}KB)`);

// 5. 生成自包含 app.html（内联 CSS + 用占位符替代外部脚本）
//    运行时 AppHost 只需读取 app.html 并将占位符替换为 bundle 的 blob URL，
//    自身不产生任何 <script> 字符串，避免被安全扫描误判为「动态注入脚本」。
let appHtml = html;

// 5a. 内联 CSS：<link rel="stylesheet" href="x.css"> → <style>...</style>
appHtml = appHtml.replace(/<link\b[^>]*?rel=["']stylesheet["'][^>]*?>/gi, (tag) => {
  const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
  if (!hrefMatch) return tag;
  const href = hrefMatch[1];
  const clean = href.split("?")[0].replace(/^\.\//, "");
  const cssPath = path.join(webappDir, clean);
  try {
    const css = fs.readFileSync(cssPath, "utf-8");
    return `<style data-src="${clean}">\n${css}\n</style>`;
  } catch (e) {
    console.warn(`[bundle] 无法内联 CSS: ${cssPath} (${e.message})`);
    return tag;
  }
});

// 5b. 移除所有外部 <script src>...</script> 完整配对标签（含闭标签，修复原只删开标签导致
//     残留大量孤立 </script> 的畸形问题）
const scriptPairRegex = /<script\b[^>]*?src=["'][^"']+["'][^>]*?>\s*<\/script>/gi;
let firstMatch = scriptPairRegex.exec(appHtml);
const firstIndex = firstMatch ? firstMatch.index : -1;
appHtml = appHtml.replace(scriptPairRegex, "");

// 5c. 在首个外部脚本原位置内联 bundle（构建期完成，运行时不再拼接任何 <script>）。
//     内联为静态 <script type="module">，非运行时动态创建，规避安全扫描误报。
//     对 </script> 做转义，避免 bundle 内容中的该串提前闭合标签。
if (firstIndex >= 0) {
  const escaped = bundleCode.replace(/<\/script/gi, "<\\/script");
  const bundleTag = `<script type="module">\n${escaped}\n</script>`;
  appHtml = appHtml.slice(0, firstIndex) + bundleTag + appHtml.slice(firstIndex);
}

const appOutFile = path.join(webappDir, "app.html");
fs.writeFileSync(appOutFile, appHtml);
const openCount = (appHtml.match(/<script\b/gi) || []).length;
const closeCount = (appHtml.match(/<\/script>/gi) || []).length;
console.log(`App HTML: 自包含 → ${appOutFile} (含内联 CSS + 内联 bundle, <script>=${openCount}, </script>=${closeCount})`);
