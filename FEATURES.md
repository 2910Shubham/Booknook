# BookNook — Feature Inventory (Current Codebase)

This document lists what is currently implemented in the repo so we can rebuild cleanly and intentionally.

**Authentication**
- Clerk authentication (email/password, social providers configured in Clerk dashboard)
- Protected app routes via Clerk middleware
- Post‑sign‑up profile sync to Supabase `profiles` table
- Logout via profile menu in the library header

**Library (Home)**
- Library page listing books from Supabase for the signed‑in user
- Local library (offline) merged into the list from `localStorage`
- Upload modal (drag‑drop or file picker)
- Background upload flow for cloud books
- Upload status toast + progress indicator
- Delete local books (IndexedDB + localStorage)
- Delete remote books (Supabase storage + DB row)

**Reader**
- PDF rendering via PDF.js (page‑by‑page canvas)
- Page navigation controls (next/prev)
- Page indicator + total pages
- Zoom controls (fit + manual)
- Fullscreen toggle
- Focus mode (distraction‑free)
- Settings panel (theme + font size)
- Mobile touch gestures (pinch/drag)
- Toolbar with hamburger menu for mobile

**Annotations**
- Tools: cursor, highlighter, pen, underline, sticky note, eraser
- Undo and clear‑page actions
- Per‑page annotation storage scoped by `user_id`, `book_id`, `page_number`
- Annotation API endpoints (create, update, delete, fetch)

**Reading Progress + Sessions**
- Local reading progress per file (localStorage)
- Remote reading progress per book (Supabase)
- Reading sessions logged to Supabase
- Offline queue for failed progress/session updates
- Sync indicator for background network operations

**PDF Upload + Storage**
- Local file cached in IndexedDB for immediate reading
- Cloud upload stored in Supabase Storage under user/book path
- Automatic PDF compression for files > 10MB (client‑side)
- Signed upload URLs + signed read URLs

**UI / Design System**
- Dark theme base with theme variants (via CSS variables)
- Typography system (Playfair Display, Lora, Source Serif 4)
- Responsive layout rules for mobile/tablet/desktop
- Custom buttons, tooltips, toasts, spinners

**Infrastructure / API**
- Supabase admin client for server routes
- REST API routes for books, progress, sessions, annotations, user profile sync
- Local storage utilities

**Scaffolds / Partially Wired**
- Supabase bookmark queries exist but no UI wired
- Progress “feature folder” placeholder exists but is not active

**Known Issues (from recent debugging)**
- Clerk configuration mismatch can cause redirect loops and 401s
- Mobile sign‑in can fail if allowed origins are not set in Clerk
- Reader performance can degrade if PDFs are reloaded repeatedly
