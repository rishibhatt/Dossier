import { notFound } from "next/navigation"

import { buildSample, seedFrom } from "../buildSample"
import { TemplatePreviewClient } from "../preview-client"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/** Dev-only: one template full-page (iframes in /dev/templates). ?sample=dense|sparse ?seed=N ?compact=1 */
export default async function TemplatePreviewPage({ params, searchParams }: Props) {
  if (process.env.NODE_ENV === "production") notFound()
  const { id } = await params
  const sp = await searchParams
  const built = buildSample(id, typeof sp.sample === "string" ? sp.sample : undefined, seedFrom(sp.seed))
  if (!built) notFound()
  return <TemplatePreviewClient document={built.document} designConfig={built.designConfig} compact={sp.compact === "1"} motion={sp.motion !== "0"} />
}
