import Link from "next/link"

import { requireAdmin } from "@/lib/admin/auth"
import { listUsers, PAGE_SIZE } from "@/lib/admin/data"

export const dynamic = "force-dynamic"

type Props = { searchParams: Promise<{ q?: string; plan?: string; page?: string }> }

const day = (iso: string) => iso.slice(0, 10)

export default async function AdminUsers({ searchParams }: Props) {
  const { admin } = await requireAdmin()
  const sp = await searchParams
  const q = (sp.q ?? "").slice(0, 80)
  const plan = sp.plan ?? ""
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1)
  const { users, total } = await listUsers(admin, { q, page, plan })
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const href = (p: number) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), ...(plan ? { plan } : {}), page: String(p) })}`

  return (
    <div>
      <p className="sp-data">Console / Users</p>
      <h1 className="site-h2 mt-2">Users</h1>

      <form className="mt-6 flex flex-wrap items-end gap-3" role="search">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="q" className="sp-label">
            Email or username
          </label>
          <input id="q" name="q" defaultValue={q} className="sp-field" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="plan" className="sp-label">
            Plan
          </label>
          <select id="plan" name="plan" defaultValue={plan} className="sp-field">
            <option value="">All</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <button type="submit" className="site-btn site-btn-primary">
          <span className="site-btn-label">Search</span>
        </button>
      </form>

      <p className="sp-data mt-6">{total} users</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--site-ink)] text-left">
              {["Email", "Username", "Plan", "Expires", "Credits", "Sites", "Joined"].map((h) => (
                <th key={h} scope="col" className="sp-data py-2 pr-4 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--site-rule)] hover:bg-[var(--site-sheet)]">
                <td className="py-3 pr-4">
                  <Link href={`/admin/users/${u.id}`} className="underline decoration-[var(--site-rule-strong)] underline-offset-4 hover:decoration-[var(--site-ink)]">
                    {u.email ?? u.id}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-[var(--site-ink-2)]">{u.username ?? "-"}</td>
                <td className="py-3 pr-4">{u.plan}</td>
                <td className="py-3 pr-4 text-[var(--site-ink-2)]">{u.plan_expires_at ? day(u.plan_expires_at) : "-"}</td>
                <td className="sp-no py-3 pr-4">{u.balance}</td>
                <td className="sp-no py-3 pr-4">{u.portfolios}</td>
                <td className="py-3 text-[var(--site-ink-2)]">{day(u.created_at)}</td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-[var(--site-ink-3)]">
                  No users match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-6 flex items-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={href(page - 1)} className="underline underline-offset-4">
              Previous
            </Link>
          ) : null}
          <span className="sp-data">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={href(page + 1)} className="underline underline-offset-4">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  )
}
