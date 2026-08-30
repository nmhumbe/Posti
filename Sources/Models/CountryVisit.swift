import Foundation
import SwiftData

enum VisitStatus: String, CaseIterable, Codable, Sendable {
    case visited, lived, layover, wishlist
}

/// The map's fill set is *derived* — a country is "visited" if a `JournalEntry`
/// or `Flight` touches it. `CountryVisit` rows exist only for things that can't
/// be derived: manual overrides, `wishlist` / `layover` marks, and per-country
/// metadata (first visit date, a note).
///
/// Enum stored as its raw string (`statusRaw`) for CloudKit stability.
@Model
final class CountryVisit {
    var id: UUID = UUID()
    var ownerID: UUID = Identity.localOwnerID

    /// ISO 3166-1 alpha-3.
    var countryISO: String = ""
    var statusRaw: String = VisitStatus.visited.rawValue
    var firstVisitDate: Date?
    var note: String?

    var createdAt: Date = Date.now
    var updatedAt: Date = Date.now
    var deletedAt: Date?

    var status: VisitStatus {
        get { VisitStatus(rawValue: statusRaw) ?? .visited }
        set { statusRaw = newValue.rawValue }
    }

    init(
        id: UUID = UUID(),
        ownerID: UUID = Identity.localOwnerID,
        countryISO: String = "",
        status: VisitStatus = .visited,
        firstVisitDate: Date? = nil,
        note: String? = nil
    ) {
        self.id = id
        self.ownerID = ownerID
        self.countryISO = countryISO
        self.statusRaw = status.rawValue
        self.firstVisitDate = firstVisitDate
        self.note = note
    }
}
