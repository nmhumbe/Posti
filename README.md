# Travel Journal

A personal travel journal — a world map that fills in as you visit countries, a city-by-city
photo + notes journal, an aesthetic passport, and a flight-miles tracker.

Built as an installable **web app (PWA)** so it needs no Mac. The code is split so the same
core ports to a native iOS app (Expo / React Native) later — see [PLAN.md](PLAN.md).

## Status

Phase 0 scaffold — **`npm run build` and `tsc` pass.** The world map renders real geometry
(d3 + world-atlas); Trips / Miles / Me are styled and live-bound to the local DB; Passport is
a stub. Load sample data from the Trips tab to see the map and stats populate.

## Run it

```sh
npm install
npm run dev
```

Vite prints a `localhost` URL and a LAN URL (e.g. `http://192.168.1.x:5173`). Open the LAN
URL in Safari on your iPhone (same Wi-Fi) to try it on device.

```sh
npm run build && npm run preview   # test the real installable PWA
npm run typecheck
```

**Install to your iPhone:** deploy `dist/` to Vercel / Netlify / Cloudflare Pages (free),
open the site in Safari, then Share ▸ Add to Home Screen. It then launches fullscreen and
works offline.

## Layout

```
src/ui/      React DOM — components + 5 screens. Rewritten for native later.
src/core/    Plain TypeScript — models, Dexie DB, services. Ports to Expo unchanged.
src/theme/   tokens.css — port of design/organic-styles.css
design/      imported Claude Design prototype + tokens
```

## Data

Local-first via IndexedDB (Dexie). No account, works offline. Multi-user later = a Supabase
adapter behind `src/core/repo.ts`; every row already carries `ownerId` + timestamps + soft
delete for sync.

## To add

- Real PNG app icons + `apple-touch-icon.png` in `public/` (SVG works for dev)
- `src/core/data/airports.csv` (OpenFlights) for the Miles tab
- Complete `src/core/data/countries.ts` to all 193 UN members
