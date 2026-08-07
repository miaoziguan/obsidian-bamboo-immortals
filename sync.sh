#!/bin/bash
# 竹林修仙传 · 构建并部署到测试 vault
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VAULT_DIR="$SCRIPT_DIR/../obsidian-vault/.obsidian/plugins/bamboo-immortals"

MODE="${1:---prod}"
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

echo "📦 同步到 vault (bamboo-immortals)..."
mkdir -p "$VAULT_DIR"
cp main.js "$VAULT_DIR/"
cp manifest.json "$VAULT_DIR/"
cp versions.json "$VAULT_DIR/"
rm -rf "$VAULT_DIR/webapp"
cp -R webapp "$VAULT_DIR/webapp"

echo "✅ 同步完成 → $VAULT_DIR"
echo "   main.js: $(wc -c < main.js | tr -d ' ') bytes"
echo "   webapp/: $(find webapp -type f | wc -l) files"
