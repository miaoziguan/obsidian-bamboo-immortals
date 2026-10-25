#!/usr/bin/env node
/**
 * Obsidian 官方 Source review 规则的本地闸门（零依赖，CI）
 * ==================================================================
 * 为什么需要它（3.32.0 → 3.32.1 的实战教训）：
 *   本地 `npm run lint` 通过 ≠ 过审。官方是**第二套 lint 权威**，且是发布闸门。
 *   那次被退回的两条，本地都看不见：
 *     · Error「Disabling 'no-console' is not allowed」——本地 no-console 只是 warn，
 *       eslint 无法禁止「屏蔽自己」，所以我们用 disable 就把问题洗白了；
 *     · Warning「unnecessary assertion」——本地当时未启用对应规则。
 *
 * 本脚本只做 eslint **覆盖不到或容易绕过**的三件事（其它交给 eslint）：
 *   ① 禁止对 `no-console` 使用 eslint-disable（官方明令禁止，属 Error）；
 *   ② 所有 eslint-disable 必须带 `-- 描述`（官方 undescribed-directive）；
 *   ③ 禁止在**字符串字面量**里硬编码 `.obsidian`（官方 no-hardcoded-config-dir；
 *      改用 `this.app.vault.configDir`）。注释里提及不算，只看引号内的字面量。
 *
 *   ④ 禁止在注释里「散文式提及」指令字面量（如「不要用 eslint-disable no-console」）：
 *      只允许真正的指令形式（`// eslint-disable...` / `/* eslint-disable...` / `* eslint-disable...`）。
 *      原因：官方扫描器按**文本**匹配指令，散文提及可能被误判为指令（或缺少描述）。
 *
 * 注：裸 setTimeout/setInterval 已由 eslint 的 no-restricted-globals（error）覆盖，此处不重复。
 *
 * 逃生阀：确需豁免时在该行加 `review-allow: <checkName>`（需在代码评审中说明理由）。
 *   checkName ∈ { no-console-disable, undescribed-directive, hardcoded-config-dir }
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue;
      walk(full, out);
    } else if (e.name.endsWith('.ts') && !e.name.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

const problems = [];
const rel = (f) => path.relative(ROOT, f);
const allow = (line, name) => line.includes(`review-allow: ${name}`);

// ⑤ 需要本地 eslint 的**真实生效配置**（含 overrides），判断 disable 指向的规则是否已启用。
//    教训：3.32.2 里 --report-unused-disable-directives 把「指向未启用规则的 disable」判为"无用"，
//    我据此删了 6 条 → 官方退回 6 个告警（no-redundant-type-constituents / unnecessary-assertion）。
//    规则：disable 只允许指向**本地已启用**的规则；否则结论不可信，必须先启用该规则或删掉 disable。
const eslintApi = new ESLint();
const sampleCfg = await eslintApi.calculateConfigForFile(path.join(SRC, 'host', 'AppAPI.ts'));
const enabledRules = new Set(
  Object.entries(sampleCfg?.rules || {})
    .filter(([, v]) => {
      const sev = Array.isArray(v) ? v[0] : v;
      return sev !== 'off' && sev !== 0;
    })
    .map(([k]) => k),
);

for (const file of walk(SRC)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const at = `${rel(file)}:${i + 1}`;

    // ① / ② eslint-disable 指令
    const dir = /\/\/\s*eslint-disable(?:-next-line|-line)?\s+(.*)$/.exec(line);
    if (dir) {
      const rest = dir[1].trim();
      const rules = rest.split('--')[0].trim();
      // ① 禁止屏蔽 no-console
      if (/\bno-console\b/.test(rules) && !allow(line, 'no-console-disable')) {
        problems.push(
          `${at} 禁用了 no-console（Obsidian Source review 判 Error）。` +
            `请改代码或删掉该日志，不要屏蔽规则。`,
        );
      }
      // ② 必须带 -- 描述
      const hasDesc = /--\s*\S/.test(rest);
      if (!hasDesc && !allow(line, 'undescribed-directive')) {
        problems.push(`${at} eslint-disable 缺少 "-- 描述"（官方 undescribed-directive）。`);
      }
      // ⑤ 指向的规则必须在本地启用（否则「无用 disable」的判断不可信）
      for (const r of rules.split(',').map((x) => x.trim()).filter(Boolean)) {
        if (!enabledRules.has(r) && !allow(line, 'unenabled-rule-disable')) {
          problems.push(
            `${at} 对「本地未启用」的规则 ${r} 使用了 disable。` +
              `这类 disable 会被 --report-unused-disable-directives 误判为"无用"，` +
              `但官方审核仍会报（3.32.2 已踩过）。请先启用该规则，再修代码或删 disable。`,
          );
        }
      }
    }

    // ④ 注释里不得「散文式提及」指令字面量（只允许真正的指令形式）
    if (line.includes('eslint-disable') && !/^\s*(\/\/|\/\*|\*)\s*eslint-disable/.test(line)) {
      problems.push(
        `${at} 在注释里以「散文」形式出现了 eslint-disable 字样（扫描器按文本匹配，可能被误判为指令）。` +
          `请改用自然语言描述，例如「不要屏蔽 console 相关规则」。`,
      );
    }

    // ③ 硬编码 .obsidian 配置目录（只认引号内的字面量；整行注释与行尾注释均不算）
    const trimmed = line.trim();
    const isCommentLine = trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
    const codePart = line.replace(/\/\/.*$/, '');
    if (
      !isCommentLine &&
      /(['"`])\.obsidian(?:\/|['"`])/.test(codePart) &&
      !allow(line, 'hardcoded-config-dir')
    ) {
      problems.push(
        `${at} 硬编码了 '.obsidian' 配置目录（官方 no-hardcoded-config-dir）。` +
          `请改用 this.app.vault.configDir。`,
      );
    }
  });
}

if (problems.length) {
  console.error('[review] ❌ 命中 Obsidian 审核规则：');
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}
console.log(
  '[review] ✅ 审核规则自检通过（no-console 未被屏蔽 / disable 均带描述 / 均指向已启用规则 / ' +
    '注释无散文式指令字面量 / 无硬编码配置目录）',
);
