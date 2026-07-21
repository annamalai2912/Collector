'use client';

import React, { useEffect, useState } from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { Search, X, ExternalLink, Bookmark, Star } from 'lucide-react';

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
  items: VaultItem[];
  onSelectCategory: (cat: string) => void;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({
  isOpen,
  onClose,
  items,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-xl w-full p-4 shadow-2xl space-y-3 animate-fade-in">
        {/* Input */}
        <div className="flex items-center space-x-2 border-b border-[#30363d] pb-2">
          <Search className="w-4 h-4 text-[#6e7681]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search items, repos, categories..."
            className="w-full bg-transparent text-sm text-[#f0f6fc] outline-none placeholder-[#6e7681]"
          />
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Quick Navigation */}
        {!query && (
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider block">
              Quick Categories Jump
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['Open Source', 'AI/ML Tools', 'Embedded/IoT', 'Design Inspiration', 'Reels/Shorts', 'Reads/Threads'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    onClose();
                  }}
                  className="bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-2.5 py-1 rounded text-xs transition"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto space-y-1 pt-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-[#8b949e] text-center py-6">No matching vault resources found.</p>
          ) : (
            filtered.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="flex items-center justify-between p-2 rounded hover:bg-[#21262d] transition group"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  {item.platform === 'github' ? (
                    <Star className="w-4 h-4 text-[#d29922] shrink-0" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-[#58a6ff] shrink-0" />
                  )}
                  <div className="truncate">
                    <div className="text-xs font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#8b949e] truncate">
                      {item.category} • {item.platform.toUpperCase()}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-[#58a6ff] shrink-0 ml-2" />
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
