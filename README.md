# 🔖 Link Vault - Personal Tool & GitHub Repo Vault

> Zero-friction link capture, dedicated GitHub repository vault, and AI-powered resource management built with **Next.js 15**, **Supabase**, **shadcn/ui**, and the **GitHub Color Palette** design system.

---

## 🌟 Key Features

- **🐙 Dedicated GitHub Repo Vault:** View saved open-source repos with live ⭐ Stars, 🍴 Forks, 🟢 Language Dots, `git clone` quick-copy, and 1-click VS Code Web / Codespaces launchers.
- **📱 Social Link Extractor:** Share posts from Threads, Instagram, YouTube, or X — automatically extracts embedded target URLs and isolates clean post notes with zero manual typing required.
- **📲 Mobile PWA Share Target:** Native Android/Browser share target support (`manifest.json`) so tapping "Share" in any mobile app sends links directly into your vault.
- **⭐ GitHub Star Sync:** Import public starred repositories from any GitHub username in 1 click.
- **🤖 AI Key Takeaways Generator:** Generates 3 bullet takeaways for saved articles and repos automatically.
- **💻 Code Snippets & Gist Saver:** Store, search, and copy code snippets with multi-language formatting.
- **🛠️ Tech Stacks Builder:** Group saved tools and libraries into runnable technology stack bundles.
- **📊 Vault Insights & Analytics:** Progress stats, explore rates, and category distribution.
- **⏳ "Unexplored Gems" Backlog Clearer:** Surface random un-reviewed saved items to clear your backlog.
- **📱 QR Code Mobile Handoff:** Instant scannable QR code popover for opening links on mobile.
- **⌨️ Command Palette (`⌘K`) & Hotkeys (`?`):** Rapid keyboard-first navigation.
- **💾 Full Data Ownership:** Download 1-click JSON and CSV offline backups.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database & Storage:** **Supabase** (PostgreSQL & `screenshots` Storage Bucket)
- **UI & Styling:** Tailwind CSS + **GitHub Color Palette** (`#0d1117`, `#161b22`, `#30363d`, `#238636`) + Lucide Icons
- **Scraper Engine:** OpenGraph parser + GitHub REST API integration

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase (Optional for Cloud Persistence)
Create a `.env.local` file based on `.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
Run the SQL DDL script inside `supabase/schema.sql` in your Supabase SQL Editor.

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.
