'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Key, ShieldCheck, Check, RefreshCw, Smartphone, Laptop } from 'lucide-react';

interface VaultKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultKey: string;
  onSaveVaultKey: (key: string) => void;
}

export const VaultKeyModal: React.FC<VaultKeyModalProps> = ({
  isOpen,
  onClose,
  vaultKey,
  onSaveVaultKey,
}) => {
  const [inputKey, setInputKey] = useState(vaultKey || 'collector-master');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInputKey(vaultKey || 'collector-master');
  }, [vaultKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    onSaveVaultKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#23863626] border border-[#238636] rounded-lg">
              <Lock className="w-5 h-5 text-[#3fb950]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f0f6fc]">Multi-Device Realtime Sync Key</h2>
              <p className="text-xs text-[#8b949e]">Connect all mobile phones, extensions, & laptops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded-md hover:bg-[#21262d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950] animate-pulse" />
            <span className="text-xs font-mono text-[#c9d1d9]">Supabase Realtime Cloud Engine</span>
          </div>
          <span className="text-[10px] bg-[#23863626] text-[#3fb950] border border-[#238636] px-2 py-0.5 rounded font-mono">
            Active
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block mb-1">
              Personal Vault Passcode / Secret Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]" />
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="e.g. annamalai-vault-2026"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md pl-9 pr-3 py-2 text-xs text-[#c9d1d9] outline-none font-mono transition"
              />
            </div>
            <p className="text-[11px] text-[#8b949e] mt-1.5 leading-relaxed">
              Use this exact key on your phone, laptop, and Chrome extension so all devices stay 100% synchronized in real time.
            </p>
          </div>

          {/* Connected Devices Indicator */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2 bg-[#0d1117] border border-[#30363d]/60 rounded flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-[#58a6ff]" />
              <div>
                <p className="font-semibold text-[#f0f6fc] text-[11px]">Mobile Devices</p>
                <p className="text-[10px] text-[#3fb950]">Realtime Listening</p>
              </div>
            </div>
            <div className="p-2 bg-[#0d1117] border border-[#30363d]/60 rounded flex items-center space-x-2">
              <Laptop className="w-4 h-4 text-[#d29922]" />
              <div>
                <p className="font-semibold text-[#f0f6fc] text-[11px]">Desktop & Plugin</p>
                <p className="text-[10px] text-[#3fb950]">Realtime Listening</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="gh-btn-secondary text-xs px-3.5 py-1.5">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold px-4 py-1.5 rounded-md flex items-center shadow transition"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-white" /> Key Saved!
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Save Sync Key
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
