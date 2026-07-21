'use client';

import React, { useState } from 'react';
import { VaultItem, TechStack } from '@/lib/supabase/client';
import { Layers, Plus, ExternalLink, Sparkles, Check } from 'lucide-react';

interface TechStacksViewProps {
  items: VaultItem[];
}

export const TechStacksView: React.FC<TechStacksViewProps> = ({ items }) => {
  const [stacks, setStacks] = useState<TechStack[]>([
    {
      id: 'stack-1',
      name: '🤖 AI Vector Search Stack 2026',
      description: 'Production vector embedding pipeline for Next.js, ChromaDB, and OpenAI embeddings.',
      item_ids: ['demo-1', 'demo-2'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'stack-2',
      name: '🔌 ESP32 Wireless Sensor Stack',
      description: 'C++ Arduino core with BLE peripheral configuration for remote hardware nodes.',
      item_ids: ['demo-3'],
      created_at: new Date().toISOString(),
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleCreate = () => {
    if (!name) return;
    const newStack: TechStack = {
      id: 'stack-' + Date.now(),
      name,
      description,
      item_ids: selectedIds,
      created_at: new Date().toISOString(),
    };
    setStacks([...stacks, newStack]);
    setName('');
    setDescription('');
    setSelectedIds([]);
    setIsCreating(false);
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#58a6ff]" />
            <h2 className="text-base font-semibold text-[#f0f6fc]">Tech Stacks & Presets</h2>
            <span className="bg-[#21262d] text-[#8b949e] text-xs px-2 py-0.5 rounded-full border border-[#30363d] font-mono">
              {stacks.length} Stacks
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Group saved tools, libraries, and repos into reusable, runnable tech stack bundles.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gh-btn-primary text-xs flex items-center shrink-0 py-2 px-3 shadow"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Build New Stack
        </button>
      </div>

      {/* Create Modal Form */}
      {isCreating && (
        <div className="bg-[#161b22] border border-[#388bfd40] rounded-lg p-4 space-y-3 animate-fade-in shadow-xl">
          <h3 className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">Create Tech Stack Bundle</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Stack Name (e.g. Next.js + Supabase AI Stack)"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-[#c9d1d9] outline-none focus:border-[#58a6ff]"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Stack description & architecture notes..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-[#c9d1d9] outline-none"
          />

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#8b949e] uppercase">Select Items to Include:</label>
            <div className="max-h-40 overflow-y-auto space-y-1 bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`p-1.5 rounded flex items-center justify-between cursor-pointer transition ${
                    selectedIds.includes(item.id) ? 'bg-[#388bfd1a] border border-[#388bfd40]' : 'hover:bg-[#21262d]'
                  }`}
                >
                  <span className="text-[#c9d1d9] truncate">{item.title}</span>
                  {selectedIds.includes(item.id) && <Check className="w-3.5 h-3.5 text-[#58a6ff]" />}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsCreating(false)} className="gh-btn-secondary text-xs">
              Cancel
            </button>
            <button onClick={handleCreate} className="gh-btn-primary text-xs">
              Create Stack
            </button>
          </div>
        </div>
      )}

      {/* Stacks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stacks.map((stack) => {
          const stackItems = items.filter((i) => stack.item_ids.includes(i.id));

          return (
            <div key={stack.id} className="gh-card p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc]">{stack.name}</h3>
                <p className="text-xs text-[#8b949e] mt-1">{stack.description}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#30363d]/50">
                <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Included Tools ({stackItems.length}):</span>
                <div className="space-y-1">
                  {stackItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-[#0d1117] border border-[#30363d] rounded flex items-center justify-between text-xs text-[#58a6ff] hover:underline"
                    >
                      <span className="truncate">{item.title}</span>
                      <ExternalLink className="w-3 h-3 text-[#6e7681] ml-2 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
