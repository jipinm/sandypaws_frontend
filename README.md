# SandyPaws CRM: clickable prototype (React)

React 18 + Vite + Tailwind CSS 3.4 + Framer Motion. All data is fictional and held in memory.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve that build
```

The demo login is pre-filled; press **Sign in**. Reloading the page resets all data.
Inter loads from Google Fonts, with a system font as fallback when offline.

## Structure

```
src/
  App.jsx                 login <-> workspace switch
  Workspace.jsx           shell, view state, dialogs, toasts
  data/                   reference lists and sample records
  hooks/                  booking store, timed state, Escape key
  lib/                    motion presets, record helpers
  components/ui/          Button, Chip, Modal, Toast, PillTabs, Reveal, ...
  components/layout/      Sidebar, Header, SearchBox, ScrollProgress
  features/auth/          Login
  features/dashboard/     tiles, attention table, schedule, month planned
  features/prebooking/    list, detail dialog, 3-step new request
```

Theme colours are in `tailwind.config.js`; animation timings are in `src/lib/motion.js`.
`src/hooks/useBookingStore.js` is the place to connect a real API.

## Motion

| Original | Here |
| --- | --- |
| `.fi`, `.pop`, `.sl` keyframes | Framer Motion presets with the same timings |
| `.fl` row flash | kept as CSS |
| (new) | exit animations for dialogs, toasts, search, pages and the mobile drawer |
| (new) | sliding highlight on navigation and pill tabs |
| (new) | scroll reveals, scroll progress bar, header shadow on scroll |
| (new) | tile count-up, growing vaccine bars, pet card add/remove, press feedback |

The system "reduce motion" setting limits movement.

## Intentional differences from the HTML

- A planned month is formatted in UTC. The original could show the previous month west of UTC.
- Case numbers are assigned outside React state updaters, so StrictMode cannot skip numbers.
- Added ARIA labels and states for dialogs, toasts, toggles and form controls.

## Carried over as in the original

- "Today" is fixed at 24 November 2026, and dashboard totals include fixed baseline counts.
- "Submit to Post-Booking" only appears for an export that is not handed over. No sample record
  or form path creates one, because new exports go straight to intake review.
- Post-Booking, Accounts, Documents, HR and Administration show a message only.
