import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityEnabled } from "./env";

export const client: SanityClient | null = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;
