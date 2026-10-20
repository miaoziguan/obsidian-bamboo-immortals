#!/bin/bash
# 竹林修仙传 · 一键发版
#
# 完整流程（与社区插件/BRAT 的要求对齐）：
#   bump 版本号(manifest/package.json/versions.json)
#   → 全量构建(含 lint / html-escape 校验 + 打包 main.js + webapp)
#   → 提交  → 打 tag(不带 v 前缀)  → 推送 main + tag
#   → 建 GitHub Release 并挂 main.js / manifest.json / styles.css
#   → (可选)同步到本地 vault 便于本机测试
#
# ⚠️ 关键点：Obsidian 是从「GitHub Release(同名 tag, 不带 v)」下载资产来安装插件的，
#    只打 git tag 不够 —— 必须建 Release 并附 main.js/manifest.json/styles.css，
#    否则社区市场/BRAT 会报 “manifest points at a version without a matching release”。
#
# 用法：
#   ./release.sh              # 自动 patch +1（3.28.21 -> 3.28.22）并执行完整发版
#   ./release.sh 3.29.0       # 指定版本号（minor/major 自己给）
#   ./release.sh --no-sync    # 发版但不同步到本地 vault
#   ./release.sh --dry-run    # 只做本地准备(改版本/构建/提交/tag)，不推送、不建 Release
#
# 安全守卫：必须在 main 分支、且已安装并登录 gh CLI。
set -euo pipefail

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
MANIFEST="$SRC_DIR/manifest.json"
VERSIONS="$SRC_DIR/versions.json"

NO_SYNC=0
DRY_RUN=0
EXPLICIT_VER=""
for a in "$@"; do
  case "$a" in
    --no-sync) NO_SYNC=1 ;;
    --dry-run) DRY_RUN=1 ;;
    *) EXPLICIT_VER="$a" ;;
  esac
done

cd "$SRC_DIR"

# —— 守卫 ——
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "❌ 请在 main 分支发版（当前: $BRANCH）"; exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ 未检测到 gh CLI，无法创建 GitHub Release"; exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "❌ gh 未登录，请先 'gh auth login'"; exit 1
fi

bump_patch() {
  local v
  v=$(grep '"version"' "$MANIFEST" | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/')
  local major minor patch
  IFS='.' read -r major minor patch <<< "$v"
  patch=$((patch + 1))
  echo "$major.$minor.$patch"
}

if [ -n "$EXPLICIT_VER" ]; then
  NEW_VERSION="$EXPLICIT_VER"
else
  NEW_VERSION=$(bump_patch)
fi

if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "❌ 版本号格式非法: $NEW_VERSION（应为 x.y.z）"; exit 1
fi

CURRENT_VERSION=$(grep '"version"' "$MANIFEST" | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/')
MIN_APP=$(grep '"minAppVersion"' "$MANIFEST" | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/')

echo "📌 版本: $CURRENT_VERSION -> $NEW_VERSION (minAppVersion $MIN_APP)"

# 1. manifest.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MANIFEST"
echo "   ✓ manifest.json"
# 1b. package.json（CI 守卫要求 == manifest.json）
if [ -f "$SRC_DIR/package.json" ]; then
  sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$SRC_DIR/package.json"
  echo "   ✓ package.json"
fi
# 2. versions.json（已存在则跳过；用 python 保证 JSON 合法）
python3 - "$NEW_VERSION" "$MIN_APP" <<'PY'
import json, sys
v, m = sys.argv[1], sys.argv[2]
p = 'versions.json'
d = json.load(open(p, encoding='utf-8'))
if v not in d:
    d[v] = m
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    open(p, 'a').write('\n')
    print('   ✓ versions.json 追加', v, ':', m)
else:
    print('   ⚠️  versions.json 已含', v, '，跳过')
PY

# 3. 全量构建（含 lint / html-escape 校验 + 打包 main.js + webapp）
echo ""
echo "🎋 全量构建（npm run build）..."
npm run build

# 4. 提交
echo ""
git add -A
if git diff --cached --quiet; then
  echo "   （无改动可提交，跳过）"
else
  git commit -m "release: $NEW_VERSION"
  echo "   ✓ 提交 release: $NEW_VERSION"
fi

# 5. 打 tag（不带 v）
if git rev-parse "$NEW_VERSION" >/dev/null 2>&1; then
  echo "   ⚠️  tag $NEW_VERSION 已存在，跳过"
else
  git tag "$NEW_VERSION"
  echo "   ✓ tag $NEW_VERSION"
fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo ""
  echo "🧪 dry-run 完成：本地已改版本/构建/提交/tag，未推送、未建 Release。"
  echo "   确认无误后去掉 --dry-run 再跑一次即可发布。"
  exit 0
fi

# 6. 推送
echo ""
git push origin main
git push origin "$NEW_VERSION"
echo "   ✓ 推送 main + tag $NEW_VERSION"

# 7. 建 GitHub Release（挂资产）
REPO=$(git remote get-url origin | sed -E 's#.*github.com[:/]([^/]+/[^.]+)(\.git)?#\1#')
echo ""
if gh release view "$NEW_VERSION" --repo "$REPO" >/dev/null 2>&1; then
  echo "   ⚠️  Release $NEW_VERSION 已存在，跳过创建"
else
  PREV=$(git describe --tags --abbrev=0 2>/dev/null || true)
  if [ -n "$PREV" ]; then
    NOTES=$(git log "${PREV}..HEAD" --oneline)
  else
    NOTES=$(git log -8 --oneline)
  fi
  gh release create "$NEW_VERSION" --repo "$REPO" --title "$NEW_VERSION" --notes "$NOTES" main.js manifest.json styles.css
  echo "   ✓ 创建 Release $NEW_VERSION（资产: main.js / manifest.json / styles.css）"
fi

echo ""
echo "🎉 发布完成: https://github.com/$REPO/releases/tag/$NEW_VERSION"

# 8. 同步到本地 vault（便于本机测试；--no-sync 跳过）
if [ "$NO_SYNC" -eq 0 ]; then
  echo ""
  echo "📦 同步到本地 vault ..."
  "$SRC_DIR/sync.sh"
fi
