import { notFound } from "next/navigation";
import { Blocks } from "@/components/blocks";
import { getPageBySlug } from "@/lib/fetch";
import { CtaRow } from "@/components/ui";

export default async function HomePage() {
  const page = await getPageBySlug("/");
  if (!page) notFound();
  return (
    <>
      <section className="bg-surface px-5 py-9 sm:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold text-brand-700">איתן אונר · צילום, רגש ומפגש</p>
          <h1 className="text-[clamp(2rem,5vw,3.75rem)] text-ink">סדנאות פוטודוקותרפיה והרצאות</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">לקבוצות, לארגונים ולאנשי חינוך. מתבוננים, מצלמים ומשתפים — אין צורך בניסיון בצילום.</p>
          <CtaRow align="center" ctas={[
            { label: "לתיאום סדנה או הרצאה", href: "/צרו-קשר" },
            { label: "לגלות את הסדנאות", href: "/פוטודוקותרפיה", tone: "outline" },
          ]} />
          <a href="#הסיפור" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 underline underline-offset-4">להיכנס לסיפור דרך התמונות ↓</a>
        </div>
      </section>
      <Blocks blocks={page.blocks} />
    </>
  );
}
