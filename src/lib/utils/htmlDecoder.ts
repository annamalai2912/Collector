export function decodeHtmlEntities(str: string): string {
  if (!str) return '';

  return str
    // Named entities
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#064;/g, '@')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    // Hex numeric entities like &#x2019; &#x2026; &#x1f642; etc
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    // Decimal numeric entities like &#8217; &#8230; etc
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return '';
      }
    });
}

/**
 * Cleans an Instagram og:title like:
 *   'soph(ui)a on Instagram: "summer's almost over… get out..."'
 * into a readable short form:
 *   'soph(ui)a on Instagram'
 */
export function cleanInstagramTitle(rawTitle: string): string {
  if (!rawTitle) return 'Instagram Post';
  const decoded = decodeHtmlEntities(rawTitle);
  // Strip the caption part after the colon-quote
  const colonQuoteIdx = decoded.indexOf(': "');
  if (colonQuoteIdx > 0) {
    return decoded.substring(0, colonQuoteIdx).trim();
  }
  // Fallback: truncate to 80 chars
  return decoded.length > 80 ? decoded.substring(0, 80) + '…' : decoded;
}

/**
 * Cleans an Instagram description (full caption) into a short readable summary
 */
export function cleanInstagramDescription(rawCaption: string): string {
  if (!rawCaption) return '';
  const decoded = decodeHtmlEntities(rawCaption);
  // Extract just the first sentence or first 160 chars
  const firstSentence = decoded.split(/[.!?\n]/)[0].trim();
  if (firstSentence && firstSentence.length > 10) {
    return firstSentence.length > 160 ? firstSentence.substring(0, 160) + '…' : firstSentence;
  }
  return decoded.length > 160 ? decoded.substring(0, 160) + '…' : decoded;
}
