import Foundation
import SwiftData

/// A dated note within a journal entry — "Day 1 · arrival", body text below.
/// `body` is plain text / lightweight markdown.
@Model
final class DayNote {
    var id: UUID = UUID()
    var ownerID: UUID = Identity.localOwnerID
    var entryID: UUID?

    var dayNumber: Int = 1
    var title: String = ""
    var body: String = ""
    var date: Date?
    var orderIndex: Int = 0

    var createdAt: Date = Date.now
    var updatedAt: Date = Date.now
    var deletedAt: Date?

    init(
        id: UUID = UUID(),
        ownerID: UUID = Identity.localOwnerID,
        entryID: UUID? = nil,
        dayNumber: Int = 1,
        title: String = "",
        body: String = "",
        date: Date? = nil,
        orderIndex: Int = 0
    ) {
        self.id = id
        self.ownerID = ownerID
        self.entryID = entryID
        self.dayNumber = dayNumber
        self.title = title
        self.body = body
        self.date = date
        self.orderIndex = orderIndex
    }
}
