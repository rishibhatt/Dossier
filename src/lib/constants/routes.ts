/**
 * Central route paths — use these instead of string literals in links and redirects.
 */
export const ROUTES = {
  home: "/",
  build: "/build",
  resume: "/resume",
  resumeTemplates: "/resume-templates",
  looks: "/looks",
  resumeExamples: "/resume-examples",
  portfolioExamples: "/portfolio-examples",
  resumeNew: "/resume/new",
  resumeEdit: "/resume/edit",
  coverLetter: "/cover-letter",
  coverLetterNew: "/cover-letter/new",
  coverLetterEdit: "/cover-letter/edit",
  coverLetterChecker: "/tools/cover-letter-checker",
  authCallback: "/auth/callback",
  login: "/login",
  signup: "/signup",
  pricing: "/pricing",
  howItWorks: "/how-it-works",
  features: "/features",
  faq: "/faq",
  tools: "/tools",
  blog: "/blog",
  resumeKeywords: "/resume-keywords",
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
