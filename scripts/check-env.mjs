/**
 * Runs before `next build` (see the `prebuild` script). Catches the env mistakes that leak secrets or
 * break production. It stops the build for a production deploy (Netlify CONTEXT=production, or ENFORCE_ENV=1)
 * and only warns everywhere else, so a local build without keys still works.
 */
const env = process.env
const enforce = env.ENFORCE_ENV === "1" || (env.NETLIFY === "true" && env.CONTEXT === "production")
const errors = []
const warnings = []

// 1. A NEXT_PUBLIC_ name is shipped to every browser. It must never look like a secret.
const publicAllow = new Set(["NEXT_PUBLIC_SUPABASE_ANON_KEY"])
for (const key of Object.keys(env)) {
  if (key.startsWith("NEXT_PUBLIC_") && !publicAllow.has(key) && /(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|TOKEN)/i.test(key)) {
    errors.push(`${key} is public (NEXT_PUBLIC_ is sent to the browser) but its name looks secret. Rename it without the prefix.`)
  }
}

const need = (key, hint) => {
  if (!env[key]) (enforce ? errors : warnings).push(`${key} is not set. ${hint}`)
}

need("NEXT_PUBLIC_SITE_URL", "Use https://dossier-cv.com")
need("NEXT_PUBLIC_SUPABASE_URL", "Supabase, Project Settings, API")
need("NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase, Project Settings, API, anon key")
need("SUPABASE_SERVICE_ROLE_KEY", "Server only. Needed for quotas and publish limits")
need("RATE_LIMIT_SALT", "Random 32+ characters")
if (!env.ADMIN_USER_IDS) warnings.push("ADMIN_USER_IDS is not set, so nobody can open the admin console.")
if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) warnings.push("BREVO_API_KEY or BREVO_SENDER_EMAIL is not set, so no app emails are sent.")
if (!env.GROQ_API_KEY && !env.GROQ_API_KEYS && !env.OPENROUTER_API_KEY) {
  ;(enforce ? errors : warnings).push("No LLM key set (GROQ_API_KEY, GROQ_API_KEYS or OPENROUTER_API_KEY). Resume reading falls back to the offline reader.")
}

if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY === env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  errors.push("SUPABASE_SERVICE_ROLE_KEY equals the anon key. Paste the service_role key from Supabase.")
}
if (enforce) {
  if (env.NEXT_PUBLIC_SITE_URL && !/^https:\/\//.test(env.NEXT_PUBLIC_SITE_URL)) errors.push("NEXT_PUBLIC_SITE_URL must start with https:// in production.")
  if (env.NEXT_PUBLIC_SITE_URL && /localhost|127\.0\.0\.1/.test(env.NEXT_PUBLIC_SITE_URL)) errors.push("NEXT_PUBLIC_SITE_URL points at localhost in production.")
  if (env.NEXT_PUBLIC_SITE_URL && /\/$/.test(env.NEXT_PUBLIC_SITE_URL)) errors.push("NEXT_PUBLIC_SITE_URL must not end with a slash.")
  if (env.RATE_LIMIT_SALT && env.RATE_LIMIT_SALT.length < 32) errors.push("RATE_LIMIT_SALT is shorter than 32 characters.")
  if (env.LLM_DEBUG === "1") warnings.push("LLM_DEBUG=1 in production logs model calls. Unset it.")
}

for (const w of warnings) console.warn(`[env] warning: ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`[env] ERROR: ${e}`)
  console.error(`[env] ${errors.length} problem(s). Fix them in Netlify, Site configuration, Environment variables.`)
  process.exit(1)
}
console.log(`[env] ok${enforce ? " (production checks enforced)" : ""}`)
