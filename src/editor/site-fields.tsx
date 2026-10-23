import { colorField, fontField, imageField, linkField, rangeField } from "./fields";
import type { Field, Fields } from "./schema";

/**
 * The site-design form: one collapsible group per key of the SiteDoc
 * (src/lib/site.ts).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const text = (label: string): Field => ({ type: "text", label });
const textarea = (label: string): Field => ({ type: "textarea", label });
const yesNo = (label: string): Field => ({ type: "radio", label, options: [{ label: "כן", value: true }, { label: "לא", value: false }] });
const radio = (label: string, options: [string | number, string][]): Field => ({ type: "radio", label, options: options.map(([value, l]) => ({ value, label: l })) });
const color = (label: string) => colorField(label, false);

export const siteFields: Fields = {
  colors: {
    type: "object",
    label: "🎨 צבעים",
    objectFields: {
      primary: color("צבע ראשי (כפתורים, קישורים, לוגו)"),
      dark: color("צבע כהה (תפריט, פוטר, קטעים כהים)"),
      accent: color("צבע הדגשה (קווים, נקודות, מסגרות פוקוס)"),
      accentSoft: color("צבע הדגשה בהיר"),
      text: color("צבע טקסט"),
      textSoft: color("צבע טקסט משני"),
      background: color("צבע רקע האתר"),
      surfaceAlt: color("צבע רקע משני (קטעים מתחלפים)"),
      hairline: color("צבע קווים דקים ומסגרות"),
    },
  },
  typography: {
    type: "object",
    label: "🔤 טיפוגרפיה",
    objectFields: {
      bodyFont: fontField("גופן טקסט"),
      headingFont: fontField("גופן כותרות"),
      baseSize: rangeField("גודל טקסט כללי", 80, 140, 100, "%"),
      lineHeight: rangeField("מרווח שורות", 1.2, 2.4, 1.75, "", 0.05),
      headingWeight: radio("עובי כותרות", [[400, "רגיל"], [600, "חצי עבה"], [700, "עבה"], [800, "עבה מאוד"]]),
      headingTracking: rangeField("ריווח אותיות בכותרות", -60, 100, -25, "‰", 5),
    },
  },
  layout: {
    type: "object",
    label: "📐 פריסה",
    objectFields: {
      containerWidth: rangeField("רוחב התוכן המקסימלי", 900, 1800, 1240, "px", 20),
      sectionSpacing: rangeField("ריווח בין קטעים", 40, 200, 100, "%", 5),
      radius: rangeField("עיגול פינות (כרטיסים ותמונות)", 0, 200, 100, "%", 5),
      buttonShape: radio("צורת כפתורים", [["pill", "מעוגלים לגמרי"], ["rounded", "פינות מעוגלות"], ["square", "ישרים"]]),
    },
  },
  header: {
    type: "object",
    label: "⬆️ כותרת עליונה ותפריט",
    objectFields: {
      layout: radio("סוג תפריט", [["overlay", "כפתור תפריט במסך מלא"], ["bar", "קישורים בשורה (במחשב)"]]),
      sticky: yesNo("נשאר למעלה בגלילה"),
      background: color("צבע רקע (ריק = ברירת מחדל)"),
      text: color("צבע טקסט"),
      logoText: text("טקסט הלוגו"),
      showLogoMark: yesNo("להציג את סמל המצלמה"),
      logoImage: imageField("לוגו כתמונה (מחליף את סמל המצלמה)"),
      logoHeight: rangeField("גודל הלוגו", 20, 90, 36, "px"),
      showCta: yesNo("להציג כפתור פעולה"),
      ctaLabel: text("כפתור פעולה — טקסט"),
      ctaHref: linkField("כפתור פעולה — קישור"),
      menuKicker: text("תפריט מלא — שורה מעל הקישורים"),
      menuTagline: text("תפריט מלא — שורה בצד"),
      menuContactLabel: text("תפריט מלא — כותרת כפתורי הקשר"),
      menuImage: imageField("תפריט מלא — תמונת רקע בצד"),
    },
  },
  nav: {
    type: "array",
    label: "🧭 קישורי התפריט",
    getItemSummary: (item: any) => item?.label || "קישור",
    defaultItemProps: { label: "קישור חדש", href: "/", children: [] },
    arrayFields: {
      label: text("טקסט"),
      href: linkField("קישור (לקבוצה עם תת־קישורים: #)"),
      children: {
        type: "array",
        label: "תת־קישורים (הופך את הפריט לקבוצה)",
        getItemSummary: (item: any) => item?.label || "קישור",
        defaultItemProps: { label: "קישור", href: "/" },
        arrayFields: { label: text("טקסט"), href: linkField("קישור") },
      },
    },
  },
  footer: {
    type: "object",
    label: "⬇️ כותרת תחתונה",
    objectFields: {
      background: color("צבע רקע (ריק = הצבע הכהה)"),
      text: color("צבע טקסט"),
      tagline: textarea("משפט מתחת ללוגו"),
      showNav: yesNo("להציג קישורים"),
      showContact: yesNo("להציג פרטי קשר"),
      copyright: text("שורת זכויות ({year} = השנה)"),
    },
  },
  contact: {
    type: "object",
    label: "📞 פרטי קשר ו־SEO",
    objectFields: {
      siteName: text("שם האתר"),
      tagline: text("סלוגן"),
      phone: text("טלפון לחיוג (+972…)"),
      phoneDisplay: text("טלפון לתצוגה"),
      email: text("אימייל"),
      location: text("מיקום (גם למפה)"),
      hours: {
        type: "array",
        label: "שעות מענה",
        getItemSummary: (i: any) => i?.text || "שורה",
        defaultItemProps: { text: "" },
        arrayFields: { text: text("שורה") },
      },
      whatsappUrl: text("קישור וואטסאפ (https://wa.me/972…)"),
      showWhatsappButton: yesNo("כפתור וואטסאפ צף"),
      whatsappButtonColor: color("צבע כפתור הוואטסאפ"),
      facebookUrl: text("קישור לפייסבוק"),
      instagramUrl: text("קישור לאינסטגרם"),
      seoDescription: textarea("תיאור האתר לגוגל"),
    },
  },
  customCss: textarea("CSS מותאם אישית (מתקדם)"),
};
