# Bamboo Immortals · 竹林修仙传

> 竹林之中，修心养性。A Chinese-style personal goal automation system — cultivate discipline through structured daily practice.

[中文](#中文) | [English](#english)

---

## 中文

**竹林修仙传** 是一款基于苏联控制论之父维克托·格卢什科夫「OGAS」理念、专为个人打造的中国风目标自动化系统。它最与众不同的地方在于：**内置一个 AI 目标教练，把你脑子里那句模糊的"我想变好"，一步步拆成可执行、可追踪、还会自己进化的修仙路径。**

> 🤖 **AI 用你自己的 API Key 跑，作者不收任何推理费、看不到你的数据。**
> 默认对接 DeepSeek（`https://api.deepseek.com/v1`，`deepseek-chat`），也支持任意 OpenAI 兼容服务。打开设置填入 Key 即用。

### 核心能力

- **🧭 AI 目标澄清（Goal Elicitor）**：你只管用大白话描述欲望，AI 通过澄清对话 + 分诊，判断它属于"目标 / 习惯 / 项目 / 想法"，避免把假目标当真目标。
- **📐 专业框架拆解（Frameworks）**：自动套用 7 类经过打磨的拆解框架（里程碑 / 阶段窗口 / 量化锚点 / 关键结果 / 习惯回路 / 反脆弱冗余 / 多维平衡），把大目标切成有交付标准的子项。
- **🔍 AI 诊断（Goal Diagnoser）**：基于真实执行数据（活跃度、偏差率、停滞、趋势），AI 给出归因与可操作建议——不做空泛打气。
- **💬 对话式规划（Agentic Plan Controller）**：像跟真人教练对话一样，审阅并微调计划，把"笔记 → 目标卡片"自然落地。
- **📊 硬指标 + 健康分（Deviation & Health）**：插件侧纯函数计算偏差率 / 停滞 / 趋势，配合健康分，让进度看得见、问题早发现。
- **🍃 修仙成长体系**：把坚持变成游戏——完成目标升级，10 境界 100 层（练气 → 筑基 → 金丹 → … → 超脱天道），自带社交货币。
- **🛒 竹林商店 & 竹币**：完成目标赚竹币、兑换奖励，让自律有即时正反馈。
- **⏳ 时间线 & 深度复盘**：9 段式日间活动日志；复盘含验证清单、诊断分析、行动方案。
- **🎐 氛围与视觉**：程序化生成竹风白噪音 + 自定义音频；可调配色竹子背景动画，并联动 Obsidian 原生界面。
- **🧩 板块配置**：自由拖拽排序、显隐仪表盘各模块。

### 使用方法

1. 点击左侧 Ribbon 栏的叶子图标，或命令面板中运行「打开竹林修仙传」。
2. **（可选但推荐）开启 AI**：设置页填入你的 AI API Key（默认 DeepSeek），打开「AI 自然语言规划」。之后用大白话描述目标，让 AI 帮你澄清、拆解、诊断。
3. 设定 / 生成目标 → 每日待办自动生成 → 勾选完成任务 → 赚竹币、修仙升级。
4. 通过右下角悬浮按钮（FAB）访问商店、白噪音、主题、设置等工具。

### 设置

- **数据路径**：复盘数据在 Vault 中的存储目录
- **主题动效**：自定义视觉效果文件夹
- **白噪音**：配置音源文件夹
- **调色联动**：色相/明度调整同步到 Obsidian 原生 UI

### 购买与激活（一次性买断）

本插件为**一次性买断**，无订阅、无有效期，付款后获得专属激活码，离线激活、永久可用。

- **早鸟价**：¥29（前期限量，恢复正式价后不再有）
- **正式价**：¥99

**购买流程**

1. 扫码下方微信收款码完成付款：
   - 微信收款码：`docs/payment-wechat.png`
2. 将**付款截图**私聊发给作者（羽鳞君）。
3. 作者确认后，会发给你一个专属激活码，格式形如 `BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`。
4. 打开 Obsidian → 社区插件「竹林修仙传」设置页 → 粘贴激活码 → 点击激活即可。

> 激活码与你的用户标识绑定，一人一码，请妥善保管。如更换设备，可凭原码在原设置中重新激活。

---

## English

**Bamboo Immortals** is a Chinese-style personal goal automation system inspired by the OGAS cybernetics concept proposed by Viktor Glushkov. What sets it apart is a **built-in AI goal coach** that turns a vague "I want to get better" into an executable, trackable, self-evolving cultivation path.

> 🤖 **AI runs on your own API Key — the author charges no inference fee and never sees your data.** Defaults to DeepSeek (`https://api.deepseek.com/v1`, `deepseek-chat`), and supports any OpenAI-compatible endpoint. Paste your key in Settings and go.

### Features

- **🧭 AI Goal Elicitor**: Describe your desire in plain language; AI clarifies and triages it (goal / habit / project / idea) so you don't mistake a fake goal for a real one.
- **📐 Frameworks**: Auto-applies 7 polished decomposition frameworks (milestones / stage windows / quantitative anchors / key results / habit loops / antifragile redundancy / multidimensional balance).
- **🔍 AI Diagnoser**: Grounded in real execution data (activity, deviation, stagnation, trend), AI attributes causes and gives actionable advice — no empty pep talk.
- **💬 Agentic Plan Controller**: Review and refine plans through a conversational coach; turn "notes → goal cards" naturally.
- **📊 Deviation & Health**: Pure-function deviation/stagnation/trend metrics plus a health score — progress visible, problems caught early.
- **🍃 Cultivation**: Level up by completing goals — 10 stages, 100 levels (Qi Refining → Foundation → Golden Core → … → Transcendence), with built-in social currency.
- **🛒 Bamboo Shop & Coins**: Earn bamboo coins by completing goals and redeem rewards for instant positive feedback.
- **⏳ Timeline & Deep Review**: 9-period daily activity log; review with verification checklist, diagnosis, and action plans.
- **🎐 Ambience & Visuals**: Procedurally generated bamboo ambient sounds + custom audio; adjustable bamboo background animation that can sync with Obsidian's native UI.
- **🧩 Section Configuration**: Drag to reorder and toggle dashboard modules.

### Usage

1. Click the leaf icon in the left ribbon, or run "Open Bamboo Immortals" from the command palette.
2. **(Optional but recommended) Enable AI**: In Settings, paste your AI API Key (DeepSeek by default) and turn on "AI natural-language planning". Then describe goals in plain language and let AI clarify, decompose, and diagnose.
3. Set / generate goals → daily tasks auto-generate → check off to earn bamboo coins and level up.
4. Use the floating action button (FAB) to access the shop, ambient sounds, themes, and settings.

### Settings

- **Data path**: Where review data is stored in your vault
- **Theme effects**: Custom visual effects folder
- **Ambient sounds**: Configure audio source folders
- **Palette sync**: Sync hue/lightness adjustments to Obsidian's native UI

### Purchase & Activation (One-time Buyout)

This plugin is a **one-time buyout** — no subscription, no expiry. Pay once, get a personal activation code, activate offline, use forever.

- **Early-bird price**: ¥29 (limited, before the regular price takes effect)
- **Regular price**: ¥99

**How to buy**

1. Scan the WeChat payment QR code below to complete payment:
   - WeChat: `docs/payment-wechat.png`
2. Send the **payment screenshot** to the author (羽鳞君) via private message.
3. Upon confirmation, the author sends you a personal activation code, formatted like `BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`.
4. Open Obsidian → Community plugin "Bamboo Immortals" settings → paste the code → click activate.

> Each code is bound to your user identity (one code per user). Keep it safe. To switch devices, reactivate with the same code in the settings.

---

## License

Licensed under Apache 2.0 © 羽鳞君
