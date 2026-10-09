import type { NextConfig } from "next";

/**
 * Security headers for every route. The CSP is report-only first: check the browser console on a few pages,
 * then rename the header to `Content-Security-Policy` to enforce it. `unsafe-inline` stays because Next injects
 * inline scripts without a nonce; the allow-lists cover Supabase and the analytics tools in `Analytics.tsx`.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://pagead2.googlesyndication.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.clarity.ms",
  "frame-src 'self' https://googleads.g.doubleclick.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy-Report-Only", value: CSP },
];

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
  poweredByHeader: false,
  experimental: {
    // Server actions also run on the admin subdomain, so both hosts are trusted origins.
    serverActions: { allowedOrigins: ["dossier-cv.com", "www.dossier-cv.com", "admin.dossier-cv.com", "localhost:3000", "admin.localhost:3000"] },
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    // The old resume checker was folded into the ATS scanner. Keep its links and rankings.
    return [{ source: "/tools/resume-checker", destination: "/tools/ats-checker", permanent: true }]
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
