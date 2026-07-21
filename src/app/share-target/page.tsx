'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// This page is only shown as a fallback GET page.
// The actual share handling is done by /share-target/route.ts (POST handler)
// which saves links silently and returns a self-closing HTML page.

function ShareTargetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle GET share params (fallback: some older browsers send GET)
    const title = searchParams?.get('title') || '';
    const text = searchParams?.get('text') || '';
    const url = searchParams?.get('url') || '';
    const combinedText = [title, text, url].filter(Boolean).join(' ');

    if (!combinedText) return;

    // POST to the API handler to save
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url || text || title, raw_shared_text: combinedText, notes: title }),
    }).then(() => {
      setTimeout(() => router.push('/'), 1200);
    }).catch(() => {
      setTimeout(() => router.push('/'), 1200);
    });
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl text-center space-y-5">
      <div className="w-14 h-14 bg-[#23863626] text-[#3fb950] border border-[#238636] rounded-full flex items-center justify-center mx-auto shadow-lg">
        <Check className="w-7 h-7 stroke-[3]" />
      </div>
      <div>
        <h2 className="text-base font-bold text-[#f0f6fc]">Saved to Collector!</h2>
        <p className="text-xs text-[#8b949e] mt-1">Your link has been captured to the vault.</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center text-xs text-[#58a6ff] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> View all saved links
      </Link>
    </div>
  );
}

export default function ShareTargetPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex items-center text-[#8b949e] text-xs font-mono">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#58a6ff]" /> Saving link...
        </div>
      }>
        <ShareTargetContent />
      </Suspense>
    </div>
  );
}
