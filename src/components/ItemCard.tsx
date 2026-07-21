'use client';

import React, { useState } from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { ensureAbsoluteUrl } from '@/lib/utils/url';
import { formatDate, formatRelativeDate } from '@/lib/utils/date';
import {
  ExternalLink,
  Star,
  GitFork,
  Sparkles,
  QrCode,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
  Calendar,
} from 'lucide-react';

interface ItemCardProps {
  item: VaultItem;
  onUpdateStatus: (id: string, newStatus: 'to_explore' | 'explored' | 'archived') => void;
  onUpdateCategory: (id: string, newCategory: VaultItem['category']) => void;
  onDeleteItem: (id: string) => void;
  onOpenQRCode: (url: string, title: string) => void;
  viewMode?: 'grid' | 'list';
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onUpdateStatus,
  onUpdateCategory,
  onDeleteItem,
  onOpenQRCode,
  viewMode = 'grid',
}) => {
  const [copiedClone, setCopiedClone] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isGitHub = item.platform === 'github' || Boolean(item.github_repo);
  const repo = item.github_repo;
  const absoluteUrl = ensureAbsoluteUrl(item.url, item.platform);
  
  // Use image if available, or official GitHub OpenGraph banner if GitHub
  let imageSrc = item.screenshot_url || item.thumbnail_url;
  if (!imageSrc && isGitHub && repo) {
    imageSrc = `https://opengraph.githubassets.com/1/${repo.owner}/${repo.repo_name}`;
  }

  const dateLabel = formatRelativeDate(item.created_at);
  const fullDateLabel = formatDate(item.created_at);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!item.url || item.url === '#' || item.url === 'about:blank') {
      e.preventDefault();
      alert('This resource does not have an external web link attached. You can view notes or screenshot attached.');
    }
  };

  const handleCopyClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cloneCmd = repo?.clone_url ? `git clone ${repo.clone_url}` : `git clone ${absoluteUrl}.git`;
    navigator.clipboard.writeText(cloneCmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const getPlatformBadge = () => {
    switch (item.platform) {
      case 'github':
        return <span className="bg-[#21262d] text-[#c9d1d9] border border-[#30363d] px-2 py-0.5 rounded text-[11px] font-mono">🐙 GitHub</span>;
      case 'threads':
        return <span className="bg-[#1f2937] text-[#e5e7eb] border border-[#374151] px-2 py-0.5 rounded text-[11px] font-mono">🧵 Threads</span>;
      case 'instagram':
        return <span className="bg-[#831843] text-[#fbcfe8] border border-[#9d174d] px-2 py-0.5 rounded text-[11px] font-mono">📸 Instagram</span>;
      case 'youtube':
        return <span className="bg-[#7f1d1d] text-[#fca5a5] border border-[#991b1b] px-2 py-0.5 rounded text-[11px] font-mono">▶️ YouTube</span>;
      case 'x':
        return <span className="bg-[#1e293b] text-[#cbd5e1] border border-[#334155] px-2 py-0.5 rounded text-[11px] font-mono">𝕏 Twitter</span>;
      default:
        return <span className="bg-[#161b22] text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded text-[11px] font-mono">🌐 Web</span>;
    }
  };

  return (
    <>
      <div
        className={`gh-card p-4 flex flex-col justify-between relative group ${
          viewMode === 'list' ? 'md:flex-row md:items-center' : ''
        }`}
      >
        {/* Top Content Area */}
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {getPlatformBadge()}
              <select
                value={item.category}
                onChange={(e) => onUpdateCategory(item.id, e.target.value as any)}
                className="bg-[#0d1117] text-[#58a6ff] text-[11px] border border-[#30363d] rounded px-2 py-0.5 outline-none font-medium hover:border-[#58a6ff]"
              >
                <option value="Open Source">⭐ Open Source</option>
                <option value="AI/ML Tools">🤖 AI/ML Tools</option>
                <option value="Embedded/IoT">🔌 Embedded/IoT</option>
                <option value="Design Inspiration">🎨 Design Inspiration</option>
                <option value="Reels/Shorts">🎬 Reels/Shorts</option>
                <option value="Reads/Threads">📰 Reads/Threads</option>
              </select>

              {/* Visible Date Stamp Badge */}
              <span
                title={`Saved on ${fullDateLabel}`}
                className="bg-[#0d1117] text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded text-[10px] font-mono flex items-center shrink-0"
              >
                <Calendar className="w-3 h-3 mr-1 text-[#6e7681]" />
                {dateLabel}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onOpenQRCode(absoluteUrl, item.title)}
                title="QR Code Mobile Handoff"
                className="p-1 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded transition"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                title="Delete Item"
                className="p-1 text-[#8b949e] hover:text-[#f85149] hover:bg-[#da363326] rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Prominent Banner Image */}
          {imageSrc && (
            <div
              onClick={() => setLightboxImage(imageSrc)}
              className="relative h-36 w-full bg-[#0d1117] border border-[#30363d] rounded-md overflow-hidden group/img cursor-pointer transition hover:border-[#58a6ff]"
            >
              <img
                src={imageSrc}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover/img:scale-105 transition duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).parentElement!.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-xs font-medium space-x-1">
                <Maximize2 className="w-4 h-4" />
                <span>View Image</span>
              </div>
            </div>
          )}

          {/* Title & Description Box */}
          <div className="space-y-1.5">
            <a
              href={absoluteUrl}
              onClick={handleLinkClick}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[#58a6ff] hover:underline flex items-center group-hover:text-[#79c0ff] transition"
            >
              <span className="truncate max-w-xl">{item.title}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 shrink-0 opacity-75" />
            </a>

            {/* Description Box Under Card */}
            <p className="text-xs text-[#8b949e] leading-relaxed line-clamp-3 bg-[#0d1117] p-2 rounded border border-[#30363d]/60">
              {item.description || item.notes || `Resource tool saved under ${item.category}.`}
            </p>
          </div>

          {/* Live GitHub Repository Stats (If platform is GitHub) */}
          {isGitHub && repo && (
            <div className="flex items-center space-x-3 text-xs text-[#8b949e] pt-1 font-mono">
              {repo.language && (
                <span className="flex items-center">
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-1.5"
                    style={{ backgroundColor: repo.language_color || '#8b949e' }}
                  />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center text-[#c9d1d9]">
                <Star className="w-3 h-3 text-[#d29922] mr-1 fill-[#d29922]" />
                {repo.stars.toLocaleString()}
              </span>
              <span className="flex items-center">
                <GitFork className="w-3 h-3 mr-1" />
                {repo.forks.toLocaleString()}
              </span>
              {repo.license && <span className="hidden sm:inline text-[11px] text-[#6e7681]">⚖️ {repo.license}</span>}
            </div>
          )}

          {/* AI Key Takeaways Accordion */}
          {item.ai_summary && (
            <div className="pt-1">
              <button
                onClick={() => setShowAISummary(!showAISummary)}
                className="text-[11px] text-[#3fb950] bg-[#23863615] border border-[#23863640] px-2 py-0.5 rounded flex items-center hover:bg-[#23863630] transition font-medium"
              >
                <Sparkles className="w-3 h-3 mr-1" /> AI Key Takeaways
                {showAISummary ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
              </button>

              {showAISummary && (
                <div className="mt-2 p-2.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#c9d1d9] whitespace-pre-line leading-relaxed font-sans animate-fade-in">
                  {item.ai_summary}
                </div>
              )}
            </div>
          )}

          {/* Tags List */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center space-x-1 flex-wrap gap-y-1 pt-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#21262d] text-[#8b949e] border border-[#30363d] px-1.5 py-0.2 rounded text-[10px] font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Controls Row */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#30363d]/60">
          {/* Status Toggle Button */}
          <button
            onClick={() => onUpdateStatus(item.id, item.status === 'to_explore' ? 'explored' : 'to_explore')}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition flex items-center ${
              item.status === 'to_explore'
                ? 'bg-[#bb80091f] text-[#d29922] border-[#bb800960] hover:bg-[#bb800935]'
                : 'bg-[#23863626] text-[#3fb950] border-[#238636] hover:bg-[#23863640]'
            }`}
          >
            {item.status === 'to_explore' ? (
              <>⏳ To Explore</>
            ) : (
              <>
                <Check className="w-3 h-3 mr-1" /> Explored
              </>
            )}
          </button>

          {/* Git Clone Quick Copy Button (If GitHub) */}
          {isGitHub && (
            <button
              onClick={handleCopyClone}
              className="gh-btn-secondary text-[11px] py-1 px-[#2] flex items-center font-mono"
              title="Copy git clone command"
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
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden p-2">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] p-1.5 rounded-full hover:bg-[#30363d] transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt={item.title} className="max-w-full max-h-[85vh] object-contain rounded" />
          </div>
        </div>
      )}
    </>
  );
};
