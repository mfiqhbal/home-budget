import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "**.shopee.com.my",
      },
      {
        protocol: "https",
        hostname: "**.lazada.com.my",
      },
      {
        protocol: "https",
        hostname: "**.lzd.co",
      },
      {
        protocol: "https",
        hostname: "**.susercontent.com",
      },
    ],
  },
};

export default nextConfig;
