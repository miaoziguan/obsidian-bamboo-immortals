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

// 3. 打包
const outFile = path.join(webappDir, "assets/scripts/bundle.js");
await esbuild.build({
  entryPoints: [entryFile],
  bundle: true,
  outfile: outFile,
  format: "iife",
  target: "es2020",
  logLevel: "info",
  minify: false,
  absWorkingDir: webappDir,
});

// 4. 清理
fs.unlinkSync(entryFile);

const sizeKB = (fs.statSync(outFile).size / 1024).toFixed(1);
console.log(`Bundle: ${modules.length} modules → ${outFile} (${sizeKB}KB)`);
