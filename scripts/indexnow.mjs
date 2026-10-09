/**
 * Tells Bing, Yandex and other IndexNow search engines about every URL in the sitemap, so new and changed
 * pages are crawled in minutes. Google does not use IndexNow: it reads the sitemap you submitted in Search Console.
 * Usage: node scripts/indexnow.mjs   (SITE_URL defaults to https://dossier-cv.com)
 * The key is public by design. It must match the file public/<key>.txt.
 */
const KEY = "faf64ad717e6887e5fc3fcb5facfdea9"
const SITE = (process.env.SITE_URL || "https://dossier-cv.com").replace(/\/$/, "")

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITE))
if (!urls.length) {
  console.error("No URLs found in the sitemap. Is the site live?")
  process.exit(1)
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
})
console.log(`IndexNow: submitted ${urls.length} URLs, status ${res.status}`)
if (res.status >= 400) process.exit(1)
