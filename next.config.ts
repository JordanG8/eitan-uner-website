import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Uploads live in Vercel Blob in production.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // SVG logos are allowed as uploads; serve them unoptimised and sandboxed.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
