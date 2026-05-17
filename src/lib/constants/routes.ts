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
  dashboard: "/dashboard",
  dossiers: "/dashboard/dossiers",
  projects: "/dashboard/projects",
  activity: "/dashboard/activity",
  settings: "/dashboard/settings",
} as const

export type RouteKey = keyof typeof ROUTES

export type AppPath = (typeof ROUTES)[RouteKey]
