'use client';

import React, { useState } from 'react';
import { CodeSnippet } from '@/lib/supabase/client';
import { Code2, Plus, Copy, Check, Trash2, Sparkles, Search } from 'lucide-react';

export const CodeSnippetsView: React.FC = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([
    {
      id: 'snip-1',
      title: 'Supabase Vector Similarity Search Query',
      language: 'sql',
      code: `create or replace function match_documents (\n  query_embedding vector(1536),\n  match_threshold float,\n  match_count int\n)\nreturns table (\n  id uuid,\n  content text,\n  similarity float\n)\nlanguage sql stable\nas $$\n  select\n    documents.id,\n    documents.content,\n    1 - (documents.embedding <=> query_embedding) as similarity\n  from documents\n  where 1 - (documents.embedding <=> query_embedding) > match_threshold\n  order by similarity desc\n  limit match_count;\n$$;`,
      notes: 'PostgreSQL pgvector match function for LLM RAG pipelines.',
      tags: ['supabase', 'sql', 'pgvector', 'ai'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'snip-2',
      title: 'FastAPI CORS & OpenGraph Scraper Endpoint',
      language: 'python',
      code: `from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\nimport requests\nfrom bs4 import BeautifulSoup\n\napp = FastAPI()\n\nclass ScrapeRequest(BaseModel):\n    url: str\n\n@app.post("/api/scrape")\ndef scrape_metadata(req: ScrapeRequest):\n    resp = requests.get(req.url, headers={"User-Agent": "LinkVault/1.0"})\n    if resp.status_code != 200:\n        raise HTTPException(status_code=400, detail="Failed to fetch URL")\n    \n    soup = BeautifulSoup(resp.text, "html.parser")\n    title = soup.find("meta", property="og:title")\n    return {"title": title["content"] if title else "No title"}`,
      notes: 'Python scraper helper using BeautifulSoup4.',
      tags: ['python', 'fastapi', 'scraping'],
      created_at: new Date().toISOString(),
    },
  ]);

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('typescript');
  const [newCode, setNewCode] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSnippet = () => {
    if (!newTitle || !newCode) return;

    const newSnip: CodeSnippet = {
      id: 'snip-' + Date.now(),
      title: newTitle,
      language: newLanguage,
      code: newCode,
      notes: newNotes,
      tags: [newLanguage],
      created_at: new Date().toISOString(),
    };

    setSnippets([newSnip, ...snippets]);
    setNewTitle('');
    setNewCode('');
    setNewNotes('');
    setIsAdding(false);
  };

  const filtered = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.language.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-[#3fb950]" />
            <h2 className="text-base font-semibold text-[#f0f6fc]">Code Snippets & Gist Saver</h2>
            <span className="bg-[#21262d] text-[#8b949e] text-xs px-2 py-0.5 rounded-full border border-[#30363d] font-mono">
              {snippets.length} Snippets
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Store, search, and copy code snippets, SQL queries, and framework boilerplate.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="gh-btn-primary text-xs flex items-center shrink-0 py-2 px-3 shadow"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Save New Snippet
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-[#161b22] border border-[#388bfd40] rounded-lg p-4 space-y-3 animate-fade-in shadow-xl">
          <h3 className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">Save New Code Snippet</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Snippet Title (e.g. Supabase RAG Match Function)"
              className="bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-[#c9d1d9] outline-none focus:border-[#58a6ff]"
            />
            <select
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-[#c9d1d9] outline-none"
            >
              <option value="typescript">TypeScript / JavaScript</option>
              <option value="python">Python</option>
              <option value="sql">SQL / PostgreSQL</option>
              <option value="c++">C++ / Arduino</option>
              <option value="bash">Bash / Shell</option>
              <option value="rust">Rust</option>
            </select>
          </div>
          <textarea
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            rows={5}
            placeholder="Paste code snippet here..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2.5 text-xs text-[#c9d1d9] font-mono outline-none focus:border-[#58a6ff]"
          />
          <input
            type="text"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes or description (optional)"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-xs text-[#c9d1d9] outline-none"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsAdding(false)} className="gh-btn-secondary text-xs">
              Cancel
            </button>
            <button onClick={handleCreateSnippet} className="gh-btn-primary text-xs">
              Save Snippet
            </button>
          </div>
        </div>
      )}

      {/* Snippet Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search snippets by code, language, or title..."
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#c9d1d9] outline-none focus:border-[#58a6ff]"
        />
      </div>

      {/* Snippets List */}
      <div className="space-y-4">
        {filtered.map((snip) => (
          <div key={snip.id} className="gh-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-[#21262d] text-[#3fb950] border border-[#30363d] px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">
                    {snip.language}
                  </span>
                  <h3 className="text-sm font-semibold text-[#f0f6fc]">{snip.title}</h3>
                </div>
                {snip.notes && <p className="text-xs text-[#8b949e] mt-1">{snip.notes}</p>}
              </div>

              <button
                onClick={() => handleCopyCode(snip.id, snip.code)}
                className="gh-btn-secondary text-xs py-1 px-2.5 flex items-center font-mono"
              >
                {copiedId === snip.id ? (
                  <>
                    <Check className="w-3 h-3 text-[#3fb950] mr-1" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" /> Copy Code
                  </>
                )}
              </button>
            </div>

            <pre className="bg-[#0d1117] border border-[#30363d] rounded p-3 text-xs text-[#c9d1d9] font-mono overflow-x-auto leading-relaxed">
              <code>{snip.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
