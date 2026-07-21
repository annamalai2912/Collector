'use client';

import React, { useState } from 'react';
import { X, Star, Loader2, Check } from 'lucide-react';

interface GitHubStarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStarsImported: (newItems: any[]) => void;
}

export const GitHubStarSyncModal: React.FC<GitHubStarSyncModalProps> = ({
  isOpen,
  onClose,
  onStarsImported,
}) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSync = async () => {
    if (!username) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/github/import-stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (res.ok && data.items) {
        onStarsImported(data.items);
        setMessage(`Successfully imported ${data.importedCount} starred repos!`);
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1500);
      } else {
        setMessage(data.message || data.error || 'Failed to import starred repos.');
      }
    } catch (e) {
      setMessage('Error connecting to GitHub API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-[#d29922] fill-[#d29922]" />
            <h3 className="text-base font-semibold text-[#f0f6fc]">GitHub Star Sync</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#8b949e] leading-relaxed">
          Enter any public GitHub username to automatically fetch and import public starred repositories into your dedicated GitHub Repo Vault.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block">
            GitHub Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. torvalds or shadcn"
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md p-2.5 text-xs text-[#c9d1d9] outline-none font-mono"
          />
        </div>

        {message && (
          <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#3fb950] flex items-center">
            <Check className="w-4 h-4 mr-1.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-end space-x-2">
          <button onClick={onClose} className="gh-btn-secondary text-xs">
            Cancel
          </button>
          <button
            onClick={handleSync}
            disabled={loading || !username}
            className="gh-btn-primary text-xs flex items-center shadow disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />}
            Sync Starred Repos
          </button>
        </div>
      </div>
    </div>
  );
};
