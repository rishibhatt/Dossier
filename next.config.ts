import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  /**
   * Netlify bundles omit `pdf.worker.mjs` by default; pdfjs then throws
   * "Cannot find module .../pdf.worker.mjs". Include worker artifacts for this route.
   */
  outputFileTracingIncludes: {
    "/api/parse-pdf": [
      "./node_modules/pdfjs-dist/legacy/build/**/*",
      "./node_modules/pdf-parse/node_modules/pdfjs-dist/legacy/build/**/*",
    ],
    "/api/parse-pdf/route": [
      "./node_modules/pdfjs-dist/legacy/build/**/*",
      "./node_modules/pdf-parse/node_modules/pdfjs-dist/legacy/build/**/*",
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
