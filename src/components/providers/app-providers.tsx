"use client"

import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
      {/* Swipe or wait to dismiss; errors carry their own action. No close button cluttering every slip. */}
      <Toaster />
    </ThemeProvider>
  )
}
