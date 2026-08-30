import Foundation

/// Ownership seam for the future multi-user backend.
///
/// Every user-owned record stores an `ownerID`. Today there is exactly one local
/// user, so `ownerID` is this constant. When Sign in with Apple / Supabase lands,
/// `current` becomes the signed-in user's id and existing rows are migrated once.
enum Identity {
    /// Stable local-user id. Do not change — existing records key off it.
    static let localOwnerID = UUID(uuidString: "0000A11C-0000-4000-8000-000000000001")!

    static var current: UUID { localOwnerID }
}
