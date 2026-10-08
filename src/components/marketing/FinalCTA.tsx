import { UploadSlot } from "@/components/marketing/UploadSlot"

/** The close: one sheet with crop marks, the headline and the same working upload slot as the hero. */
export function FinalCta({ title = "Your next application could link to a site." }: { title?: string }) {
  return (
    <section aria-labelledby="close-title" className="py-20 sm:py-28">
      <div className="site-wrap">
        <div className="sp-crop mx-3 border border-[var(--site-ink)] bg-[var(--site-sheet)] px-5 py-12 sm:mx-6 sm:px-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h2 id="close-title" className="site-h2 max-w-[16ch]">
                {title}
              </h2>
              <p className="site-lead mt-5">Upload your resume now and see it set as a site. Sign up only when you want to publish.</p>
            </div>
            <UploadSlot id="close-upload" className="lg:col-span-5" />
          </div>
        </div>
      </div>
    </section>
  )
}
