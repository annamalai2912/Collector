export interface ExtractedSocialLink {
  targetUrl: string | null;
  rawText: string;
  cleanNotes: string;
  sourcePlatform: 'github' | 'instagram' | 'youtube' | 'threads' | 'x' | 'generic';
  isViaThreads: boolean;
}

export function unwrapSocialRedirectUrl(url: string): { cleanUrl: string; isThreads: boolean } {
  let cleanUrl = url;
  let isThreads = false;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('threads.com') || host.includes('threads.net')) {
      isThreads = true;
      const uParam = parsed.searchParams.get('u');
      if (uParam) {
        cleanUrl = decodeURIComponent(uParam);
      }
    } else if (host.includes('instagram.com') || host.includes('facebook.com')) {
      const uParam = parsed.searchParams.get('u');
      if (uParam) {
        cleanUrl = decodeURIComponent(uParam);
      }
    }
  } catch {}

  return { cleanUrl, isThreads };
}

export function extractLinkFromText(rawText: string): ExtractedSocialLink {
  if (!rawText) {
    return { targetUrl: null, rawText: '', cleanNotes: '', sourcePlatform: 'generic', isViaThreads: false };
  }

  // Check if original text came from Threads
  const isOriginalThreads = rawText.toLowerCase().includes('threads.com') || rawText.toLowerCase().includes('threads.net');

  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`]+)/gi;
  const matches = rawText.match(urlRegex);

  let targetUrl: string | null = null;
  let sourcePlatform: ExtractedSocialLink['sourcePlatform'] = isOriginalThreads ? 'threads' : 'generic';
  let isViaThreads = isOriginalThreads;

  if (matches && matches.length > 0) {
    // Clean trailing punctuation and unwrap social redirects
    const unwrapResults = matches.map((m) => {
      const clean = m.replace(/[.,;!?]+$/, '');
      return unwrapSocialRedirectUrl(clean);
    });

    const foundThreads = unwrapResults.some((r) => r.isThreads);
    if (foundThreads) isViaThreads = true;

    const cleanedUrls = unwrapResults.map((r) => r.cleanUrl);

    // If there's a GitHub URL in the post or redirect parameters, prioritize it!
    const githubMatch = cleanedUrls.find((u) => u.includes('github.com'));
    if (githubMatch) {
      targetUrl = githubMatch;
    } else {
      targetUrl = cleanedUrls[0];
    }
  }

  // Detect platform from targetUrl or raw text
  const checkText = (targetUrl || rawText).toLowerCase();
  if (isViaThreads) {
    sourcePlatform = 'threads';
  } else if (checkText.includes('github.com')) {
    sourcePlatform = 'github';
  } else if (checkText.includes('instagram.com')) {
    sourcePlatform = 'instagram';
  } else if (checkText.includes('youtube.com') || checkText.includes('youtu.be')) {
    sourcePlatform = 'youtube';
  } else if (checkText.includes('twitter.com') || checkText.includes('x.com')) {
    sourcePlatform = 'x';
  }

  // Clean notes: remove extracted URL from raw text
  let cleanNotes = rawText;
  if (targetUrl) {
    cleanNotes = cleanNotes.replace(targetUrl, '').trim();
  }

  return {
    targetUrl,
    rawText,
    cleanNotes,
    sourcePlatform,
    isViaThreads,
  };
}
