# The Gauntlet — Eitan Uner, alternative design

Branch: `gauntlet/redesign`. The faithful site123 recreation stays untouched on
`main`. This branch is the *alternative* offer, not a replacement.

## The bars

Chosen by Jordan. Both named, both fetchable, both comparable at 1440×900.

- **https://www.cinecasero.uy/** — Uruguayan collective, found-footage cinema
- **https://www.eladiodieste.com/** — Uruguayan engineer, brick architecture

## What the bars actually do (measured, not described)

Read out of the live DOM rather than eyeballed, because adjectives are
unfalsifiable and numbers are not.

| | Cine Casero | Eladio Dieste | **Eitan (before)** |
|---|---|---|---|
| Ground | `#EAE9E4` warm paper | `#000` + `#EADFD2` sand | **`#FFFFFF` pure white** |
| Ink | `#1C1C1C` | `#F1ECE8` on black | `#1A1A1A` |
| Accent | none — neutrals only | `#A55F2D` terracotta | `#14888D` teal |
| Display size | **120px / 104px / 96px** | **192px / 112px** | **60px** |
| Display weight | **300–400** | **400** | **700** |
| Tracking | normal | **−0.075em** (−14.4px @192) | −0.01em |
| Leading | **1.0** (120/121) | **1.0** (112/112) | 1.2 |
| Families | Ivy Mode serif + IBM Plex Sans | one custom face | one sans |
| Doc height | 910px (tight) | **11,673px** (long scroll) | 6,923px |
| Section marks | `01` `02` `03` | — | — |

### The five things both bars agree on

1. **Never pure white.** Warm paper or true black. White is the tell of a
   template.
2. **Display type is enormous and light.** 100–192px at weight 300–400. The
   current site's 60px/700 is small *and* heavy — the exact inverse.
3. **Negative tracking and 1.0 leading on display.** Big type only looks
   designed when it is optically corrected. Unadjusted big type looks like a
   mistake.
4. **The palette comes from the subject.** Dieste built in brick, so the site is
   terracotta. Nothing is decorative.
5. **Colour is an accent, never a fill.** Neither bar has a big flat colour
   block. The current site has teal slabs.

### The diagnosis

The current design is not "a bit dated". It is systematically the opposite of
both bars on **every measured axis**. That is good news: the gap is specific and
mechanical, not a matter of taste.

## Constraints (frozen — the builder may not touch these)

- Every Hebrew string in `src/lib/content.ts`
- All 18 slugs — SEO continuity off site123
- Phone, email, hours, images
- RTL correctness: `dir="rtl"`, inline-start/end. In RTL, `start` = **right**.
- Assistant stays the Hebrew text face. Hebrew has no real serif display
  tradition, so the Ivy Mode move does **not** transfer — reach for weight and
  scale contrast instead of a second family.
- Puck editor keeps working. `src/components/blocks.tsx` exports the renderers
  the editor reuses; changing their props breaks `/editor`.

## Pieces (smallest judgeable units)

Each is judged alone, blind, against the bars at 1440×900.

1. Ground, palette, type scale — the design tokens
2. Hero
3. Section rhythm and headings
4. Story index (the 8 photo-essays — closest analogue to both bars)
5. Gallery / image treatment
6. Footer + contact

## Rules for the critic

Spawn **fresh** each round. It must:

- Fetch the bar itself. Never accept a summary of the reference.
- Receive the two as **A** and **B**, order randomised, labels stripped.
- Answer: *which is better, and what is the single largest gap?* One gap, not a
  list.
- Never be told which is the candidate.

## Log

| Round | Piece | Blind verdict | Largest gap named |
|---|---|---|---|
| 1 | tokens, hero, all blocks | **lost** — 2 of 2 critics ranked it last | (a) section headings have no scale step; (b) hero photo is "an inline thumbnail floating in dead beige" |
| 2 | hero, block rhythm | **lost** — 4 of 4 critics picked the bar | 50/50 mirror bands; every photo the same size; no type tier below body |
| 3 | numbering, accent, tiled capture | **lost** — 2 of 2, but on far better evidence | identical repeated card rows; no dominant image per section; flat type ladder |

