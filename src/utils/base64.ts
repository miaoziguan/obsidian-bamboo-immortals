/**
 * ArrayBuffer → base64 字符串。
 * 分块处理避免大文件调用栈溢出；使用浏览器标准的 btoa，
 * 桌面/移动端 Obsidian 一致可用（不依赖 Node 的 Buffer，移动端无 Buffer）。
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    let chunkStr = '';
    for (let j = 0; j < chunk.length; j++) {
      chunkStr += String.fromCharCode(chunk[j]);
    }
    binary += chunkStr;
  }
  return btoa(binary);
}
