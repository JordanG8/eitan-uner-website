import { notFound } from "next/navigation";
import { Blocks } from "@/components/blocks";
import { getPageBySlug } from "@/lib/fetch";

export default async function HomePage() {
  const page = await getPageBySlug("/");
  if (!page) notFound();
  return <Blocks blocks={page.blocks} />;
}
