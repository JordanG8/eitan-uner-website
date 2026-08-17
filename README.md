# פוטודוקותרפיה איתן אונר — eitanuner.co.il

Replacement for Eitan Uner's site123 site. Next.js 16 (App Router) + Tailwind 4,
with an optional Sanity Studio embedded at `/studio`. Hebrew, RTL throughout.

## Why it is built this way

Eitan is a working photographer, not a web person, and he came from a visual
page builder. Two decisions follow from that:

**Blocks, not a canvas.** The whole site is a small vocabulary of designed
section types (`hero`, `textImage`, `cardGrid`, `gallery`, `testimonials`,
`logos`, `quote`, `video`, `contact`). Pages are ordered lists of those blocks.
He picks blocks and fills in fields — he never positions or styles anything.
There is deliberately no spacing, colour or font control in the CMS, because the
polish is the product and a freeform canvas is exactly what would destroy it.

**Content lives in two places, on purpose.** `src/lib/content.ts` holds every
piece of copy transcribed from the original site. `src/lib/fetch.ts` tries Sanity
first and falls back to that file. So:

- with no Sanity project configured, the site is fully working and static;
- once configured, Sanity wins and `content.ts` becomes the safety net;
- a Sanity outage freezes the site at the last deploy rather than breaking it.

## Running locally

```bash
npm install
npm run dev
```

Node 20+ required (built against 24). No env vars needed to run.

## Connecting Sanity

1. Create a project at [sanity.io/manage](https://sanity.io/manage) (free tier is
   enough) and note the **project id**.
2. Copy `.env.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. Add the same variables in Vercel → Project → Settings → Environment Variables.
4. Add the deployment URL to the project's CORS origins in sanity.io/manage.
5. Visit `/studio`, log in, and create the documents. Schemas live in
   `src/sanity/schemas/`.

Until step 2 is done, `/studio` shows a short Hebrew notice instead of the editor
and the public site is unaffected.

### What Eitan sees

Every field label, description and option in the Studio is written in Hebrew,
addressed to him — that text *is* his interface. Sanity's own chrome
("Publish", "Documents") stays English; that was the known trade-off in choosing
Sanity, and it is the one thing to watch when he first uses it.

`presentationTool` gives him side-by-side live preview: he edits on the left and
watches the real page update on the right.

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
the wild** — the Studio says so in Hebrew on the slug field.

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
