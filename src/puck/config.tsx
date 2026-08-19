import type { Config } from "@measured/puck";
import {
  CardGrid,
  Contact,
  Gallery,
  Hero,
  Logos,
  Quote,
  RichText,
  ScrollStory,
  TextImage,
  Video,
} from "@/components/blocks";
import { Testimonials } from "@/components/Testimonials";
import { scrollStory } from "@/lib/content";
import { CLIENT_LOGOS } from "./assets";
import { MediaField } from "./MediaField";
import { scrollStoryToPuckProps } from "./seed";

/**
 * Puck configuration.
 *
 * The important property here: `render` delegates to the *same* components the
 * live site uses. There is no separate "editor version" of a section that can
 * drift from production — what Eitan drags around is literally the page.
 *
 * Field sets are deliberately narrow. Puck can expose arbitrary style controls;
 * we don't, for the same reason as before — he gets to compose pages, not
 * restyle them, so a broken layout isn't reachable.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Thumbnail-grid picker with upload, managing {src, alt} together. */
const imageField = (label: string) =>
  ({
    type: "custom",
    label,
    render: ({ value, onChange }: any) => (
      <MediaField value={value} onChange={onChange} />
    ),
  }) as any;

const ctasField = {
  type: "array",
  label: "כפתורים",
  max: 3,
  getItemSummary: (item: any) => item?.label || "כפתור",
  arrayFields: {
    label: { type: "text", label: "טקסט" },
    href: { type: "text", label: "קישור" },
    tone: {
      type: "select",
      label: "סוג",
      options: [
        { label: "מלא (טורקיז)", value: "solid" },
        { label: "מסגרת (טורקיז)", value: "outline" },
        { label: "מלא (לבן)", value: "solidWhite" },
        { label: "מסגרת (לבן)", value: "outlineWhite" },
      ],
    },
  },
} as any;

const paragraphsField = {
  type: "array",
  label: "פסקאות",
  getItemSummary: (item: any) => (item?.text || "פסקה").slice(0, 40),
  arrayFields: {
    text: { type: "textarea", label: "טקסט" },
  },
} as any;

/** Puck arrays hold objects; the block components want plain strings. */
const toStrings = (rows?: { text?: string }[]) =>
  (rows ?? []).map((r) => r?.text ?? "").filter(Boolean);

/**
 * A run of narrative beats for the scrolling homepage.
 *
 * Each beat is one held moment: a small turquoise label, and up to a few
 * display lines. The lines are separate rows rather than one textarea because
 * on that page the line break *is* the punctuation — it decides where the
 * reader pauses — and a wrapped paragraph cannot express it.
 */
const beatsField = (label: string) =>
  ({
    type: "array",
    label,
    getItemSummary: (item: any) =>
      (item?.lines?.[0]?.text || "בית").slice(0, 32),
    arrayFields: {
      kicker: { type: "text", label: "תווית קטנה (לא חובה)" },
      lines: {
        type: "array",
        label: "שורות",
        getItemSummary: (item: any) => (item?.text || "שורה").slice(0, 32),
        arrayFields: { text: { type: "text", label: "שורה" } },
      },
    },
  }) as any;

/** Puck arrays hold objects at every level; the block wants plain strings. */
const toBeats = (rows?: { kicker?: string; lines?: { text?: string }[] }[]) =>
  (rows ?? [])
    .map((r) => ({
      kicker: r?.kicker || undefined,
      lines: toStrings(r?.lines),
    }))
    .filter((b) => b.lines.length > 0);

const bgField = (withBrand = true) =>
  ({
    type: "radio",
    label: "רקע",
    options: [
      { label: "לבן", value: "white" },
      { label: "אפור בהיר", value: "alt" },
      ...(withBrand ? [{ label: "טורקיז", value: "brand" }] : []),
    ],
  }) as any;

const imageSideField = {
  type: "radio",
  label: "צד התמונה",
  options: [
    { label: "שמאל", value: "end" },
    { label: "ימין", value: "start" },
  ],
} as any;

