import fs from 'fs';
import path from 'path';
import { VaultItem } from '../supabase/client';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'items.json');

const DEFAULT_DEMO_ITEMS: VaultItem[] = [
  {
    id: 'demo-1',
    url: 'https://github.com/chroma-core/chroma',
    title: 'chroma-core/chroma',
    description: 'the open-source embedding database for AI applications',
    ai_summary: '💡 **Core Concept:** Open-source AI embedding database.\n⚡ **Key Highlight:** Designed for fast vector search and LLM context storage.\n🛠️ **Best Use Case:** RAG pipelines and AI memory agent storage.',
    thumbnail_url: 'https://github.com/chroma-core.png',
    platform: 'github',
    category: 'Open Source',
    tags: ['github', 'open-source', 'python', 'ai', 'database'],
    status: 'to_explore',
    is_alive: true,
    notes: 'Saved from Threads post discussing vector stores.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    github_repo: {
      repo_name: 'chroma',
      owner: 'chroma-core',
      stars: 18420,
      forks: 1420,
      open_issues: 120,
      language: 'Python',
      language_color: '#3572A5',
      license: 'Apache-2.0',
      latest_release: 'v0.5.5',
      clone_url: 'https://github.com/chroma-core/chroma.git',
    },
  },
  {
    id: 'demo-2',
    url: 'https://github.com/shadcn-ui/ui',
    title: 'shadcn-ui/ui',
    description: 'Beautifully designed components that you can copy and paste into your apps.',
    ai_summary: '💡 **Core Concept:** Copy-paste accessible UI component library.\n⚡ **Key Highlight:** Full code ownership with Tailwind CSS integration.\n🛠️ **Best Use Case:** Next.js and React dashboard development.',
    thumbnail_url: 'https://github.com/shadcn-ui.png',
    platform: 'github',
    category: 'Design Inspiration',
    tags: ['github', 'open-source', 'typescript', 'react', 'tailwind'],
    status: 'explored',
    is_alive: true,
    notes: 'Essential UI kit for modern web apps.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    github_repo: {
      repo_name: 'ui',
      owner: 'shadcn-ui',
      stars: 67200,
      forks: 4800,
      open_issues: 45,
      language: 'TypeScript',
      language_color: '#3178c6',
      license: 'MIT',
      latest_release: 'v2.0.0',
      clone_url: 'https://github.com/shadcn-ui/ui.git',
    },
  },
];

export function getDiskItems(): VaultItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_DEMO_ITEMS, null, 2), 'utf-8');
      return DEFAULT_DEMO_ITEMS;
    }
    const fileData = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(fileData);
  } catch {
    return DEFAULT_DEMO_ITEMS;
  }
}

export function saveDiskItems(items: VaultItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write disk items:', e);
  }
}
