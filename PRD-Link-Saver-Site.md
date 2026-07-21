# Product Requirements Document
## Personal Tool & Link Vault ("Link Saver")

**Author:** Uzuus (Rocky's Lab)
**Date:** July 22, 2026
**Status:** Draft v1

---

## 1. Background & Problem Statement

The user regularly discovers valuable resources across the internet — free tools, open-source projects, and interesting posts on Instagram, YouTube, and Threads. Today there is no reliable system to capture these:

- Links get lost in scrolling and are never revisited.
- Manual notebook entries are slow, error-prone, and not searchable.
- There's no categorization, so even saved items become hard to find later.
- Capturing something requires switching context (open a note app, type it out), which breaks the "in the moment" discovery flow.

**Core insight:** capture must be near-zero friction — ideally 1–2 taps from wherever the user already is (Instagram app, YouTube app, browser) — or it won't happen consistently.

## 2. Goals

1. Let the user save a link (or a screenshot when there's no clean link) in under 5 seconds from any mobile app via the native share sheet.
2. Automatically pull a title/description/thumbnail for the saved item so the user doesn't have to type anything.
3. Organize saved items into categories/tags and display them as a browsable, searchable list on a personal website.
4. Support capture via a Telegram bot as an alternate/parallel channel (paste a link or forward a post to the bot).
5. Make organizing (categorizing, tagging, editing) fast — quick-add flow, not a form-heavy chore.

### Non-Goals (v1)
- Multi-user / public sharing platform (this is a personal vault, not a social bookmarking site like Pinboard or Raindrop, at least initially).
- Full-text search inside videos/images.
- Browser extension (mobile share sheet + Telegram bot cover the primary use case first).

## 3. Target User

Just the user himself (single-user system) for v1. Design should not preclude adding accounts later, but auth complexity should stay minimal (e.g. single admin login) for now.

## 4. Key User Stories

| # | Story |
|---|-------|
| 1 | As the user, when I see an interesting Instagram/YouTube/Threads post, I want to tap "Share" and pick my app, so the link and its metadata are saved instantly. |
| 2 | As the user, if a post has no shareable link (e.g. a fleeting Story), I want to save a screenshot instead and add a short note. |
| 3 | As the user, I want to forward a message or paste a link into a Telegram bot and have it appear in my vault, so I have a second, always-available capture path. |
| 4 | As the user, I want every saved item to auto-fetch a title, description, and thumbnail so I rarely have to type anything. |
| 5 | As the user, I want to assign or auto-suggest a category (e.g. "AI/ML Tools", "Open Source", "Embedded/IoT", "Design Inspiration", "Reels/Shorts") so items stay organized. |
| 6 | As the user, I want to browse my saved items as a filterable list/grid (by category, tag, source platform, date saved). |
| 7 | As the user, I want to search across titles/descriptions/tags to quickly find something I saved weeks ago. |
| 8 | As the user, I want to edit a saved item's category, tags, or notes after the fact. |
| 9 | As the user, I want to mark items as "explored/done" vs "to check out" so my list distinguishes backlog from reviewed items. |
| 10 | As the user, I want to delete/archive items I no longer care about. |

## 5. Functional Requirements

### 5.1 Capture Channels
- **Mobile Share Sheet (primary):** A PWA or lightweight native wrapper registered as a share target on Android (and iOS Shortcuts integration as a fallback, since iOS Safari PWAs have share-target limitations). Sharing a URL from Instagram/YouTube/Threads/Chrome opens a minimal "Save" screen pre-filled with the shared link.
- **Telegram Bot:** User pastes or forwards a link (or a photo/screenshot) to the bot. The bot:
  - Detects a URL, fetches metadata (title, description, thumbnail, source platform).
  - Replies with an inline "Choose category" keyboard (Telegram inline buttons) so categorization can happen right in the chat.
  - If no URL is present (pure screenshot forward), stores the image and asks for a quick one-line description via a reply.
- **Manual Add (web):** A simple "+ Add" form on the site for pasting a link or uploading a screenshot directly, for cases when neither share sheet nor Telegram is convenient.

### 5.2 Metadata Extraction
- On save, fetch Open Graph / oEmbed metadata (title, description, thumbnail/preview image, site name) for the URL.
- Detect source platform (Instagram, YouTube, Threads, GitHub, generic web) to show a platform icon/badge.
- For screenshots without links: store the image; description is user-entered (short note field).
- Metadata fetch should be async — item appears in the list immediately with a "fetching…" state, then updates.

### 5.3 Organization
- **Categories:** a fixed but editable set (e.g. AI/ML Tools, Open Source Projects, IoT/Embedded, Design/UI Inspiration, Videos/Reels to Watch, Threads/Reads). One primary category per item.
- **Tags:** free-form, multiple per item, for finer-grained filtering (e.g. "python", "no-code", "arduino").
- **Status:** "To Explore" / "Explored" / "Archived" — lightweight triage state.
- Auto-suggestion of category/tags based on metadata (e.g. github.com links auto-tagged "Open Source") to reduce manual work, with the user able to override.

### 5.4 Browsing & Search
- Default view: reverse-chronological list/grid of saved items, each showing thumbnail, title, short description, platform badge, category, and status.
- Filter by: category, tag, platform, status, date range.
- Search bar across title, description, tags.
- Quick toggle between "list" and "card/grid" views.

### 5.5 Editing & Maintenance
- Inline edit of category, tags, status, and notes from the list view (no full page reload/form needed).
- Bulk actions: select multiple items to re-categorize, tag, or archive at once.
- Delete/archive with confirmation.

## 6. Non-Functional Requirements

- **Speed of capture is the #1 success metric** — share-to-saved should complete in under ~5 seconds end-to-end.
- Mobile-first responsive design for the web view; the share-sheet flow must work reliably on Android Chrome/Instagram/YouTube apps.
- Data ownership: all saved data should be exportable (e.g. JSON/CSV) so it's never locked in.
- Single-user auth is enough for v1 (simple password or magic-link login); no need for OAuth/social login initially.
- Reasonable storage for screenshots (a few hundred MB to start is fine).

## 7. Suggested Architecture (high-level, for discussion)

| Layer | Suggestion |
|---|---|
| Frontend | Simple responsive web app (e.g. React/Next.js or plain HTML+JS) acting as a PWA so it can register as an Android share target |
| Backend/API | Lightweight REST API (Node/Express, or Python/FastAPI) handling save, metadata fetch, list, search |
| Database | SQLite or Postgres — simple schema: items(id, url, screenshot_path, title, description, thumbnail_url, platform, category, tags, status, created_at) |
| Metadata fetching | Server-side Open Graph scraper / oEmbed calls (YouTube oEmbed, Instagram oEmbed where available, generic OG tag scraping for others) |
| Telegram Bot | Telegram Bot API (webhook-based), writes directly into the same backend/DB |
| Screenshot storage | Local disk or object storage (e.g. S3-compatible bucket) |
| Hosting | Since this pairs naturally with Rocky's Lab's existing projects, could be self-hosted alongside other Knots/IoT-style projects |

*(This section is a starting point for technical planning, not a locked-in decision.)*

## 8. MVP Scope (Phase 1)

1. Telegram bot: accept link → fetch metadata → save with category chosen via inline buttons.
2. Web list view: browse, filter by category, search.
3. Manual "+ Add" form on the web for links and screenshots.
4. Inline edit of category/tags/status.

## Phase 2 (Fast Follow)
1. Android share-target PWA for one-tap sharing from any app.
2. Bulk actions, auto-tag suggestions.
3. Export (JSON/CSV) and basic stats (e.g. items per category, "to explore" backlog count).

## Phase 3 (Later)
1. iOS Shortcuts-based share integration.
2. Screenshot OCR to auto-extract text/links from images.
3. Reminders/digest (e.g. weekly Telegram message: "You have 12 unexplored tools saved").

## 9. Open Questions
- Should the Telegram bot be the *primary* capture method, with the share-sheet PWA as secondary, or vice versa? (Affects which to build first.)
- Any preference on hosting (self-hosted vs. a small managed service)?
- Should screenshots support annotation (e.g. highlighting the interesting part) or just plain storage + note?
