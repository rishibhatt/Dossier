/**
 * Unit checks for the link-in-bio model (the repo has no test runner, so this is a plain assert script).
 * Covers: which typed links become hrefs (and which never do), platforms, image URL safety, save-time cleaning,
 * old drafts, the head parser for website names and icons, and the private-address guard.
 * Run: npx jiti scripts/link-page/linkPage.check.ts
 */
import assert from "node:assert/strict"

import { blankPage, cleanPage, githubPhoto, guessTitle, normalizeUrl, platformOf, readPage, safeImageUrl, upgradeDraft, visibleLinks } from "../../src/features/tools/linkPage"
import { isPublicUrl, parseHead } from "../../src/lib/linkMeta"

async function main() {
  assert.equal(normalizeUrl("linkedin.com/in/dev"), "https://linkedin.com/in/dev")
  assert.equal(normalizeUrl("dev@studio.io"), "mailto:dev@studio.io")
  assert.equal(normalizeUrl("http://a.co"), "http://a.co/")
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "localhost", "https://user:pw@a.co", "ftp://a.co", "", "mailto:nope"]) {
    assert.equal(normalizeUrl(bad), null, bad)
  }

  assert.equal(guessTitle("https://www.github.com/dev"), "GitHub")
  assert.equal(guessTitle("https://www.rishab.design/"), "rishab.design")
  assert.equal(platformOf("https://wa.me/9199")?.key, "whatsapp")
  assert.equal(platformOf("https://rishab.design"), null)

  assert.equal(safeImageUrl("http://a.co/x.png"), null)
  assert.equal(safeImageUrl("javascript:alert(1)"), null)
  assert.equal(safeImageUrl("https://a.co/x.png"), "https://a.co/x.png")

  const page = {
    ...blankPage(),
    name: "Dev",
    links: [
      { id: "a", title: "", url: "github.com/dev", on: true, icon: true },
      { id: "b", title: "Site", url: "dev.design", on: true, icon: true, favicon: "http://dev.design/f.ico" }, // not a platform: stays a button
      { id: "c", title: "Hidden", url: "a.co", on: false, icon: false },
      { id: "d", title: "Bad", url: "javascript:alert(1)", on: true, icon: false },
    ],
  }
  const v = visibleLinks(page)
  assert.deepEqual(v.icons.map((l) => l.id), ["a"])
  assert.deepEqual(v.buttons.map((l) => l.id), ["b"])
  assert.equal(v.buttons[0]!.favicon, null) // http favicon never renders

  assert.equal(githubPhoto(page), "https://github.com/dev.png")

  assert.deepEqual(cleanPage(page), { ok: false, badLink: 3 })
  const ok = cleanPage({ ...page, photoUrl: "javascript:x", links: [...page.links.slice(0, 3), { id: "e", title: "", url: "  ", on: true, icon: false }] })
  assert.ok(ok.ok && ok.page.links.length === 3 && ok.page.links[0]!.url === "https://github.com/dev" && ok.page.photoUrl === "" && !("favicon" in ok.page.links[1]!))

  assert.deepEqual(readPage({ junk: true }), blankPage())
  assert.equal(readPage({ ...blankPage(), name: "A", theme: "stock" }).theme, "specimen")
  assert.equal(upgradeDraft({ name: "A", bio: "", theme: "paper" as never, photo: false, links: [] }).photoUrl, "")

  const head = `<html><head><title>Rishab &amp; Co</title><link rel="icon" href="/f.ico"><link rel="apple-touch-icon" sizes="180x180" href="/apple.png"></head>`
  assert.deepEqual(parseHead(head, "https://r.design/work"), { title: "Rishab & Co", icon: "https://r.design/apple.png" })
  assert.deepEqual(parseHead(`<meta property="og:site_name" content="Studio">`, "https://s.io/"), { title: "Studio", icon: "https://s.io/favicon.ico" })
  assert.equal(parseHead("<title>x</title>", "http://plain.io/").icon, null)

  for (const blocked of ["http://127.0.0.1/", "http://10.0.0.5/", "http://169.254.169.254/latest", "http://[::1]/", "http://192.168.1.1/", "https://a.co:8443/", "http://localhost/", "file:///etc/passwd"]) {
    assert.equal(await isPublicUrl(blocked), false, blocked)
  }
  assert.equal(await isPublicUrl("http://8.8.8.8/"), true)

  console.log("linkPage: all checks passed")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
