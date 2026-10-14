/**
 * 市场素材 id（主题 / 模块 / 便签素材）安全校验。
 *
 * 背景：这些 id 会**直接参与 Vault 路径拼接**（`{dir}/{id}.js`），而 id 来自 webapp 消息、
 * 乃至**远程市场清单**。若不校验，形如 `../../x` 的 id 会拼出越界路径：
 * 安装时把 .js 写到目标目录之外，卸载时**删掉任意 .js**（路径遍历）。
 *
 * 与 `VaultStorage.assertSafeDocId` 同族，但字符集更宽 —— 市场 id 允许中文等
 * 文件名合法字符（主题名常见「竹林青绿」之类），只拦真正危险的部分。
 *
 * @throws 非法 id 抛错（fail-fast，由各消息处理器的 try/catch 转成错误响应）
 */
export function assertSafeAssetId(id: string, label = '素材 id'): string {
  const v = (id ?? '').toString().trim();
  if (!v) throw new Error(`${label}不能为空`);
  // 文件名非法字符（含路径分隔符）
  if (/[\\/:*?"<>|]/.test(v)) throw new Error(`${label}含非法字符`);
  // 路径遍历
  if (v.includes('..')) throw new Error(`${label}不能包含 ".."`);
  if (v.length > 120) throw new Error(`${label}过长`);
  // 控制字符
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(v)) throw new Error(`${label}含控制字符`);
  return v;
}
