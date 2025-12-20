import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to allow middleware/proxy usage
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
