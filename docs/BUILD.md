# 构建指南

## 快速开始

```bash
npm install     # 安装依赖
bash sync.sh    # 一键：检查 → 编译 → 打包 → 同步到 Obsidian
```

## 分步执行

```bash
# 1. 类型检查
npx tsc --noEmit

# 2. 代码检查
npx eslint .

# 3. 编译插件 TypeScript
node esbuild.config.mjs production

# 4. 打包 webapp JS
node scripts/bundle-webapp.mjs

# 5. 同步到 Obsidian 插件目录
# （sync.sh 中的 rsync 步骤）
```

## 新增前端模块

1. 在 `webapp/assets/scripts/` 下创建 `.js` 文件
2. 在 `webapp/index.html` 中添加 `<script type="module" src="assets/scripts/新功能.js">`
3. 运行 `bash sync.sh`

`bundle-webapp.mjs` 会自动扫描 `index.html` 的加载顺序并打包。

## 运行测试

```bash
npm run test:host    # 宿主 TypeScript 测试（Vitest）
npm run test         # 前端 JavaScript 测试（Vitest + jsdom）
```

## CI/CD

推送版本 tag 触发 GitHub Actions：
```bash
bash release.sh      # 或手动打 tag
git push --tags
```
