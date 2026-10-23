import { CLIENT_LOGOS } from "@/lib/assets";
import { colorField, designField, imageField, linkField, rangeField } from "@/editor/fields";
import type { Fields } from "@/editor/schema";
import type { BlockType } from "./render";

/**
 * Editor fields and defaults for every block type.
 *
 * Rendering lives in render.tsx; this file only describes what can be edited.
 * Every block also gets the "🎨 עיצוב" panel (colours, background photo,
 * spacing, width, fonts, corner rounding, scroll animation, visibility).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ------------------------------------------------------------ shared */

const yesNo = (label: string) =>
  ({
    type: "radio",
    label,
    options: [
      { label: "כן", value: true },
      { label: "לא", value: false },
    ],
  }) as any;

const select = (label: string, options: [string | number, string][]) =>
  ({ type: "select", label, options: options.map(([value, l]) => ({ value, label: l })) }) as any;

const radio = (label: string, options: [string | number, string][]) =>
  ({ type: "radio", label, options: options.map(([value, l]) => ({ value, label: l })) }) as any;

const text = (label: string) => ({ type: "text", label }) as any;
const textarea = (label: string) => ({ type: "textarea", label }) as any;

const ctasField = {
  type: "array",
  label: "כפתורים",
  max: 4,
  getItemSummary: (item: any) => item?.label || "כפתור",
  defaultItemProps: { label: "כפתור", href: "/צרו-קשר", tone: "solid" },
  arrayFields: {
    label: text("טקסט"),
    href: linkField("קישור"),
    tone: select("סגנון", [
      ["solid", "מלא"],
      ["outline", "מסגרת"],
      ["solidWhite", "מלא לבן (לרקע כהה)"],
      ["outlineWhite", "מסגרת לבנה (לרקע כהה)"],
    ]),
  },
} as any;

const paragraphsField = {
  type: "array",
  label: "פסקאות",
  getItemSummary: (item: any) => (item?.text || "פסקה").slice(0, 40),
  defaultItemProps: { text: "" },
  arrayFields: { text: textarea("טקסט (להדגשה: **מילה**)") },
} as any;

const listField = (label: string, itemLabel: string) =>
  ({
    type: "array",
    label,
    getItemSummary: (item: any) => item?.text || itemLabel,
    defaultItemProps: { text: "" },
    arrayFields: { text: text(itemLabel) },
  }) as any;

const panelsField = (label: string) =>
  ({
    type: "array",
    label,
    getItemSummary: (item: any) => (item?.text || "קטע").split("\n")[0].slice(0, 40),
    defaultItemProps: { kicker: "", text: "שורה ראשונה\nשורה שנייה" },
    arrayFields: {
      kicker: text("שורה קטנה מעל (לא חובה)"),
      text: textarea("הטקסט — כל שורה בשורה נפרדת"),
    },
  }) as any;

const bgField = (withBrand = true) =>
  radio("רקע", [["white", "בהיר"], ["alt", "משני"], ...(withBrand ? ([["brand", "כהה"]] as [string, string][]) : [])]);

const imageSideField = radio("צד התמונה", [["end", "שמאל"], ["start", "ימין"]]);
const alignField = radio("יישור", [["start", "ימין"], ["center", "מרכז"], ["end", "שמאל"]]);
const headingLevelField = radio("רמת הכותרת", [[1, "ראשית (H1)"], [2, "משנית (H2)"]]);

/* ------------------------------------------------------------ blocks */

export interface BlockDef {
  label: string;
  fields: Fields;
  defaultProps?: Record<string, unknown>;
}

