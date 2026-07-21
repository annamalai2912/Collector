export interface GitHubRepoDetails {
  owner: string;
  repo_name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  open_issues: number;
  language: string;
  language_color: string;
  license: string;
  latest_release: string;
  clone_url: string;
  avatar_url: string;
  html_url: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  python: "#3572A5",
  typescript: "#3178c6",
  javascript: "#f1e05a",
  rust: "#dea584",
  go: "#00ADD8",
  "c++": "#f34b7d",
  c: "#555555",
  html: "#e34c26",
  css: "#563d7c",
  shell: "#89e051",
  java: "#b07219",
  kotlin: "#A97BFF",
  swift: "#F05138",
  ruby: "#701516",
  php: "#4F5D95",
};

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('github.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    // fallback regex match
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }
  return null;
}

export async function fetchGitHubRepoInfo(url: string): Promise<GitHubRepoDetails | null> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) return null;

  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'LinkVault-App',
      },
    });

    if (!res.ok) {
      return {
        owner: parsed.owner,
        repo_name: parsed.repo,
        full_name: `${parsed.owner}/${parsed.repo}`,
        description: `GitHub repository by ${parsed.owner}`,
        stars: 0,
        forks: 0,
        open_issues: 0,
        language: 'Markdown',
        language_color: '#8b949e',
        license: 'MIT',
        latest_release: 'v1.0.0',
        clone_url: `https://github.com/${parsed.owner}/${parsed.repo}.git`,
        avatar_url: `https://github.com/${parsed.owner}.png`,
        html_url: url,
      };
    }

    const data = await res.json();
    const lang = data.language || 'Markdown';
    const langKey = lang.toLowerCase();

    return {
      owner: data.owner?.login || parsed.owner,
      repo_name: data.name || parsed.repo,
      full_name: data.full_name || `${parsed.owner}/${parsed.repo}`,
      description: data.description || '',
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      open_issues: data.open_issues_count || 0,
      language: lang,
      language_color: LANGUAGE_COLORS[langKey] || '#8b949e',
      license: data.license?.spdx_id || data.license?.name || 'Open Source',
      latest_release: data.default_branch || 'main',
      clone_url: data.clone_url || `https://github.com/${parsed.owner}/${parsed.repo}.git`,
      avatar_url: data.owner?.avatar_url || `https://github.com/${parsed.owner}.png`,
      html_url: data.html_url || url,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub repo info:', error);
    return {
      owner: parsed.owner,
      repo_name: parsed.repo,
      full_name: `${parsed.owner}/${parsed.repo}`,
      description: `GitHub repository: ${parsed.repo}`,
      stars: 0,
      forks: 0,
      open_issues: 0,
      language: 'TypeScript',
      language_color: '#3178c6',
      license: 'MIT',
      latest_release: 'main',
      clone_url: `https://github.com/${parsed.owner}/${parsed.repo}.git`,
      avatar_url: `https://github.com/${parsed.owner}.png`,
      html_url: url,
    };
  }
}

export async function fetchGitHubStarredRepos(username: string): Promise<GitHubRepoDetails[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/starred?per_page=30`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'LinkVault-App',
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const lang = item.language || 'Markdown';
      return {
        owner: item.owner?.login || 'github',
        repo_name: item.name || 'repository',
        full_name: item.full_name || item.name,
        description: item.description || '',
        stars: item.stargazers_count || 0,
        forks: item.forks_count || 0,
        open_issues: item.open_issues_count || 0,
        language: lang,
        language_color: LANGUAGE_COLORS[lang.toLowerCase()] || '#8b949e',
        license: item.license?.spdx_id || 'MIT',
        latest_release: item.default_branch || 'main',
        clone_url: item.clone_url || item.html_url,
        avatar_url: item.owner?.avatar_url || '',
        html_url: item.html_url,
      };
    });
  } catch {
    return [];
  }
}
