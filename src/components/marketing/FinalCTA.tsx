import { MarketingButton } from "@/components/marketing/MarketingPrimitives"
import { ROUTES } from "@/lib/constants/routes"

function AngledCard({ className, title, dark = false }: { className?: string; title: string; dark?: boolean }) {
  return (
    <div
      className={className}
      style={{ transform: className?.includes("rotate") ? undefined : undefined }}
    >
      <div
        className={`h-48 w-72 overflow-hidden rounded-2xl border shadow-2xl ${
          dark ? "border-white/10 bg-[#0C1019]" : "border-white/20 bg-[#F3EEE5]"
        }`}
      >
        <div className="flex h-9 items-center justify-between border-b border-current/10 px-4 text-[9px] opacity-70">
          <span>ALEX CHEN</span>
          <span>Work</span>
        </div>
        <div className="p-5">
          <p className={`font-serif text-2xl leading-none tracking-[-0.055em] ${dark ? "text-white" : "text-[#101114]"}`}>
            {title}
          </p>
          <div className={`mt-6 h-20 rounded-xl ${dark ? "bg-white/10" : "bg-black/10"}`} />
        </div>
      </div>
    </div>
  )
}

export function FinalCTA() {
  return (
    <section className="mk-final-cta overflow-hidden py-20 md:py-24">
      <div className="mk-container-wide grid min-h-[380px] grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-[520px]">
          <h2 className="mk-display-lg text-white">Your work deserves more than a PDF.</h2>
          <p className="mt-6 max-w-[430px] text-base leading-7 text-[var(--mk-text-inverse-secondary)]">
            Build a portfolio that reflects the quality of your work and helps you stand out.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <MarketingButton href={ROUTES.build} variant="purple">
              Build my portfolio
            </MarketingButton>
            <MarketingButton href="#how-it-works" variant="dark-outline">
              See how it works
            </MarketingButton>
          </div>
        </div>

        <div className="relative hidden min-h-[340px] lg:block">
          <div className="absolute bottom-10 left-12 rotate-[-7deg] opacity-85">
            <AngledCard title="Alex Chen" />
          </div>
          <div className="absolute bottom-8 left-48 rotate-[-3deg] opacity-90">
            <AngledCard title="Studio control" dark />
          </div>
          <div className="absolute bottom-14 right-2 rotate-[5deg]">
            <AngledCard title="Product Designer & Researcher" dark />
          </div>
          <div className="absolute bottom-0 left-20 right-0 h-12 bg-[radial-gradient(ellipse_at_center,rgba(109,92,246,0.58),transparent_70%)] blur-xl" />
        </div>
      </div>
    </section>
  )
}
