#!/usr/bin/env python3
"""
安全半自动删除死 CSS 类选择器（MIXED 簇精确死名）。

核心安全规则：
- 解析前先剥离 /* ... */ 注释（避免注释内的 { } 干扰括号匹配）。
- 对每条 CSS 规则，按逗号拆选择器；凡某选择器含死名令牌（.name 且 name∈DEAD），则【整体删除该选择器】，
  绝不只剥令牌（避免把 .alive.dead 还原成 .alive 而扩大命中范围）。
- 规则内所有选择器都含死名 → 整条规则删除。
- 共享列表（.a,.dead,.c）只删 .dead，保留 .a/.c。
- 后代选择器（.dead .alive-child）整体删除。
- 绝不触碰 @keyframes / @font-face 等 at-rule 内部；绝不触碰声明里的 animation:/var(-- 引用。
- 死名集合取自 check-dead-css 同款逻辑（含 url() 剥离 + webapp JS/html 语料），可按首段簇过滤。

注意：处理后源文件注释会被去除（生产构建本就 minify 去注释；且多数注释描述的是已删死别名）。
请每个簇 --apply 后用 git diff 复核（确认只删死选择器、未扩大活选择器、未删活规则），再 build+preflight 核验。

用法：
  python3 scripts/delete-dead-css.py --cluster badge tooltip   # dry-run
  python3 scripts/delete-dead-css.py --cluster badge tooltip --apply
  python3 scripts/delete-dead-css.py --all-mixed --apply
"""
import os, re, sys, glob, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STYLES = os.path.join(ROOT, 'webapp', 'assets', 'styles')
BUILT_HTML = {'app.html', 'scroll.html', 'archive.html', 'module.html'}

def build_corpus():
    files = []
    for dp, _, fs in os.walk(os.path.join(ROOT, 'webapp', 'assets', 'scripts')):
        if '/tests/' in dp: continue
        for f in fs:
            if f.endswith('.js'): files.append(os.path.join(dp, f))
    for f in os.listdir(os.path.join(ROOT, 'webapp')):
        if f.endswith('.html') and f not in BUILT_HTML:
            files.append(os.path.join(ROOT, 'webapp', f))
    return files

def is_used(name, corpus):
    pat = re.compile(r'(?<![-\w])' + re.escape(name) + r'(?![-\w])')
    return any(pat.search(t) for t in corpus)

def collect_css_classes():
    classes = set()
    for dp, _, fs in os.walk(STYLES):
        for f in fs:
            if not f.endswith('.css'): continue
            css = open(os.path.join(dp, f), encoding='utf-8', errors='ignore').read()
            css = re.sub(r'/\*[\s\S]*?\*/', '', css)
            css = re.sub(r'//.*$', '', css, flags=re.M)
            css = re.sub(r'url\([^)]*\)', ' ', css)
            for m in re.findall(r'\.(-?[_a-zA-Z][\w-]*)', css):
                classes.add(m)
    return classes

def compute_dead():
    corpus = [open(f, encoding='utf-8', errors='ignore').read() for f in build_corpus()]
    classes = collect_css_classes()
    return sorted(c for c in classes if not is_used(c, corpus))

def split_selectors(preamble):
    parts, depth, cur = [], 0, ''
    for ch in preamble:
        if ch == '(': depth += 1; cur += ch
        elif ch == ')': depth -= 1; cur += ch
        elif ch == ',' and depth == 0: parts.append(cur); cur = ''
        else: cur += ch
    parts.append(cur)
    return [p.strip() for p in parts if p.strip()]

CLASS_RE = re.compile(r'\.(-?[_a-zA-Z][\w-]*)')
PSEUDOS = ('is', 'where', 'not', 'has')

def process_compound(term, dead):
    """从简单项（:is/:where 的单个参数）中剔除死类令牌；空则返 ''。"""
    out = []
    i = 0
    n = len(term)
    while i < n:
        c = term[i]
        if c == '.':
            m = CLASS_RE.match(term, i)
            cls = m.group(1)
            if cls not in dead:
                out.append('.' + cls)
            i = m.end()
            continue
        out.append(c)
        i += 1
    res = ''.join(out).strip()
    res = re.sub(r'\s+', ' ', res).strip()
    res = res.strip('>~+ ')
    if res == '' or re.fullmatch(r'[>\s~+]*', res):
        return ''
    return res

