import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Block library.
 *
 * Every title, description and placeholder here is written in Hebrew, addressed
 * to Eitan, because this text *is* his editing interface. Sanity Studio's own
 * chrome is English; these labels are the part we control, so they carry the
 * weight of explaining the system to him.
 *
 * Note what is deliberately absent: no spacing, colour, font-size or column-width
 * controls. Layout is fixed by design. He supplies words and pictures.
 */

const backgroundField = defineField({
  name: "background",
  title: "רקע הקטע",
  type: "string",
  options: {
    list: [
      { title: "לבן", value: "white" },
      { title: "אפור בהיר", value: "alt" },
      { title: "טורקיז", value: "brand" },
    ],
    layout: "radio",
  },
  initialValue: "white",
});

const imageSideField = defineField({
  name: "imageSide",
  title: "צד התמונה",
  type: "string",
  description: "באיזה צד תופיע התמונה במסך רחב",
  options: {
    list: [
      { title: "ימין", value: "start" },
      { title: "שמאל", value: "end" },
    ],
    layout: "radio",
  },
  initialValue: "start",
});

export const ctaType = defineType({
  name: "cta",
  title: "כפתור",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "טקסט הכפתור",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "href",
      title: "קישור",
      type: "string",
      description: "כתובת פנימית כמו /אודות, או כתובת מלאה עם https://",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tone",
      title: "סוג הכפתור",
      type: "string",
      options: {
        list: [
          { title: "מלא (טורקיז)", value: "solid" },
          { title: "מסגרת (טורקיז)", value: "outline" },
          { title: "מלא (לבן) — לרקע טורקיז", value: "solidWhite" },
          { title: "מסגרת (לבן) — לרקע טורקיז", value: "outlineWhite" },
        ],
      },
      initialValue: "solid",
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

/** Shared image object so every image on the site demands alt text. */
export const captionedImage = defineType({
  name: "captionedImage",
  title: "תמונה",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "תיאור התמונה",
      type: "string",
      description:
        "מה רואים בתמונה, במשפט קצר. חשוב לגוגל ולאנשים שמשתמשים בקורא מסך.",
      validation: (r) => r.required().warning("מומלץ מאוד למלא תיאור"),
    }),
  ],
});

export const heroBlock = defineType({
  name: "hero",
  title: "כותרת ראשית עם תמונה",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
    defineField({ name: "subtitle", title: "כותרת משנה", type: "text", rows: 2 }),
    defineField({
      name: "image",
      title: "תמונה",
      type: "captionedImage",
      validation: (r) => r.required(),
    }),
    imageSideField,
    backgroundField,
    defineField({
      name: "ctas",
      title: "כפתורים",
      type: "array",
      of: [defineArrayMember({ type: "cta" })],
      validation: (r) => r.max(3),
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title: title ?? "כותרת ראשית", subtitle: "כותרת ראשית עם תמונה", media }),
  },
});

export const textImageBlock = defineType({
  name: "textImage",
  title: "טקסט לצד תמונה",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת", type: "string" }),
    defineField({ name: "eyebrow", title: "שורה קטנה מעל הטקסט", type: "string" }),
    defineField({
      name: "body",
      title: "פסקאות",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      description: "כל פסקה בשורה נפרדת. לטקסט מודגש עטפו בכוכביות: **ככה**",
    }),
    defineField({
      name: "image",
      title: "תמונה",
      type: "captionedImage",
      validation: (r) => r.required(),
    }),
    imageSideField,
    backgroundField,
    defineField({
      name: "ctas",
      title: "כפתורים",
      type: "array",
      of: [defineArrayMember({ type: "cta" })],
      validation: (r) => r.max(3),
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title: title ?? "טקסט לצד תמונה", subtitle: "טקסט לצד תמונה", media }),
  },
});

