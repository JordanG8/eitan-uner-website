import Image from "next/image";
import Link from "next/link";
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

/* -------------------------------------------------------------------- hero */

export function Hero({ block }: { block: HeroBlock }) {
  const onBrand = (block.background ?? "brand") === "brand";
  // "end" puts the photo on the inline-end side — the left, in RTL. That is
  // where every photo sat on the original site.
  const imageLast = (block.imageSide ?? "end") === "end";
  return (
    <section className={onBrand ? "bg-brand-500" : "bg-white"}>
      <div className="mx-auto grid min-h-[26rem] max-w-[1600px] items-stretch lg:grid-cols-2">
        <div
          className={`relative min-h-[20rem] lg:min-h-[34rem] ${
            imageLast ? "lg:order-last" : ""
          }`}
        >
          <Image
            src={block.image.src}
            alt={block.image.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>

        <div className="flex flex-col justify-center px-6 py-14 text-center sm:px-12 lg:py-20">
          <h1
            className={`text-4xl font-bold sm:text-5xl lg:text-6xl ${
              onBrand ? "text-white" : "text-ink"
            }`}
          >
            {block.title}
          </h1>
          {block.subtitle && (
            <p
              className={`mt-5 text-lg ${onBrand ? "text-white/90" : "text-ink-soft"}`}
            >
              {block.subtitle}
            </p>
          )}
          <CtaRow ctas={block.ctas} align="center" />
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- textImage */

export function TextImage({ block }: { block: TextImageBlock }) {
  const bg = block.background ?? "white";
  const onBrand = bg === "brand";
  return (
    <Section background={bg}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={(block.imageSide ?? "end") === "end" ? "lg:order-last" : ""}>
          <div className="relative aspect-4/3 w-full overflow-hidden">
            <Image
              src={block.image.src}
              alt={block.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          {block.title && (
            <>
              <h2
                className={`text-3xl font-bold sm:text-4xl ${
                  onBrand ? "text-white" : "text-brand-600"
                }`}
              >
                {block.title}
              </h2>
              <Rule onBrand={onBrand} />
            </>
          )}
          {block.eyebrow && (
            <p className={`text-lg ${onBrand ? "text-white/90" : "text-ink-soft"}`}>
              {block.eyebrow}
            </p>
          )}
          <div className={`prose-he mt-2 ${onBrand ? "text-white/95" : "text-ink"}`}>
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
  const onBrand = bg === "brand";
  return (
    <Section background={bg}>
      {block.title && (
        <div className="mb-12">
          <SectionHeading onBrand={onBrand}>{block.title}</SectionHeading>
        </div>
      )}
      <div
        className={`prose-he mx-auto ${
          block.maxWidth === "narrow" ? "max-w-3xl" : "max-w-5xl"
        } ${block.align === "center" ? "text-center" : "text-start"} ${
          onBrand ? "text-white/95" : "text-ink"
        }`}
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
  const onBrand = bg === "brand";
  const cols =
    block.columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : block.columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <Section background={bg}>
      {block.title && (
        <div className="mb-12">
          <SectionHeading onBrand={onBrand}>{block.title}</SectionHeading>
        </div>
      )}

      <div className={`grid gap-7 ${cols}`}>
        {block.cards.map((card, i) => {
          const inner = (
            <>
              {card.image && (
                <div className="relative aspect-square w-full overflow-hidden bg-surface-alt">
                  <Image
                    src={card.image.src}
                    alt={card.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}

              {block.variant === "overlay" ? (
                /* Text sits on turquoise beneath the image. The original used a
                   fixed height with an inner scrollbar here; letting the card grow
                   to fit its text reads far better, especially on mobile. */
                <div className="flex flex-1 flex-col bg-brand-500 p-6 text-white">
                  <h3 className="text-xl font-bold">{card.title}</h3>
                  {card.body && (
                    <p className="mt-3 text-[15px] leading-relaxed text-white/95">
                      {card.body}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-brand-600">{card.title}</h3>
                  {card.body && (
                    <p className="mt-2 text-[15px] text-ink-soft">{card.body}</p>
                  )}
                  {card.href && (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-brand-600">
                      {card.linkLabel ?? "קרא עוד"}
                      <svg
                        viewBox="0 0 20 20"
                        className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:-translate-x-1"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M7 4l6 6-6 6z" />
                      </svg>
                    </span>
                  )}
                </div>
              )}
            </>
          );

          const shell = `group flex flex-col overflow-hidden ${
            block.variant === "overlay"
              ? "shadow-sm"
              : "border border-hairline bg-white transition-shadow hover:shadow-lg"
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
  return (
    <Section background={block.background ?? "white"}>
      {block.title && (
        <div className="mb-12">
          <SectionHeading>{block.title}</SectionHeading>
        </div>
      )}
      {/* CSS columns give the masonry look of the original without JS */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {block.images.map((im, i) => (
          <figure key={i} className="break-inside-avoid overflow-hidden bg-surface-alt">
            <Image
              src={im.src}
              alt={im.alt}
              width={im.width ?? 1200}
              height={im.height ?? 900}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full transition-transform duration-500 hover:scale-[1.02]"
            />
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------- logos */

export function Logos({ block }: { block: LogosBlock }) {
  return (
    <Section background="white">
      {block.title && (
        <div className="mb-12">
          <SectionHeading>{block.title}</SectionHeading>
        </div>
      )}
      <ul className="grid grid-cols-2 justify-items-center gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {block.logos.map((logo, i) => (
          <li
            key={i}
            className="flex aspect-square w-full max-w-[11rem] items-center justify-center bg-brand-500 p-4"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={160}
              sizes="176px"
              className="h-full w-full object-contain"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------- quote */

export function Quote({ block }: { block: QuoteBlock }) {
  return (
    <Section background="brand">
      <div className="mx-auto max-w-4xl text-center">
        <blockquote className="text-3xl font-bold leading-snug text-white sm:text-4xl">
          {block.quote}
        </blockquote>
        {block.attribution && (
          <p className="mt-7 text-lg text-white/90">{block.attribution}</p>
        )}
        <CtaRow ctas={block.ctas} align="center" />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------- video */

export function Video({ block }: { block: VideoBlock }) {
  const id = extractYouTubeId(block.youtubeUrl);
  const onBrand = (block.background ?? "white") === "brand";
  return (
    <Section background={block.background ?? "white"}>
      {block.title && (
        <div className="mb-10">
          <SectionHeading onBrand={onBrand}>{block.title}</SectionHeading>
        </div>
      )}
      {block.body && (
        <div
          className={`mx-auto mb-10 max-w-3xl text-center ${
            onBrand ? "text-white/95" : "text-ink"
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
        <div className="mx-auto aspect-video w-full max-w-3xl overflow-hidden bg-black">
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
  return (
    <Section background="alt" id="צרו-קשר">
      <div className="mb-12">
        <SectionHeading>{block.title ?? "צרו קשר"}</SectionHeading>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Map sits on the left, details on the right — as in the original. */}
        <div className="overflow-hidden border border-hairline bg-white lg:order-last">
          <iframe
            title="מפה — תל יוסף"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed&hl=iw`}
            className="h-80 w-full lg:h-full lg:min-h-[22rem]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="border border-hairline bg-white p-7">
          <p className="text-lg font-semibold text-ink">{site.location}</p>

          <ul className="mt-6 space-y-3 text-[15px]">
            <li className="flex items-center gap-3">
              <span className="text-brand-600" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.2 2.3z" />
                </svg>
              </span>
              <a href={`tel:${site.phone}`} className="text-brand-600 hover:underline">
                {site.phoneDisplay}
              </a>
              <span className="text-ink-soft">— איתן אונר</span>
            </li>

            <li className="flex items-center gap-3">
              <span className="text-brand-600" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V6l8 5 8-5v2.2z" />
                </svg>
              </span>
              <a href={`mailto:${site.email}`} className="text-brand-600 hover:underline">
                {site.email}
              </a>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 text-brand-600" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 11H7v-2h4V6h2v7z" />
                </svg>
              </span>
              <span className="text-ink-soft">
                {site.hours.map((h) => (
                  <span key={h} className="block">
                    {h}
                  </span>
                ))}
              </span>
            </li>
          </ul>

          <ul className="mt-7 border-t border-hairline pt-6 text-[15px] text-ink-soft">
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
  return (
    <>
      {blocks.map((block, i) => {
        switch (block._type) {
          case "hero":
            return <Hero key={i} block={block} />;
          case "textImage":
            return <TextImage key={i} block={block} />;
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
