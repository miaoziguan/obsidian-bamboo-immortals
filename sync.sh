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

# 1. 编译 TypeScript
if [ -f "$SRC_DIR/package.json" ]; then
    echo "📦 编译 TypeScript..."
    cd "$SRC_DIR"
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
cp -f "$SRC_DIR/main.js" "$DEST_DIR/" 2>/dev/null && echo "   ✓ main.js"
cp -f "$SRC_DIR/styles.css" "$DEST_DIR/" 2>/dev/null && echo "   ✓ styles.css"
cp -f "$SRC_DIR/manifest.json" "$DEST_DIR/" 2>/dev/null && echo "   ✓ manifest.json"
cp -f "$SRC_DIR/author-avatar.jpg" "$DEST_DIR/" 2>/dev/null && echo "   ✓ author-avatar.jpg"
echo ""

# 3. 同步 webapp 目录（rsync 避免 rm -rf 造成空目录窗口）
echo "🌐 同步 webapp 目录..."
if [ -d "$SRC_DIR/webapp" ]; then
    mkdir -p "$DEST_DIR/webapp"
    # macOS openrsync 不支持 -a，拆成显式选项
    # 关键：不传 -t/-p/-o/-g，否则 mtime/owner 变化会触发 Obsidian 重解压
    rsync -rlDv --no-times --no-perms --no-owner --no-group --delete "$SRC_DIR/webapp/" "$DEST_DIR/webapp/"

    # 写入 .version，防止插件误判 webapp 未安装从 GitHub 下载覆盖
    VERSION=$(grep '"version"' "$SRC_DIR/manifest.json" | sed 's/.*"\([0-9.]*\)".*/\1/')
    echo "$VERSION" > "$DEST_DIR/webapp/.version"

    # 清理 .DS_Store（macOS 系统文件）
    find "$DEST_DIR/webapp" -name ".DS_Store" -delete 2>/dev/null

    # 生成内容哈希（基于 webapp 目录所有文件内容）
    HASH=$(find "$DEST_DIR/webapp" -type f | sort | while read f; do
        cat "$f"
    done | md5 | sed 's/.*= //' | tr -d ' ')
    if [ -z "$HASH" ]; then
        # 保底：用时间戳
        HASH=$(date +%s)
    fi
    echo "   📦 内容哈希: $HASH"

    # 替换 __BUILD__ 占位符为实际哈希
    sed -i '' "s/__BUILD__/$HASH/g" "$DEST_DIR/webapp/index.html"
    echo "   ✓ webapp/ (完整同步)"
else
    echo "   ⚠️  源目录中不存在 webapp 目录"
fi
echo ""

echo "✅ 同步完成！"
echo ""
echo "💡 提示：请在 Obsidian 中重新加载插件以应用更改"
