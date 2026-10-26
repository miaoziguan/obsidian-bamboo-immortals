#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI token 审计（UI 系统梳理地基 · 交付物 B）

从 CSS 源码提取设计 token 现状，产出可据此重塑的客观数据：
  1. 自定义属性【定义】清单（文件/行号/值）+ 重复定义
  2. var() 【使用】清单 → 定义但未使用 / 使用但未定义
  3. 魔法数：硬编码颜色 / 间距 / 字号 / 圆角 / 阴影
  4. 近重复颜色值（可收敛为刻度）

关于「使用但未定义」的特别说明（对应硬约束 C3）：
  这类 token 往往是留给外部市场主题覆写的**公开契约**，
  删除或改名会直接打断主题注入，审计时须重点标注而非当垃圾清掉。

用法：python3 scripts/ui-token-audit.py [--json 输出路径]
"""
import os
import re
import json
import glob
import argparse
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STYLES = os.path.join(ROOT, 'webapp', 'assets', 'styles')

CSS_FILES = sorted(set(
    glob.glob(os.path.join(STYLES, '*.css')) +
    glob.glob(os.path.join(STYLES, '**', '*.css'), recursive=True)
))

COMMENT_RE = re.compile(r'/\*[\s\S]*?\*/')
LINE_COMMENT_RE = re.compile(r'//[^\n]*')

# 自定义属性定义： --name: value
DEF_RE = re.compile(r'(?<![-\w])(--[A-Za-z][\w-]*)\s*:\s*([^;{}]+)')
# var() 使用（含 fallback 的第一参）
VAR_RE = re.compile(r'var\(\s*(--[\w-]+)')

HEX_RE = re.compile(r'#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b')
FUNC_COLOR_RE = re.compile(r'\b(?:rgba?|hsla?)\([^)]*\)')

# 只观测这些属性，避免 @media (min-width:...) 之类的伪声明污染
COLOR_PROPS = {
    'color', 'background', 'background-color', 'border-color',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'fill', 'stroke', 'outline-color',
}
SPACE_PROPS = {
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'gap', 'row-gap', 'column-gap',
}
RADIUS_PROPS = {
    'border-radius',
    'border-top-left-radius', 'border-top-right-radius',
    'border-bottom-left-radius', 'border-bottom-right-radius',
}
OTHER_PROPS = {'font-size', 'box-shadow', 'text-shadow'}
WATCHED = COLOR_PROPS | SPACE_PROPS | RADIUS_PROPS | OTHER_PROPS

DECL_RE = re.compile(r'(?<![-\w])([a-zA-Z-]+)\s*:\s*([^;{}]+)')


def strip_comments(text):
    text = COMMENT_RE.sub('', text)
    text = LINE_COMMENT_RE.sub('', text)
    return text


def rel(path):
    return os.path.relpath(path, ROOT)


def parse_hex(h):
    h = h.lstrip('#')
    if len(h) in (3, 4):
        h = ''.join(c * 2 for c in h[:3])
    try:
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError:
        return None


def parse_func_color(s):
    nums = re.findall(r'[\d.]+', s)
    if len(nums) >= 3:
        try:
            return tuple(int(float(n)) for n in nums[:3])
        except ValueError:
            return None
    return None


def to_rgb(literal):
    """把颜色字面量归一为 (r,g,b)，失败返回 None。"""
    literal = literal.strip()
    if literal.lower() in ('transparent', 'none', 'currentcolor', 'inherit', 'initial', 'unset'):
        return None
    if literal.startswith('#'):
        return parse_hex(literal)
    if re.match(r'rgba?\(', literal):
        return parse_func_color(literal)
    return None


def audit():
    definitions = defaultdict(list)   # token -> [(file, line, value)]
    usages = defaultdict(list)        # token -> [(file, line)]
    magic = defaultdict(list)         # category -> [(file, line, prop, value)]
    color_counter = Counter()         # 归一化 rgb -> 出现次数
    color_examples = {}               # 归一化 rgb -> 原始字面量样例

    for path in CSS_FILES:
        raw = open(path, encoding='utf-8', errors='ignore').read()
        text = strip_comments(raw)
        # 记录行号：按 \n 切分原始（去注释会破坏行号，故用偏移映射的简化做法——
        # 这里用「去注释文本 + 逐行」近似，行号可能略偏，足以定位文件与大致位置）
        for lineno, line in enumerate(text.split('\n'), 1):
            # 1) 定义
            for m in DEF_RE.finditer(line):
                definitions[m.group(1)].append((rel(path), lineno, m.group(2).strip()))
            # 2) var() 使用
            for m in VAR_RE.finditer(line):
                usages[m.group(1)].append((rel(path), lineno))
            # 3) 魔法数
            for m in DECL_RE.finditer(line):
                prop = m.group(1).lower()
                if prop not in WATCHED:
                    continue
                value = m.group(2).strip()
                if 'var(' in value:
                    # 仅 fallback 部分算魔法
                    fb = re.findall(r'var\(\s*--[\w-]+\s*,\s*([^)]+)\)', value)
                    value = ' , '.join(fb)
                    if not value:
                        continue
                if prop in COLOR_PROPS:
                    cat = '颜色'
                    hits = HEX_RE.findall(value) + FUNC_COLOR_RE.findall(value)
                elif prop in SPACE_PROPS:
                    cat = '间距'
                    hits = re.findall(r'-?\d*\.?\d+px', value) or re.findall(r'-?\d*\.?\d+(?:rem|em)', value)
                elif prop in RADIUS_PROPS:
                    cat = '圆角'
                    hits = re.findall(r'-?\d*\.?\d+px', value) or re.findall(r'-?\d*\.?\d+%', value)
                elif prop == 'font-size':
                    cat = '字号'
                    hits = re.findall(r'-?\d*\.?\d+px', value) or re.findall(r'-?\d*\.?\d+(?:rem|em)', value)
                else:
                    cat = '阴影'
                    hits = HEX_RE.findall(value) + FUNC_COLOR_RE.findall(value)
                    if not hits:
                        hits = [value]
                for h in hits:
                    magic[cat].append((rel(path), lineno, prop, h.strip()))
                    if cat in ('颜色', '阴影'):
                        rgb = to_rgb(h)
                        if rgb:
                            color_counter[rgb] += 1
                            color_examples.setdefault(rgb, h.strip())

    return definitions, usages, magic, color_counter, color_examples


def near_duplicate_colors(color_counter, color_examples, threshold=12):
    """把视觉上接近的颜色聚成簇（欧氏距离 <= threshold），提示可收敛为刻度。"""
    items = sorted(color_counter.items(), key=lambda kv: -kv[1])
    clusters = []
    used = set()
    for i, (c1, n1) in enumerate(items):
        if c1 in used:
            continue
        cluster = [(c1, n1)]
        used.add(c1)
        for c2, n2 in items[i + 1:]:
            if c2 in used:
                continue
            d = sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5
            if d <= threshold:
                cluster.append((c2, n2))
                used.add(c2)
        if len(cluster) > 1:
            clusters.append(cluster)
    clusters.sort(key=lambda cl: -sum(n for _, n in cl))
    return clusters


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', default=None, help='导出 JSON')
    ap.add_argument('--near-top', type=int, default=12, help='近重复颜色簇展示数量')
    args = ap.parse_args()

    definitions, usages, magic, color_counter, color_examples = audit()

    defined = set(definitions)
    used = set(usages)
    unused = sorted(defined - used)                 # 定义了但没用
    undefined = sorted(used - defined)              # 用了但没定义（可能是外部主题契约）
    dup_def = {t: v for t, v in definitions.items() if len(v) > 1}

    print('=' * 72)
    print('UI token 审计 —— UI 系统梳理地基')
    print('=' * 72)
    print(f'CSS 文件数            : {len(CSS_FILES)}')
    print(f'自定义属性【定义】总数 : {sum(len(v) for v in definitions.values())} 处')
    print(f'自定义属性【去重】种类 : {len(defined)}')
    print(f'被 var() 引用的种类    : {len(used)}')
    print(f'重复定义（>1 处）      : {len(dup_def)}')
    print(f'  定义但未使用         : {len(unused)}')
    print(f'  使用但未定义         : {len(undefined)}   ← 疑似外部主题契约，勿当垃圾删')

    print('\n--- 魔法数（未走 token 的硬编码）---')
    for cat in ('颜色', '间距', '字号', '圆角', '阴影'):
        items = magic.get(cat, [])
        print(f'  {cat:<4}: {len(items):>5} 处')
    print(f'  归一化后不同颜色值   : {len(color_counter)}')

    print('\n--- 硬编码颜色 Top（最该先收敛的）---')
    for rgb, n in color_counter.most_common(15):
        print(f'  {color_examples[rgb]:<22} rgb{rgb}  × {n}')

    clusters = near_duplicate_colors(color_counter, color_examples)
    print(f'\n--- 近重复颜色簇（距离≤12，可收敛为刻度）: {len(clusters)} 簇 ---')
    for cl in clusters[:args.near_top]:
        total = sum(n for _, n in cl)
        names = ', '.join(f'{color_examples[c]}×{n}' for c, n in cl[:5])
        more = ' …' if len(cl) > 5 else ''
        print(f'  [{len(cl)} 色 / 共 {total} 处] {names}{more}')

    if undefined:
        print(f'\n--- 使用但未定义（外部主题契约候选，前 30）---')
        for t in undefined[:30]:
            print(f'  {t}  (被引用 {len(usages[t])} 次，例：{usages[t][0][0]}:{usages[t][0][1]})')

    if dup_def:
        print(f'\n--- 重复定义（前 15）---')
        for t, v in sorted(dup_def.items(), key=lambda kv: -len(kv[1]))[:15]:
            where = ', '.join(f'{f}:{l}' for f, l, _ in v[:4])
            print(f'  {t}  ×{len(v)}   {where}')

    if args.json:
        data = {
            'totals': {
                'css_files': len(CSS_FILES),
                'definitions': sum(len(v) for v in definitions.values()),
                'distinct_tokens': len(defined),
                'referenced_tokens': len(used),
                'dup_definitions': len(dup_def),
                'unused': len(unused),
                'undefined': len(undefined),
                'magic': {k: len(v) for k, v in magic.items()},
                'distinct_colors': len(color_counter),
            },
            'definitions': {t: [{'file': f, 'line': l, 'value': v} for f, l, v in vs]
                            for t, vs in definitions.items()},
            'usages': {t: [{'file': f, 'line': l} for f, l in vs] for t, vs in usages.items()},
            'unused': unused,
            'undefined': undefined,
            'near_duplicate_color_clusters': [
                [{'rgb': list(c), 'count': n, 'sample': color_examples[c]} for c, n in cl]
                for cl in clusters
            ],
        }
        with open(args.json, 'w', encoding='utf-8') as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
        print(f'\nJSON 已导出 → {args.json}')


if __name__ == '__main__':
    main()
