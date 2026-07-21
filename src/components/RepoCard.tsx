'use client';

import React, { useState } from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { ensureAbsoluteUrl } from '@/lib/utils/url';
import { Star, GitFork, Copy, Check, ExternalLink, Code2, QrCode, Trash2, CheckCircle, Clock } from 'lucide-react';

interface RepoCardProps {
  item: VaultItem;
  onUpdateStatus: (id: string, newStatus: 'to_explore' | 'explored' | 'archived') => void;
  onDeleteItem: (id: string) => void;
  onOpenQRCode: (url: string, title: string) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({ item, onUpdateStatus, onDeleteItem, onOpenQRCode }) => {
  const [copiedClone, setCopiedClone] = useState(false);
  const repo = item.github_repo;

  if (!repo && !item.url?.includes('github.com')) return null;

  const owner = repo?.owner || item.title.split('/')[0] || 'github';
  const repoName = repo?.repo_name || item.title.split('/')[1] || item.title;
  const fullName = `${owner}/${repoName}`;
  const cloneUrl = repo?.clone_url || `https://github.com/${owner}/${repoName}.git`;
  const stars = repo?.stars || 0;
  const forks = repo?.forks || 0;
  const lang = repo?.language || 'TypeScript';
  const langColor = repo?.language_color || '#3178c6';
  const license = repo?.license || 'MIT';
  const absoluteUrl = ensureAbsoluteUrl(item.url || `https://github.com/${owner}/${repoName}`);
  const bannerUrl = `https://opengraph.githubassets.com/1/${fullName}`;
  const vscodeDevUrl = `https://vscode.dev/github/${owner}/${repoName}`;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className={`gh-card flex flex-col justify-between hover:border-[#58a6ff] transition group space-y-3 ${item.status === 'explored' ? 'opacity-80' : ''}`}>
      <div className="space-y-2.5">

        {/* Header: Owner + License + Actions */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
          <span className="flex items-center text-xs font-mono text-[#8b949e]">
            <img
              src={`https://github.com/${owner}.png`}
              alt={owner}
              className="w-4 h-4 rounded-full mr-1.5 border border-[#30363d]"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            {owner}
            <span className="ml-2 text-[10px] bg-[#21262d] text-[#8b949e] border border-[#30363d] px-1.5 py-0.5 rounded font-mono">
              {license}
            </span>
          </span>

          {/* QR + Delete buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onOpenQRCode(absoluteUrl, repoName)}
              title="Share QR Code"
              className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded hover:bg-[#21262d] transition"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteItem(item.id)}
              title="Delete"
              className="p-1 text-[#8b949e] hover:text-[#f85149] rounded hover:bg-[#21262d] transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* GitHub OG Banner Image */}
        <div className="rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117]">
          <img
            src={bannerUrl}
            alt={repoName}
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://github.com/${owner}.png`;
            }}
          />
        </div>

        {/* Title */}
        <a
          href={absoluteUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-bold text-[#58a6ff] hover:underline flex items-center group-hover:text-[#79c0ff]"
        >
          {repoName}
          <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
        </a>

        {/* Description */}
        <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed bg-[#0d1117] p-2 rounded border border-[#30363d]/60">
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
            <><Check className="w-3 h-3 text-[#3fb950] mr-1" /> Copied!</>
          ) : (
            <><Copy className="w-3 h-3 mr-1" /> git clone</>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdateStatus(item.id, item.status === 'explored' ? 'to_explore' : 'explored')}
            className={`text-[11px] px-2.5 py-1 rounded font-medium transition flex items-center ${
              item.status === 'explored'
                ? 'bg-[#23863626] text-[#3fb950] border border-[#238636]'
                : 'bg-[#bb800926] text-[#d29922] border border-[#bb8009]'
            }`}
          >
            {item.status === 'explored' ? (
              <><CheckCircle className="w-3 h-3 mr-1" /> Done</>
            ) : (
              <><Clock className="w-3 h-3 mr-1" /> Explore</>
            )}
          </button>

          <a
            href={vscodeDevUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-[#58a6ff] hover:text-[#79c0ff] bg-[#388bfd1a] border border-[#388bfd40] px-2.5 py-1 rounded flex items-center transition font-medium"
          >
            <Code2 className="w-3 h-3 mr-1" /> VS Code
          </a>
        </div>
      </div>
    </div>
  );
};
