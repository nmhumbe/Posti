import Foundation
import SwiftData

enum MapFill: String, CaseIterable, Codable, Sendable {
    case terracotta   // #c67139  (accent)
    case sage         // #7a8a5e  (accent-2)
    case rust         // #8c491a
    case clay         // #b2622d
}

enum JournalPrivacy: String, CaseIterable, Codable, Sendable {
    case onlyMe
    case sharedLink   // reserved for Phase 6
}

/// Exactly one row today. This is the seam where multi-user plugs in: `id`
/// becomes the signed-in user id and the Me tab gains account management, with
/// no change to the screen's layout.
@Model
final class Profile {
    var id: UUID = Identity.localOwnerID
    var ownerID: UUID = Identity.localOwnerID

    var displayName: String = ""
    var homeCityName: String?
    var homeAirportIATA: String?
    var joinedAt: Date = Date.now

    var mapFillRaw: String = MapFill.terracotta.rawValue
    var milesGoal: Int = 100_000
    var journalPrivacyRaw: String = JournalPrivacy.onlyMe.rawValue

    var createdAt: Date = Date.now
    var updatedAt: Date = Date.now

    var mapFill: MapFill {
        get { MapFill(rawValue: mapFillRaw) ?? .terracotta }
        set { mapFillRaw = newValue.rawValue }
    }
    var journalPrivacy: JournalPrivacy {
        get { JournalPrivacy(rawValue: journalPrivacyRaw) ?? .onlyMe }
        set { journalPrivacyRaw = newValue.rawValue }
    }

    init(
        id: UUID = Identity.localOwnerID,
        displayName: String = "",
        homeCityName: String? = nil,
        homeAirportIATA: String? = nil
    ) {
        self.id = id
        self.ownerID = id
        self.displayName = displayName
        self.homeCityName = homeCityName
        self.homeAirportIATA = homeAirportIATA
    }
}