export const config: Config = {
  components: {
    /* ------------------------------------------------------------------ */
    "כותרת ראשית": {
      label: "כותרת ראשית עם תמונה",
      fields: {
        title: { type: "text", label: "כותרת" },
        subtitle: { type: "textarea", label: "כותרת משנה" },
        backdrop: imageField("תמונת רקע (רוחב מלא)"),
        image: imageField("תמונת דיוקן"),
        imageSide: imageSideField,
        background: {
          type: "radio",
          label: "רקע",
          options: [
            { label: "טורקיז", value: "brand" },
            { label: "לבן", value: "white" },
          ],
        } as any,
        ctas: ctasField,
      },
      defaultProps: {
        title: "פוטודוקותרפיה",
        backdrop: {
          src: "/images/gallery-valley-dusk.webp",
          alt: "עמק בשעת דמדומים",
        },
        image: { src: "/images/eitan-hero.webp", alt: "איתן אונר" },
        imageSide: "end",
        background: "brand",
        ctas: [{ label: "על פוטותרפיה", href: "/פוטודוקותרפיה", tone: "solidWhite" }],
      } as any,
      render: (props: any) => <Hero block={{ _type: "hero", ...props }} />,
    },

    /* ------------------------------------------------------------------ */
    "טקסט ותמונה": {
      label: "טקסט לצד תמונה",
      fields: {
        title: { type: "text", label: "כותרת" },
        eyebrow: { type: "text", label: "שורה קטנה מעל הטקסט" },
        body: paragraphsField,
        image: imageField("תמונה"),
        imageSide: imageSideField,
        background: bgField(),
        ctas: ctasField,
      },
      defaultProps: {
        title: "כותרת",
        body: [{ text: "טקסט כאן." }],
        image: { src: "/images/hands-circle.webp", alt: "ידיים במעגל" },
        imageSide: "end",
        background: "white",
      } as any,
      render: ({ body, ...props }: any) => (
        <TextImage block={{ _type: "textImage", ...props, body: toStrings(body) }} />
      ),
    },

    /* ------------------------------------------------------------------ */
    "קטע טקסט": {
      label: "קטע טקסט",
      fields: {
        title: { type: "text", label: "כותרת הקטע" },
        body: paragraphsField,
        align: {
          type: "radio",
          label: "יישור",
          options: [
            { label: "לימין", value: "start" },
            { label: "למרכז", value: "center" },
          ],
        } as any,
        maxWidth: {
          type: "radio",
          label: "רוחב",
          options: [
            { label: "צר", value: "narrow" },
            { label: "רחב", value: "wide" },
          ],
        } as any,
        background: bgField(),
      },
      defaultProps: {
        body: [{ text: "טקסט כאן. להדגשה עטפו בכוכביות: **ככה**" }],
        align: "start",
        maxWidth: "narrow",
        background: "white",
      } as any,
      render: ({ body, ...props }: any) => (
        <RichText block={{ _type: "richText", ...props, body: toStrings(body) }} />
      ),
    },

    /* ------------------------------------------------------------------ */
    "שורת כרטיסים": {
      label: "שורת כרטיסים",
      fields: {
        title: { type: "text", label: "כותרת הקטע" },
        cards: {
          type: "array",
          label: "כרטיסים",
          getItemSummary: (item: any) => item?.title || "כרטיס",
          arrayFields: {
            title: { type: "text", label: "כותרת" },
            body: { type: "textarea", label: "טקסט" },
            image: imageField("תמונה"),
            href: { type: "text", label: "קישור (לא חובה)" },
            linkLabel: { type: "text", label: "טקסט הקישור" },
          },
        } as any,
        columns: {
          type: "radio",
          label: "כמה בשורה",
          options: [
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4", value: 4 },
          ],
        } as any,
        variant: {
          type: "radio",
          label: "עיצוב",
          options: [
            { label: "לבן", value: "plain" },
            { label: "טורקיז", value: "overlay" },
          ],
        } as any,
        background: bgField(),
      },
      defaultProps: {
        title: "כותרת",
        cards: [{ title: "כרטיס", body: "טקסט", image: { src: "/images/cameras-flatlay.webp", alt: "מצלמות" } }],
        columns: 3,
        variant: "plain",
        background: "white",
      } as any,
      render: (props: any) => <CardGrid block={{ _type: "cardGrid", ...props }} />,
    },

    /* ------------------------------------------------------------------ */
    "גלריה": {
      label: "גלריית תמונות",
      fields: {
        title: { type: "text", label: "כותרת הקטע" },
        images: {
          type: "array",
          label: "תמונות",
          getItemSummary: (item: any) => item?.image?.alt || "תמונה",
          arrayFields: {
            image: imageField("תמונה"),
          },
        } as any,
        background: bgField(false),
      },
      defaultProps: {
        images: [
          { image: { src: "/images/gallery-sunflower.webp", alt: "חמנייה" } },
          { image: { src: "/images/gallery-iris.webp", alt: "אירוס" } },
          { image: { src: "/images/gallery-poppies.webp", alt: "כלניות" } },
        ],
        background: "white",
      } as any,
      render: ({ images, ...props }: any) => (
        <Gallery
          block={{
            _type: "gallery",
            ...props,
            images: (images ?? []).map((r: any) => r?.image).filter((i: any) => i?.src),
          }}
        />
      ),
    },

    /* ------------------------------------------------------------------ */
    "המלצות": {
      label: "קרוסלת המלצות",
      fields: {
        title: { type: "text", label: "כותרת הקטע" },
        items: {
          type: "array",
          label: "המלצות",
          getItemSummary: (item: any) => item?.author || "המלצה",
          arrayFields: {
            quote: { type: "textarea", label: "מה נכתב" },
            author: { type: "text", label: "מי אמר" },
            role: { type: "text", label: "תפקיד / הקשר" },
            rating: { type: "number", label: "כוכבים (1–5)", min: 1, max: 5 },
          },
        } as any,
      },
      defaultProps: {
        title: "המלצות",
        items: [{ quote: "טקסט ההמלצה.", author: "שם", rating: 5 }],
      } as any,
      render: (props: any) => (
        <Testimonials block={{ _type: "testimonials", ...props }} />
      ),
    },

    /* ------------------------------------------------------------------ */
    "לוגואים": {
      label: "רשת לוגואים",
      fields: {
        title: { type: "text", label: "כותרת הקטע" },
        logos: {
          type: "array",
          label: "לוגואים",
          getItemSummary: (item: any) => item?.image?.alt || "לוגו",
          arrayFields: {
            image: imageField("לוגו"),
          },
        } as any,
      },
      defaultProps: {
        title: "לקוחות",
        logos: CLIENT_LOGOS.slice(0, 5).map((l) => ({ image: { src: l.value, alt: l.label } })),
      } as any,
      render: ({ logos, ...props }: any) => (
        <Logos
          block={{
            _type: "logos",
            ...props,
            logos: (logos ?? []).map((r: any) => r?.image).filter((i: any) => i?.src),
          }}
        />
      ),
    },

    /* ------------------------------------------------------------------ */
    /**
     * The scrolling homepage.
     *
     * Every photograph and every word is editable; the choreography is not.
     * That is the same "blocks, not a canvas" rule the rest of this config
     * follows, applied to a longer form — Eitan recasts the film, he does not
     * re-cut it, and so he cannot land on a version of this page that does
     * not work.
     */
    "סיפור נגלל": {
      label: "עמוד הבית הנגלל",
      fields: {
        memory: {
          type: "object",
          label: "א׳ — התמונה הישנה",
          objectFields: {
            image: imageField("התצלום"),
            panels: beatsField("הבתים"),
          },
        } as any,
        vista: {
          type: "object",
          label: "ב׳+ג׳ — הנוף, פעמיים",
          objectFields: {
            image: imageField("התצלום (מופיע פעמיים)"),
            cold: beatsField("בתים — לפני"),
            warm: beatsField("בתים — אחרי"),
          },
        } as any,
        define: {
          type: "object",
          label: "ד׳ — המילה",
          objectFields: {
            image: imageField("רקע"),
            term: { type: "text", label: "המילה" },
            panels: beatsField("הבתים"),
          },
        } as any,
        room: {
          type: "object",
          label: "ה׳ — השולחן",
          objectFields: {
            image: imageField("תצלום ראשי"),
            inset: imageField("תצלום קטן"),
            panels: beatsField("הבתים"),
          },
        } as any,
        feelings: {
          type: "object",
          label: "ו׳ — רצועת הרגשות",
          objectFields: {
            kicker: { type: "text", label: "תווית קטנה" },
            title: { type: "text", label: "כותרת" },
            items: {
              type: "array",
              label: "תמונות ומילים",
              getItemSummary: (item: any) => item?.word || "מילה",
              arrayFields: {
                image: imageField("תצלום"),
                word: { type: "text", label: "מילה אחת" },
              },
            },
          },
        } as any,
        host: {
          type: "object",
          label: "ז׳ — מי מנחה",
          objectFields: {
            image: imageField("דיוקן"),
            role: { type: "text", label: "תווית קטנה" },
            name: { type: "text", label: "שם" },
            panels: beatsField("הבתים"),
          },
        } as any,
        ask: {
          type: "object",
          label: "ח׳ — הקריאה לפעולה",
          objectFields: {
            kicker: { type: "text", label: "תווית קטנה" },
            title: { type: "text", label: "כותרת" },
            body: paragraphsField,
            ctas: ctasField,
          },
        } as any,
      },
      defaultProps: scrollStoryToPuckProps(scrollStory) as any,
      render: ({ memory, vista, define, room, feelings, host, ask }: any) => (
        <ScrollStory
          block={{
            _type: "scrollStory",
            memory: { ...memory, panels: toBeats(memory?.panels) },
            vista: {
              ...vista,
              cold: toBeats(vista?.cold),
              warm: toBeats(vista?.warm),
            },
            define: { ...define, panels: toBeats(define?.panels) },
            room: { ...room, panels: toBeats(room?.panels) },
            feelings: {
              ...feelings,
              items: (feelings?.items ?? []).filter((i: any) => i?.image?.src),
            },
            host: { ...host, panels: toBeats(host?.panels) },
            ask: { ...ask, body: toStrings(ask?.body) },
          }}
        />
      ),
    },

    /* ------------------------------------------------------------------ */
    "ציטוט": {
      label: "פס ציטוט",
      fields: {
        quote: { type: "textarea", label: "הציטוט" },
        attribution: { type: "text", label: "מי אמר" },
        ctas: ctasField,
      },
      defaultProps: {
        quote: "״אתה לא רק מצלם תמונה – אתה יוצר אותה״",
        attribution: "אנסל אדמס",
      } as any,
      render: (props: any) => <Quote block={{ _type: "quote", ...props }} />,
    },

    /* ------------------------------------------------------------------ */
    "סרטון": {
      label: "סרטון יוטיוב",
      fields: {
        title: { type: "text", label: "כותרת הקטע" },
        body: paragraphsField,
        youtubeUrl: { type: "text", label: "כתובת יוטיוב" },
        background: {
          type: "radio",
          label: "רקע",
          options: [
            { label: "לבן", value: "white" },
            { label: "טורקיז", value: "brand" },
          ],
        } as any,
      },
      defaultProps: {
        youtubeUrl: "https://www.youtube.com/watch?v=6qY1sUxQMFI",
        background: "white",
      } as any,
      render: ({ body, ...props }: any) => (
        <Video block={{ _type: "video", ...props, body: toStrings(body) }} />
      ),
    },

    /* ------------------------------------------------------------------ */
    "צרו קשר": {
      label: "קטע צרו קשר",
      fields: {
        title: { type: "text", label: "כותרת הקטע" },
      },
      defaultProps: { title: "צרו קשר" } as any,
      render: (props: any) => <Contact block={{ _type: "contact", ...props }} />,
    },
  },
};

export default config;
