import { NextResponse } from 'next/server';
import { fetchGitHubStarredRepos } from '@/lib/github/api';
import { generateAISummary, autoClassifyCategoryAndTags } from '@/lib/tools/aiSummarizer';
import { VaultItem } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
    }

    const starred = await fetchGitHubStarredRepos(username);
    if (!starred || starred.length === 0) {
      return NextResponse.json({ message: 'No public starred repositories found or user does not exist', importedCount: 0 });
    }

    const importedItems: VaultItem[] = starred.map((repo) => {
      const { category, tags } = autoClassifyCategoryAndTags(repo.repo_name, repo.description, repo.html_url);
      const ai_summary = generateAISummary(repo.repo_name, repo.description, repo.html_url);

      return {
        id: 'gh-star-' + repo.owner + '-' + repo.repo_name,
        url: repo.html_url,
        title: `${repo.owner}/${repo.repo_name}`,
        description: repo.description || `GitHub starred repo: ${repo.repo_name}`,
        ai_summary,
        thumbnail_url: repo.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        platform: 'github',
        category: 'Open Source',
        tags: Array.from(new Set(['github', 'open-source', repo.language.toLowerCase(), ...tags])),
        status: 'to_explore',
        is_alive: true,
        notes: `Imported from GitHub stars for @${username}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        github_repo: {
          repo_name: repo.repo_name,
          owner: repo.owner,
          stars: repo.stars,
          forks: repo.forks,
          open_issues: repo.open_issues,
          language: repo.language,
          language_color: repo.language_color,
          license: repo.license,
          latest_release: repo.latest_release,
          clone_url: repo.clone_url,
        },
      };
    });

    return NextResponse.json({
      message: `Successfully imported ${importedItems.length} starred repositories!`,
      importedCount: importedItems.length,
      items: importedItems,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to import starred repos' }, { status: 500 });
  }
}
