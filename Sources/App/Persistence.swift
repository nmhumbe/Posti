import Foundation
import SwiftData

/// The app's SwiftData stack.
///
/// Phase 0: local store only (`cloudKitDatabase: .none`) so the project builds
/// and runs without an iCloud entitlement or paid team.
///
/// Phase 5: add the iCloud + CloudKit capability, then switch to
/// `.automatic` (or `.private("iCloud.com.nehahumbe.traveljournal")`). The model
/// layer is already CloudKit-safe (all attributes optional/defaulted, no unique
/// constraints, no required relationships), so this is the only code change.
enum Persistence {
    static let schema = Schema([
        Trip.self,
        JournalEntry.self,
        Photo.self,
        DayNote.self,
        Flight.self,
        CountryVisit.self,
        Profile.self,
    ])

    static func makeContainer(inMemory: Bool = false) -> ModelContainer {
        let config = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: inMemory,
            cloudKitDatabase: .none   // Phase 5: .automatic
        )
        do {
            return try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    /// Ensures the single local `Profile` row exists. Call once on launch.
    @MainActor
    static func bootstrap(_ context: ModelContext) {
        let existing = try? context.fetch(FetchDescriptor<Profile>())
        guard (existing ?? []).isEmpty else { return }
        context.insert(Profile(displayName: "Me"))
        try? context.save()
    }
}
