import { STYLE_PRESET_UI } from "@/lib/design/stylePresetsUi"
import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { cn } from "@/lib/utils"

type Shape = "split" | "center" | "image" | "editorial" | "poster"

const SHAPE: Record<PortfolioStylePreset, Shape> = {
  minimal_dev: "split",
  creative_dev: "center",
  designer: "image",
  editorial: "editorial",
  experimental: "poster",
}

const display = { fontFamily: "var(--site-display)" } as const
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const

type LookThumbProps = {
  preset: PortfolioStylePreset
  /** Shown as the headline so the preview reads as "your" page. */
  name?: string
  role?: string
  className?: string
}

/**
 * A miniature of what each style produces: same palette as the real template, same overall layout.
 * Everything is sized in container units (cqw), so it stays sharp and in proportion from a 90px
 * card to a full-width preview.
 */
export function LookThumb({ preset, name = "Your Name", role = "Portfolio", className }: LookThumbProps) {
  const s = STYLE_PRESET_UI[preset]
  const shape = SHAPE[preset]
  const [first, ...rest] = name.trim().split(/\s+/)
  const last = rest.join(" ")
  const bar = (w: number, h: number, o = 1, extra?: string) => (
    <span className={cn("block rounded-full", extra)} style={{ width: `${w}%`, height: `${h}cqw`, background: s.ink, opacity: o }} />
  )
  const headline = (size: number, extra?: React.CSSProperties) => ({
    fontSize: `${size}cqw`,
    lineHeight: 0.98,
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: s.ink,
    ...display,
    ...extra,
  })

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden [container-type:inline-size]", className)} style={{ background: s.bg }} aria-hidden>
      {shape === "split" ? (
        <div className="grid h-full grid-cols-[1.2fr_1fr] gap-[6cqw] p-[7cqw]">
          <div className="flex min-w-0 flex-col justify-center gap-[3cqw]">
            <p className="truncate" style={headline(9.5)}>
              {first}
              {last ? <span className="block truncate">{last}</span> : null}
            </p>
            <p className="truncate" style={{ fontSize: "3cqw", color: s.ink, opacity: 0.6 }}>
              {role}
            </p>
            <span className="mt-[1cqw] block rounded-[0.8cqw]" style={{ width: "30%", height: "5.5cqw", background: s.ink }} />
          </div>
          <div className="flex flex-col justify-center gap-[4cqw]">
            {[0, 1].map((i) => (
              <span key={i} className="flex flex-col gap-[1.4cqw] border-t pt-[3cqw]" style={{ borderColor: `${s.ink}33` }}>
                {bar(70, 2.6, 0.85)}
                {bar(45, 1.6, 0.35)}
              </span>
            ))}
            <span className="flex gap-[2cqw]">
              {[0, 1, 2].map((i) => (
                <span key={i} className="block rounded-full border" style={{ borderColor: `${s.ink}55`, height: "3cqw", width: "9cqw" }} />
              ))}
            </span>
          </div>
        </div>
      ) : null}

      {shape === "center" ? (
        <div className="flex h-full flex-col items-center justify-center gap-[2.6cqw] p-[7cqw] text-center">
          <p className="max-w-full truncate" style={headline(10.5)}>
            {name}
          </p>
          <p style={{ fontSize: "3cqw", color: s.ink, opacity: 0.6 }}>{role}</p>
          <span className="flex gap-[2cqw]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="block rounded-full" style={{ background: s.accent, width: "8cqw", height: "2.6cqw", opacity: 1 - i * 0.25 }} />
            ))}
          </span>
          <span className="mt-[2cqw] block w-[76%] border-t" style={{ borderColor: `${s.ink}33`, height: 0 }} />
          <span className="block w-[76%] border-t" style={{ borderColor: `${s.ink}33`, height: "3cqw" }} />
        </div>
      ) : null}

      {shape === "image" ? (
        <div className="flex h-full flex-col gap-[4cqw] p-[6cqw]">
          <span className="block flex-1 rounded-[1.6cqw]" style={{ background: `${s.accent}2e` }}>
            <span className="m-[4cqw] block rounded-[1cqw]" style={{ background: s.accent, height: "40%", width: "24%" }} />
          </span>
          <span className="flex items-end justify-between gap-[4cqw]">
            <span className="flex min-w-0 flex-col gap-[1.2cqw]">
              <p className="truncate" style={headline(7.5)}>
                {name}
              </p>
              <p className="truncate" style={{ fontSize: "2.8cqw", color: s.ink, opacity: 0.55 }}>
                {role}
              </p>
            </span>
            <span className="block shrink-0 rounded-[0.8cqw]" style={{ background: s.ink, width: "20cqw", height: "5.5cqw" }} />
          </span>
        </div>
      ) : null}

      {shape === "editorial" ? (
        <div className="flex h-full flex-col justify-between p-[7cqw]">
          <span style={{ fontSize: "2.4cqw", letterSpacing: "0.18em", textTransform: "uppercase", color: s.accent, fontWeight: 700 }}>{role}</span>
          <p style={{ ...headline(11, serif), fontWeight: 700, letterSpacing: "-0.03em" }}>
            {first}
            {last ? <span className="block truncate">{last}</span> : null}
          </p>
          <span className="grid grid-cols-2 gap-[6cqw] border-t pt-[3.5cqw]" style={{ borderColor: `${s.ink}44` }}>
            <span className="flex flex-col gap-[1.3cqw]">
              {bar(100, 1.3, 0.35)}
              {bar(85, 1.3, 0.35)}
              {bar(92, 1.3, 0.35)}
            </span>
            <span className="flex flex-col gap-[1.3cqw]">
              {bar(80, 1.3, 0.35)}
              {bar(96, 1.3, 0.35)}
            </span>
          </span>
        </div>
      ) : null}

      {shape === "poster" ? (
        <div className="flex h-full flex-col justify-between p-[6cqw]">
          <p style={{ ...headline(14, { textTransform: "uppercase", lineHeight: 0.88 }) }}>
            {first}
            {last ? (
              <span className="flex items-end gap-[2cqw]">
                <span className="truncate">{last}</span>
                <span className="mb-[1.4cqw] block size-[3cqw] shrink-0 rounded-full" style={{ background: s.accent }} />
              </span>
            ) : null}
          </p>
          <span className="flex items-end justify-between">
            <span className="flex w-[48%] flex-col gap-[1.4cqw]">
              {bar(100, 1.4, 0.55)}
              {bar(70, 1.4, 0.55)}
            </span>
            <span className="block" style={{ background: s.ink, width: "20cqw", height: "5cqw" }} />
          </span>
        </div>
      ) : null}
    </div>
  )
}
