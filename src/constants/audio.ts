/** 支持的音频文件扩展名（完整列表） */
export const ALLOWED_AUDIO_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma', '.webm', '.opus',
];

/** 音频文件扩展名 → MIME 类型 */
const AUDIO_MIME_TYPES: Record<string, string> = {
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

/** 完整 MIME 类型映射（含 webapp 静态资源） */
export const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  ...AUDIO_MIME_TYPES,
};
