# Design QA fixes — 18 October 2026

The seven confirmed defects from the full-site audit are addressed. Seven design recommendations are implemented, and three have remaining source-content or external-media work as described below. The Hebrew URLs and existing visual identity are preserved.

| Finding | Resolution |
| --- | --- |
| D01 — story overlap | Natural-height narrative on small/short viewports, reduced motion and enlarged text. Cinematic CSS animation remains on sufficiently wide, tall screens. The workshop photographs share a bounded row on desktop. |
| D02 — clipped captions | Captions now participate in normal layout with their own line height and padding. |
| D03 — portrait cropping | All eight story-detail photographs use their intrinsic aspect ratios and `object-contain`. |
| D04 — menu contrast | Raised label and number contrast. Fixed accessible names to include visible header/logo labels. |
| D05 — duplicate footer links | One link per destination: 18 unique links. |
| D06 — heading hierarchy | Added the home H1, one contact-page H1, and appropriate H2/H3 card headings. |
| D07 — story canonicals | Every story has its own canonical path and Open Graph URL. |
| R01 — delayed service CTA | Home opens with the service, audience, booking link, method link and an optional entry into the photo narrative. |
| R02 — inert galleries | Accessible full-image dialog, previous/next controls, keyboard navigation, Escape/focus return, visible descriptions and stable photo references. WhatsApp/email enquiries identify the selected photo. Prints have purchase-specific copy. |
| R03 — mobile contact | Phone, WhatsApp and email come before location/hours/map and fit within a 320 × 568 first viewport. |
| R04 — menu hierarchy | Services/contact are promoted; remaining destinations are grouped by visitor task. Existing focus containment, scroll locking and Escape behavior are preserved. |
| R05 — narrow testimonials | Controls moved below a wider quote. Long quotes have an explicit full-text toggle; all controls are at least 44 px high, with a polite slide announcement. |
| R06 — service detail | Added verified summaries, contextual enquiries and related proof on Method, Organizations, Education and Lectures. |
| R07 — short stories | Related services and next-story navigation added. Undated day/month labels are withheld from display but retained in source. Fuller case studies, outcomes, photos and missing years still require verified editorial material. |
| R08 — FAQ | Questions are semantic headings; the closing invitation links directly to contact. |
| R09 — video | Editorial title, duration, descriptive frame title and direct YouTube fallback implemented. Full playback and Hebrew caption/transcript availability remain unverified: this environment blocks YouTube media requests. The upstream YouTube title is unchanged. |
| R10 — client logos | Consistent mats, visible organization names and seven relevant project links added. Existing raster sources include baked-in crops/backgrounds; clean original artwork is still needed to restore missing detail. |

## Validation

- Production build and TypeScript checks pass; ESLint and `git diff --check` pass.
- 66 desktop/mobile browser checks passed, covering all 26 routes and their WCAG/best-practice automated scans, metadata, footer links, galleries, menus, testimonials, contact, FAQ, service enquiries and reduced-motion/enlarged-text layouts.
- Two additional cinematic-layout regression checks pass at 1024 × 900, 1440 × 900 and 1920 × 800 across four copy beats in both photographic scenes.
- Natural-flow layout verified at 320 × 568, 390 × 664, 390 × 844 and 844 × 390; 200% root text at 640 × 900 and 1440 × 900.
- All 26 routes reviewed for completed broken images: none found.
- Firefox: 18 main routes return 200, each has one H1 and no document overflow; gallery navigation and Escape/focus return pass.
- New editor fields round-trip through the existing Puck seed/publish conversion on all 18 pages.
- Browser checks inspect enquiry links without sending messages or publishing editor content.

Automated checks do not establish complete WCAG conformance. Safari/physical-device checks and full external video playback remain outstanding.

## Running the regression checks

```bash
npm ci
npx playwright install chromium
npm run build
npm run test:design
```

The test runner starts the production server. To use an existing Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. To check a deployed preview, set `QA_BASE_URL` to that preview origin.

## Domain configuration

`NEXT_PUBLIC_SITE_URL` and the existing default `https://www.eitanuner.co.il` are preserved because the repository handover explicitly identifies that domain as the intended final destination. The unique story paths are fixed independently. Attaching/cutting over that domain remains the separate process documented in `README.md`; these design fixes do not change DNS.
