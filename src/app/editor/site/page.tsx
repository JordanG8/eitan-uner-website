import { loadIndex, loadPage, loadSite } from "@/lib/cms";
import { storageDriver } from "@/lib/store";
import { SiteEditor } from "@/editor/SiteEditor";

export const dynamic = "force-dynamic";

export default async function EditSite() {
  const [site, index] = await Promise.all([loadSite(), loadIndex()]);
  const home = index.find((p) => p.slug === "/");
  const homeData = home ? await loadPage(home.id) : null;
  return (
    <SiteEditor
      site={site}
      preview={homeData}
      pages={index.map(({ slug, title }) => ({ slug, title }))}
      driver={storageDriver()}
    />
  );
}
