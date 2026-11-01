import Link from "next/link"

import { requireAdmin } from "@/lib/admin/auth"

import { setGalleryStatusAction } from "../../actions"

export const dynamic = "force-dynamic"

type Doc = { meta?: { title?: string }; sections?: { type?: string; data?: { name?: string; title?: string } }[] }
const STATUSES = ["pending", "approved", "rejected"] as const
const LABEL = { pending: "Waiting for review", approved: "Shown on /portfolio-examples", rejected: "Kept out" } as const
const when = (iso: string | null) => (iso ? iso.slice(0, 16).replace("T", " ") : "-")

function identity(payload: unknown) {
  const doc = (payload as { document?: Doc } | null)?.document
  const hero = doc?.sections?.find((s) => s.type === "hero")?.data
  return { name: hero?.name?.trim() || doc?.meta?.title?.trim() || "Portfolio", role: hero?.title?.trim() || "" }
}

function StatusButton({ siteId, status, children, primary = false }: { siteId: string; status: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <form action={setGalleryStatusAction}>
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`site-btn site-btn-sm ${primary ? "site-btn-primary" : "site-btn-ghost"}`}>
        <span className="site-btn-label">{children}</span>
      </button>
    </form>
  )
}

/** Sites whose owners opted in to the public gallery. Nothing is shown publicly until it is approved here. */
export default async function AdminGallery() {
  const { admin } = await requireAdmin()
  const { data } = await admin
    .from("published_portfolios")
    .select("id, slug, payload, user_id, gallery_status, gallery_requested_at")
    .not("gallery_status", "is", null)
    .order("gallery_requested_at", { ascending: false })
    .limit(300)
  const rows = data ?? []
  const ids = [...new Set(rows.map((r) => r.user_id).filter((v): v is string => Boolean(v)))]
  const { data: owners } = ids.length ? await admin.from("users").select("id, email").in("id", ids) : { data: [] }
  const emailOf = new Map((owners ?? []).map((o) => [o.id, o.email]))

  return (
    <div>
      <p className="sp-data">Console / Gallery</p>
      <h1 className="site-h2 mt-2">Gallery</h1>
      <p className="site-body mt-3 max-w-[65ch]">
        Check each site before approving: real content (not a sample left unedited), nothing offensive, and no personal data the owner would not want public, such as a
        home address or ID number. Approved sites appear on{" "}
        <a href="/portfolio-examples" target="_blank" rel="noopener" className="underline underline-offset-4">
          /portfolio-examples
        </a>{" "}
        at once.
      </p>

      {STATUSES.map((status) => {
        const list = rows.filter((r) => r.gallery_status === status)
        return (
          <section key={status} aria-labelledby={`g-${status}`} className="mt-10">
            <h2 id={`g-${status}`} className="site-h3 flex items-baseline justify-between gap-3 border-b border-[var(--site-ink)] pb-2">
              {LABEL[status]}
              <span className="sp-data">{list.length}</span>
            </h2>
            <ul>
              {list.map((r) => {
                const { name, role } = identity(r.payload)
                return (
                  <li key={r.id} className="grid gap-4 border-b border-[var(--site-rule)] py-4 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-center">
                    <a href={`/p/${r.slug}`} target="_blank" rel="noopener" className="block overflow-hidden border border-[var(--site-rule-strong)] [border-radius:2px]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- generated share card */}
                      <img src={`/og/site/${encodeURIComponent(r.slug)}`} alt="" width={1200} height={630} loading="lazy" className="block aspect-[1200/630] w-full bg-[var(--site-sheet)] object-cover" />
                    </a>
                    <div className="min-w-0">
                      <p className="font-semibold">{name}</p>
                      {role ? <p className="text-sm text-[var(--site-ink-2)]">{role}</p> : null}
                      <p className="sp-data mt-1 break-all">
                        <a href={`/p/${r.slug}`} target="_blank" rel="noopener" className="underline underline-offset-4">
                          /p/{r.slug}
                        </a>
                        {" · "}
                        {r.user_id ? (
                          <Link href={`/admin/users/${r.user_id}`} className="underline underline-offset-4">
                            {emailOf.get(r.user_id) ?? r.user_id}
                          </Link>
                        ) : (
                          "no owner"
                        )}
                        {" · asked "}
                        {when(r.gallery_requested_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {status !== "approved" ? (
                        <StatusButton siteId={r.id} status="approved" primary>
                          Approve
                        </StatusButton>
                      ) : null}
                      {status !== "rejected" ? (
                        <StatusButton siteId={r.id} status="rejected">
                          {status === "approved" ? "Remove" : "Reject"}
                        </StatusButton>
                      ) : null}
                      {status === "rejected" ? (
                        <StatusButton siteId={r.id} status="pending">
                          Back to queue
                        </StatusButton>
                      ) : null}
                    </div>
                  </li>
                )
              })}
              {list.length === 0 ? <li className="py-4 text-sm text-[var(--site-ink-3)]">None.</li> : null}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
