#!/usr/bin/env python3
"""
components.css 拆分脚本
- 按功能拆成 7 个文件
- 暗色规则集中到 components-dark.css
"""

import os

SRC = os.path.join(os.path.dirname(__file__), 'components.css')
DIR = os.path.dirname(SRC)

with open(SRC, 'r', encoding='utf-8') as f:
    all_lines = f.readlines()

# ===== 第1步：提取所有暗色规则块 =====
dark_path = os.path.join(DIR, 'components-dark.css')
dark_file = open(dark_path, 'w', encoding='utf-8')
dark_file.write('/* ===========================================================\n')
dark_file.write('   通用组件暗色模式 - 集中管理\n')
dark_file.write('   =========================================================== */\n\n')

dark_line_set = set()
i = 0
block_count = 0

while i < len(all_lines):
    line = all_lines[i]
    is_dark = 'html.dark' in line or '.theme-dark' in line

    if is_dark:
        # 往前找块注释
        start = i
        for j in range(i-1, -1, -1):
            s = all_lines[j].strip()
            if s.startswith('/*') and ('暗色' in s or 'Dark' in s):
                start = j
                break
            if s and not s.startswith('/*') and j < i - 15:
                break

        # 收集规则块
        brace = 0
        k = start
        collecting = []
        in_rule = False

        while k < len(all_lines):
            t = all_lines[k]
            if k >= i:
                in_rule = True
            if in_rule:
                brace += t.count('{') - t.count('}')
            collecting.append(all_lines[k])
            dark_line_set.add(k)

            if in_rule and brace == 0:
                nxt = all_lines[k+1].strip() if k+1 < len(all_lines) else ''
                if 'html.dark' in nxt or '.theme-dark' in nxt or \
                   (nxt.startswith('/*') and ('暗色' in nxt or 'Dark' in nxt)):
                    k += 1
                    continue
                break
            k += 1

        dark_file.write(''.join(collecting) + '\n')
        block_count += 1
        i = k + 1
    else:
        i += 1

dark_file.close()
print(f"✅ components-dark.css: {block_count} 个暗色规则块")

# ===== 第2步：纯净内容 =====
clean = [all_lines[i] for i in range(len(all_lines)) if i not in dark_line_set]
print(f"纯净内容: {len(clean)} 行")

# ===== 第3步：按分节标记拆分 =====
# 在 clean 中找到各分节的行号（0-indexed）
# 基于之前分析的数据：
#   1: Edit Mode Bar
#   44: 可编辑区域
#   84: Keyboard Hint
#   127: Quick Navigation
#   258: KPI Grid
#   364: KPI Semantic States
#   392: 触控区域优化
#   432: 验证清单
#   480: 诊断分析
#   517: 行动卡片
#   613: 空状态卡片
#   677: 引用样式
#   690: 历史记录
#   754: 日期导航 (820行!)
#   1574: 空状态样式
#   1655: Dashboard 年度大屏
#   1770: 成就徽章系统
#   1812: 成就弹窗通知
#   1868: 成就系统主弹窗
#   1983: 数据同步模态框
#   2069: 成就徽章
#   2087: Tooltip Bubble
#   2157: 骨架屏加载
#   2200: Undo/Redo
#   2260: 统计分析模态框
#   2351: 成就系统样式
#   2711: 目标优先级样式
#   2763: 优先级选择器
#   2906: 百层修仙体系
#   2966: 天气模块
#   2967: 分隔线
#   3156: 响应式

