# PROJECT_STATE

State of WinMe on **2026-11-24**, written from source.

React SPA on Vite base `/winme/` under `HashRouter`. Demo-first: with no environment URL the app makes no booking requests. Ten fictional operators and seven fixed-price services.

## Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Home | Marketing, services teaser, featured operators, FAQ |
| `/services` | Services | Seven services and who offers them |
| `/executives` | Browse | Search, filters, sort |
| `/executives/:id` | ExecutiveProfile | Operator detail, services, slots |
| `/book/:id?slot=<ISO>&service=<id>` | Booking | Details → demo payment |
| `/confirmed/:bookingId` | Confirmed | Ticket, meeting link, `.ics` |
| `/my-bookings` | MyBookings | Local bookings |
| `/for-executives` | ForExecutives | Pitch and offer form |
| `*` | NotFound | 404 |

`App.jsx` wraps routes in `Layout` and scrolls to top on pathname change. In-page anchors call `preventDefault` and `scrollToId`, so the hash route is never replaced.

## Page behaviour

**Home** — fixed hero headline, "Book a meeting" CTA, "How it works" scroll link and a ticket with the first featured operator's next free local slot, price, rating and sample question ("Checking times" while loading). A teaser after the network section shows the first three services with prices and links to `/services`. One navy three-step band, three featured operators, trust items, four FAQs and a closing CTA.

**Services** — intro: a fixed-price 30-minute call around one job, talked through live, nothing uploaded, advice only. Seven cards give title, price, description and "Offered by" rows (avatar, name, title, company, "Book" link to `/executives/:id?service=:serviceId`). A final "Have a service of your own?" card links to `/for-executives` with "Place your offer".

**Browse** — search covers name, title, company, bio, topics and sample questions. Topic filters combine with AND; `?topic=` preselects a chip and toggles sync with `replace`. Sort by recommended, price or rating. `aria-live` result count; cards number in display order and show the next free local slot or "No times in the next 14 days". Availability loads in parallel. Empty results offer clear-filters.

**ExecutiveProfile** — unknown id shows an EmptyState. Slots come from `timezone` and `weeklyAvailability` for 14 days in 30-minute steps, skipping anything within an hour, grouped by local day; days disable when full. Services appear as "Services <first name> offers" only when present, with description, price and a preselecting link. Session-type radios offer "General advice call" at the operator price plus each service at its price; `?service=` preselects only an offered service, and the price and label update. Availability uses `getBookedSlots()` with skeletons and "Try again"; booked slots are disabled and labelled "…, already booked". Continue passes `slot` and the chosen `service`; `?slotTaken=1` shows the conflict alert.

**Booking** — unknown operator or a missing, invalid or past slot shows "Choose a time first". A `service` param is ignored when unknown or not offered. Details: name (≥2, max 80), email (regex, max 120), role, goal (≥10, max 500), two required questions and one optional (max 250), consent. Errors clear on edit; a failed submit focuses the first invalid field. The aside shows the operator, local time with zone, `Session` (service name or "General advice call"), total, a "Change time" link that keeps the service, and the advice note. The detail row, total and "Pay €N (demo)" use the service price. Demo checkout waits 1.5 s, then `createBooking`; success stores `serviceId`, `serviceName` and charged `price` (general bookings omit them) and opens `/confirmed/<id>`. `SLOT_TAKEN` returns with the notice.

**Confirmed** — reads the booking from `localStorage`; a missing one shows an EmptyState. Shows the service name as a chip and in details ("General advice call" when none), demo copy, badge, local time and zone, `.ics`, meeting link and copy, prep checklist, advice note, `WM-` reference and paid price.

**MyBookings** — sorts stored bookings and splits at slot + 30 minutes into Upcoming and Past. Rows link to confirmation and show date, operator, service name or "General advice call", time and price. "Clear bookings from this browser" opens an inline `role="alertdialog"` that focuses confirm and closes on "Keep them" or Escape; confirming clears storage and shows the empty state.

**ForExecutives** — pitch, benefits, eligibility, navy quote and offer form; the hero link scrolls to the form without changing the URL. Fields: name, email, role, company, LinkedIn and an optional "A service you'd like to offer" textarea (max 400). LinkedIn must be `https:` on `linkedin.com` or a subdomain. Failed submit focuses the first invalid field. Demo submit waits 900 ms and includes `service` in the `exec_interest` payload; success replaces the form with "Offer received, <first name>".

**NotFound** — static 404 with a home CTA.

**Shell** — navy demo banner; cream header with Services / The network / Place an offer / My bookings, coral "Book a meeting" and a mobile menu (`aria-expanded`, `aria-controls`, Escape and navigation close it). Footer repeats brand, links and claims. Skip link on focus.

## Data model

`src/data/executives.js` exports `executives`, `filterCategories`, `getExecutive(id)`.

