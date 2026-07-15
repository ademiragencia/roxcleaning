import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The marketing site is static, but the Instagram downloader under
  // /instagram needs serverless Route Handlers (media resolution + download
  // proxy), so we can no longer use `output: "export"`. Vercel builds this as
  // a standard Next.js app: static pages stay static, API routes run on demand.
  images: {
    // Instagram / Facebook CDN hosts, in case a thumbnail is ever rendered
    // through next/image. The downloader itself uses plain <img>, but this
    // keeps the optimizer scoped to those hosts instead of anything arbitrary.
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
};

export default nextConfig;
