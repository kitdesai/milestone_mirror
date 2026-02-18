import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.dropboxusercontent.com",
      },
      {
        protocol: "https",
        hostname: "dl.dropboxusercontent.com",
      },
      {
        protocol: "https",
        hostname: "uc*.dropboxusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle face-api.js Node.js dependencies for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        encoding: false,
      };
    }
    return config;
  },
};

export default async function config() {
  if (process.env.NODE_ENV === "development") {
    await setupDevPlatform();
  }
  return nextConfig;
}
