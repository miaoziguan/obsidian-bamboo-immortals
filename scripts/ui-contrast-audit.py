#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI 对比度审计（UI 系统梳理地基 · 交付物 D）

从 variables.css 的 token 值计算 WCAG 2.1 对比度，判定是否达 AA。

难点与取舍：暗色 token 不是写死的十六进制，而是
    hsl(calc(var(--accent-hue) - 7), min(100%, calc(40% * var(--accent-saturation-ui, 1))), calc(25% + var(--accent-lightness-offset)))
因此必须自己求值。默认取产品默认值：--accent-hue=120（竹青绿）、
--accent-saturation-ui=1、--accent-lightness-offset=0%。
可用 --hue / --lightness-offset 做滑块极值下的敏感性检查
（用户可拖动色相/明度滑块，故对比度会随调色变化）。

半透明背景（如 --card-bg: rgba(255,255,255,.6)）按 alpha 合成到该主题的
--surface-solid 之上，再算对比度。

用法：
    python3 scripts/ui-contrast-audit.py
    python3 scripts/ui-contrast-audit.py --hue 200 --lightness-offset 15%
"""
import os
import re
import argparse
import importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VARS = os.path.join(ROOT, 'webapp', 'assets', 'styles', 'variables.css')
TOOL = os.path.join(ROOT, 'scripts', 'delete-dead-css.py')

# 参与审计的文字色刻度与表面（均为项目已有语义 token）
TEXT_TOKENS = ['--ink-dark', '--ink-medium', '--ink-light', '--ink-pale']
SURFACE_TOKENS = ['--surface-solid', '--card-bg', '--bamboo-background',
                  '--bg-gradient-start', '--bg-gradient-end']


def load_blocks(path):
    """按顶层块切分 variables.css，返回 [(选择器, 起始行, 文本)]。"""
    lines = open(path, encoding='utf-8').read().split('\n')
    blocks = []
    cur = None
    depth = 0
    for i, ln in enumerate(lines, 1):
        if cur is None:
            if re.match(r'^\s*[^ @/].*\{\s*$', ln):
                cur = (ln.strip(), i, [])
                depth = 1
        else:
            depth += ln.count('{') - ln.count('}')
            cur[2].append(ln)
            if depth <= 0:
                blocks.append((cur[0], cur[1], '\n'.join(cur[2])))
                cur = None
    return blocks


def parse_vars(text):
    # 必须先剥注释：否则注释里提到的 "--surface-solid: #1c2a1e，写死色…"
    # 会被当成真实定义，覆盖掉真正的声明值。
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    out = {}
    for m in re.finditer(r'(?<![-\w])(--[A-Za-z][\w-]*)\s*:\s*([^;]+);', text):
        out[m.group(1)] = m.group(2).strip()
    return out


def split_args(s):
    args, buf, d = [], '', 0
    for ch in s:
        if ch == '(':
            d += 1
        elif ch == ')':
            d -= 1
        if ch == ',' and d == 0:
            args.append(buf)
            buf = ''
        else:
            buf += ch
    if buf.strip():
        args.append(buf)
    return [a.strip() for a in args]


def eval_num(expr):
    """求值 calc()/min()/max() 包裹的数值表达式，返回 (数值, 是否百分比)。
    支持通用的 min(a, b) / max(a, b)（用于明度上下限钳制）。"""
    s = expr.strip()
    m = re.match(r'^(min|max)\((.*)\)$', s, flags=re.S)
    if m:
        op, args = m.group(1), split_args(m.group(2))
        if len(args) >= 2:
            vals = [eval_num(a)[0] for a in args]
            return (min(vals) if op == 'min' else max(vals)), ('%' in s)
    s = re.sub(r'^calc\((.*)\)$', r'\1', s, flags=re.S).strip()
    has_pct = '%' in s
    s2 = s.replace('%', '')
    if not re.fullmatch(r'[\d\.\s\+\-\*/()]+', s2):
        raise ValueError('无法求值: ' + expr)
    return float(eval(s2)), has_pct


def hsl_to_rgb(h, s_pct, l_pct):
    h = h % 360
    s, l = s_pct / 100.0, l_pct / 100.0
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    if h < 60:
        r, g, b = c, x, 0
    elif h < 120:
        r, g, b = x, c, 0
    elif h < 180:
        r, g, b = 0, c, x
    elif h < 240:
        r, g, b = 0, x, c
    elif h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x
    return tuple(round((v + m) * 255) for v in (r, g, b))


class Resolver:
    def __init__(self, varmap, hue, light_off):
        self.v = varmap
        self.hue = hue
        self.light_off = light_off

    def prepare(self, raw):
        s = raw
        s = s.replace('var(--accent-hue)', str(self.hue))
        s = re.sub(r'var\(--accent-saturation-ui,\s*1\)', '1', s)
        s = s.replace('var(--accent-lightness-offset)', self.light_off)
        return s

    def resolve(self, token, seen=None):
        """解析 token 为 (r,g,b,a)。"""
        seen = seen or set()
        if token in seen:
            raise ValueError('循环引用 ' + token)
        seen.add(token)
        raw = self.v.get(token)
        if raw is None:
            raise KeyError('未定义 token: ' + token)
        s = self.prepare(raw)
        # var(--other)
        m = re.fullmatch(r'var\(\s*(--[\w-]+)\s*\)', s)
        if m:
            return self.resolve(m.group(1), seen)
        # 纯 hex
        if re.fullmatch(r'#[0-9a-fA-F]{3,8}', s):
            h = s[1:]
            if len(h) in (3, 4):
                h = ''.join(c * 2 for c in h[:3])
            r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
            return (r, g, b, 1.0)
        # rgba(var(--x-rgb), a)
        m = re.match(r'rgba?\(\s*var\(\s*(--[\w-]+)\s*\)\s*,\s*([\d.]+)\s*\)', s)
        if m:
            base = self.resolve_rgb_triplet(m.group(1), seen)
            return (base[0], base[1], base[2], float(m.group(2)))
        # rgb()/rgba() 直给
        m = re.match(r'rgba?\(([^)]*)\)', s)
        if m and 'var(' not in m.group(1):
            nums = [float(x) for x in re.findall(r'[\d.]+', m.group(1))]
            a = nums[3] if len(nums) > 3 else 1.0
            return (int(nums[0]), int(nums[1]), int(nums[2]), a)
        # hsl / hsla
        m = re.match(r'hsla?\((.*)\)$', s, flags=re.S)
        if m:
            args = split_args(m.group(1))
            h, _ = eval_num(args[0])
            s_pct, _ = eval_num(args[1])
            l_pct, _ = eval_num(args[2])
            a = float(eval_num(args[3])[0]) if len(args) > 3 else 1.0
            r, g, b = hsl_to_rgb(h, s_pct, l_pct)
            return (r, g, b, a)
        raise ValueError('无法解析 %s = %s' % (token, raw))

    def resolve_rgb_triplet(self, token, seen):
        raw = self.prepare(self.v.get(token, ''))
        m = re.fullmatch(r'var\(\s*(--[\w-]+)\s*\)', raw.strip())
        if m:
            return self.resolve_rgb_triplet(m.group(1), seen)
        nums = [int(x) for x in re.findall(r'\d+', raw)][:3]
        if len(nums) < 3:
            raise ValueError('rgb 通道 token 解析失败: ' + token)
        return tuple(nums)


def composite(fg, bg):
    """fg=(r,g,b,a) 合成到不透明 bg=(r,g,b) 上，返回 (r,g,b)。"""
    r, g, b, a = fg
    return tuple(round(a * c + (1 - a) * bgc) for c, bgc in zip((r, g, b), bg))


def luminance(rgb):
    def ch(v):
        v = v / 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(rgb1, rgb2):
    l1, l2 = luminance(rgb1), luminance(rgb2)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def verdict(ratio):
    if ratio >= 7:
        return 'AAA'
    if ratio >= 4.5:
        return 'AA'
    if ratio >= 3:
        return 'AA-大字'
    return 'FAIL'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--hue', type=float, default=120.0)
    ap.add_argument('--lightness-offset', default='0%')
    args = ap.parse_args()

    blocks = load_blocks(VARS)
    light_vars, dark_vars = {}, {}
    for sel, start, text in blocks:
        if sel.startswith(':host, :root'):
            light_vars.update(parse_vars(text))
        elif sel.startswith(':host(.dark)'):
            dark_vars.update(parse_vars(text))
        else:
            # 后续 :host 块（刻度族等）并入亮色基准
            light_vars.update(parse_vars(text))

    print('=' * 78)
    print('UI 对比度审计（WCAG 2.1）')
    print('=' * 78)
    print(f'假定：--accent-hue={args.hue}  --accent-lightness-offset={args.lightness_offset}')
    print('半透明背景按 alpha 合成到该主题 --surface-solid\n')

    summary = {}
    for theme, vmap in (('亮色 light', light_vars), ('暗色 dark', dark_vars)):
        res = Resolver(vmap, args.hue, args.lightness_offset)
        try:
            base_rgba = res.resolve('--surface-solid')
        except Exception as e:
            print(f'[{theme}] 跳过：{e}')
            continue
        base = base_rgba[:3]
        print(f'--- {theme}（基底 surface-solid = rgb{base}）---')
        print(f'{"文字 token":<16}' + ''.join(f'{s.replace("--",""):>20}' for s in SURFACE_TOKENS))
        fails = []
        for t in TEXT_TOKENS:
            try:
                trgb = res.resolve(t)
            except Exception as e:
                print(f'  {t}: 解析失败 {e}')
                continue
            row = f'{t:<16}'
            for s in SURFACE_TOKENS:
                try:
                    srgba = res.resolve(s)
                except Exception:
                    row += f'{"?":>20}'
                    continue
                bg = composite(srgba, base) if srgba[3] < 1 else srgba[:3]
                ratio = contrast(trgb[:3], bg)
                v = verdict(ratio)
                row += f'{ratio:>12.2f} {v:<7}'
                if v == 'FAIL':
                    fails.append((t, s, ratio))
            print(row)
        summary[theme] = fails
        print()

    print('=' * 78)
    print('结论')
    print('=' * 78)
    for theme, fails in summary.items():
        if fails:
            print(f'{theme}：{len(fails)} 组未达 3:1（不合格）')
            for t, s, r in fails:
                print(f'    {t} on {s} = {r:.2f}')
        else:
            print(f'{theme}：全部组合 ≥3:1 ✅')
    total_aa = 0
    print('\n提示：AA 要求正文 4.5:1、大字/UI 组件 3:1；AAA 为 7:1。')
    print('用户可拖动色相/明度滑块，建议再用 --hue / --lightness-offset 跑极值复核。')


if __name__ == '__main__':
    main()
