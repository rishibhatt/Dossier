import type { Metadata } from "next"
import { Geist_Mono, Inter, Inter_Tight } from "next/font/google"

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

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.defaultTitle,
  description: messages.seo.defaultDescription,
  path: "/",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${interTight.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
