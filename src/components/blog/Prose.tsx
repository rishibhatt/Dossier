import Link from "next/link"

import type { Block } from "@/content/blog/posts"

const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g

function Inline({ text }: { text: string }) {
  const out: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <Link key={m.index} href={m[2]} className="underline decoration-[var(--site-accent)] underline-offset-4 hover:text-[var(--site-accent-ink)]">
        {m[1]}
      </Link>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return <>{out}</>
}

export function Prose({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="max-w-[40rem] text-[1.0625rem] leading-[1.75] text-[var(--site-ink)]">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return (
              <h2 key={i} className="site-h3 mb-3 mt-12 first:mt-0">
                {b.text}
              </h2>
            )
          case "p":
            return (
              <p key={i} className="mt-4 text-[var(--site-ink-2)]">
                <Inline text={b.text} />
              </p>
            )
          case "ul":
            return (
              <ul key={i} className="mt-4 list-disc space-y-2 pl-6 text-[var(--site-ink-2)] marker:text-[var(--site-accent)]">
                {b.items.map((it) => (
                  <li key={it}>
                    <Inline text={it} />
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={i} className="mt-4 list-decimal space-y-2 pl-6 text-[var(--site-ink-2)] marker:font-semibold marker:text-[var(--site-ink)]">
                {b.items.map((it) => (
                  <li key={it}>
                    <Inline text={it} />
                  </li>
                ))}
              </ol>
            )
          case "tip":
            return (
              <aside key={i} className="mt-8 border-l-2 border-[var(--site-accent)] bg-[var(--site-sheet)] px-5 py-4 text-[0.9375rem] leading-relaxed">
                <Inline text={b.text} />
              </aside>
            )
        }
      })}
    </div>
  )
}
