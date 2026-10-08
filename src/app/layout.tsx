import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist_Mono, Inter, Inter_Tight, Mr_Dafoe } from "next/font/google"

import { AppProviders } from "@/components/providers/app-providers"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

/** Display face for marketing and app headings. Named `--font-site-display` so it never collides with the portfolio engine's `--font-display`. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-site-display",
  display: "swap",
})

/** The signature script of the Dossier wordmark. */
const wmScript = Mr_Dafoe({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-wm-script",
  display: "swap",
})

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.defaultTitle,
  description: messages.seo.defaultDescription,
  path: "/",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${interTight.variable} ${geistMono.variable} ${bricolage.variable} ${wmScript.variable} h-full`}>
      <body className="min-h-full" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
