#!/bin/bash
# 发布脚本：bump patch 版本号 → 更新 versions.json → 执行 sync.sh 同步
# 用法：./release.sh            # 自动 patch +1 (2.0.5 -> 2.0.6)
#       ./release.sh 2.1.0     # 指定版本号
set -e

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
MANIFEST="$SRC_DIR/manifest.json"
VERSIONS="$SRC_DIR/versions.json"

bump_patch() {
  # 读取当前版本 x.y.z，patch +1
  local v
  v=$(grep '"version"' "$MANIFEST" | sed 's/.*"\([0-9.]*\)".*/\1/')
  local major minor patch
  IFS='.' read -r major minor patch <<< "$v"
  patch=$((patch + 1))
  echo "$major.$minor.$patch"
}

if [ -n "$1" ]; then
  NEW_VERSION="$1"
else
  NEW_VERSION=$(bump_patch)
fi

# 校验版本号格式
if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "❌ 版本号格式非法: $NEW_VERSION（应为 x.y.z）"
  exit 1
fi

CURRENT_VERSION=$(grep '"version"' "$MANIFEST" | sed 's/.*"\([0-9.]*\)".*/\1/')
if [ "$NEW_VERSION" = "$CURRENT_VERSION" ]; then
  echo "⚠️  版本号未变化 ($NEW_VERSION)，仍继续同步。"
fi

# 读取 minAppVersion（保持兼容）
MIN_APP=$(grep '"minAppVersion"' "$MANIFEST" | sed 's/.*"\([0-9.]*\)".*/\1/')

# 1. 更新 manifest.json 版本号
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MANIFEST"
else
  sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MANIFEST"
fi
echo "📌 manifest.json: $CURRENT_VERSION -> $NEW_VERSION (minAppVersion $MIN_APP)"

# 1b. 同步 package.json 版本号（CI 版本一致性守卫要求 package.json == manifest.json）
if [ -f "$SRC_DIR/package.json" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$SRC_DIR/package.json"
  else
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$SRC_DIR/package.json"
  fi
  echo "   ✓ package.json: $CURRENT_VERSION -> $NEW_VERSION"
fi

# 2. 追加 versions.json 映射（键=插件版本，值=minAppVersion）；已存在则跳过
if grep -q "\"$NEW_VERSION\"" "$VERSIONS"; then
  echo "   ⚠️  versions.json 已含 $NEW_VERSION，跳过追加"
else
  # 在最后一个 } 前插入新条目
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' '$ s/}$/,\n  "'"$NEW_VERSION"'": "'"$MIN_APP"'"\n}/' "$VERSIONS"
  else
    sed -i '$ s/}$/,\n  "'"$NEW_VERSION"'": "'"$MIN_APP"'"\n}/' "$VERSIONS"
  fi
  echo "   ✓ versions.json 追加 \"$NEW_VERSION\": \"$MIN_APP\""
fi

# 3. 执行同步
echo ""
exec "$SRC_DIR/sync.sh"
