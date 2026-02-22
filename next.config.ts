import type { NextConfig } from "next";

import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  output: "standalone",
  transpilePackages: ["next-mdx-remote"],
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "elysia.wiki",
        port: "223",
      },
      {
        protocol: "https",
        hostname: "icstudio.top",
      },
      {
        protocol: "http",
        hostname: "icstudio.top",
      },
      {
        protocol: "https",
        hostname: "icstudio.top",
        port: "233",
      }
    ],
  },
};

export default withMDX(nextConfig);
