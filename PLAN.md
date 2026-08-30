# Travel Journal — Implementation Plan

A personal travel journal, built as an installable web app (PWA) now — the user has no Mac —
and architected so the same core ports to a native iOS app (Expo / React Native) later.

**Status:** Phase 0 scaffold **built and passing** (`npm run build` + `tsc` green). The world
map renders real geometry; other tabs are styled with honest stubs.

**Platform decision (2026-08-30):** no Mac available for the foreseeable future, so the
SwiftUI/Xcode path was dropped. Building as **React + Vite PWA**, installable to the iPhone
home screen from Safari. The app is split so a future native rewrite is UI-only:

- `src/core/` — plain TypeScript: models, local DB, services (distance, stats, geo/projection),
  the future Supabase adapter. **Ports to Expo/React Native unchanged.**
- `src/ui/` — React DOM components + screens. The only layer rewritten for native.

If a Mac appears later: `npx create-expo-app`, copy `src/core/` in, rebuild `src/ui/` with
React Native primitives, swap Dexie for op-sqlite/WatermelonDB. Data layer, types, design
tokens, and the whole architecture carry over.

**Sync:** local-first via **IndexedDB (Dexie)** now — offline, no account. **Supabase**
(Postgres + Auth + Storage + Row-Level Security) behind the same repo functions when other
people use it. Every row already carries `ownerId` + `createdAt/updatedAt` + soft delete.

**Design source:** Claude Design project "Travel Journal App Design", file `Travel Journal.dc.html`
(saved under `design/`). The prototype defines **five** tabs — Map, Trips, Passport, Miles, Me.

---

## 1. Product

Five tabs (labels match the prototype):

