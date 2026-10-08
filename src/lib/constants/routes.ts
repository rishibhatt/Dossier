/**
 * Central route paths — use these instead of string literals in links and redirects.
 */
export const ROUTES = {
  home: "/",
  build: "/build",
  livePreview: "/live-preview",
  authCallback: "/auth/callback",
  login: "/login",
  signup: "/signup",
  pricing: "/pricing",
  howItWorks: "/how-it-works",
  features: "/features",
  faq: "/faq",
  tools: "/tools",
  invite: "/invite",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  billing: "/dashboard/billing",
  billingCancel: "/dashboard/billing/cancel",
  referrals: "/dashboard/referrals",
  settings: "/dashboard/settings",
} as const

export type RouteKey = keyof typeof ROUTES

export type AppPath = (typeof ROUTES)[RouteKey]
