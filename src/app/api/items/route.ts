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

  const diskItems = getDiskItems();
  let supabaseItems: VaultItem[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        supabaseItems = data as VaultItem[];
      }
    } catch (e) {
      console.error('Supabase fetch error:', e);
    }
  }

  // Merge items from both local disk store and Supabase to guarantee zero data loss
  const itemMap = new Map<string, VaultItem>();
  
  // Add disk items first (restores all 16 previously saved items!)
  diskItems.forEach((item) => itemMap.set(item.id, item));
  // Add/override with Supabase items
  supabaseItems.forEach((item) => itemMap.set(item.id, item));

  let combinedResults = Array.from(itemMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Apply filters
  if (category && category !== 'all') {
    combinedResults = combinedResults.filter((i) => i.category === category);
  }
  if (status && status !== 'all') {
    combinedResults = combinedResults.filter((i) => i.status === status);
  }
  if (platform && platform !== 'all') {
    combinedResults = combinedResults.filter((i) => i.platform === platform);
  }

  if (query) {
    combinedResults = combinedResults.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(query)))
    );
  }

  return NextResponse.json({ items: combinedResults }, { headers: corsHeaders });
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

    // DUPLICATE AVOIDANCE CHECK
    const currentDiskItems = getDiskItems();
    const normalizedTargetUrl = (meta.url || inputUrlOrText).toLowerCase().replace(/\/$/, '');

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

      if (contentType.includes('application/x-www-form-urlencoded')) {
        return NextResponse.redirect(new URL('/?status=saved', request.url), 303);
      }

      return NextResponse.json(
        { item: updatedItem, isDuplicate: true, message: 'Resource already in vault - bumped to top!' },
        { headers: corsHeaders }
      );
    }

    // Create New Item
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

    // Save to Disk Store (guarantees local persistence)
    currentDiskItems.unshift(newItem);
    saveDiskItems(currentDiskItems);

    // Save to Supabase Cloud Database if RLS allows
    if (isSupabaseConfigured && supabase) {
      try {
        const supabaseRecord = {
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
        };
        await supabase.from('items').insert([supabaseRecord]);
      } catch (e) {
        console.error('Failed to insert into Supabase:', e);
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
