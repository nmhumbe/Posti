import Foundation
import SwiftData

/// A single flown leg. `distanceMiles` is the cached great-circle result so the
/// Miles tab never recomputes on scroll (see `DistanceCalculator`, Phase 3).
@Model
final class Flight {
    var id: UUID = UUID()
    var ownerID: UUID = Identity.localOwnerID
    var tripID: UUID?

    /// IATA codes, e.g. "LAX" / "NCE".
    var originIATA: String = ""
    var destIATA: String = ""
    var date: Date?
    var airline: String?
    var flightNumber: String?
    var distanceMiles: Double = 0

    var createdAt: Date = Date.now
    var updatedAt: Date = Date.now
    var deletedAt: Date?

    init(
        id: UUID = UUID(),
        ownerID: UUID = Identity.localOwnerID,
        tripID: UUID? = nil,
        originIATA: String = "",
        destIATA: String = "",
        date: Date? = nil,
        airline: String? = nil,
        flightNumber: String? = nil,
        distanceMiles: Double = 0
    ) {
        self.id = id
        self.ownerID = ownerID
        self.tripID = tripID
        self.originIATA = originIATA
        self.destIATA = destIATA
        self.date = date
        self.airline = airline
        self.flightNumber = flightNumber
        self.distanceMiles = distanceMiles
    }
}
