# WinMe

A pitch-event prototype for booking paid 30-minute advice calls with experienced operators.

> Prototype with demo profiles. No real operators, no real payments.

All ten operators are fictional. Their companies, bios, ratings and sessions are invented. Payment is simulated. Sessions are advice only and never guarantee a job, offer, funding, promotion or any other outcome.

## What is in the prototype

- Home page with the hero, three-step explainer, featured operators, trust section, FAQ and footer.
- Searchable, filterable operator directory with price and rating sort.
- Operator profiles with topics, sample questions, ratings and a 14-day availability picker in the visitor's time zone.
- Two-step booking flow (details, then demo payment) leading to a confirmation page, plus local booking history.
- Confirmation page with a meeting link, an `.ics` calendar download and a preparation checklist.
- "My bookings" built on `localStorage`.
- "Place an offer" page and operator offer form.
- Works fully without a backend (demo mode) and switches to a real Apps Script backend by setting one environment variable.

## Stack

- Vite + React, plain JavaScript and JSX
- Tailwind CSS with a cream, navy and coral token system
- Fraunces for display type and Manrope for UI text
- React Router with `HashRouter` for GitHub Pages
- Luxon for time zones
- `gh-pages` for deployment
- One Google Apps Script web app, bound to a Google Sheet

## Run locally

Requires Node 18 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

The folder and GitHub repository are named `winme`, so Vite serves the app under `/winme/`. Open the URL it prints, which will look like `http://localhost:5173/winme/`.

### Demo mode

Leave `VITE_APPS_SCRIPT_URL` empty in `.env` and the app runs in demo mode:

- No network requests are made for bookings.
- A fake meeting link is generated in the form `https://meet.google.com/abc-defg-hij` and labelled "Demo link".
- The booking is stored in `localStorage` under `winme.bookings.v1` and appears under "My bookings".
- The payment step waits 1.5 seconds, then finishes without charging anything.
- The "Place your offer" form simulates a successful submission.

This is the recommended mode for a pitch demo. It has no external dependencies and works offline after the first load.

### Real mode

Set the web app URL in `.env`:

```dotenv
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Restart `npm run dev`. The same UI now reads booked slots from the Sheet and creates real Calendar events. No code changes are required.

Real mode still uses the simulated payment screen: the prototype does not integrate a payment processor.

## Project structure

```text
winme/                  Repository and Vite base name
  apps-script/
    Code.gs             Apps Script backend
    appsscript.json     Optional manifest for clasp users
  src/
    components/         Shared UI, layout, icons
    data/executives.js  The ten fictional operator profiles
    lib/
      api.js            Demo/real mode switch and fetch helpers
      bookings.js       localStorage booking store
      ics.js            Client-side calendar file
      slots.js          Slot generation and time-zone helpers
    pages/              One component per route
    App.jsx             Routes
    index.css           Tailwind layers and base styles
  index.html
  tailwind.config.js
  vite.config.js        Repository name and Vite base path
  .env.example
```

## Set up the Google backend

You only need this for real mode. The app runs in demo mode without it.

### 1. Create the Sheet

1. Create a new Google Sheet, for example "WinMe data".
2. Rename the first tab to `Bookings`.
3. Add a second tab named `ExecInterest`.
4. Leave both tabs empty. The script creates their header rows on first use.

Column layouts, for reference:

| Bookings | ExecInterest |
| --- | --- |
| id | createdAt |
| createdAt | name |
| execId | email |
| slot | role |
| name | company |
| email | linkedin |
| role | |
| goal | |
| questions | |
| meetLink | |

The `ExecInterest` tab keeps its original name and request type so the backend contract does not change.

### 2. Create the Apps Script project

1. In the Sheet, open **Extensions → Apps Script**.
2. Rename the project to `WinMe`.
3. Replace the contents of `Code.gs` with [`apps-script/Code.gs`](apps-script/Code.gs).

### 3. Set the config values

At the top of `Code.gs`:

```js
const SHEET_ID = 'PASTE_YOUR_SHEET_ID';
const CALENDAR_ID = 'primary';
const EXEC_DEMO_EMAIL = 'your-spare-address@example.com';
```

- `SHEET_ID` is the long ID in the Sheet URL:
  `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
- `CALENDAR_ID` can stay as `primary` to use the calendar of the account running the script.
- `EXEC_DEMO_EMAIL` is a spare address you control. It is added as the second attendee on every booking, standing in for the fictional operator. The visitor's email is the first attendee.

### 4. Enable the Calendar advanced service

1. In the Apps Script editor, open **Services** (the `+` next to Services in the left sidebar).
2. Add **Calendar API**, version **v3**, identifier `Calendar`.
3. Save the project.

If you deploy with `clasp`, the included `apps-script/appsscript.json` already declares the advanced service and the required OAuth scopes. If you use the online editor, enabling the service there is enough.

### 5. Authorize

Select the `authorize` function in the editor and click **Run**. Google will ask for access to your Sheets and Calendar. Approve it with the same Google account you want to own the bookings. `authorize` reads the Sheet and lists one calendar entry, which triggers both scopes before the first real booking.

### 6. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Select type **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**. Not "Anyone with a Google account" — the frontend does not send a Google auth token.
5. Deploy and copy the web app URL. It ends in `/exec`.

Paste that URL into `.env` as `VITE_APPS_SCRIPT_URL` and restart the dev server.

### 7. Check that it works

1. Book a slot in the app.
2. The `Bookings` tab should get a new row.
3. A Calendar event should appear with the visitor and `EXEC_DEMO_EMAIL` as attendees, plus a meeting link.
4. Refresh the operator's profile: the booked slot should now be greyed out.

