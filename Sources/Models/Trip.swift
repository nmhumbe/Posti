import Foundation
import SwiftData

/// An optional grouping over journal entries — usually one real journey
/// ("Nice, 12–19 Jul 2026"). Entries can also exist without a trip.
///
/// CloudKit rules honoured throughout the model layer:
/// every stored property is optional or has a default, no `.unique` attributes,
/// no required relationships. Cross-record links are plain `UUID`s, not
/// SwiftData relationships, so the store stays sync-friendly and decoupled.
@Model
final class Trip {
    var id: UUID = UUID()
    var ownerID: UUID = Identity.localOwnerID

    var title: String = ""
    var startDate: Date?
    var endDate: Date?
    var notes: String?
    var coverPhotoID: UUID?

    var createdAt: Date = Date.now
    var updatedAt: Date = Date.now
    var deletedAt: Date?

    init(
        id: UUID = UUID(),
        ownerID: UUID = Identity.localOwnerID,
        title: String = "",
        startDate: Date? = nil,
        endDate: Date? = nil,
        notes: String? = nil,
        coverPhotoID: UUID? = nil
    ) {
        self.id = id
        self.ownerID = ownerID
        self.title = title
        self.startDate = startDate
        self.endDate = endDate
        self.notes = notes
        self.coverPhotoID = coverPhotoID
    }
}
