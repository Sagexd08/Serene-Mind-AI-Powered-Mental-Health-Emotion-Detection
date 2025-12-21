import type { NextConfig } from "next";

// @ts-ignore
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Change to 'false' to enable PWA in production
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PWA is currently causing build issues in this environment. 
  // Unwrap the config below to enable it when environment allows.
};

// module.exports = withPWA(nextConfig); 
export default nextConfig;
