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
- **正式价**：¥9999

**购买流程**

1. 扫码下方微信收款码完成付款：

   ![微信收款码](docs/payment-wechat.jpg)

2. 将**付款截图**私聊发给作者羽鳞君（微信：yanhu94）。
3. 作者确认后，会发给你一个专属激活码，格式形如 `BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`。
4. 打开 Obsidian → 社区插件「竹林修仙传」设置页 → 粘贴激活码 → 点击激活即可。

> 激活码与你的用户标识绑定，一人一码，请妥善保管。如更换设备，可凭原码在原设置中重新激活。

### 产品理念

《反者道之动：竹林修仙传的产品理念》——作者羽鳞君亲笔阐述本产品背后的哲学。以下为全文。

### 到底先迈哪只脚？

成年人一天里最难的时刻，不是干活，是睁眼那一刻。

脑子里有十件事，件件都该做，件件都不想动。

健身要先换鞋，报告要先开文档，书要先翻到那一页——每个"第一"都卡在"先迈哪只脚"上。

卡久了，干脆躺回去刷手机。你不是懒，你是被"从哪开始"这道题，反复内耗了。

市面上的工具怎么解这个题？两种路数，我都烦。

一种给你一道填空题。意思是"填完你就完事了"。可填表本身，就是那道"先迈哪只脚"的瘫痪。你对着空白输入框发呆，把脑子里那团混沌，硬压成空洞的信息。填完你觉得"我规划好了"，其实你只是把混沌从脑子里，搬到了屏幕上，还顺自责任。

另一种更阴。它标榜"智能"，用算法盯着你的注意力，用连续打卡、勋章、红点把你钉在屏幕上，美其名曰"帮你坚持"。可你盯着的是勋章，还是你自己？你坚持的是目标，还是"别断签"那点强迫？这哪是帮你活，这是给你不断制造焦虑。

妄图给一切建模的产品和妄图用意志力裸奔的产品，变成了毫无产品哲学的垃圾。两条路，都没把用户当人。

### 掷一支竹签

竹林修仙传想做的，是第三条路。而这条路的第一步，特别不像个"效率工具"——

它给一支竹签。

你瘫在椅子上，今日任务列了一排，你一件都不想挑。这时候旁边有个竹签按钮，点一下，它从今天的活儿里**随机替你掷一支**。滚轮哗啦转两下，某一行亮起来，checkbox 变成一枚 ▶ 播放键。你不用想"先做哪个"，竹签替你想了。点上 ▶，开干。

这不是"游戏化"。决策瘫痪的本质，是"**所有事都同等重要、同等不想做"时的选择过载**。你以为你需要"自律"，其实你只需要有人替你掷一次骰子，把"从哪开始"这个开放题，变成"就这个"的闭眼题。

**一支竹签，把 paralysis 切成 action。** 剩下的事，系统接着转。

而这只是开场。竹签掷完、你动了手，真正的机制，由我正式介绍——

### 写完想法，剩下的交给自动化流转

竹林修仙传的核心，不是又一个填表器，是一套会自转的机制：目标自动化流转。

你在 Obsidian 笔记里，把那团想法写出来就行。不用结构化，不用想清楚，语无伦次都行。然后点一下"规划"，系统把这团混沌，沉成一张目标卡片：该量化什么、起点终点在哪、每天推多少，自动补全。

接下来，是竹林修仙传和别家工具最大的分野：

- **目标设定好后自己长出每日任务**。每个子项带着"每天做多少""按什么节奏"，系统据此把今天的待办自动派到你面前。你不用每天早上重新决策"今天干嘛"——这事它替你做了，你只管掷竹签挑一件开干。
- **勾一下，万物联动**。你打勾的瞬间，目标卡进度自动更新，竹币入账，时间线记下你这段在忙什么，修仙境界往前挪一格。你完成一件小事，整盘都被轻轻推一下，**不用手动去同步任何东西**。
- **复盘反哺下一轮**。定期深度复盘，系统基于真实执行数据——你偏了多少、卡在哪、趋势如何——给出诊断，让下一轮目标更准。

一句话：你写想法，系统自转；你掷竹签，挑一件开干；你勾完成，万物联动。意志力只花在做事上，不浪费在"决定、记录、同步、回忆"这些本该自动的事。

这套流转默认纯本地跑，不联网也转。它不偷看你，不卖你注意力，不发"该打卡了"的推送来驯你。它只是安静在侧边栏，静静飘着竹叶，把你的人生过成一盘会自己推进的棋。

没完成每天的任务也没关系，它不强迫你把每天的任务全打满。它，追求美，追求使用自然。这才是我产品的核心。

### 它甚至不鼓励你冲刺——反大厂式雕花活之内卷先锋

说到"反算法"，得讲讲这套系统里我最较劲的一个设计：健康分。

别的工具本质是个"大厂鞭子"——完成率越高越好、越快越好、连续越久越好。它用这套数字哄你"再冲一把"。

竹林修仙传的健康分，反着来。

它分三层：履约能力、趋势动力、可持续性。可持续性那层里藏着几个反直觉的狠主意——

你提前太多完成？**扣分**。提前超过三个工作日，它判定你"过度超前"，不是夸你，是罚你。因为那往往意味着你把自己的节奏压爆了，或者当初把目标定小了，这种"领先"不健康。

你停更了？**指数级扣分**。(天数/5)^1.5，停得越久扣得越狠，不是慢慢扣。它比你还怕你凉。

你某一项冲到 100%、其余纹丝不动？**均衡分拉低**。它更想要的是匀着走、整体往前，而不是单点爆破式冲刺。

