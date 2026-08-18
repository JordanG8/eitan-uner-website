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
| 2 | hero + type scale | pending | — |

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
