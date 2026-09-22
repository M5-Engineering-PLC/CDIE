import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // The admin dashboard uploads photographs through server actions.
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
