import type { Page, SiteSettings, Story } from "./types";

/**
 * Site content, transcribed from the original site123 screenshots.
 *
 * This file is the system of record — no external CMS holds it. The Puck editor
 * at /editor composes pages from the same block types defined in types.ts.
 *
 * Slugs intentionally reuse the original Hebrew URLs so existing inbound links
 * and Google's index keep resolving after the DNS cutover.
 */

export const site: SiteSettings = {
  siteName: "פוטודוקותרפיה איתן אונר",
  tagline: "ריפוי והשראה דרך העדשה",
  phone: "+972547872228",
  phoneDisplay: "054-787-2228",
  email: "eitanuner@gmail.com",
  location: "תל יוסף, ישראל",
  hours: ["א׳–ה׳  08:00 – 21:00", "ו׳  07:00 – 16:00"],
  roles: [
    "צלם",
    "פוטודוקותרפיסט",
    "פוטותרפיה",
    "דוקותרפיה",
    "וידאותרפיה",
    "צילום חברתי",
    "לימוד צילום מהנייד",
  ],
  whatsappUrl: "https://wa.me/972547872228",
  nav: [
    { label: "בית", href: "/" },
    { label: "אודות", href: "/אודות" },
    { label: "הרגש אין לו סוף", href: "/הרגש-אין-לו-סוף" },
    { label: "ארגונים", href: "/ארגונים" },
    { label: "פסטיבל הצילום הבינלאומי", href: "/פסטיבל-הצילום-הבינלאומי" },
    {
      label: "עוד",
      href: "#",
      children: [
        { label: "חינוך וחינוך בלתי פורמלי", href: "/חינוך-וחינוך-בלתי-פורמלי" },
        { label: "פוטודוקותרפיה", href: "/פוטודוקותרפיה" },
        { label: "עדות 710", href: "/עדות-710" },
        { label: "הרצאות", href: "/הרצאות" },
        { label: "אממם יש לי שאלה", href: "/אממם-יש-לי-שאלה" },
        { label: "סיפורים מאחורי המצלמה", href: "/סיפורים-מאחורי-המצלמה" },
        { label: "תמונות לרכישה", href: "/תמונות-לרכישה" },
        { label: "תערוכות", href: "/תערוכות" },
        { label: "תיק עבודות", href: "/תיק-עבודות" },
        { label: "המלצות", href: "/המלצות" },
        { label: "לקוחות", href: "/לקוחות" },
        { label: "קהילת אור", href: "/קהילת-אור" },
        { label: "צרו קשר", href: "/צרו-קשר" },
      ],
    },
  ],
};

/* ----------------------------------------------------------------- images */

const img = {
  /**
   * The fold's full-bleed photograph. One of Eitan's own images, already used
   * in the gallery, now re-ingested from the 4288px original — chosen dark so
   * the display type reads over it without a heavy scrim.
   */
  heroBackdrop: {
    src: "/images/gallery-valley-dusk.webp",
    alt: "עמק בשעת דמדומים, אגם משקף את השמיים",
    width: 3200,
    height: 2125,
  },
  hero: {
    src: "/images/eitan-hero.webp",
    alt: "איתן אונר יושב בכורסה, קעקוע מצלמה על זרועו",
    width: 675,
    height: 657,
  },
  portrait: {
    src: "/images/eitan-portrait-bw.webp",
    alt: "דיוקן שחור-לבן של איתן אונר עם מצלמה",
    width: 519,
    height: 421,
  },
  crouching: {
    src: "/images/eitan-crouching.webp",
    alt: "איתן אונר כורע ומצלם על סלע",
    width: 498,
    height: 584,
  },
  crouchingAlt: {
    src: "/images/eitan-crouching-alt.webp",
    alt: "איתן אונר מצלם בשטח",
    width: 640,
    height: 640,
  },
  hands: {
    src: "/images/hands-circle.webp",
    alt: "ידיים של משתתפים נפגשות במרכז מעגל",
    width: 1051,
    height: 1400,
  },
  cameras: {
    src: "/images/cameras-flatlay.webp",
    alt: "מצלמות ניקון ואולימפוס מונחות על שולחן עץ",
    width: 907,
    height: 676,
  },
  memorial: {
    src: "/images/memorial-flag.webp",
    alt: "תיעוד טקס זיכרון לצד דגל ישראל",
    width: 1400,
    height: 788,
  },
  sculpture: {
    src: "/images/sculpture-lawn.webp",
    alt: "פסלים על מדשאה מול מבנה",
    width: 1400,
    height: 930,
  },
};

