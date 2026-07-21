'use client';

import React, { useState } from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { Sparkles, RefreshCw, Check, ExternalLink } from 'lucide-react';

interface BacklogClearerProps {
  items: VaultItem[];
  onMarkExplored: (id: string) => void;
}

export const BacklogClearer: React.FC<BacklogClearerProps> = ({ items, onMarkExplored }) => {
  const unexplored = items.filter((i) => i.status === 'to_explore');
  const [seed, setSeed] = useState(0);

  if (unexplored.length === 0) return null;

  // Pick 2-3 random unexplored items
  const getRandomGems = () => {
    const shuffled = [...unexplored].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const gems = getRandomGems();

  return (
    <div className="bg-[#161b22] border border-[#388bfd40] rounded-lg p-4 mb-6 space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#58a6ff]" />
          <h3 className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
            Unexplored Gems ({unexplored.length} in backlog)
          </h3>
        </div>
        <button
          onClick={() => setSeed(seed + 1)}
          className="text-xs text-[#8b949e] hover:text-[#58a6ff] flex items-center transition"
          title="Shuffle suggestions"
        >
          <RefreshCw className="w-3 h-3 mr-1" /> Shuffle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {gems.map((item) => (
          <div
            key={item.id}
            className="bg-[#0d1117] border border-[#30363d] rounded p-3 flex flex-col justify-between space-y-2 hover:border-[#58a6ff] transition"
          >
            <div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#58a6ff] hover:underline flex items-center truncate"
              >
                <span className="truncate">{item.title}</span>
                <ExternalLink className="w-3 h-3 ml-1 shrink-0 opacity-75" />
              </a>
              <p className="text-[11px] text-[#8b949e] line-clamp-2 mt-1">
                {item.description || 'Saved resource waiting to be explored.'}
              </p>
            </div>

            <button
              onClick={() => onMarkExplored(item.id)}
              className="w-full text-[11px] bg-[#23863626] text-[#3fb950] border border-[#238636] hover:bg-[#23863640] rounded py-1 flex items-center justify-center transition font-medium"
            >
              <Check className="w-3 h-3 mr-1" /> Mark Explored
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
