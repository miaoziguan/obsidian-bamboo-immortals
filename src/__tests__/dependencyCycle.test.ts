import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * 宿主侧（src/）**运行时**依赖环守卫。
 *
 * 背景（P1-4）：`PluginSettings.ts ⇄ legacySettings.ts` 曾被静态依赖图判定成环。
 * 复核后发现：PluginSettings → legacySettings 是**值**依赖，而 legacySettings → PluginSettings
 * 只是 `import type`（编译期擦除），**运行期其实无环**——当初的环检测把 type 边也算进去了，属假阳性。
 *
 * 即便如此，反向取值依赖（主干模块依赖「迁移」模块）仍不自然，已把共享常量抽到中立模块
 * settingsDefaults.ts 修正方向。本测试用于防止将来再引入**真正的运行时环**：
 *   · 只统计运行时依赖（跳过 `import type` 与全部具名为 `type X` 的导入）；
 *   · 同时统计 `export ... from`（re-export 也是运行时边……除非 `export type`）。
 */
const SRC = path.resolve(__dirname, '..');   // src/

function walk(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
            walk(full, out);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
            out.push(full);
        }
    }
    return out;
}

/** 判断 import/export 的「子句」是否纯类型 */
function isTypeOnlyClause(clause: string): boolean {
    const c = clause.trim();
    if (/^type\b/.test(c)) return true;
    const named = /^\{([\s\S]*)\}$/.exec(c);
    if (named) {
        const parts = named[1].split(',').map((s) => s.trim()).filter(Boolean);
        return parts.length > 0 && parts.every((p) => /^type\b/.test(p));
    }
    return false;
}

function resolveSpec(fromFile: string, spec: string): string | null {
    const base = path.resolve(path.dirname(fromFile), spec);
    for (const cand of [base + '.ts', base + '.tsx', path.join(base, 'index.ts')]) {
        if (fs.existsSync(cand)) return cand;
    }
    return null;
}

/** 运行时依赖（相对路径 import / export-from，忽略 type-only） */
function runtimeDeps(file: string): string[] {
    const src = fs.readFileSync(file, 'utf8');
    const deps = new Set<string>();
    const patterns = [
        /^\s*import\s+([\s\S]*?)\s+from\s+['"](\.[^'"]+)['"]/gm,
        /^\s*export\s+([\s\S]*?)\s+from\s+['"](\.[^'"]+)['"]/gm,
    ];
    for (const re of patterns) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(src))) {
            if (isTypeOnlyClause(m[1])) continue;
            const target = resolveSpec(file, m[2]);
            if (target) deps.add(target);
        }
    }
    return Array.from(deps);
}

function findCycles(graph: Map<string, string[]>): string[][] {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map<string, number>();
    for (const n of graph.keys()) color.set(n, WHITE);
    const cycles: string[][] = [];
    const seen = new Set<string>();

    const dfs = (n: string, stack: string[]) => {
        color.set(n, GRAY);
        stack.push(n);
        for (const d of graph.get(n) || []) {
            const c = color.get(d);
            if (c === GRAY) {
                const i = stack.indexOf(d);
                const cyc = stack.slice(i);
                const key = [...cyc].sort().join('|');
                if (!seen.has(key)) { seen.add(key); cycles.push(cyc); }
            } else if (c === WHITE) {
                dfs(d, stack);
            }
        }
        stack.pop();
        color.set(n, BLACK);
    };

    for (const n of graph.keys()) {
        if (color.get(n) === WHITE) dfs(n, []);
    }
    return cycles;
}

describe('src/ 运行时依赖环守卫', () => {
    it('扫描到的文件数合理（防止空集导致的假绿）', () => {
        expect(walk(SRC).length).toBeGreaterThan(50);
    });

    it('不存在运行时依赖环（type-only 导入不计）', () => {
        const files = walk(SRC);
        const graph = new Map<string, string[]>();
        for (const f of files) graph.set(f, runtimeDeps(f));

        const cycles = findCycles(graph).map((c) =>
            c.map((p) => path.relative(SRC, p)).join(' -> ')
        );
        expect(cycles).toEqual([]);
    });
});
