/**
 * obfuscate.ts - 轻量运行时反混淆 + 防篡改（方案 C+/D-lite：提高破解门槛，非保险柜）
 *
 * 设计目标（务必理解）：
 * - 仅用于「让 LICENSE_SECRET 不以明文出现在 main.js 产物里」，提高随手 grep / 一眼读取的难度。
 * - 提供：①XOR 解码；②字符串分片分散存储后运行时拼接；③反调试检测；④校验函数防篡改。
 * - 这是可逆混淆：拿到本文件 + 分片常量，任何懂行的人（或 AI）都能还原。它不是安全边界。
 * - 真要防破解请走服务端校验（见 licenseKey.ts 注释），本模块只是把"白送"变成"需要动点脑子"。
 */

/** 运行时解码：XOR 还原。encoded / pass 均为普通字符串（UTF-8）。 */
export function decodeSecret(encoded: string, pass: string): string {
  let out = '';
  for (let i = 0; i < encoded.length; i++) {
    const c = encoded.charCodeAt(i);
    const k = pass.charCodeAt(i % pass.length);
    out += String.fromCharCode(c ^ k);
  }
  return out;
}

/**
 * 把碎片数组按序拼回原串（与 secretShards.ts 的分散存储配合使用）。
 * 运行时由 licenseKey.ts 调用，把跨模块存放的密钥碎片还原。
 */
export function rejoinShards(shards: string[]): string {
  return shards.join('');
}

/**
 * 反调试检测：若检测到开发者工具（基于 debugger 命中耗时 + 维度特征），
 * 返回 true 表示疑似处于调试态。仅作"提高动态分析成本"用，可绕过。
 */
export function isBeingDebugged(): boolean {
  try {
    // 方法1：debugger 时间差（devtools 打开时 debugger 会真的暂停，耗时明显）
    const start = Date.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const elapsed = Date.now() - start;
    if (elapsed > 100) return true;

    // 方法2：常见 devtools 全局特征
    const w = (typeof window !== 'undefined' ? window : ({} as Record<string, unknown>)) as Record<string, unknown>;
    if (
      (w as { devtools?: unknown }).devtools ||
      (typeof (w as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown }).__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * 动态防篡改标记派生：从一组碎片运行时算出一个"只应存在于原函数体内"的特征串。
 * 篡改者若要改函数返回 true，必须知道这个派生规则才能植入正确标记——而规则本身
 * 分散在调用处 + 本函数，单看一处拿不到完整逻辑。返回的特征串用于 isFunctionTampered 比对。
 */
export function deriveTamperMark(seedShards: string[], salt: number): string {
  let acc = '';
  const joined = seedShards.join('|');
  for (let i = 0; i < joined.length; i++) {
    const code = joined.charCodeAt(i) ^ ((salt + i * 7) & 0xff);
    acc += String.fromCharCode(code);
  }
  return 'TM:' + acc;
}

/**
 * 防篡改外壳：校验目标函数是否被改写。
 *
 * 做法：检查函数源码是否仍含"原函数专属"的探针字符串 `__bamboo_probe__`
 * （该串由 licenseKey.ts 以 `const _probe = '__bamboo_probe__'; void _probe;` 形式存在，
 * 任何常规打包器都会保留这个字符串常量；若篡改者把函数体改成 `return true`，
 * 该串即消失 → 判定篡改）。
 *
 * 注意：不依赖 deriveTamperMark 的派生结果文本（打包后该调用表达式可能被改写，
 * 导致误判）。仅用稳定存在的探针字符串做自检，避免"自检本身误杀正常构建"。
 *
 * 返回 true 表示疑似被篡改。
 */
export function isFunctionTampered(fn: (...args: never[]) => unknown, _marker?: string): boolean {
  try {
    const src = fn.toString();
    const hasProbe = src.includes('__bamboo_probe__');
    return !hasProbe;
  } catch {
    return false;
  }
}
