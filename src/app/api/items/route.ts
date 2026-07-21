import { NextResponse } from 'next/server';
import { supabase, VaultItem } from '@/lib/supabase/client';
import { fetchUrlMetadata } from '@/lib/metadata/scraper';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');
  const query = searchParams.get('q')?.toLowerCase();

  let results: VaultItem[] = [];

  if (supabase) {
    try {
      let builder = supabase.from('items').select('*').order('created_at', { ascending: false });

      if (category && category !== 'all') builder = builder.eq('category', category);
      if (status && status !== 'all') builder = builder.eq('status', status);
      if (platform && platform !== 'all') builder = builder.eq('platform', platform);

      const { data, error } = await builder;

      if (!error && data) {
        results = data.map((item: any) => {
          let githubRepo = item.github_repo;
          if (typeof githubRepo === 'string') {
            try {
              githubRepo = JSON.parse(githubRepo);
            } catch {}
          }
          return {
            ...item,
            github_repo: githubRepo,
          };
        }) as VaultItem[];
      } else if (error) {
        console.error('Supabase query error:', error);
      }
    } catch (e) {
      console.error('Supabase query exception:', e);
    }
  }

  if (query) {
    results = results.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(query)))
    );
  }

  return NextResponse.json({ items: results }, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    let inputUrlOrText = '';
    let notes = '';
    let screenshot_url = '';
    let categoryInput = '';
    let tagsInput: string[] | undefined = undefined;
    const contentType = request.headers.get('content-type') || '';

    // Handle Form Data from Mobile PWA Share Targets & JSON from Extensions/API
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const titleStr = (formData.get('title') as string) || '';
      const textStr = (formData.get('text') as string) || '';
      const urlStr = (formData.get('url') as string) || '';

      inputUrlOrText = [titleStr, textStr, urlStr].filter(Boolean).join(' ');
      notes = [titleStr, textStr].filter(Boolean).join(' — ');
    } else {
      const body = await request.json();
      inputUrlOrText = body.url || body.raw_shared_text || '';
      notes = body.notes || '';
      screenshot_url = body.screenshot_url || '';
      categoryInput = body.category || '';
      tagsInput = body.tags;
    }

    if (!inputUrlOrText && !screenshot_url) {
      return NextResponse.json({ error: 'URL, text, or screenshot required' }, { status: 400, headers: corsHeaders });
    }

    let meta = await fetchUrlMetadata(inputUrlOrText);
    const normalizedTargetUrl = (meta.url || inputUrlOrText).toLowerCase().replace(/\/$/, '');

    // DUPLICATE AVOIDANCE CHECK ON SUPABASE CLOUD
    if (supabase) {
      const { data: existingData } = await supabase.from('items').select('*');
      if (existingData) {
        const existingItem = existingData.find((item: any) => {
          const itemUrl = (item.url || '').toLowerCase().replace(/\/$/, '');
          return itemUrl === normalizedTargetUrl && itemUrl !== '';
        });

        if (existingItem) {
          const updatedTime = new Date().toISOString();
          const updatedNotes = notes ? (existingItem.notes ? `${existingItem.notes} | ${notes}` : notes) : existingItem.notes;
          
          await supabase.from('items').update({ updated_at: updatedTime, notes: updatedNotes }).eq('id', existingItem.id);

          const updatedRecord = {
            ...existingItem,
            updated_at: updatedTime,
            notes: updatedNotes,
          };

          if (contentType.includes('application/x-www-form-urlencoded')) {
            return NextResponse.redirect(new URL('/?status=saved', request.url), 303);
          }

          return NextResponse.json(
            { item: updatedRecord, isDuplicate: true, message: 'Resource already in vault - bumped to top!' },
            { headers: corsHeaders }
          );
        }
      }
    }

    // Create New Item for 100% Supabase Cloud Database
    const newItem: VaultItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      url: meta.url || inputUrlOrText,
      raw_shared_text: inputUrlOrText,
      title: meta.title || 'Saved Resource',
      description: meta.description || 'Saved resource tool.',
      ai_summary: meta.ai_summary || '',
      thumbnail_url: meta.thumbnail_url || '',
      screenshot_url: screenshot_url || undefined,
      platform: meta.platform || 'generic',
      category: (categoryInput as any) || meta.category || 'Open Source',
      tags: tagsInput || meta.tags || ['saved'],
      status: 'to_explore',
      is_alive: true,
      notes: notes || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      github_repo: meta.github_repo ? {
        repo_name: meta.github_repo.repo_name,
        owner: meta.github_repo.owner,
        stars: meta.github_repo.stars,
        forks: meta.github_repo.forks,
        open_issues: meta.github_repo.open_issues,
        language: meta.github_repo.language,
        language_color: meta.github_repo.language_color,
        license: meta.github_repo.license,
        latest_release: meta.github_repo.latest_release,
        clone_url: meta.github_repo.clone_url,
      } : undefined,
    };

    // Insert Directly into Supabase Cloud Database
    if (supabase) {
      const supabaseRecord = {
        id: newItem.id,
        url: newItem.url,
        raw_shared_text: newItem.raw_shared_text,
        title: newItem.title,
        description: newItem.description,
        ai_summary: newItem.ai_summary,
        thumbnail_url: newItem.thumbnail_url,
        screenshot_url: newItem.screenshot_url,
        platform: newItem.platform,
        category: newItem.category,
        tags: newItem.tags,
        status: newItem.status,
        is_alive: newItem.is_alive,
        notes: newItem.notes,
        created_at: newItem.created_at,
        updated_at: newItem.updated_at,
        github_repo: newItem.github_repo ? JSON.stringify(newItem.github_repo) : null,
      };

      const { error } = await supabase.from('items').insert([supabaseRecord]);
      if (error) {
        console.error('Supabase Cloud insert error:', error);
      }
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(new URL('/?status=saved', request.url), 303);
    }

    return NextResponse.json({ item: newItem, isDuplicate: false }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save item' }, { status: 500, headers: corsHeaders });
  }
}
