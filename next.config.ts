import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PUBLIC_DATA_API_KEY: "76956db767de03f8c11d0dc44a05deb4bf2e67deb084d7b1ec449b766d1815bb",
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "production",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
