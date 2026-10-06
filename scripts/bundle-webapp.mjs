import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { wrapGzip } from "./wrap-gzip.mjs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webappDir = path.join(__dirname, "..", "webapp");
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8"));

// 入口清单：index.html → app.html（主日复盘），archive-src.html → archive.html（目标归档独立页），
// scroll-src.html → scroll.html（画中卷），module-src.html → module.html（竹林模块通用宿主）。
// 四者都用同一套「内联 CSS + 内联 bundle（暴露到 window）」自包含流程，
// 确保经 blob URL 加载进 iframe 时无需任何外部相对资源（否则相对脚本/样式在 blob 基址下无法解析）。
const ENTRIES = [
  { html: "index.html", out: "app.html" },
  { html: "archive-src.html", out: "archive.html" },
  { html: "scroll-src.html", out: "scroll.html" },
  { html: "module-src.html", out: "module.html" },
];

async function buildSelfContainedHtml(htmlFile, outFile) {
  const indexPath = path.join(webappDir, htmlFile);
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
    console.error(`未在 ${htmlFile} 中找到任何 <script src>`);
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
  console.log(`Bundle (${htmlFile}): ${modules.length} modules (${sizeKB}KB)`);

  // 5. 生成自包含 HTML（内联 CSS + 用占位符替代外部脚本）
  //    运行时 iframe 只需读取该 HTML 并将占位符替换为 bundle 的 blob URL，
  //    自身不产生任何 <script> 字符串，避免被安全扫描误判为「动态注入脚本」。
  let appHtml = html;

  // 5a. 内联 CSS：<link rel="stylesheet" href="x.css"> → <style>...</style>
  //     同时将 CSS 中的相对图片引用（url('../images/xxx')）转为 base64 data URI，
  //     因为最终 HTML 以 blob URL 加载，相对路径在 blob 上下文中无法解析。
  //     内联后再做一次 CSS 压缩（见下方统计输出）。
  const cssStats = { files: 0, raw: 0, min: 0 };
  appHtml = appHtml.replace(/<link\b[^>]*?rel=["']stylesheet["'][^>]*?>/gi, (tag) => {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) return tag;
    const href = hrefMatch[1];
    // 跳过外部 URL（如 Google Fonts），原样保留，交由 webview 运行时加载
    if (href.startsWith("http://") || href.startsWith("https://")) return tag;
    const clean = href.split("?")[0].replace(/^\.\//, "");
    const cssPath = path.join(webappDir, clean);
    try {
      let css = fs.readFileSync(cssPath, "utf-8");
      // 将 url('../images/xxx') 转为 base64 data URI
      css = css.replace(/url\(['"]\.\.\/images\/([^'")]+)['"]\)/g, (_match, imgFile) => {
        const imgFullPath = path.join(webappDir, 'assets', 'images', imgFile);
        try {
          const imgBuf = fs.readFileSync(imgFullPath);
          const ext = path.extname(imgFile).slice(1).toLowerCase();
          const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', gif: 'image/gif', webp: 'image/webp' };
          const mime = mimeMap[ext] || 'application/octet-stream';
          const b64 = imgBuf.toString('base64');
          return `url("data:${mime};base64,${b64}")`;
        } catch (e) {
          console.warn(`[bundle] 无法内联图片: ${imgFullPath} (${e.message})`);
          return _match; // 保留原路径作为降级
        }
      });
      // 【内联 CSS 压缩】此前样式是**原样**内联的（注释、缩进、换行全在），而它才是各入口
      // 体积的大头（实测 app / archive / scroll / module 分别省 32% / 32% / 40% / 45%）。
      // 压缩只去掉空白与注释、不改动任何语义 —— 视觉零风险。
      // 收益不止是产物变小：原始 HTML 变小后 app / archive 的 gzip 包装产物也更小，
      // 且 scroll.html 会远离 900KB 的包装阈值（不必再担心加几 KB 样式就触发包装）。
      cssStats.files += 1;
      cssStats.raw += Buffer.byteLength(css, "utf-8");
      try {
        const minified = esbuild.transformSync(css, { loader: "css", minify: true });
        if (minified && typeof minified.code === "string" && minified.code.length > 0) {
          css = minified.code;
        }
      } catch (minErr) {
        // 压缩失败不应阻断构建：回退原始样式，产物依旧可用（只是没省到体积）。
        console.warn(`[bundle] CSS 压缩失败，回退原始样式: ${clean} (${minErr.message})`);
      }
      cssStats.min += Buffer.byteLength(css, "utf-8");
      return `<style data-src="${clean}">\n${css}\n</style>`;
    } catch (e) {
      console.warn(`[bundle] 无法内联 CSS: ${cssPath} (${e.message})`);
      return tag;
    }
  });

  if (cssStats.files > 0) {
    const saved = cssStats.raw - cssStats.min;
    console.log(
      `  ↳ 内联 CSS 压缩: ${cssStats.files} 个文件 ${(cssStats.raw / 1024).toFixed(0)}KB → ` +
        `${(cssStats.min / 1024).toFixed(0)}KB (-${(saved / 1024).toFixed(0)}KB, ` +
        `${((saved / cssStats.raw) * 100).toFixed(1)}%)`
    );
  }

  // 5b. 移除所有外部 <script src>...</script> 完整配对标签（含闭标签，修复原只删开标签导致
  //     残留大量孤立 </script> 的畸形问题）
  const scriptPairRegex = /<script\b[^>]*?src=["'][^"']+["'][^>]*?>\s*<\/script>/gi;
  const firstMatch = scriptPairRegex.exec(appHtml);
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

  // R1 gzip 瘦身：把自包含 HTML 压成极小 loader，
  // 让 iframe 的 data: URL 体积稳定 < 2MB（绕开 blob: 在 ArkWeb 上被拦）。
  //
  // 【判定改为「压缩后是否明显更小」而非固定阈值】
  // 原实现是 `rawBytes > 900KB` 才压缩。内联 CSS 压缩上线后出现了倒挂：
  // archive 的原始体积由 1130KB 降到 865KB，恰好跌破阈值 → 不再压缩 →
  // 产物反而从 345KB 涨到 865KB（体积变小却让交付变大）。
  // 用「压缩收益」判定可自校正：CSS/JS 体积再怎么漂移，都只会取更小的那一种交付。
  // 下限 200KB：小入口（如 module.html 87KB）不值得为此付一次运行时解压。
  const rawBytes = Buffer.byteLength(appHtml, "utf-8");
  if (rawBytes > 200 * 1024) {
    const wrapped = wrapGzip(appHtml);
    const wrappedBytes = Buffer.byteLength(wrapped, "utf-8");
    // 至少省 32KB 才值这一次 DecompressionStream 解压
    if (wrappedBytes + 32 * 1024 < rawBytes) {
      appHtml = wrapped;
      console.log(
        `  ↳ R1 gzip 包装: ${(rawBytes / 1024).toFixed(0)}KB → loader ${(wrappedBytes / 1024).toFixed(0)}KB ` +
        `(运行时 DecompressionStream 解压还原，data: URL 稳 < 2MB)`
      );
    }
  }

  const appOutFile = path.join(webappDir, outFile);
  fs.writeFileSync(appOutFile, appHtml);
  const openCount = (appHtml.match(/<script\b/gi) || []).length;
  const closeCount = (appHtml.match(/<\/script>/gi) || []).length;
  console.log(`App HTML (${outFile}): 自包含 → ${appOutFile} (含内联 CSS + 内联 bundle, <script>=${openCount}, </script>=${closeCount})`);
}

for (const entry of ENTRIES) {
  await buildSelfContainedHtml(entry.html, entry.out);
}

// 6. 写入版本戳：运行时 AppHost 据其对 webapp 做版本守卫（版本不符则重新自举下载）。
//    该文件位于 webapp/ 下，会被 release.yml 的 `zip -r webapp.zip .` 一并打包进
//    webapp.zip，解压后自动落盘。
const versionStampFile = path.join(webappDir, ".webapp-version");
fs.writeFileSync(versionStampFile, String(pkg.version));
console.log(`Webapp version stamp → ${versionStampFile} (v${pkg.version})`);
