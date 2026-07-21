'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  itemTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#f85149]/40 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#f85149]">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-[#f0f6fc]">Confirm Deletion</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-[#8b949e] leading-relaxed">
          Are you sure you want to delete{' '}
          <strong className="text-[#f0f6fc] font-semibold">
            {itemTitle.length > 80 ? itemTitle.substring(0, 80) + '…' : itemTitle}
          </strong>{' '}
          from your Link Vault Collector? This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="gh-btn-secondary text-xs px-3.5 py-1.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#da3633] text-white hover:bg-[#b82522] border border-[#f85149] text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center shadow transition"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Resource
          </button>
        </div>
      </div>
    </div>
  );
};
