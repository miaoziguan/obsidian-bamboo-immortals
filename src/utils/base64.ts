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

/**
 * base64 字符串 → ArrayBuffer（arrayBufferToBase64 的逆操作）。
 * 用浏览器标准 atob，不依赖 Node 的 Buffer（移动端 Obsidian 无 Buffer）。
 * 供「便签导出 PNG」把 webapp 侧 canvas 产出的 data URL 还原成二进制写盘。
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