| Tab | Purpose |
|-----|---------|
| **Map** | 2D choropleth world map (d3 `geoNaturalEarth1` in the prototype); each visited country filled in the accent tint. "5 of 195" headline + a circular %-of-world badge. Stat tiles (countries, continents, miles flown), a "By region" progress-bar list, and visited-country chips underneath. |
| **Trips** | List of trip cards (cover photo, title, dates, country / #photos / #notes tags) + search + "New entry". Opening a trip → hero photo, then a **Photos / Notes** segmented control: Photos = 2-col grid with caption + place; Notes = day cards ("Day 1 · arrival" + body). Tapping a photo → full-bleed photo detail with note + tags. |
| **Passport** | Aesthetic only. Skeuomorphic passport spread (dark cover, diagonal-hatch pages), rotated visa stamps (solid = collected, dashed = awaiting) and circular country stamps dated from the real visit. Prev/next page controls. "Next stamp: Portugal — 62%" progress card. |
| **Miles** | Big accent card: total miles (e.g. "68,420"), "2.75× around the Earth", goal progress (69% of 100,000). Stat tiles (flights, avg leg, hours in the air). "Legs" list (route, date, airline, miles) + "Add manually". |
| **Me** | Avatar, name, home city + join date, country/photo count tags. **Badges** grid (earned + dimmed/locked). Settings list: map fill colour, home airport, miles source, journal privacy. This is the natural home for auth/account once multi-user. |

A **Compose ("New entry")** sheet is shared: photo add-grid, "Where were you?" place search, notes textarea,
mood chips, a "Fill in the map" toggle, Save. Saving shows a toast and drops you on the Trips tab.

---

## 2. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| App shell | **React 18 + Vite 6 + TypeScript**, `vite-plugin-pwa` | Installable, offline, auto-updating service worker. `react-router-dom` for tabs + detail routes. |
| Local store | **Dexie (IndexedDB)** + `dexie-react-hooks` `useLiveQuery` | The `@Query`-style live binding; photo bytes in a separate blob store, rows hold the key. |
| Sync (later, multi-user) | **Supabase** (Postgres + Auth + Storage + RLS) | Behind the same `src/core` repo functions; sync loop keyed on `updatedAt`. Relational data suits the stats; PostGIS available for geo. |
| World map | **world-atlas `countries-110m`** TopoJSON (npm) + **`d3-geo` `geoNaturalEarth1`** + `topojson-client`, rendered as SVG `<path>`s | Exactly the prototype's approach — ported, not reimplemented. Bundled (~38 KB gzip), cached hard by the service worker. |
| Airports / distance | **OpenFlights** airport table (public domain, to bundle) + haversine (`src/core/services/distance.ts`, done) | ~7,700 airports with lat/long. No network. |
| Geocoding | Nominatim (OpenStreetMap) or MapTiler/Mapbox geocoding API | City name → coords + ISO country. Nominatim is free (usage policy: cache results, 1 req/s). |
| Fonts | `@fontsource/caprasimo`, `@fontsource/figtree` | Self-hosted (offline), no Google Fonts request. |
| Country/continent table | `src/core/data/countries.ts` | **Partial** (~90 rows) — complete to all 193 UN members in Phase 2. |

---

## 3. Architecture

```
src/ui/          React DOM — rewritten for native later
  App.tsx                    router + bottom tab bar
  components.tsx             Screen, Card, StatTile, Tag, buttons, ComingSoon
  screens/                   MapScreen, TripsScreen, PassportScreen, MilesScreen, MeScreen

src/core/        plain TS — ports to Expo unchanged
  models.ts                  entity types (Owned, Trip, JournalEntry, Photo, DayNote, Flight, …)
  identity.ts                ownerId seam, newId()
  db.ts                      Dexie schema + photo blob store + seedProfile()
  dev.ts                     sample data / reset (dev only)
  data/countries.ts          numeric-ISO ↔ A3 ↔ name/continent (partial)
  services/
    distance.ts              haversine  ✓
    stats.ts                 computeWorldStats — the map fill set + stat strip  ✓
    geo.ts                   world-atlas load + geoNaturalEarth1 projection  ✓
  repo.ts                    CRUD funcs the UI calls  [Phase 1 — swap point for Supabase]
  sync.ts, auth.ts           [Phase 6]

src/theme/tokens.css         port of design/organic-styles.css
```

### Rules that keep the door open to multi-user

1. **Every user-owned record carries:** a client-generated string `id`, `ownerId`,
   `createdAt`, `updatedAt`, `deletedAt?` (soft delete). Today `ownerId` is a single
   local constant; later it is `auth.uid()`. Sync then reduces to
   "send rows where `updatedAt > lastSyncedAt`".
2. **Reference data is separate from user data.** Countries, continents, airports are
   identical for everyone — bundled in `src/core/data/`. They never sync.
3. **Photos are references, never inline.** Bytes go in a separate blob store
   (`photoBlobs`, keyed by string); the `Photo` row holds only `blobKey`. Later that
   key becomes a Supabase Storage URL. Downscale on import; keep the original optionally.
4. **Model shape stays backend-portable:** flat rows, id references instead of nested
   objects, no store-specific features. Maps cleanly onto a Postgres schema later.
5. **All persistence goes through `src/core/repo.ts`.** UI never touches Dexie (or a
   network client) directly — that's the single swap point for Supabase.

---

## 4. Data model

### User data (SwiftData `@Model`, synced via CloudKit)

```
Trip
  id, ownerID, title, startDate?, endDate?, notes?, coverPhotoID?
  createdAt, updatedAt, deletedAt?

JournalEntry            // "a city"
  id, ownerID, tripID?, cityName, countryISO, latitude, longitude,
  arrivalDate?, departureDate?, coverPhotoID?, orderIndex
  createdAt, updatedAt, deletedAt?

Photo
  id, ownerID, entryID, filename, caption?, takenAt?, latitude?, longitude?, orderIndex
  createdAt, updatedAt, deletedAt?

DayNote
  id, ownerID, entryID, dayNumber, title, bodyMarkdown, date?, orderIndex
  createdAt, updatedAt, deletedAt?

Flight
  id, ownerID, tripID?, originIATA, destIATA, date?,
  airline?, flightNumber?, distanceMiles   // cached haversine result
  createdAt, updatedAt, deletedAt?

CountryVisit           // mostly derived; rows exist for manual overrides / metadata
  id, ownerID, countryISO, status, firstVisitDate?, note?
  createdAt, updatedAt, deletedAt?
  // status: visited | lived | layover | wishlist

Profile                // one row now; the seam for multi-user
  id (== ownerID), displayName, homeCityName?, homeAirportIATA?,
  joinedAt, mapFillChoice, milesGoal, journalPrivacy
  createdAt, updatedAt
```

### Reference data (bundled, read-only)

```
Country   iso (A3), name, continent, region, unMember: Bool, centroidLat, centroidLon
Airport   iata, name, city, countryISO, latitude, longitude
+ countries.geojson : per-country boundary polygons keyed by ISO A3
```

### Single source of truth for the map

A country counts as **visited** if any of:
- a `JournalEntry` exists with that `countryISO`, or
- a `Flight` originates/lands/routes through it, or
- a manual `CountryVisit` with status `visited`/`lived`.

`wishlist` and `layover` come only from explicit `CountryVisit` rows.
`StatsService` derives every number and the fill set from these three inputs.

---

## 5. Tab implementation notes

### Tab 1 — Map + stats

- **Geometry:** load `countries-110m.json` (~100 KB) once at launch into
  `CountryGeometryStore`: `[isoNumeric: [[CLLocationCoordinate2D]]]` (multi-polygon).
- **Rendering:** SwiftUI `Canvas` with the **Natural Earth I** projection ported from the
  prototype's d3 code (see §6). Fill visited countries with the accent tint; stroke the
  rest with a hairline. (Equirectangular is a fine first-pass fallback.)
- **Interaction:** `MagnificationGesture` + `DragGesture` for pinch/pan. Tap →
  inverse-project the point → point-in-polygon test → open a country sheet (its cities,
  status toggle).
- **Shades:** visited / lived / layover-only / wishlist — 3–4 tints. A wishlist map is
  a popular, cheap feature.
- **Stats strip:** countries (`X / 193` UN members), continents (`X / 7`), % of world,
  cities, travel days this year, new countries this year, longest trip. Add a small
  year-by-year heat calendar and an "on this day" memory card.
- **Tests:** assert known lat/long → screen point for the chosen projection.

### Tab 2 — Trips / Journal (build first — this is the core value)

- List of trip/city `Card`s (washed cover, title, dates, country / #photos / #notes tags),
  search pill, "+ New entry" → Compose sheet.
- **Trip detail** = hero photo + `SegmentedToggle` with two sub-views:
  - **Photos:** `PhotosPicker` multi-select grid, per-photo caption, drag to reorder.
    *High-value add:* "Import photos from `arrivalDate…departureDate`" using `PHAsset`
    creation date + location metadata, so you caption instead of hunt. Directly targets
    "I'm bad at journaling."
  - **Notes:** ordered `DayNote`s. `dayNumber` + `title` ("Day 1: Arrival") + markdown
    body. Offer journaling prompts ("Best meal? What surprised you?") and voice-memo
    capture → transcription (Speech framework) for quick entry on the road.
- On create: geocode `cityName` → coordinates + `countryISO`; this lights the map and
  mints a passport stamp automatically.

### Tab 3 — Passport (build last — pure aesthetics)

- `PassportSpread` per page (prev/next controls, or `.tabViewStyle(.page)`), with rotated
  `VisaStamp`s (solid = collected, dashed = awaiting) and circular country `Stamp`s.
- Stamps generated procedurally from SwiftUI shapes: country name, real entry date,
  a per-continent motif/colour, slight random rotation. "Next stamp: <country> — NN%"
  progress `Card`. Stretch: unlockable stamp styles, a "customs declaration" stat page.

### Tab 4 — Miles

- Add flight: origin/destination IATA with autocomplete from `AirportDirectory`,
  date, optional airline / flight number.
- `DistanceCalculator` = haversine between the two airport coordinates; cache on
  `Flight.distanceMiles`.
- **Stats:** total miles, flight count, longest flight, unique airports (mini map),
  airlines flown, domestic vs international, rough CO₂, and equivalents
  ("2.4× around the Earth", "18% of the way to the Moon").
- Later: scan a boarding-pass PDF417 barcode (Vision / PKPass) or look up
  flight number + date via an API (e.g. AeroDataBox) to auto-fill the route.

### Tab 5 — Me

- Header: avatar, display name, home city + join date, country/photo count `Tag`s.
- **Badges** grid: earned badges full-opacity, unearned dimmed with a progress hint
  (e.g. "Five continents · 2 of 5"). Badge definitions live in code; earned state is
  derived by `StatsService`.
- **Settings** list (grouped, iOS-style): map fill colour (accent / sage / the two
  extra browns from the prototype), home airport (defaults the Miles "from"), miles
  source (auto + manual), journal privacy.
- Backed now by a single local `Profile` record. When multi-user lands, this screen
  gains Sign in with Apple + account management with no layout change.

---

## 6. Visual design system

Imported from Claude Design project **"Travel Journal App Design"**
(`claude.ai/design/p/9626d162-8e19-4823-8b49-83b74264e66f`). Files saved to `design/`:
`Travel Journal.dc.html` (the prototype + 5 alt treatments) and `organic-styles.css`
(the "organic" token set — the source of truth). `ios-frame.jsx` / `image-slot.js` /
`support.js` are Claude Design's canvas runtime, not app code.

**Aesthetic:** warm, paper-like. Cream ground, terracotta + sage accents, a chunky
display face for headings, everything on generous radii, small controls fully pill-shaped,
photos run through a faded "washed" filter. Think field notebook, not dashboard.

### Tokens → `Theme.swift`

| Group | Values |
|---|---|
| **Ground** | bg `#f5ead8` · surface `#ebddc5` · text `#201e1d` · divider = text @ 16% |
| **Accent (terracotta)** | base `#c67139`; ramp 100→900: `#fff2eb` `#ffe1d0` `#ffc6a5` `#f6a06b` `#d67f48` `#b2622d` `#8c491a` `#643312` `#402310` |
| **Accent 2 (sage)** | base `#7a8a5e`; ramp 100→900: `#f0fae1` `#e1eecc` `#ccdbb2` `#aebf92` `#8fa073` `#728157` `#56633f` `#3d472b` `#272e1b` |
| **Neutral (warm grey)** | 100→900: `#f9f4ed` `#eee7db` `#dcd3c4` `#c0b6a5` `#a19786` `#82796a` `#645c50` `#474238` `#2e2b25` |
| **Type** | heading **Caprasimo** 400 (bundle the TTF); body **Figtree** 400/600/700 (bundle). Scale: 42 / 32 / 25 / 20 / 16 / 13. Kicker = 600 11px, uppercase, tracking .1em, colour accent-700 or neutral-700. |
| **Spacing** | 4.4 · 8.8 · 13.2 · 17.6 · 26.4 · 35.2 (4pt grid × 1.1) |
| **Radius** | card ≈ 32 (`radius-lg` 28 × 1.15) · tile/hero 18–24 · pill 999 for buttons, tags, inputs, segmented controls |
| **Shadow** | sm `0 1 2 / rgba(46,43,37,.14)` · md `0 3 10 / .16` · lg `0 12 32 / .22` |
| **Photo filter** | `.washed` = saturation .6, contrast .85, brightness 1.1, opacity .94 — apply to every image |

### Components → `Views/Shared/`

`Card` (surface, r32, elev-sm) · `StatTile` (neutral-100, big display number in accent, small
label) · `Kicker` (uppercase label) · `Pill` / `Tag` (accent-200 / accent-2-200 / neutral-200
variants) · `SegmentedToggle` (pill track, active pill = neutral-100 on accent-700 text) ·
`PrimaryButton` (accent fill, bg-colour text, pill) · `WashedImage` (AsyncImage/Image + the
washed filter + rounded clip) · `RegionBar` (label + track + value) · `RingStat` (conic-gradient
donut, from alt 1c) · `MapFrame` (rounded accent-2-200 panel wrapping the map canvas) ·
`Stamp` / `VisaStamp` (rotated, solid = collected / dashed = awaiting) · `PassportSpread`
(accent-900 cover, two hatch-textured pages) · `Toast` (accent-800 pill, slide-up).

### Map rendering (port of the prototype's d3 code)

The prototype: fetches `world-atlas@2.0.2/countries-110m.json`, `topojson.feature(...)`,
`d3.geoNaturalEarth1().fitSize([790,392], …)`, `d3.geoPath`, draws one `<path>` per country,
`fill = visited[id] ? accent : neutral-300`, stroke `#dcefc0` 0.6. Visited keyed by **numeric
ISO 3166** (250 FR, 724 ES, 360 ID, 356 IN, 840 US). City pins = small circles at projected
coords. Alt 1b = night map (neutral-900 ground, glow `#f6a06b` on visited).

Swift port:
1. Bundle `countries-110m.json`; decode TopoJSON → polygon rings per country id (tiny
   hand-rolled decoder or precompute GeoJSON at build time).
2. Implement **Natural Earth I** projection in Swift — it's a fixed polynomial in latitude
   (public formula); `fitSize` is just compute-bbox-then-scale/translate. Unit-test against a
   few known city coords.
3. `Canvas` draws the `Path`s; a `visitedISO: Set<String>` drives fill. `MagnificationGesture`
   + `DragGesture` for zoom/pan; tap → inverse project → point-in-polygon → country sheet.
4. Keep the numeric-ISO ↔ ISO-A3 ↔ name/continent mapping in `iso_continent.json`.

### Screen inventory (from `Travel Journal.dc.html`, artboard 1a)

| Screen | Key elements |
|---|---|
| **Map** | kicker "Your world" · h2 "5 of 195" · circular %-badge · `MapFrame` · 3 `StatTile`s (countries / continents / miles flown) · "By region" `RegionBar` list · visited chips |
| **Trips** | h2 "Trips" · "+ New entry" pill · search pill · trip `Card`s (washed cover, title, dates, 3 tags) |
| **Trip / Journal detail** | 250-tall hero (washed) + top gradient + circular back button · kicker "country · dates" · h2 title 34 · `SegmentedToggle` Photos/Notes · Photos = 2-col grid (washed, caption, place) · Notes = day `Card`s (kicker "Day 1 · arrival" + body) |
| **Photo detail** | 470-tall washed photo + back button · sheet with r28 top · h3 caption · place · date · note body · tags |
| **Passport** | kicker "Stamps collected" · h2 "Passport" · prev/next circular buttons · `PassportSpread` with `VisaStamp`s + circular `Stamp`s · "Next stamp: Portugal / 62%" `Card` |
| **Miles** | kicker "Since 2025" · h2 "Miles" · accent hero card (46px number, "2.75× around the Earth", goal bar) · 3 `StatTile`s · "Legs" list rows (route, date · airline, miles) · "+ Add manually" |
| **Me** | avatar circle · h3 name · "city · joined …" · count tags · Badges 2-col grid (dimmed when locked) · settings list (map fill colour, home airport, miles source, journal privacy) |
| **Compose sheet** | Cancel / "New entry" / Save · 3-col photo grid w/ dashed "Add" tile · "Where were you?" input · Notes textarea · Mood chips · "Fill in the map" toggle row · "Save entry" button · success `Toast` |

### Alternate treatments to consider (artboards 1b–1e)

- **1b** night map · **1c** sage map + `RingStat` donuts instead of bars · **1d** heavier
  skeuomorphic passport (visas overlapping the gutter) · **1e** scrapbook journal column
  (photo with washi-tape, rotated note cards) — a strong option for the Notes view.

---

## 7. Build phases

| Phase | Deliverable | Status |
|---|---|---|
| **0. Scaffold** | Vite + React + TS + PWA, 5-tab router shell, `tokens.css` + self-hosted fonts, component vocabulary, Dexie schema, `src/core` models + services (distance, stats, geo), sample-data seed. Real world-map rendering. | **done — build + typecheck green** |
| **1. Trips / Journal** | `src/core/repo.ts` (CRUD, the Supabase swap point). Compose sheet — place search + geocode (Nominatim), photo picker → blob store + captions, day notes. Trip detail: hero + Photos/Notes toggle. Photo detail route. | not started |
| **2. Map + stats** | Complete `countries.ts` to 193; pan/zoom + tap-to-open a country sheet; wire `Profile.mapFill`; "By region" bars + visited chips from `stats`. | map renders; interaction + full data pending |
| **3. Miles** | Bundle OpenFlights `airports.csv`; "Add manually" with IATA autocomplete → haversine → cached `distanceMiles`; resolve IATA→country to fold flights into the map. Legs list is live already. | data model + hero + legs done |
| **4. Passport** | `Stamp` / `VisaStamp` / `PassportSpread` components, page nav, "next stamp" progress, per-continent motifs. | not started |
| **5. Me + polish** | Badges grid + earned logic, editable settings, JSON export/import, offline-install polish (real PNG icons, apple-touch-icon). | settings + tags render |
| **6. Multi-user (only if pursued)** | Supabase project; email/OAuth auth; `profiles` + per-table RLS (`owner_id = auth.uid()`); Supabase adapter behind `repo.ts`; sync loop on `updatedAt`; photos → Storage; migrate local data up as user #1. | not started |
| **→ Native iOS (if a Mac appears)** | `create-expo-app`; import `src/core/` as-is; rebuild `src/ui/` in RN; Dexie → op-sqlite; ship via EAS Build + TestFlight. | future |

---

## 8. Feature / improvement backlog

**Capture-friction reducers (highest leverage for this user)**
- Photos-app auto-import by date + location into a city entry.
- Voice-memo notes with on-device transcription.
- Journaling prompts.

**Retention**
- "On this day" memory resurfacing — in-app card + home-screen widget.
- Full-text search across all notes and captions.

**Map**
- Trip routes drawn between a trip's cities; flight arcs on the map.
- Sub-region fills (US states, Canadian provinces, Japanese prefectures) — stretch.
- City dots in addition to country fills.

**Sharing / output**
- PDF / photo-book export per trip.
- Shareable read-only web page for a trip.
- Collaborative trips with travel companions (this is the natural driver for the backend).

**Platform**
- Home-screen widgets: country count, next-trip countdown, random memory.
- JSON data export from day one.
- Accessibility: Dynamic Type, VoiceOver labels on map countries, dark mode.

---

## 9. Known hard parts

| Risk | Mitigation |
|---|---|
| Map tap hit-testing | Each country is an SVG `<path>` — use native `onClick` per path, or `projection.invert()` + point-in-polygon. The d3 dataset is well-tested. |
| iOS PWA storage eviction | Safari can clear an *uninstalled* site's data under pressure; installed (home-screen) PWAs on iOS 17+ persist well. Ship JSON export early and prioritise Supabase sync for real data safety. |
| Photo storage growth | Downscale to ~2000px on import; keep bytes in the blob store, not rows; originals optional. |
| No auto photo-import by location | Genuinely needs native — accept the gap for the PWA; it's a headline reason to move to Expo later. |
| Nominatim rate limits | Cache every geocode result on the entry; debounce the search box; 1 req/s. |

---

## 10. Repo layout

```
package.json  vite.config.ts  tsconfig.json  index.html
public/
  favicon.svg            (SVG mark; add PNG 192/512 + apple-touch-icon.png later)
src/
  main.tsx               entry — mounts <App>, imports fonts + tokens, seeds Profile
  App.tsx                router + bottom tab bar (5 tabs)
  theme/tokens.css        port of design/organic-styles.css
  ui/
    components.tsx         Screen, Card, StatTile, Tag, PillButton, PrimaryButton, ComingSoon
    screens/              MapScreen, TripsScreen, PassportScreen, MilesScreen, MeScreen
  core/                   ← plain TS, ports to Expo/RN unchanged
    identity.ts  models.ts  db.ts  dev.ts
    data/countries.ts      numeric-ISO ↔ A3 ↔ name/continent (partial ~90 rows)
    services/distance.ts   services/stats.ts   services/geo.ts
    repo.ts                [Phase 1]  sync.ts auth.ts  [Phase 6]
design/                  Travel Journal.dc.html, organic-styles.css  (imported reference)
PLAN.md  README.md
```

### Not in the repo yet

- **Real icons** — PNG 192×192 / 512×512 + a 180×180 `apple-touch-icon.png` in `public/`
  for the nicest home-screen install. SVG-only works for dev.
- **`src/core/data/airports.csv`** — OpenFlights airport table (public domain), Phase 3.
- **Full `countries.ts`** — extend to all 193 UN members, Phase 2.
- **`.env`** — `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, Phase 6.

### Running it

```sh
npm install
npm run dev        # opens on localhost + your LAN IP — open that IP on your iPhone
npm run build && npm run preview   # test the installable PWA
```

Deploy: push `dist/` to Vercel / Netlify / Cloudflare Pages (all free); then on the iPhone,
Safari ▸ Share ▸ Add to Home Screen.
