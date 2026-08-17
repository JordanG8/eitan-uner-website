/**
 * Pushes the seed content in src/lib/content.ts into Sanity as real documents,
 * uploading every local image as a Sanity asset along the way.
 *
 *   npx tsx scripts/seed.ts
 *
 * Uses createOrReplace with deterministic ids, so it is safe to re-run: it
 * updates the same documents instead of piling up duplicates.
 *
 * Auth comes from the Sanity CLI login (~/.config/sanity/config.json) or a
 * SANITY_AUTH_TOKEN env var.
 */

import { createClient } from "@sanity/client";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { pages, site, stories } from "../src/lib/content";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

if (!projectId) {
  console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it to .env.local first.");
  process.exit(1);
}

function resolveToken(): string {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  for (const p of [
    path.join(homedir(), ".config", "sanity", "config.json"),
    path.join(process.env.APPDATA ?? "", "sanity", "config.json"),
  ]) {
    try {
      const cfg = JSON.parse(readFileSync(p, "utf8"));
      if (cfg?.authToken) return cfg.authToken as string;
    } catch {
      /* try the next location */
    }
  }
  console.error(
    "No Sanity token found. Run `npx sanity login` or set SANITY_AUTH_TOKEN."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token: resolveToken(),
  useCdn: false,
});

/** Stable id from a string, so re-running the seed updates in place. */
const idFor = (prefix: string, key: string) =>
  `${prefix}.${createHash("sha1").update(key).digest("hex").slice(0, 16)}`;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/* ------------------------------------------------------------------ assets */

const assetCache = new Map<string, string>();
const PUBLIC = path.join(process.cwd(), "public");

async function uploadImage(src: string): Promise<string> {
  const cached = assetCache.get(src);
  if (cached) return cached;

  const file = path.join(PUBLIC, src.replace(/^\//, ""));
  const buffer = readFileSync(file);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(file),
  });
  assetCache.set(src, asset._id);
  console.log(`  ↑ ${path.basename(file)} → ${asset._id}`);
  return asset._id;
}

type LocalImage = { src: string; alt: string };

async function toSanityImage(img: LocalImage) {
  const assetId = await uploadImage(img.src);
  return {
    _type: "captionedImage",
    alt: img.alt,
    asset: { _type: "reference", _ref: assetId },
  };
}

/* ------------------------------------------------------------------ blocks */

/* eslint-disable @typescript-eslint/no-explicit-any */

async function transformBlock(block: any): Promise<any> {
  const out: any = { ...block, _key: key() };

  if (out.image) out.image = await toSanityImage(out.image);

  if (Array.isArray(out.images)) {
    out.images = await Promise.all(
      out.images.map(async (im: LocalImage) => ({
        ...(await toSanityImage(im)),
        _key: key(),
      }))
    );
  }

  if (Array.isArray(out.logos)) {
    out.logos = await Promise.all(
      out.logos.map(async (im: LocalImage) => ({
        ...(await toSanityImage(im)),
        _key: key(),
      }))
    );
  }

  if (Array.isArray(out.cards)) {
    out.cards = await Promise.all(
      out.cards.map(async (card: any) => ({
        ...card,
        _type: "card",
        _key: key(),
        ...(card.image ? { image: await toSanityImage(card.image) } : {}),
      }))
    );
  }

  if (Array.isArray(out.items)) {
    out.items = await Promise.all(
      out.items.map(async (item: any) => ({
        ...item,
        _type: "testimonial",
        _key: key(),
        ...(item.avatar ? { avatar: await toSanityImage(item.avatar) } : {}),
      }))
    );
  }

  if (Array.isArray(out.ctas)) {
    out.ctas = out.ctas.map((c: any) => ({ ...c, _type: "cta", _key: key() }));
  }

  return out;
}

/* -------------------------------------------------------------------- main */

async function main() {
  console.log(`Seeding ${projectId}/${dataset}\n`);

  console.log("Site settings…");
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: site.siteName,
    tagline: site.tagline,
    phone: site.phone,
    phoneDisplay: site.phoneDisplay,
    email: site.email,
    location: site.location,
    hours: site.hours,
    roles: site.roles,
    whatsappUrl: site.whatsappUrl,
    ...(site.facebookUrl ? { facebookUrl: site.facebookUrl } : {}),
  });

  console.log(`\nPages (${pages.length})…`);
  for (const page of pages) {
    console.log(`- ${page.slug}`);
    const blocks = [];
    for (const b of page.blocks) blocks.push(await transformBlock(b));

    await client.createOrReplace({
      _id: idFor("page", page.slug),
      _type: "page",
      title: page.title,
      slug: { _type: "slug", current: page.slug },
      showTitleBanner: page.showTitleBanner ?? false,
      ...(page.seoDescription ? { seoDescription: page.seoDescription } : {}),
      blocks,
    });
  }

  console.log(`\nStories (${stories.length})…`);
  for (const story of stories) {
    console.log(`- ${story.slug}`);
    await client.createOrReplace({
      _id: idFor("story", story.slug),
      _type: "story",
      title: story.title,
      slug: { _type: "slug", current: story.slug },
      ...(story.date ? { date: story.date } : {}),
      ...(story.image ? { image: await toSanityImage(story.image) } : {}),
      body: story.body,
      ...(story.tags ? { tags: story.tags } : {}),
      ...(story.links
        ? { links: story.links.map((l) => ({ ...l, _key: key() })) }
        : {}),
    });
  }

  console.log(
    `\nDone. ${pages.length} pages, ${stories.length} stories, ${assetCache.size} images.`
  );
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message ?? err);
  process.exit(1);
});
