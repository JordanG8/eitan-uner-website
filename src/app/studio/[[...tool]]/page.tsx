import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { sanityEnabled } from "@/sanity/env";

/**
 * The Studio is served from the site itself, so Eitan has one address to remember
 * and one login — no separate app to install.
 */

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityEnabled) {
    return (
      <div dir="rtl" style={{ padding: "3rem", fontFamily: "system-ui", lineHeight: 1.8 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>מערכת התכנים עוד לא חוברה</h1>
        <p style={{ marginTop: "1rem", maxWidth: "40rem" }}>
          כדי להפעיל את ממשק העריכה יש להגדיר את משתני הסביבה{" "}
          <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> ו־<code>NEXT_PUBLIC_SANITY_DATASET</code>.
          עד אז האתר מוצג מתוך התוכן הקבוע שבקוד, ופועל כרגיל.
        </p>
      </div>
    );
  }
  return <NextStudio config={config} />;
}
