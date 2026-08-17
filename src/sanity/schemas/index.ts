import { defineArrayMember, defineField, defineType } from "sanity";
import type { SchemaTypeDefinition } from "sanity";
import { allBlockTypes, blockMembers } from "./blocks";

const page = defineType({
  name: "page",
  title: "עמוד",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "שם העמוד",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "כתובת העמוד",
      type: "slug",
      description:
        "הכתובת שתופיע בדפדפן. לדף הבית כתבו / — אחרת עדיף להשאיר כמו שהיה, " +
        "כי שינוי כתובת של עמוד קיים שובר קישורים שכבר מפוזרים באינטרנט.",
      options: {
        source: "title",
        maxLength: 96,
        // Keep Hebrew characters instead of transliterating them away, so slugs
        // match the original site123 URLs.
        slugify: (input) =>
          input.trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "").slice(0, 96),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "showTitleBanner",
      title: "להציג את שם העמוד ככותרת גדולה בראש הדף?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seoDescription",
      title: "תיאור לגוגל",
      type: "text",
      rows: 3,
      description: "המשפט שיופיע מתחת לכותרת בתוצאות החיפוש. עד 160 תווים.",
      validation: (r) => r.max(160).warning("עדיף עד 160 תווים"),
    }),
    defineField({
      name: "blocks",
      title: "קטעי העמוד",
      type: "array",
      of: blockMembers,
      description: "הוסיפו קטעים וגררו כדי לשנות את הסדר",
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({ title, subtitle: slug === "/" ? "דף הבית" : `/${slug ?? ""}` }),
  },
});

const story = defineType({
  name: "story",
  title: "סיפור מאחורי המצלמה",
  type: "document",
  fields: [
    defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "כתובת",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        slugify: (input) =>
          input.trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "").slice(0, 96),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "תאריך",
      type: "string",
      description: "איך שתרצו שיוצג, למשל ״14 בנובמבר״",
    }),
    defineField({ name: "image", title: "תמונה ראשית", type: "captionedImage" }),
    defineField({
      name: "body",
      title: "פסקאות",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "links",
      title: "קישורים",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "טקסט", type: "string" }),
            defineField({ name: "href", title: "כתובת", type: "url" }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
    }),
    defineField({
      name: "tags",
      title: "תגיות",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "date", media: "image" },
  },
});

const siteSettings = defineType({
  name: "siteSettings",
  title: "הגדרות האתר",
  type: "document",
  description: "פרטי הקשר והתפריט. משפיע על כל האתר.",
  fields: [
    defineField({ name: "siteName", title: "שם האתר", type: "string" }),
    defineField({ name: "tagline", title: "משפט הזהות", type: "string" }),
    defineField({
      name: "phone",
      title: "טלפון (לחיוג)",
      type: "string",
      description: "בפורמט בינלאומי, למשל +972547872228",
    }),
    defineField({ name: "phoneDisplay", title: "טלפון (להצגה)", type: "string" }),
    defineField({ name: "email", title: "אימייל", type: "string" }),
    defineField({ name: "location", title: "מקום", type: "string" }),
    defineField({
      name: "hours",
      title: "שעות פעילות",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "roles",
      title: "תחומי עיסוק",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "הרשימה שמופיעה בתחתית קטע ״צרו קשר״",
    }),
    defineField({ name: "facebookUrl", title: "קישור לפייסבוק", type: "url" }),
    defineField({ name: "whatsappUrl", title: "קישור לוואטסאפ", type: "url" }),
  ],
  preview: { prepare: () => ({ title: "הגדרות האתר" }) },
});

export const schemaTypes: SchemaTypeDefinition[] = [
  page,
  story,
  siteSettings,
  ...allBlockTypes,
];
