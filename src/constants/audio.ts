/** 支持的音频文件扩展名（完整列表） */
export const ALLOWED_AUDIO_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma', '.webm', '.opus',
];

/**
 * 扩展名 → MIME 类型表。
 *
 * 只保留音频条目：本表仅有的两个查表点（AppAPI.handleReadNoiseFile / handleReadLocalFile）
 * 都在调用 toDataUrl 之前先经 ALLOWED_AUDIO_EXTENSIONS 校验扩展名，因此历史上并入的
 * html/css/js/mjs/json/png/jpg/jpeg/gif/svg/ico/woff/woff2/ttf 共 14 个条目永不命中
 * （webapp 静态资源走 AppHost / getResourcePath 通道，不经这张表）。
 */
export const MIME_TYPES: Record<string, string> = {
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.ogg':  'audio/ogg',
  '.flac': 'audio/flac',
  '.aac':  'audio/aac',
  '.m4a':  'audio/mp4',
  '.wma':  'audio/x-ms-wma',
  '.webm': 'audio/webm',
  '.opus': 'audio/opus',
};