const defs: Record<BlockType, BlockDef> = {
  /* ---------------------------------------------- designed sections */
  Intro: {
    label: "פתיח לעמוד",
    fields: {
      kicker: text("שורה קטנה מעל"),
      title: text("כותרת"),
      subtitle: textarea("טקסט"),
      ctas: ctasField,
      linkLabel: text("קישור טקסט — תווית"),
      linkHref: linkField("קישור טקסט — יעד"),
      headingLevel: headingLevelField,
    },
    defaultProps: { title: "כותרת העמוד", subtitle: "כמה מילים על מה שמחכה כאן.", headingLevel: 1, ctas: [] },
  },
  PageBanner: {
    label: "באנר כותרת",
    fields: { kicker: text("שורה קטנה מעל"), title: text("כותרת"), subtitle: textarea("טקסט מתחת (לא חובה)"), headingLevel: headingLevelField },
    defaultProps: { kicker: "איתן אונר · פוטודוקותרפיה", title: "כותרת העמוד", headingLevel: 1 },
  },
  ScrollStory: {
    label: "סיפור בגלילה (דף הבית)",
    fields: {
      memory: { type: "object", label: "1. התמונה המשפחתית", objectFields: { image: imageField("תמונה"), panels: panelsField("קטעי טקסט") } } as any,
      vista: { type: "object", label: "2. הנוף", objectFields: { image: imageField("תמונה"), cold: panelsField("לפני המפנה"), warm: panelsField("אחרי המפנה") } } as any,
      define: { type: "object", label: "3. ההגדרה", objectFields: { image: imageField("תמונה"), term: text("המילה הגדולה"), panels: panelsField("קטעי טקסט") } } as any,
      room: { type: "object", label: "4. השולחן", objectFields: { image: imageField("תמונה"), inset: imageField("תמונה קטנה"), panels: panelsField("קטעי טקסט") } } as any,
      feelings: {
        type: "object",
        label: "5. הרגשות",
        objectFields: {
          kicker: text("שורה קטנה"),
          title: text("כותרת"),
          items: { type: "array", label: "רגשות", getItemSummary: (i: any) => i?.word || "רגש", arrayFields: { image: imageField("תמונה"), word: text("מילה") } },
        },
      } as any,
      host: { type: "object", label: "6. המנחה", objectFields: { image: imageField("תמונה"), name: text("שם"), role: text("שורה מעל השם"), panels: panelsField("קטעי טקסט") } } as any,
      ask: { type: "object", label: "7. הקריאה לפעולה", objectFields: { kicker: text("שורה קטנה"), title: text("כותרת"), body: paragraphsField, ctas: ctasField } } as any,
    },
  },
  Hero: {
    label: "כותרת ראשית עם תמונה",
    fields: {
      eyebrow: text("שורה קטנה מעל"),
      title: text("כותרת"),
      subtitle: textarea("כותרת משנה"),
      image: imageField("תמונה"),
      imageSide: imageSideField,
      background: radio("רקע", [["brand", "כהה"], ["white", "בהיר"]]),
      ctas: ctasField,
      tags: listField("תגיות בתחתית", "תגית"),
    },
    defaultProps: {
      eyebrow: "איתן אונר · צלם ופוטודוקותרפיסט",
      title: "פוטודוקותרפיה",
      image: { src: "/images/eitan-hero.webp", alt: "איתן אונר", width: 675, height: 657 },
      imageSide: "end",
      background: "brand",
      ctas: [{ label: "על פוטותרפיה", href: "/פוטודוקותרפיה", tone: "solidWhite" }],
      tags: [],
    },
  },
  TextImage: {
    label: "טקסט לצד תמונה",
    fields: {
      title: text("כותרת"),
      eyebrow: text("שורה קטנה מתחת לכותרת"),
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
      ctas: [],
    },
  },
  RichText: {
    label: "קטע טקסט",
    fields: {
      title: text("כותרת הקטע"),
      body: paragraphsField,
      format: select("סוג הטקסט", [["paragraphs", "פסקאות"], ["questions", "שאלות ותשובות (השאלה בין **)"]]),
      facts: {
        type: "array",
        label: "פרטים בקצרה",
        getItemSummary: (item: any) => item?.label || "פרט",
        arrayFields: { label: text("כותרת"), value: textarea("תיאור") },
      } as any,
      ctas: ctasField,
      align: radio("יישור", [["start", "לימין"], ["center", "למרכז"]]),
      maxWidth: radio("רוחב", [["narrow", "צר"], ["wide", "רחב"]]),
      background: bgField(),
    },
    defaultProps: { body: [{ text: "טקסט כאן. להדגשה עטפו בכוכביות: **ככה**" }], align: "start", maxWidth: "narrow", background: "white", ctas: [], facts: [] },
  },
  CardGrid: {
    label: "שורת כרטיסים",
    fields: {
      title: text("כותרת הקטע"),
      cards: {
        type: "array",
        label: "כרטיסים",
        getItemSummary: (item: any) => item?.title || "כרטיס",
        defaultItemProps: { title: "כרטיס", body: "" },
        arrayFields: {
          title: text("כותרת"),
          body: textarea("טקסט"),
          image: imageField("תמונה"),
          href: linkField("קישור (לא חובה)"),
          linkLabel: text("טקסט הקישור"),
        },
      } as any,
      columns: radio("כמה בשורה", [[2, "2"], [3, "3"], [4, "4"]]),
      variant: radio("סגנון", [["plain", "לבן"], ["overlay", "כהה"]]),
      background: bgField(),
    },
    defaultProps: {
      title: "כותרת",
      cards: [{ title: "כרטיס", body: "טקסט", image: { src: "/images/cameras-flatlay.webp", alt: "מצלמות" } }],
      columns: 3,
      variant: "plain",
      background: "white",
    },
  },
  Gallery: {
    label: "גלריית תמונות",
    fields: {
      title: text("כותרת הקטע"),
      purpose: radio("מטרת הגלריה", [["portfolio", "תיק עבודות"], ["prints", "תמונות לרכישה"]]),
      images: {
        type: "array",
        label: "תמונות",
        getItemSummary: (item: any) => item?.image?.alt || "תמונה",
        arrayFields: { image: imageField("תמונה") },
      } as any,
      background: bgField(false),
    },
    defaultProps: {
      images: [
        { image: { src: "/images/gallery-sunflower.webp", alt: "חמנייה" } },
        { image: { src: "/images/gallery-iris.webp", alt: "אירוס" } },
        { image: { src: "/images/gallery-poppies.webp", alt: "כלניות" } },
      ],
      purpose: "portfolio",
      background: "white",
    },
  },
  Testimonials: {
    label: "קרוסלת המלצות",
    fields: {
      title: text("כותרת הקטע"),
      items: {
        type: "array",
        label: "המלצות",
        getItemSummary: (item: any) => item?.author || "המלצה",
        defaultItemProps: { quote: "", author: "", rating: 5 },
        arrayFields: {
          quote: textarea("מה נכתב"),
          author: text("מי אמר"),
          role: text("תפקיד / הקשר"),
          rating: { type: "number", label: "כוכבים (1–5)", min: 1, max: 5 },
          avatar: imageField("תמונת פרופיל (לא חובה)"),
        },
      } as any,
    },
    defaultProps: { title: "המלצות", items: [{ quote: "טקסט ההמלצה.", author: "שם", rating: 5 }] },
  },
  Logos: {
    label: "רשת לוגואים",
    fields: {
      title: text("כותרת הקטע"),
      logos: {
        type: "array",
        label: "לוגואים",
        getItemSummary: (item: any) => item?.image?.alt || "לוגו",
        arrayFields: { image: imageField("לוגו (התיאור מוצג כשם)"), href: linkField("קישור (לא חובה)"), linkLabel: text("טקסט הקישור") },
      } as any,
      tileColor: colorField("צבע רקע הלוגו"),
    },
    defaultProps: {
      title: "לקוחות",
      logos: CLIENT_LOGOS.slice(0, 5).map((l) => ({ image: { src: l.value, alt: l.label } })),
    },
  },
  Quote: {
    label: "פס ציטוט",
    fields: { quote: textarea("הציטוט"), attribution: text("מי אמר"), ctas: ctasField },
    defaultProps: { quote: "״אתה לא רק מצלם תמונה – אתה יוצר אותה״", attribution: "אנסל אדמס", ctas: [] },
  },
  Video: {
    label: "סרטון יוטיוב",
    fields: {
      title: text("כותרת הקטע"),
      body: paragraphsField,
      youtubeUrl: text("כתובת יוטיוב"),
      duration: text("משך הסרטון (לדוגמה 5:13)"),
      background: radio("רקע", [["white", "בהיר"], ["brand", "כהה"]]),
    },
    defaultProps: { youtubeUrl: "https://www.youtube.com/watch?v=6qY1sUxQMFI", background: "white", body: [] },
  },
  Contact: {
    label: "קטע צרו קשר",
    fields: {
      title: text("כותרת הקטע"),
      subtitle: text("שורה מתחת לכותרת"),
      headingLevel: headingLevelField,
      showMap: yesNo("להציג מפה"),
    },
    defaultProps: { title: "צרו קשר", subtitle: "לתיאום סדנה, הרצאה או צילום — בואו נדבר.", headingLevel: 2, showMap: true },
  },
  Article: {
    label: "כתבה / סיפור",
    fields: {
      kicker: text("שורה קטנה מעל"),
      title: text("כותרת"),
      date: text("תאריך (לא חובה)"),
      image: imageField("תמונה ראשית"),
      body: paragraphsField,
      links: {
        type: "array",
        label: "קישורים",
        getItemSummary: (i: any) => i?.label || "קישור",
        arrayFields: { label: text("טקסט"), href: text("כתובת") },
      } as any,
      tags: listField("תגיות", "תגית"),
      ctaTitle: text("תיבת פנייה — כותרת"),
      ctaBody: textarea("תיבת פנייה — טקסט"),
      ctas: ctasField,
      backLabel: text("קישור חזרה — טקסט"),
      backHref: linkField("קישור חזרה — יעד"),
      nextLabel: text("הסיפור הבא — טקסט"),
      nextHref: linkField("הסיפור הבא — יעד"),
    },
    defaultProps: {
      kicker: "סיפור מאחורי המצלמה",
      title: "כותרת הסיפור",
      body: [{ text: "הטקסט כאן." }],
      tags: [],
      links: [],
      ctas: [],
      backLabel: "חזרה לכל הסיפורים",
      backHref: "/סיפורים-מאחורי-המצלמה",
    },
  },

  /* ------------------------------------------------- inserted elements */
  Image: {
    label: "תמונה",
    fields: {
      image: imageField("תמונה"),
      width: rangeField("רוחב (אחוזים)", 10, 100, 100, "%"),
      maxWidth: rangeField("רוחב מקסימלי", 80, 2000, 2000, "px", 10),
      ratio: select("יחס", [["auto", "מקורי"], ["1/1", "ריבוע"], ["4/3", "4:3"], ["3/4", "3:4 (לאורך)"], ["3/2", "3:2"], ["16/9", "16:9 (רחב)"], ["21/9", "פנורמה"]]),
      fit: radio("מילוי", [["cover", "חיתוך למילוי"], ["contain", "תמונה שלמה"]]),
      radius: rangeField("עיגול פינות", 0, 300, 24, "px"),
      shadow: yesNo("צל"),
      border: colorField("צבע מסגרת (ריק = ללא)"),
      grayscale: yesNo("שחור-לבן"),
      hover: yesNo("הגדלה עדינה במעבר עכבר"),
      caption: text("כיתוב (לא חובה)"),
      link: linkField("קישור (לא חובה)"),
      align: alignField,
    },
    defaultProps: { image: { src: "/images/cameras-flatlay.webp", alt: "מצלמות על שולחן" }, ratio: "auto", fit: "cover", shadow: false, grayscale: false, hover: false, align: "center" },
  },
  Buttons: {
    label: "כפתורים",
    fields: {
      buttons: {
        type: "array",
        label: "כפתורים",
        getItemSummary: (i: any) => i?.label || "כפתור",
        defaultItemProps: { label: "כפתור", href: "/צרו-קשר", style: "solid", newTab: false },
        arrayFields: {
          label: text("טקסט"),
          href: linkField("קישור"),
          style: select("סגנון", [["solid", "מלא"], ["outline", "מסגרת"], ["solidWhite", "מלא לבן"], ["outlineWhite", "מסגרת לבנה"], ["link", "קישור טקסט"], ["custom", "צבעים משלי"]]),
          background: colorField("צבע רקע (לסגנון 'צבעים משלי')"),
          color: colorField("צבע טקסט (לסגנון 'צבעים משלי')"),
          newTab: yesNo("לפתוח בחלון חדש"),
        },
      } as any,
      align: alignField,
      size: radio("גודל", [["s", "קטן"], ["m", "בינוני"], ["l", "גדול"]]),
      fullWidth: yesNo("ברוחב מלא"),
    },
    defaultProps: { buttons: [{ label: "לתיאום שיחה", href: "/צרו-קשר", style: "solid" }], align: "start", size: "m", fullWidth: false },
  },
  Spacer: {
    label: "רווח",
    fields: {
      height: rangeField("גובה (מחשב)", 0, 400, 48, "px", 4),
      heightMobile: rangeField("גובה (טלפון)", 0, 300, 28, "px", 4),
    },
    defaultProps: { height: 48 },
  },
  Divider: {
    label: "קו מפריד",
    fields: {
      variant: select("סגנון", [["line", "קו"], ["dashed", "מקווקו"], ["dotted", "נקודות"], ["rule", "קו ונקודה"], ["ornament", "קישוט"]]),
      color: colorField("צבע"),
      thickness: rangeField("עובי", 1, 12, 1, "px"),
      width: rangeField("רוחב", 5, 100, 100, "%"),
      align: alignField,
    },
    defaultProps: { variant: "line", align: "center" },
  },
  Embed: {
    label: "הטמעה (מפה, סרטון, טופס)",
    fields: {
      url: text("קישור (YouTube, Vimeo, Google Maps, טופס…)"),
      html: textarea("או: קוד הטמעה (HTML)"),
      title: text("תיאור (לנגישות)"),
      ratio: radio("יחס", [["16/9", "16:9"], ["4/3", "4:3"], ["1/1", "ריבוע"], ["auto", "גובה קבוע"]]),
      height: rangeField("גובה (ביחס 'גובה קבוע')", 100, 1200, 450, "px", 10),
      maxWidth: rangeField("רוחב מקסימלי", 200, 2000, 2000, "px", 10),
    },
    defaultProps: { ratio: "16/9" },
  },
};

/** Each block's definition, with the design panel added. */
export const BLOCK_DEFS = Object.fromEntries(
  (Object.keys(defs) as BlockType[]).map((type) => [
    type,
    { ...defs[type], fields: { ...defs[type].fields, design: designField }, defaultProps: { ...(defs[type].defaultProps ?? {}), design: {} } },
  ])
) as unknown as Record<BlockType, BlockDef>;

/** The editor's "insert" menu, grouped. */
export const BLOCK_GROUPS: { title: string; types: BlockType[] }[] = [
  { title: "רכיבים", types: ["Image", "Buttons", "Embed", "Divider", "Spacer"] },
  {
    title: "קטעים מעוצבים",
    types: ["Intro", "PageBanner", "Hero", "TextImage", "RichText", "CardGrid", "Gallery", "Testimonials", "Logos", "Quote", "Video", "Contact", "Article", "ScrollStory"],
  },
];
