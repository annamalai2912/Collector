import { NextResponse } from 'next/server';
import { extractLinkFromText } from '@/lib/metadata/linkExtractor';

export const dynamic = 'force-dynamic';

// Handles POST from Web Share Target API (mobile PWA)
// manifest.json: "share_target": { "action": "/api/share", "method": "POST" }
// 
// IMPORTANT: We do NOT save server-side here, because Vercel serverless 
// terminates the function immediately after sending the response, killing
// any background async work. Instead, we return a mini HTML page that 
// does the save CLIENT-SIDE via fetch → /api/items, which is reliable.

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' },
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let titleStr = '';
    let textStr = '';
    let urlStr = '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
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

    const baseUrl = new URL(request.url).origin;

    // Return a lightweight HTML page that does the actual save client-side.
    // This is required because Vercel kills serverless functions immediately
    // after the response is sent — any background async work dies with it.
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Saving — Collector</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0d1117;color:#c9d1d9;font-family:system-ui,sans-serif;
         display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px;padding:20px}
    .icon{font-size:48px;transition:all 0.3s}
    .title{font-size:15px;font-weight:700;color:#f0f6fc;text-align:center}
    .url{font-size:11px;color:#58a6ff;max-width:300px;word-break:break-all;text-align:center;opacity:0.8}
    .sub{font-size:11px;color:#8b949e;text-align:center}
    .spinner{width:32px;height:32px;border:3px solid #30363d;border-top-color:#58a6ff;border-radius:50%;animation:spin 0.8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div class="spinner" id="spinner"></div>
  <div class="icon" id="icon" style="display:none">⏳</div>
  <div class="title" id="title">Saving to Collector...</div>
  <div class="url" id="url">${targetUrl ? targetUrl.substring(0, 60) + (targetUrl.length > 60 ? '…' : '') : 'Processing link...'}</div>
  <div class="sub" id="sub">Please wait</div>
  <script>
    (async function() {
      var url = ${JSON.stringify(targetUrl)};
      var combined = ${JSON.stringify(combinedText)};
      var notes = ${JSON.stringify(result.cleanNotes || titleStr || '')};
      var base = ${JSON.stringify(baseUrl)};

      if (!url) {
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('icon').textContent = '❌';
        document.getElementById('icon').style.display = 'block';
        document.getElementById('title').textContent = 'No link detected';
        document.getElementById('sub').textContent = 'Please try sharing again';
        return;
      }

      try {
        var res = await fetch(base + '/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url, raw_shared_text: combined, notes: notes })
        });

        document.getElementById('spinner').style.display = 'none';
        document.getElementById('icon').style.display = 'block';

        if (res.ok) {
          document.getElementById('icon').textContent = '✅';
          document.getElementById('title').textContent = 'Saved to Collector!';
          document.getElementById('sub').textContent = 'You can close this tab';
          document.getElementById('url').style.color = '#3fb950';
        } else {
          document.getElementById('icon').textContent = '⚠️';
          document.getElementById('title').textContent = 'Could not save link';
          document.getElementById('sub').textContent = 'Check your connection and try again';
        }
      } catch(e) {
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('icon').textContent = '❌';
        document.getElementById('icon').style.display = 'block';
        document.getElementById('title').textContent = 'Connection error';
        document.getElementById('sub').textContent = 'Make sure you are online';
      }

      // Auto-close after 1.5 seconds
      setTimeout(function() {
        try { window.close(); } catch(e) {}
        try { history.back(); } catch(e) {}
      }, 1500);
    })();
  </script>
</body>
</html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (e: any) {
    return new Response('Error processing share', { status: 500 });
  }
}

export async function GET() {
  return NextResponse.redirect('/');
}
