import SwiftUI
import SwiftData

/// Tab 4 — Miles. Artboard 1a: accent hero card (total, "N× around the Earth",
/// goal bar), stat tiles, "Legs" list. Phase 3 adds AirportDirectory + IATA
/// autocomplete + haversine.
struct MilesScreen: View {
    @Query(sort: \Flight.date, order: .reverse) private var flights: [Flight]

    private var totalMiles: Double { flights.reduce(0) { $0 + $1.distanceMiles } }
    private var timesAroundEarth: Double { totalMiles / 24_901 }

    var body: some View {
        ScreenScaffold(title: "Miles", kicker: "Since 2025") {
            VStack(alignment: .leading, spacing: Theme.Space.s2) {
                Text(totalMiles.formatted(.number.precision(.fractionLength(0))))
                    .font(Theme.Font.heading(46))
                    .foregroundStyle(Theme.Color.bg)
                Text("miles flown · \(timesAroundEarth, specifier: "%.2f")× around the Earth")
                    .font(Theme.Font.body(12))
                    .foregroundStyle(Theme.Color.bg.opacity(0.9))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Theme.Space.s4)
            .background(Theme.Color.accent, in: RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
            .elevation(Theme.Elevation.md)

            HStack(spacing: Theme.Space.s2) {
                StatTile(value: "\(flights.count)", label: "flights")
                StatTile(value: "—", label: "avg leg")
                StatTile(value: "—", label: "in the air")
            }

            ComingSoon(note: "\"Legs\" list (route · date · airline · miles) + \"Add manually\" (origin/dest IATA autocomplete → haversine → cache distanceMiles). Goal progress bar vs Profile.milesGoal. (Phase 3)")
        }
    }
}

#Preview {
    MilesScreen()
        .modelContainer(Persistence.makeContainer(inMemory: true))
}
