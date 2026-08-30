import Foundation
import SwiftData

/// One city visit. The unit the Trips tab is built around, and the primary
/// signal for lighting up the map (`countryISO`).
@Model
final class JournalEntry {
    var id: UUID = UUID()
    var ownerID: UUID = Identity.localOwnerID
    var tripID: UUID?

    var cityName: String = ""
    /// ISO 3166-1 alpha-3, e.g. "FRA". Empty until geocoding resolves it.
    var countryISO: String = ""
    var latitude: Double = 0
    var longitude: Double = 0

    var arrivalDate: Date?
    var departureDate: Date?
    var coverPhotoID: UUID?
    var orderIndex: Int = 0

    var createdAt: Date = Date.now
    var updatedAt: Date = Date.now
    var deletedAt: Date?

    init(
        id: UUID = UUID(),
        ownerID: UUID = Identity.localOwnerID,
        tripID: UUID? = nil,
        cityName: String = "",
        countryISO: String = "",
        latitude: Double = 0,
        longitude: Double = 0,
        arrivalDate: Date? = nil,
        departureDate: Date? = nil,
        coverPhotoID: UUID? = nil,
        orderIndex: Int = 0
    ) {
        self.id = id
        self.ownerID = ownerID
        self.tripID = tripID
        self.cityName = cityName
        self.countryISO = countryISO
        self.latitude = latitude
        self.longitude = longitude
        self.arrivalDate = arrivalDate
        self.departureDate = departureDate
        self.coverPhotoID = coverPhotoID
        self.orderIndex = orderIndex
    }
}
