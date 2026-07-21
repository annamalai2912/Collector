'use client';

import React from 'react';
import {
  Bookmark,
  Github,
  Plus,
  BarChart3,
  Download,
  Search,
  Sparkles,
  Command,
  HelpCircle,
  Puzzle,
  Smartphone,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'all' | 'repos' | 'snippets' | 'stacks';
  setActiveTab: (tab: 'all' | 'repos' | 'snippets' | 'stacks') => void;
  onOpenAddModal: () => void;
  onOpenStarSyncModal: () => void;
  onOpenAnalytics: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onTriggerSearch: () => void;
  onOpenExtension: () => void;
  onOpenMobile: () => void;
  itemCounts: { all: number; repos: number };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenStarSyncModal,
  onOpenAnalytics,
  onOpenExport,
  onOpenShortcuts,
  onTriggerSearch,
  onOpenExtension,
  onOpenMobile,
  itemCounts,
}) => {
  return (
    <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#238636] flex items-center justify-center text-white shadow">
              <Bookmark className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-[#f0f6fc] tracking-tight">Collector</span>
                <span className="text-[10px] bg-[#23863626] text-[#3fb950] border border-[#238636] px-1.5 py-0.2 rounded font-mono">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e]">Developer Resource & Vault Saver</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center ${
                activeTab === 'all'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 mr-1.5" /> All Saved ({itemCounts.all})
            </button>
            <button
              onClick={() => setActiveTab('repos')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center ${
                activeTab === 'repos'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <Github className="w-3.5 h-3.5 mr-1.5" /> ⭐ Repo Vault ({itemCounts.repos})
            </button>
            <button
              onClick={() => setActiveTab('snippets')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center ${
                activeTab === 'snippets'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#d29922]" /> Code Snippets
            </button>
            <button
              onClick={() => setActiveTab('stacks')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center ${
                activeTab === 'stacks'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-[#58a6ff]" /> Tech Stacks
            </button>
          </nav>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onTriggerSearch}
              title="Command Palette (⌘K)"
              className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition border border-transparent hover:border-[#30363d]"
            >
              <Command className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenExtension}
              title="Install Extension / Plugin"
              className="gh-btn-secondary text-xs py-1.5 px-2.5 flex items-center font-medium"
            >
              <Puzzle className="w-3.5 h-3.5 mr-1.5 text-[#3fb950]" /> Extension
            </button>

            <button
              onClick={onOpenMobile}
              title="Mobile Setup Guide (iOS / Android)"
              className="gh-btn-secondary text-xs py-1.5 px-2.5 hidden sm:flex items-center font-medium"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1.5 text-[#58a6ff]" /> Mobile
            </button>

            <button
              onClick={onOpenStarSyncModal}
              title="Import GitHub Starred Repos"
              className="gh-btn-secondary text-xs py-1.5 px-2.5 hidden lg:flex items-center"
            >
              <Github className="w-3.5 h-3.5 mr-1.5" /> Star Sync
            </button>

            <button
              onClick={onOpenAnalytics}
              title="Analytics Dashboard"
              className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition hidden lg:block"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenExport}
              title="Export Vault Data"
              className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition hidden lg:block"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (?)"
              className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition hidden xl:block"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAddModal}
              className="gh-btn-primary text-xs py-1.5 px-3 flex items-center shadow"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
