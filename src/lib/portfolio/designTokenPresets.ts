import type { DesignColorTokens, DesignEffectsTokens, DesignTypographyTokens } from "@/types/resolvedDesignConfig"

export type StudioDesignPresetId = "minimal" | "dark" | "neon" | "terminal"

type PresetPatch = {
  colors: Partial<DesignColorTokens>
  typography?: Partial<Pick<DesignTypographyTokens, "displayFont" | "bodyFont">>
  effects?: Partial<Pick<DesignEffectsTokens, "borderRadius">>
}

const mesh = (a: string, b: string) =>
  `radial-gradient(1200px circle at 20% 10%, ${a}, transparent 55%), radial-gradient(900px circle at 80% 30%, ${b}, transparent 50%)`

export const STUDIO_DESIGN_PRESETS: Record<StudioDesignPresetId, PresetPatch> = {
  minimal: {
    colors: {
      bg: "#fafafa",
      bgSecondary: "#ffffff",
      surface: "#ffffff",
      surfaceHover: "#f4f4f5",
      border: "#e4e4e7",
      text: "#18181b",
      textMuted: "#71717a",
      primary: "#18181b",
      accent: "#52525b",
      gradients: {
        hero: "linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)",
        surface: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        text: "linear-gradient(90deg, #18181b, #3f3f46)",
        border: "linear-gradient(90deg, #e4e4e7, #fafafa)",
        mesh: mesh("#e4e4e7", "#d4d4d8"),
      },
    },
    typography: { displayFont: "Inter", bodyFont: "Inter" },
    effects: { borderRadius: "rounded-lg" },
  },
  dark: {
    colors: {
      bg: "#09090b",
      bgSecondary: "#18181b",
      surface: "#18181b",
      surfaceHover: "#27272a",
      border: "rgba(255,255,255,0.08)",
      text: "#fafafa",
      textMuted: "#a1a1aa",
      primary: "#a78bfa",
      accent: "#38bdf8",
      gradients: {
        hero: "linear-gradient(180deg, #09090b 0%, #18181b 100%)",
        surface: "linear-gradient(180deg, #18181b 0%, #09090b 100%)",
        text: "linear-gradient(90deg, #fafafa, #d4d4d8)",
        border: "linear-gradient(90deg, rgba(255,255,255,0.12), transparent)",
        mesh: mesh("#4c1d95", "#0e7490"),
      },
    },
    typography: { displayFont: "Inter", bodyFont: "Inter" },
    effects: { borderRadius: "rounded-xl" },
  },
  neon: {
    colors: {
      bg: "#0b0220",
      bgSecondary: "#120a2e",
      surface: "#1a0f3d",
      surfaceHover: "#251456",
      border: "rgba(236,72,153,0.25)",
      text: "#fae8ff",
      textMuted: "#e9d5ff",
      primary: "#f472b6",
      accent: "#22d3ee",
      gradients: {
        hero: "linear-gradient(135deg, #0b0220 0%, #312e81 45%, #0b0220 100%)",
        surface: "linear-gradient(180deg, #1a0f3d 0%, #0b0220 100%)",
        text: "linear-gradient(90deg, #fae8ff, #c4b5fd)",
        border: "linear-gradient(90deg, rgba(244,114,182,0.35), rgba(34,211,238,0.2))",
        mesh: mesh("#db2777", "#06b6d4"),
      },
    },
    typography: { displayFont: "Poppins", bodyFont: "Inter" },
    effects: { borderRadius: "rounded-2xl" },
  },
  terminal: {
    colors: {
      bg: "#0c0c0c",
      bgSecondary: "#111111",
      surface: "#141414",
      surfaceHover: "#1c1c1c",
      border: "#22c55e",
      text: "#ecfccb",
      textMuted: "#86efac",
      primary: "#22c55e",
      accent: "#a3e635",
      gradients: {
        hero: "linear-gradient(180deg, #0c0c0c 0%, #052e16 100%)",
        surface: "linear-gradient(180deg, #141414 0%, #0c0c0c 100%)",
        text: "linear-gradient(90deg, #ecfccb, #bbf7d0)",
        border: "linear-gradient(90deg, #22c55e, #4ade80)",
        mesh: mesh("#14532d", "#166534"),
      },
    },
    typography: { displayFont: "IBM Plex Mono", bodyFont: "IBM Plex Mono" },
    effects: { borderRadius: "rounded-none" },
  },
}
