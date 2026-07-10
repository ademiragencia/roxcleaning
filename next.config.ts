import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site — no server needed. Deploys to Vercel (or any static host) as-is.
  output: "export",
};

export default nextConfig;
