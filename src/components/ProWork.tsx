import Image from "next/image";
import type { ImageRef } from "@/lib/types";
import { extractYouTubeId } from "./blocks";
import { Section, SectionHeading } from "./ui";

/**
 * Professional photography: up to three YouTube videos and three photos.
 *
 * Empty slots are skipped on the public site. In the editor they show as
 * dashed placeholders, so Eitan can see where each video and photo will go.
 */

export interface ProWorkProps {
  title?: string;
  intro?: string;
  videos: { url: string; title?: string }[];
  photos: (ImageRef | undefined)[];
  editing?: boolean;
}

/* Fill the row with however many items there are (1–3) rather than leave a gap. */
const VIDEO_COLS = ["", "mx-auto max-w-3xl", "md:grid-cols-2", "md:grid-cols-3"];
const PHOTO_COLS = ["", "mx-auto max-w-md", "sm:grid-cols-2", "sm:grid-cols-3"];

const placeholder =
  "grid place-items-center rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-4 text-center text-sm font-semibold text-brand-700";

export function ProWork({ title, intro, videos, photos, editing = false }: ProWorkProps) {
  const vids = videos.map((v) => ({ ...v, id: extractYouTubeId(v.url ?? "") }));
  const shownVideos = editing ? vids : vids.filter((v) => v.id);
  const shownPhotos = editing ? photos : photos.filter((p) => p?.src);
  if (!editing && !shownVideos.length && !shownPhotos.length) return null;

  return (
    <Section id="צילום-מקצועי">
      {title && (
        <div className="mb-10">
          <SectionHeading>{title}</SectionHeading>
        </div>
      )}
      {intro && <p className="mx-auto -mt-2 mb-10 max-w-3xl text-center text-lg text-ink-soft">{intro}</p>}

      {shownVideos.length > 0 && (
        <div className={`grid gap-6 ${VIDEO_COLS[shownVideos.length]}`}>
          {shownVideos.map((v, i) =>
            v.id ? (
              <figure key={i} className="m-0">
                <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-[0_16px_45px_rgb(18_42_43_/_0.12)]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.id}`}
                    title={v.title || `סרטון ${i + 1} — צילום מקצועי, איתן אונר`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="h-full w-full"
                  />
                </div>
                {v.title && <figcaption className="mt-3 text-center font-semibold text-ink">{v.title}</figcaption>}
              </figure>
            ) : (
              <div key={i} className={`${placeholder} aspect-video`}>
                סרטון {i + 1}: הדביקו קישור יוטיוב
              </div>
            )
          )}
        </div>
      )}

      {shownPhotos.length > 0 && (
        <div className={`grid gap-6 ${PHOTO_COLS[shownPhotos.length]} ${shownVideos.length ? "mt-10" : ""}`}>
          {shownPhotos.map((p, i) =>
            p?.src ? (
              <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-alt shadow-[0_16px_45px_rgb(18_42_43_/_0.12)]">
                <Image src={p.src} alt={p.alt ?? ""} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
            ) : (
              <div key={i} className={`${placeholder} aspect-[4/5]`}>
                תמונה {i + 1}: העלו תמונה
              </div>
            )
          )}
        </div>
      )}
    </Section>
  );
}