def process_pseudo_inner(inner, dead):
    """处理 :is()/:where() 内部参数列表：剔除含死类的参数，空参数丢弃。"""
    depth = 0
    cur = ''
    args = []
    for ch in inner:
        if ch == '(': depth += 1; cur += ch
        elif ch == ')': depth -= 1; cur += ch
        elif ch == ',' and depth == 0:
            args.append(cur); cur = ''
        else: cur += ch
    args.append(cur)
    kept = []
    for a in args:
        a2 = process_compound(a.strip(), dead)
        if a2 != '':
            kept.append(a2)
    return ', '.join(kept)

def process_selector(sel, dead):
    """处理单个顶层选择器（无顶层逗号）。返回新选择器，或 None（整条死）/''（空，等同死）。
    规则：顶层（depth 0）直接出现死类令牌 → 整条死（该选择器无法匹配）；
    死令牌位于 :is()/:where() 内 → 仅剔除该参数，保留活参数；
    死令牌位于 :not()/:has() 内或 :host() 括号内 → 不触发整体删（保留原样）。"""
    i = 0
    n = len(sel)
    out = []
    depth = 0
    while i < n:
        c = sel[i]
        if c == '(':
            depth += 1; out.append(c); i += 1; continue
        if c == ')':
            depth -= 1; out.append(c); i += 1; continue
        if c == ':' and i + 1 < n and sel[i + 1] in 'iwntsIfNWTSH':
            hit = None
            for name in PSEUDOS:
                if sel.startswith(':' + name + '(', i):
                    hit = name; break
            if hit:
                j = i + len(hit) + 2  # 跳过 ':name(' 本身，inner 为括号内内容
                d2 = 1
                k = j
                while k < n and d2 > 0:
                    if sel[k] == '(': d2 += 1
                    elif sel[k] == ')': d2 -= 1
                    k += 1
                inner = sel[j:k - 1]
                if hit in ('is', 'where'):
                    inner2 = process_pseudo_inner(inner, dead)
                    if inner2 == '':
                        return None  # :is()/:where() 剔除后为空 → 选择器无法匹配 → 整条死
                    out.append(':' + hit + '(' + inner2 + ')')
                else:
                    out.append(':' + hit + '(' + inner + ')')  # not/has 原样保留
                i = k
                continue
        if c == '.':
            m = CLASS_RE.match(sel, i)
            cls = m.group(1)
            if cls in dead and depth == 0:
                return None  # 顶层直接死类 → 整条死
            out.append('.' + cls)
            i = m.end()
            continue
        out.append(c)
        i += 1
    return ''.join(out)

def process_preamble(preamble, dead):
    sels = split_selectors(preamble)
    dropped = []
    kept = []
    for s in sels:
        ns = process_selector(s, dead)
        if ns is None or ns == '':
            dropped.append(s)
        else:
            kept.append(ns)
    if not kept:
        return None, dropped
    return ', '.join(kept), dropped

def find_blocks(text):
    """注释感知的块扫描：忽略 /* */ 与 // 注释内的 { }，只在 depth 回到 0 时记录顶层块 (open, close_exclusive)。"""
    blocks = []
    d = 0
    n = len(text)
    in_comment = False
    open_k = None
    i = 0
    while i < n:
        ch = text[i]
        if in_comment:
            if ch == '*' and i + 1 < n and text[i + 1] == '/':
                in_comment = False
                i += 2
                continue
            i += 1
            continue
        if ch == '/' and i + 1 < n and text[i + 1] == '*':
            in_comment = True
            i += 2
            continue
        if ch == '/' and i + 1 < n and text[i + 1] == '/':
            j = text.find('\n', i)
            if j == -1: j = n
            i = j
            continue
        if ch == '{':
            if d == 0: open_k = i
            d += 1
        elif ch == '}':
            d -= 1
            if d == 0:
                blocks.append((open_k, i + 1))
        i += 1
    return blocks

