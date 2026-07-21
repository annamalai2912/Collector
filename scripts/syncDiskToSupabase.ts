import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xpmiwaydervbhvrhzriu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_d51TpKNxMjswJcT2p6vNPA_BQg5WTR-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function syncAllItemsToSupabase() {
  const filePath = path.join(process.cwd(), 'data', 'items.json');
  if (!fs.existsSync(filePath)) {
    console.log('No data/items.json found.');
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const diskItems = JSON.parse(raw);

  console.log(`Found ${diskItems.length} items in local disk store.`);

  for (const item of diskItems) {
    const supabaseRecord: any = {
      url: item.url,
      raw_shared_text: item.raw_shared_text,
      title: item.title,
      description: item.description,
      ai_summary: item.ai_summary,
      thumbnail_url: item.thumbnail_url,
      screenshot_url: item.screenshot_url,
      platform: item.platform,
      category: item.category,
      tags: item.tags,
      status: item.status,
      is_alive: item.is_alive,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };

    const { error } = await supabase.from('items').insert([supabaseRecord]);
    if (error) {
      console.error(`Failed to insert item ${item.title}:`, error.message);
    } else {
      console.log(`✅ Synced item to Supabase Cloud: ${item.title}`);
    }
  }

  console.log('All local items uploaded to Supabase Cloud Database!');
}

syncAllItemsToSupabase();
