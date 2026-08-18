# פוטודוקותרפיה איתן אונר — eitanuner.co.il

Replacement for Eitan Uner's site123 site. Next.js 16 (App Router) + Tailwind 4,
with a self-hosted [Puck](https://puckeditor.com) visual editor at `/editor`.
Hebrew, RTL throughout. No third-party CMS.

## Why it is built this way

Eitan is a working photographer, not a web person, and he came from a visual
page builder. Two decisions follow from that:

**Blocks, not a canvas.** The whole site is a small vocabulary of designed
section types (`hero`, `textImage`, `cardGrid`, `gallery`, `testimonials`,
`logos`, `quote`, `video`, `contact`). Pages are ordered lists of those blocks.
He picks blocks and fills in fields — he never positions or styles anything.
There is deliberately no spacing, colour or font control in the CMS, because the
polish is the product and a freeform canvas is exactly what would destroy it.

**Nobody else holds the content.** `src/lib/content.ts` in this repo is the
system of record. Puck is an MIT-licensed React component embedded in this app —
not a service — and it emits plain JSON we store ourselves. There is no vendor to
rate-limit us, take the content down, or start charging per seat.

## Running locally

```bash
npm install
npm run dev
```

Node 20+ required (built against 24). The public site needs no env vars; `/editor`
requires the two auth values below.

## The editor

`/editor` is the Puck canvas: drag-and-drop composition, a Hebrew component
palette, an outline of the page, per-block fields, viewport previews, and undo.

The key property is in `src/puck/config.tsx`: each component's `render`
delegates to the **same** component the live site uses. There is no parallel
"editor version" of a section that can drift from production — what Eitan drags
around is literally the page.

Field sets are deliberately narrow. Puck can expose arbitrary style controls; we
expose none, so a broken layout is not reachable.

### Auth

`/editor` and the editing APIs are gated by `src/middleware.ts`.

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

### Media

The picker (`src/puck/MediaField.tsx`) is a thumbnail grid with upload, and it
owns the `{src, alt}` pair together so an image without alt text is awkward to
create. `/api/media` validates MIME type and a 25MB ceiling, and sniffs PNG /
JPEG / WebP dimensions on upload — the gallery lays out with CSS columns using
each image's intrinsic ratio, so unknown dimensions would visibly break it.

`src/lib/storage.ts` has one seam, `putObject`. The local driver writes to
`public/uploads` and works in development and on any server with a disk.

## Storage: the repo is the database

Publishing commits `content/pages/<slug>.json`; uploads commit into
`public/uploads/`. Both trigger a Vercel rebuild, so a change is live in about a
minute and every edit is an ordinary commit — diffable, revertible, attributable.

That choice follows from the ownership constraint. A database and a media bucket
would each be another account and another bill in Eitan's name; the repo he
already owns costs nothing extra to hand over.

Configure with `GITHUB_TOKEN` (fine-grained PAT, Contents: read and write, this
repo only), `GITHUB_REPO`, `GITHUB_BRANCH`. With them unset, writes go to the
local filesystem — which is what development uses, and what a VPS would use.

Reads never touch the GitHub API: a committed file is just a file by the time it
is deployed. Only writing needs the token, so serving the site cannot be broken
by a network problem or an expired credential.

### Images are re-encoded twice, on purpose

**In the browser, before upload.** Not an optimisation — Vercel caps a function
request body at 4.5MB as an infrastructure limit that cannot be raised in
config, and Eitan's camera files run 6–15MB. Without the client-side downscale
in `MediaField.tsx`, his photos simply cannot be uploaded in production.

**On the server, with sharp.** Defence in depth for anything that skipped the
first pass, and it normalises EXIF rotation. Measured on his own files: 6MB
JPEGs land at ~790KB, an 8× reduction, at 2400px on the long edge.

Both matter because git keeps every version of every binary forever. Compression
is what makes repo-as-storage viable rather than a slow-motion mistake.

### When to move to R2

Watch for: publishes consistently taking several minutes, uploads failing
repeatedly, roughly 1,500+ images accumulated, or a shift to video. GitHub
recommends staying under 1GB per repo (5GB is the outer threshold), and the
site's images are currently ~3.3MB.

Migrating means implementing one function — `putObject` in `src/lib/storage.ts`
— against S3/R2 and rewriting the stored URLs. Hours, not a rebuild. **Do not
reach for Git LFS**: its objects transfer awkwardly between accounts and the
free tier bills past 1GB, reintroducing exactly the account-to-hand-over problem
this design avoids.

Eitan has a plain-language version of all of this in
[EITAN-README.md](EITAN-README.md), including the symptoms that should prompt him
to call.

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
