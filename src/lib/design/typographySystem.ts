import type { DesignIntelligenceStyle, TypographySpec } from "@/types/design"

const stacks: Record<
  DesignIntelligenceStyle,
  { heading: string; body: string }
> = {
  minimal: {
    heading: "ui-sans-serif, system-ui, Inter, 'Segoe UI', sans-serif",
    body: "ui-sans-serif, system-ui, Inter, 'Segoe UI', sans-serif",
  },
  creative: {
    heading: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    body: "ui-sans-serif, system-ui, 'Space Grotesk', Inter, sans-serif",
  },
  editorial: {
    heading: "'Playfair Display', Georgia, 'Times New Roman', serif",
    body: "ui-serif, Georgia, 'Iowan Old Style', serif",
  },
  experimental: {
    heading: "'Space Grotesk', ui-monospace, system-ui, sans-serif",
    body: "ui-sans-serif, system-ui, Inter, sans-serif",
  },
  corporate: {
    heading: "ui-sans-serif, system-ui, Inter, 'Segoe UI', sans-serif",
    body: "ui-sans-serif, system-ui, Inter, sans-serif",
  },
}

/**
 * Fluid type scales (clamp) + tracking for each intelligence style.
 */
export function getTypographySystem(style: DesignIntelligenceStyle): TypographySpec {
  const fontFamily = stacks[style]

  const headingScale =
    style === "editorial"
      ? "clamp(2.5rem, 6vw, 4.5rem)"
      : style === "experimental"
        ? "clamp(2.25rem, 5.5vw, 4rem)"
        : "clamp(2rem, 4.5vw, 3.5rem)"

  const bodyScale = style === "editorial" ? "clamp(1.05rem, 1.2vw, 1.2rem)" : "clamp(0.95rem, 1.1vw, 1.05rem)"

  const tracking =
    style === "editorial"
      ? { heading: "-0.02em", body: "0.01em" }
      : style === "minimal" || style === "corporate"
        ? { heading: "-0.03em", body: "0em" }
        : { heading: "-0.04em", body: "-0.01em" }

  const lineHeight =
    style === "editorial"
      ? { heading: "1.05", body: "1.65" }
      : { heading: "1.08", body: "1.55" }

  return {
    fontFamily,
    headingScale,
    bodyScale,
    tracking,
    lineHeight,
  }
}
