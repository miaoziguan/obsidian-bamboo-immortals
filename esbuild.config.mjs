import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";

esbuild
  .build({
    entryPoints: ["main.ts"],
    bundle: true,
    external: [
      "obsidian",
      "fs",
      "path",
      "zlib",
      "https",
      "http",
      "net",
    ],
    format: "cjs",
    target: "es2020",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    outfile: "main.js",
    minify: prod,
  })
  .catch(() => process.exit(1));
