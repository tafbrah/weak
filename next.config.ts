import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output only for Docker self-hosting.
  // On Vercel (VERCEL env var is set), Vercel handles the build output.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),

  experimental: {
    serverActions: {
      allowedOrigins: [
        // Preview / sandbox
        "e2b.app",
        "*.e2b.app",
        "e2b.dev",
        "*.e2b.dev",
        // OVHcloud self-hosting
        "*.ovh.net",
        "*.ovhcloud.com",
        // Vercel
        "*.vercel.app",
        "*.vercel.app/*",
      ],
    },
  },
};

export default nextConfig;
