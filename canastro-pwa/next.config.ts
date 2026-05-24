import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for iPhone standalone PWA: output static assets properly
  output: undefined,
  // Silence the x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
