import esbuild from "esbuild";
import process from "process";

const builtinModules = [
  "fs", "path", "os", "http", "https", "net", "crypto", "stream",
  "events", "url", "querystring", "buffer", "child_process", "zlib",
  "util", "assert", "tls", "dns", "readline", "tty", "dgram", "cluster",
  "v8", "vm", "worker_threads", "perf_hooks", "async_hooks", "module",
  "string_decoder", "timers", "domain", "punycode", "process",
];

const prod = process.argv[2] === "production";

esbuild
  .build({
    entryPoints: ["main.ts"],
    bundle: true,
    external: [
      "obsidian",
      "electron",
      "@codemirror/autocomplete",
      "@codemirror/collab",
      "@codemirror/commands",
      "@codemirror/language",
      "@codemirror/lint",
      "@codemirror/search",
      "@codemirror/state",
      "@codemirror/view",
      "@lezer/common",
      "@lezer/highlight",
      "@lezer/lr",
      ...builtinModules,
    ],
    format: "cjs",
    target: "es2020",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
    minify: prod,
  })
  .catch(() => process.exit(1));
