export function ensureAbsoluteUrl(url?: string, platform?: string): string {
  if (!url || url === '#' || url.trim() === '' || url === 'about:blank') {
    if (platform === 'threads') return 'https://threads.net';
    if (platform === 'instagram') return 'https://instagram.com';
    if (platform === 'youtube') return 'https://youtube.com';
    if (platform === 'github') return 'https://github.com';
    if (platform === 'x') return 'https://x.com';
    return '#';
  }

  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}
