# Piano Teacher Website

A bilingual (繁體中文 / English) single-page site for a Hong Kong piano teacher, with a
purpose-built `/admin` panel so she can maintain it herself.

Built from her brief: **自我介紹** (about), **課程簡介** (courses), and **一個擺 video 嘅地方**
(a place for videos) — plus a contact form so enquiries actually reach her.

## Stack

| | |
|---|---|
| Frontend | Vite 8 · React 19 · TypeScript |
| Styling | Tailwind CSS v4 + CSS custom-property tokens |
| Motion | Motion (Framer Motion) |
| Backend | Supabase — Postgres, Storage, Auth |
| Data | TanStack Query |
| Host | Vercel |

## Running it

```bash
npm install
npm run dev
```

The site runs **without a backend**: with no Supabase credentials it serves the bundled
placeholder content from `src/lib/fallback-content.ts`, so you can work on the design
immediately.

### Demo mode — trying the admin panel with no backend

While there are no Supabase credentials, `/admin` accepts a local test login:

| | |
|---|---|
| Username | `admin` |
| Password | `8888` |

Everything works — editing, adding courses and videos, drag-to-reorder, image uploads,
delete-and-undo — but writes go to `localStorage` in your browser instead of a database.
A banner in the panel says so, with a **Reset demo data** button to return to the seeded
placeholder content. It is a fair way to show the client the panel before any backend exists.

Two caveats: uploaded **images** are inlined as data URLs and compressed hard to fit the ~5MB
localStorage quota, and uploaded **videos** are in-memory object URLs that do not survive a
reload. Both work properly once Supabase Storage is connected.

**This login cannot exist in production.** `isDemoMode` is
`import.meta.env.DEV && !isSupabaseConfigured`, so the whole branch is dead code in a
production build and is stripped: the string `8888` appears nowhere in `dist/`, and
`signInWithDemo` minifies to a stub that unconditionally returns `false`. Adding Supabase
credentials also switches demo mode off in dev. Real deployments always use the magic link.

To verify after any change:

```bash
npm run build && grep -rc "8888" dist/ | grep -v ":0" || echo "clean"
```

Other scripts:

```bash
npm run build
```

```bash
npm run lint
```

There is also an internal reference page at **`/styleguide`** showing every primitive in both
themes and both languages. Use it to catch theme drift after adding components.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com) (the free tier is sufficient).
2. In the dashboard, open **SQL Editor** and run, in order:
   - `supabase/migrations/0001_init.sql` — tables, row-level security, storage buckets
   - `supabase/migrations/0002_seed.sql` — placeholder content
3. **Edit the admin email.** In `0002_seed.sql`, replace `change-me@example.com` with the
   teacher's real address before running it, or afterwards:
   ```sql
   update public.admins set email = 'her.real@email.com';
   ```
   Only emails in `public.admins` can sign in and edit. This is enforced by RLS in the
   database, not by the UI.
4. Create her account: **Authentication → Users → Add user**, using that same email.
   Magic-link sign-in is configured with `shouldCreateUser: false`, so the account must exist
   first — a typo then fails cleanly instead of silently creating a second empty account.
5. Copy `.env.example` to `.env.local` and fill in **Project Settings → API**:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
   The anon key is public and browser-safe — RLS is what protects the data. Never put the
   `service_role` key here.
6. Restart the dev server.

To regenerate types after a schema change:

```bash
npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
```

## Deploying

Import the repo into Vercel. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as
environment variables. `vercel.json` handles SPA routing and cache headers.

Before going live:

- Replace `example.com` in `public/robots.txt` and `public/sitemap.xml`.
- In Supabase → **Authentication → URL Configuration**, add the production domain to the
  redirect allowlist, or magic links will bounce back to localhost.

## How it is organised

```
src/
  styles/tokens.css     ← the entire visual theme, both palettes
  i18n/                 language provider, UI strings, zh→en fallback
  theme/                dark/light provider
  lib/                  supabase client, video link parsing, image upload
  hooks/useContent.ts   all content queries
  components/           ui primitives, motion wrappers, layout
  pages/sections/       Hero, About, Courses, Videos, Contact
  admin/                the /admin panel (lazy-loaded, own chunk)
supabase/migrations/    schema + seed as SQL
```

### Things worth knowing

**Theming.** Every colour resolves through a variable in `src/styles/tokens.css`. Components
never hard-code a colour, which is what keeps the light theme from drifting. `index.html`
carries a tiny inline script that resolves the theme before first paint to avoid a flash.

**Bilingual content.** Stored as paired `_zh` / `_en` columns. The `text()` helper from
`useLang()` resolves the active language and **falls back to Chinese when English is blank** —
so the site can launch in 中文 only and gain English later, field by field.

**Videos.** Each video is a YouTube/Vimeo link, an uploaded file, or a `placeholder` — a real
state that renders a designed "coming soon" card. Links are recommended in the UI because they
cost no storage and play better on phones. Uploads are capped at 200MB and require a poster
image, since an uploaded file has no automatic thumbnail.

**Security.** `/admin`'s route guard is convenience only. The real boundary is row-level
security: the public may read published rows and insert enquiries, and nothing else. Every
write requires an authenticated session whose email is in `public.admins`, checked by the same
`is_admin()` function the UI calls.

## Not done yet

- The SQL migrations have not been executed against a real Postgres — no local daemon was
  available. Run them in the Supabase SQL editor and check for errors on first use.
- No custom domain configured.
- Real photography. The site ships with designed CSS placeholders; actual photos of her and the
  studio would lift it more than any code change.
- Optional: email notification on new enquiries (Supabase Edge Function + Resend) if she won't
  check the Messages panel regularly.
