'use client';

import React, { useState } from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { ensureAbsoluteUrl } from '@/lib/utils/url';
import { Star, GitFork, Copy, Check, ExternalLink, Code2 } from 'lucide-react';

interface RepoCardProps {
  item: VaultItem;
  onUpdateStatus: (id: string, newStatus: 'to_explore' | 'explored' | 'archived') => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({ item, onUpdateStatus }) => {
  const [copiedClone, setCopiedClone] = useState(false);
  const repo = item.github_repo;

  if (!repo && !item.url?.includes('github.com')) return null;

  const owner = repo?.owner || item.title.split('/')[0] || 'github';
  const repoName = repo?.repo_name || item.title.split('/')[1] || item.title;
  const cloneUrl = repo?.clone_url || `https://github.com/${owner}/${repoName}.git`;
  const stars = repo?.stars || 0;
  const forks = repo?.forks || 0;
  const lang = repo?.language || 'TypeScript';
  const langColor = repo?.language_color || '#3178c6';
  const license = repo?.license || 'MIT';
  const absoluteUrl = ensureAbsoluteUrl(item.url || `https://github.com/${owner}/${repoName}`);

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const vscodeDevUrl = `https://vscode.dev/github/${owner}/${repoName}`;

  return (
    <div className="gh-card p-4 flex flex-col justify-between hover:border-[#58a6ff] transition group space-y-3">
      <div className="space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="flex items-center text-xs font-mono text-[#8b949e]">
            <img
              src={`https://github.com/${owner}.png`}
              alt={owner}
              className="w-4 h-4 rounded-full mr-1.5 border border-[#30363d]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {owner}
          </span>
          <span className="text-[10px] bg-[#21262d] text-[#8b949e] border border-[#30363d] px-1.5 py-0.2 rounded font-mono">
            {license}
          </span>
        </div>

        {/* Title */}
        <a
          href={absoluteUrl}
          target="_blank"
          rel="noreferrer"
          className="text-base font-bold text-[#58a6ff] hover:underline flex items-center group-hover:text-[#79c0ff]"
        >
          {repoName}
          <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
        </a>

        {/* Small Description Box Under Card */}
        <p className="text-xs text-[#8b949e] line-clamp-3 leading-relaxed bg-[#0d1117] p-2 rounded border border-[#30363d]/60 mt-1">
          {item.description || `Open-source GitHub repository by ${owner} (${stars.toLocaleString()} ⭐).`}
        </p>

        {/* Stats Row */}
        <div className="flex items-center space-x-4 text-xs font-mono pt-1 text-[#8b949e] border-t border-[#30363d]/50">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: langColor }} />
            {lang}
          </span>
          <span className="flex items-center text-[#c9d1d9] font-semibold">
            <Star className="w-3.5 h-3.5 text-[#d29922] mr-1 fill-[#d29922]" />
            {stars.toLocaleString()}
          </span>
          <span className="flex items-center">
            <GitFork className="w-3.5 h-3.5 mr-1" />
            {forks.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#30363d]/60">
        <button
          onClick={handleCopyClone}
          className="gh-btn-secondary text-[11px] py-1 px-2.5 flex items-center font-mono"
        >
          {copiedClone ? (
            <>
              <Check className="w-3 h-3 text-[#3fb950] mr-1" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" /> git clone
            </>
          )}
        </button>

        <a
          href={vscodeDevUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[#58a6ff] hover:text-[#79c0ff] bg-[#388bfd1a] border border-[#388bfd40] px-2.5 py-1 rounded flex items-center transition font-medium"
        >
          <Code2 className="w-3 h-3 mr-1" /> VS Code Web
        </a>
      </div>
    </div>
  );
};