const storyImg = {
  photoSalam: { src: "/images/stories/photo-salam.webp", alt: "משתתפים מושיטים ידיים זה לזה סביב שולחן פיקניק", width: 759, height: 879 },
  cemetery: { src: "/images/stories/cemetery.webp", alt: "תיעוד בבית עלמין לצד דגל ישראל", width: 756, height: 879 },
  organizations: { src: "/images/stories/organizations.webp", alt: "צללי ידיים מושטות על משטח לבן", width: 756, height: 879 },
  nataraj: { src: "/images/stories/nataraj.webp", alt: "מצלמת וידאו ותאורה בפסטיבל", width: 759, height: 879 },
  shukri: { src: "/images/stories/shukri.webp", alt: "דיוקן שחור-לבן של שוקרי אבו חסן", width: 756, height: 909 },
  mefuneiGader: { src: "/images/stories/mefunei-gader.webp", alt: "ידיים אוחזות בעדשת מצלמה בתקריב", width: 756, height: 909 },
  beitEkstein: { src: "/images/stories/beit-ekstein.webp", alt: "מפגש קבוצה סביב שולחן", width: 759, height: 909 },
  maasAkim: { src: "/images/stories/maas-akim.webp", alt: "קלפי תמונות פרוסים על הרצפה", width: 759, height: 909 },
};

const gallery = [
  { src: "/images/gallery-sunflower.webp", alt: "חמנייה בתקריב", width: 719, height: 719 },
  { src: "/images/gallery-palms-dusk.webp", alt: "דקלים בשקיעה מול עננים", width: 1600, height: 1200 },
  { src: "/images/gallery-poppies.webp", alt: "שדה כלניות אדומות ועץ", width: 1080, height: 719 },
  { src: "/images/gallery-white-dress.webp", alt: "נערה בשמלה לבנה על שפת המים", width: 1600, height: 1066 },
  { src: "/images/gallery-white-dress-2.webp", alt: "נערה בשמלה לבנה יושבת על סלע", width: 1112, height: 1600 },
  { src: "/images/gallery-valley-dusk.webp", alt: "שקיעה מעל אגם בעמק", width: 1600, height: 1063 },
  { src: "/images/gallery-nofyam-wall.webp", alt: "קיר I LOVE NOF YAM במרכז הקהילתי", width: 1200, height: 1600 },
  { src: "/images/gallery-nofyam-sea.webp", alt: "מיצב צילומי ים במסדרון", width: 1200, height: 1600 },
  { src: "/images/gallery-sea-cliffs.webp", alt: "מצוקי חוף וים כחול", width: 1240, height: 923 },
  { src: "/images/gallery-iris.webp", alt: "אירוס סגול בתקריב", width: 1600, height: 1143 },
  { src: "/images/gallery-deadsea.webp", alt: "פיצוץ במי ים המלח", width: 1600, height: 1079 },
  { src: "/images/gallery-white-flower.webp", alt: "פרח לבן בתקריב", width: 1063, height: 1600 },
];

const clientLogos = [
  { src: "/images/clients/akim.webp", alt: "אקים" },
  { src: "/images/clients/beit-ekstein.webp", alt: "בית אקשטיין" },
  { src: "/images/clients/enosh.webp", alt: "אנוש — העמותה הישראלית לבריאות הנפש" },
  { src: "/images/clients/photo-israel.webp", alt: "PHOTO IS:RAEL" },
  { src: "/images/clients/emek-hamaayanot.webp", alt: "מועצה אזורית עמק המעיינות" },
  { src: "/images/clients/nof-yam.webp", alt: "נוף ים פיתוח — מרכזים קהילתיים הרצליה" },
  { src: "/images/clients/tel-yosef.webp", alt: "תל יוסף — הבית שלי" },
  { src: "/images/clients/naale.webp", alt: "Naale for Naale" },
  { src: "/images/clients/edut-710.webp", alt: "עדות 710" },
  { src: "/images/clients/galil-tachton.webp", alt: "המועצה האזורית הגליל התחתון" },
  { src: "/images/clients/misrad-harevacha.webp", alt: "משרד הרווחה והביטחון החברתי" },
  { src: "/images/clients/kehilat-or.webp", alt: "קהילת אור" },
  { src: "/images/clients/nataraj.webp", alt: "פסטיבל נאטראז׳" },
];

/* ------------------------------------------------------------- lecture set */

