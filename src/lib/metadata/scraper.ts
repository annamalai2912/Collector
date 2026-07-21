import ogs from 'open-graph-scraper';
import { fetchGitHubRepoInfo, GitHubRepoDetails } from '../github/api';
import { generateAISummary, autoClassifyCategoryAndTags } from '../tools/aiSummarizer';
import { extractLinkFromText, unwrapSocialRedirectUrl } from './linkExtractor';
import { ensureAbsoluteUrl } from '../utils/url';
import { decodeHtmlEntities } from '../utils/htmlDecoder';

export interface ScrapedMetadata {
  url: string;
  title: string;
  description: string;
  ai_summary: string;
  thumbnail_url: string;
  platform: 'github' | 'instagram' | 'youtube' | 'threads' | 'x' | 'generic';
  category: 'AI/ML Tools' | 'Open Source' | 'Embedded/IoT' | 'Design Inspiration' | 'Reels/Shorts' | 'Reads/Threads';
  tags: string[];
  github_repo?: GitHubRepoDetails;
}

export function getFallbackBannerImage(platform: string, category: string, repoFullName?: string): string {
  if (repoFullName) {
    return `https://opengraph.githubassets.com/1/${repoFullName}`;
  }
  if (platform === 'instagram') {
    return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80';
  }
  switch (category) {
    case 'AI/ML Tools':
      return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80';
    case 'Embedded/IoT':
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
    case 'Design Inspiration':
      return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
    case 'Reels/Shorts':
      return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80';
    default:
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
  }
}

// Scrape real og:image & og:title from Instagram links using Mobile User-Agent headers
async function scrapeInstagramMetadata(targetUrl: string, cleanNotes: string) {
  let realOgImage = '';
  let realOgTitle = '';

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (res.ok) {
      const html = await res.text();
      const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

      if (imageMatch && imageMatch[1]) {
        realOgImage = imageMatch[1].replace(/&amp;/g, '&');
      }
      if (titleMatch && titleMatch[1]) {
        realOgTitle = decodeHtmlEntities(titleMatch[1]);
      }
    }
  } catch (e) {
    console.error('Instagram meta scrape exception:', e);
  }

  let postHandle = 'Instagram Resource';
  try {
    const pathParts = new URL(targetUrl).pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      postHandle = `Instagram ${pathParts[0] === 'reel' ? 'Reel' : 'Post'} (${pathParts[1]})`;
    } else if (pathParts.length === 1) {
      postHandle = `@${pathParts[0]} on Instagram`;
    }
  } catch {}

  const rawTitle = realOgTitle || cleanNotes || postHandle;
  const title = decodeHtmlEntities(rawTitle);

  const rawDescription = cleanNotes
    ? `${cleanNotes} (Saved from Instagram)`
    : realOgTitle || `Instagram media resource. Captured from Instagram for quick exploration.`;
  const description = decodeHtmlEntities(rawDescription);

  const category = targetUrl.includes('/reel/') ? 'Reels/Shorts' : 'Design Inspiration';
  const tags = ['instagram', 'social-media', 'reels', 'design'];
  const finalThumbnail = realOgImage || getFallbackBannerImage('instagram', category);

  return {
    url: targetUrl,
    title,
    description,
    ai_summary: generateAISummary(title, description, targetUrl),
    thumbnail_url: finalThumbnail,
    platform: 'instagram' as const,
    category: category as any,
    tags,
  };
}

