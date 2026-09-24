import { gzipSync } from 'node:zlib';

/**
 * gzip 瘦身包装（R1）：自包含 HTML 过大时，构建期 gzip 成 base64、塞进极小的 loader。
 * 运行时由 WebView 原生 DecompressionStream 解压后 document.write 还原。
 *
 * 目的：把 iframe 的 data: URL 体积从 ~2.5MB 压到 ~0.6MB，稳定留在「兼容的 data: 路径」
 * （scroll.html 1.09MB 已证明 data: 在鸿蒙 ArkWeb / 老旧安卓 WebView 上可用），
 * 从而绕开 AppHost.ts 里描述的 blob: 源 <script type=module> 被拦截问题——
 * 原 app.html 编码后 2.55MB 越过 2MB 阈值被迫改用 blob:，正是平板「打不开」的根因。
 *
 * 不删任何功能、不产生外部分片抓取（仍单文件自包含）；仅对超限入口启用
 * （app.html / archive.html），scroll.html 本就 <2MB 保持原样以降风险。
 *
 * 运行时解压用最稳健的 Streams API（DecompressionStream + ReadableStream.getReader 循环），
 * 不依赖 Response.arrayBuffer 等易错写法（ReadableStream 上并无 arrayBuffer 方法）。
 * 依赖 DecompressionStream（Chromium 80+/ArkWeb/安卓 WebView 均支持；
 * 老 iOS<16.4 无此 API 时走 catch 兜底提示，不劣于现状）。
 */
function wrapGzip(html) {
  const gz = gzipSync(Buffer.from(html, 'utf-8'));
  const b64 = gz.toString('base64');
  return (
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' +
    '<script id="__bamboo_gz" type="application/octet-stream">' +
    b64 +
    '</script>' +
    '<script>(async()=>{try{' +
    "const t=document.getElementById('__bamboo_gz').textContent;" +
    'const bin=atob(t);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);' +
    "const ds=new DecompressionStream('gzip');" +
    'const w=ds.writable.getWriter();w.write(u);w.close();' +
    'const r=ds.readable.getReader();const ch=[];let total=0;' +
    'while(true){const {done,value}=await r.read();if(done)break;ch.push(value);total+=value.length;}' +
    'const out=new Uint8Array(total);let off=0;for(const c of ch){out.set(c,off);off+=c.length;}' +
    'const h=new TextDecoder().decode(out);' +
    'document.open();document.write(h);document.close();' +
    "}catch(e){document.open();document.write('<pre style=\"color:#fff;background:#000;padding:20px;font:14px monospace\">竹仙加载失败：'+((e&&e.message)||e)+'\\n（设备 WebView 不支持 gzip 解压，请升级系统或联系作者）</pre>');document.close();}})();</script>" +
    '</body></html>'
  );
}

export { wrapGzip };