const lectureCards = [
  {
    title: "דיוקנו של רגש",
    image: img.crouching,
    body:
      "הצמיחה מתוך החושך – דלקת במוח. שינוי תעסוקתי בגיל 45. אז מי אני ולמה באתי לפה? " +
      "פוטודוקותרפיסט בוגר מכללת תל חי – לימודי חוץ במוזיאון ארץ ישראל, צילום חברתי " +
      "PHOTO IS:RAEL, צלם וידאו ומראיין בעדות 710, ליווי משפחות בשעתן הקשה, התנדבות וחלק " +
      "בהקמת קהילת אור לנפגעי ראש ומשפחותיהם, קבוצות פוטודוקותרפיה ממגוון חלקי החברה " +
      "הישראלית, השתתפות בתערוכות.",
  },
  {
    title: "מתוך ההרצאה דיוקן של רגש",
    image: img.cameras,
    body:
      "הקרבה של אח למען אח ברגעים הכי קשים של חייו — לשכב על כל גדר, באשר היא, בשעה בה " +
      "חברים וקרובים אחרים קופצים הרחק מהספינה הטובעת.",
  },
  {
    title: "לראות את האור",
    image: img.hands,
    body:
      "תמיד לשאוף למעלה — להושיט יד לאחר, להתרגש, להתנדב, לכבד, להודות, להאמין, לעשות. " +
      "לעולם לא נדע מול מי אנו עומדים וכמה יכולים אנו באמת לתרום לו, לכל החיים.",
  },
];

const edutCards = [
  {
    title: "עדה מעוטף עזה",
    image: img.memorial,
    body:
      "אני צלם מתנדב בארגון עדות 710. הארגון הוקם על ידי מתנדבים ומתנדבות, אנשי ונשות " +
      "הקולנוע הדוקומנטרי והמחקר ההיסטורי, במטרה לתעד את עדויות השורדים.",
  },
  {
    title: "עד מעוטף עזה",
    image: img.crouchingAlt,
    body:
      "לאחר כ-20 שעות חילצו אותנו. הלכנו 800 מטר בשעה. כל מספר צעדים נשכבנו, " +
      "והלוחמים ניהלו קרבות ירי מעל ראשנו.",
  },
  {
    title: "עדות 710 — משפחה מהעוטף",
    image: img.sculpture,
    body:
      "נפלה בחלקי הזכות לתעד, לצלם וידאו ולקחת חלק בפרויקט העצום וכל כך חשוב של עדות 710.",
  },
];

/* ------------------------------------------------------------------ stories */

export const stories: Story[] = [
  {
    slug: "photo-is-rael-photo-salam",
    title: "PHOTO IS-RAEL PHOTO SALAM",
    date: "14 בנובמבר",
    image: storyImg.photoSalam,
    body: [
      "מפגש רב תרבותי במזרע לגילאי 18.",
      "בתוכנית לימוד צילום בנושא אחדות.",
      "מחזור נוסף נפתח במשגב לכיתות ו׳.",
      "הפרויקט עובד במועצות נוספות.",
    ],
    links: [{ label: "photoisrael.org/photo-salam", href: "https://photoisrael.org/photo-salam" }],
    tags: ["איתן אונר", "פוטודוקותרפיה", "פוטוישראל", "פוטוסלאם"],
  },
  {
    slug: "צילום-תיעודי-בית-עלמין",
    title: "צילום תיעודי בית עלמין",
    date: "18 במאי",
    image: storyImg.cemetery,
    body: [
      "צילום בהלוויה, אזכרה.",
      "ברגעים הכי קשים בהם נפרדים אנו מאדם קרוב, אין אנו שמים צימת לב או רוצים להתעסק בנושא רגיש זה.",
      "תיעוד בבית העלמין, הטקס, הפרידה, הנחת זרים, הספדים.",
      "תיעוד זה מקנה לנו מזכרת יקרה מפז, בה יכולים אנו גם שנים לאחר מכן להיזכר.",
    ],
    tags: ["תיעוד", "פרידה", "שכול", "צילום"],
  },
  {
    slug: "ארגוני-עובדים-שונים",
    title: "ארגוני עובדים שונים",
    date: "28 במרץ",
    image: storyImg.organizations,
    body: [
      "עבודה עם אנשי הוראה, חינוך בלתי פורמלי או בארגונים שונים.",
      "סדנאות וחוגי פוטותרפיה, בין שעה לארבע שעות.",
    ],
    tags: [
      "סדנאות",
      "פוטותרפיה",
      "חוג",
      "צילום",
      "חוויה",
      "חוויתי",
      "טיפול",
      "הוראה",
      "מורים",
      "מורות",
      "תלמידים",
      "חינוך בלתי פורמלי",
    ],
  },
  {
    slug: "בית-אקשטיין",
    title: "בית אקשטיין",
    date: "27 במרץ",
    image: storyImg.beitEkstein,
    body: ["פוטודוקותרפיה.", "צילום תיעודי באירועים שונים."],
    tags: ["פוטודוקותרפיה", "בית אקשטיין", "תיעוד"],
  },
  {
    slug: "מעש-אקים",
    title: "מעש אקים",
    date: "27 במרץ",
    image: storyImg.maasAkim,
    body: [
      "פוטודוקותרפיה — חוג שבועי של שעתיים בו לומדים המשתתפים להביע את אשר על ליבם דרך " +
        "קלפי תמונות מקוריים, שיצרתי יחד עם עוד שותפות ושותף ללימודי במוזיאון ארץ ישראל, " +
        "לימודי החוץ של תל חי. התמונות מדברות ומדובבות את רגשותינו.",
    ],
    tags: ["פוטודוקותרפיה", "אקים", "קלפי תמונות"],
  },
  {
    slug: "פוטודוקותרפיה-עם-מפוני-גדר",
    title: "פוטודוקותרפיה עם מפוני גדר מישובי הצפון",
    image: storyImg.mefuneiGader,
    body: [
      "פוטודוקותרפיה בקבוצות גיל שונות למפוני ישובי הגדר מצפון הארץ, ובקהילות בעוטף עזה.",
    ],
    tags: ["פוטודוקותרפיה", "מפונים", "צפון"],
  },
  {
    slug: "תיעוד-שוקרי-אבו-חסן",
    title: "תיעוד — שוקרי אבו חסן",
    image: storyImg.shukri,
    body: ["בגיל 26 למדתי בבית ספר תדמור, ולאחר מכן עבדתי בענף המלונאות במלון פלזה."],
    tags: ["תיעוד", "סיפור חיים"],
  },
  {
    slug: "פסטיבל-נאטראז",
    title: "פסטיבל נאטראז׳",
    image: storyImg.nataraj,
    body: ["צילום ותיעוד בפסטיבל נאטראז׳."],
    tags: ["פסטיבל", "תיעוד", "נאטראז׳"],
  },
];

