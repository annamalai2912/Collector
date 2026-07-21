'use client';

import React, { useState, useEffect } from 'react';
import { VaultItem, supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ItemCard } from '@/components/ItemCard';
import { RepoVaultView } from '@/components/RepoVaultView';
import { CodeSnippetsView } from '@/components/CodeSnippetsView';
import { TechStacksView } from '@/components/TechStacksView';
import { QuickAddModal } from '@/components/QuickAddModal';
import { GitHubStarSyncModal } from '@/components/GitHubStarSyncModal';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { BacklogClearer } from '@/components/BacklogClearer';
import { QRCodeModal } from '@/components/QRCodeModal';
import { CommandSearch } from '@/components/CommandSearch';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { ExportModal } from '@/components/ExportModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ExtensionModal } from '@/components/ExtensionModal';
import { MobileSetupModal } from '@/components/MobileSetupModal';
import { VaultKeyModal } from '@/components/VaultKeyModal';
import { Loader2, Bookmark, Plus } from 'lucide-react';
import { cleanInstagramTitle, decodeHtmlEntities } from '@/lib/utils/htmlDecoder';
import { canonicalizeUrl } from '@/lib/utils/url';

export default function Home() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'repos' | 'snippets' | 'stacks'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-Device Vault Sync Key State
  const [vaultKey, setVaultKey] = useState('collector-master');

  // Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title_asc'

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStarSyncOpen, setIsStarSyncOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isVaultKeyOpen, setIsVaultKeyOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // Load Vault Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('collector_vault_key');
    if (savedKey) setVaultKey(savedKey);
  }, []);

  const handleSaveVaultKey = (key: string) => {
    setVaultKey(key);
    localStorage.setItem('collector_vault_key', key);
  };

  // 100% Pure Supabase Cloud Fetching
  const loadItems = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error('Failed to load items from Supabase Cloud:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();

    // Auto-sync when user switches back to Link Vault tab
    const handleFocus = () => loadItems(true);
    window.addEventListener('focus', handleFocus);

    // Background poll every 4 seconds for background extension & mobile items
    const pollInterval = setInterval(() => loadItems(true), 4000);

    // Supabase Realtime Postgres Broadcast Channel
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('realtime-items-sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'items' },
            () => loadItems(true)
          )
          .subscribe();
      } catch (e) {
        console.error('Realtime subscription error:', e);
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Global Keyboard Hotkeys (N, S, I, E, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsAddModalOpen(true);
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsStarSyncOpen(true);
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsAnalyticsOpen(true);
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Item Mutations
  const handleUpdateStatus = async (id: string, newStatus: 'to_explore' | 'explored' | 'archived') => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleUpdateCategory = async (id: string, newCategory: VaultItem['category']) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, category: newCategory } : item)));
    await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCategory }),
    });
  };

  // Trigger Delete Confirmation Modal
  const onRequestDeleteItem = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  // Confirmed Delete Execution
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeleteTarget(null);
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
  };

  const handleItemAdded = (newItem: VaultItem) => {
    setItems((prev) => {
      const canonicalNew = canonicalizeUrl(newItem.url || '');
      const filtered = prev.filter(
        (item) => item.id !== newItem.id && (canonicalNew === '' || canonicalizeUrl(item.url || '') !== canonicalNew)
      );
      return [newItem, ...filtered];
    });
  };

  const handleStarsImported = (imported: VaultItem[]) => {
    setItems((prev) => [...imported, ...prev]);
    setActiveTab('repos');
  };

  // Main Page Saved Items (Excludes imported star sync repos to keep main page clean)
  const mainSavedItems = items.filter((item) => !item.id.startsWith('gh-star-'));

  // Derived Statistics
  const counts = {
    all: mainSavedItems.length,
    toExplore: mainSavedItems.filter((i) => i.status === 'to_explore').length,
    explored: mainSavedItems.filter((i) => i.status === 'explored').length,
    repos: items.filter((i) => i.platform === 'github' || Boolean(i.github_repo) || i.url?.includes('github.com')).length,
  };

  // Filtered & Sorted List for Main View
  const filteredItems = mainSavedItems
    .filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
      const matchQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      // Date Range Filtering
      let matchDate = true;
      if (dateFilter !== 'all' && item.created_at) {
        const itemDate = new Date(item.created_at).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          matchDate = now - itemDate <= 86400000;
        } else if (dateFilter === 'week') {
          matchDate = now - itemDate <= 86400000 * 7;
        } else if (dateFilter === 'month') {
          matchDate = now - itemDate <= 86400000 * 30;
        }
      }

      return matchCategory && matchStatus && matchPlatform && matchQuery && matchDate;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      // Default: Newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenStarSyncModal={() => setIsStarSyncOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onTriggerSearch={() => setIsCommandSearchOpen(true)}
        onOpenExtension={() => setIsExtensionOpen(true)}
        onOpenMobile={() => setIsMobileOpen(true)}
        onOpenVaultKey={() => setIsVaultKeyOpen(true)}
        itemCounts={counts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'repos' ? (
          <RepoVaultView
            items={items}
            onUpdateStatus={handleUpdateStatus}
            onOpenStarSync={() => setIsStarSyncOpen(true)}
          />
        ) : activeTab === 'snippets' ? (
          <CodeSnippetsView />
        ) : activeTab === 'stacks' ? (
          <TechStacksView items={items} />
        ) : (
          <div className="space-y-6">
            {/* Backlog Clearer Widget */}
            <BacklogClearer
              items={mainSavedItems}
              onMarkExplored={(id) => handleUpdateStatus(id, 'explored')}
            />

            {/* Filter & Sorting Bar */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              itemCounts={counts}
            />

            {/* Loading Indicator */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-[#8b949e]">
                <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#58a6ff]" />
                <span className="text-xs font-mono">Loading Link Vault resources...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-[#161b22] border border-[#30363d] rounded-lg space-y-3">
                <Bookmark className="w-10 h-10 text-[#6e7681] mx-auto" />
                <h3 className="text-sm font-semibold text-[#f0f6fc]">No Saved Resources Found</h3>
                <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
                  Paste a URL, share a Threads/Instagram post, or use the quick add button below to save your first resource.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="gh-btn-primary text-xs inline-flex items-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add First Item
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                }
              >
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteItem={(id) => onRequestDeleteItem(id, cleanInstagramTitle(decodeHtmlEntities(item.title)))}
                    onOpenQRCode={(url, title) => setQrModalData({ isOpen: true, url, title })}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={handleItemAdded}
      />

      <GitHubStarSyncModal
        isOpen={isStarSyncOpen}
        onClose={() => setIsStarSyncOpen(false)}
        onStarsImported={handleStarsImported}
      />

      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        items={items}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        items={items}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <CommandSearch
        isOpen={isCommandSearchOpen}
        onClose={() => setIsCommandSearchOpen(false)}
        items={items}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ isOpen: false, url: '', title: '' })}
        url={qrModalData.url}
        title={qrModalData.title}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        itemTitle={deleteTarget?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ExtensionModal
        isOpen={isExtensionOpen}
        onClose={() => setIsExtensionOpen(false)}
      />

      <MobileSetupModal
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      <VaultKeyModal
        isOpen={isVaultKeyOpen}
        onClose={() => setIsVaultKeyOpen(false)}
        vaultKey={vaultKey}
        onSaveVaultKey={handleSaveVaultKey}
      />
    </div>
  );
}