export const richTextBlock = defineType({
  name: "richText",
  title: "קטע טקסט",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת הקטע", type: "string" }),
    defineField({
      name: "body",
      title: "פסקאות",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      description: "לטקסט מודגש עטפו בכוכביות: **ככה**",
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "align",
      title: "יישור",
      type: "string",
      options: {
        list: [
          { title: "לימין", value: "start" },
          { title: "למרכז", value: "center" },
        ],
        layout: "radio",
      },
      initialValue: "start",
    }),
    defineField({
      name: "maxWidth",
      title: "רוחב הטקסט",
      type: "string",
      options: {
        list: [
          { title: "צר (נוח לקריאה)", value: "narrow" },
          { title: "רחב", value: "wide" },
        ],
        layout: "radio",
      },
      initialValue: "narrow",
    }),
    backgroundField,
  ],
  preview: {
    select: { title: "title", body: "body" },
    prepare: ({ title, body }) => ({
      title: title ?? "קטע טקסט",
      subtitle: Array.isArray(body) ? String(body[0] ?? "").slice(0, 70) : "",
    }),
  },
});

export const cardBlock = defineType({
  name: "card",
  title: "כרטיס",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "טקסט", type: "text", rows: 4 }),
    defineField({ name: "image", title: "תמונה", type: "captionedImage" }),
    defineField({
      name: "href",
      title: "קישור (לא חובה)",
      type: "string",
      description: "אם תמלאו — כל הכרטיס יהיה לחיץ",
    }),
    defineField({ name: "linkLabel", title: "טקסט הקישור", type: "string", initialValue: "קרא עוד" }),
  ],
  preview: { select: { title: "title", subtitle: "body", media: "image" } },
});

export const cardGridBlock = defineType({
  name: "cardGrid",
  title: "שורת כרטיסים",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת הקטע", type: "string" }),
    defineField({
      name: "cards",
      title: "כרטיסים",
      type: "array",
      of: [defineArrayMember({ type: "card" })],
      description: "אפשר לגרור כדי לשנות את הסדר",
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "columns",
      title: "כמה בשורה",
      type: "number",
      options: {
        list: [
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
        ],
        layout: "radio",
      },
      initialValue: 3,
    }),
    defineField({
      name: "variant",
      title: "עיצוב הכרטיס",
      type: "string",
      options: {
        list: [
          { title: "לבן עם כותרת טורקיז", value: "plain" },
          { title: "טקסט על רקע טורקיז", value: "overlay" },
        ],
        layout: "radio",
      },
      initialValue: "plain",
    }),
    backgroundField,
  ],
  preview: {
    select: { title: "title", cards: "cards" },
    prepare: ({ title, cards }) => ({
      title: title ?? "שורת כרטיסים",
      subtitle: `${Array.isArray(cards) ? cards.length : 0} כרטיסים`,
    }),
  },
});

export const galleryBlock = defineType({
  name: "gallery",
  title: "גלריית תמונות",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת הקטע", type: "string" }),
    defineField({
      name: "images",
      title: "תמונות",
      type: "array",
      of: [defineArrayMember({ type: "captionedImage" })],
      options: { layout: "grid" },
      description: "אפשר לגרור כדי לשנות את הסדר. אין הגבלה על גודל הקובץ.",
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "background",
      title: "רקע הקטע",
      type: "string",
      options: {
        list: [
          { title: "לבן", value: "white" },
          { title: "אפור בהיר", value: "alt" },
        ],
        layout: "radio",
      },
      initialValue: "white",
    }),
  ],
  preview: {
    select: { title: "title", images: "images" },
    prepare: ({ title, images }) => ({
      title: title ?? "גלריית תמונות",
      subtitle: `${Array.isArray(images) ? images.length : 0} תמונות`,
    }),
  },
});

export const testimonialBlock = defineType({
  name: "testimonial",
  title: "המלצה",
  type: "object",
  fields: [
    defineField({ name: "quote", title: "מה נכתב", type: "text", rows: 6, validation: (r) => r.required() }),
    defineField({ name: "author", title: "מי אמר", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "תפקיד / הקשר", type: "string" }),
    defineField({
      name: "rating",
      title: "כמה כוכבים",
      type: "number",
      options: { list: [1, 2, 3, 4, 5] },
      initialValue: 5,
    }),
    defineField({ name: "avatar", title: "תמונה (לא חובה)", type: "captionedImage" }),
  ],
  preview: { select: { title: "author", subtitle: "quote", media: "avatar" } },
});