最要紧的是归因方式：它不按"你落后了没"贴标签，而是按"哪个维度偏了"——是履约能力塌了，是趋势动力泄了，还是可持续性崩了。它不骂你懒，它只指给你看，塌的是哪一面墙。

这套东西不给你打鸡血。

不是把你驯成一台更高效的机器，而是帮你**可持续地、不崩盘地**往前挪。

### AI 是扶梯，不是司机：尊重人的主体性

顺带说清，免得又被理解歪：竹林修仙传里**确实有 AI 功能**——你可以让它帮你把笔记更快变成目标卡片，大白话描述想法，它就帮你澄清、拆解。

但它只是"笔记→卡片"这个环节的一个**可选增强**，**核心流转不靠它**。

我故意不让 AI 当主角。一旦"智能"成了必需，工具就又变成那个替你思考的东西。

竹林修仙传的立场很硬：**系统负责流转，你负责活。AI 最多是帮你起跑的扶梯，往哪跑，永远是你自己的事。**

### 越名教而任自然：没苦别硬吃

说格调。

中国人讲修养，从来不是苦大仇深地"磨砺意志"，这纯属没苦硬吃。

"越名教而任自然" ，你看那是种什么心境——**超越虚伪的礼教束缚，顺应人真实的本性**

我想，竹林修仙传想透出来的，得是魏晋风度的竹林趣味。

魏晋有七贤，在竹林下喝酒、清谈、打铁、发呆，不守什么礼法，也不跟谁卷。他们要的不是"更高效"，是"不失其真"。我把这套意趣放进产品里：它的中国风不是贴层水墨皮肤，是一整套叙事机制。

你完成的每个目标，都累加成修仙境界的推进——从**凡尘**一路修到**练气、筑基、金丹、元婴、化神、返虚、合道、大乘、飞升**，十境百层。每层有专属称号，像「练气圆满」「金丹入腹」「超脱天道」。

这不是装饰。当你的坚持被写成"我从凡人修到了练气"，它就不再是冷冰冰的完成率，而是一部**你自己的凡人修仙传**。人对数字会脱敏，但对自己"正在写的故事"会上瘾——坚持便成了一种叙事惯性，不是意志力消耗。

配套的还有一整片东方意境：可调色相的竹子背景动画、治愈的竹风白噪音、甚至能把配色同步到 Obsidian 原生界面，整盘工具融成一片竹林。你坐在这片竹林里，事一件件做，不慌。

### 竹林道场，寻找同频的人

竹林修仙传是**一次性买断**，激活后全功能解锁。我重来不认为我的优势仅是产品本身——你买的远不止"功能可用"：

- **🧑‍🏫 我人脉里的各领域专家**：这些年攒下的人，跨行跨业。你付费了，卡住的问题有人接。
- **💬 独一份的高质量社群**：只属于付费用户的私密场子。不是刷屏广告群，是同行者进阶，互通资源，互相照见的地方。
- **🎍 主题动效一直更**：我会不定期往"竹林玉案"系列加新的中国风动效——已经做好的就有「绯梦飞行」「荷塘鱼影」「混沌星系」「时间的鱼」「雪原木屋」——付费用户可领，你的竹林不只是竹林。
- **🔄 换机无忧**：激活码加备份码，换设备、重装都不丢，一次买，长期用。
- **🐒激活竹知了猴模式**：竹知了猴——答天下事。你有任何困惑都可以通过更高效的交互模式让我作答。我将成为你的"能工智人"。
- **🍃竹林系列生态级插件优惠特权**：竹林修仙传只是一个开始。

### 末了

我做过不少"反"的东西——反流量、反算法驯化、反把人当机器。

竹林修仙传是这些念头的一个产品化身。

它不打算让你"高效"到失去人味，也不打算用勋章把你钉在屏幕上。

它只想做一件事：**把"坚持"这件最难的事，变成一套会自己转的机制，再给一支竹签打破瘫痪，最后把你写进一部凡人修仙传记里**——好让你省下决策的能量，去活真正属于你的那部分人生。

窗外有雪有船，手里有一支竹签。你只管掷，剩下的，交给流转。

### 致敬前辈

写到最后，想起一位前辈：苏联控制论之父，维克托·格卢什科夫。

1962 年，他提出 OGAS——一个国家级的自动化网络，想让整个苏联的经济计划"自己流转"：数据自动上报、供需自动平衡，把人从无穷的报表和汇报里解放出来。他不是想把人变成齿轮，恰恰相反，是想把人从重复的核算中赎出来。

可惜，格卢什科夫的理念受制于官僚主义，始终没落地。

我做的竹林修仙传，是同一件事的缩小版：不调度一个国家，只调度一个人——让目标拆解成待办，让待办反映到时间线，让待办数据回流到目标进度，让复盘自动流转。格卢什科夫没能替一个国家完成的事，我借着 Obsidian 的一支竹签，替一个一个具体的人，悄悄做完了。

算不上继承遗志。只是隔了多年的雪，窗外那支竹签，替他续上了。

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
- **Regular price**: ¥9999

**How to buy**

1. Scan the WeChat payment QR code below to complete payment:

   ![WeChat Payment QR Code](docs/payment-wechat.jpg)

2. Send the **payment screenshot** to the author 羽鳞君 via WeChat (ID: yanhu94).
3. Upon confirmation, the author sends you a personal activation code, formatted like `BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`.
4. Open Obsidian → Community plugin "Bamboo Immortals" settings → paste the code → click activate.

> Each code is bound to your user identity (one code per user). Keep it safe. To switch devices, reactivate with the same code in the settings.

---

## License

Licensed under Apache 2.0 © 羽鳞君
