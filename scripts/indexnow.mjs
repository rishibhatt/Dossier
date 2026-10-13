// Pings IndexNow (Bing, Yandex, Seznam, Naver) with every URL in the live sitemap.
// Setup: pick a key (8-128 hex chars), save it as public/<key>.txt containing the key, set INDEXNOW_KEY.
// Run: INDEXNOW_KEY=... node scripts/indexnow.mjs
const key = process.env.INDEXNOW_KEY
const site = (process.env.SITE_URL ?? "https://dossier-cv.com").replace(/\/$/, "")

if (!key) {
  console.error("INDEXNOW_KEY is not set. Skipping.")
  process.exit(0)
}

const xml = await (await fetch(`${site}/sitemap.xml`)).text()
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (urlList.length === 0) {
  console.error("No URLs found in sitemap.")
  process.exit(1)
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${key}.txt`, urlList }),
})
console.log(`IndexNow: submitted ${urlList.length} URLs, status ${res.status}`)
