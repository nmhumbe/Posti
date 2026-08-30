import Foundation
import SwiftData

/// A photo attached to a journal entry. The image bytes live as a file in the
/// app container (see `PhotoStore`, Phase 1); this row only holds a reference
/// plus caption/metadata. Later `filename` can become a remote Storage URL.
@Model
final class Photo {
    var id: UUID = UUID()
    var ownerID: UUID = Identity.localOwnerID
    var entryID: UUID?

    /// Relative filename inside the app's photo directory, or a URL string once remote.
    var filename: String = ""
    var caption: String?
    var placeLabel: String?
    var takenAt: Date?
    var latitude: Double?
    var longitude: Double?
    var orderIndex: Int = 0

    var createdAt: Date = Date.now
    var updatedAt: Date = Date.now
    var deletedAt: Date?

    init(
        id: UUID = UUID(),
        ownerID: UUID = Identity.localOwnerID,
        entryID: UUID? = nil,
        filename: String = "",
        caption: String? = nil,
        placeLabel: String? = nil,
        takenAt: Date? = nil,
        latitude: Double? = nil,
        longitude: Double? = nil,
        orderIndex: Int = 0
    ) {
        self.id = id
        self.ownerID = ownerID
        self.entryID = entryID
        self.filename = filename
        self.caption = caption
        self.placeLabel = placeLabel
        self.takenAt = takenAt
        self.latitude = latitude
        self.longitude = longitude
        self.orderIndex = orderIndex
    }
}
