"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { CircleHelp, GripVertical, Plus, Trash2 } from "lucide-react"
import { nanoid } from "nanoid"

import { siteConfig } from "@/config/site"
import { CopyText } from "@/features/tools/CopyText"
import { BrandIcon } from "@/features/tools/BrandIcon"
import {
  blankPage,
  cleanPage,
  displayUrl,
  githubPhoto,
  guessTitle,
  MAX_LINKS,
  normalizeUrl,
  platformOf,
  safeImageUrl,
  THEME_IDS,
  THEMES,
  upgradeDraft,
  visibleLinks,
  type LinkItem,
  type LinkPage,
} from "@/features/tools/linkPage"
import { LinkPageMotion, RemoteImage } from "@/features/tools/LinkPageClient"
import { LinkPageView } from "@/features/tools/LinkPageView"
import { ToolHandoff } from "@/features/tools/ToolHandoff"
import { useSaved } from "@/features/tools/useSaved"
import { ROUTES } from "@/lib/constants/routes"
import { USERNAME_PATTERN } from "@/lib/profile/username"

gsap.registerPlugin(useGSAP)

const SELF = `${ROUTES.tools}/link-in-bio`
const HOST = siteConfig.url.replace(/^https?:\/\//, "")

type Account =
  | { status: "loading" | "anon" }
  | {
      status: "ready"
      username: string | null
      avatarUrl: string | null
      saved: LinkPage | null
      published: boolean
    }

/** Drafts from the first version of this tool (name, role, up to five label/url pairs) carry over. */
type LegacyRow = { label: string; url: string }

export function LinkInBio() {
  const [oldName] = useSaved("bio_name", "")
  const [oldRole] = useSaved("bio_role", "")
  const [oldLinks] = useSaved<LegacyRow[]>("bio_links", [])
  const legacy = useMemo<LinkPage>(
    () => ({
      ...blankPage(),
      name: oldName,
      bio: oldRole,
      links: oldLinks
        .filter((l) => l.url.trim())
        .map((l, k) => ({
          id: `old-${k}`,
          title: l.label,
          url: normalizeUrl(l.url) ?? l.url,
          on: true,
          icon: false,
        })),
    }),
    [oldName, oldRole, oldLinks]
  )
  const [raw, setRaw] = useSaved<LinkPage>("bio_page", legacy)
  // Drafts saved before the photo link and the five looks get the missing fields filled in.
  const page = useMemo(() => upgradeDraft(raw), [raw])
  const setPage = (u: LinkPage | ((p: LinkPage) => LinkPage)) => setRaw((p) => (typeof u === "function" ? u(upgradeDraft(p)) : u))
  const [account, setAccount] = useState<Account>({ status: "loading" })

  useEffect(() => {
    let live = true
    fetch("/api/link-page")
      .then(async (res) => {
        if (!live) return
        const j = res.ok ? await res.json() : null
        if (!j?.signedIn) return setAccount({ status: "anon" })
        setAccount({
          status: "ready",
          username: j.username,
          avatarUrl: j.avatarUrl,
          saved: j.page,
          published: j.published,
        })
        // A new device: start from the saved page instead of an empty draft.
        if (j.page && !localStorage.getItem("dossier_tool_bio_page")) setPage(j.page)
      })
      .catch(() => live && setAccount({ status: "anon" }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, [])

  const edit = (patch: Partial<LinkPage>) => setPage((p) => ({ ...p, ...patch }))
  const editLink = (id: string, patch: Partial<LinkItem>) =>
    setPage((p) => ({
      ...p,
      links: p.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }))

  const ready = account.status === "ready" ? account : null
  const handle = ready?.username ?? null
  const [badLink, setBadLink] = useState<string | null>(null)

  const { buttons, icons } = visibleLinks(page)
  const plain = [page.name, page.bio, "", ...[...buttons, ...icons].map((l) => `${l.title}: ${displayUrl(l.href)}`)].join("\n").trim()

  return (
    <div className="grid gap-16">
      <div className="lb">
        <div>
          <Profile page={page} edit={edit} avatarUrl={ready?.avatarUrl ?? null} />
          <Links page={page} setPage={setPage} editLink={editLink} badLink={badLink} />
          <Themes page={page} edit={edit} />
        </div>

        <div className="lb-side">
          <div className="lb-plate">
            <div className="lb-plate-view">
              <LinkPageMotion theme={page.theme} name={page.name}>
                <LinkPageView preview page={page} handle={handle} avatarUrl={ready?.avatarUrl} />
              </LinkPageMotion>
            </div>
            <div className="lb-plate-cap">
              <span className="sp-data">Preview</span>
              <span className="sp-data truncate">
                {HOST}/l/{handle ?? "yourname"}
              </span>
            </div>
          </div>
          <Publish account={account} setAccount={setAccount} page={page} setPage={setPage} onBadLink={setBadLink} />
          <div className="lb-publish flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--site-ink-2)]">For an email signature or a CV, copy it as text.</span>
            <CopyText text={plain} label="Copy text" />
          </div>
        </div>
      </div>

      <ToolHandoff
        title="Make the first link your work."
        body="Upload your resume and Dossier sets it as a portfolio site. Put that link at the top of this page."
      />
    </div>
  )
}

function Profile({ page, edit, avatarUrl }: { page: LinkPage; edit: (p: Partial<LinkPage>) => void; avatarUrl: string | null }) {
  const gh = githubPhoto(page)
  const photo = safeImageUrl(page.photoUrl) ?? safeImageUrl(avatarUrl)
  // The image-link tip closes on a tap or click anywhere else, like a tooltip.
  const tipRef = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (tipRef.current?.open && !tipRef.current.contains(e.target as Node)) tipRef.current.removeAttribute("open")
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [])
  return (
    <section className="lb-block" aria-labelledby="lb-profile">
      <div className="lb-head">
        <h2 id="lb-profile">Profile</h2>
      </div>
      <div className="lb-sheet">
        <div className="lb-cell">
          <label htmlFor="lb-name">Name</label>
          <input
            id="lb-name"
            className="lb-bare"
            value={page.name}
            onChange={(e) => edit({ name: e.target.value.slice(0, 60) })}
            placeholder="Dev Raman"
            autoComplete="name"
          />
        </div>
        <div className="lb-cell">
          <label htmlFor="lb-bio">Bio</label>
          <textarea
            id="lb-bio"
            className="lb-bare"
            rows={2}
            value={page.bio}
            onChange={(e) => edit({ bio: e.target.value.slice(0, 160) })}
            placeholder="Freelance product designer in Pune. Open to contract work."
          />
          <span className="sp-data lb-count" aria-hidden>
            {page.bio.length}/160
          </span>
        </div>
        <div className="lb-cell items-center">
          <span id="lb-photo-label" className="text-[0.8125rem] font-semibold text-[var(--site-ink-2)]">
            Photo
          </span>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--site-ink-2)]">{page.photo ? "Shown on your page" : "Off: your initials show instead"}</span>
            <button
              type="button"
              role="switch"
              aria-checked={page.photo}
              aria-labelledby="lb-photo-label"
              className="lb-switch"
              onClick={() => edit({ photo: !page.photo })}
            >
              <span />
            </button>
          </div>
        </div>
        {page.photo ? (
          <div className="lb-cell">
            <label htmlFor="lb-photo-url">Image link</label>
            <div className="grid gap-2 pb-2.5">
              <div className="flex items-center gap-3">
                {photo ? (
                  <RemoteImage key={photo} src={photo} size={40} className="lb-photo-thumb" fallback={<span className="lb-photo-thumb" aria-hidden />} />
                ) : null}
                <input
                  id="lb-photo-url"
                  className="lb-bare"
                  value={page.photoUrl}
                  onChange={(e) => edit({ photoUrl: e.target.value.slice(0, 500) })}
                  placeholder={avatarUrl ? "Empty uses your account photo" : "https://... a photo already online"}
                  inputMode="url"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={(Boolean(page.photoUrl.trim()) && !safeImageUrl(page.photoUrl)) || undefined}
                  aria-describedby="lb-photo-help"
                />
              </div>
              {(gh && page.photoUrl !== gh) || (avatarUrl && page.photoUrl) ? (
                <div className="flex flex-wrap gap-2">
                  {gh && page.photoUrl !== gh ? (
                    <button type="button" className="lb-mark !h-8" onClick={() => edit({ photoUrl: gh })}>
                      Use my GitHub photo
                    </button>
                  ) : null}
                  {avatarUrl && page.photoUrl ? (
                    <button type="button" className="lb-mark !h-8" onClick={() => edit({ photoUrl: "" })}>
                      Use my account photo
                    </button>
                  ) : null}
                </div>
              ) : null}
              <p id="lb-photo-help" className="text-xs text-[var(--site-ink-2)]">
                Paste the address of a photo that is already online. Nothing is uploaded or stored by Dossier.
              </p>
              <details className="lb-tip" ref={tipRef} onKeyDown={(e) => e.key === "Escape" && tipRef.current?.removeAttribute("open")}>
                <summary>
                  <CircleHelp className="size-4" aria-hidden />
                  How do I get an image link?
                </summary>
                <div className="lb-tip-pop" role="note">
                  <ol>
                    <li>Open a page that shows your photo: GitHub, X, your own website or a photo you posted online.</li>
                    <li>
                      On a computer, right-click the photo and choose <b>Copy image address</b> (Safari: <b>Copy Image Address</b>).
                    </li>
                    <li>
                      On a phone, press and hold the photo, tap <b>Open image in new tab</b>, then copy the address at the top.
                    </li>
                    <li>Paste it in the box above. It should start with https:// and the photo appears in the preview.</li>
                  </ol>
                  <p>
                    Have a GitHub link in your list? Use the GitHub photo button: it always stays up to date. LinkedIn photo addresses stop working after a few
                    weeks, so they are best avoided.
                  </p>
                </div>
              </details>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function Links({
  page,
  setPage,
  editLink,
  badLink,
}: {
  page: LinkPage
  setPage: (u: (p: LinkPage) => LinkPage) => void
  editLink: (id: string, patch: Partial<LinkItem>) => void
  badLink: string | null
}) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [added, setAdded] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const full = page.links.length >= MAX_LINKS
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useGSAP(
    () => {
      if (!added) return
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          `[data-id="${added}"]`,
          { y: -10, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "expo.out",
            clearProps: "transform,opacity,visibility",
          }
        )
      })
    },
    { scope: listRef, dependencies: [added] }
  )

  function add(e: FormEvent) {
    e.preventDefault()
    const href = normalizeUrl(draft)
    if (!href) return setError(draft.trim() ? "That is not a web address or an email." : "Paste a link first.")
    const id = nanoid(8)
    const guessed = guessTitle(href)
    setPage((p) => ({
      ...p,
      links: [{ id, title: guessed, url: href, on: true, icon: false }, ...p.links],
    }))
    setDraft("")
    setError("")
    setAdded(id)
    // A website (not a known profile): read its own name and icon. Best effort, the link works without them.
    if (!platformOf(href)) {
      fetch(`/api/link-meta?url=${encodeURIComponent(href)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((m: { title: string | null; icon: string | null } | null) => {
          if (!m) return
          setPage((p) => ({
            ...p,
            links: p.links.map((l) =>
              l.id === id
                ? {
                    ...l,
                    favicon: m.icon ?? undefined,
                    title: l.title === guessed && m.title ? m.title : l.title,
                  }
                : l
            ),
          }))
        })
        .catch(() => {})
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setPage((p) => {
      const from = p.links.findIndex((l) => l.id === active.id)
      const to = p.links.findIndex((l) => l.id === over.id)
      return { ...p, links: arrayMove(p.links, from, to) }
    })
  }

  return (
    <section className="lb-block" aria-labelledby="lb-links">
      <div className="lb-head">
        <h2 id="lb-links">Links</h2>
        <span className="sp-data">
          {page.links.length}/{MAX_LINKS}
        </span>
      </div>
      <form className="lb-add" onSubmit={add} noValidate>
        <label htmlFor="lb-new" className="sr-only">
          Add a link
        </label>
        <input
          id="lb-new"
          className="sp-field"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 500))}
          placeholder={full ? `${MAX_LINKS} links is the limit` : "Paste a link or an email address"}
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          disabled={full}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? "lb-new-error" : undefined}
        />
        <button type="submit" className="site-btn site-btn-primary site-btn-sm shrink-0" disabled={full}>
          <Plus className="size-4" aria-hidden />
          <span className="site-btn-label">Add</span>
        </button>
      </form>
      {error ? (
        <p id="lb-new-error" className="lb-error" role="alert">
          {error}
        </p>
      ) : null}

      {page.links.length ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={page.links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <ul ref={listRef} className="lb-list">
              {page.links.map((l, k) => (
                <Row
                  key={l.id}
                  link={l}
                  n={k + 1}
                  invalid={badLink === l.id}
                  onChange={(patch) => editLink(l.id, patch)}
                  onRemove={() =>
                    setPage((p) => ({
                      ...p,
                      links: p.links.filter((x) => x.id !== l.id),
                    }))
                  }
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="mt-3 text-sm text-[var(--site-ink-2)]">Start with the link you most want opened: your portfolio, a case study or your calendar.</p>
      )}
      <p className="mt-3 text-xs text-[var(--site-ink-2)]">
        Drag the handle to reorder. Profiles such as LinkedIn or GitHub can sit as small icons under your buttons.
      </p>
    </section>
  )
}

function Row({
  link,
  n,
  invalid,
  onChange,
  onRemove,
}: {
  link: LinkItem
  n: number
  invalid: boolean
  onChange: (p: Partial<LinkItem>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })
  const href = normalizeUrl(link.url)
  const platform = href ? platformOf(href) : null
  const name = link.title.trim() || (href ? guessTitle(href) : `link ${n}`)
  const broken = invalid || (Boolean(link.url.trim()) && !href)
  const favicon = safeImageUrl(link.favicon)

  return (
    <li
      ref={setNodeRef}
      data-id={link.id}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="lb-row"
      data-off={!link.on || undefined}
      data-dragging={isDragging || undefined}
      data-invalid={broken || undefined}
    >
      <button type="button" ref={setActivatorNodeRef} className="lb-grip" aria-label={`Move ${name}`} {...attributes} {...listeners}>
        <GripVertical className="size-4" aria-hidden />
      </button>
      <span className="lb-ico" aria-hidden>
        {platform ? (
          <BrandIcon name={platform.key} />
        ) : favicon ? (
          <RemoteImage key={favicon} src={favicon} size={16} className="lb-favicon" fallback={name[0]?.toUpperCase()} />
        ) : (
          name[0]?.toUpperCase()
        )}
      </span>
      <div className="lb-text">
        <input
          className="lb-title"
          aria-label={`Title of link ${n}`}
          value={link.title}
          placeholder={href ? guessTitle(href) : "Title"}
          onChange={(e) => onChange({ title: e.target.value.slice(0, 60) })}
        />
        <input
          className="lb-url"
          aria-label={`Address of link ${n}`}
          aria-invalid={broken || undefined}
          value={link.url}
          placeholder="https://"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(e) => onChange({ url: e.target.value.slice(0, 500), favicon: undefined })}
        />
      </div>
      <div className="lb-tools">
        {platform ? (
          <button
            type="button"
            className="lb-mark"
            aria-pressed={link.icon}
            title="Show as a small icon under your buttons"
            onClick={() => onChange({ icon: !link.icon })}
          >
            Icon
          </button>
        ) : null}
        <button
          type="button"
          role="switch"
          aria-checked={link.on}
          aria-label={`Show ${name} on the page`}
          className="lb-switch"
          onClick={() => onChange({ on: !link.on })}
        >
          <span />
        </button>
        <button type="button" className="lb-tool" aria-label={`Remove ${name}`} onClick={onRemove}>
          <Trash2 aria-hidden />
        </button>
      </div>
    </li>
  )
}

function Themes({ page, edit }: { page: LinkPage; edit: (p: Partial<LinkPage>) => void }) {
  return (
    <section className="lb-block" aria-labelledby="lb-theme">
      <div className="lb-head">
        <h2 id="lb-theme">Look</h2>
      </div>
      <div className="lb-themes" role="radiogroup" aria-labelledby="lb-theme">
        {THEME_IDS.map((id) => {
          const t = THEMES[id]
          return (
            <button key={id} type="button" role="radio" aria-checked={page.theme === id} className="lb-theme" onClick={() => edit({ theme: id })}>
              <span
                className="lb-swatch"
                style={{
                  background: t.bg,
                  color: t.ink,
                  boxShadow: `inset 0 0 0 1px ${t.line}`,
                }}
                aria-hidden
              >
                <b style={id === "marquee" ? { background: t.ink, color: t.bg } : undefined}>Aa</b>
                <i
                  style={{
                    background: t.btn,
                    boxShadow: `inset 0 0 0 1px ${t.line}`,
                  }}
                />
                <i
                  style={{
                    background: t.btn,
                    boxShadow: `inset 0 0 0 1px ${t.line}`,
                    width: "70%",
                  }}
                />
              </span>
              <span className="flex items-baseline justify-between gap-1">
                {t.label}
                {t.motion ? <span className="text-[0.6875rem] font-medium text-[var(--site-accent-ink)]">Animated</span> : null}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const USERNAME_ERRORS: Record<string, string> = {
  invalid_username: "Use 3-30 characters: lowercase letters, numbers and hyphens.",
  username_reserved: "That name is reserved. Try another.",
  username_taken: "Someone already has that name. Try another.",
}

function Publish({
  account,
  setAccount,
  page,
  setPage,
  onBadLink,
}: {
  account: Account
  setAccount: (a: Account) => void
  page: LinkPage
  setPage: (p: LinkPage) => void
  onBadLink: (id: string | null) => void
}) {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  if (account.status !== "ready") {
    if (account.status === "loading") return <div className="lb-publish h-12" aria-hidden />
    return (
      <div className="lb-publish grid gap-2">
        <a href={`${ROUTES.signup}?next=${encodeURIComponent(SELF)}`} className="site-btn site-btn-primary w-full">
          <span className="site-btn-label">Publish with a free account</span>
        </a>
        <p className="text-xs text-[var(--site-ink-2)]">
          Your page goes live at {HOST}/l/yourname. This draft stays in this browser while you sign up. No card.
        </p>
      </div>
    )
  }

  // Narrowed once here: the handlers below close over it.
  const ready = account
  const cleaned = cleanPage(page)
  const dirty = !account.saved || !cleaned.ok || JSON.stringify(cleaned.page) !== JSON.stringify(account.saved)

  async function claim(e: FormEvent) {
    e.preventDefault()
    const wanted = name.trim().toLowerCase()
    if (!USERNAME_PATTERN.test(wanted)) return setError(USERNAME_ERRORS.invalid_username!)
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/profile/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: wanted }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) return setError(j.message ?? USERNAME_ERRORS[j.error] ?? "That name did not save. Try again.")
      setAccount({ ...ready, username: j.username })
    } catch {
      setError("You seem to be offline. Try again.")
    } finally {
      setBusy(false)
    }
  }

  async function save(published: boolean) {
    if (!page.name.trim()) return setError("Add your name first.")
    setBusy(true)
    setError("")
    onBadLink(null)
    try {
      const res = await fetch("/api/link-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, published }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (j.error === "invalid_link" && typeof j.index === "number") onBadLink(page.links[j.index]?.id ?? null)
        return setError(j.message ?? "Your page did not save. Try again.")
      }
      setPage(j.page)
      setAccount({ ...ready, saved: j.page, published: j.published })
    } catch {
      setError("You seem to be offline. Your draft is safe here. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const url = account.username ? `${siteConfig.url}/l/${account.username}` : ""

  return (
    <div className="lb-publish grid gap-2">
      {!account.username ? (
        <form onSubmit={claim} className="grid gap-2" noValidate>
          <label htmlFor="lb-handle" className="sp-label !mb-0">
            Choose your link
          </label>
          <div className="lb-add">
            <div className="lb-live flex-1 !border-[var(--site-rule-strong)] focus-within:!border-[var(--site-accent-ink)]">
              <span className="sp-data shrink-0">{HOST}/l/</span>
              <input
                id="lb-handle"
                className="lb-bare !min-h-0 !py-2"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 30))}
                placeholder="yourname"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>
            <button type="submit" className="site-btn site-btn-primary site-btn-sm shrink-0" disabled={busy}>
              <span className="site-btn-label">Claim</span>
            </button>
          </div>
        </form>
      ) : (
        <>
          {account.published && account.saved ? (
            <div className="lb-live">
              <a href={url} target="_blank" rel="noopener" className="sp-data !text-[var(--site-ink)] underline">
                {url.replace(/^https?:\/\//, "")}
              </a>
              <CopyText text={url} label="Copy" />
            </div>
          ) : null}
          <button
            type="button"
            className="site-btn site-btn-primary w-full"
            disabled={busy || (account.published && !dirty)}
            data-loading={busy || undefined}
            onClick={() => save(true)}
          >
            <span className="site-btn-label">{!account.published ? "Publish my page" : dirty ? "Publish changes" : "Published and up to date"}</span>
          </button>
          {account.published ? (
            <button type="button" className="site-btn site-btn-quiet site-btn-sm w-full" disabled={busy} onClick={() => save(false)}>
              <span className="site-btn-label">Take the page offline</span>
            </button>
          ) : null}
        </>
      )}
      {error ? (
        <p className="lb-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
