# AGENTS.md

Working notes for anyone (human or agent) changing this repository.

## What this is

**WinMe** — a pitch-event prototype of a marketplace for 30-minute advice calls with experienced operators. Ten fictional executives, booked around the visitor's schedule. Payments are simulated. Copy is deliberately honest: advice only, no guaranteed outcomes.

The app is **demo-first**: it runs fully in the browser with no backend. A real Google Apps Script backend can be switched on with an environment variable.

## Stack

- React 18 + Vite 5, JavaScript and JSX (no TypeScript).
- React Router 6 with `HashRouter` (routes look like `/#/executives`).
- Tailwind CSS 3 with a small set of component classes in `src/index.css`.
- Luxon for all date and time-zone work.
- Google Fonts: Fraunces (display) and Manrope (UI).
- Optional backend: Google Apps Script web app (`apps-script/Code.gs`) bound to a Sheet, with the Calendar advanced service.
- No state library, no CSS-in-JS, no test runner configured in the repo.

Commands: `npm run dev`, `npm run build`, `npm run preview`, `npm run deploy`. Vite base is `/winme/` (`REPO_NAME` in `vite.config.js`) for GitHub Pages.

## Folder structure

```
src/
  App.jsx                 Routes and scroll restore
  main.jsx                React root
  index.css               Tailwind layers, base styles, .btn-* / .card / .field / .eyebrow / .nav-link
  components/             Layout, SiteHeader, SiteFooter, Logo, Avatar, Rating, DemoBadge,
                          ExecutiveCard, FAQ, EmptyState, Spinner, icons
  pages/                  Home, Services, Browse, ExecutiveProfile, Booking, Confirmed,
                          MyBookings, ForExecutives, NotFound
  data/executives.js      The ten fictional profiles, topic list, getExecutive()
  data/services.js        The seven fixed-price services, GENERAL_ADVICE, getService(),
                          getServicesForExecutive()
  lib/api.js              Demo/real switch, POST and availability helpers
  lib/bookings.js         localStorage booking store and WM- id generator
  lib/slots.js            Slot generation, grouping, next free slot, local formatting, zone label
  lib/scroll.js           Reduced-motion-aware scroll-to-id helper
  lib/ics.js              Client-side .ics builder and download
  lib/usePageTitle.js     Document title
apps-script/Code.gs       Sheet + Calendar backend, deployed as a web app
apps-script/appsscript.json
index.html, tailwind.config.js, vite.config.js, .env.example
```

## Code style

- Simple, human-style code. Prefer a readable function over a clever one.
- Minimal comments. Comment only non-obvious constraints, such as why a request uses `text/plain`.
- No unnecessary abstraction: no hooks wrappers, no generic components, no config layer unless a third caller exists.
- Pages own their state and their copy. Shared logic lives in `src/lib/`.
- Match local patterns: plain `function` declarations, early returns, small helpers at the top of the file, Tailwind classes inline.
- Keep formatting consistent with the surrounding file. Two-space indent, single quotes, semicolons.
- Never introduce a new colour, font or animation curve. Extend existing tokens if something is genuinely missing.

## Palette and the 60/30/10 rule

Tokens live in `tailwind.config.js`:

- Navy `#14213D` (`navy`, 50–950 scale) — ink, nav, dark bands, footer.
- Cream `#F4EDE0` (`cream`, 50–400 scale) — page, cards, paper.
- Coral `#FF6B5B` (`coral`, 50–900 scale) — CTAs, active states, selected slots, marks.
- `muted` `#4E5F7E` and `line` `#DCD0BC` support the palette.

Ratio, per screen:

- **60% cream** surfaces: page background, cards, form panels.
- **30% navy**: body text, navigation, one full dark band, footer.
- **10% coral**: primary buttons, active nav rule, selected slot, operator numbers, single full stops.

Hard rules:

- Navy text on coral fills. Never white or cream small text on coral.
- Coral is not for small body copy on cream. Use navy or `navy-500`.
- Errors use navy text with coral field borders/dots; no red.
- One navy band per page is enough.
- Buttons are full pills. Focus rings are navy on cream.
- Motion is restrained; respect `prefers-reduced-motion` (already handled globally).

## Copy decisions already made

These are intentional. Do not "improve" them back to generic startup copy.

- Product name is **WinMe** everywhere: title, nav, footer, banner, `.ics`, backend events, README, storage keys. Repository and Vite base are `winme`.
- Hero headline is exactly: **You don't need your own network, you can access ours**
- The primary CTA is **Book a meeting**. Never "Browse executives".
- Nav labels: **Services**, **The network**, **Place an offer**, **My bookings**.
- No price range anywhere. Individual prices stay on services, profiles, bookings and booking rows.
- For operators: **Place your offer** (nav, heading, CTA, submit). Backend request type stays `exec_interest`.
- No donations or "donate my earnings" content, in any form.
- Confirmation and meeting actions say **Get a meeting link**, not "Join on Google Meet".
- Every call is described as **advice only**, 30 minutes, with a full refund if the operator does not show up.
- The top banner stays: "Prototype with demo profiles. No real executives, no real payments."
- Tone: plain, specific, slightly dry. No hype, no "unlock", no "supercharge", no fake urgency.

## Must never break

- **Booking flow**: profile → session type and slot → two-step form → demo checkout → confirmation. Validation, focus management and error copy stay intact.
- **Services**: titles, prices and `offeredBy` come from `data/services.js`. A booking ignores a service the operator does not offer, and `service` stays optional on `exec_interest` so existing `ExecInterest` sheets keep working.
- **Demo mode**: empty `VITE_APPS_SCRIPT_URL` must always work offline, with local slots, a fake meeting link, delay and no network.
- **Real mode**: setting `VITE_APPS_SCRIPT_URL` must switch availability and booking to the Apps Script backend with no code changes. Keep `text/plain;charset=utf-8` on POST so no CORS preflight is sent.
- **Time zones**: availability is generated in each operator's IANA zone and displayed in the visitor's local zone. Never store local wall-clock strings; store UTC ISO.
- **Accessibility**: keyboard reachable controls, visible focus, labelled inputs, `aria-pressed` on slots and filters, `role="alert"` errors, skip link, 48px mobile tap targets, Escape closes the menu.
- **Contracts**: `exec_interest` request type, `Bookings` / `ExecInterest` sheet names, `GET ?action=booked&execId=`, `{ ok, bookingId, meetLink }` responses, `winme.bookings.v1`, `WM-` ids.
- **Mobile**: no horizontal overflow at 390px on any route.

## Working rule

After every task, update `PROJECT_STATE.md` to match the code and append exactly one line to its changelog. Documentation changes are part of the task, not an extra.
