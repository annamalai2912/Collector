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

/**
 * Normalizes a URL for duplicate detection by stripping tracking query params,
 * trailing slashes, www prefix, and standardizing Instagram /reel/ vs /p/ paths.
 */
export function canonicalizeUrl(url: string): string {
  if (!url) return '';
  let u = url.trim();
  if (!u.startsWith('http://') && !u.startsWith('https://')) {
    u = 'https://' + u;
  }
  try {
    const parsed = new URL(u);
    let host = parsed.hostname.toLowerCase().replace(/^www\./, '');

    // YouTube short URL normalization
    if (host === 'youtu.be') {
      const videoId = parsed.pathname.substring(1).replace(/\/$/, '');
      return `youtube.com/watch?v=${videoId}`;
    }

    let pathname = parsed.pathname;

    // Instagram /reel/ vs /p/ code normalization
    if (host === 'instagram.com') {
      pathname = pathname.replace(/^\/(reel|p)\//, '/p/');
    }

    // Strip trailing slashes
    pathname = pathname.replace(/\/+$/, '');

    // Strip common social media & analytics tracking query parameters
    const searchParams = new URLSearchParams(parsed.search);
    const trackingKeys = [
      'igsh', 'utm_source', 'utm_medium', 'utm_campaign', 
      'utm_term', 'utm_content', 'gclid', 'fbclid', 
      'si', 'feature', 'ref', 's', 'r', 'img_index'
    ];
    trackingKeys.forEach((key) => searchParams.delete(key));

    const sortedQuery = searchParams.toString();
    return `${host}${pathname}${sortedQuery ? '?' + sortedQuery : ''}`.toLowerCase();
  } catch {
    return u.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
}