### Round 3 notes

The tiled harness paid for itself immediately: with true 1:1 captures the
critics stopped guessing at type sizes and started naming things that were
actually there. Two findings were specific enough to verify and fix on the spot:

- **Borders drawn around nothing.** 13 logos in a five-column grid ends 5/5/3,
  and the cell hairlines were still being stroked across the two empty slots.
  Exactly right, and indefensible. The grid is now a centred flex row that does
  not care about the count.
- **Two competing numbering systems.** Sections were numbered 01-08 *and* cards
  were numbered 01-04 inside them, so "03" meant two different things on one
  screen. Card numbers dropped; the section sequence is now unambiguous.

Also acted on: each card grid promotes its first card to a double-width,
16:9 lead so three consecutive grids read as three compositions rather than
"a loop with a different array passed in"; card titles moved to weight 500 so
the step down to body is carried by weight as well as by 1.25x of size.

**The asset wall.** One critic noticed a logo that "failed to desaturate" and
was right about the symptom but not the cause. The 13 client logos have the old
site's turquoise tile baked into the bitmap — behind the mark in several cases,
not merely around it. Two repair passes failed (bounding-box crop lost to
anti-aliasing; recolouring near-teal to white left a halo on some files and not
others). Greyscale now normalises them, and the pixel edits were reverted rather
than shipped half-working. Logged in HANDOVER.md — this one needs real files,
not cleverness.

**A CSS trap worth remembering:** `opacity` forms a stacking context, which
isolates an element and stops `mix-blend-multiply` from reaching the page behind
it. `opacity-60 mix-blend-multiply grayscale` rendered every logo as a grey
swatch, and each of the three classes looked innocent on its own.

### Round 2 notes

Four blind critics across two rounds, all four picked the bar. Useful, but only
after separating what they *saw* from what they *asserted*.

**Verified and acted on**

- **Image scale monotony.** Measured, not taken on faith: 26 images on the home
  page, and every content band rendered its photograph at the same mid-size 4:3
  rectangle. Exactly one image on the page was large. Fixed by alternating the
  block tempo — even blocks run the photo wide and bleed it off the viewport
  edge, odd blocks pull it in small and give the column to the text — and by
  rebuilding the gallery as a full-bleed mosaic with 2x2 tiles.
- **No tier below body.** "Display, section head, body, and nothing under it —
  no captions, no eyebrows, no smallest voice." True, and embarrassing: the bar
  analysis in this very file recorded Cine Casero numbering its sections
  01/02/03, `SectionHeading` has accepted an `index` since the first commit,
  and it was never passed. Now wired through every heading-bearing block.
- **Orphaned accent.** "The teal logo is an orphan against a beige/black page
  that uses no other accent." Correct — stripping the turquoise slabs left the
  brand colour with nowhere to live. The section numbers now carry it at the
  smallest size on the page.

**Asserted, checked, and false**

- Critics variously reported the section headings at "22-24px", "~34px" and
  "roughly the same size as the hero word". Measured in the DOM: **72px**,
  against 16px body and a 120px hero. One critic's prescribed fix — "~72px,
  1.05 line-height, -2% tracking" — described the code as it already was.
- One critic stated the hero photograph "never touches an edge". It bleeds to
  the viewport edge; verified visually and by measurement (2 images touch the
  edge at >=1280px, 0 at 1024 where the container is not width-capped).

**Two harness bugs, both of which corrupted a full round**

1. **Broken bleed.** `margin-inline-end: calc(50% - 50vw)` is wrong inside a
   grid: margin percentages resolve against the grid *track*, not the
   container's content box. It overshot by ~200px and gave the document a
   horizontal scrollbar, so one round was judged on a page 1695px wide in a
   1440px viewport. Replaced with a viewport-derived `.bleed-end` utility and
   verified at 1024/1280/1440/1920.
2. **Truncated captures.** Chromium's `fullPage` screenshot stopped painting
   past roughly 15,000px, so a 9,920px-tall page returned its last quarter —
   the entire contact block and footer — as blank ground. Both critics that
   round reported the page "stopped rather than closed" and called the tail
   dead space. **That criticism was of the screenshot, not the site**; the
   footer renders correctly. Replaced with evenly-spaced 1:1 viewport tiles,
   which also fixes the downscaling that produced the bogus type measurements.

