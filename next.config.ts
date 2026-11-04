import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg opens raw TCP sockets to Postgres; keeping it out of the server bundle avoids bundling
  // its optional native driver lookup.
  serverExternalPackages: ["pg"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