When you change `Code.gs`, create a **new version** under **Deploy → Manage deployments → Edit**. The URL stays the same, but the running code only changes after a new version is deployed.

## Deploy to GitHub Pages

1. Set your repository name in `vite.config.js`:

   ```js
   const REPO_NAME = 'winme';
   ```

   It must match the GitHub repository exactly, including capitalisation. This value is also used as Vite's `base`. If you attach a custom domain instead of using the `github.io` project path, set `base: '/'` and skip the repository-name step.

2. Make sure `.env` exists locally with the URL you want to ship. Vite reads it at build time.

3. Push the project to GitHub. The `gh-pages` package publishes the built `dist` folder to the `gh-pages` branch:

   ```bash
   git init
   git add .
   git commit -m "Build WinMe prototype"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/winme.git
   git push -u origin main
   npm run deploy
   ```

4. In the repository, open **Settings → Pages** and confirm the source is the `gh-pages` branch. The site will be at `https://YOUR_USERNAME.github.io/winme/`.

`HashRouter` means routes look like `/#/executives` and do not need server-side rewrites on GitHub Pages.

If you later rename the repository, update `REPO_NAME` and run `npm run deploy` again.

## Backend API contract

The frontend sends `POST` requests with `Content-Type: text/plain` so the browser does not send a CORS preflight, which Apps Script cannot answer. The body is JSON.

```json
{
  "type": "booking",
  "execId": "priya-raghavan",
  "execName": "Priya Raghavan",
  "slot": "2026-11-09T10:00:00.000Z",
  "name": "Ada Demo",
  "email": "ada@example.com",
  "role": "Student",
  "goal": "I want a realistic plan for moving into applied ML.",
  "questions": ["Which project should I build first?", "How much maths do I need?"]
}
```

Success: `{ "ok": true, "bookingId": "WM-...", "meetLink": "https://meet.google.com/..." }`

Failure: `{ "ok": false, "code": "SLOT_TAKEN", "error": "That slot was just booked..." }`

The "Place your offer" form still sends `{ "type": "exec_interest", ... }` and gets `{ "ok": true }`. That request type is part of the existing backend contract and is intentionally unchanged.

To check availability:

```text
GET <web-app-url>?action=booked&execId=priya-raghavan
```

Response: `{ "ok": true, "booked": ["2026-11-09T10:00:00.000Z"] }`

## Troubleshooting

**"Sheet 'Bookings' was not found"**
Check the tab names are exactly `Bookings` and `ExecInterest`, and that `SHEET_ID` is the Sheet ID, not the full URL.

**"Calendar is not defined"**
The Calendar advanced service is not enabled. Add Calendar API v3 under Services, save, and deploy a new version.

**Authorization or permission errors**
Run a function from the editor and complete the consent flow. If you change the Calendar service or scopes, you normally need to authorize again.

**"Failed to fetch" or an empty response**
- Recheck the web app URL ends in `/exec`.
- Confirm access is set to **Anyone**, not "Anyone with a Google account".
- Deploy a new version after editing `Code.gs`.
- Open the URL directly in a browser. If it returns JSON, the deployment is reachable.
- The frontend already sends `text/plain` to avoid the preflight. Do not change that to `application/json`.

**No slots on an operator profile**
Availability comes from `weeklyAvailability` in `src/data/executives.js`. Each day is a single `[open, close]` pair in the operator's own time zone, for example `tue: ['17:00', '19:00']`. The picker only shows the next 14 days and hides slots that are less than an hour away.

**Times are in the wrong zone**
The picker uses the browser's resolved IANA time zone and shows its name under the price. Check the operator's `timezone` value is a valid IANA string such as `Europe/Riga` or `America/New_York`.

**The "slot just got taken" message appears**
This is expected when two people try to book the same slot. The backend takes a lock, rejects the second request, and the frontend sends the visitor back to the profile with a notice. Pick another time.

**Bookings disappear after refresh**
Bookings in the browser are stored in `localStorage` per origin. They are lost after clearing site data, in private windows, or on a different domain or device. This is intentional for the prototype; the Apps Script Sheet keeps the authoritative record in real mode.

**GitHub Pages shows a 404 or unstyled page**
- `REPO_NAME` in `vite.config.js` must match the repository name.
- Run `npm run deploy` again after changing the base or environment variables.
- Confirm Pages is serving the `gh-pages` branch.
- Use the `/winme/` path, not the repository root without it.

**The meeting link is empty in real mode**
The Calendar event was created without conference data. Confirm the Calendar API is enabled, `conferenceDataVersion: 1` is still in the insert call, and the deployment is up to date. Check the event in Google Calendar; the meeting link should be there.

**No email arrived**
`sendUpdates: "all"` only sends to the attendees. Check `EXEC_DEMO_EMAIL` is a real address you control, and look in spam. The demo operator address receives the calendar invite too.

**The `.ics` file opens in the wrong time zone**
The file is written in UTC with `DTSTART`/`DTEND`, which calendar apps convert to the viewer's local time. If it looks off, check the device calendar's time zone.

## Notes and limitations

- No payment processor is integrated. The card screen is a visual simulation.
- No authentication or accounts. Bookings are browser-local, and the Sheet is the backend record in real mode.
- Booked-slot lookup is public per operator so the availability picker can work without login. It returns slot times only, no personal data.
- Profiles, ratings, reviews, session counts and companies are synthetic. Do not treat them as claims about real people.
- Sessions are advice only. The consent checkbox and the booking, profile and FAQ copy all state that no outcome is guaranteed.
