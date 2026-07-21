'use client';

import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ + K', desc: 'Open Command Palette & Search' },
    { key: 'N', desc: 'Add new link / social post' },
    { key: 'S', desc: 'Import GitHub Starred Repos' },
    { key: 'I', desc: 'Open Vault Insights & Analytics' },
    { key: 'E', desc: 'Export Vault Data (JSON / CSV)' },
    { key: 'Esc', desc: 'Close open modals & dialogs' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fade-in">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center space-x-2">
            <Command className="w-4 h-4 text-[#58a6ff]" />
            <h3 className="text-sm font-semibold text-[#f0f6fc]">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between text-xs py-1 border-b border-[#30363d]/40">
              <span className="text-[#c9d1d9]">{sc.desc}</span>
              <kbd className="bg-[#0d1117] border border-[#30363d] text-[#58a6ff] font-mono px-2 py-0.5 rounded font-bold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
