#!/bin/bash
# 竹林修仙传 · 构建并部署到测试 vault
# 说明：A+B 组合的改动全部落在「主机侧」（main.ts 新增 getStrategyOverview +
#       src/ai/goalStats.ts、src/ai/strategyOverview.ts），不涉及 webapp / 样式，
#       因此只需重新打包 main.js 并同步到 vault 插件目录即可。
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

echo "📦 同步到 vault (bamboo-immortals)..."
mkdir -p "$VAULT_DIR"
cp main.js "$VAULT_DIR/"

echo "✅ 同步完成 → $VAULT_DIR"
echo "   main.js: $(wc -c < main.js | tr -d ' ') bytes"
echo "   若改动了 webapp（本次没改），请额外跑 npm run build:webapp 并同步 webapp/ 目录"
