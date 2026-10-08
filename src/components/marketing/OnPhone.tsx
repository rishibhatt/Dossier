import { RunningHead } from "@/components/marketing/PageHead"
import type { SamplePerson } from "@/components/marketing/sample"

const FACTS = [
  { k: "Upload", v: "Pick the PDF from Files, Drive or your email attachments." },
  { k: "Edit", v: "Tap any line on the preview to change it." },
  { k: "Restyle", v: "Try a new look with one tap. Your words stay put." },
  { k: "Share", v: "Publish, then send the link to WhatsApp, LinkedIn or email from the share sheet." },
] as const

/** Phone-first, stated as facts about the flow, beside a portrait proof of the published page at phone width. */
export function OnPhone({ person }: { person: SamplePerson }) {
  const p = person
  return (
    <section id="phone" aria-labelledby="phone-title" className="scroll-mt-20 bg-[var(--site-ink)] py-20 text-[var(--site-paper)] sm:py-28">
      <div className="site-wrap">
        <RunningHead label="On your phone" no="005" className="!border-white/40" />
      </div>
      <div className="site-wrap grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <h2 id="phone-title" className="site-h2 max-w-[16ch]">
            Start it on the bus. Publish it before your stop.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            The whole builder works one-handed on a small screen. A laptop is optional.
          </p>
          <dl className="mt-10 grid grid-cols-1 border-t border-white/20 sm:grid-cols-2">
            {FACTS.map((f) => (
              <div key={f.k} className="border-b border-white/20 py-5 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6">
                <dt className="sp-no text-sm text-[#b8aeff]">{f.k}</dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-white/85">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="mx-auto w-full max-w-[19rem] lg:col-span-5">
          <div className="border border-white/25 bg-[#f6f3ec] text-[#1c2b3a]" style={{ borderRadius: 2 }}>
            <div className="sp-data flex justify-between border-b border-black/10 px-4 py-2 !text-[#3d4a57]">
              <span>390 px</span>
              <span>/p/k3m9x2qa7d</span>
            </div>
            <div className="px-5 pb-6 pt-8">
              <p className="text-[2.25rem] font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: '"IBM Plex Serif", Georgia, serif' }}>
                {p.name}
              </p>
              <p className="mt-2 text-sm opacity-75">
                {p.role}, {p.city}
              </p>
              <span className="mt-5 inline-flex h-11 items-center border border-current px-4 text-sm font-semibold" style={{ borderRadius: 2 }}>
                Email Meera
              </span>
              <div className="mt-7 border-t border-current/15">
                {p.jobs.map((j) => (
                  <div key={j.org} className="border-b border-current/15 py-3 text-sm">
                    <p className="font-semibold">{j.org}</p>
                    <p className="opacity-75">{j.line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <figcaption className="mt-3 text-xs text-white/60">Sample portfolio at phone width, look No. 009 Ledger.</figcaption>
        </figure>
      </div>
    </section>
  )
}