The lesson worth keeping: a critic is reliable about *what it noticed* and
unreliable about *what it measured*. Take the finding, verify the number.

### Round 1 notes

Two independent blind critics, neither told which page was the candidate.
Both ranked it last. Both named a real gap, and they converge:

- **Section scale.** Critic 1 claimed the headings were "22–24px, barely
  distinguishable from body". That measurement is **wrong** — they measured
  44px in the DOM. But the *finding* survives the correction: the bar sets
  section heads at 104–112px, so 44px was a default, not a decision. Raised to
  a 4.5rem cap. Worth recording that the critic was believed on the substance
  and checked on the number.
- **The hero photograph.** Both critics independently described the hero image
  as floating with dead margin on all four sides, disconnected from the
  headline. Fixed by bleeding it off the inline-end viewport edge rather than
  containing it. It is deliberately 8 columns, not full-bleed: the source is
  659px wide and full-bleed would be a 2.1x upscale.
- **Harness bug found by a critic.** One bar (cinecasero.uy) captured as a
  single dark splash screen — its full-page shot was identical to its fold.
  A critic flagged the capture as unjudgeable, which was correct and which had
  quietly voided a third of the comparison. The site holds its content behind
  an intro state that never yields a scrolling page to a headless capture, so
  from round 2 the blind test runs **head to head against Dieste only**, and
  Cine Casero contributes its measured numbers rather than its screenshots.
- **Asset fix.** The hero source had an 11px black border baked in from the
  original screenshot crop; cropped to the content box (675x657 -> 659x657).

---

## Round 4: a void verdict, and the reason it was void

The final round is logged as **unjudged**, not as a loss.

The Opus critic 529'd twice on a server-side overload. I swapped the judge to
Sonnet to get a verdict out, and that was a methodological error: it changed the
instrument mid-experiment. The verdict that came back rested its entire
conclusion on a detail that does not exist.

Its answer to "what most threatens this reading as professional work" was:

> the uniform rounded-thumbnail-plus-paragraph module repeated verbatim down
> the page … the signature of an unmodified page-builder theme

Measured: **every `img` and every image wrapper on the page computes
`border-radius: 0px`.** Radii were removed in round 1 on purpose, because
neither bar rounds a corner. Two further claims fail the same way:

| Claim | Measured |
|---|---|
| "rounded card thumbnails", "rounded-rectangle slot" | `border-radius: 0px`, every image and wrapper |
| "deep teal … consistent across every section" | 22 teal occurrences, all 12.8–16px numerals and 1px rules; no teal surface exists |
| "no closing visual moment; the site just stops" | footer is `rgb(22,22,20)` with the name at 72px — the only inversion on the page |

### The rule this produces

**Never change the judge to work around an outage.** A blind comparison is only
worth the critic running it; swapping in a cheaper model to keep the loop moving
buys a verdict that has to be thrown away, and if it had happened to agree with
the previous rounds it would have been *kept* without the numbers ever being
checked. That is the real hazard — a wrong critic that confirms your priors is
invisible.

Retry the same judge, or log the round unjudged. Do not substitute.

## Standing at the end

Seven critics across three judged rounds, and the bar won every one. By this
technique's own exit condition — win, or the user calls it — **this has not
won**, and it should not be written up as if it had.

What closed:

| | Before | Now |
|---|---|---|
| Ground | `#FFFFFF` | `#EFEDE6` warm paper |
| Display | 60px / 700 | **120px / 300** |
| Section heads | 36px / 700 | **72px / 300** |
| Card titles | 20px / 700 | 24px and 20px / **500** |
| Micro tier | none | 12.8px, teal, section index |
| Distinct image widths | 5, one large | **8, two bleeding off the viewport** |
| Horizontal overflow | 0 | 0 (verified 1024–1920) |
| Colour slabs | 4 turquoise bands | 1 near-black inversion |

What is still open, and is the same note every round returned: Dieste varies its
image scale across an order of magnitude. Eitan's largest asset is 659px wide.
That ceiling is an asset problem, not a layout problem, and it does not move
until he supplies originals — see HANDOVER.md.

