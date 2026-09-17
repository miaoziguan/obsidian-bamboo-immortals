#!/bin/bash
# 竹林修仙传 · 构建并部署到主 vault
#
# 只部署一个 vault：仓库同级的 obsidian-vault（即 /Users/pokerhu/Downloads/CJ/obsidian-vault）。
# 曾经的做法是扫描 Documents / Downloads / .nutstore 下所有装了本插件的 vault 批量推送，
# 副作用有三个：每次全量复制 webapp/ 到多处、会把 webapp/ 里的临时文件一起带进别人的仓库、
# 且改了哪一份很难一眼看清。现在只认主 vault；确实需要临时多推一个时显式传第二个参数：
#   ./sync.sh --dev /path/to/other/.obsidian/plugins/bamboo-immortals
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:---prod}"
VAULT_DIR="${2:-$SCRIPT_DIR/../obsidian-vault/.obsidian/plugins/bamboo-immortals}"

cd "$SCRIPT_DIR"

echo "🎋 竹林：类型检查 + 打包 main.js ..."
if [ "$MODE" = "--dev" ]; then
  # 开发模式：不 minify，便于断点 / 读栈
  npx tsc --noEmit -skipLibCheck
  node esbuild.config.mjs
else
  # 生产模式
  npx tsc --noEmit -skipLibCheck
  node esbuild.config.mjs production
fi

echo "🍃 构建 webapp ..."
npm run build:webapp

echo "📦 同步到 vault ..."
mkdir -p "$VAULT_DIR/webapp"
cp main.js "$VAULT_DIR/"
cp manifest.json "$VAULT_DIR/"
cp versions.json "$VAULT_DIR/"
cp styles.css "$VAULT_DIR/"
cp -Rf webapp/. "$VAULT_DIR/webapp/"

# 兜底：把探针页与无头浏览器的临时 profile 挡在仓库外。
# 它们是我调试时留下的东西（_probe*、.shotprofile、.shp3 等），混进 vault 只会让人困惑。
# 模式刻意写窄：只认这些确切的临时名前缀，绝不误删 webapp 里正当的下划线文件。
STRAY=$(cd "$SCRIPT_DIR/webapp" && ls -a | grep -E '^(_probe|_bundle_entry|\.shot|\.hsp|\.hsr|\.hsq|\.shp)' || true)
if [ -n "$STRAY" ]; then
  echo "⚠️  webapp/ 内有临时文件，未同步："
  echo "$STRAY" | sed 's/^/     /'
  while IFS= read -r s; do
    [ -n "$s" ] && rm -rf "$VAULT_DIR/webapp/$s"
  done <<< "$STRAY"
fi

echo "✅ 同步完成 → $VAULT_DIR"
echo "   main.js: $(wc -c < main.js | tr -d ' ') bytes"
echo "   webapp/: $(find webapp -type f | wc -l) files"
