/**
 * The images available to the editor.
 *
 * A real media library (upload → object storage) is the obvious next step; this
 * list is what makes the spike usable today without one, and it is the seam that
 * an uploader would slot into.
 */
export const IMAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "איתן — כורסה (ראשי)", value: "/images/eitan-hero.webp" },
  { label: "איתן — דיוקן שחור-לבן", value: "/images/eitan-portrait-bw.webp" },
  { label: "איתן — כורע ומצלם", value: "/images/eitan-crouching.webp" },
  { label: "איתן — מצלם בשטח", value: "/images/eitan-crouching-alt.webp" },
  { label: "ידיים במעגל", value: "/images/hands-circle.webp" },
  { label: "מצלמות על שולחן", value: "/images/cameras-flatlay.webp" },
  { label: "טקס זיכרון ודגל", value: "/images/memorial-flag.webp" },
  { label: "פסלים על מדשאה", value: "/images/sculpture-lawn.webp" },
  { label: "גלריה — חמנייה", value: "/images/gallery-sunflower.webp" },
  { label: "גלריה — דקלים בשקיעה", value: "/images/gallery-palms-dusk.webp" },
  { label: "גלריה — שדה כלניות", value: "/images/gallery-poppies.webp" },
  { label: "גלריה — שמלה לבנה", value: "/images/gallery-white-dress.webp" },
  { label: "גלריה — שמלה לבנה 2", value: "/images/gallery-white-dress-2.webp" },
  { label: "גלריה — שקיעה בעמק", value: "/images/gallery-valley-dusk.webp" },
  { label: "גלריה — קיר נוף ים", value: "/images/gallery-nofyam-wall.webp" },
  { label: "גלריה — מיצב ים", value: "/images/gallery-nofyam-sea.webp" },
  { label: "גלריה — מצוקי חוף", value: "/images/gallery-sea-cliffs.webp" },
  { label: "גלריה — אירוס", value: "/images/gallery-iris.webp" },
  { label: "גלריה — ים המלח", value: "/images/gallery-deadsea.webp" },
  { label: "גלריה — פרח לבן", value: "/images/gallery-white-flower.webp" },
  { label: "סיפור — פוטוסלאם", value: "/images/stories/photo-salam.webp" },
  { label: "סיפור — בית עלמין", value: "/images/stories/cemetery.webp" },
  { label: "סיפור — ארגונים", value: "/images/stories/organizations.webp" },
  { label: "סיפור — נאטראז׳", value: "/images/stories/nataraj.webp" },
  { label: "סיפור — שוקרי", value: "/images/stories/shukri.webp" },
  { label: "סיפור — מפוני גדר", value: "/images/stories/mefunei-gader.webp" },
  { label: "סיפור — בית אקשטיין", value: "/images/stories/beit-ekstein.webp" },
  { label: "סיפור — מעש אקים", value: "/images/stories/maas-akim.webp" },
];

export const CLIENT_LOGOS = [
  "akim",
  "beit-ekstein",
  "enosh",
  "photo-israel",
  "emek-hamaayanot",
  "nof-yam",
  "tel-yosef",
  "naale",
  "edut-710",
  "galil-tachton",
  "misrad-harevacha",
  "kehilat-or",
  "nataraj",
].map((n) => ({ label: n, value: `/images/clients/${n}.webp` }));
