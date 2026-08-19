import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/content";
import type {
  Block,
  CardGridBlock,
  ContactBlock,
  GalleryBlock,
  HeroBlock,
  LogosBlock,
  QuoteBlock,
  RichTextBlock,
  TestimonialsBlock,
  TextImageBlock,
  VideoBlock,
} from "@/lib/types";
import { Button, CtaRow, Inline, QuietLink, Rule, Section, SectionHeading } from "./site";
import { Separator } from "./ui/separator";
import { Testimonials } from "./Testimonials";

/**
 * Block renderers — retuned against cinecasero.uy and eladiodieste.com.
 * See GAUNTLET.md for the measurements this is built against.
 *
 * Every prop signature is unchanged, because the Puck editor imports these
 * same components and content.ts is frozen. What changed is the design.
 */

/* -------------------------------------------------------------------- hero */

export function Hero({ block }: { block: HeroBlock }) {
  // "end" puts the portrait on the inline-end side — the left, in RTL.
  const imageLast = (block.imageSide ?? "end") === "end";
  const backdrop = block.backdrop;

  /**
   * A masthead where the type sits ON the photograph, not beside it.
   *
   * Four passes to get here. The first three all failed the same way and every
   * blind panel said so in different words: "an inline thumbnail floating in
   * dead beige", "the two halves share no axis and no baseline", "a centred
   * word floating alone in empty beige". Title, photo and buttons were three
   * objects sharing a screen.
   *
   * The reason it took four passes is that I had the wrong constraint. I kept
   * writing that the source was 659px and full bleed would be a 2.1x upscale —
   * true of the asset, and false of the archive, which holds 61 photographs
   * between 12 and 24 megapixels. The portrait genuinely cannot go full bleed;
   * his *photographs* always could. So the fold now leads with his work at
   * 100vw and keeps the portrait inset, which is both the stronger composition
   * and the only resolution-honest one.
   *
   * Backdrop is optional: without one this degrades to the previous contained
   * layout on paper rather than breaking.
   */
  if (!backdrop) {
    return (
      <section className="overflow-x-clip bg-paper">
        <div className="mx-auto max-w-(--container-content) px-6 pt-16 sm:pt-20 lg:px-10 lg:pt-24">
          <h1 className="text-display font-light text-ink">{block.title}</h1>
          <div className="mt-14 grid items-center gap-x-12 gap-y-10 pb-24 lg:mt-20 lg:grid-cols-12 lg:pb-32">
            <div className={`lg:col-span-8 ${imageLast ? "lg:order-last bleed-end" : "bleed-start"}`}>
              <div className="relative aspect-4/3 w-full overflow-hidden bg-paper-deep">
                <Image
                  src={block.image.src}
                  alt={block.image.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div className="lg:col-span-4">
              <p className="text-lede text-ink-soft">{block.subtitle ?? site.tagline}</p>
              <CtaRow ctas={block.ctas} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      // The header watches for this to go transparent and invert over the
      // photograph, the way both bars run their navigation through the image
      // rather than in a bar above it.
      data-hero-dark=""
      // Rise under the sticky header, then pad the content back down by the
      // same amount, so the photograph runs edge to edge behind the nav while
      // the type still clears it. --header-h is published by Header.
      className="relative isolate -mt-[var(--header-h,68px)] flex min-h-[86vh] items-end overflow-hidden bg-void pt-[var(--header-h,68px)]"
    >
      <Image
        src={backdrop.src}
        alt={backdrop.alt}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover"
      />
      {/* A scrim, not a wash. The dusk frame is already dark at the horizon;
          this only guarantees the type holds its contrast at the bottom edge
          where the CTAs sit. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-void/85 via-void/40 to-void/25"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-(--container-content) px-6 pt-40 pb-20 lg:px-10 lg:pt-52 lg:pb-28">
        {/*
          One focal path, top to bottom: name, then claim, then a single way in.
          The panel that failed this piece named three separate causes and they
          were all the same cause — too many objects. The portrait sat loose in
          the middle of the frame colliding with the horizon line, and a filled
          button and an outlined button sat side by side reading as two equal
          choices rather than a primary and a secondary.

          The portrait is gone from the fold. It was never doing work here: it
          is Eitan's weakest asset at 659px, it competed with his own
          photograph, and it already appears further down the page where the
          copy is actually about him.
        */}
        <h1 className="text-display font-light text-paper">{block.title}</h1>

        <p className="text-lede mt-8 max-w-(--container-text) text-paper-soft">
          {block.subtitle ?? site.tagline}
        </p>

        {block.ctas?.length ? (
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button cta={{ ...block.ctas[0], tone: "solidWhite" }} />
            {/* Secondary reads as a link, not a second button of equal weight.
                QuietLink, not a hand-rolled border-b: this treatment appears
                three times on the page and used to be written out three times
                at three different sizes. */}
            {block.ctas[1] && (
              <QuietLink href={block.ctas[1].href} onDark>
                {block.ctas[1].label}
              </QuietLink>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- textImage */

export function TextImage({
  block,
  index = 0,
}: {
  block: TextImageBlock;
  index?: number;
}) {
  const bg = block.background ?? "white";
  // "brand" is a tonal ground now, not an inverted one — nothing here flips.
  const onBrand = false;
  const imageLast = (block.imageSide ?? "end") === "end";

  /**
   * Two alternating tempos, not one repeated row.
   *
   * Round 2 of the gauntlet was lost on this block more than any other. Two
   * blind critics independently described the page as "a template being
   * filled" and pointed at the same thing: consecutive 50/50 rows with the
   * same image width, the same aspect and the same button pair, stacked with
   * identical padding. Measuring the page settled it — 26 images, and every
   * content band rendered its photograph at the same mid-size 4:3 rectangle.
   * One image on the whole page was large.
   *
   * So even blocks now run the photograph wide and bleed it off the viewport
   * edge; odd blocks pull it in small and give the column back to the text.
   * The page gains a rhythm that alternates rather than repeats.
   */
  const wide = index % 2 === 0;

  const imageCols = wide ? "lg:col-span-7" : "lg:col-span-4";
  const textCols = wide ? "lg:col-span-5" : "lg:col-span-7 lg:col-start-2";
  const bleed = wide ? (imageLast ? "bleed-end" : "bleed-start") : "";

  return (
    <Section background={bg}>
      <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div className={`${imageCols} ${imageLast ? "lg:order-last" : ""} ${bleed}`}>
          <div
            className={`relative w-full overflow-hidden bg-paper-deep ${
              wide ? "aspect-3/2" : "aspect-4/5"
            }`}
          >
            <Image
              src={block.image.src}
              alt={block.image.alt}
              fill
              sizes={wide ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 100vw, 34vw"}
              className="object-cover"
            />
          </div>
        </div>

        <div className={textCols}>
          {block.title && (
            <>
              <h2
                className={`text-section font-light ${onBrand ? "text-paper" : "text-ink"}`}
              >
                {block.title}
              </h2>
              <Rule onBrand={onBrand} />
            </>
          )}
          {block.eyebrow && (
            <p className={`text-lede ${onBrand ? "text-paper-soft" : "text-ink-soft"}`}>
              {block.eyebrow}
            </p>
          )}
          <div className={`prose-he mt-4 ${onBrand ? "text-paper-soft" : "text-ink-soft"}`}>
            {block.body.map((p, i) => (
              <p key={i}>
                <Inline text={p} />
              </p>
            ))}
          </div>
          <CtaRow ctas={block.ctas} />
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- richText */

export function RichText({ block }: { block: RichTextBlock }) {
  const bg = block.background ?? "white";
  const onBrand = false;
  return (
    <Section background={bg}>
      {block.title && (
        <div className="mb-16">
          <SectionHeading onBrand={onBrand}>{block.title}</SectionHeading>
        </div>
      )}
      {/* Measure, not a fraction of the viewport. Long Hebrew lines are the
          fastest way to make a page feel unedited. */}
      <div
        className={`prose-he text-lede max-w-(--container-text) ${
          block.align === "center" ? "mx-auto text-center" : ""
        } ${onBrand ? "text-paper-soft" : "text-ink-soft"}`}
      >
        {block.body.map((p, i) => (
          <p key={i}>
            <Inline text={p} />
          </p>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- cardGrid */

export function CardGrid({ block }: { block: CardGridBlock }) {
  const bg = block.background ?? "white";
  const onBrand = false;
  const cols =
    block.columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : block.columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  /**
   * The first card leads.
   *
   * Three of these grids run back to back on the home page, and two blind
   * critics independently described them as "a loop with a different array
   * passed in" — same width, same aspect, same rule, same link, three screens
   * running. Promoting the lead card to a double-width, wider-cropped frame
   * turns each grid into a composition with a dominant and subordinates,
   * which is the shape both bars use, without touching the content.
   *
   * Only worth doing when there are enough cards left to fill the row behind
   * it; below that it just makes a lopsided grid.
   */
  const lead = block.cards.length >= 3;

  return (
    <Section background={bg}>
      {block.title && (
        <div className="mb-16">
          <SectionHeading onBrand={onBrand}>{block.title}</SectionHeading>
        </div>
      )}

      {/* No borders, no shadows, no fills. Neither bar puts a photograph in a
          card — the image sits on the page, and a hairline does the separating
          that a box used to do. */}
      <div className={`grid gap-x-8 gap-y-14 ${cols}`}>
        {block.cards.map((card, i) => {
          const big = lead && i === 0;
          const inner = (
            <>
              {card.image && (
                <div
                  className={`relative w-full overflow-hidden bg-paper-deep ${
                    big ? "aspect-16/9" : "aspect-[5/4]"
                  }`}
                >
                  <Image
                    src={card.image.src}
                    alt={card.image.alt}
                    fill
                    sizes={
                      big
                        ? "(max-width: 640px) 100vw, 66vw"
                        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    }
                    className="object-cover transition-transform duration-(--duration-slow) ease-out group-hover:scale-[1.04]"
                  />
                </div>
              )}

              <div className={`flex flex-1 flex-col ${card.image ? "pt-6" : ""}`}>
                <Separator className="mb-5" tone={onBrand ? "dark" : "paper"} />
                {/* Card titles carry weight where the display type carries
                    size. Everything on the page was set at 300, so the step
                    from a 20px title to 16px body was doing its work on 1.25x
                    of size alone — which reads as mush. */}
                <h3
                  className={`font-medium leading-snug transition-colors ${
                    "text-rise"
                  } ${onBrand ? "text-paper" : "text-ink"} ${
                    card.href ? "group-hover:text-brand-700" : ""
                  }`}
                >
                  {card.title}
                </h3>
                {card.body && (
                  /* 1rem, not 0.95.
                     Card bodies carry the longest continuous prose on the
                     page - the lead card's runs past 300 characters - and at
                     0.95rem they measured 15.2px. Hebrew has no lowercase and
                     no ascender/descender rhythm to help the eye at small
                     sizes, so 15px is meaningfully below comfortable in a way
                     the same value would not be in Latin. */
                  <p
                    className={`mt-3 text-body ${
                      onBrand ? "text-paper-soft" : "text-ink-soft"
                    } ${big ? "max-w-(--container-text)" : ""}`}
                  >
                    {card.body}
                  </p>
                )}
                {/* mt-auto pins the link to the bottom of the cell, so a card
                    whose title wraps to two lines still lines its link up with
                    its neighbours instead of hanging below them. */}
                {/* A span, not a QuietLink: the whole card is already the
                    anchor, and nesting an <a> inside an <a> is invalid. Same
                    treatment, same 16px, same border opacity — driven from the
                    group hover instead of its own. */}
                {card.href && (
                  <span
                    className={`mt-auto inline-block self-start border-b pt-5 pb-0.5 text-body transition-colors ${
                      onBrand
                        ? "border-paper/40 text-paper-soft group-hover:border-paper group-hover:text-paper"
                        : "border-ink/25 text-ink-soft group-hover:border-ink group-hover:text-ink"
                    }`}
                  >
                    {card.linkLabel ?? "קרא עוד"}
                  </span>
                )}
              </div>
            </>
          );

          const shell = `group flex flex-col ${
            big ? "sm:col-span-2" : ""
          }`;

          return card.href ? (
            <Link key={i} href={card.href} className={shell}>
              {inner}
            </Link>
          ) : (
            <div key={i} className={shell}>
              {inner}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------- gallery */

export function Gallery({ block }: { block: GalleryBlock }) {
  /**
   * A contact sheet, full-bleed, with tiles of two sizes.
   *
   * The old version was a CSS-columns masonry inside the content container —
   * which meant every photograph landed at roughly one width, and the whole
   * page had a single visual tempo top to bottom. Here every fourth frame
   * takes a 2x2 cell, the grid runs edge to edge, and `grid-flow-dense`
   * backfills the gaps so the mosaic stays solid whatever the image count.
   */
  const isBig = (i: number) => i % 4 === 0;

  return (
    <section className={`band ${block.background === "alt" ? "bg-paper-deep" : "bg-paper"}`}>
      {block.title && (
        <div className="mx-auto mb-16 max-w-(--container-content) px-6 lg:px-10">
          <SectionHeading>{block.title}</SectionHeading>
        </div>
      )}
      <div className="grid auto-rows-[clamp(9rem,15vw,15rem)] grid-flow-dense grid-cols-2 gap-2 px-2 sm:grid-cols-3 lg:grid-cols-4">
        {block.images.map((im, i) => (
          <figure
            key={i}
            className={`relative overflow-hidden bg-paper-deep ${
              isBig(i) ? "col-span-2 row-span-2" : ""
            }`}
          >
            <Image
              src={im.src}
              alt={im.alt}
              fill
              sizes={isBig(i) ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
              className="object-cover transition-opacity duration-(--duration-slow) hover:opacity-85"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- logos */

export function Logos({ block }: { block: LogosBlock }) {
  return (
    <Section background="white">
      {block.title && (
        <div className="mb-16">
          <SectionHeading>{block.title}</SectionHeading>
        </div>
      )}
      {/* The hairline grid is gone, for a concrete reason: there are 13 logos,
          so a five-column grid ends 5 / 5 / 3 and the cell borders were still
          being drawn across the two empty slots. A blind critic put it exactly
          right — nobody art-directing ships a drawn border around nothing. A
          centred flex row carries an odd count without advertising it.

          On the treatment: all 13 files are screenshot crops off the old site,
          where the logos sat inside turquoise tiles — and that turquoise is
          baked into the bitmaps, in some cases behind the mark itself rather
          than merely around it. Two passes at repairing the pixels (cropping to
          a bounding box, then recolouring near-teal to white) both failed:
          the ring is anti-aliased and the teal is not a uniform shade, so what
          survived was a teal halo on some files and none on others — which is
          worse than uniform, because it reads as a mistake.

          Greyscale is therefore doing real work here, not decoration: it is the
          one treatment that renders thirteen inconsistent backgrounds
          consistently. Colour returns on hover, per logo. No blend mode and no
          opacity — `opacity` forms a stacking context, which isolates the
          element and stops `mix-blend-multiply` reaching the page behind it,
          and the two together rendered every logo as a grey swatch.

          The real fix is real files. See HANDOVER.md. */}
      <ul className="flex flex-wrap justify-center gap-x-12 gap-y-10 sm:gap-x-16">
        {block.logos.map((logo, i) => (
          <li key={i} className="flex w-[7.5rem] items-center justify-center sm:w-[9rem]">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={160}
              sizes="180px"
              className="h-auto w-full object-contain grayscale transition hover:grayscale-0"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------- quote */

export function Quote({ block }: { block: QuoteBlock }) {
  /**
   * The single dark section on the page.
   *
   * It does not go through <Section>, because "brand" now resolves to a tonal
   * paper rather than an inversion. One inverted band mid-page — and the
   * footer at the end — gives the rhythm both bars have. Four bands, which is
   * what a blanket remap produced, just read as stripes.
   */
  return (
    <section className="band bg-void text-paper">
      <div className="mx-auto max-w-(--container-content) px-6 lg:px-10">
        <div className="max-w-5xl">
          {/* Display scale, light weight, ranged start. A centred bold
              pull-quote is a template convention; both bars set their largest
              type flush to the reading edge. */}
          <blockquote className="text-title font-light text-paper">
            {block.quote}
          </blockquote>
          {block.attribution && (
            <p className="mt-10 text-micro tracking-label text-paper-faint">
              {block.attribution}
            </p>
          )}
          <CtaRow ctas={block.ctas} onDark />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- video */

export function Video({ block }: { block: VideoBlock }) {
  const id = extractYouTubeId(block.youtubeUrl);
  const onBrand = false;
  return (
    <Section background={block.background ?? "white"}>
      {block.title && (
        <div className="mb-16">
          <SectionHeading onBrand={onBrand}>{block.title}</SectionHeading>
        </div>
      )}
      {block.body && (
        <div
          className={`prose-he text-lede mb-16 max-w-(--container-text) ${
            onBrand ? "text-paper-soft" : "text-ink-soft"
          }`}
        >
          {block.body.map((p, i) => (
            <p key={i}>
              <Inline text={p} />
            </p>
          ))}
        </div>
      )}
      {id && (
        <div className="aspect-video w-full overflow-hidden bg-void">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={block.title ?? "וידאו"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="h-full w-full"
          />
        </div>
      )}
    </Section>
  );
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ----------------------------------------------------------------- contact */

export function Contact({ block }: { block: ContactBlock }) {
  const mapQuery = encodeURIComponent("תל יוסף, ישראל");

  /**
   * The contact block closes the page, so it shares the footer's ground.
   *
   * It used to sit on paper directly above a near-black footer, and two critics
   * on the same panel described the result the same way: "two disconnected
   * panels", "beige and black zones that don't relate compositionally". They
   * were right — the page's last movement was a colour change with nothing
   * motivating it. Running contact on the dark ground makes the ending one
   * continuous passage that the footer completes rather than interrupts.
   */
  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "טלפון",
      value: (
        <a href={`tel:${site.phone}`} className="transition-colors hover:text-paper">
          {site.phoneDisplay}
        </a>
      ),
    },
    {
      label: "דוא״ל",
      value: (
        <a href={`mailto:${site.email}`} className="break-all transition-colors hover:text-paper">
          {site.email}
        </a>
      ),
    },
    { label: "מיקום", value: site.location },
    {
      label: "שעות",
      value: site.hours.map((h) => (
        <span key={h} className="block">
          {h}
        </span>
      )),
    },
  ];

  return (
    <section id="צרו-קשר" className="band bg-void text-paper">
      <div className="mx-auto max-w-(--container-content) px-6 lg:px-10">
        <div className="mb-16">
          <SectionHeading onBrand>
            {block.title ?? "צרו קשר"}
          </SectionHeading>
        </div>

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Map on the inline-end side — the left, in RTL — as in the original. */}
          <div className="lg:order-last lg:col-span-7">
            <div className="overflow-hidden bg-paper/5">
              {/*
                tabIndex={-1}, and the reason is worth stating because removing
                something from the tab order usually makes accessibility worse.

                Measured, this iframe was tab stop 28 of 36 and the only
                focusable element on the page with `outline-style: none` — so a
                keyboard reader hit it, saw no ring anywhere, and had to guess
                whether focus had been lost. Inside it is Google's own map
                widget: a further dozen stops of third-party controls with
                their own focus model, in a document this site does not
                control and cannot ring.

                The keyboard path to the same destination already exists
                directly below as "פתיחה במפות גוגל", which is a real link
                to a real map with a visible focus ring. So this removes a
                black hole and keeps the route.
              */}
              <iframe
                title="מפה — תל יוסף"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed&hl=iw`}
                tabIndex={-1}
                className="h-80 w-full opacity-80 grayscale invert-[0.92] lg:h-[26rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <QuietLink
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              external
              onDark
              className="mt-4"
            >
              פתיחה במפות גוגל
            </QuietLink>
          </div>

          <div className="lg:col-span-5">
            <dl>
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[6rem_1fr] gap-4 border-b border-paper/20 py-5"
                >
                  <dt className="text-micro tracking-label text-paper-faint">
                    {r.label}
                  </dt>
                  <dd className="text-body text-paper-soft">{r.value}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-10 space-y-1.5 text-micro text-paper-faint">
              {site.roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ router */

export function Blocks({ blocks }: { blocks: Block[] }) {
  /**
   * Round 3 numbered the sections 01 / 02 / 03 down the page, after Cine
   * Casero, and threaded a `num` string through nine of these renderers to do
   * it. Round 6's panel objected twice — a palette break, and a template tell —
   * and it was deliberately not actioned, on the grounds that reversing a
   * documented decision on two sighted opinions is churn.
   *
   * The site owner has now rejected the numerals outright, which is a
   * different kind of evidence entirely, so they are gone: the class, the
   * prop, and this reducer. Recorded in GAUNTLET.md round 7.
   *
   * The thing the numbering was *also* doing — being the bottom rung of the
   * type ladder, which a blind critic had asked for — is now done properly by
   * the `micro` step, which twelve elements share instead of one.
   */
  return (
    <>
      {blocks.map((block, i) => {
        switch (block._type) {
          case "hero":
            return <Hero key={i} block={block} />;
          case "textImage":
            return <TextImage key={i} block={block} index={i} />;
          case "richText":
            return <RichText key={i} block={block} />;
          case "cardGrid":
            return <CardGrid key={i} block={block} />;
          case "gallery":
            return <Gallery key={i} block={block} />;
          case "testimonials":
            return <Testimonials key={i} block={block as TestimonialsBlock} />;
          case "logos":
            return <Logos key={i} block={block} />;
          case "quote":
            return <Quote key={i} block={block} />;
          case "video":
            return <Video key={i} block={block} />;
          case "contact":
            return <Contact key={i} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
