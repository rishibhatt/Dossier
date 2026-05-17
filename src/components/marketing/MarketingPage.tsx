import { DesignIntention } from "@/components/marketing/DesignIntention"
import { FinalCTA } from "@/components/marketing/FinalCTA"
import { HeroSection } from "@/components/marketing/HeroSection"
import { MarketingFooter } from "@/components/marketing/MarketingFooter"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { ModeComparison } from "@/components/marketing/ModeComparison"
import { ProcessSection } from "@/components/marketing/ProcessSection"
import { StudioShowcase } from "@/components/marketing/StudioShowcase"

export function MarketingPage() {
  return (
    <div className="marketing-redesign">
      <MarketingHeader />
      <main>
        <HeroSection />
        <ProcessSection />
        <StudioShowcase />
        <ModeComparison />
        <DesignIntention />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  )
}