const storyCards = stories.map((s) => ({
  title: s.title,
  image: s.image,
  href: `/סיפורים-מאחורי-המצלמה/${s.slug}`,
  linkLabel: "קרא עוד",
}));

/* ------------------------------------------------------------ testimonials */

const testimonials = [
  {
    quote:
      "יופי שהבאת אותו, היה מעניין, מרגש, רלוונטי.\nמדהים איך מסע הנשמע מוביל אותנו ליעוד שלנו.\n" +
      "הוא עוד יעשה הרבה טוב בעולם.",
    author: "מעגלי תעסוקה",
    role: "משתתפת בהרצאה מטעם לשכת התעסוקה",
    rating: 5,
  },
  {
    quote:
      "אם לומר את האמת — לא הייתי מוכנה להשראה שכזו היום. רציתי להודות שזה היה כל כך מדויק, " +
      "ואשמח גם שתשתפי אותן. מהיכרות אישית הזדהיתי מאוד עם הדרך שתיאר, ונגע לנו במקומות " +
      "הכואבים והרגישים, המודעים והפחות מודעים. עלו שוב ספקות ושאלות שאנחנו מעלים בהתמודדות " +
      "עם החיים שאחרי, רגשות ומחשבות של החיים לפני ואחרי, והתבוננות ולמידה על עצמי בפרט. " +
      "כל כך חשוב השיתוף הזה! תודה על ההשראה והכוח.",
    author: "משתתפת בסדנת זום, מעגלי תעסוקה",
    rating: 5,
  },
];

/* -------------------------------------------------------------------- pages */

