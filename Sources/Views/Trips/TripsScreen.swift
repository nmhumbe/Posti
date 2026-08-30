import SwiftUI
import SwiftData

/// Tab 2 — Trips / Journal. Artboard 1a: heading + "New entry", search pill,
/// list of trip cards. Phase 1 builds: real cards with washed cover art, the
/// Compose sheet, trip detail (hero + Photos/Notes toggle), photo detail.
struct TripsScreen: View {
    @Query(sort: \Trip.startDate, order: .reverse) private var trips: [Trip]
    @Environment(\.modelContext) private var context
    @State private var showingCompose = false

    var body: some View {
        ScreenScaffold(title: "Trips") {
            HStack {
                Spacer()
                Button { showingCompose = true } label: {
                    Label("New entry", systemImage: "plus")
                        .font(Theme.Font.heading(13))
                        .padding(.horizontal, 15).padding(.vertical, 9)
                        .background(Theme.Color.accent, in: Capsule())
                        .foregroundStyle(Theme.Color.bg)
                }
                .buttonStyle(.plain)
            }

            HStack(spacing: Theme.Space.s2) {
                Image(systemName: "magnifyingglass")
                Text("Search places, notes, people")
                Spacer()
            }
            .font(Theme.Font.body(13))
            .foregroundStyle(Theme.Color.neutral600)
            .padding(.horizontal, 15).padding(.vertical, 10)
            .background(Theme.Color.neutral200, in: Capsule())

            if trips.isEmpty {
                ComingSoon(note: "No trips yet. Phase 1: tap \"New entry\" to create a city entry — geocode the place, add photos + captions, write day notes. Trip cards render here.")
            } else {
                ForEach(trips) { trip in
                    Card {
                        VStack(alignment: .leading, spacing: Theme.Space.s2) {
                            Text(trip.title).font(Theme.Font.h4).foregroundStyle(Theme.Color.text)
                            Text(dateRange(trip)).font(Theme.Font.body(11)).foregroundStyle(Theme.Color.neutral600)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
            }
        }
        .sheet(isPresented: $showingCompose) {
            ComposePlaceholder()
        }
    }

    private func dateRange(_ t: Trip) -> String {
        let f = DateFormatter(); f.dateFormat = "d MMM yyyy"
        switch (t.startDate, t.endDate) {
        case let (s?, e?): return "\(f.string(from: s)) – \(f.string(from: e))"
        case let (s?, nil): return f.string(from: s)
        default: return "No dates"
        }
    }
}

/// Stand-in for the Compose ("New entry") sheet — Phase 1 replaces this with the
/// real form (photo grid, place search, notes, mood chips, "fill in the map").
private struct ComposePlaceholder: View {
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            ScreenScaffold(title: "New entry") {
                ComingSoon(note: "Photo add-grid · \"Where were you?\" place search (MKLocalSearch → coords + ISO) · notes textarea · mood chips · \"Fill in the map\" toggle · Save → toast.")
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
            }
        }
    }
}

#Preview {
    TripsScreen()
        .modelContainer(Persistence.makeContainer(inMemory: true))
}
