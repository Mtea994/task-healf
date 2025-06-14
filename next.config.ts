import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // remotePatterns: [new URL("https://cdn.shopify.com/s/files/**")],
    domains: ["cdn.shopify.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
