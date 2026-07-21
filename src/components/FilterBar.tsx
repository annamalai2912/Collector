'use client';

import React from 'react';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (plat: string) => void;
  dateFilter: string;
  setDateFilter: (dateRange: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  itemCounts: { all: number; toExplore: number; explored: number };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedPlatform,
  setSelectedPlatform,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  itemCounts,
}) => {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 mb-6 space-y-3 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources, topics, tags..."
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md pl-9 pr-3 py-2 text-xs text-[#c9d1d9] outline-none transition placeholder:text-[#6e7681]"
          />
        </div>

        {/* Responsive Filters Grid for Mobile & Desktop */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-[11px] sm:text-xs rounded-md px-2 py-1.5 outline-none focus:border-[#58a6ff] truncate"
          >
            <option value="all">📁 All Categories</option>
            <option value="Open Source">⭐ Open Source</option>
            <option value="AI/ML Tools">🤖 AI/ML Tools</option>
            <option value="Embedded/IoT">🔌 Embedded/IoT</option>
            <option value="Design Inspiration">🎨 Design Inspiration</option>
            <option value="Reels/Shorts">🎬 Reels/Shorts</option>
            <option value="Reads/Threads">📰 Reads/Threads</option>
          </select>

          {/* Platform Selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-[11px] sm:text-xs rounded-md px-2 py-1.5 outline-none focus:border-[#58a6ff] truncate"
          >
            <option value="all">🌐 All Platforms</option>
            <option value="github">🐙 GitHub</option>
            <option value="threads">🧵 Threads</option>
            <option value="instagram">📸 Instagram</option>
            <option value="youtube">▶️ YouTube</option>
            <option value="x">𝕏 Twitter / X</option>
          </select>

          {/* Date Filter Range */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-[11px] sm:text-xs rounded-md px-2 py-1.5 outline-none focus:border-[#58a6ff] truncate"
          >
            <option value="all">📅 All Time</option>
            <option value="today">⚡ Saved Today</option>
            <option value="week">📅 Saved This Week</option>
            <option value="month">🗓️ Saved This Month</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-[11px] sm:text-xs rounded-md px-2 py-1.5 outline-none focus:border-[#58a6ff] truncate"
          >
            <option value="newest">⬇️ Newest First</option>
            <option value="oldest">⬆️ Oldest First</option>
            <option value="title_asc">🔤 Title A-Z</option>
          </select>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-[#0d1117] border border-[#30363d] rounded-md p-0.5 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-[#21262d] text-[#f0f6fc]' : 'text-[#8b949e]'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-[#21262d] text-[#f0f6fc]' : 'text-[#8b949e]'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Badges */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar pt-1 border-t border-[#30363d]/50">
        <span className="text-[#8b949e] flex items-center mr-1 text-[11px] shrink-0">
          <Filter className="w-3 h-3 mr-1" /> Status:
        </span>
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-2.5 py-1 rounded-full border text-[11px] transition shrink-0 ${
            selectedStatus === 'all'
              ? 'bg-[#23863626] text-[#3fb950] border-[#238636]'
              : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]'
          }`}
        >
          All ({itemCounts.all})
        </button>

        <button
          onClick={() => setSelectedStatus('to_explore')}
          className={`px-2.5 py-1 rounded-full border text-[11px] transition shrink-0 ${
            selectedStatus === 'to_explore'
              ? 'bg-[#bb800926] text-[#d29922] border-[#bb8009]'
              : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]'
          }`}
        >
          ⏳ To Explore ({itemCounts.toExplore})
        </button>

        <button
          onClick={() => setSelectedStatus('explored')}
          className={`px-2.5 py-1 rounded-full border text-[11px] transition shrink-0 ${
            selectedStatus === 'explored'
              ? 'bg-[#388bfd1a] text-[#58a6ff] border-[#388bfd40]'
              : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]'
          }`}
        >
          ✅ Explored ({itemCounts.explored})
        </button>
      </div>
    </div>
  );
};
