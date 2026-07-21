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
  Lock,
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
  onOpenVaultKey: () => void;
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
  onOpenVaultKey,
  itemCounts,
}) => {
  return (
    <>
      {/* Top Header Navigation */}
      <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117] flex items-center justify-center shadow-lg group shrink-0">
                <img
                  src="/logo.png"
                  alt="Collector Logo"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm sm:text-base font-bold text-[#f0f6fc] tracking-tight">Collector</span>
                  <span className="text-[10px] bg-[#23863626] text-[#3fb950] border border-[#238636] px-1.5 py-0.2 rounded font-mono">
                    v1.0
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#8b949e]">Resource & Vault Saver</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
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
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onTriggerSearch}
                title="Search Command Palette"
                className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenVaultKey}
                title="Multi-Device Sync Key & Passcode"
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-[#3fb950] hover:bg-[#21262d] rounded-md transition flex items-center font-medium text-xs border border-[#30363d]"
              >
                <Lock className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Sync Key</span>
              </button>

              <button
                onClick={onOpenExtension}
                title="Install Extension / Plugin"
                className="gh-btn-secondary text-xs py-1.5 px-2.5 hidden sm:flex items-center font-medium"
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
                onClick={onOpenAddModal}
                className="gh-btn-primary text-xs py-1.5 px-2.5 sm:px-3 flex items-center shadow"
              >
                <Plus className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Add Link</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for Mobile Screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161b22]/95 backdrop-blur-lg border-t border-[#30363d] h-14 flex items-center justify-around px-2 shadow-2xl">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium transition ${
            activeTab === 'all' ? 'text-[#3fb950]' : 'text-[#8b949e]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('repos')}
          className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium transition ${
            activeTab === 'repos' ? 'text-[#3fb950]' : 'text-[#8b949e]'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>Repos</span>
        </button>

        {/* Center Mobile Quick Add Floating Button */}
        <button
          onClick={onOpenAddModal}
          className="w-10 h-10 rounded-full bg-[#238636] hover:bg-[#2ea043] text-white flex items-center justify-center shadow-lg -mt-4 border-2 border-[#0d1117] transition active:scale-95"
          title="Add Link"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('snippets')}
          className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium transition ${
            activeTab === 'snippets' ? 'text-[#3fb950]' : 'text-[#8b949e]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Snippets</span>
        </button>

        <button
          onClick={onOpenMobile}
          className="flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium text-[#8b949e] hover:text-[#58a6ff] transition"
        >
          <Smartphone className="w-4 h-4 text-[#58a6ff]" />
          <span>Share</span>
        </button>
      </div>
    </>
  );
};
