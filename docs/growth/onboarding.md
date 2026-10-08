# Onboarding and signup

## Activation

**Aha moment:** the visitor sees their own resume set as a site (first preview).
**Activation event:** first published link. Target: under 5 minutes from landing, on a phone.
**Model:** freemium, value before signup. No account is needed until Publish.

## Minimum path to value

| # | Screen | What happens | Progress cue | Empty / error state |
| --- | --- | --- | --- | --- |
| 1 | Home or tool page upload slot | Visitor drops or picks a PDF. Checked in the browser (type, size, `%PDF-` header). Handed to the builder in memory | Slot shows "Opening the builder" | Inline: names the problem and the fix ("That is not a PDF. Export your resume as a PDF...") |
| 2 | Builder, pick a look | Opens directly on the look step because the file was already chosen (`pendingUpload.ts`) | Stepper: 1 Upload done, 2 Look active | Resume session card offers the last session |
| 3 | Reading | Parse with staged progress (`useParseProgressStore`), cancellable | Stage captions | Parse failure card: retry, or choose another file |
| 4 | Studio (aha) | Their site, suggested look applied. Shuffle, edit on the page | Status in top bar | Shuffle quota hit opens the upgrade sheet only after this point |
| 5 | Publish | Signed out: draft saved to the device, then signup with `next=/build` and a note "Your site is saved on this device" | Publish dialog | Network and quota errors explained in the dialog |
| 6 | Published | Link, copy and share buttons, invite prompt | "Live" state | Republish keeps the link |

Changes made in this pass:

- The home page, the final CTA, the tool pages and the invite page all carry a working upload slot. Choosing a
  file skips the builder's upload screen (one step fewer).
- The publish gate sends new people to **signup** (it went to login) and the signup page explains that the
  draft is saved and they come straight back.
- Signup lost the confirm-password field (the show-password toggle covers typos), Google and GitHub moved above
  email, and the page shows one context line for invites, paid-plan intent and the saved draft.

## Signup screen spec

- Title: "Save your site and publish it." Subtitle names what the account does and "No card needed".
- Order: Google (secondary button), GitHub (ghost), divider "or use your email", email, password with show
  toggle and the rule up front ("At least 8 characters"), submit "Create my free account", link to log in.
- Errors: inline under the field, the form keeps its values, a single banner for server errors
  (`describeAuthError`). Email confirmation on: success banner tells them to check their inbox.
- Right panel (desktop): what a free account gets, and a sample published page.

## Emails (copy only, no sending infra yet)

| Trigger | Subject | Body (short) |
| --- | --- | --- |
| Signed up, no publish after 24h | Your site is one tap from live | Your portfolio is saved. Open it, press Publish and you get a link you can paste into any application. |
| Published | Your site is live | Here is your link. Add it to your resume header and your LinkedIn Contact info. |
| Published, 7 days | Try it in another look | Shuffle keeps every word. Here are three looks people in your field pick. |

## Metrics

Upload started, file accepted, parse done (aha), first shuffle, publish clicked, signup completed, first
publish (activation). Track with `track()` in `src/lib/analytics/track.ts` once a tag manager is installed.
