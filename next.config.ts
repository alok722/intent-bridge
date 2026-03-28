import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /** Compress responses for smaller payloads over the wire. */
  compress: true,
  /** Opt-in to stricter React mode for earlier bug detection. */
  reactStrictMode: true,
};

export default nextConfig;
