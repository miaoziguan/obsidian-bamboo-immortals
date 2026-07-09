#!/bin/bash
# 同步脚本：将编译后的文件同步到 Obsidian 插件目录

set -e

# 源目录（项目根目录）
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
# 目标目录（Obsidian 插件目录）
DEST_DIR="$(dirname "$SRC_DIR")/obsidian-vault/.obsidian/plugins/bamboo-immortals"

echo "🔄 开始同步..."
echo "   源目录: $SRC_DIR"
echo "   目标目录: $DEST_DIR"
echo ""

# 检查目标目录是否存在
if [ ! -d "$DEST_DIR" ]; then
    echo "❌ 错误：目标目录不存在: $DEST_DIR"
    exit 1
fi

# 0. CSS 设计令牌门禁（拦截裸写硬编码，未通过则中断同步，避免脏样式进入插件目录）
echo "🛡️  校验 CSS 设计令牌规范..."
if [ -f "$SRC_DIR/scripts/lint-css-tokens.mjs" ]; then
    if ! node "$SRC_DIR/scripts/lint-css-tokens.mjs"; then
        echo "❌ CSS 令牌校验未通过，同步已中断。请修复上述裸写硬编码后重试（或运行 npm run lint:css 查看详情）。"
        exit 1
    fi
    echo "   ✓ CSS 令牌规范通过"
else
    echo "   ⚠️  未找到 scripts/lint-css-tokens.mjs，跳过 CSS 令牌校验"
fi
echo ""

# 1. 编译 TypeScript
if [ -f "$SRC_DIR/package.json" ]; then
    cd "$SRC_DIR"
    # 1a. 类型门禁：tsc 报错即中断，避免类型错误的代码被打包进插件目录
    echo "📦 类型检查 (tsc --noEmit)..."
    if ! npx tsc --noEmit; then
        echo "❌ 类型检查未通过，同步中断。请修复 tsc 错误后重试。"
        exit 1
    fi
    echo "   ✓ 类型检查通过"
    # 1b. lint 门禁：拦截 any 回潮 / 未用变量 / console 泄漏等坏味道
    echo "📦 代码 lint (eslint)..."
    if ! npx eslint .; then
        echo "❌ Lint 未通过，同步中断。请修复上述 eslint 错误后重试（或运行 npm run lint 查看详情）。"
        exit 1
    fi
    echo "   ✓ lint 通过"
    # 1b. esbuild 打包
    echo "📦 编译 TypeScript..."
    npx node esbuild.config.mjs
    BUILD_OK=$?
    if [ $BUILD_OK -ne 0 ]; then
        echo "❌ 编译失败（esbuild 退出码 $BUILD_OK），同步中断。请修复错误后重试。"
        exit 1
    fi
    echo "   ✓ main.js $(wc -c < "$SRC_DIR/main.js" | tr -d ' ')B"
    echo ""
fi

# 2. 同步核心文件
echo "📄 同步核心文件..."
# 关键文件缺失即中断，禁止“假成功”
for f in main.js styles.css manifest.json; do
  if [ ! -f "$SRC_DIR/$f" ]; then
    echo "   ❌ 源文件缺失: $SRC_DIR/$f，同步中断"
    exit 1
  fi
  cp -f "$SRC_DIR/$f" "$DEST_DIR/" || { echo "   ❌ 拷贝失败: $f"; exit 1; }
  echo "   ✓ $f ($(wc -c < "$SRC_DIR/$f" | tr -d ' ')B)"
done
# author-avatar.jpg 可选，缺失仅告警
if [ -f "$SRC_DIR/author-avatar.jpg" ]; then
  cp -f "$SRC_DIR/author-avatar.jpg" "$DEST_DIR/" || { echo "   ❌ 拷贝失败: author-avatar.jpg"; exit 1; }
  echo "   ✓ author-avatar.jpg"
else
  echo "   ⚠️  未找到 author-avatar.jpg，跳过"
fi
echo ""

# 3. 同步 webapp 目录（先删后建，与用户端「删目录→解压 zip」流程一致，避免浏览器缓存旧文件）
echo "🌐 同步 webapp 目录..."
if [ -d "$SRC_DIR/webapp" ]; then
    rm -rf "$DEST_DIR/webapp"
    mkdir -p "$DEST_DIR/webapp"
    rsync -rlDv --no-times --no-perms --no-owner --no-group "$SRC_DIR/webapp/" "$DEST_DIR/webapp/"

    # 清理 .DS_Store（macOS 系统文件）
    find "$DEST_DIR/webapp" -name ".DS_Store" -delete 2>/dev/null

    # 写入 .version，防止插件误判 webapp 未安装从 GitHub 下载覆盖
    VERSION=$(grep '"version"' "$SRC_DIR/manifest.json" | sed 's/.*"\([0-9.]*\)".*/\1/')
    echo "$VERSION" > "$DEST_DIR/webapp/.version"

    # 跨平台内容哈希（macOS 用 md5，Linux 用 md5sum），基于 webapp 目录所有文件内容
    if command -v md5 >/dev/null 2>&1; then
        HASH=$(find "$DEST_DIR/webapp" -type f -not -name '.DS_Store' | sort | while read -r f; do cat "$f"; done | md5 | sed 's/.*= //' | tr -d ' ')
    else
        HASH=$(find "$DEST_DIR/webapp" -type f -not -name '.DS_Store' | sort | while read -r f; do cat "$f"; done | md5sum | awk '{print $1}')
    fi
    if [ -z "$HASH" ]; then
        # 保底：用时间戳
        HASH=$(date +%s)
    fi
    echo "   📦 内容哈希: $HASH"

    # 替换 __BUILD__ 占位符为实际哈希（必须在哈希计算之后，确保指纹反映最终产物）
    if grep -q '__BUILD__' "$DEST_DIR/webapp/index.html"; then
        sed -i '' "s/__BUILD__/$HASH/g" "$DEST_DIR/webapp/index.html"
        # 后置校验：确认所有 __BUILD__ 均已被替换，否则视为同步失败
        if grep -q '__BUILD__' "$DEST_DIR/webapp/index.html"; then
            echo "   ❌ __BUILD__ 替换不完整，同步中断"
            exit 1
        fi
        echo "   ✓ __BUILD__ 占位符已替换 ($HASH)"
    else
        echo "   ⚠️  index.html 中未发现 __BUILD__ 占位符，跳过替换"
    fi
    echo "   ✓ webapp/ (完整同步)"
else
    echo "   ⚠️  源目录中不存在 webapp 目录"
fi
echo ""

echo "✅ 同步完成！"
echo ""
echo "💡 提示：请在 Obsidian 中重新加载插件以应用更改"
