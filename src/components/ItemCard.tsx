'use client';

import React, { useState } from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { RepoCard } from './RepoCard';
import { decodeHtmlEntities } from '@/lib/utils/htmlDecoder';
import {
  ExternalLink,
  Github,
  Instagram,
  Youtube,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  QrCode,
  Trash2,
  Tag,
} from 'lucide-react';

interface ItemCardProps {
  item: VaultItem;
  onUpdateStatus: (id: string, status: 'to_explore' | 'explored' | 'archived') => void;
  onUpdateCategory: (id: string, category: VaultItem['category']) => void;
  onDeleteItem: (id: string) => void;
  onOpenQRCode: (url: string, title: string) => void;
  viewMode: 'grid' | 'list';
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onUpdateStatus,
  onUpdateCategory,
  onDeleteItem,
  onOpenQRCode,
  viewMode,
}) => {
  const [showAISummary, setShowAISummary] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // If this item is a GitHub Repository, render the specialized RepoCard
  if (item.github_repo || item.platform === 'github') {
    return (
      <RepoCard
        item={item}
        onUpdateStatus={onUpdateStatus}
        onDeleteItem={onDeleteItem}
        onOpenQRCode={onOpenQRCode}
      />
    );
  }

  // Get Platform Badge Icon & Styling
  const getPlatformBadge = () => {
    switch (item.platform) {
      case 'instagram':
        return (
          <span className="inline-flex items-center text-[10px] font-semibold bg-[#e1306c1a] text-[#e1306c] border border-[#e1306c40] px-2 py-0.5 rounded-full">
            <Instagram className="w-3 h-3 mr-1" /> Instagram
          </span>
        );
      case 'threads':
        return (
          <span className="inline-flex items-center text-[10px] font-semibold bg-[#00000040] text-[#f0f6fc] border border-[#30363d] px-2 py-0.5 rounded-full">
            <span className="mr-1 text-xs font-mono">🧵</span> Threads
          </span>
        );
      case 'youtube':
        return (
          <span className="inline-flex items-center text-[10px] font-semibold bg-[#ff00001a] text-[#ff4e4e] border border-[#ff000040] px-2 py-0.5 rounded-full">
            <Youtube className="w-3 h-3 mr-1" /> YouTube
          </span>
        );
      case 'x':
        return (
          <span className="inline-flex items-center text-[10px] font-semibold bg-[#1d9bf01a] text-[#1d9bf0] border border-[#1d9bf040] px-2 py-0.5 rounded-full">
            <span className="mr-1 text-xs font-mono">𝕏</span> Twitter / X
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-semibold bg-[#388bfd1a] text-[#58a6ff] border border-[#388bfd40] px-2 py-0.5 rounded-full">
            <Globe className="w-3 h-3 mr-1" /> Web
          </span>
        );
    }
  };

  const formattedTitle = decodeHtmlEntities(item.title);
  const formattedDescription = decodeHtmlEntities(item.description || '');

  // Calculate Relative Date Stamp (e.g., "Just now", "2h ago", "Yesterday")
  const getRelativeDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 172800) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div
        className={`gh-card group transition hover:border-[#8b949e]/50 flex flex-col justify-between ${
          item.status === 'explored' ? 'opacity-85' : ''
        }`}
      >
        <div className="space-y-3">
          {/* Header Row: Platform Badge, Category Select, Action Buttons */}
          <div className="flex items-center justify-between gap-2 border-b border-[#30363d] pb-2.5">
            <div className="flex items-center space-x-2">
              {getPlatformBadge()}
              <select
                value={item.category}
                onChange={(e) => onUpdateCategory(item.id, e.target.value as any)}
                className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-[11px] rounded px-2 py-0.5 outline-none focus:border-[#58a6ff] cursor-pointer"
              >
                <option value="AI/ML Tools">⭐ AI/ML Tools</option>
                <option value="Open Source">⭐ Open Source</option>
                <option value="Embedded/IoT">🔌 Embedded/IoT</option>
                <option value="Design Inspiration">🎨 Design Inspiration</option>
                <option value="Reels/Shorts">🎬 Reels/Shorts</option>
                <option value="Reads/Threads">📰 Reads/Threads</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onOpenQRCode(item.url || '', formattedTitle)}
                title="Share QR Code"
                className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded hover:bg-[#21262d] transition"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                title="Delete Resource"
                className="p-1 text-[#8b949e] hover:text-[#f85149] rounded hover:bg-[#21262d] transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Date Badge */}
          <div className="flex items-center text-[10px] text-[#8b949e] font-mono">
            <Clock className="w-3 h-3 mr-1 text-[#6e7681]" />
            <span>{getRelativeDate(item.created_at)}</span>
          </div>

          {/* High-Resolution Media Thumbnail Image Banner */}
          {item.thumbnail_url && !imageError && (
            <div className="relative rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117] group/img">
              <img
                src={item.thumbnail_url}
                alt={formattedTitle}
                className="w-full h-36 object-cover group-hover/img:scale-105 transition duration-300 cursor-pointer"
                onError={() => setImageError(true)}
                onClick={() => setIsLightboxOpen(true)}
              />
            </div>
          )}

          {/* Title & External Link */}
          <div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#f0f6fc] hover:text-[#58a6ff] transition flex items-center group-hover:underline leading-snug"
            >
              <span className="line-clamp-2">{formattedTitle}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1.5 shrink-0 opacity-70 group-hover:opacity-100 text-[#58a6ff]" />
            </a>
            {formattedDescription && (
              <p className="text-xs text-[#8b949e] line-clamp-2 mt-1 leading-relaxed">
                {formattedDescription}
              </p>
            )}
          </div>

          {/* AI Key Takeaways Toggle */}
          {item.ai_summary && (
            <div className="border-t border-[#30363d]/60 pt-2.5">
              <button
                onClick={() => setShowAISummary(!showAISummary)}
                className="flex items-center text-xs font-semibold text-[#3fb950] hover:text-[#2ea043] transition"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>AI Key Takeaways</span>
                {showAISummary ? (
                  <ChevronUp className="w-3.5 h-3.5 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                )}
              </button>

              {showAISummary && (
                <div className="mt-2 p-3 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] space-y-1.5 font-mono leading-relaxed animate-fade-in">
                  {item.ai_summary.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded-full border border-[#30363d] font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions: Status Toggle */}
        <div className="pt-3 border-t border-[#30363d] mt-3 flex items-center justify-between">
          <button
            onClick={() =>
              onUpdateStatus(item.id, item.status === 'explored' ? 'to_explore' : 'explored')
            }
            className={`text-xs px-3 py-1 rounded font-medium transition flex items-center ${
              item.status === 'explored'
                ? 'bg-[#23863626] text-[#3fb950] border border-[#238636]'
                : 'bg-[#bb800926] text-[#d29922] border border-[#bb8009] hover:bg-[#bb800940]'
            }`}
          >
            {item.status === 'explored' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Explored
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 mr-1.5" /> To Explore
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lightbox Modal for Full-Screen Image View */}
      {isLightboxOpen && item.thumbnail_url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
        >
          <img
            src={item.thumbnail_url}
            alt={formattedTitle}
            className="max-w-full max-h-full rounded-lg object-contain border border-[#30363d] shadow-2xl"
          />
        </div>
      )}
    </>
  );
};
