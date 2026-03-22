import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Single mongoose instance in serverless; prevents ref models (e.g. Sale) missing on another copy.
  serverExternalPackages: [ "mongoose" ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
