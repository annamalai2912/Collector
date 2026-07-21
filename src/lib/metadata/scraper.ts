import ogs from 'open-graph-scraper';
import { fetchGitHubRepoInfo, GitHubRepoDetails } from '../github/api';
import { generateAISummary, autoClassifyCategoryAndTags } from '../tools/aiSummarizer';
import { extractLinkFromText, unwrapSocialRedirectUrl } from './linkExtractor';
import { ensureAbsoluteUrl } from '../utils/url';
import { decodeHtmlEntities, cleanInstagramTitle, cleanInstagramDescription } from '../utils/htmlDecoder';
import { getFallbackBannerImage } from '../utils/bannerFallback';

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

export { getFallbackBannerImage };

// Scrape real og:image & og:title from Instagram links using Mobile User-Agent headers
async function scrapeInstagramMetadata(targetUrl: string, cleanNotes: string) {
  let realOgImage = '';
  let realOgTitle = '';
  let realOgDescription = '';

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const html = await res.text();
      const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
      const descMatch  = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

      if (imageMatch?.[1]) {
        const rawImg = imageMatch[1].replace(/&amp;/g, '&');
        // Only trust Instagram CDN image URLs (fbcdn.net / cdninstagram.com)
        if (rawImg.includes('fbcdn.net') || rawImg.includes('cdninstagram.com') || rawImg.includes('scontent')) {
          realOgImage = rawImg;
        }
      }
      if (titleMatch?.[1])  realOgTitle = decodeHtmlEntities(titleMatch[1]);
      if (descMatch?.[1])   realOgDescription = decodeHtmlEntities(descMatch[1]);
    }
  } catch (e) {
    console.error('Instagram meta scrape exception:', e);
  }

  // Build clean title: prefer "AccountName on Instagram" over full caption blob
  const title = cleanInstagramTitle(realOgTitle) || 'Instagram Post';

  // Build description: prefer the og:description (actual caption), then cleanNotes, then fallback
  const rawCaption = realOgDescription || cleanNotes || realOgTitle;
  const description = rawCaption
    ? cleanInstagramDescription(rawCaption)
    : 'Saved Instagram post.';

  // Use caption + title text to classify category (AI tech post → AI/ML Tools, reel → Reels/Shorts etc)
  const classifyText = `${realOgTitle} ${realOgDescription} ${cleanNotes} ${targetUrl}`;
  const { category, tags: autoTags } = autoClassifyCategoryAndTags(title, classifyText, targetUrl);

  // Pick best category: if URL has /reel/ force Reels/Shorts unless AI content detected
  const finalCategory = targetUrl.includes('/reel/') && category !== 'AI/ML Tools' && category !== 'Embedded/IoT'
    ? 'Reels/Shorts'
    : category;

  const tags = Array.from(new Set(['instagram', 'social-media', ...autoTags])).slice(0, 6);

  // Use the og:image if valid, otherwise use a themed fallback (not a random broken CDN URL)
  const finalThumbnail = realOgImage || getFallbackBannerImage('instagram', finalCategory);

  return {
    url: targetUrl,
    title,
    description,
    ai_summary: generateAISummary(title, description, targetUrl),
    thumbnail_url: finalThumbnail,
    platform: 'instagram' as const,
    category: finalCategory as any,
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
