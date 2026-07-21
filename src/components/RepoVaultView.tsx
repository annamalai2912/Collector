'use client';

import React, { useState } from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { RepoCard } from './RepoCard';
import { Star, Filter, Code2, Sparkles } from 'lucide-react';

interface RepoVaultViewProps {
  items: VaultItem[];
  onUpdateStatus: (id: string, newStatus: 'to_explore' | 'explored' | 'archived') => void;
  onOpenStarSync: () => void;
}

export const RepoVaultView: React.FC<RepoVaultViewProps> = ({ items, onUpdateStatus, onOpenStarSync }) => {
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [minStars, setMinStars] = useState<number>(0);

  const repoItems = items.filter(
    (item) => item.platform === 'github' || Boolean(item.github_repo) || item.url?.includes('github.com')
  );

  const filteredRepos = repoItems.filter((item) => {
    const repo = item.github_repo;
    const langMatch = selectedLang === 'all' || repo?.language?.toLowerCase() === selectedLang.toLowerCase();
    const starMatch = (repo?.stars || 0) >= minStars;
    return langMatch && starMatch;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-[#d29922] fill-[#d29922]" />
            <h2 className="text-base font-semibold text-[#f0f6fc]">GitHub Repo Vault</h2>
            <span className="bg-[#21262d] text-[#8b949e] text-xs px-2 py-0.5 rounded-full border border-[#30363d] font-mono">
              {filteredRepos.length} Repos
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Dedicated vault for saved GitHub open-source repositories with live ⭐ stats, clone shortcuts, and VS Code launchers.
          </p>
        </div>

        <button
          onClick={onOpenStarSync}
          className="gh-btn-primary text-xs flex items-center shrink-0 py-2 px-3 shadow"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Import Starred Repos
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#8b949e] flex items-center mr-1">
          <Filter className="w-3 h-3 mr-1" /> Language:
        </span>
        {['all', 'Python', 'TypeScript', 'JavaScript', 'Rust', 'Go', 'C++'].map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className={`px-2.5 py-1 rounded-full border transition ${
              selectedLang.toLowerCase() === lang.toLowerCase()
                ? 'bg-[#388bfd1a] text-[#58a6ff] border-[#388bfd40]'
                : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]'
            }`}
          >
            {lang === 'all' ? 'All Languages' : lang}
          </button>
        ))}

        <div className="h-4 w-px bg-[#30363d] mx-2" />

        <span className="text-[#8b949e] flex items-center mr-1">
          <Star className="w-3 h-3 mr-1 text-[#d29922]" /> Min Stars:
        </span>
        {[
          { label: 'All Stars', val: 0 },
          { label: '1k+ ⭐', val: 1000 },
          { label: '5k+ ⭐', val: 5000 },
          { label: '10k+ ⭐', val: 10000 },
        ].map((star) => (
          <button
            key={star.val}
            onClick={() => setMinStars(star.val)}
            className={`px-2.5 py-1 rounded-full border transition ${
              minStars === star.val
                ? 'bg-[#bb800926] text-[#d29922] border-[#bb8009]'
                : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]'
            }`}
          >
            {star.label}
          </button>
        ))}
      </div>

      {/* Grid of Repos */}
      {filteredRepos.length === 0 ? (
        <div className="text-center py-12 bg-[#161b22] border border-[#30363d] rounded-lg">
          <Code2 className="w-8 h-8 text-[#6e7681] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#f0f6fc]">No GitHub Repos Found</h3>
          <p className="text-xs text-[#8b949e] mt-1 max-w-sm mx-auto">
            Save a GitHub link or use "Star Sync" to automatically import your starred repositories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((item) => (
            <RepoCard key={item.id} item={item} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
};
