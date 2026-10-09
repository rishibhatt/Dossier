import { redirect } from "next/navigation"

import { ROUTES } from "@/lib/constants/routes"

/** Retired with the JSX engine. Kept as a redirect so old bookmarks do not 404. */
export default function LivePreviewPage() {
  redirect(ROUTES.build)
}
