import SwiftUI
import SwiftData

/// Tab 1 — Map + stats. Layout mirrors artboard 1a: kicker, "N of 195" headline,
/// map frame, stat tiles, "By region" bars, visited chips.
///
/// Phase 2 fills in `MapFrame` (TopoJSON + Natural Earth I projection in a
/// `Canvas`), the region bars, and the chip row.
struct MapScreen: View {
    @Query private var entries: [JournalEntry]
    @Query private var visits: [CountryVisit]

    /// Derived visited set — a country counts if a journal entry or an explicit
    /// visit row touches it. Flights get folded in here in Phase 3.
    private var visitedISO: Set<String> {
        var set = Set(entries.map(\.countryISO).filter { !$0.isEmpty })
        for v in visits where v.status == .visited || v.status == .lived {
            if !v.countryISO.isEmpty { set.insert(v.countryISO) }
        }
        return set
    }

    private let totalCountries = 195

    var body: some View {
        ScreenScaffold(title: "\(visitedISO.count) of \(totalCountries)", kicker: "Your world") {
            ComingSoon(note: "Map canvas — bundle countries-110m.json, port d3 geoNaturalEarth1, render fills for the \(visitedISO.count) visited countries with pan / zoom / tap-to-open. (Phase 2)")

            HStack(spacing: Theme.Space.s2) {
                StatTile(value: "\(visitedISO.count)", label: "countries")
                StatTile(value: "—", label: "continents", valueColor: Theme.Color.accent2_700)
                StatTile(value: "—", label: "miles flown")
            }

            ComingSoon(note: "\"By region\" progress bars + visited-country chips. (Phase 2, driven by StatsService)")
        }
    }
}

#Preview {
    MapScreen()
        .modelContainer(Persistence.makeContainer(inMemory: true))
}
