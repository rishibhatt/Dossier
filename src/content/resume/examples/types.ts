/**
 * One /resume-examples/[role] page per fictional sample resume (src/lib/resume/samples.ts). The copy is about
 * layout and bullets for that role, not keywords (those live on /resume-keywords). Any number quoted must come
 * from the sample's own bullets; never claim outcomes for Dossier or for real people.
 */
export type ResumeExample = {
  /** URL segment, e.g. "senior-accountant". */
  slug: string
  /** Sample id in samples.ts / sampleLibrary.ts. */
  sample: string
  /** Template the page leads with. The sample must be in that template's `showcase` so a render exists. */
  templateId: string
  /** Page title noun, e.g. "Senior accountant". Shown as "<title> resume example". */
  title: string
  /** One-sentence answer that opens the page. */
  answer: string
  /** 150–300 words in total across the sections: layout, section order, how the bullets are built. */
  guidance: { heading: string; body: string }[]
  /** 3–5 questions specific to this role. */
  faqs: { q: string; a: string }[]
  /** /resume-keywords/[role] slug where one fits. */
  keywordRole?: string
}
