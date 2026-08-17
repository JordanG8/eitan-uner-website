export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

/**
 * The site is designed to run with or without Sanity.
 *
 * Until a project id is set, every page renders from src/lib/content.ts. That is
 * what lets the site go live and end Eitan's downtime before any content has been
 * migrated into the CMS — and it also means a Sanity outage can never take the
 * site down, only freeze it at the last deploy.
 */
export const sanityEnabled = projectId.length > 0;
