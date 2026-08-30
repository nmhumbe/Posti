import Foundation

/// Great-circle distance between two coordinates. Used by the Miles tab to turn
/// an airport pair into `Flight.distanceMiles` (cached on the row).
enum DistanceCalculator {
    static let earthRadiusMiles = 3958.7613
    static let earthRadiusKm = 6371.0088

    /// Haversine distance in statute miles.
    static func miles(
        fromLat lat1: Double, lon lon1: Double,
        toLat lat2: Double, lon lon2: Double
    ) -> Double {
        greatCircle(lat1: lat1, lon1: lon1, lat2: lat2, lon2: lon2, radius: earthRadiusMiles)
    }

    static func greatCircle(
        lat1: Double, lon1: Double, lat2: Double, lon2: Double, radius: Double
    ) -> Double {
        let φ1 = lat1 * .pi / 180
        let φ2 = lat2 * .pi / 180
        let dφ = (lat2 - lat1) * .pi / 180
        let dλ = (lon2 - lon1) * .pi / 180
        let a = sin(dφ / 2) * sin(dφ / 2)
            + cos(φ1) * cos(φ2) * sin(dλ / 2) * sin(dλ / 2)
        return radius * 2 * atan2(sqrt(a), sqrt(1 - a))
    }
}
