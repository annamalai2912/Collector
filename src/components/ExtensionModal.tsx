'use client';

import React, { useState } from 'react';
import { X, Puzzle, Download, MousePointerClick, Check, Bookmark, FileCode, FolderArchive } from 'lucide-react';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({ isOpen, onClose }) => {
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  if (!isOpen) return null;

  const bookmarkletCode = `javascript:(function(){var u=encodeURIComponent(window.location.href);var t=encodeURIComponent(document.title);window.open('http://localhost:3000/share-target?url='+u+'&title='+t,'_blank','width=600,height=700');})();`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#23863626] border border-[#238636] rounded-lg">
              <Puzzle className="w-5 h-5 text-[#3fb950]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f0f6fc]">Browser Collector Extension</h2>
              <p className="text-xs text-[#8b949e]">Right-click any link on any website to save directly to Collector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded-md hover:bg-[#21262d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Chrome Extension Download & Right-Click Context Menu */}
        <div className="space-y-3 bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#58a6ff] flex items-center">
              <MousePointerClick className="w-4 h-4 mr-1.5" /> Option 1: Right-Click Chrome Extension
            </h3>
            <span className="text-[10px] bg-[#23863626] text-[#3fb950] border border-[#238636] px-2 py-0.5 rounded font-mono">
              Manifest V3
            </span>
          </div>

          <p className="text-xs text-[#8b949e] leading-relaxed">
            Adds a <strong className="text-[#c9d1d9]">"📌 Share link to Collector"</strong> option to your right-click context menu in Chrome, Edge, Brave, or Opera.
          </p>

          {/* Download Buttons Row */}
          <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-2">
            <a
              href="/extension/collector-extension.zip"
              download="collector-extension.zip"
              className="gh-btn-primary text-xs py-2 px-4 inline-flex items-center font-bold shadow-lg bg-[#238636] hover:bg-[#2ea043]"
            >
              <FolderArchive className="w-4 h-4 mr-2" /> Download Extension Package (.zip)
            </a>

            <a
              href="/extension/manifest.json"
              download="manifest.json"
              className="gh-btn-secondary text-xs py-2 px-3 inline-flex items-center font-mono"
            >
              <FileCode className="w-3.5 h-3.5 mr-1" /> manifest.json
            </a>

            <a
              href="/extension/background.js"
              download="background.js"
              className="gh-btn-secondary text-xs py-2 px-3 inline-flex items-center font-mono"
            >
              <FileCode className="w-3.5 h-3.5 mr-1" /> background.js
            </a>
          </div>

          {/* 3-Step Setup Instructions */}
          <div className="bg-[#161b22] p-3 rounded text-xs space-y-2 border border-[#30363d]/60 font-mono text-[#c9d1d9]">
            <p>1. Download <span className="text-[#3fb950]">collector-extension.zip</span> above and extract the zip folder.</p>
            <p>2. Open Chrome and navigate to: <span className="text-[#58a6ff]">chrome://extensions</span></p>
            <p>3. Turn ON <span className="text-[#d29922]">"Developer mode"</span> (top right corner).</p>
            <p>4. Click <span className="text-[#3fb950]">"Load unpacked"</span> and select the extracted folder!</p>
          </div>
        </div>

        {/* Option 2: 1-Click Browser Bookmarklet */}
        <div className="space-y-3 bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#d29922] flex items-center">
              <Bookmark className="w-4 h-4 mr-1.5" /> Option 2: 1-Click Bookmarklet Button
            </h3>
            <span className="text-[10px] bg-[#388bfd1a] text-[#58a6ff] border border-[#388bfd40] px-2 py-0.5 rounded font-mono">
              Works Everywhere
            </span>
          </div>

          <p className="text-xs text-[#8b949e]">
            Drag this button to your Browser Bookmarks Bar to save any web page in 1 click:
          </p>

          <div className="flex items-center space-x-3 pt-1">
            <a
              href={bookmarkletCode}
              onClick={(e) => e.preventDefault()}
              className="gh-btn-primary text-xs py-2 px-4 inline-flex items-center cursor-grab active:cursor-grabbing font-bold shadow-lg"
              title="Drag to your Bookmarks Bar!"
            >
              <Bookmark className="w-3.5 h-3.5 mr-1.5" /> 📌 Save to Collector
            </a>

            <button
              onClick={handleCopyBookmarklet}
              className="gh-btn-secondary text-xs py-2 px-3 flex items-center font-mono"
            >
              {copiedBookmarklet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3fb950] mr-1" /> Copied Code!
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1" /> Copy Bookmarklet Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="gh-btn-secondary text-xs px-4 py-1.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
