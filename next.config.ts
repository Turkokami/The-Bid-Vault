import type { NextConfig } from "next";

const isMobileBuild = process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isMobileBuild
    ? {
        output: "export",
        distDir: "capacitor-static",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        async redirects() {
          return [
            {
              source: "/sam-search/:id+",
              destination: "/government-data/:id+",
              permanent: false,
            },
          ];
        },
      }),
};

export default nextConfig;
