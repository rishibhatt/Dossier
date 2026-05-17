import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  /**
   * Netlify bundles omit `pdf.worker.mjs` by default; pdfjs then throws
   * "Cannot find module .../pdf.worker.mjs". Include worker artifacts for this route.
   */
  outputFileTracingIncludes: {
    "/api/parse-pdf": [
      `./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs`,
      `./node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs`,
    ],
    "/api/parse-pdf/route": [
      `./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs`,
      `./node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs`,
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
