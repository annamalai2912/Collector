import { NextResponse } from 'next/server';
import { fetchUrlMetadata } from '@/lib/metadata/scraper';
import { getDiskItems, saveDiskItems } from '@/lib/storage/diskStore';
import { supabase, isSupabaseConfigured, VaultItem } from '@/lib/supabase/client';
import { extractLinkFromText } from '@/lib/metadata/linkExtractor';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// Handles POST from the Web Share Target API (mobile PWA share sheet)
// manifest.json: "share_target": { "action": "/api/share", "method": "POST" }
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let titleStr = '';
    let textStr = '';
    let urlStr = '';

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData();
      titleStr = (formData.get('title') as string) || '';
      textStr = (formData.get('text') as string) || '';
      urlStr = (formData.get('url') as string) || '';
    } else {
      const body = await request.json().catch(() => ({}));
      titleStr = body.title || '';
      textStr = body.text || '';
      urlStr = body.url || '';
    }

    const combinedText = [titleStr, textStr, urlStr].filter(Boolean).join(' ');
    const result = extractLinkFromText(combinedText);
    const targetUrl = result.targetUrl || urlStr || textStr || titleStr;

    if (targetUrl) {
      // Fire-and-forget background save
      (async () => {
        try {
          const meta = await fetchUrlMetadata(targetUrl);
          const diskItems = getDiskItems();
          const normalizedUrl = (meta.url || targetUrl).toLowerCase().replace(/\/$/, '');
          const dupIdx = diskItems.findIndex(
            (i) => (i.url || '').toLowerCase().replace(/\/$/, '') === normalizedUrl
          );

          if (dupIdx !== -1) {
            const item = diskItems[dupIdx];
            diskItems.splice(dupIdx, 1);
            diskItems.unshift({ ...item, updated_at: new Date().toISOString() });
            saveDiskItems(diskItems);
            return;
          }

          const newItem: VaultItem = {
            id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            url: meta.url || targetUrl,
            raw_shared_text: combinedText,
            title: meta.title || 'Saved Resource',
            description: meta.description || '',
            ai_summary: meta.ai_summary || '',
            thumbnail_url: meta.thumbnail_url || '',
            platform: meta.platform || 'generic',
            category: meta.category || 'Open Source',
            tags: meta.tags || [],
            status: 'to_explore',
            is_alive: true,
            notes: result.cleanNotes || titleStr || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            github_repo: meta.github_repo,
          };

          diskItems.unshift(newItem);
          saveDiskItems(diskItems);

          if (isSupabaseConfigured && supabase) {
            try {
              await supabase.from('items').insert([{
                url: newItem.url,
                raw_shared_text: newItem.raw_shared_text,
                title: newItem.title,
                description: newItem.description,
                ai_summary: newItem.ai_summary,
                thumbnail_url: newItem.thumbnail_url,
                platform: newItem.platform,
                category: newItem.category,
                tags: newItem.tags,
                status: newItem.status,
                is_alive: newItem.is_alive,
                notes: newItem.notes,
                created_at: newItem.created_at,
                updated_at: newItem.updated_at,
              }]);
            } catch {}
          }
        } catch (e) {
          console.error('Background share save error:', e);
        }
      })();
    }

    // CRITICAL: Return a minimal self-closing HTML page.
    // This prevents the PWA from navigating to or staying open.
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Saved — Collector</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0d1117;color:#3fb950;font-family:system-ui,sans-serif;
         display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:14px}
    .circle{width:56px;height:56px;background:#23863626;border:1.5px solid #238636;border-radius:50%;
             display:flex;align-items:center;justify-content:center;font-size:24px}
    .title{font-size:15px;font-weight:700;color:#f0f6fc}
    .sub{font-size:11px;color:#8b949e}
  </style>
</head>
<body>
  <div class="circle">✅</div>
  <div class="title">Saved to Collector!</div>
  <div class="sub">You may close this tab.</div>
  <script>
    // Try to close this tab — works when opened by the share sheet
    setTimeout(function(){
      try{window.close()}catch(e){}
      try{history.back()}catch(e){}
    },700);
  </script>
</body>
</html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (e: any) {
    return new Response('Error saving link', { status: 500 });
  }
}

export async function GET() {
  return NextResponse.redirect('/');
}
