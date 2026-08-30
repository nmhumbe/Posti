# Travel Journal

A personal iOS travel journal — world map of visited countries, city-by-city photo +
notes journal, an aesthetic passport, and a flight-miles tracker. Built local-first with
SwiftData, architected to scale to multi-user later. See [PLAN.md](PLAN.md) for the full
plan; [design/](design/) holds the imported Claude Design prototype and tokens.

## Status

Phase 0 scaffold. Models, theme, persistence stack, and the 5-tab shell are in place;
every tab renders on-token but most content is stubbed (`ComingSoon`) with the phase that
fills it in. **Not yet built or run** — needs macOS + Xcode.

## Getting started (macOS)

```sh
brew install xcodegen
xcodegen            # generates TravelJournal.xcodeproj from project.yml
open TravelJournal.xcodeproj
```

`.xcodeproj` is generated and git-ignored — re-run `xcodegen` after adding files.

### Before it builds/runs cleanly

- **Fonts** — download Caprasimo and Figtree (Google Fonts, OFL), drop the TTFs in
  `Sources/Resources/Fonts/`. Until then `Font.custom` falls back to the system font.
- **Signing** — set your Apple team in Xcode ▸ target ▸ Signing & Capabilities (or
  `DEVELOPMENT_TEAM` in `project.yml`) to run on a device. The Simulator needs nothing.
- **Reference data** (Phase 2/3) — `countries-110m.json` (world-atlas), an ISO-numeric →
  A3/name/continent map, and `airports.csv` (OpenFlights) go in `Sources/Resources/Reference/`.

## Layout

```
project.yml            XcodeGen spec
Sources/
  App/        entry point, SwiftData container, ownership seam
  Theme/      Theme.swift (port of design/organic-styles.css), .washed()
  Models/     Trip, JournalEntry, Photo, DayNote, Flight, CountryVisit, Profile
  Services/   DistanceCalculator (more land in Phase 2+)
  Views/      Root/ + Map/ Trips/ Passport/ Miles/ Me/ + Shared/ components
Tests/        unit tests
design/       imported prototype + tokens
```

## Sync

Local store only for now. `Persistence.swift` flips to CloudKit (`.automatic`) in Phase 5
once the iCloud capability is added — the model layer is already CloudKit-safe.
