import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    "https://7ee300bba654.ngrok-free.app",
    "http://127.0.0.1:3001",
    "127.0.0.1:3001",
  ],
};

export default nextConfig;
