"use server"

import { revalidatePath } from "next/cache"

import { ROUTES } from "@/lib/constants/routes"
import { createServerSupabaseClient } from "@/lib/supabase/server"

/** Saves the two email choices for the signed-in user. Row level security limits the update to their own row. */
export async function saveEmailPrefsAction(formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from("users")
    .update({ email_product: formData.get("product") === "on", email_offers: formData.get("offers") === "on" })
    .eq("id", user.id)
  revalidatePath(ROUTES.settings)
}
