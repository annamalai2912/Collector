'use client';

import React from 'react';
import { VaultItem } from '@/lib/supabase/client';
import { X, Download, FileJson, FileSpreadsheet } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: VaultItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  const downloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `link-vault-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadCSV = () => {
    const headers = ['id', 'title', 'url', 'category', 'platform', 'status', 'created_at'];
    const rows = items.map((item) => [
      `"${item.id}"`,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${item.url || ''}"`,
      `"${item.category}"`,
      `"${item.platform}"`,
      `"${item.status}"`,
      `"${item.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `link-vault-backup-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fade-in text-center">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-[#58a6ff]" />
            <h3 className="text-sm font-semibold text-[#f0f6fc]">Export Vault Data</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#8b949e]">
          Export all <strong className="text-[#c9d1d9]">{items.length} saved resources</strong> to offline files.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={downloadJSON}
            className="gh-btn-secondary py-3 text-xs flex flex-col items-center justify-center space-y-1.5 hover:border-[#58a6ff]"
          >
            <FileJson className="w-6 h-6 text-[#58a6ff]" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={downloadCSV}
            className="gh-btn-secondary py-3 text-xs flex flex-col items-center justify-center space-y-1.5 hover:border-[#3fb950]"
          >
            <FileSpreadsheet className="w-6 h-6 text-[#3fb950]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
