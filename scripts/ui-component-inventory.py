#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI 组件盘点（UI 系统梳理地基 · 交付物 A）

以「可观测的复用事实」为依据做原子化盘点：
  按 CSS 类在 JS/HTML 语料中的引用次数判定复用程度——
    ≥2 处 → 确认复用组件
    1 处  → 单点引用（进一步区分：模板上下文内可能仍是复用，否则是一次性样式）
    0 处  → 死类（与 check-dead-css 口径一致）
并输出：① 组件清单 ② 一次性样式清单 ③ 复用率 ④ 原子层级初判（启发式）

用法：python3 scripts/ui-component-inventory.py [--json 输出路径]
"""
import os
import re
import json
import glob
import argparse
import importlib.util
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STYLES = os.path.join(ROOT, 'webapp', 'assets', 'styles')
DELETE_TOOL = os.path.join(ROOT, 'scripts', 'delete-dead-css.py')

CSS_FILES = sorted(set(
    glob.glob(os.path.join(STYLES, '*.css')) +
    glob.glob(os.path.join(STYLES, '**', '*.css'), recursive=True)
))

COMMENT_RE = re.compile(r'/\*[\s\S]*?\*/')
CLASS_RE = re.compile(r'\.(-?[_a-zA-Z][\w-]*)')

# 只在「字符串字面量」内统计类名：CSS 类在 JS/HTML 里必然以字符串形式出现
# （classList.add('x') / class="x" / 模板字面量）。若直接扫全文，left / error /
# current 这类通用词会被 JS 对象属性名（{left: 0}）大量误计。
STRING_RE = re.compile(r'"[^"\n]*"|\'[^\'\n]*\'|`[^`]*`', re.S)

# 状态修饰类（BEM modifier）：不是原子/分子，单独成类
STATE_PREFIX = ('is-', 'has-', 'not-')
STATE_WORDS = {
    'active', 'selected', 'disabled', 'hidden', 'open', 'on', 'off', 'current',
    'error', 'warn', 'warning', 'success', 'fail', 'failed', 'dragging', 'installed',
    'dark', 'light', 'expanded', 'collapsed', 'visible', 'loading', 'done', 'pending',
    'checked', 'focus', 'focused', 'hover', 'pressed', 'empty', 'full', 'muted',
    'highlight', 'urgent', 'overdue', 'complete', 'completed', 'cancel', 'danger',
    'info', 'dim', 'blur', 'lock', 'locked', 'pin', 'pinned', 'up', 'down', 'next',
    'prev', 'left', 'right', 'center', 'top', 'bottom',
}

# 原子层级启发式关键词（顺序敏感：先判更具体的）
LEVEL_RULES = [
    ('template', ('app-shell', 'workspace', 'stage', 'page-', 'view-', 'layout-', 'mode-', 'shell')),
    ('organism', ('panel', 'modal', 'dialog', 'drawer', 'sidebar', 'toolbar', 'header', 'footer',
                  'timeline', 'canvas', 'grid', 'table', 'board', 'section', 'overlay', 'popup',
                  'sheet', 'wizard', 'calendar', 'chart', 'stats', 'editor', 'nav-', 'menu',
                  'list', 'container', 'wrap', 'body', 'content', 'area', 'zone')),
    ('molecule', ('card', 'item', 'row', 'cell', 'entry', 'form', 'group', 'tab', 'option',
                  'select', 'segment', 'field', 'block', 'box', 'tile', 'chip', 'bar')),
    ('atom', ('btn', 'button', 'icon', 'badge', 'tag', 'label', 'input', 'checkbox', 'radio',
              'switch', 'toggle', 'dot', 'avatar', 'pill', 'spinner', 'loader', 'divider',
              'separator', 'tooltip', 'hint', 'link', 'thumb', 'handle', 'knob', 'text',
              'title', 'desc', 'value', 'count', 'status', 'mark', 'line')),
]


def load_dead_tool():
    spec = importlib.util.spec_from_file_location('ddc', DELETE_TOOL)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def classify_level(name):
    low = name.lower()
    if low.startswith(STATE_PREFIX) or low in STATE_WORDS:
        return 'state'
    for level, keys in LEVEL_RULES:
        for k in keys:
            if k in low:
                return level
    return 'unclassified'


def namespace_of(name):
    m = re.match(r'^([a-z]+)-', name)
    return m.group(1) if m else (name if '-' not in name else name.split('-')[0])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', default=None)
    args = ap.parse_args()

    D = load_dead_tool()
    corpus = '\n'.join(open(f, encoding='utf-8', errors='ignore').read()
                       for f in D.build_corpus())
    # 只保留字符串字面量：CSS 类在 JS/HTML 中必然以字符串出现，如此可排除
    # {left: 0} 这类对象属性名造成的巨额误计
    str_corpus = '\n'.join(STRING_RE.findall(corpus))

    # 1) 收集 CSS 类
    classes = set()
    for p in CSS_FILES:
        text = COMMENT_RE.sub('', open(p, encoding='utf-8', errors='ignore').read())
        classes |= set(CLASS_RE.findall(text))
    classes = sorted(classes)

    # 2) 统计引用次数 + 单点时看是否处于模板上下文
    info = {}
    for c in classes:
        pat = re.compile(r'(?<![-\w])' + re.escape(c) + r'(?![-\w])')
        hits = list(pat.finditer(str_corpus))
        n = len(hits)
        in_template = False
        if n == 1:
            pos = hits[0].start()
            ctx = str_corpus[max(0, pos - 120):pos + 120]
            # 模板字面量 / 字符串拼接 / 多类名同串 → 可能仍是复用
            in_template = ('`' in ctx) or ('${' in ctx) or bool(re.search(r'"[^"]*\s[^"]*"', ctx))
        info[c] = {'n': n, 'in_template': in_template, 'level': classify_level(c),
                   'ns': namespace_of(c)}

    dead = [c for c in classes if info[c]['n'] == 0]
    single = [c for c in classes if info[c]['n'] == 1]
    multi = [c for c in classes if info[c]['n'] >= 2]
    live = [c for c in classes if info[c]['n'] >= 1]
    oneoff = [c for c in single if not info[c]['in_template']]
    tmpl_single = [c for c in single if info[c]['in_template']]

    reuse_rate = len(multi) / len(live) * 100 if live else 0

    print('=' * 74)
    print('UI 组件盘点 —— 原子化 + 复用度')
    print('=' * 74)
    print(f'CSS 类总数        : {len(classes)}')
    print(f'  死类（0 引用）  : {len(dead)}')
    print(f'  存活（≥1 引用） : {len(live)}')
    print(f'    ├ 复用（≥2 处）: {len(multi)}')
    print(f'    └ 单点（1 处） : {len(single)}')
    print(f'         ├ 模板上下文内（可能仍复用）: {len(tmpl_single)}')
    print(f'         └ 判定为一次性样式          : {len(oneoff)}')
    print(f'\n复用率（复用 / 存活）: {reuse_rate:.1f}%')

    print('\n--- 原子层级分布（启发式，需人工校正）---')
    for lv, label in (('atom', '原子 atom'), ('molecule', '分子 molecule'),
                      ('organism', '组织 organism'), ('template', '模板 template'),
                      ('state', '状态修饰 state'), ('unclassified', '未分类')):
        sub = [c for c in live if info[c]['level'] == lv]
        print(f'  {label:<18} {len(sub):>4}')

    print('\n--- 高频复用组件 Top 25（真正的组件）---')
    for c in sorted(multi, key=lambda x: -info[x]['n'])[:25]:
        print(f'  {c:<32} ×{info[c]["n"]:<5} [{info[c]["level"]}]')

    print('\n--- 命名空间分布（前 15）---')
    ns = Counter(info[c]['ns'] for c in live)
    for k, v in ns.most_common(15):
        print(f'  {k:<14} {v:>4} 个存活类')

    print('\n--- 一次性样式候选（单点且非模板上下文，前 25）---')
    for c in sorted(oneoff, key=lambda x: (-info[x]['n'], x))[:25]:
        print(f'  {c:<32} [{info[c]["level"]}]')

    if args.json:
        data = {
            'totals': {'classes': len(classes), 'dead': len(dead), 'live': len(live),
                       'reusable': len(multi), 'single': len(single),
                       'oneoff': len(oneoff), 'reuse_rate': round(reuse_rate, 2)},
            'components': {c: info[c] for c in classes},
        }
        with open(args.json, 'w', encoding='utf-8') as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
        print(f'\nJSON 已导出 → {args.json}')


if __name__ == '__main__':
    main()
