/**
 * Maps natural language into structured knobs for the JSX LLM (no extra model call).
 */
export type GenerationDesignIntent = {
  styleLabel: string
  motionProfile: "subtle" | "expressive" | "experimental"
  density: "airy" | "compact"
}

export function transformDesignIntent(userText: string): GenerationDesignIntent {
  const t = userText.toLowerCase()

  let styleLabel = "modern editorial"
  if (/simple|minimal|clean|quiet|plain|basic/.test(t)) {
    styleLabel = "minimal Swiss-style"
  }
  if (/bold|loud|neon|strong|punchy|high.contrast/.test(t)) {
    styleLabel = "bold brutalist"
  }
  if (/premium|luxury|editorial|magazine|refined|sophisticated/.test(t)) {
    styleLabel = "premium editorial"
  }
  if (/playful|fun|experimental|weird|art/.test(t)) {
    styleLabel = "experimental playful"
  }

  let motionProfile: GenerationDesignIntent["motionProfile"] = "expressive"
  if (/subtle|calm|static|soft|gentle/.test(t)) {
    motionProfile = "subtle"
  }
  if (/wild|chaotic|overshoot|bounce|elastic|dramatic/.test(t)) {
    motionProfile = "experimental"
  }

  let density: GenerationDesignIntent["density"] = "airy"
  if (/dense|compact|tight|packed/.test(t)) {
    density = "compact"
  }

  return { styleLabel, motionProfile, density }
}
