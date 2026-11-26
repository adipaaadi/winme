# PROJECT_STATE

State of WinMe on **2026-11-26**, written from source.

React SPA on Vite base `/winme/` under `HashRouter`. Demo-first: with no environment URL the app makes no booking requests. Ten fictional operators and seven fixed-price services.

Copy sells a **session**, not a fixed-length call: the unit is a "working session" (Home teaser, Services, Browse), a "focused session" (Home steps and closing, ForExecutives) or just "session" (pricing lines, checklist, confirmation). No page states a duration; prices read "per session". The 30-minute slot grid in `src/lib/slots.js` and the 30-minute booking logic are unchanged.

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

**Home** — the headline "You don't need your own network, you can access ours" plays a one-time per-character zoom on load. "Book a meeting" CTA and "How it works" scroll link. Behind the copy, a lazy-loaded WebGL dotted globe rises from the bottom of the hero and is cropped by gradients, with two floating operator cards over it: Priya Raghavan upper left and Tomas Lehtinen lower right. A teaser after the network section shows the first three services with prices and links to `/services`. One navy three-step band, three featured operators, trust items, four FAQs and a closing CTA.

**Services** — h1 "One job, one working session, a fixed price"; intro: a fixed-price working session around one job, talked through live, nothing uploaded, advice only; the stat row reads Services / Seven, Scope / One job per session, Format / Talk it through live. Seven cards give title, price, description and "Offered by" rows (avatar, name, title, company, "Book" link to `/executives/:id?service=:serviceId`). A final "Have a service of your own?" card links to `/for-executives` with "Place your offer".

**Browse** — search covers name, title, company, bio, topics and sample questions. Topic filters combine with AND; `?topic=` preselects a chip and toggles sync with `replace`. Sort by recommended, price or rating. `aria-live` result count; cards number in display order and show the next free local slot or "No times in the next 14 days". Availability loads in parallel. Empty results offer clear-filters.

**ExecutiveProfile** — unknown id shows an EmptyState. Slots come from `timezone` and `weeklyAvailability` for 14 days in 30-minute steps, skipping anything within an hour, grouped by local day; days disable when full. Services appear as "Services <first name> offers" only when present, with description, price and a preselecting link. Session-type radios offer "General advice call" at the operator price plus each service at its price; `?service=` preselects only an offered service, and the price and label update. Availability uses `getBookedSlots()` with skeletons and "Try again"; booked slots are disabled and labelled "…, already booked". Continue passes `slot` and the chosen `service`; `?slotTaken=1` shows the conflict alert.

**Booking** — unknown operator or a missing, invalid or past slot shows "Choose a time first". A `service` param is ignored when unknown or not offered. Details: name (≥2, max 80), email (regex, max 120), role, goal (≥10, max 500), two required questions and one optional (max 250), consent. Errors clear on edit; a failed submit focuses the first invalid field. The aside shows the operator, local time with zone, `Session` (service name or "General advice call"), total, a "Change time" link that keeps the service, and the advice note. The detail row, total and "Pay €N (demo)" use the service price. Demo checkout waits 1.5 s, then `createBooking`; success stores `serviceId`, `serviceName` and charged `price` (general bookings omit them) and opens `/confirmed/<id>`. `SLOT_TAKEN` returns with the notice.

**Confirmed** — reads the booking from `localStorage`; a missing one shows an EmptyState. Shows the service name as a chip and in details ("General advice call" when none), demo copy, badge, local time and zone, `.ics`, meeting link and copy, prep checklist, advice note, `WM-` reference and paid price.

**MyBookings** — sorts stored bookings and splits at slot + 30 minutes into Upcoming and Past. Rows link to confirmation and show date, operator, service name or "General advice call", time and price. "Clear bookings from this browser" opens an inline `role="alertdialog"` that focuses confirm and closes on "Keep them" or Escape; confirming clears storage and shows the empty state.

**ForExecutives** — pitch, benefits, eligibility, navy quote and offer form; the hero link scrolls to the form without changing the URL. Fields: name, email, role, company, LinkedIn and an optional "A service you'd like to offer" textarea (max 400). LinkedIn must be `https:` on `linkedin.com` or a subdomain. Failed submit focuses the first invalid field. Demo submit waits 900 ms and includes `service` in the `exec_interest` payload; success replaces the form with "Offer received, <first name>".

**NotFound** — static 404 with a home CTA.

**Shell** — navy demo banner; cream header with The network / Services / Place an offer / My bookings, coral "Book a meeting" and a mobile menu (`aria-expanded`, `aria-controls`, Escape and navigation close it). Footer repeats brand, links and claims. Skip link on focus.

## Hero globe

`src/components/HeroGlobe.jsx` loads through `React.lazy`/`Suspense`, keeping `three` out of the initial bundle. It imports `world-atlas/land-110m.json` with a dynamic import, rasterises the land into a 2048×1024 mask with `d3-geo`, and samples that mask for an instanced cream dot grid. A cream graticule and coastlines sit over an opaque navy sphere, with coral markers at Riga, Helsinki, London, Berlin, New York, Kolkata, Mumbai and Singapore.

The orthographic camera frames a unit globe in a square canvas. The group tilts 0.4 rad, starts at −25° so Europe faces the camera, and spins about Y at 0.1 rad/s plus `spinRef.current.extra`. The loop stops while the document is hidden or the container is off-screen, resizes with a `ResizeObserver`, renders one static frame under `prefers-reduced-motion`, and disposes the scene and renderer on unmount. No runtime network requests.

