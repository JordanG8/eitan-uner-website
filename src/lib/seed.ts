import { block, rootState, type PageData, type SBlock } from "@/lexical/doc";
import { pages, stories } from "./content";
import type { Block, Page, ScrollStoryBlock, Story, StoryPanel } from "./types";

/**
 * The original site, as editor documents.
 *
 * content.ts holds everything transcribed from the old site123 pages. This
 * turns each page and each story into a Lexical document — one block node per
 * original section, with the same props — so a deployment with
 * an empty store already serves the complete site, and the editor opens on
 * the real content rather than a blank canvas. Once a page is published, its
 * stored version wins and this is no longer consulted for it.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const STORIES_SLUG = "סיפורים-מאחורי-המצלמה";

interface SeedEntry {
  id: string;
  slug: string;
  title: string;
}

/** Stable id from a slug, so a seeded page keeps its id across deployments. */
function seedId(slug: string): string {
  let h = 5381;
  for (const ch of slug) h = ((h * 33) ^ ch.codePointAt(0)!) >>> 0;
  return `s${h.toString(36)}`;
}

const storySlug = (s: Story) => `${STORIES_SLUG}/${s.slug}`;

export function seedIndex(): SeedEntry[] {
  return [
    ...pages.map((p) => ({ id: seedId(p.slug), slug: p.slug, title: p.title })),
    ...stories.map((s) => ({ id: seedId(storySlug(s)), slug: storySlug(s), title: s.title })),
  ];
}

/* ------------------------------------------- block → editor props */

const wrap = (body?: string[]) => (body ?? []).map((text) => ({ text }));

const panels = (list: StoryPanel[]) => list.map((p) => ({ kicker: p.kicker ?? "", text: p.lines.join("\n") }));

/** Client logos that have a story or page behind them. */
const LOGO_LINKS: Record<string, string> = {
  "/images/clients/akim.webp": `/${STORIES_SLUG}/מעש-אקים`,
  "/images/clients/beit-ekstein.webp": `/${STORIES_SLUG}/בית-אקשטיין`,
  "/images/clients/photo-israel.webp": `/${STORIES_SLUG}/photo-is-rael-photo-salam`,
  "/images/clients/nof-yam.webp": "/תערוכות",
  "/images/clients/edut-710.webp": "/עדות-710",
  "/images/clients/kehilat-or.webp": "/קהילת-אור",
  "/images/clients/nataraj.webp": `/${STORIES_SLUG}/פסטיבל-נאטראז`,
};

const TYPE: Record<Block["_type"], string> = {
  scrollStory: "ScrollStory",
  hero: "Hero",
  textImage: "TextImage",
  richText: "RichText",
  cardGrid: "CardGrid",
  gallery: "Gallery",
  testimonials: "Testimonials",
  logos: "Logos",
  quote: "Quote",
  video: "Video",
  contact: "Contact",
};

function blockProps(block: Block): Record<string, unknown> {
  const { _type, ...rest } = block as any;
  const props: Record<string, any> = { ...rest };

  switch (_type) {
    case "scrollStory": {
      const s = block as ScrollStoryBlock;
      return {
        memory: { image: s.memory.image, panels: panels(s.memory.panels) },
        vista: { image: s.vista.image, cold: panels(s.vista.cold), warm: panels(s.vista.warm) },
        define: { image: s.define.image, term: s.define.term, panels: panels(s.define.panels) },
        room: { image: s.room.image, inset: s.room.inset, panels: panels(s.room.panels) },
        feelings: { kicker: s.feelings.kicker ?? "", title: s.feelings.title, items: s.feelings.items },
        host: { image: s.host.image, name: s.host.name, role: s.host.role, panels: panels(s.host.panels) },
        ask: { kicker: s.ask.kicker ?? "", title: s.ask.title, body: wrap(s.ask.body), ctas: s.ask.ctas ?? [] },
      };
    }
    case "hero":
      props.eyebrow = "איתן אונר · צלם ופוטודוקותרפיסט";
      props.tags = wrap(["סדנאות", "הרצאות", "צילום חברתי"]);
      break;
    case "gallery":
      props.images = (props.images ?? []).map((image: any) => ({ image }));
      break;
    case "logos":
      props.logos = (props.logos ?? []).map((image: any) => ({ image, href: LOGO_LINKS[image.src] ?? "" }));
      break;
    case "contact":
      props.headingLevel = props.headingLevel ?? 2;
      props.subtitle = "לתיאום סדנה, הרצאה או צילום — בואו נדבר.";
      props.showMap = true;
      break;
  }
  if (Array.isArray(props.body)) props.body = wrap(props.body);
  return props;
}


