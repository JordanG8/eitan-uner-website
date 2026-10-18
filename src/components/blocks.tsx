import Image from "next/image";
import { ImageGallery } from "./ImageGallery";
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
  ScrollStoryBlock,
  TestimonialsBlock,
  TextImageBlock,
  VideoBlock,
} from "@/lib/types";
import { CtaRow, Inline, Rule, Section, SectionHeading } from "./ui";
import { Testimonials } from "./Testimonials";
import { ScrollStory } from "./ScrollStory";

/* -------------------------------------------------------------------- hero */

export function Hero({ block }: { block: HeroBlock }) {
  const onBrand = (block.background ?? "brand") === "brand";
  // "end" puts the photo on the inline-end side — the left, in RTL. That is
  // where every photo sat on the original site.
  const imageLast = (block.imageSide ?? "end") === "end";
  return (
    <section className="bg-surface px-0 pb-8 pt-0 sm:px-5 sm:pb-12 sm:pt-5 lg:px-8">
      <div className="hero-shell mx-auto grid min-h-[38rem] max-w-[1480px] items-stretch sm:rounded-[2rem] lg:min-h-[42rem] lg:grid-cols-[1.08fr_.92fr]">
        <div
          className={`hero-media relative min-h-[24rem] lg:min-h-[42rem] ${
            imageLast ? "lg:order-last" : ""
          }`}
        >
          <Image
            src={block.image.src}
            alt={block.image.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-1000 hover:scale-[1.015]"
          />
        </div>

        <div className="relative flex flex-col justify-center px-7 py-14 text-start sm:px-12 lg:px-16 lg:py-20">
          <p className="eyebrow-label">איתן אונר · צלם ופוטודוקותרפיסט</p>
          <h1
            className={`mt-6 max-w-[9ch] text-[3.25rem] font-bold sm:text-6xl lg:text-[5.4rem] ${
              onBrand ? "text-white" : "text-ink"
            }`}
          >
            {block.title}
          </h1>
          {block.subtitle && (
            <p
              className={`mt-6 max-w-xl text-lg leading-relaxed sm:text-xl ${onBrand ? "text-white/78" : "text-ink-soft"}`}
            >
              {block.subtitle}
            </p>
          )}
          <CtaRow ctas={block.ctas} />
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-semibold text-white/60">
            <span>סדנאות</span><span>הרצאות</span><span>צילום חברתי</span>
          </div>
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
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <div className={(block.imageSide ?? "end") === "end" ? "lg:order-last" : ""}>
          <div className="photo-frame relative aspect-4/3 w-full overflow-hidden rounded-[1.75rem] bg-brand-100">
            <Image
              src={block.image.src}
              alt={block.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.025]"
            />
          </div>
        </div>

        <div className="max-w-xl">
          {block.title && (
            <>
              <h2
                className={`text-3xl font-bold sm:text-[2.85rem] ${
                  onBrand ? "text-white" : "text-brand-600"
                }`}
              >
                {block.title}
              </h2>
              <Rule onBrand={onBrand} />
            </>
          )}
          {block.eyebrow && (
            <p className={`text-lg font-semibold ${onBrand ? "text-accent-soft" : "text-brand-700"}`}>
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
        {block.facts?.length ? (
          <dl className="mb-8 grid gap-4 rounded-2xl border border-hairline bg-surface-alt p-5 text-ink sm:grid-cols-2 sm:p-7">
            {block.facts.map((fact) => <div key={fact.label}>
              <dt className="text-sm font-bold text-brand-700">{fact.label}</dt>
              <dd className="mt-1 text-base leading-relaxed">{fact.value}</dd>
            </div>)}
          </dl>
        ) : null}
        {block.facts?.length ? <CtaRow ctas={block.ctas} align={block.align} /> : null}
        {block.body.map((p, i) => {
          const question = block.format === "questions" ? p.match(/^\*\*([^*]+)\*\*\s*([\s\S]*)$/) : null;
          if (question) return <div key={i} className="mb-8 border-b border-hairline pb-6">
            <h2 className="mb-3 text-2xl font-bold text-brand-800">{question[1]}</h2>
            <p><Inline text={question[2]} /></p>
          </div>;
          return <p key={i}><Inline text={p} /></p>;
        })}
        {!block.facts?.length && <CtaRow ctas={block.ctas} align={block.align} />}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- cardGrid */

export function CardGrid({ block }: { block: CardGridBlock }) {
  const CardHeading = block.title ? "h3" : "h2";
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

      <div className={`grid gap-6 lg:gap-8 ${cols}`}>
        {block.cards.map((card, i) => {
          const inner = (
            <>
              {card.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-alt">
                  <Image
                    src={card.image.src}
                    alt={card.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.055]"
                  />
                </div>
              )}

              {block.variant === "overlay" ? (
                /* Text sits on turquoise beneath the image. The original used a
                   fixed height with an inner scrollbar here; letting the card grow
                   to fit its text reads far better, especially on mobile. */
                <div className="flex flex-1 flex-col bg-brand-800 p-6 text-white">
                  <CardHeading className="text-xl font-bold">{card.title}</CardHeading>
                  {card.body && (
                    <p className="mt-3 text-[15px] leading-relaxed text-white/95">
                      {card.body}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 flex-col p-6">
                  <CardHeading className="text-xl font-bold text-brand-800">{card.title}</CardHeading>
                  {card.body && (
                    <p className="mt-2 text-[15px] text-ink-soft">{card.body}</p>
                  )}
                  {card.href && (
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-700">
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
              ? "rounded-[1.5rem] shadow-[0_16px_45px_rgb(18_42_43_/_0.14)]"
              : "rounded-[1.5rem] border border-hairline/80 bg-white shadow-[0_10px_35px_rgb(18_42_43_/_0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgb(18_42_43_/_0.12)]"
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
      <ImageGallery images={block.images} prints={block.purpose === "prints"} whatsappUrl={site.whatsappUrl} email={site.email} />
    </Section>
  );
}

/* ------------------------------------------------------------------- logos */

export function Logos({ block }: { block: LogosBlock }) {
  const projects: Record<string, string> = {
    "/images/clients/akim.webp": "/סיפורים-מאחורי-המצלמה/מעש-אקים",
    "/images/clients/beit-ekstein.webp": "/סיפורים-מאחורי-המצלמה/בית-אקשטיין",
    "/images/clients/photo-israel.webp": "/סיפורים-מאחורי-המצלמה/photo-is-rael-photo-salam",
    "/images/clients/nof-yam.webp": "/תערוכות",
    "/images/clients/edut-710.webp": "/עדות-710",
    "/images/clients/kehilat-or.webp": "/קהילת-אור",
    "/images/clients/nataraj.webp": "/סיפורים-מאחורי-המצלמה/פסטיבל-נאטראז",
  };
  return (
    <Section background="white">
      {block.title && (
        <div className="mb-12">
          <SectionHeading>{block.title}</SectionHeading>
        </div>
      )}
      <ul className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {block.logos.map((logo, i) => (
          <li
            key={i}
            className="flex w-full max-w-[13rem] flex-col items-center rounded-2xl border border-hairline bg-white p-3 text-center shadow-[0_8px_25px_rgb(18_42_43_/_0.06)] sm:p-4"
          >
            <div className="flex aspect-square w-full max-w-36 items-center justify-center overflow-hidden rounded-lg bg-[#15888d] p-2">
            <Image
              src={logo.src}
              alt=""
              width={160}
              height={160}
              sizes="144px"
              className="h-full w-full object-contain"
            />
            </div>
            <p className="mt-4 text-sm font-semibold leading-snug text-ink">{logo.alt}</p>
            {projects[logo.src] && <Link href={projects[logo.src]} className="mt-auto inline-flex min-h-11 items-center pt-3 text-sm font-semibold text-brand-700 underline underline-offset-4">לסיפור ולפרטים ←</Link>}
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
      <div className="lens-field mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 px-7 py-14 text-center sm:px-14 sm:py-20">
        <blockquote className="relative text-3xl font-bold leading-snug text-white sm:text-5xl">
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
            title={block.title || block.body?.[0] || "סרטון צילום ופוטודוקותרפיה עם איתן אונר"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="h-full w-full"
          />
        </div>
      )}
      <p className={`mx-auto mt-5 max-w-3xl text-center text-base ${onBrand ? "text-white" : "text-brand-700"}`}>
        {block.duration && <span>משך הסרטון: <bdi>{block.duration}</bdi> · </span>}
        <a href={block.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">לצפייה בסרטון ב־YouTube</a>
      </p>
    </Section>
  );
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ----------------------------------------------------------------- contact */

export function Contact({ block }: { block: ContactBlock }) {
  const Heading = block.headingLevel === 1 ? "h1" : "h2";
  const mapQuery = encodeURIComponent(site.location);
  return (
    <Section background="alt" id="צרו-קשר" padded={false}>
      <div className="py-10 sm:py-16">
        <div className="mb-7 text-center">
          <Heading className="text-4xl text-ink sm:text-5xl">{block.title ?? "צרו קשר"}</Heading>
          <p className="mt-4 text-lg text-ink-soft">לתיאום סדנה, הרצאה או צילום — בואו נדבר.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_16px_45px_rgb(18_42_43_/_0.09)] sm:p-9">
            <div className="grid gap-3">
              <a href={`tel:${site.phone}`} className="flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-3 font-semibold text-white">שיחה עם איתן <bdi>{site.phoneDisplay}</bdi></a>
              <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-full border border-brand-300 px-4 py-3 font-semibold text-brand-700">הודעה ב־WhatsApp</a>
              <a href={`mailto:${site.email}`} className="flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-full border border-brand-300 px-4 py-3 font-semibold text-brand-700">מייל <bdi className="break-all">{site.email}</bdi></a>
            </div>
            <div className="mt-7 border-t border-hairline pt-5">
              <p className="font-semibold text-ink">{site.location}</p>
              <p className="mt-3 font-semibold text-ink">שעות מענה</p>
              <ul className="mt-1 text-ink-soft">{site.hours.map((hours) => <li key={hours}>{hours}</li>)}</ul>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-hairline bg-white shadow-[0_16px_45px_rgb(18_42_43_/_0.09)]">
            <iframe title="מפה — תל יוסף" src={`https://www.google.com/maps?q=${mapQuery}&output=embed&hl=iw`} className="h-72 w-full lg:h-full lg:min-h-80" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
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
          case "scrollStory":
            return <ScrollStory key={i} block={block as ScrollStoryBlock} />;
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
