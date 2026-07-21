'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url, title }) => {
  if (!isOpen || !url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-sm w-full p-6 shadow-2xl space-y-4 text-center animate-fade-in">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-[#58a6ff]" />
            <h3 className="text-sm font-semibold text-[#f0f6fc]">Mobile QR Handoff</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#8b949e]">
          Scan with your smartphone camera to open <strong className="text-[#c9d1d9]">{title}</strong> instantly.
        </p>

        <div className="p-4 bg-white rounded-lg inline-block mx-auto border border-[#30363d] shadow-md">
          <QRCodeSVG value={url} size={180} fgColor="#0d1117" bgColor="#ffffff" level="M" />
        </div>

        <div className="pt-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#58a6ff] hover:underline flex items-center justify-center font-mono truncate max-w-xs mx-auto"
          >
            <span className="truncate">{url}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
};
