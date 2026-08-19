import type { NextConfig } from "next";

/**
 * Frontend only. `output: "export"` emits a plain static site into `out/`:
 * no server, no API routes, no middleware, no ISR, no image optimizer.
 * `trailingSlash` makes nested routes resolve on any dumb static host.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