export const pages: Page[] = [
  /* ---------------------------------------------------------------- home */
  {
    slug: "/",
    title: "פוטודוקותרפיה",
    seoDescription:
      "איתן אונר — צלם ופוטודוקותרפיסט. סדנאות פוטודוקותרפיה, פוטותרפיה, וידאותרפיה, " +
      "צילום חברתי, הרצאות ותיעוד. ריפוי והשראה דרך העדשה.",
    blocks: [
      {
        _type: "hero",
        title: "פוטודוקותרפיה",
        image: img.hero,
        backdrop: img.heroBackdrop,
        imageSide: "end",
        background: "brand",
        ctas: [
          { label: "על פוטותרפיה", href: "/פוטודוקותרפיה", tone: "solidWhite" },
          { label: "לרכישת תמונות", href: "/תמונות-לרכישה", tone: "outlineWhite" },
        ],
      },
      {
        _type: "textImage",
        title: "ריפוי והשראה דרך העדשה",
        eyebrow: "תרפיה אמנותית",
        image: img.hands,
        imageSide: "end",
        body: [],
        ctas: [
          { label: "סיפורים מאחורי המצלמה", href: "/סיפורים-מאחורי-המצלמה", tone: "solid" },
          { label: "תערוכות", href: "/תערוכות", tone: "outline" },
        ],
      },
      {
        _type: "textImage",
        title: "פוטודוקותרפיה",
        image: img.cameras,
        imageSide: "end",
        body: [
          "חוויה סוחפת במנעד של רגשות.",
          "הפתיחות בפני החברים גורמת לאחר לשתף את היקר לו מכל.",
        ],
        ctas: [{ label: "קרא עוד", href: "/פוטודוקותרפיה", tone: "outline" }],
      },
      {
        _type: "quote",
        quote: "״אתה לא רק מצלם תמונה – אתה יוצר אותה״",
        attribution: "אנסל אדמס",
        ctas: [
          { label: "תמונות לרכישה", href: "/תמונות-לרכישה", tone: "outlineWhite" },
          { label: "להתרשמות בפורטפוליו", href: "/תיק-עבודות", tone: "outlineWhite" },
        ],
      },
      {
        _type: "cardGrid",
        title: "סיפורים מאחורי המצלמה",
        cards: storyCards.slice(0, 4),
        columns: 4,
        variant: "plain",
      },
      {
        _type: "cardGrid",
        title: "עדות 710",
        cards: edutCards,
        columns: 3,
        variant: "overlay",
        background: "brand",
      },
      {
        _type: "cardGrid",
        title: "הרצאות",
        cards: lectureCards,
        columns: 3,
        variant: "overlay",
      },
      { _type: "testimonials", title: "המלצות", items: testimonials },
      { _type: "logos", title: "לקוחות", logos: clientLogos },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* --------------------------------------------------------------- about */
  {
    slug: "אודות",
    title: "אודות",
    showTitleBanner: true,
    seoDescription:
      "נעים מאוד, אני איתן אונר — צלם ופוטודוקותרפיסט, יליד קיבוץ תל יוסף.",
    blocks: [
      {
        _type: "textImage",
        image: img.portrait,
        imageSide: "end",
        body: [
          "נעים מאוד, אני איתן אונר. יליד קיבוץ תל יוסף.",
          "את המצלמה הראשונה שלי (ניקון כמובן) קיבלתי בעלייה לתורה בגיל 13 מאבא שלי, מרקו " +
            "אונר, שגם הוא היה צלם שנים רבות. מאז יש לי סימביוזה מושלמת עם צילום, תופס רגעים " +
            "מרגשים ועמוקים.",
          "לאורך שנות עבודתי המצלמה הלכה איתי לכל מקום, אפילו התגייסנו יחדיו ונהייתי לצלם " +
            "צבאי של דובר צה״ל.",
          "עד היום אנו הולכים יחד.",
        ],
        ctas: [
          { label: "קרא עוד", href: "#עוד-עלי", tone: "solid" },
          { label: "אממם יש לי שאלה", href: "/אממם-יש-לי-שאלה", tone: "outline" },
        ],
      },
      {
        _type: "richText",
        body: [
          "ב-2014 חליתי ונפגעתי מבחינה מוחית, קוגניטיבית ועוד. במהלך שיקום ממושך, שבעקבותיו " +
            "חזרתי לטפח את אהבתי הישנה – הצילום, סיימתי לימודי פוטודוקותרפיה במוזיאון ארץ " +
            "ישראל – לימודי חוץ של מכללת תל חי.",
          "הלימודים לקחו אותי למסע מרגש ומלא ברבדים של תובנות סביב הצילום ונפש האדם. מה שגרם " +
            "לי לפתח את סדנאות הפוטודוקותרפיה שאותן אני מנחה עם קבוצות שונות של אנשים.",
          "למדתי הכשרת מנחים של **PHOTO IS:VOICE** דרך **PHOTO IS:RAEL**.",
          "היום אני עוסק בצילום ובהנחיית קבוצות.",
          "מלווה ומתעד תהליכי פרידה ושכול.",
          "אני מזמין אתכם להתרשם מעבודותיי.",
          "המפגשים והתמיכה מהקהילה מחזקים את עבודותיי ותרומתי לקהילה בכלל.",
          "פוטודוקותרפיה בקבוצות גיל שונות למפוני ישובי הגדר מצפון הארץ ובקהילות בעוטף עזה.",
          "שותף בפרויקט **עדות 710** – תיעוד השורדים, הן בעוטף והן בישובים הגדולים ובמסיבת נובה.",
          "ליוויתי קבוצות מתמודדי נפש באנוש, בית אקשטיין, אקים, נוער נעלה, משפחות ניצולי שואה, " +
            "משפחות מעוטף עזה, וקבוצות בארגונים שונים. דרך עבודה עם צילום הפקנו סרטים ועבדנו " +
            "עם קלפי תמונות מגוונות.",
          "זכיתי ללוות משפחה שביקשה לתעד את היקר מכל, ודרכה האחרונה של ילדתם שחלתה בסרטן.",
          "וכמובן — ללוות גם שמחות!",
        ],
        background: "alt",
        maxWidth: "narrow",
      },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* ----------------------------------------------------- photodocutherapy */
  {
    slug: "פוטודוקותרפיה",
    title: "פוטודוקותרפיה",
    showTitleBanner: true,
    seoDescription:
      "סדנאות פוטודוקותרפיה, פוטותרפיה, וידאותרפיה ודוקותרפיה — עבודה עם כלל האוכלוסיות, " +
      "ללא צורך בניסיון קודם בצילום.",
    blocks: [
      {
        _type: "richText",
        body: [
          "עבודה עם כלל האוכלוסיות — אדפטיבי ואינטואיטיבי על פי הקבוצה וחתך הגיל של הקבוצה.",
          "**סדנאות פוטודוקותרפיה:** מפגשים עם ודרך עולם הצילום. אין צורך בניסיון קודם, " +
            "מספיקה המצלמה של מכשיר הנייד. לימוד דגשי צילום ומשימות צילום, תוך כדי נגיעות " +
            "והיפתחות לעולם הרגש החבוי בקרבנו, תוך כדי שימוש בסביבה בה אנו נמצאים.",
          "**וידאותרפיה** — נפיק סרט יחד.",
          "**פוטותרפיה** — ניגע ברגשותינו דרך התמונה.",
          "**דוקותרפיה** — נעז לעשות סרט על היקר לנו ביותר.",
          "השימוש בצילום עוקף את ההגנות באופן יצירתי וחווייתי, ומאפשר לנו שיתוף לא שיפוטי. " +
            "בחירת קלף של תמונה — מה מספר? ניגע ברגשותינו דרך המדיה, נעז ונגיב גם לאחר " +
            "וכמובן לעצמנו, וכל זאת בעיניים לא שיפוטיות!",
          "הצטרפו לחוויה סוחפת! אין צורך בהבנה בצילום.",
          "**חוויתי, מרגש, מבדר, משחרר, חושף, נותן לי את המקום הבטוח.**",
        ],
        maxWidth: "narrow",
      },
      {
        _type: "gallery",
        images: gallery.slice(6, 12),
        background: "alt",
      },
      {
        _type: "quote",
        quote: "״אתה לא רק מצלם תמונה – אתה יוצר אותה״",
        attribution: "אנסל אדמס",
      },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* -------------------------------------------------------------- festival */
  {
    slug: "פסטיבל-הצילום-הבינלאומי",
    title: "פסטיבל הצילום הבינלאומי",
    showTitleBanner: true,
    seoDescription:
      "פסטיבל הצילום הבינלאומי ה-12 — תוכנית שנתית ראשונה ללימודי צילום חברתי ב-PHOTO IS:RAEL.",
    blocks: [
      {
        _type: "video",
        body: [
          "פסטיבל הצילום הבינלאומי ה-12",
          "תוכנית שנתית ראשונה ללימודי צילום חברתי ב-PHOTO IS:RAEL",
        ],
        youtubeUrl: "https://www.youtube.com/watch?v=6qY1sUxQMFI",
        background: "brand",
      },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* ------------------------------------------------------------ edut 710 */
  {
    slug: "עדות-710",
    title: "עדות 710",
    showTitleBanner: true,
    seoDescription: "צלם וידאו ומראיין מתנדב בפרויקט עדות 710 — תיעוד עדויות השורדים.",
    blocks: [
      {
        _type: "cardGrid",
        cards: edutCards,
        columns: 3,
        variant: "overlay",
        background: "brand",
      },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* ------------------------------------------------------------- lectures */
  {
    slug: "הרצאות",
    title: "הרצאות",
    showTitleBanner: true,
    seoDescription:
      "הרצאות של איתן אונר — ״דיוקנו של רגש״, ״לראות את האור״. צילום חברתי, ריפוי, תקווה.",
    blocks: [
      { _type: "cardGrid", cards: lectureCards, columns: 3, variant: "overlay" },
      { _type: "testimonials", title: "המלצות", items: testimonials },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* -------------------------------------------------------------- stories */
  {
    slug: "סיפורים-מאחורי-המצלמה",
    title: "סיפורים מאחורי המצלמה",
    showTitleBanner: true,
    seoDescription: "סיפורים, פרויקטים ותיעוד מאחורי המצלמה של איתן אונר.",
    blocks: [
      { _type: "cardGrid", cards: storyCards, columns: 4, variant: "plain" },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* ------------------------------------------------------------ kehilat or */
  {
    slug: "קהילת-אור",
    title: "קהילת אור",
    showTitleBanner: true,
    seoDescription:
      "קהילת אור — קהילת עמיתים לאנשים עם פגיעה מוחית ומשפחותיהם.",
    blocks: [
      {
        _type: "textImage",
        image: img.crouchingAlt,
        imageSide: "end",
        body: [
          "קהילת אור — לאנשים עם פגיעה מוחית ומשפחותיהם.",
          "אני שמח לקחת חלק בהקמת ״קהילת אור״. הקהילה מאגדת אנשים שעברו פגיעה מוחית במהלך " +
            "ולאחר תוכנית השיקום.",
          "מטרת הקהילה — ליצור קהילת עמיתים, שתסייע לחבריה להשתלב במעגל המשפחתי, החברתי " +
            "והתעסוקתי.",
          "הקמנו קבוצת פייסבוק שמטרתה להוות מרחב לשיתוף מידע מקצועי ומידע המבוסס על ניסיון " +
            "אישי, הכולל: זכויות סוציאליות ותעסוקה, שיתוף בהליך השיקום, ומתן ייעוץ ותמיכה.",
          "אם עברתם פגיעה מוחית, או אתם מתנדבים שרוצים לסייע לקהילת אור — ברוכים הבאים " +
            "לקהילה! לעיתים חיינו מורכבים, אך לפחות נתמודד בקשיים אלו יחדיו.",
          "**״לעיתים צריכים רק אור קטן בשביל לעשות שינוי גדול״**",
          "תחילת פעילות רשמית (אירוע חשיפת קהילה) — 14.6.2023",
        ],
      },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* --------------------------------------------------------- organisations */
  {
    slug: "ארגונים",
    title: "ארגונים",
    showTitleBanner: true,
    seoDescription:
      "עבודה עם ארגונים — אנוש, בית אקשטיין, אקים, נוער נעלה, עדות 710, רשויות מקומיות ועוד.",
    blocks: [
      {
        _type: "richText",
        body: [
          "עבודה עם ארגונים, רשויות מקומיות ועמותות — סדנאות פוטודוקותרפיה, ליווי קבוצות, " +
            "תיעוד אירועים והפקת סרטים.",
          "ליוויתי קבוצות מתמודדי נפש באנוש, בית אקשטיין, אקים, נוער נעלה, משפחות ניצולי " +
            "שואה, משפחות מעוטף עזה, וקבוצות בארגונים שונים.",
          "סדנאות וחוגי פוטותרפיה, בין שעה לארבע שעות, מותאמים לקבוצה ולחתך הגיל.",
        ],
        maxWidth: "narrow",
      },
      { _type: "logos", title: "לקוחות", logos: clientLogos },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* --------------------------------------------------------------- clients */
  {
    slug: "לקוחות",
    title: "לקוחות",
    showTitleBanner: true,
    seoDescription: "הארגונים, הרשויות והעמותות שאיתן אונר עבד איתם.",
    blocks: [
      { _type: "logos", logos: clientLogos },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* ---------------------------------------------------------- testimonials */
  {
    slug: "המלצות",
    title: "המלצות",
    showTitleBanner: true,
    seoDescription: "מה אומרים משתתפי הסדנאות וההרצאות של איתן אונר.",
    blocks: [
      { _type: "testimonials", items: testimonials },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* --------------------------------------------------------------- gallery */
  {
    slug: "תמונות-לרכישה",
    title: "תמונות לרכישה",
    showTitleBanner: true,
    seoDescription: "תמונות מקוריות של איתן אונר, זמינות לרכישה והדפסה.",
    blocks: [
      {
        _type: "richText",
        body: [
          "התמונות זמינות לרכישה בהדפסה איכותית, בגדלים שונים. " +
            "מוזמנים ליצור קשר לגבי גודל, מסגור ומשלוח.",
        ],
        align: "center",
        maxWidth: "narrow",
      },
      { _type: "gallery", images: gallery },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* -------------------------------------------------------------- portfolio */
  {
    slug: "תיק-עבודות",
    title: "תיק עבודות",
    showTitleBanner: true,
    seoDescription: "תיק העבודות של איתן אונר — פורטרטים, נוף, טבע, תיעוד וצילום חברתי.",
    blocks: [
      { _type: "gallery", images: gallery },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* ------------------------------------------------------------ exhibitions */
  {
    slug: "תערוכות",
    title: "תערוכות",
    showTitleBanner: true,
    seoDescription: "תערוכות ומיצבי צילום של איתן אונר.",
    blocks: [
      {
        _type: "richText",
        body: [
          "מיצבי צילום ותערוכות במרכזים קהילתיים, מוסדות ציבור ופסטיבלים.",
          "בין היתר — מיצב הצילום במרכז הקהילתי נוף ים, הרצליה.",
        ],
        align: "center",
        maxWidth: "narrow",
      },
      { _type: "gallery", images: [gallery[6], gallery[7], gallery[8]] },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* --------------------------------------------------------------- education */
  {
    slug: "חינוך-וחינוך-בלתי-פורמלי",
    title: "חינוך וחינוך בלתי פורמלי",
    showTitleBanner: true,
    seoDescription:
      "סדנאות וחוגי פוטודוקותרפיה במערכת החינוך ובחינוך הבלתי פורמלי.",
    blocks: [
      {
        _type: "richText",
        body: [
          "עבודה עם אנשי הוראה, חינוך בלתי פורמלי או בארגונים שונים.",
          "סדנאות וחוגי פוטותרפיה, בין שעה לארבע שעות.",
          "לימוד צילום מהנייד — אין צורך בציוד מקצועי, מספיקה המצלמה שבכיס.",
          "עבודה עם קלפי תמונות מקוריים, שיצרתי יחד עם שותפים ללימודיי במוזיאון ארץ ישראל, " +
            "לימודי החוץ של מכללת תל חי.",
        ],
        maxWidth: "narrow",
      },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* ------------------------------------------------------- feeling has no end */
  {
    slug: "הרגש-אין-לו-סוף",
    title: "הרגש אין לו סוף",
    showTitleBanner: true,
    seoDescription:
      "הרגש אין לו סוף — צילום, ריפוי ותיעוד רגעים מרגשים ועמוקים.",
    blocks: [
      {
        _type: "textImage",
        image: img.hands,
        imageSide: "end",
        body: [
          "חוויה סוחפת במנעד של רגשות.",
          "הפתיחות בפני החברים גורמת לאחר לשתף את היקר לו מכל.",
          "השימוש בצילום עוקף את ההגנות באופן יצירתי וחווייתי, ומאפשר לנו שיתוף לא שיפוטי.",
        ],
        ctas: [{ label: "קרא עוד", href: "/פוטודוקותרפיה", tone: "outline" }],
      },
      { _type: "gallery", images: gallery.slice(0, 6), background: "alt" },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* ------------------------------------------------------------------- faq */
  {
    slug: "אממם-יש-לי-שאלה",
    title: "אממם יש לי שאלה",
    showTitleBanner: true,
    seoDescription: "שאלות נפוצות על סדנאות פוטודוקותרפיה, הרצאות ותיעוד.",
    blocks: [
      {
        _type: "richText",
        body: [
          "**צריך לדעת לצלם?** ממש לא. אין צורך בניסיון קודם ואין צורך בהבנה בצילום — " +
            "מספיקה המצלמה של מכשיר הנייד.",
          "**למי הסדנאות מתאימות?** לכלל האוכלוסיות. הסדנה אדפטיבית ואינטואיטיבית, ומותאמת " +
            "על פי הקבוצה וחתך הגיל שלה.",
          "**כמה זמן נמשכת סדנה?** בין שעה לארבע שעות, בהתאם לקבוצה ולמטרה. יש גם חוגים " +
            "שבועיים מתמשכים.",
          "**מה עושים בסדנה?** לומדים דגשי צילום ומשימות צילום, עובדים עם קלפי תמונות, " +
            "ומגיעים דרכם לשיתוף לא שיפוטי ברגש.",
          "**אפשר סדנה בזום?** כן. חלק מהסדנאות וההרצאות מועברות גם באונליין.",
          "יש שאלה שלא מופיעה כאן? מוזמנים ליצור קשר — אשמח לענות.",
        ],
        maxWidth: "narrow",
      },
      { _type: "contact", title: "צרו קשר" },
    ],
  },

  /* --------------------------------------------------------------- contact */
  {
    slug: "צרו-קשר",
    title: "צרו קשר",
    showTitleBanner: true,
    seoDescription:
      "צרו קשר עם איתן אונר — תל יוסף, 054-787-2228, eitanuner@gmail.com",
    blocks: [{ _type: "contact" }],
  },
];

export function getPage(slug: string): Page | undefined {
  return pages.find((p) => p.slug === slug);
}

export function getStory(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}
