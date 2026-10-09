import { cn } from "@/lib/utils"

/**
 * Small dependency-free SVG charts in the site's ink-and-violet palette. Each one carries a text summary for
 * screen readers and a <title> on every point for hover.
 */
type Point = { label: string; value: number }

const W = 640
const H = 180
const PAD = { l: 34, r: 8, t: 10, b: 22 }

function niceMax(max: number): number {
  if (max <= 5) return 5
  const pow = 10 ** Math.floor(Math.log10(max))
  const n = max / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

export function LineChart({ data, label, className }: { data: Point[]; label: string; className?: string }) {
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)))
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const x = (i: number) => PAD.l + (data.length <= 1 ? 0 : (i / (data.length - 1)) * innerW)
  const y = (v: number) => PAD.t + innerH - (v / max) * innerH
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(" ")
  const area = data.length ? `${line} L${x(data.length - 1).toFixed(1)} ${PAD.t + innerH} L${x(0).toFixed(1)} ${PAD.t + innerH} Z` : ""
  const total = data.reduce((s, d) => s + d.value, 0)
  const ticks = [0, max / 2, max]
  const step = Math.max(1, Math.floor(data.length / 5))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}. Total ${total} over ${data.length} days. Peak ${Math.max(0, ...data.map((d) => d.value))}.`} className={cn("h-auto w-full", className)}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--site-rule)" />
          <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--site-ink-3)">
            {Math.round(t)}
          </text>
        </g>
      ))}
      {area ? <path d={area} fill="var(--site-accent-wash)" /> : null}
      {line ? <path d={line} fill="none" stroke="var(--site-accent-ink)" strokeWidth="2" strokeLinejoin="round" /> : null}
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r="3" fill="var(--site-paper)" stroke="var(--site-accent-ink)" strokeWidth="1.5">
            <title>{`${d.label}: ${d.value}`}</title>
          </circle>
          {i % step === 0 ? (
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--site-ink-3)">
              {d.label.slice(5)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  )
}

export function BarList({ data, label, className }: { data: Point[]; label: string; className?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul aria-label={label} className={cn("grid gap-3", className)}>
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm">
          <span className="truncate text-[var(--site-ink-2)]">{d.label}</span>
          <span className="h-2.5 bg-[var(--site-rule)]" role="presentation">
            <span className="block h-full bg-[var(--site-ink)]" style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="sp-no text-right">{d.value}</span>
        </li>
      ))}
      {data.length === 0 ? <li className="text-sm text-[var(--site-ink-3)]">No data yet.</li> : null}
    </ul>
  )
}

export function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="bg-[var(--site-paper)] p-4">
      <p className="sp-data">{label}</p>
      <p className="mt-2 text-[2rem] font-bold leading-none tracking-[-0.03em]" style={{ fontFamily: "var(--site-display)" }}>
        {value}
      </p>
      {note ? <p className="mt-2 text-xs text-[var(--site-ink-3)]">{note}</p> : null}
    </div>
  )
}
