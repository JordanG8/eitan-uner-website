import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 404.
 *
 * This page had never been through the redesign. It was still on the old
 * language in every respect — a turquoise slab button, a turquoise-outlined
 * second button, `text-[15px]`, `text-6xl` and `font-bold` headings — which
 * is to say it was a page from a different site that a reader reaches by
 * making one typo. Now it is the same site: paper, ink, the display step, and
 * the two button tones everything else uses.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-paper px-6 py-20 lg:px-10">
      <div className="mx-auto w-full max-w-(--container-content)">
        <p className="text-display font-light text-ink-faint tabular-nums">404</p>
        <h1 className="mt-8 text-rise font-medium text-ink">הדף הזה לא נמצא</h1>
        <p className="mt-4 max-w-(--container-text) text-lede text-ink-soft">
          ייתכן שהכתובת השתנתה, או שהדף הוסר. אפשר לחזור לדף הבית ולהמשיך משם.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">לדף הבית</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/צרו-קשר">צרו קשר</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