---

# Round 5: an actual gauntlet

Jordan's verdict on rounds 1–4 was that the critics were too soft and it was
not really a gauntlet. That was correct, and the specific failure was mine: I
ran three whole-page rounds, made a small fix each time, and then **called the
loop myself** — the one exit the technique forbids.

## What changed in the method

| Before | Now |
|---|---|
| "Which is better?" | **"Which was made by a studio and which by an amateur?"** |
| whole page, 1 verdict | **5 pieces, judged separately** |
| 1–2 critics | **3 fresh critics per piece, worst verdict wins** |
| claims taken on trust | **every factual claim checked against the DOM** |
| builder decides when done | every piece must pass, or Jordan calls it |

Discrimination beats preference because it can be *lost*, and because
"genuinely cannot tell" is a real win rather than a compliment.

## Scoreboard (critics who correctly identified this page as the amateur)

| Piece | R1 | R2 | R3 |
|---|---|---|---|
| masthead | 2 / 3 | 2 / 3 | *unsound — see below* |
| index | 1 / 3 | — | — |
| close | — | 3 / 3 | **2 / 3** |

Nothing has passed. The close went 6/6 against, then 2/3 — real movement,
still a fail.

## The bugs the panels found, which opinion never would have

- **The footer emitted every parent twice.** `[...topLevel, ...children]` gave
  23 links with 5 duplicated hrefs. Three critics called it "a raw sitemap
  dump". Now 18, then cut to a four-element close entirely.
- **The header was on different gutters from the page.** `px-4/lg:px-6` against
  `px-6/lg:px-10` everywhere else, putting the logo **16px** off the shared
  axis. Two critics named "a nav logo that doesn't align to the hero text".
  Logo, h1, tagline and footer name now all end at exactly 1300px at 1440.
- **The centred logo lockup** — a centred mark over right-ranged content, the
  clearest site123 signature on the page.
- **Paper contact block above a black footer** — "two disconnected panels".
  The close now runs on one ground.

## Three times the harness decided the result

1. **My dev badge.** Next's dev indicator rendered in every capture and two
   critics cited "a floating chat-widget bubble intruding on the layout" as
   evidence of amateur work. I had written that exact failure mode into the
   skill file as a rule, then failed to apply it.
2. **The bar caught mid-animation.** Round 22's masthead went 3/3 in this
   page's favour — and all three cited text clipping into a panel on the *other*
   image. That is Dieste's scroll-linked reveal sampled mid-transition.
   Lengthening the settle to 2.2s and awaiting `document.fonts` changed nothing,
   so it is not transient: **tile sampling cannot compare this bar's fold
   soundly.** The result is discarded. Winning because the harness damaged the
   opponent is the dev-badge mistake with the roles reversed.
3. **Judge substitution** (round 4, already logged above).

## A bias worth knowing about

These panels run on Sonnet, at Jordan's request. Consistency is what matters —
the earlier sin was *switching* mid-run, not the model itself. But this panel
visibly rewards tidiness: two critics praised this page's uniform grid over
Dieste's deliberate off-axis stagger, calling the bar "scattered at arbitrary
coordinates", and one read Dieste's generous whitespace as "unfilled space, not
a decision". So a win here is weaker evidence than a loss. **The losses are the
signal.**

## The one gap that stays

Dieste fills its closing wordmark with brickwork — the material the man built
in. A critic named that as the decisive tell and it is not a bug, a measurement
or an alignment: it is bespoke art direction. Closing it means designing
something equivalently specific to Eitan, not adjusting a token.

---

# Round 6: a new bar, and a measurement that lied three times

Jordan named a new bar: **https://idangross.com/** — a Hebrew RTL commercial
photography studio in Israel. Same language, same script direction, same
trade, same market. He also asked for camera stock photography, bolder design
and better readability.

## The bar is weaker than the page, and that is worth saying

Rounds 1–5 were run against Cine Casero and Eladio Dieste. Against those, this
page lost every judged round. Against idangross it wins the axes those rounds
optimised for before a critic is even asked:

