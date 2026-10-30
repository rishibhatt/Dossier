// Netlify scheduled function: once a day at 04:30 UTC (10:00 IST) it asks the app to send lifecycle emails.
// Scheduled functions only run on the production deploy. Needs CRON_SECRET in the site environment.
export default async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL}/api/cron/emails`, { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } })
  console.log("daily-emails:", res.status, await res.text())
}

export const config = { schedule: "30 4 * * *" }
