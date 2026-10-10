
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existing Tailwind and Turbopack configuration
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // BazarDor API proxy configuration
  async rewrites() {
    return [
      {
        source: "/api/bazardor/:path*",
        destination:
          "https://openapi.programming-hero.com/api/bazardor/:path*",
      },
    ];
  },
};

export default nextConfig;
