import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/sam-search/:id+",
        destination: "/government-data/:id+",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
