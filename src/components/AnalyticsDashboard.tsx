'use client';

import React from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { X, BarChart3, CheckCircle2, Clock, Star, Layers, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  items: VaultItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  const total = items.length;
  const explored = items.filter((i) => i.status === 'explored').length;
  const toExplore = items.filter((i) => i.status === 'to_explore').length;
  const explorePercent = total > 0 ? Math.round((explored / total) * 100) : 0;

  // Category counts
  const categories: Record<string, number> = {};
  items.forEach((i) => {
    categories[i.category] = (categories[i.category] || 0) + 1;
  });

  // Platform counts
  const platforms: Record<string, number> = {};
  items.forEach((i) => {
    platforms[i.platform] = (platforms[i.platform] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="bg-[#161b22] border-l border-[#30363d] max-w-md w-full h-full p-6 overflow-y-auto space-y-6 animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#58a6ff]" />
            <h3 className="text-base font-semibold text-[#f0f6fc]">Vault Insights & Analytics</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <div className="text-xs text-[#8b949e] font-medium flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-[#58a6ff]" /> Total Saved
            </div>
            <div className="text-xl font-bold text-[#f0f6fc] mt-1 font-mono">{total}</div>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <div className="text-xs text-[#8b949e] font-medium flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1 text-[#3fb950]" /> Explore Rate
            </div>
            <div className="text-xl font-bold text-[#3fb950] mt-1 font-mono">{explorePercent}%</div>
          </div>
        </div>

        {/* Explore Progress Bar */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b949e] font-medium flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#d29922]" /> Backlog ({toExplore})
            </span>
            <span className="text-[#3fb950] font-medium flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Reviewed ({explored})
            </span>
          </div>
          <div className="w-full bg-[#21262d] h-2.5 rounded-full overflow-hidden flex">
            <div className="bg-[#3fb950] h-full transition-all duration-300" style={{ width: `${explorePercent}%` }} />
            <div className="bg-[#d29922] h-full transition-all duration-300" style={{ width: `${100 - explorePercent}%` }} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Category Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(categories).map(([cat, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#c9d1d9]">
                    <span>{cat}</span>
                    <span className="font-mono text-[#8b949e]">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden border border-[#30363d]">
                    <div className="bg-[#58a6ff] h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Top Source Platforms</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(platforms).map(([plat, count]) => (
              <div key={plat} className="bg-[#0d1117] border border-[#30363d] rounded p-2.5 flex items-center justify-between">
                <span className="uppercase font-mono text-[#c9d1d9]">{plat}</span>
                <span className="font-mono font-bold text-[#58a6ff]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
