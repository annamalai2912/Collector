'use client';

import React from 'react';
import { X, Smartphone, Share2, Send, QrCode, Check } from 'lucide-react';

interface MobileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSetupModal: React.FC<MobileSetupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#388bfd1a] border border-[#388bfd40] rounded-lg">
              <Smartphone className="w-5 h-5 text-[#58a6ff]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f0f6fc]">Mobile Link Collector Setup</h2>
              <p className="text-xs text-[#8b949e]">Zero-friction mobile saving options for iOS & Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded-md hover:bg-[#21262d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method 1: Native Mobile Share Sheet */}
        <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#3fb950] flex items-center">
              <Share2 className="w-4 h-4 mr-1.5" /> Method 1: Native Mobile Share Sheet (iOS / Android)
            </h3>
            <span className="text-[10px] bg-[#23863626] text-[#3fb950] border border-[#238636] px-2 py-0.5 rounded font-mono">
              Recommended
            </span>
          </div>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            1. Open <span className="text-[#f0f6fc]">http://localhost:3000</span> or your deployed URL on your phone's browser (Safari or Chrome).
          </p>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            2. Tap <strong className="text-[#58a6ff]">"Share"</strong> -&gt; <strong className="text-[#f0f6fc]">"Add to Home Screen"</strong>.
          </p>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            3. Now, whenever you see a post on Threads, Instagram, YouTube, or Twitter, tap <strong className="text-[#3fb950]">Share...</strong> and select <strong className="text-[#f0f6fc]">Collector</strong>!
          </p>
        </div>

        {/* Method 2: Telegram Bot Integration */}
        <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#58a6ff] flex items-center">
              <Send className="w-4 h-4 mr-1.5" /> Method 2: Telegram Saver Bot
            </h3>
            <span className="text-[10px] bg-[#388bfd1a] text-[#58a6ff] border border-[#388bfd40] px-2 py-0.5 rounded font-mono">
              Instant Sync
            </span>
          </div>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            Share any post link directly to your private Telegram bot on mobile. The webhook auto-scrapes AI metadata and syncs directly to your vault.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="gh-btn-secondary text-xs px-4 py-1.5">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