def process_css(text, dead):
    """返回 (new_text, drops_list, removed_blocks_count)。注释感知扫描 + 保留前导注释。"""
    blocks = find_blocks(text)
    result = []
    cursor = 0
    drops = []
    removed = 0
    for (s, e) in blocks:
        pre = text[cursor:s]
        block = text[s:e]
        lead = pre[:len(pre) - len(pre.lstrip())]
        rest = pre.lstrip()
        if not rest:
            result.append(pre + block); cursor = e; continue
        inner = block[1:block.rindex('}')]
        # 分离前导注释，得到真实选择器 / at-rule（保留注释与选择器间的原空白 gap）
        if '*/' in rest:
            ci = rest.rindex('*/')
            comment_part = rest[:ci + 2]
            real = rest[ci + 2:]
        else:
            comment_part = ''
            real = rest
        real_sel = real.strip()
        if not real_sel:
            # 仅注释、无选择器（异常）：原样保留，避免破坏
            result.append(lead + comment_part + block); cursor = e; continue
        gap = real[:len(real) - len(real.lstrip())]   # 注释与选择器间的原空白（换行等）
        if real_sel.startswith('@media') or real_sel.startswith('@supports') or real_sel.startswith('@container'):
            processed, sub_drops, _ = process_css(inner, dead)
            drops.extend(sub_drops)
            result.append(lead + comment_part + real + ' {\n' + processed + '}')
        elif real_sel.startswith('@'):
            result.append(lead + comment_part + real + block)   # @keyframes / @font-face 等原样保留
        else:
            new_actual, dropped = process_preamble(real_sel, dead)
            if new_actual is None:
                drops.extend(dropped)
                removed += 1
                result.append(lead + comment_part.rstrip('\n'))
            else:
                if dropped: drops.extend(dropped)
                result.append(lead + comment_part + gap + new_actual + ' {' + inner + '}')
        cursor = e
    result.append(text[cursor:])
    return ''.join(result), drops, removed

def cluster_head(name):
    return name.split('-')[0] if '-' in name else name

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cluster', nargs='*')
    ap.add_argument('--all-mixed', action='store_true')
    ap.add_argument('--apply', action='store_true')
    args = ap.parse_args()

    dead = compute_dead()
    if args.cluster:
        targets = set(args.cluster)
        dead_in_scope = [c for c in dead if cluster_head(c) in targets and '-' in c]
    elif args.all_mixed:
        exclude = {'kpi', 'cs', 'ai', 'achievement', 'achievements'}
        dead_in_scope = [c for c in dead if '-' in c and cluster_head(c) not in exclude]
    else:
        print('请指定 --cluster 或 --all-mixed'); sys.exit(1)

    dead_set = set(dead_in_scope)
    print(f'范围内死名（{len(dead_in_scope)}）：{dead_in_scope}')

    changed = []
    for p in glob.glob(os.path.join(STYLES, '*.css')) + glob.glob(os.path.join(STYLES, '**', '*.css'), recursive=True):
        text = open(p, encoding='utf-8', errors='ignore').read()
        new_text, drops, removed = process_css(text, dead_set)
        if new_text != text:
            changed.append((p, drops, removed, len(text) - len(new_text)))
    if not changed:
        print('无变更。'); return
    for p, drops, removed, delta in changed:
        print(f'\n## {os.path.relpath(p)}  删除规则块={removed}  字节Δ={-delta}')
        for dsel in drops:
            print(f'   删除选择器: {dsel}')
    if not args.apply:
        print('\n[DRY-RUN] 未写入。加 --apply 执行。'); return
    for p, drops, removed, delta in changed:
        text = open(p, encoding='utf-8', errors='ignore').read()
        new_text, _, _ = process_css(text, dead_set)
        open(p, 'w', encoding='utf-8').write(new_text)
        print(f'已写入 {os.path.relpath(p)}')
    print('完成。请 git diff 复核 + npm run build:webapp + preflight 核验。')

if __name__ == '__main__':
    main()
