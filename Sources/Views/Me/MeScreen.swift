import SwiftUI
import SwiftData

/// Tab 5 — Me. Artboard 1a: avatar + name + home/join, count tags, Badges grid,
/// settings list. Backed by the single local `Profile` row; the seam for
/// Sign in with Apple later.
struct MeScreen: View {
    @Query private var profiles: [Profile]
    @Query private var entries: [JournalEntry]
    @Query private var photos: [Photo]

    private var profile: Profile? { profiles.first }

    var body: some View {
        ScreenScaffold(title: profile?.displayName.isEmpty == false ? profile!.displayName : "Me") {
            HStack(spacing: Theme.Space.s2) {
                Tag(text: "\(Set(entries.map(\.countryISO).filter { !$0.isEmpty }).count) countries", kind: .accent)
                Tag(text: "\(photos.count) photos", kind: .sage)
            }

            ComingSoon(note: "Badges grid (earned full-opacity, locked dimmed with progress hint). Definitions in code, earned state from StatsService. (Phase 5)")

            if let profile {
                Card(padding: 0) {
                    VStack(spacing: 0) {
                        settingRow("Map fill colour", value: profile.mapFill.rawValue.capitalized)
                        Divider().overlay(Theme.Color.divider)
                        settingRow("Home airport", value: profile.homeAirportIATA ?? "Not set")
                        Divider().overlay(Theme.Color.divider)
                        settingRow("Miles goal", value: profile.milesGoal.formatted())
                        Divider().overlay(Theme.Color.divider)
                        settingRow("Journal privacy", value: profile.journalPrivacy == .onlyMe ? "Only me" : "Shared link")
                    }
                }
            }
        }
    }

    private func settingRow(_ name: String, value: String) -> some View {
        HStack {
            Text(name).font(Theme.Font.body(13))
            Spacer()
            Text(value).font(Theme.Font.body(12)).foregroundStyle(Theme.Color.neutral600)
        }
        .foregroundStyle(Theme.Color.text)
        .padding(.horizontal, 16).padding(.vertical, 14)
    }
}

#Preview {
    MeScreen()
        .modelContainer(Persistence.makeContainer(inMemory: true))
}
