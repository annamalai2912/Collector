import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Server-side image proxy to bypass CORS restrictions on og:image thumbnails.
// Usage: /api/image-proxy?url=<encoded-image-url>
// The browser fetches this route, which in turn fetches the remote image
// and pipes it back — bypassing all CORS policies.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 });
  }

  try {
    const response = await fetch(decodeURIComponent(imageUrl), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Collector/1.0; +https://collector-six.vercel.app)',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': 'https://collector-six.vercel.app/',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Proxy error' }, { status: 500 });
  }
}
