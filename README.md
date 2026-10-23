# פוטודוקותרפיה איתן אונר — eitanuner.co.il

Replacement for Eitan Uner's site123 site. Next.js 16 (App Router) + Tailwind 4,
with a [Lexical](https://lexical.dev) editor at `/editor` and content stored in
Vercel Blob. Hebrew, RTL throughout. No third-party CMS.

## How it is built

**Eitan has full control of the design.** Every page is a Lexical document he
edits in place, inside the site's real header and footer:

- **Text** is typed straight onto the page and styled from the toolbar:
  headings, lists, quotes, links, bold/italic/underline, font (19 Hebrew
  Google Fonts), size, text and highlight colour, alignment.
- **Layout**: coloured panels (background colour or photo, text colour,
  width, padding) and 2–4 column grids, both holding ordinary text.
- **Sections**: the site's designed sections — scroll story, hero, text +
  image, cards, gallery, testimonials, logos, quote, video, contact, story
  article — are Lexical decorator nodes. Selecting one opens its fields in the
  side panel, plus a design panel (background colour/photo, text, heading and
  brand colours, spacing, width, fonts, corner rounding, scroll animation,
  hide on phone/desktop).
- **Elements**: image, buttons, embed (YouTube, Vimeo, Maps, or pasted HTML),
  divider, spacer.
- **Site design** (`/editor/site`): palette, fonts, base size, spacing, corner
  rounding, button shape, header layout (full-screen menu or link bar), logo,
  menu links, footer, contact details, custom CSS — with a live preview of the
  homepage.
- **Pages**: create (blank or as a copy), duplicate, rename/move (menu links
  follow), reorder, delete, and restore any of the last 30 published versions.

**The default design is the original, exactly.** The seed in
`src/lib/seed.ts` turns the transcribed content (`src/lib/content.ts`) into
Lexical documents with one section node per original section. Rendered, all
26 routes are pixel-identical to the pre-Lexical site at desktop and phone
widths; theme values only emit CSS once they differ from the defaults.

**Same components in the editor and on the site.** `src/blocks/render.tsx` is
the single map from section type to component. The editor's decorator nodes
render through it, and so does the public renderer — so what Eitan edits is
literally the page.

**Visitors never download the editor.** `src/lexical/Render.tsx` walks the
saved Lexical JSON and produces the same markup Lexical does (same tags, same
theme classes from `src/lexical/doc.ts`) as a server component. Lexical itself
only loads on `/editor`.

## Running locally

```bash
npm install
npm run dev
```

Node 20+ required (built against 24). The public site needs no env vars;
`/editor` requires the two auth values below. Without `BLOB_READ_WRITE_TOKEN`,
saves go to `./.data/` on the local disk.

## Code map

| Path | What |
| --- | --- |
| `src/app/[[...slug]]/page.tsx` | every public page, at any depth |
| `src/lexical/doc.ts` | saved-page types, theme class names, builders |
| `src/lexical/Render.tsx` | saved JSON → React (public site) |
| `src/lexical/nodes.tsx` | editor nodes: section, panel, columns |
| `src/blocks/render.tsx` / `fields.tsx` | each section's render / editable fields |
| `src/editor/*` | page editor, toolbar, side panel, site-design editor, field controls |
| `src/lib/site.ts`, `src/components/ThemeStyle.tsx` | site design document → CSS variables |
| `src/lib/store.ts`, `src/lib/cms.ts`, `src/lib/pages.ts` | storage, cached reads, page operations |
| `src/app/editor/*`, `src/app/api/editor/*` | dashboard and editing APIs |

## Auth

`/editor` and the editing APIs are gated by `src/proxy.ts`, and each write
route checks the session again (`src/lib/session.ts`).

```bash
npx tsx scripts/set-password.mts "a-long-password"
```

That prints `AUTH_SECRET` and `EDITOR_PASSWORD_HASH` for `.env.local` and for
Vercel. The password is never stored — only a PBKDF2 hash. Sessions are
HMAC-signed HttpOnly cookies with a 12-hour expiry and no server-side session
table; rotating `AUTH_SECRET` signs everyone out at once.

**It fails closed.** With those vars missing, `/editor` returns 503 rather than
being left open.

Note the hash is colon-separated, not the conventional `$`-separated: Next.js
performs `$VAR` expansion when parsing `.env` files, which silently mangles a
`$`-delimited hash and presents as "correct password rejected".

## Storage

Everything Eitan edits lives in **Vercel Blob**, a store inside the same Vercel
project (`eitan-uner-content`, region fra1, connected to production, preview
and development). Connecting it sets `BLOB_READ_WRITE_TOKEN`; nothing else is
configured. With no token, writes go to `./.data/` (development or any server
with a disk); on Vercel without one, the editor says storage is missing
instead of failing silently.

Documents (`src/lib/store.ts`):

```
content/site/<version>.json        site design
content/pages/<version>.json       page list: id, slug, title
content/page-<id>/<version>.json   one page: settings + Lexical JSON
media/<name>-<stamp>_<w>x<h>.webp  uploads (dimensions in the name)
```

Every save writes a **new** immutable file and the newest wins, so there is
version history for free (the last 30 are kept and restorable from the
editor), and a CDN-cached blob URL can never serve a stale version. Anything
never saved falls back to the seed.

Public reads are cached with a tag; every write expires it, so a publish is
live on the next request — no commit, no rebuild.

Uploads are downscaled in the browser first (Vercel caps request bodies at
4.5MB; camera files are 6–15MB), then re-encoded to WebP with sharp, which also
normalises EXIF rotation.

**Preview and production share the store.** Publishing from a preview
deployment's editor changes the content production serves.

## Deploying

Vercel, connected to `main`. Set `NEXT_PUBLIC_SITE_URL` to the production domain.

### DNS cutover

The domain runs on `ns1/ns2.enter-system.com` — an independent Israeli provider,
**not** site123. So going live is an A/CNAME change there, with no domain
transfer and no site123 involvement:

- `www.eitanuner.co.il` → CNAME → `cname.vercel-dns.com`
- `eitanuner.co.il` → A → `76.76.21.21`

Confirm the current values in Vercel → Domains before changing anything, since
Vercel occasionally updates its target addresses.

## URLs

Slugs reuse the original Hebrew URLs from site123 (`/אודות`, `/קהילת-אור`,
`/פסטיבל-הצילום-הבינלאומי` …) so existing inbound links and Google's index keep
resolving after the cutover. **Changing a slug breaks links that already exist in
the wild**.

## Assets

The original site was already offline when this was built (the domain served a
site123 upsell page), so nothing could be scraped. Images come from the photo
folder Eitan supplied, plus crops from his screenshots where a photo existed only
there.

Two images are screenshot crops and are lower resolution than ideal:

| File | Size | Used for |
| --- | --- | --- |
| `eitan-hero.webp` | 675×657 | homepage hero |
| `eitan-portrait-bw.webp` | 519×421 | About page portrait |

Both are adequate at their current display sizes but should be replaced with
originals from Eitan when available. The 13 client logos in
`public/images/clients/` and the 8 story thumbnails in `public/images/stories/`
are likewise screenshot crops — fine at their display sizes, worth replacing with
real files when available.

`src/components/Logo.tsx` redraws the camera mark as inline SVG rather than using
a bitmap, so it stays sharp at any size.

## Palette

Sampled from the original screenshots, not guessed:

| Token | Hex | Where |
| --- | --- | --- |
| `brand-500` | `#14888D` | section fills, buttons, footer |
| `brand-600` | `#0C898E` | logo, headings, links |
| `brand-400` | `#44A0A4` | borders, hovers |
| `ink` | `#1A1A1A` | body text |
| `surface-alt` | `#EFF3F6` | alternating section background |

Type is [Assistant](https://fonts.google.com/specimen/Assistant), 300–800,
self-hosted via `next/font`.

## Deliberate changes from the original

- Card text sizes to its content instead of scrolling inside a fixed-height box
  (the original's Edut 710 and Lectures cards had inner scrollbars, which read
  badly on mobile).
- Real focus states, a skip link, and alt text on every image — the original had
  none of these.
- `ProfessionalService` structured data, a sitemap, and per-page meta
  descriptions, so Eitan can actually surface in local search.
- Mobile navigation is a proper drawer rather than a cramped dropdown.

## Known gaps

- `הרגש אין לו סוף` — Google also has an indexed `/העצב-אין-לו-סוף` ("sorrow"
  rather than "feeling"). The nav in the screenshots says הרגש, so that is what
  is built; if העצב was a real separate page, it needs adding or redirecting.
- `תערוכות`, `ארגונים`, `חינוך וחינוך בלתי פורמלי` and `אממם יש לי שאלה` were
  not fully captured in the screenshots. They are built with accurate but
  summarised copy drawn from adjacent pages, and should be reviewed with Eitan.
