import type { NextConfig } from "next";

/**
 * Security headers for every route. The CSP is report-only while reports come in: violations are posted to
 * /api/csp-report (Netlify function logs, "[csp]"). When a week of real traffic shows none from our own pages,
 * set CSP_ENFORCE=1 on Netlify to send it as `Content-Security-Policy`. `unsafe-inline` stays because Next injects
 * inline scripts without a nonce; the allow-lists cover Supabase and the analytics tools in `Analytics.tsx`.
 * `'wasm-unsafe-eval'` lets the resume builder compile its Typst WebAssembly; it does not allow JS eval.
 * JS `'unsafe-eval'` is only for `next dev` (React's dev tooling); production never needs it.
 * Google Fonts: published portfolios load their typefaces from fonts.googleapis.com / fonts.gstatic.com.
 */
const DEV = process.env.NODE_ENV !== "production";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV ? " 'unsafe-eval'" : ""} 'wasm-unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://pagead2.googlesyndication.com https://checkout.razorpay.com https://*.posthog.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.clarity.ms https://*.posthog.com https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src 'self' https://googleads.g.doubleclick.net https://api.razorpay.com https://checkout.razorpay.com",
  // The resume typesetter runs in a same-origin module worker.
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "report-uri /api/csp-report",
  "report-to csp",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
  { key: process.env.CSP_ENFORCE === "1" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", value: CSP },
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
