'use client';

import React, { useState } from 'react';
import { X, Sparkles, Link as LinkIcon, Upload, Loader2, Check } from 'lucide-react';
import { extractLinkFromText } from '@/lib/metadata/linkExtractor';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (newItem: any) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onItemAdded }) => {
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState<'AI/ML Tools' | 'Open Source' | 'Embedded/IoT' | 'Design Inspiration' | 'Reels/Shorts' | 'Reads/Threads'>('Open Source');
  const [notes, setNotes] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const extracted = extractLinkFromText(inputText);

  const handleSave = async () => {
    if (!inputText && !screenshotUrl) return;

    setLoading(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: extracted.targetUrl || inputText,
          raw_shared_text: inputText,
          category,
          notes: notes || extracted.cleanNotes,
          screenshot_url: screenshotUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          onItemAdded(data.item);
          setInputText('');
          setNotes('');
          setScreenshotUrl(null);
          onClose();
        }
      }
    } catch (e) {
      console.error('Failed to add item:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-[#238636] rounded flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#f0f6fc]">Add Link or Shared Post</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Text / URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block">
            Paste URL or Shared Social Post (Threads / IG / YouTube / GitHub)
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Paste a link or full shared post description..."
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md p-2.5 text-xs text-[#c9d1d9] outline-none transition font-sans"
          />
        </div>

        {/* Auto Extracted Link Preview */}
        {extracted.targetUrl && (
          <div className="bg-[#0d1117] border border-[#388bfd40] rounded p-2.5 text-xs space-y-1">
            <div className="flex items-center text-[#58a6ff] font-mono">
              <LinkIcon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span className="truncate">{extracted.targetUrl}</span>
            </div>
            <p className="text-[11px] text-[#8b949e]">
              Detected platform: <strong className="text-[#c9d1d9] uppercase">{extracted.sourcePlatform}</strong>
            </p>
          </div>
        )}

        {/* Screenshot Drag & Drop Upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block">
            Or Upload Screenshot (Optional)
          </label>
          <div className="border-2 border-dashed border-[#30363d] hover:border-[#8b949e] rounded-md p-3 text-center bg-[#0d1117] transition cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {screenshotUrl ? (
              <div className="flex items-center justify-center space-x-2 text-xs text-[#3fb950]">
                <Check className="w-4 h-4" />
                <span>Screenshot attached</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-xs text-[#8b949e]">
                <Upload className="w-4 h-4 text-[#6e7681]" />
                <span>Drag & drop screenshot or click to browse</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md p-2 text-xs text-[#c9d1d9] outline-none"
          >
            <option value="Open Source">⭐ Open Source</option>
            <option value="AI/ML Tools">🤖 AI/ML Tools</option>
            <option value="Embedded/IoT">🔌 Embedded/IoT</option>
            <option value="Design Inspiration">🎨 Design Inspiration</option>
            <option value="Reels/Shorts">🎬 Reels/Shorts</option>
            <option value="Reads/Threads">📰 Reads/Threads</option>
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block">
            Notes / Tags (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add custom notes..."
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md p-2 text-xs text-[#c9d1d9] outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end space-x-2">
          <button onClick={onClose} className="gh-btn-secondary text-xs">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || (!inputText && !screenshotUrl)}
            className="gh-btn-primary text-xs flex items-center shadow disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
            Save to Vault
          </button>
        </div>
      </div>
    </div>
  );
};
