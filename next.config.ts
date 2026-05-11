import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow the production domain so Next.js CSRF origin check doesn't block Server Actions
      allowedOrigins: ["operation.freelancerkw.com", "localhost:3000"],
      // Increase body size limit so logo/signature uploads aren't rejected at the framework level
      bodySizeLimit: "5mb"
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co"
      }
    ]
  }
};

export default nextConfig;