export async function fetchUrlMetadata(inputUrlOrText: string): Promise<ScrapedMetadata> {
  const extracted = extractLinkFromText(inputUrlOrText);
  let rawTarget = extracted.targetUrl || inputUrlOrText.trim();
  const unwrapResult = unwrapSocialRedirectUrl(rawTarget);
  const targetUrl = ensureAbsoluteUrl(unwrapResult.cleanUrl);
  const isThreads = extracted.isViaThreads || unwrapResult.isThreads;

  let platform: ScrapedMetadata['platform'] = isThreads ? 'threads' : extracted.sourcePlatform;

  if (targetUrl.includes('instagram.com')) {
    platform = 'instagram';
    return await scrapeInstagramMetadata(targetUrl, extracted.cleanNotes);
  }

  // Check if target is a GitHub repo
  if (targetUrl.includes('github.com')) {
    const ghRepo = await fetchGitHubRepoInfo(targetUrl);
    if (ghRepo) {
      const { category, tags } = autoClassifyCategoryAndTags(ghRepo.repo_name, ghRepo.description, targetUrl);
      const ai_summary = generateAISummary(ghRepo.repo_name, ghRepo.description, targetUrl);
      const bannerUrl = `https://opengraph.githubassets.com/1/${ghRepo.full_name}`;
      const notesDesc = extracted.cleanNotes ? `${extracted.cleanNotes} — ${ghRepo.description}` : ghRepo.description;

      return {
        url: ensureAbsoluteUrl(ghRepo.html_url),
        title: decodeHtmlEntities(`${ghRepo.owner}/${ghRepo.repo_name}`),
        description: decodeHtmlEntities(notesDesc || `Open-source GitHub repository by ${ghRepo.owner} (${ghRepo.stars.toLocaleString()} stars).`),
        ai_summary,
        thumbnail_url: bannerUrl,
        platform,
        category: 'Open Source',
        tags: Array.from(new Set(['github', 'open-source', ghRepo.language.toLowerCase(), ...tags])),
        github_repo: ghRepo,
      };
    }
  }

  // Generic OpenGraph scraping
  try {
    const options = {
      url: targetUrl,
      timeout: 7000,
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      },
    };
    const { result } = await ogs(options);

    let domainName = 'web resource';
    try {
      domainName = new URL(targetUrl).hostname.replace(/^www\./, '');
    } catch {}

    let rawTitle = result.ogTitle || result.twitterTitle || '';
    if (!rawTitle || rawTitle.includes('l.threads.com') || rawTitle.includes('l.threads.net')) {
      rawTitle = extracted.cleanNotes || `Resource (${domainName})`;
    }
    const title = decodeHtmlEntities(rawTitle);

    let rawDescription = result.ogDescription || result.twitterDescription || '';
    if (extracted.cleanNotes && !rawDescription.includes(extracted.cleanNotes)) {
      rawDescription = rawDescription ? `${extracted.cleanNotes} — ${rawDescription}` : extracted.cleanNotes;
    }
    if (!rawDescription || rawDescription.includes('l.threads.com') || rawDescription.includes('l.threads.net')) {
      rawDescription = `Resource captured from ${domainName}. Explore metadata and key takeaways.`;
    }
    const description = decodeHtmlEntities(rawDescription);

    let thumbnail_url = result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || '';
    const { category, tags } = autoClassifyCategoryAndTags(title, description, targetUrl);
    const ai_summary = generateAISummary(title, description, targetUrl);

    if (!thumbnail_url || thumbnail_url.includes('favicons?domain=')) {
      thumbnail_url = getFallbackBannerImage(platform, category);
    }

    return {
      url: targetUrl,
      title,
      description,
      ai_summary,
      thumbnail_url: ensureAbsoluteUrl(thumbnail_url),
      platform,
      category,
      tags,
    };
  } catch {
    // Fallback if scraping fails
    let domainName = 'web resource';
    try {
      domainName = new URL(targetUrl).hostname.replace(/^www\./, '');
    } catch {}

    const title = decodeHtmlEntities(extracted.cleanNotes || `Resource (${domainName})`);
    const description = decodeHtmlEntities(extracted.cleanNotes || `Saved resource from ${domainName}. Zero-friction link capture.`);
    const { category, tags } = autoClassifyCategoryAndTags(title, description, targetUrl);

    return {
      url: targetUrl,
      title,
      description,
      ai_summary: generateAISummary(title, description, targetUrl),
      thumbnail_url: getFallbackBannerImage(platform, category),
      platform,
      category,
      tags,
    };
  }
}