/* ----------------------------------------------------------- pages */

function pageDoc(page: Page): PageData {
  const content: SBlock[] = [];

  if (page.slug === "/") {
    content.push(
      block(
        "Intro",
        {
          kicker: "איתן אונר · צילום, רגש ומפגש",
          title: "סדנאות פוטודוקותרפיה והרצאות",
          subtitle: "לקבוצות, לארגונים ולאנשי חינוך. מתבוננים, מצלמים ומשתפים — אין צורך בניסיון בצילום.",
          ctas: [
            { label: "לתיאום סדנה או הרצאה", href: "/צרו-קשר", tone: "solid" },
            { label: "לגלות את הסדנאות", href: "/פוטודוקותרפיה", tone: "outline" },
          ],
          linkLabel: "להיכנס לסיפור דרך התמונות ↓",
          linkHref: "#הסיפור",
          headingLevel: 1,
        }
      )
    );
  }

  const isContact = page.slug === "צרו-קשר";
  if (page.showTitleBanner && !isContact) {
    content.push(block("PageBanner", { kicker: "איתן אונר · פוטודוקותרפיה", title: page.title, headingLevel: 1 }));
  }

  for (const b of page.blocks) {
    const props = blockProps(b);
    if (b._type === "contact" && isContact) props.headingLevel = 1;
    content.push(block(TYPE[b._type], props));
  }

  return {
    meta: { title: page.title, slug: page.slug, seoDescription: page.seoDescription ?? "" },
    content: rootState(content),
  };
}

/* --------------------------------------------------------- stories */

const WORKSHOP_TAGS = ["פוטודוקותרפיה", "פוטותרפיה", "סדנאות"];

function storyDoc(story: Story): PageData {
  const i = stories.indexOf(story);
  const next = stories[(i + 1) % stories.length];
  const isWorkshop = story.tags?.some((t) => WORKSHOP_TAGS.includes(t));
  return {
    meta: { title: story.title, slug: storySlug(story), seoDescription: story.body?.[0]?.slice(0, 160) ?? "" },
    content: rootState([
      block(
        "Article",
        {
          kicker: "סיפור מאחורי המצלמה",
          title: story.title,
          // Legacy day/month dates have no verified year. Keep them out of
          // view without implying a recent event.
          date: story.date && /\d{4}/.test(story.date) ? story.date : "",
          image: story.image,
          body: wrap(story.body),
          links: story.links ?? [],
          tags: wrap(story.tags),
          ctaTitle: isWorkshop ? "מהסיפור למפגש שלכם" : "יש סיפור שתרצו לתעד?",
          ctaBody: isWorkshop
            ? "לפרטים על עבודה עם צילום, קלפי תמונות ושיתוף בקבוצה, ולתיאום מפגש שמתאים לכם."
            : "אפשר לדבר עם איתן על צילום ותיעוד, ולברר יחד את אופי המפגש.",
          ctas: [
            { label: "לשיחה עם איתן", href: "/צרו-קשר", tone: "solid" },
            isWorkshop
              ? { label: "על סדנאות פוטודוקותרפיה", href: "/פוטודוקותרפיה", tone: "outline" }
              : { label: "לצפייה בתיק העבודות", href: "/תיק-עבודות", tone: "outline" },
          ],
          backLabel: "חזרה לכל הסיפורים",
          backHref: `/${STORIES_SLUG}`,
          nextLabel: next !== story ? `הסיפור הבא: ${next.title}` : "",
          nextHref: next !== story ? `/${storySlug(next)}` : "",
        }
      ),
    ]),
  };
}

export function seedPage(id: string): PageData | null {
  const page = pages.find((p) => seedId(p.slug) === id);
  if (page) return pageDoc(page);
  const story = stories.find((s) => seedId(storySlug(s)) === id);
  if (story) return storyDoc(story);
  return null;
}
