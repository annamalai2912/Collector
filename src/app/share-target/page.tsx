'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { extractLinkFromText } from '@/lib/metadata/linkExtractor';
import { Check, Sparkles, Loader2 } from 'lucide-react';

function ShareTargetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [saving, setSaving] = useState(true);
  const [success, setSuccess] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const title = searchParams?.get('title') || '';
    const text = searchParams?.get('text') || '';
    const url = searchParams?.get('url') || '';

    const combinedText = [title, text, url].filter(Boolean).join(' ');
    const result = extractLinkFromText(combinedText);
    const targetUrl = result.targetUrl || url || text || title;

    if (!targetUrl) {
      setSaving(false);
      setError('No valid link detected in shared data.');
      return;
    }

    setExtractedUrl(targetUrl);

    // AUTO-SAVE INSTANTLY ON LOAD WITHOUT USER INTERACTION REQUIRED
    const autoSaveItem = async () => {
      try {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            raw_shared_text: combinedText,
            notes: result.cleanNotes || title || text,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Update local cache so mobile view shows it instantly
          try {
            const existing = JSON.parse(localStorage.getItem('collector_user_items') || '[]');
            if (data.item) {
              const updated = [data.item, ...existing.filter((i: any) => i.id !== data.item.id)];
              localStorage.setItem('collector_user_items', JSON.stringify(updated));
            }
          } catch {}

          setSuccess(true);
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          setError('Failed to save link.');
        }
      } catch (e) {
        console.error('Failed to auto-save shared target:', e);
        setError('Connection error while saving item.');
      } finally {
        setSaving(false);
      }
    };

    autoSaveItem();
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-2xl text-center space-y-4 animate-scale-up">
      <div className="flex items-center justify-center space-x-1.5 text-xs bg-[#23863626] text-[#3fb950] border border-[#238636] px-3 py-1 rounded-full w-max mx-auto font-mono">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Mobile Link Collector</span>
      </div>

      {saving ? (
        <div className="py-6 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#58a6ff]" />
          <h2 className="text-sm font-semibold text-[#f0f6fc]">Saving Resource...</h2>
          <p className="text-xs text-[#8b949e] font-mono break-all px-2">
            {extractedUrl || 'Extracting shared link metadata...'}
          </p>
        </div>
      ) : success ? (
        <div className="py-6 space-y-3">
          <div className="w-12 h-12 bg-[#23863626] text-[#3fb950] border border-[#238636] rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h2 className="text-base font-bold text-[#f0f6fc]">Saved to Collector Vault!</h2>
          <p className="text-xs text-[#8b949e]">Redirecting to your resources...</p>
        </div>
      ) : (
        <div className="py-4 space-y-3">
          <p className="text-xs text-[#f85149] font-medium">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => router.push('/')}
            className="gh-btn-primary text-xs px-4 py-1.5"
          >
            Return to Vault
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
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#58a6ff]" /> Loading Mobile Share Target...
        </div>
      }>
        <ShareTargetContent />
      </Suspense>
    </div>
  );
}