```js
{
  id, name, title, company, bio,
  topics: string[],
  goodQuestions: string[],
  price: number,                 // EUR, whole euros
  rating: number, sessions: number,
  timezone: 'Area/City',         // IANA
  weeklyAvailability: { mon: ['19:00','21:00'], ... },
  gradient: 'from-navy-600 to-coral-800'
}
```

`weeklyAvailability` keys are `sun`–`sat`, one `[open, close]` window per weekday on a 30-minute grid. Ten fictional profiles, seven filter categories; some profile topics are not filterable.

`src/data/services.js` is the single service source: `services`, `GENERAL_ADVICE` ("General advice call"), `getService(id)` and `getServicesForExecutive(execId)`.

```js
{
  id, title, description,
  price: number,        // EUR, fixed
  offeredBy: string[]   // executive ids, 2–4 each
}
```

Mock interview €30, CV and LinkedIn walkthrough €20, Pitch run-through €40, Career roadmap €25, AI/ML project review €30, Product case practice €30, Working abroad Q&A €20. Every operator has at least one service.

Booking objects carry: `id`, `createdAt`, `execId`, `execName`, optional `serviceId` and `serviceName`, `price` (charged), `slot` (UTC ISO), `name`, `email`, `role`, `goal`, `questions[]`, `meetLink`, `demo`.

## Backend (`apps-script/Code.gs`)

Bound Apps Script web app. Config: `SHEET_ID`, `CALENDAR_ID`, `EXEC_DEMO_EMAIL`.

- `doGet`: `?action=booked&execId=` returns `{ ok, booked: [UTC ISO] }`; no action returns `{ ok: true, service: 'winme' }`.
- `doPost`: JSON from a `text/plain` body; `booking` or `exec_interest`, anything else `VALIDATION`. This avoids a CORS preflight.
- Sheets are created lazily; missing tabs fail `CONFIG`. Missing headers on an existing sheet are set in place, so the new `service` column keeps old rows working.
- Booking: execId, slot, name ≤80, email format, allowed role, goal ≤600, 2–3 questions ≤250 chars, slot at least five minutes ahead. A 15 s lock blocks duplicate `execId + slot` with `SLOT_TAKEN`.
- Calendar: 30-minute UTC event, visitor plus `EXEC_DEMO_EMAIL`, `sendUpdates: 'all'`, Hangouts Meet. Link from `hangoutLink` or the video entry point. Row appended after the event; response `{ ok, bookingId: 'WM-…', meetLink }`.
- Offer: name, email, role, company, LinkedIn host `linkedin.com` or a subdomain (regex-parsed; no `URL`), optional service ≤400. Appends a row; no duplicate check or notification.

Errors return `{ ok: false, code, error }`.

## Demo vs real mode

`isDemoMode` is true when `VITE_APPS_SCRIPT_URL` is empty or whitespace.

- **Demo**: availability adds a deterministic ~25% of taken slots, hashed from `execId|slot`, excluding the visitor's own bookings. Booking waits 600 ms plus the page's 1.5 s, returns a `WM-` id and a fake `https://meet.google.com/xxx-xxxx-xxx`; offers wait 900 ms. No network.
- **Real**: availability `GET <url>?action=booked&execId=…`; booking and offers `POST` with `Content-Type: text/plain;charset=utf-8`. Failures surface as `ApiError`.

The switch is build-time; changing it needs a rebuild.

## localStorage

One key: `winme.bookings.v1`, a JSON array newest-first. `saveBooking` replaces entries with the same id; `clearBookings` removes the key. Unreadable storage reads as empty; a failed write is ignored. Origin-scoped; nothing travels between devices.

## Not implemented / known gaps

- No accounts, auth, email or cross-device bookings; no real payment, receipt or refund.
- Service prices are fixed in the frontend; real mode does not re-check them.
- No cancellation, rescheduling, reminders or no-show handling; slots are never released.
- Real mode accepts any future ISO slot, with no `weeklyAvailability`, grid or execId check.
- `GET ?action=booked` includes past slots.
- Demo taken slots exist only in the browser and not in the backend.
- No rate limiting, spam protection or duplicate-offer detection.
- `.ics` is UTC-only with `UID:<id>@winme.demo`; one availability window per weekday.
- No repo test runner, error boundary, code splitting, i18n or analytics. Accessibility checked manually.

## Changelog

- 2026-11-23 — Created `AGENTS.md` and this state document from a source audit; no application changes.
- 2026-11-23 — Moved the site base and package name from `askly` to `winme`; updated README and deploy notes.
- 2026-11-23 — Fixed in-page anchors under `HashRouter`; added live next-slot data on Home and Browse, `?topic` preselect, profile empty states, booking summary and length limits, clear-bookings confirmation, seeded demo availability, and strict LinkedIn validation on client and server.
- 2026-11-24 — Added the seven-service catalogue, `/services`, Home teaser, profile session types, service-aware pricing and bookings, service labels, and the optional offer service field; appended an additive `service` column to `ExecInterest`.
