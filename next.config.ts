import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Single mongoose instance in serverless; prevents ref models (e.g. Sale) missing on another copy.
  serverExternalPackages: [ "mongoose", "bullmq", "ioredis" ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
