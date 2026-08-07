# Bamboo Immortals · 竹林修仙传

> 竹林之中，修心养性。A Chinese-style personal goal automation system — cultivate discipline through structured daily practice.

[中文](#中文) | [English](#english)

---

## 中文

**竹林修仙传** 是一款基于苏联控制论之父维克托·格卢什科夫「OGAS」理念、专为个人打造的中国风目标自动化系统。它真正独创的地方在于 **一套「目标自动化流转」机制**——你只管把想法写进来，系统会自动把模糊意图沉淀为结构化目标、按日生成可执行任务、把每次完成折算成竹币与修仙境界，再借复盘反哺下一轮目标，全程自转，无需你手动搬运。

### 独创：目标自动化流转

- **📥 意图 → 目标卡片**：在 Obsidian 笔记里写下想法，一键把整篇或选段「规划」成结构化目标（标题 / 量化子项 / 起止时间），并自动补全系统字段。
- **🗓 目标 → 每日待办自动生成**：每个子项带 `dailyMin`（每天要做多少）与 `taskDayType`，系统据此**自动派发今日任务**——你不必再想"今天该做什么"。
- **✅ 完成 → 竹币 + 联动**：勾选完成任务即赚竹币，**同时联动时间线**记录你的日间活动，让努力被如实留痕。
- **🍃 竹币 → 修仙境界**：完成的目标累计驱动 **10 大境界 100 层**修仙体系（凡尘 → 练气 → 筑基 → 金丹 → 元婴 → 化神 → 返虚 → 合道 → 大乘 → 飞升），把坚持变成看得见的"升级"。
- **🔁 复盘 → 反哺目标**：深度复盘给出验证清单、诊断分析与行动方案；健康分（偏差率 / 停滞 / 趋势）让进度看得见、问题早发现，下一轮目标因此更准。

> 💡 **以上流转默认纯本地、无需联网即可跑通。** 若想让"笔记 → 目标卡片"更省力，可开启 AI 自然语言规划（可选增强，非必需）：AI 用**你自己的 API Key** 跑（默认 DeepSeek，支持任意 OpenAI 兼容服务），作者不收推理费、看不到你的数据。

### 专属中国风美学

- **🎍 竹子意境 UI**：可调色相 / 明度的竹子背景动画，并可选将配色同步到 Obsidian 原生界面，整盘界面融为一体。
- **🎐 竹风白噪音**：程序化生成竹风声效 + 自定义音频，带定时停止，沉浸修仙氛围。
- **📜 修仙叙事**：从"凡尘"到"飞升"的 100 层境界、专属层称号（如「练气圆满」「金丹入腹」「超脱天道」），把自律写成一部修仙传记。

### 功能一览

- **目标管理**：多层级的数值 / 进度目标追踪，含健康度评分、优先级、策略复盘与自动任务拆解
- **每日待办**：从目标自动拆解每日任务，完成即赚竹币并联动时间线
- **时间线**：9 段式日间活动日志，追踪每个时段的活动与状态
- **深度复盘**：验证清单、诊断分析、行动方案
- **竹林商店**：竹币兑换，完成目标赚竹币、兑换奖励
- **竹林修仙**：完成目标升级，10 境界 100 层
- **白噪音 / 主题动效 / 板块配置**：氛围声效、竹子背景动画、自由拖拽排序显隐各模块

### 付费用户福利

本插件采用**一次性买断**，激活后**解锁全部功能**，无订阅、无有效期：
- 🗓 **完整目标自动化流转**：每日待办自动生成、竹币联动、修仙境界升级、复盘诊断全开
- 🍃 **完整修仙体系**：10 境界 100 层全部解锁，专属层称号与"飞升"终点可见
- 🛒 **竹林商店全功能**：竹币兑换与奖励体系完整可用
- 🧑‍🏫 **专家团队人脉**：作者依托个人人脉组建了各领域的专家团队，付费用户可直接对接咨询
- 💬 **独家高质量社群**：仅付费用户可加入的私密社群，同行修仙、互通资源
- 🎍 **主题动效持续更新**：不定期推出全新中国风主题动效（如「绯梦飞行」「荷塘鱼影」「混沌星系」「时间的鱼」「雪原木屋」等竹林玉案系列），付费用户免费领用
- 🔄 **换机无忧**：激活码 + 备份码机制，换设备 / 重装可便携迁移，一次购买长期可用

> 未激活时插件以全屏遮罩展示产品介绍与定价，输入激活码即解锁全部功能。

### 使用方法

1. 点击左侧 Ribbon 栏的叶子图标，或命令面板中运行「打开竹林修仙传」。
2. 在 Obsidian 笔记里写下目标想法，用「规划」把笔记 / 选段转成目标卡片；系统自动按日派发今日任务。
3. 勾选完成每日任务 → 赚竹币、联动时间线、修仙境界随之升级；定期做深度复盘反哺下一轮目标。
4. （可选）设置页填入你的 AI API Key 并打开「AI 自然语言规划」，让"笔记 → 目标卡片"更省力。
5. 通过右下角悬浮按钮（FAB）访问商店、白噪音、主题、设置等工具。

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

**Bamboo Immortals** is a Chinese-style personal goal automation system inspired by the OGAS cybernetics concept proposed by Viktor Glushkov. What truly sets it apart is a **self-running "goal automation pipeline"**: you simply drop in your ideas, and the system automatically turns fuzzy intent into structured goals, dispatches daily executable tasks, converts each completion into bamboo coins and a cultivation realm, then feeds back into the next round of goals via review — all on autopilot, no manual shuffling.

### Original: The Goal Automation Pipeline

- **📥 Intent → Goal Card**: Write your idea in an Obsidian note and "plan" the whole note or a selection into structured goals (title / quantified sub-items / start-end dates), with system fields auto-filled.
- **🗓 Goal → Auto Daily Tasks**: Each sub-item carries `dailyMin` (how much per day) and `taskDayType`; the system **auto-dispatches today's tasks** — you never have to wonder "what should I do today".
- **✅ Completion → Coins + Linkage**: Checking off a task earns bamboo coins and **simultaneously logs your timeline**, keeping an honest record of your effort.
- **🍃 Coins → Cultivation Realm**: Completed goals accumulate to drive a **10-realm, 100-layer** cultivation system (Mortal → Qi Refining → Foundation → Golden Core → Nascent Soul → Spirit Formation → Void Return → Dao Union → Mahayana → Ascension), turning persistence into visible "leveling up".
- **🔁 Review → Feedback Loop**: Deep review yields a verification checklist, diagnosis, and action plan; the health score (deviation / stagnation / trend) makes progress visible and problems catchable early, so the next round of goals gets sharper.

> 💡 **The pipeline runs locally by default — no internet required.** To make "note → goal card" easier, you can enable AI natural-language planning (optional add-on, not required): AI runs on **your own API Key** (DeepSeek by default, any OpenAI-compatible endpoint supported). The author charges no inference fee and never sees your data.

### Distinctive Chinese Aesthetics

- **🎍 Bamboo Ambience UI**: Adjustable-hue/lightness bamboo background animation, optionally synced to Obsidian's native UI for a fused look.
- **🎐 Bamboo White Noise**: Procedurally generated bamboo-wind sounds + custom audio with a sleep timer for an immersive cultivation mood.
- **📜 Cultivation Narrative**: A 100-layer realm journey from "Mortal" to "Ascension" with exclusive layer titles (e.g. "Qi Refining Perfected", "Golden Core Embraced", "Transcendent of the Heavenly Dao") — your discipline written as a cultivation saga.

### Feature Overview

- **Goal Management**: Multi-level numeric/progress goal tracking with health score, priority, strategy review, and automatic task breakdown
- **Daily Tasks**: Auto-generated from goals — completing tasks earns bamboo coins and logs timeline events
- **Timeline**: 9-period daily activity log, tracking activities and status across each time block
- **Deep Review**: Verification checklist, diagnosis analysis, action plans
- **Bamboo Shop**: Bamboo coin redemption — earn coins by completing goals and exchange for rewards
- **Cultivation**: Level up by completing goals — 10 stages, 100 levels
- **Ambient / Themes / Sections**: Bamboo sounds, bamboo background animation, drag-to-reorder dashboard modules

### Paid User Benefits

One-time purchase. After activation, **all features unlock** — no subscription, no expiry:
- 🗓 **Full goal automation pipeline**: auto daily tasks, coin linkage, realm leveling, and review diagnosis — all enabled
- 🍃 **Full cultivation system**: all 10 realms / 100 layers unlocked, with exclusive titles and the "Ascension" endpoint visible
- 🛒 **Full Bamboo Shop**: complete coin redemption and reward system
- 🧑‍🏫 **Expert network**: The author has assembled domain experts through personal connections; paid users get direct access to consult them
- 💬 **Exclusive high-quality community**: A private community open only to paid users — cultivate together and exchange resources
- 🎍 **Ongoing theme drops**: New Chinese-style theme animations released from time to time (e.g. the "Bamboo Jade" series: *Dreamflight*, *Lotus Pond*, *Chaos Galaxy*, *Fish of Time*, *Snowy Cabin*) — free for paid users
- 🔄 **Device-portable**: activation code + backup code let you migrate across devices/reinstalls — one purchase, long-term use

> Before activation, the plugin shows a full-screen gate with product intro and pricing; entering the activation code unlocks everything.

### Usage

1. Click the leaf icon in the left ribbon, or run "Open Bamboo Immortals" from the command palette.
2. Write your goal idea in an Obsidian note, then "plan" the note / selection into goal cards; the system auto-dispatches today's tasks.
3. Check off daily tasks → earn bamboo coins, log your timeline, and level up your cultivation realm; do periodic deep reviews to feed the next round of goals.
4. (Optional) In Settings, paste your AI API Key and turn on "AI natural-language planning" to make "note → goal card" easier.
5. Use the floating action button (FAB) to access the shop, ambient sounds, themes, and settings.

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