# 定义拆分边界（clean 行号，0-indexed）
SPLITS = [
    # (文件名, 起始行, 结束行)
    ('components-interaction.css',   0,   753),   # Edit Mode ~ 历史记录
    ('date-nav.css',              754,  1573),   # 日期导航 (~820行)
    ('components-modals.css',     1574,  1654),   # 空状态样式
    ('components-dashboard.css',   1655,  1769),   # Dashboard 年度大屏
    ('achievements.css',          1770,  2350),   # 成就系统（徽章~统计）

    ('components-kpi.css',        2351,  2710),   # 成就系统样式（暗色已移除）~ 目标优先级
    ('components-priority.css',    2711,  2905),   # 目标优先级 + 优先级选择器
    ('cultivation.css',           2906,  2965),   # 百层修仙体系
    ('weather-quotes.css',        2966,  len(clean)-1),  # 天气 + 响应式
]

# 实际上面拆分需要重新看一下 clean 里的准确行号
# 重新扫描 clean 的分节
section_lines = {}
for i, line in enumerate(clean):
    s = line.strip()
    if s.startswith('/* ==========') or s.startswith('/* ----') or s.startswith('/* --'):
        # 提取标题关键词
        for key in ['Edit Mode', '可编辑', 'Keyboard', 'Quick Nav', 'KPI Grid',
                     'KPI Semantic', '触控', '验证清单', '诊断', '行动卡片',
                     '空状态卡片', '引用', '历史记录',
                     '日期导航', '空状态样式', 'Dashboard', '成就徽章系统',
                     '成就弹窗', '成就系统主', '数据同步', '成就徽章',
                     'Tooltip', '骨架屏', 'Undo', '统计分析', '成就系统样式',
                     '目标优先级', '优先级选择器', '百层修仙', '天气模块',
                     '响应式']:
            if key in s:
                section_lines[key] = i
                break

print("\n分节行号：")
for k, v in sorted(section_lines.items(), key=lambda x: x[1]):
    print(f"  {v+1:>5}: {k}")

# 如果没有找到，用默认范围
# 由于暗色规则已移除，行号已变化，直接按 clean 的实际内容分
# 策略：先写文件，按标题关键词分

# 重新定义：按 clean 里的实际顺序分
# 1. components-interaction.css: Edit Mode Bar ~ 历史记录 (0 ~ 753)
# 2. date-nav.css: 日期导航 (754 ~ 1573)
# 3. achievements.css: 成就系统 (1574 ~ 2710) -- 但 1574 是"空状态样式"
# 需要重新对准

# 稳妥做法：逐行扫描 clean，按标题分块
current_file = None
current_content = []
file_outputs = {}  # filename -> [lines]

for i, line in enumerate(clean):
    s = line.strip()
    
    # 检测新分节
    new_file = None
    if 'Edit Mode' in s or '可编辑' in s or 'Keyboard' in s or 'Quick Nav' in s or 'KPI' in s or '触控' in s or '验证清单' in s or '诊断' in s or '行动卡片' in s or '空状态卡片' in s or '引用' in s or '历史记录' in s:
        new_file = 'components-interaction.css'
    elif '日期导航' in s:
        new_file = 'date-nav.css'
    elif '空状态样式' in s and 'Dashboard' not in s:
        new_file = 'components-modals.css'
    elif 'Dashboard' in s:
        new_file = 'components-dashboard.css'
    elif '成就' in s or '统计分析模态框' in s:
        new_file = 'achievements.css'
    elif '目标优先级' in s or '优先级选择器' in s:
        new_file = 'components-kpi.css'
    elif '百层修仙' in s:
        new_file = 'cultivation.css'
    elif '天气' in s or '响应式' in s:
        new_file = 'weather-quotes.css'
    
    if new_file and new_file != current_file:
        if current_file and current_content:
            file_outputs[current_file] = current_content
        current_file = new_file
        current_content = []
    
    if current_file:
        current_content.append(line)

# 最后一个文件
if current_file and current_content:
    file_outputs[current_file] = current_content

# 写文件
for fname, content in file_outputs.items():
    path = os.path.join(DIR, fname)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(''.join(content))
    print(f"✅ {fname}: {len(content)} 行")

print(f"\n完成！共拆出 {len(file_outputs)} 个文件")
print(f"记得更新 index.html 引用！")
