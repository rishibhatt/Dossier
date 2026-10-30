"use client"

import { useMemo } from "react"
import { Plus } from "lucide-react"

import { ROLES } from "@/content/roles"
import { CopyText } from "@/features/tools/CopyText"
import { PolishButton } from "@/features/tools/PolishButton"
import { ResumeHandoff } from "@/features/tools/ResumeHandoff"
import { ResultsJump } from "@/features/tools/ResultsJump"
import { buildSummaries, STAGES, SUMMARY_LIMIT, type Stage, type SummaryInput } from "@/features/tools/summaryGen"
import { useSaved } from "@/features/tools/useSaved"

type TextKey = Exclude<keyof SummaryInput, "stage">

const BACKGROUND: Partial<Record<Stage, { label: string; placeholder: string }>> = {
  student: { label: "What and where you study", placeholder: "Final-year B.Com student at Christ University" },
  change: { label: "The field you are leaving", placeholder: "Teaching" },
}

/** Skills and tools from the role keyword pages, offered as one-tap additions when the role matches. */
function suggestionsFor(role: string, skills: string): string[] {
  const r = role.trim().toLowerCase()
  if (r.length < 3) return []
  const match = ROLES.find((x) => x.title.toLowerCase() === r) ?? ROLES.find((x) => x.title.toLowerCase().includes(r) || r.includes(x.title.toLowerCase()))
  if (!match) return []
  const have = new Set(skills.split(/[,;\n]+/).map((s) => s.trim().toLowerCase()))
  return [...match.tools, ...match.skills].filter((s) => !have.has(s.toLowerCase())).slice(0, 8)
}

export function SummaryGenerator() {
  const [v, setV] = useSaved<SummaryInput>("summary", { role: "", stage: "mid", years: "", focus: "", skills: "", proof: "", background: "" })
  const out = useMemo(() => buildSummaries(v), [v])
  const ideas = useMemo(() => suggestionsFor(v.role, v.skills), [v.role, v.skills])
  const set = (k: TextKey, max: number) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((s) => ({ ...s, [k]: k === "years" ? e.target.value.replace(/\D/g, "").slice(0, 2) : e.target.value.slice(0, max) }))
  const bg = BACKGROUND[v.stage]
  const showYears = v.stage !== "student" && v.stage !== "change"

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form className="grid content-start gap-5 lg:col-span-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="sg-role" className="sp-label">
            The job you want
          </label>
          <input id="sg-role" value={v.role} onChange={set("role", 80)} placeholder="Data Analyst" className="sp-field" list="sg-roles" autoComplete="organization-title" />
          <datalist id="sg-roles">
            {ROLES.map((r) => (
              <option key={r.slug} value={r.title} />
            ))}
          </datalist>
        </div>

        <fieldset>
          <legend className="sp-label">Where you are now</legend>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button key={s.id} type="button" aria-pressed={v.stage === s.id} className="sp-chip" onClick={() => setV((x) => ({ ...x, stage: s.id }))}>
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        {bg ? (
          <div>
            <label htmlFor="sg-bg" className="sp-label">
              {bg.label}
            </label>
            <input id="sg-bg" value={v.background} onChange={set("background", 120)} placeholder={bg.placeholder} className="sp-field" />
          </div>
        ) : null}

        {showYears ? (
          <div>
            <label htmlFor="sg-years" className="sp-label">
              Years of experience <span className="font-normal text-[var(--site-ink-3)]">(optional)</span>
            </label>
            <input id="sg-years" value={v.years} onChange={set("years", 2)} placeholder="5" inputMode="numeric" className="sp-field" />
          </div>
        ) : null}

        <div>
          <label htmlFor="sg-focus" className="sp-label">
            Your area or industry <span className="font-normal text-[var(--site-ink-3)]">(optional)</span>
          </label>
          <input id="sg-focus" value={v.focus} onChange={set("focus", 100)} placeholder="Retail pricing" className="sp-field" />
        </div>

        <div>
          <label htmlFor="sg-skills" className="sp-label">
            Two to four skills or tools
          </label>
          <input id="sg-skills" value={v.skills} onChange={set("skills", 160)} placeholder="SQL, Python, Tableau" className="sp-field" aria-describedby="sg-skills-hint" />
          <p id="sg-skills-hint" className="mt-1.5 text-xs text-[var(--site-ink-2)]">
            Separate with commas. Use the words from the job post.
          </p>
          {ideas.length ? (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested skills for this role">
              {ideas.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="sp-chip"
                  onClick={() => setV((x) => ({ ...x, skills: x.skills.trim() ? `${x.skills.replace(/[,\s]+$/, "")}, ${s}` : s }))}
                >
                  <Plus className="size-3.5" aria-hidden />
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="sg-proof" className="sp-label">
            One result you are proud of
          </label>
          <input id="sg-proof" value={v.proof} onChange={set("proof", 160)} placeholder="Built a pricing dashboard that cut markdown losses by 12%" className="sp-field" aria-describedby="sg-proof-hint" />
          <p id="sg-proof-hint" className="mt-1.5 text-xs text-[var(--site-ink-2)]">
            Start with a verb. A number makes it stronger.
          </p>
        </div>
      </form>

      <div id="sg-results" className="min-w-0 scroll-mt-24 lg:col-span-7">
        <ResultsJump targetId="sg-results" count={out.length} noun={["summary", "summaries"]} />
        {out.length ? (
          <>
            <ol className="border-t border-[var(--site-ink)]">
              {out.map((s, k) => (
                <li key={s.shape} className="border-b border-[var(--site-rule)] py-5">
                  <div className="sp-data flex justify-between gap-3">
                    <span>
                      <span className="sp-no">{String(k + 1).padStart(2, "0")}</span> {s.shape}
                    </span>
                    <span className={s.text.length > SUMMARY_LIMIT ? "text-[var(--site-danger)]" : undefined}>{s.text.length} characters</span>
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <p className="text-[1.0625rem] leading-relaxed">{s.text}</p>
                    <CopyText text={s.text} />
                  </div>
                  <PolishButton key={s.text} kind="summary" text={s.text} role={v.role} />
                </li>
              ))}
            </ol>
            {v.proof.trim() || v.skills.trim() ? (
              <ResumeHandoff
                className="mt-10"
                tool="summary-generator"
                title="Put it at the top of a resume."
                body="Opens the free resume builder with your summary in place and your job title as the headline. Pick a template, fill in the rest, download the PDF."
                options={out.map((s) => ({ label: s.shape, fill: { summary: s.text, headline: v.role.trim() } }))}
              />
            ) : (
              <p className="mt-6 text-[0.9375rem] text-[var(--site-ink-2)]">Add a skill or a result and the summaries get specific enough to use.</p>
            )}
          </>
        ) : (
          <p className="border-t border-[var(--site-ink)] pt-5 text-[var(--site-ink-2)]">Start with the job you want. Summaries appear here as you type.</p>
        )}
      </div>
    </div>
  )
}
