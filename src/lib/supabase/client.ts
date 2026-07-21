import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface VaultItem {
  id: string;
  url?: string;
  raw_shared_text?: string;
  title: string;
  description?: string;
  ai_summary?: string;
  thumbnail_url?: string;
  screenshot_url?: string;
  platform: 'github' | 'instagram' | 'youtube' | 'threads' | 'x' | 'generic';
  category: 'AI/ML Tools' | 'Open Source' | 'Embedded/IoT' | 'Design Inspiration' | 'Reels/Shorts' | 'Reads/Threads';
  tags: string[];
  status: 'to_explore' | 'explored' | 'archived';
  is_alive?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Extended GitHub repo fields if platform is github
  github_repo?: {
    repo_name: string;
    owner: string;
    stars: number;
    forks: number;
    open_issues: number;
    language: string;
    language_color: string;
    license: string;
    latest_release: string;
    clone_url: string;
  };
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  notes?: string;
  tags: string[];
  created_at: string;
}

export interface TechStack {
  id: string;
  name: string;
  description?: string;
  item_ids: string[];
  created_at: string;
}