## Hero motion and cards

`src/components/ZoomText.jsx` splits the headline into word wrappers (inline-block, nowrap) and per-character spans. Every character runs the `zoom-out` keyframes in `src/index.css` for 0.5 s with `both` fill; the delay is `STAGGER` (0.04 s) times its position across the sentence, spaces included. It runs once. The h1 carries the full sentence as `aria-label` and the animated spans are `aria-hidden`; with reduced motion the characters render immediately with no animation.

`src/components/GlobeProfileCard.jsx` renders two `Link` cards anchored in percentages to the globe frame: Priya Raghavan (Asia/Kolkata) at the upper left and Tomas Lehtinen (Europe/Helsinki) at the lower right. Each shows the avatar, name, title and company, a coral price pill, and, from `sm` up, the next free slot in the visitor's local zone. The second card is hidden below 640 px. A slow 8 s / 11 s float is disabled under reduced motion.

## Spotlight cards

`src/components/ui/spotlight-card.jsx` exports `SpotlightCard` (default and named). It is a polymorphic wrapper (`as`, default `div`) that adds one class and `data-spotlight-variant`, merges `className` and forwards the ref and every other prop, so `as={Link}` stays a real anchor and a bare `onClick` still fires. It sets no size, padding, background, border or radius: the effect is drawn by `.spotlight-card::before` (the fill, at `z-index: -1` inside the card's own `isolation: isolate` context, so it sits above the card background and below its content) and `.spotlight-card::after` (a 1px masked ring plus a faint white inner highlight, `border-radius: inherit`). Cards keep their own radius, gradient and shadow utilities.

One module-level listener serves every card. Registering the first card adds the shared `pointermove` handler plus `scroll` and window `blur` / document `pointerleave`; unregistering the last one removes them and clears its frame. Paints are throttled with `requestAnimationFrame`, and cards more than 380 px outside the viewport are skipped. Coordinates are local to each card (`--mx`, `--my` from `getBoundingClientRect()`), so the glow tracks correctly inside hover-lift transforms, the floating globe cards and sticky panels; `--spot-hue` is the colour base plus the pointer's horizontal ratio times its spread. The fill radius (360 px) is wider than a card, so neighbours still light up. With no pointer data every glow layer stays at `opacity: 0`; `:focus-visible` / `:focus-within` shows a static glow for keyboard users. The whole effect lives in `@media (hover: hover) and (pointer: fine)`, so touch devices get no glow and keep normal scrolling, and it uses no transitions, so reduced motion needs no extra case.

`glowColor` picks a hue base and spread: `coral` (14 / 30, the default, warm coral to amber), `blue`, `purple`, `green`, `red`, `orange`.

- **`variant="full"`** — background spotlight plus border ring: Browse and Home operator cards (`ExecutiveCard`), the Home services teaser cards, the seven Services cards and the "Have a service of your own?" card, both `GlobeProfileCard`s, MyBookings booking rows, the Booking demo credit card, the ForExecutives quote card, success card and "What happens next" card, and `EmptyState`.
- **`variant="border"`** — ring only, for panels that hold inputs or long text: the ExecutiveProfile availability and booking panel, the Booking details form, payment panel and order summary, the four Confirmed panels, the ForExecutives offer form and the FAQ panel.

Left alone: buttons, chips, filter rows, inputs, the sort select, the header, footer, banner, full-width section bands and the globe canvas. The profile's borderless sections (header, about, services, questions), the Home trust items, the three step rows and the closing CTA row are not card surfaces, so they carry no spotlight.

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
- No repo test runner, error boundary, i18n or analytics. The Home globe is the only lazy-loaded route component. Accessibility checked manually.

## Changelog

- 2026-11-23 — Created `AGENTS.md` and this state document from a source audit; no application changes.
- 2026-11-23 — Moved the site base and package name from `askly` to `winme`; updated README and deploy notes.
- 2026-11-23 — Fixed in-page anchors under `HashRouter`; added live next-slot data on Home and Browse, `?topic` preselect, profile empty states, booking summary and length limits, clear-bookings confirmation, seeded demo availability, and strict LinkedIn validation on client and server.
- 2026-11-24 — Added the seven-service catalogue, `/services`, Home teaser, profile session types, service-aware pricing and bookings, service labels, and the optional offer service field; appended an additive `service` column to `ExecInterest`.
- 2026-11-25 — Added a lazy-loaded dotted globe to the Home hero using bundled `world-atlas` land data, an orthographic renderer and spin ref input, with reduced-motion and off-screen pause handling.
- 2026-11-25 — Added the one-time character zoom to the Home headline and two floating operator cards over the globe, with reduced-motion fallbacks and responsive placement.
- 2026-11-25 — Removed the next-free slot chip under the Home hero CTA and its now-unused label helpers and Luxon import.
- 2026-11-25 — Swapped the first two header nav links so "The network" precedes "Services" in both the desktop bar and the mobile menu.
- 2026-11-25 — Rewrote every 30-minute phrase in the JSX copy to a session-based system (working/focused session, "per session" pricing) across Home, Services, Browse, ExecutiveProfile, ExecutiveCard, Booking, Confirmed, ForExecutives and the footer; slot and duration logic untouched.
- 2026-11-26 — Added `SpotlightCard` (`src/components/ui/spotlight-card.jsx`): a single ref-counted pointer listener, per-card local coordinates, coral-to-amber hue drift, `full` and `border` variants and pointer-gated CSS with a focus-visible fallback; applied to every card surface without touching layout, backgrounds, radii or routing.