| | idangross | this page |
|---|---|---|
| Ground | `#FFFFFF` | `#EFEDE6` warm paper |
| Display | ~40px bold | 120px / 300 |
| Third-party chrome | cookie bar, accessibility toolbar, SEO credit in footer | none |

Which means running the loop against it alone would exit on round one having
produced nothing — the failure mode the technique names explicitly. So it is
kept as the **competitor bar**, judged only on the three axes where it is
genuinely better (camera imagery, a scannable service grid, sheer boldness),
and **magnumphotos.com** is added as the hard bar. Documentary photography is
Eitan's actual field, so Magnum is judgeable on subject as well as craft, and
unlike Dieste it does not animate its fold on scroll — which is what made
Dieste impossible to tile-sample soundly in round 5.

## Fairness runs both ways

Round 5's rule was "never win because the harness damaged the opponent." The
new bar arrives with a cookie bar pinned across the footer and the standard
Israeli accessibility toolbar floating over the layout. Capturing those would
hand a critic exactly the "floating widget intruding on the layout" tell that
the dev-badge incident proved decides rounds. `scripts/shots.mjs` now dismisses
consent banners and removes third-party chrome on every target before shooting.

## The measurement that lied three times

The brief said every image must be sharp at 2x. Checking that turned into the
most instructive failure of the whole project, because the check was wrong
three separate ways and each way was convincing.

| Attempt | Reported | Reality |
|---|---|---|
| `naturalWidth` at DPR 1 | 26 of 26 images below 2x | The browser correctly picks 1x srcset entries. This is next/image working. |
| `naturalWidth` at DPR 2 | contradictory sizes across runs | Stale values even with `complete === true`; fetching the optimiser directly returned full-size images every time |
| scroll-everything to force lazy decode | 144px logos requesting `w=3840` | The scroll trips the preload scanner before layout, so `sizes` falls back to `100vw`. Self-inflicted. |

I reported the logo finding as a real performance bug before checking it. It
was not. Under a normal render those logos request 256px at DPR 1 and 384px at
DPR 2, which is correct.

**The rule this produces:** when a measurement indicts *everything*, suspect the
instrument before the subject. A page does not usually fail uniformly. Round 5
learned not to let a broken harness damage the opponent; this round is the same
lesson pointed inward — a broken harness can invent a defect in your own work
just as easily, and a defect that flatters your sense of thoroughness is the
hardest kind to doubt.

`scripts/audit-images.mjs` now compares rendered CSS width against the
intrinsic size of the file on disk. Both halves are stable, and the ratio is
the one that actually decides sharpness.

## What the sound version found

Two real defects, both verified from file dimensions rather than from the
instrument:

- **`sculpture` declared 1400×930 for a 3200×2125 file.** A stale declaration
  caps what next/image generates, so the widest slot on the page had been
  served a soft image. Declared size is not documentation.
- **CardGrid's lead card renders ~763px, not ~390px.** I placed a 960px camera
  image there believing it was an ordinary card — 1.26x, upscaling. Same
  mistake I had just fixed in the wide TextImage track, relocated rather than
  understood.

Three slots remain under 2x — `photo-salam` 759px, `crouching-alt` 640px,
`memorial-flag` 1400px. All three are Eitan's own originals and none moves
until he supplies full-size files. Same ceiling round 4 hit, unchanged.

## Camera imagery: what the licence filter cost

CC0 was treated as a hard constraint, not a preference, because this project
exists to be handed to Eitan's accounts and an attribution obligation travels
with the site forever.

- **Unsplash** is unusable programmatically — bot protection, 403 to automated
  clients. Not worked around.
- **Wikimedia Commons** has excellent camera photography at 4000–6000px and
  almost none of it is CC0. Ten queries returned one public-domain hit: a
  414px engraving from a 1911 encyclopedia.
- **StockSnap via Openverse** is art-directed and CC0, and its CDN caps at
  960w. Confirmed by probing every plausible size path.

960px is why cameras are confined to accent slots. It is sufficient at a 365px
card (2.63x) and upscaling anywhere wider. That constraint, not taste, set the
scope — and it happens to agree with the right answer anyway: on a
photographer's site his own photographs should carry the slots that matter.
