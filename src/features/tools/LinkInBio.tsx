"use client"

import { useState } from "react"
import { ArrowUpRight, Plus, X } from "lucide-react"

import { CopyText } from "@/features/tools/CopyText"
import { ToolHandoff } from "@/features/tools/ToolHandoff"

type LinkRow = { label: string; url: string }
const MAX = 5

function tidyUrl(u: string) {
  return u.trim().replace(/^https?:\/\//, "").replace(/\/$/, "")
}

export function LinkInBio() {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [links, setLinks] = useState<LinkRow[]>([
    { label: "Portfolio", url: "" },
    { label: "LinkedIn", url: "" },
  ])
  const filled = links.filter((l) => l.label.trim() && l.url.trim())
  const plain = [name, role, "", ...filled.map((l) => `${l.label}: ${tidyUrl(l.url)}`)].filter((x, i) => x || i === 2).join("\n").trim()

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form className="grid gap-5 lg:col-span-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="lb-name" className="sp-label">
              Name
            </label>
            <input id="lb-name" value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="Dev Raman" className="sp-field" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="lb-role" className="sp-label">
              Role
            </label>
            <input id="lb-role" value={role} onChange={(e) => setRole(e.target.value.slice(0, 80))} placeholder="Freelance product designer" className="sp-field" />
          </div>
        </div>
        <fieldset className="grid gap-3">
          <legend className="sp-label">Links</legend>
          {links.map((l, k) => (
            <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2">
              <input aria-label={`Link ${k + 1} label`} value={l.label} onChange={(e) => setLinks((s) => s.map((x, j) => (j === k ? { ...x, label: e.target.value.slice(0, 30) } : x)))} placeholder="Label" className="sp-field" />
              <input aria-label={`Link ${k + 1} address`} type="url" inputMode="url" value={l.url} onChange={(e) => setLinks((s) => s.map((x, j) => (j === k ? { ...x, url: e.target.value.slice(0, 200) } : x)))} placeholder="linkedin.com/in/you" className="sp-field" />
              <button type="button" aria-label={`Remove link ${k + 1}`} onClick={() => setLinks((s) => s.filter((_, j) => j !== k))} className="site-btn site-btn-ghost !px-0 aspect-square">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          {links.length < MAX ? (
            <button type="button" onClick={() => setLinks((s) => [...s, { label: "", url: "" }])} className="site-btn site-btn-secondary site-btn-sm w-fit">
              <Plus className="size-4" aria-hidden />
              <span className="site-btn-label">Add a link</span>
            </button>
          ) : (
            <p className="text-xs text-[var(--site-ink-2)]">Five links is the most people will scan.</p>
          )}
        </fieldset>
      </form>

      <div className="min-w-0 lg:col-span-6">
        <div className="mx-auto max-w-[22rem] border border-[var(--site-ink)] bg-[var(--site-sheet)] px-6 pb-8 pt-10 text-center" aria-label="Preview">
          <p className="text-[2rem] font-bold leading-none tracking-[-0.03em]" style={{ fontFamily: "var(--site-display)" }}>
            {name || "Your name"}
          </p>
          <p className="mt-2 text-sm text-[var(--site-ink-2)]">{role || "Your role"}</p>
          <ul className="mt-8 grid gap-2">
            {(filled.length ? filled : [{ label: "Your first link", url: "" }]).map((l) => (
              <li key={l.label + l.url} className="flex min-h-12 items-center justify-between border border-[var(--site-ink)] px-4 text-sm font-semibold">
                {l.label}
                <ArrowUpRight className="size-4" aria-hidden />
              </li>
            ))}
          </ul>
          <p className="sp-data mt-6">Your Dossier link goes here</p>
        </div>
        <div className="mx-auto mt-4 flex max-w-[22rem] items-center justify-between gap-3">
          <span className="text-xs text-[var(--site-ink-2)]">Preview only. Copy the text version, or publish it below.</span>
          <CopyText text={plain} label="Copy text" />
        </div>
        <ToolHandoff className="mt-10" title="Make the first link count." body="Upload your resume and your Dossier site becomes the page your bio points to, with these links in its contact section." />
      </div>
    </div>
  )
}
