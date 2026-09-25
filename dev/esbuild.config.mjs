import esbuild from "esbuild";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
// 本脚本随工具链迁入 dev/（ESM，无 __dirname），用 import.meta.url 推算仓库根（dev/.. = 仓库根）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const prod = process.argv[2] === "production";

esbuild
  .build({
    entryPoints: [path.join(ROOT, "main.ts")],
    bundle: true,
    external: [
      "obsidian",
      "tls",
      "net",
    ],
    format: "cjs",
    target: "es2020",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    outfile: path.join(ROOT, "main.js"),
    minify: prod,
  })
  .catch(() => process.exit(1));
