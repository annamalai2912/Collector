import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, VaultItem } from '@/lib/supabase/client';
import { fetchUrlMetadata } from '@/lib/metadata/scraper';
import { getDiskItems, saveDiskItems } from '@/lib/storage/diskStore';

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
  let fetchedFromSupabase = false;

  if (isSupabaseConfigured && supabase) {
    try {
      let builder = supabase.from('items').select('*').order('created_at', { ascending: false });

      if (category && category !== 'all') builder = builder.eq('category', category);
      if (status && status !== 'all') builder = builder.eq('status', status);
      if (platform && platform !== 'all') builder = builder.eq('platform', platform);

      const { data, error } = await builder;

      if (!error && data && data.length > 0) {
        results = data as VaultItem[];
        fetchedFromSupabase = true;
      }
    } catch (e) {
      console.error('Supabase query exception:', e);
    }
  }

  // Fallback to persistent disk store if Supabase returned empty/error
  if (!fetchedFromSupabase) {
    let diskItems = getDiskItems();

    if (category && category !== 'all') {
      diskItems = diskItems.filter((i) => i.category === category);
    }
    if (status && status !== 'all') {
      diskItems = diskItems.filter((i) => i.status === status);
    }
    if (platform && platform !== 'all') {
      diskItems = diskItems.filter((i) => i.platform === platform);
    }
    results = diskItems;
  }

  if (query) {
    results = results.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  return NextResponse.json({ items: results, isSupabase: fetchedFromSupabase }, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputUrlOrText = body.url || body.raw_shared_text || '';
    const notes = body.notes || '';
    const screenshot_url = body.screenshot_url || '';

    if (!inputUrlOrText && !screenshot_url) {
      return NextResponse.json({ error: 'URL, text, or screenshot required' }, { status: 400, headers: corsHeaders });
    }

    let meta = await fetchUrlMetadata(inputUrlOrText);

    // DUPLICATE AVOIDANCE CHECK
    const currentDiskItems = getDiskItems();
    const normalizedTargetUrl = meta.url.toLowerCase().replace(/\/$/, '');

    const existingIndex = currentDiskItems.findIndex((item) => {
      const itemUrl = (item.url || '').toLowerCase().replace(/\/$/, '');
      return itemUrl === normalizedTargetUrl && itemUrl !== '';
    });

    if (existingIndex !== -1) {
      // Move existing item to top and bump timestamp
      const existingItem = currentDiskItems[existingIndex];
      const updatedItem: VaultItem = {
        ...existingItem,
        updated_at: new Date().toISOString(),
        notes: notes ? (existingItem.notes ? `${existingItem.notes} | ${notes}` : notes) : existingItem.notes,
      };

      currentDiskItems.splice(existingIndex, 1);
      currentDiskItems.unshift(updatedItem);
      saveDiskItems(currentDiskItems);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('items').update({ updated_at: updatedItem.updated_at }).eq('id', existingItem.id);
        } catch (e) {
          console.error('Failed to update Supabase duplicate:', e);
        }
      }

      return NextResponse.json(
        { item: updatedItem, isDuplicate: true, message: 'Resource already in vault - bumped to top!' },
        { headers: corsHeaders }
      );
    }

    // Create New Item
    const newItem: VaultItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      url: meta.url,
      raw_shared_text: inputUrlOrText,
      title: meta.title,
      description: meta.description,
      ai_summary: meta.ai_summary,
      thumbnail_url: meta.thumbnail_url,
      screenshot_url: screenshot_url || undefined,
      platform: meta.platform,
      category: body.category || meta.category,
      tags: body.tags || meta.tags,
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

    // Save to Disk Store
    currentDiskItems.unshift(newItem);
    saveDiskItems(currentDiskItems);

    // Save to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').insert([newItem]);
      } catch (e) {
        console.error('Failed to insert into Supabase:', e);
      }
    }

    return NextResponse.json({ item: newItem, isDuplicate: false }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save item' }, { status: 500, headers: corsHeaders });
  }
}
