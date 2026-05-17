import { MarketingLayoutTemplate } from "@/components/templates/MarketingLayoutTemplate"

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <MarketingLayoutTemplate>{children}</MarketingLayoutTemplate>
}
