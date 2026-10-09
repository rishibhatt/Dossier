import type { ReactNode } from "react"

export type NavItem = { href: string; label: string }

type Props = {
  /** No nav when navStyle is "none" or only one destination exists. */
  nav: NavItem[] | null
  name: string
  role: string
  children: ReactNode
}

function Links({ items, className }: { items: NavItem[]; className: string }) {
  return (
    <ul className={className}>
      {items.map((it) => (
        <li key={it.href}>
          <a className="pf-nav__link" href={it.href}>
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

/**
 * Pure shell for all three layouts (stack / rail / wide are CSS, keyed by data-pf-shell on the root).
 * Nav is built from the sections that render. Narrow widths get a no-JS <details> menu.
 */
export function PortfolioShell({ nav, name, role, children }: Props) {
  return (
    <div className="pf-shell">
      {nav ? (
        <header className="pf-nav">
          <nav className="pf-wrap pf-nav__in" aria-label="Portfolio sections">
            <div className="pf-nav__id">
              <a className="pf-nav__brand" href="#pf-top">
                {name}
              </a>
              {role ? <p className="pf-nav__role">{role}</p> : null}
            </div>
            <Links items={nav} className="pf-nav__links" />
            <details className="pf-nav__menu">
              <summary>Menu</summary>
              <Links items={nav} className="pf-nav__menu-list" />
            </details>
          </nav>
        </header>
      ) : null}
      {/* the host page owns <main>; this is the skip-link target */}
      <div className="pf-main" id="pf-content">
        {children}
      </div>
    </div>
  )
}
