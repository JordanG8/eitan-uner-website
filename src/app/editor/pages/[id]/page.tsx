import { notFound } from "next/navigation";
import { PageEditor } from "@/editor/PageEditor";
import { loadIndex, loadPage, loadSite } from "@/lib/cms";
import { storageDriver } from "@/lib/store";

/** Always the latest saved version — the editor never reads through the cache. */
export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [index, site] = await Promise.all([loadIndex(), loadSite()]);
  const entry = index.find((p) => p.id === id);
  if (!entry) notFound();
  const data = await loadPage(id);
  if (!data) notFound();

  return (
    <PageEditor
      id={id}
      entry={entry}
      data={data}
      site={site}
      pages={index.map(({ slug, title }) => ({ slug, title }))}
      driver={storageDriver()}
    />
  );
}
