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

echo "📦 同步到所有已安装本插件的 vault..."
# 主目标（历史默认）：仓库同级 obsidian-vault
TARGETS=("$VAULT_DIR")

add_target() {
  local dir="$1"
  for t in "${TARGETS[@]}"; do
    [ "$t" = "$dir" ] && return
  done
  TARGETS+=("$dir")
}

# 自动发现本机其它 vault 中的插件副本。
# 注意：在沙箱/受限进程里，直接 `find /Users/pokerhu` 可能无法遍历某些子目录
#（如 Documents/黑曜石、.nutstore），所以改为对常见父目录分别搜索再合并。
VAULT_PARENTS=(/Users/pokerhu/Documents /Users/pokerhu/Downloads /Users/pokerhu/.nutstore)
for parent in "${VAULT_PARENTS[@]}"; do
  if [ -d "$parent" ]; then
    while IFS= read -r d; do
      [ -n "$d" ] && add_target "$d"
    done < <(find "$parent" -type d -name bamboo-immortals -path '*plugins*' 2>/dev/null)
  fi
done

for DIR in "${TARGETS[@]}"; do
  mkdir -p "$DIR"
  mkdir -p "$DIR/webapp"
  cp main.js "$DIR/"
  cp manifest.json "$DIR/"
  cp versions.json "$DIR/"
  cp styles.css "$DIR/"
  cp -Rf webapp/. "$DIR/webapp/"
  echo "   → $DIR"
done

echo "✅ 同步完成 → ${#TARGETS[@]} 个 vault"
echo "   main.js: $(wc -c < main.js | tr -d ' ') bytes"
echo "   webapp/: $(find webapp -type f | wc -l) files"