export const testimonialsBlock = defineType({
  name: "testimonials",
  title: "קרוסלת המלצות",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת הקטע", type: "string", initialValue: "המלצות" }),
    defineField({
      name: "items",
      title: "המלצות",
      type: "array",
      of: [defineArrayMember({ type: "testimonial" })],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({
      title: title ?? "המלצות",
      subtitle: `${Array.isArray(items) ? items.length : 0} המלצות`,
    }),
  },
});

export const logosBlock = defineType({
  name: "logos",
  title: "רשת לוגואים",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת הקטע", type: "string", initialValue: "לקוחות" }),
    defineField({
      name: "logos",
      title: "לוגואים",
      type: "array",
      of: [defineArrayMember({ type: "captionedImage" })],
      options: { layout: "grid" },
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", logos: "logos" },
    prepare: ({ title, logos }) => ({
      title: title ?? "לקוחות",
      subtitle: `${Array.isArray(logos) ? logos.length : 0} לוגואים`,
    }),
  },
});

export const quoteBlock = defineType({
  name: "quote",
  title: "פס ציטוט",
  type: "object",
  fields: [
    defineField({ name: "quote", title: "הציטוט", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "attribution", title: "מי אמר", type: "string" }),
    defineField({
      name: "ctas",
      title: "כפתורים",
      type: "array",
      of: [defineArrayMember({ type: "cta" })],
      validation: (r) => r.max(3),
    }),
  ],
  preview: {
    select: { title: "quote", subtitle: "attribution" },
  },
});

export const videoBlock = defineType({
  name: "video",
  title: "סרטון יוטיוב",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת הקטע", type: "string" }),
    defineField({
      name: "body",
      title: "פסקאות מעל הסרטון",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 3 })],
    }),
    defineField({
      name: "youtubeUrl",
      title: "כתובת הסרטון ביוטיוב",
      type: "url",
      description: "הדביקו את הכתובת מהדפדפן, למשל https://www.youtube.com/watch?v=...",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "background",
      title: "רקע הקטע",
      type: "string",
      options: {
        list: [
          { title: "לבן", value: "white" },
          { title: "טורקיז", value: "brand" },
        ],
        layout: "radio",
      },
      initialValue: "white",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "youtubeUrl" },
    prepare: ({ title, subtitle }) => ({ title: title ?? "סרטון יוטיוב", subtitle }),
  },
});

export const contactBlock = defineType({
  name: "contact",
  title: "קטע ״צרו קשר״",
  type: "object",
  description: "מציג את המפה ופרטי הקשר מתוך ״הגדרות האתר״",
  fields: [
    defineField({ name: "title", title: "כותרת הקטע", type: "string", initialValue: "צרו קשר" }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title ?? "צרו קשר", subtitle: "מפה + פרטי קשר" }),
  },
});

export const allBlockTypes = [
  ctaType,
  captionedImage,
  cardBlock,
  testimonialBlock,
  heroBlock,
  textImageBlock,
  richTextBlock,
  cardGridBlock,
  galleryBlock,
  testimonialsBlock,
  logosBlock,
  quoteBlock,
  videoBlock,
  contactBlock,
];

export const blockMembers = [
  defineArrayMember({ type: "hero" }),
  defineArrayMember({ type: "textImage" }),
  defineArrayMember({ type: "richText" }),
  defineArrayMember({ type: "cardGrid" }),
  defineArrayMember({ type: "gallery" }),
  defineArrayMember({ type: "testimonials" }),
  defineArrayMember({ type: "logos" }),
  defineArrayMember({ type: "quote" }),
  defineArrayMember({ type: "video" }),
  defineArrayMember({ type: "contact" }),
];
