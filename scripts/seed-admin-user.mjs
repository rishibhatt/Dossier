import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const targetEmail = "bhattrishu07@gmail.com"
const targetPassword = "Starplus#123"

// Load env variables
function loadEnv() {
  const envFiles = [".env.local", ".env"]
  const env = {}
  for (const f of envFiles) {
    const full = resolve(process.cwd(), f)
    if (!existsSync(full)) continue
    const content = readFileSync(full, "utf8")
    for (const line of content.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIdx = trimmed.indexOf("=")
      if (eqIdx === -1) continue
      const k = trimmed.slice(0, eqIdx).trim()
      let v = trimmed.slice(eqIdx + 1).trim()
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
      if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1)
      if (!env[k]) env[k] = v
    }
  }
  return env
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env / .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function run() {
  console.log(`Connecting to Supabase at ${supabaseUrl}...`)

  // Check if user exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error("Failed to list users:", listError)
    process.exit(1)
  }

  let user = usersData.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase())
  let userId

  if (user) {
    console.log(`User ${targetEmail} already exists with ID: ${user.id}. Updating password and confirming email...`)
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: targetPassword,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, role: "admin" },
    })
    if (updateError) {
      console.error("Failed to update user:", updateError)
      process.exit(1)
    }
    userId = updated.user.id
    console.log(`User password updated and email confirmed successfully.`)
  } else {
    console.log(`Creating user ${targetEmail}...`)
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: { role: "admin" },
    })
    if (createError) {
      console.error("Failed to create user:", createError)
      process.exit(1)
    }
    userId = created.user.id
    console.log(`User created successfully with ID: ${userId}`)
  }

  // Ensure public.users entry
  const { error: upsertError } = await supabase
    .from("users")
    .upsert({
      id: userId,
      email: targetEmail,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })

  if (upsertError) {
    console.warn("Warning upserting into public.users:", upsertError.message)
  } else {
    console.log(`public.users row synced for ${userId}.`)
  }

  // Update ADMIN_USER_IDS in .env and .env.local
  function updateAdminEnv(fileName) {
    const filePath = resolve(process.cwd(), fileName)
    let content = existsSync(filePath) ? readFileSync(filePath, "utf8") : ""
    
    const adminLineRegex = /^ADMIN_USER_IDS=(.*)$/m
    const match = content.match(adminLineRegex)

    if (match) {
      const existingIds = match[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
      if (!existingIds.includes(userId)) {
        existingIds.push(userId)
      }
      content = content.replace(adminLineRegex, `ADMIN_USER_IDS=${existingIds.join(",")}`)
    } else {
      content += (content.endsWith("\n") ? "" : "\n") + `ADMIN_USER_IDS=${userId}\n`
    }
    writeFileSync(filePath, content, "utf8")
    console.log(`Updated ${fileName} with ADMIN_USER_IDS including ${userId}`)
  }

  updateAdminEnv(".env")
  updateAdminEnv(".env.local")

  console.log(`\nSUCCESS! Admin user ready:`)
  console.log(`Email: ${targetEmail}`)
  console.log(`UUID: ${userId}`)
  console.log(`ADMIN_USER_IDS configured.`)
}

run().catch((e) => {
  console.error("Unexpected error:", e)
  process.exit(1)
})
