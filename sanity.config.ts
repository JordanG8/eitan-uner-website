"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemas";

/**
 * Studio config, mounted inside the Next app at /studio.
 *
 * Two things here are what make this feel like a page builder rather than a
 * database form:
 *
 *  - presentationTool gives side-by-side live preview. Eitan types on the left
 *    and watches the real page update on the right, and can click an element on
 *    the page to jump to its field.
 *  - the structure below groups documents the way he thinks about them
 *    ("העמודים שלי", "סיפורים") instead of exposing raw document types.
 */
export default defineConfig({
  name: "eitan-uner-studio",
  title: "פוטודוקותרפיה איתן אונר",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    presentationTool({
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    structureTool({
      title: "תוכן",
      structure: (S) =>
        S.list()
          .title("תוכן")
          .items([
            S.listItem()
              .title("הגדרות האתר")
              .id("siteSettings")
              .child(
                S.document().schemaType("siteSettings").documentId("siteSettings")
              ),
            S.divider(),
            S.documentTypeListItem("page").title("העמודים שלי"),
            S.documentTypeListItem("story").title("סיפורים מאחורי המצלמה"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
