import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-500">404</p>
        <h1 className="mt-6 text-2xl font-bold text-ink sm:text-3xl">
          הדף הזה לא נמצא
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          ייתכן שהכתובת השתנתה, או שהדף הוסר. אפשר לחזור לדף הבית ולהמשיך משם.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center border border-brand-500 bg-brand-500 px-6 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-700"
          >
            לדף הבית
          </Link>
          <Link
            href="/צרו-קשר"
            className="inline-flex min-h-11 items-center border border-brand-400 px-6 py-2.5 text-[15px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            צרו קשר
          </Link>
        </div>
      </div>
    </div>
  );
}
