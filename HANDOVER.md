# Handover — transferring this site to Eitan

**Design goal: Eitan owns everything.** Every choice in this project was checked
against one question — *can this move to his accounts without a rewrite, and does
it force him to depend on someone else's?* That is why there is no hosted CMS.

## What has to move

| Asset | How it transfers | Owner today |
| --- | --- | --- |
| GitHub repo | Settings → Transfer ownership, or fork to his org | Jordan |
| Vercel project | Vercel → Project Settings → Transfer to another account | Jordan's team |
| Domain `eitanuner.co.il` | already his; DNS at enter-system.com | Eitan |
| Content + images | in the repo — moves with it, no export step | — |
| GitHub token | regenerate on his account (Contents: read/write, this repo) | Jordan |
| Editor password | regenerate on his side (below) | Jordan |

Nothing else. There is no CMS account, no database login, no media service, no
per-seat licence, and no API key belonging to a vendor.

## Runtime dependencies

```
@measured/puck   MIT   the visual editor, an npm package — no account, no service
next / react           framework
```

That's the whole list. Puck is a component in this repo's `node_modules`, not a
SaaS product; if the project were abandoned tomorrow the site keeps working and
the editor keeps running.

## Steps

1. **Transfer the GitHub repo** to Eitan's account (or his org).
2. **Transfer the Vercel project** to his Vercel account. Vercel keeps the
   deployment history and the domain attachment.
3. **Re-add the environment variables** on his side — env vars do *not* always
   survive a transfer, and you want a password he owns anyway:
   ```bash
   npx tsx scripts/set-password.mts "his-new-password"
   ```
   Put `AUTH_SECRET` and `EDITOR_PASSWORD_HASH` into his Vercel project, give him
   the password directly, and delete any copy you hold.
4. **Redeploy.** Env vars only take effect on a new deployment.
5. **Point DNS** at his Vercel project (see the README's cutover section).
6. **Delete `PRODUCTION-CREDENTIALS.local.md`** from your machine if it is still
   there.

## Keep it this way

When picking anything new, prefer the option that adds no account Eitan would
not control. Storage already follows this rule: the repo he owns *is* the store,
so there is no database or media service in the handover.

The one planned exception is Cloudflare R2, if the repo ever outgrows image
storage — see the README for the symptoms, and EITAN-README.md for the
plain-language version Eitan has. That is a deliberate, later trade, not a
default.

If he ever stops working with Jordan, he should be able to keep the site running
by himself, with nothing to cancel and nobody to ask.


## Assets that need replacing

Everything below works, but it is built on images cropped out of screenshots of
the old site. None of it needs urgent attention; all of it will look better the
day Eitan sends originals.

| Asset | Now | Why it matters |
|---|---|---|
| `public/images/eitan-hero.webp` | 659x657 (an 11px black border was cropped off) | The hero holds it to 8 of 12 columns on purpose — that is ~913px, a 1.35x upscale. A real file lets the hero go full-bleed. |
| `public/images/eitan-portrait-bw.webp` | 519x421 | Small for any large placement. |
| `public/images/clients/*.webp` (13 files) | 314x312, **turquoise baked in** | The worst of the set. These were cropped out of the old site's turquoise tiles, and the turquoise is part of the bitmap — in several cases behind the mark, not just around it. Two repair passes were tried (crop to bounding box, recolour near-teal to white) and both failed on anti-aliasing and inconsistent shades. Greyscale is currently doing the work of making 13 inconsistent backgrounds look consistent. Ask each client for a PNG or SVG on a transparent background and the greyscale can become a real choice instead of a repair. |
| 8 story thumbnails | screenshot crops, ~756x909 | See below — searched for originals and there are none. |

Nothing here blocks launch. The client logos are the one place where a visitor
who looks closely can tell the images were recovered rather than supplied.

### The 8 story images: searched, and there are no originals

Eitan reported the "סיפורים מאחורי המצלמה" images as low resolution. He is right
about the one that matters, and the fix is not on our side — it needs files from
him. What was checked, so nobody repeats it:

All 177 files in the source photo folder were put on contact sheets and read by
eye, then matched again numerically (normalised grayscale correlation, full
frame and crop-tolerant over a sliding window at three scales). **No story image
has a higher-resolution original in the folder.** The best correlation any pair
reached was 0.78, on a subject pairing — an elderly man's portrait against a
photograph of a horse in a field — that is obviously coincidental; a true match
scores above 0.95.

Where these images *do* appear in the folder is inside the site123 screenshots
(`צילום מסך 2026-08-16 *.png`), which is exactly where they were cut from. Those
screenshots render each photograph at 742–783px — **at or below what is already
shipped**, so there is nothing to re-cut. The old site was offline before this
project started, so there is nothing to re-download either.

| Story image | Subject | Needed from Eitan |
|---|---|---|
| `photo-salam.webp` | colour, participants joining hands across a picnic table | **the priority — this one is the visible defect** |
| `cemetery.webp` | young man at a memorial, cypresses and an Israeli flag | full-size original |
| `shukri.webp` | B&W portrait of שוקרי אבו חסן | full-size original |
| `beit-ekstein.webp` | group around a table, shallow foreground bokeh | full-size original |
| `maas-akim.webp` | photo cards spread across a tiled floor | full-size original |
| `organizations.webp` | shadows of outstretched hands on a white surface | full-size original |
| `mefunei-gader.webp` | hands cradling a camera lens, close up | full-size original |
| `nataraj.webp` | video camera and lighting rig at the festival | full-size original |

**Only `photo-salam` is actually soft.** It holds the lead card, which renders
564px, so a 759px file is 1.35x. The other seven render at 266px in the card
grid and land at 2.84x — already sharp, and they would only need replacing if a
future layout gave them a larger slot. It is worth being precise about that: the
brief for this round assumed all eight were failing, and seven of them are fine.

Nothing was upscaled and nothing was substituted. A synthetically enlarged image
is worse than an honestly soft one, and dropping an unrelated photograph into a
memorial or testimony slot would make the Hebrew alt text a lie.
