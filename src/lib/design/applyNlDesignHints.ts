import type { DesignConfig } from "@/types/designEngine"

/**
 * Deterministic tweaks from natural language — used by refine API and build-design vision notes.
 * Mutates a clone of `config` and returns it.
 */
export function applyNlDesignHints(config: DesignConfig, raw: string): DesignConfig {
  const cfg = structuredClone(config)
  const msg = raw.toLowerCase()
  const c = cfg.tokens.colors
  const t = cfg.tokens.typography.scale

  if (/(dramatic|hero|bigger|larger)/i.test(raw)) {
    t.hero = `clamp(4rem, 11vw, 9rem)`
    cfg.layout.heroVariant = "fullscreen-center"
  }

  if (/(green|emerald|nature)/i.test(raw)) {
    c.primary = "#10B981"
    c.accent = "#34D399"
    c.gradients.hero = "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #022c22 100%)"
  }

  if (/(pink|rose|magenta|fuchsia|barbie|blush)/i.test(raw)) {
    c.primary = "#EC4899"
    c.accent = "#F472B6"
    c.bg = "#12060c"
    c.bgSecondary = "#1f0d16"
    c.text = "#FCE7F3"
    c.textMuted = "#9D174D"
    c.surface = "rgba(236, 72, 153, 0.08)"
    c.surfaceHover = "rgba(236, 72, 153, 0.14)"
    c.border = "rgba(244, 114, 182, 0.25)"
    c.gradients.hero = "linear-gradient(145deg, #12060c 0%, #831843 40%, #9D174D 100%)"
    c.gradients.text = "linear-gradient(90deg, #FBCFE8, #F472B6)"
    c.gradients.surface = "linear-gradient(180deg, rgba(236,72,153,0.12), transparent)"
    c.gradients.mesh = "radial-gradient(circle at 20% 20%, rgba(236,72,153,0.35), transparent 45%)"
  }

  if (/(blue|navy|azure|ocean)/i.test(raw) && !/(navy|boardroom|corporate)/i.test(raw)) {
    c.primary = "#3B82F6"
    c.accent = "#38BDF8"
    c.gradients.hero = "linear-gradient(135deg, #0c1929 0%, #1e3a8a 50%, #0ea5e9 100%)"
  }

  if (/(purple|violet|lavender)/i.test(raw)) {
    c.primary = "#8B5CF6"
    c.accent = "#C084FC"
    c.gradients.hero = "linear-gradient(135deg, #0f0720 0%, #4c1d95 55%, #7c3aed 100%)"
  }

  if (/(orange|amber|sunset|warm)/i.test(raw)) {
    c.primary = "#F97316"
    c.accent = "#FBBF24"
    c.gradients.hero = "linear-gradient(135deg, #1c0a05 0%, #7c2d12 45%, #ea580c 100%)"
  }

  if (/(red|crimson|ruby)/i.test(raw)) {
    c.primary = "#EF4444"
    c.accent = "#FB7185"
    c.gradients.hero = "linear-gradient(135deg, #1a0505 0%, #7f1d1d 50%, #b91c1c 100%)"
  }

  if (/(monochrome|grayscale|grey|gray)\s*(only)?/i.test(raw) || /(black and white|b&w)/i.test(raw)) {
    c.primary = "#F4F4F5"
    c.accent = "#A1A1AA"
    c.text = "#FAFAFA"
    c.textMuted = "#A1A1AA"
  }

  if (/(minimal|calm|less|subtle)/i.test(raw)) {
    cfg.motion.preset = "fade-up"
    cfg.components.card = "flat"
    cfg.tokens.effects.glowSize = "0 0 0"
  }

  if (/(projects).*(before|first|above).*(experience|work)/i.test(raw)) {
    const order = [...cfg.layout.sectionOrder]
    const pi = order.indexOf("projects")
    const ei = order.indexOf("experience")
    if (pi >= 0 && ei >= 0 && pi > ei) {
      ;[order[pi], order[ei]] = [order[ei]!, order[pi]!]
      cfg.layout.sectionOrder = order
      cfg.sections = order.map((type) => {
        const prev = cfg.sections.find((s) => s.type === type)
        return prev ?? { type, variant: "default" }
      })
    }
  }

  if (/(typography|text).*(bigger|scale)/i.test(raw)) {
    const bump = (s: string) => s.replace(/([\d.]+)rem/g, (_, n: string) => `${(parseFloat(n) * 1.12).toFixed(3)}rem`)
    t.hero = bump(t.hero)
    t.h1 = bump(t.h1)
    t.body = bump(t.body)
  }

  if (/(dark mode|toggle|theme)/i.test(raw)) {
    const swap = c.bg
    c.bg = c.text
    c.text = swap
  }

  if (/\b(lighter|pastel)\b.*\b(bg|background)\b/i.test(raw) || /\b(bg|background)\b.*\b(lighter|pastel)\b/i.test(raw)) {
    c.bg = "#FDF2F8"
    c.bgSecondary = "#FCE7F3"
    c.text = "#1a0a12"
    c.textMuted = "#831843"
  }

  return cfg
}
