'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { extractLinkFromText } from '@/lib/metadata/linkExtractor';
import { ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';

function ShareTargetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<'AI/ML Tools' | 'Open Source' | 'Embedded/IoT' | 'Design Inspiration' | 'Reels/Shorts' | 'Reads/Threads'>('Open Source');

  useEffect(() => {
    const title = searchParams?.get('title') || '';
    const text = searchParams?.get('text') || '';
    const url = searchParams?.get('url') || '';

    const combinedText = [title, text, url].filter(Boolean).join(' ');
    const result = extractLinkFromText(combinedText);

    setExtractedUrl(result.targetUrl || url || null);
    setNotes(result.cleanNotes || title || '');
  }, [searchParams]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: extractedUrl,
          raw_shared_text: notes,
          category,
          notes,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 1200);
      }
    } catch (e) {
      console.error('Failed to save shared target:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-lg p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#30363d] mb-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-sm text-[#8b949e] hover:text-[#f0f6fc]"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Vault
        </button>
        <span className="flex items-center text-xs bg-[#23863626] text-[#3fb950] border border-[#238636] px-2 py-0.5 rounded-full font-mono">
          <Sparkles className="w-3 h-3 mr-1" /> Mobile Share Target
        </span>
      </div>

      {success ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#23863626] text-[#3fb950] border border-[#238636] rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-[#f0f6fc]">Saved to Link Vault!</h2>
          <p className="text-xs text-[#8b949e] mt-1">Redirecting to your vault...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block mb-1">
              Extracted Link
            </label>
            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-sm font-mono break-all text-[#58a6ff]">
              {extractedUrl || 'No direct URL detected (Text only)'}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block mb-1">
              Notes / Context
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#c9d1d9] outline-none focus:border-[#58a6ff]"
              placeholder="Add short notes or description..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#c9d1d9] outline-none focus:border-[#58a6ff]"
            >
              <option value="Open Source">⭐ Open Source</option>
              <option value="AI/ML Tools">🤖 AI/ML Tools</option>
              <option value="Embedded/IoT">🔌 Embedded/IoT</option>
              <option value="Design Inspiration">🎨 Design Inspiration</option>
              <option value="Reels/Shorts">🎬 Reels/Shorts</option>
              <option value="Reads/Threads">📰 Reads/Threads</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded transition flex items-center justify-center shadow-lg"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Save Item to Vault
          </button>
        </div>
      )}
    </div>
  );
}

export default function ShareTargetPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex items-center text-[#8b949e] text-xs font-mono">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#58a6ff]" /> Loading Share Target...
        </div>
      }>
        <ShareTargetContent />
      </Suspense>
    </div>
  );
}
