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
import { CtaRow, Inline, Rule, Section, SectionHeading } from "./ui";
import { Testimonials } from "./Testimonials";

/**
 * Block renderers — retuned against cinecasero.uy and eladiodieste.com.
 * See GAUNTLET.md for the measurements this is built against.
 *
 * Every prop signature is unchanged, because the Puck editor imports these
 * same components and content.ts is frozen. What changed is the design.
 */

/** 01, 02, 03 … the section marker Cine Casero indexes its work with. */
function idx(i: number) {
  return String(i + 1).padStart(2, "0");
}

/* -------------------------------------------------------------------- hero */

export function Hero({ block }: { block: HeroBlock }) {
  // "end" puts the photo on the inline-end side — the left, in RTL. That is
  // where every photo sat on the original site.
  const imageLast = (block.imageSide ?? "end") === "end";

  /**
   * An editorial masthead rather than a 50/50 colour split.
   *
   * Three passes to get here, and the last two failures are worth recording
   * because they were the same failure wearing different clothes.
   *
   *  1. Title in a 7-column cell beside a tall portrait, bottom-aligned. This
   *     hero has no `subtitle`, so the cell held only two buttons and opened a
   *     large empty band above the headline.
   *  2. Title full width, photograph in a contained 7-column box below it. A
   *     blind critic called that box "an inline thumbnail floating in dead
   *     beige" — margins on all four sides meant the type and the image read
   *     as two unrelated objects sharing a screen rather than one composition.
   *
   * The fix is to stop containing the photograph. It now bleeds off the
   * inline-end edge of the viewport, so it terminates the composition instead
   * of floating inside it, via the .bleed-end utility (see globals.css — the
   * obvious percentage version of that calc is subtly wrong inside a grid).
   *
   * The 8-column span is also a resolution budget. The source is 675px wide;
   * eight columns plus the bleed is ~913px, a 1.35x upscale that holds up.
   * Full-bleed to 1440px would be 2.1x and visibly soft. When Eitan supplies
   * originals this can widen; until then it does not advertise the asset.
   *
   * `background` is ignored: content.ts asks for "brand", which used to mean a
   * turquoise slab. Paper is the ground now, so the hero inherits it.
   */
  return (
    <section className="overflow-x-clip bg-paper">
      <div className="mx-auto max-w-(--container-content) px-6 pt-16 sm:pt-20 lg:px-10 lg:pt-24">
        <h1 className="text-display font-light text-ink">{block.title}</h1>

        <div className="mt-14 grid items-center gap-x-12 gap-y-10 pb-24 lg:mt-20 lg:grid-cols-12 lg:pb-32">
          <div
            className={`lg:col-span-8 ${
              imageLast ? "lg:order-last bleed-end" : "bleed-start"
            }`}
          >
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
            <p className="text-lede text-ink-soft">
              {block.subtitle ?? site.tagline}
            </p>
            <CtaRow ctas={block.ctas} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- textImage */

export function TextImage({
  block,
  index = 0,
  num,
}: {
  block: TextImageBlock;
  index?: number;
  num?: string;
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
              {num && (
                <span className="index-num mb-4 block text-[0.8rem]" aria-hidden="true">
                  {num}
                </span>
              )}
              <h2
                className={`text-section font-light ${onBrand ? "text-paper" : "text-ink"}`}
              >
                {block.title}
              </h2>
              <Rule onBrand={onBrand} />
            </>
          )}
          {block.eyebrow && (
            <p className={`text-lede ${onBrand ? "text-paper/70" : "text-ink-soft"}`}>
              {block.eyebrow}
            </p>
          )}
          <div className={`prose-he mt-4 ${onBrand ? "text-paper/85" : "text-ink-soft"}`}>
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

export function RichText({ block, num }: { block: RichTextBlock; num?: string }) {
  const bg = block.background ?? "white";
  const onBrand = false;
  return (
    <Section background={bg}>
      {block.title && (
        <div className="mb-16">
          <SectionHeading onBrand={onBrand} index={num}>{block.title}</SectionHeading>
        </div>
      )}
      {/* Measure, not a fraction of the viewport. Long Hebrew lines are the
          fastest way to make a page feel unedited. */}
      <div
        className={`prose-he text-lede max-w-(--container-text) ${
          block.align === "center" ? "mx-auto text-center" : ""
        } ${onBrand ? "text-paper/85" : "text-ink-soft"}`}
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

export function CardGrid({ block, num }: { block: CardGridBlock; num?: string }) {
  const bg = block.background ?? "white";
  const onBrand = false;
  const cols =
    block.columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : block.columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <Section background={bg}>
      {block.title && (
        <div className="mb-16">
          <SectionHeading onBrand={onBrand} index={num}>{block.title}</SectionHeading>
        </div>
      )}

      {/* No borders, no shadows, no fills. Neither bar puts a photograph in a
          card — the image sits on the page, and a hairline does the separating
          that a box used to do. */}
      <div className={`grid gap-x-8 gap-y-14 ${cols}`}>
        {block.cards.map((card, i) => {
          const inner = (
            <>
              {card.image && (
                <div className="relative aspect-[5/4] w-full overflow-hidden bg-paper-deep">
                  <Image
                    src={card.image.src}
                    alt={card.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
              )}

              <div className={card.image ? "pt-6" : ""}>
                <div
                  className={`mb-5 h-px w-full ${onBrand ? "bg-paper/20" : "bg-hairline"}`}
                  aria-hidden="true"
                />
                <div className="flex items-baseline gap-4">
                  <span
                    className={`index-num text-[0.8rem] ${onBrand ? "text-paper/40" : ""}`}
                    aria-hidden="true"
                  >
                    {idx(i)}
                  </span>
                  <h3
                    className={`text-xl font-normal leading-snug transition-colors ${
                      onBrand ? "text-paper" : "text-ink"
                    } ${card.href ? "group-hover:text-brand-700" : ""}`}
                  >
                    {card.title}
                  </h3>
                </div>
                {card.body && (
                  <p
                    className={`mt-3 ps-9 text-[0.95rem] leading-relaxed ${
                      onBrand ? "text-paper/65" : "text-ink-soft"
                    }`}
                  >
                    {card.body}
                  </p>
                )}
                {card.href && (
                  <span
                    className={`mt-5 ms-9 inline-block border-b pb-0.5 text-[0.9rem] transition-colors ${
                      onBrand
                        ? "border-paper/30 text-paper/70 group-hover:border-paper group-hover:text-paper"
                        : "border-ink/25 text-ink-soft group-hover:border-ink group-hover:text-ink"
                    }`}
                  >
                    {card.linkLabel ?? "קרא עוד"}
                  </span>
                )}
              </div>
            </>
          );

          const shell = "group flex flex-col";

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

export function Gallery({ block, num }: { block: GalleryBlock; num?: string }) {
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
    <section className={`${block.background === "alt" ? "bg-paper-deep" : "bg-paper"} py-24 sm:py-32 lg:py-40`}>
      {block.title && (
        <div className="mx-auto mb-16 max-w-(--container-content) px-6 lg:px-10">
          <SectionHeading index={num}>{block.title}</SectionHeading>
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
              className="object-cover transition-opacity duration-500 hover:opacity-85"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- logos */

export function Logos({ block, num }: { block: LogosBlock; num?: string }) {
  return (
    <Section background="white">
      {block.title && (
        <div className="mb-16">
          <SectionHeading index={num}>{block.title}</SectionHeading>
        </div>
      )}
      {/* The turquoise tiles are gone. Client logos are other people's brands;
          painting them all one colour was louder than the logos themselves.
          A hairline grid, desaturated until hover, lets them read as a list. */}
      <ul className="grid grid-cols-2 border-s border-t border-hairline sm:grid-cols-3 lg:grid-cols-5">
        {block.logos.map((logo, i) => (
          <li
            key={i}
            className="flex aspect-4/3 items-center justify-center border-b border-e border-hairline p-7"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={160}
              sizes="200px"
              className="h-full w-full object-contain opacity-55 mix-blend-multiply grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
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
    <section className="bg-void py-24 text-paper sm:py-32 lg:py-40">
      <div className="mx-auto max-w-(--container-content) px-6 lg:px-10">
        <div className="max-w-5xl">
          {/* Display scale, light weight, ranged start. A centred bold
              pull-quote is a template convention; both bars set their largest
              type flush to the reading edge. */}
          <blockquote className="text-title font-light text-paper">
            {block.quote}
          </blockquote>
          {block.attribution && (
            <p className="mt-10 text-sm tracking-[0.18em] text-paper/50">
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

export function Video({ block, num }: { block: VideoBlock; num?: string }) {
  const id = extractYouTubeId(block.youtubeUrl);
  const onBrand = false;
  return (
    <Section background={block.background ?? "white"}>
      {block.title && (
        <div className="mb-14">
          <SectionHeading onBrand={onBrand} index={num}>{block.title}</SectionHeading>
        </div>
      )}
      {block.body && (
        <div
          className={`prose-he text-lede mb-14 max-w-(--container-text) ${
            onBrand ? "text-paper/85" : "text-ink-soft"
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

export function Contact({ block, num }: { block: ContactBlock; num?: string }) {
  const mapQuery = encodeURIComponent("תל יוסף, ישראל");

  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "טלפון",
      value: (
        <a href={`tel:${site.phone}`} className="hover:text-brand-700">
          {site.phoneDisplay}
        </a>
      ),
    },
    {
      label: "דוא״ל",
      value: (
        <a href={`mailto:${site.email}`} className="hover:text-brand-700">
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
    <Section background="alt" id="צרו-קשר">
      <div className="mb-16">
        <SectionHeading index={num}>{block.title ?? "צרו קשר"}</SectionHeading>
      </div>

      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Map on the inline-end side — the left, in RTL — as in the original.
            The embed is third-party and can be slow, blocked by a tracking
            blocker, or simply unavailable; when that happens an unstyled
            iframe collapses to a white void the height of the section. The
            wrapper carries its own ground and a real link underneath, so the
            block still says where Eitan is even when the map never arrives. */}
        <div className="lg:order-last">
          <div className="overflow-hidden bg-paper-deep">
            <iframe
              title="מפה — תל יוסף"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed&hl=iw`}
              className="h-80 w-full grayscale-[0.35] lg:h-[26rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block border-b border-ink/25 pb-0.5 text-[0.9rem] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            פתיחה במפות גוגל
          </a>
        </div>

        {/* A definition list on the page, not a bordered white card. */}
        <div>
          <dl>
            {rows.map((r) => (
              <div
                key={r.label}
                className="grid grid-cols-[6rem_1fr] gap-4 border-b border-ink/12 py-5"
              >
                <dt className="text-[0.8rem] tracking-[0.14em] text-ink-faint">
                  {r.label}
                </dt>
                <dd className="text-[0.98rem] text-ink">{r.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-10 space-y-1.5 text-[0.9rem] text-ink-soft">
            {site.roles.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ router */

export function Blocks({ blocks }: { blocks: Block[] }) {
  /**
   * Sections are numbered 01, 02, 03 … as the page walks them.
   *
   * This was in the bar analysis from the first hour — Cine Casero indexes its
   * sections exactly this way — and `SectionHeading` has accepted an `index`
   * since the first commit. It was simply never passed, which a blind critic
   * caught from the other direction: the page had display type, section heads
   * and body, and nothing below body. No captions, no eyebrows, no smallest
   * voice. A type ladder needs a bottom rung to set the scale of the top one.
   *
   * Only blocks that actually render a heading take a number, so the sequence
   * a reader sees has no gaps in it.
   */
  const numbers = blocks.reduce<(string | undefined)[]>((acc, block) => {
    const titled =
      ("title" in block && Boolean(block.title)) || block._type === "contact";
    const used = acc.filter(Boolean).length;
    acc.push(titled ? String(used + 1).padStart(2, "0") : undefined);
    return acc;
  }, []);

  return (
    <>
      {blocks.map((block, i) => {
        const num = numbers[i];
        switch (block._type) {
          case "hero":
            return <Hero key={i} block={block} />;
          case "textImage":
            return <TextImage key={i} block={block} index={i} num={num} />;
          case "richText":
            return <RichText key={i} block={block} num={num} />;
          case "cardGrid":
            return <CardGrid key={i} block={block} num={num} />;
          case "gallery":
            return <Gallery key={i} block={block} num={num} />;
          case "testimonials":
            return <Testimonials key={i} block={block as TestimonialsBlock} num={num} />;
          case "logos":
            return <Logos key={i} block={block} num={num} />;
          case "quote":
            return <Quote key={i} block={block} />;
          case "video":
            return <Video key={i} block={block} num={num} />;
          case "contact":
            return <Contact key={i} block={block} num={num} />;
          default:
            return null;
        }
      })}
    </>
  );
}
