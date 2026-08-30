import XCTest
@testable import TravelJournal

final class DistanceCalculatorTests: XCTestCase {

    /// LAX (33.9416, -118.4085) → NCE (43.6584, 7.2159) is ~5,940 mi
    /// (the value shown in the prototype's Legs list).
    func testLAXtoNice() {
        let d = DistanceCalculator.miles(
            fromLat: 33.9416, lon: -118.4085,
            toLat: 43.6584, lon: 7.2159
        )
        XCTAssertEqual(d, 5940, accuracy: 60)   // within ~1%
    }

    func testZeroDistance() {
        let d = DistanceCalculator.miles(fromLat: 40, lon: -74, toLat: 40, lon: -74)
        XCTAssertEqual(d, 0, accuracy: 0.001)
    }

    /// Antipodal points ≈ half the Earth's circumference.
    func testAntipodal() {
        let d = DistanceCalculator.miles(fromLat: 0, lon: 0, toLat: 0, lon: 180)
        XCTAssertEqual(d, .pi * DistanceCalculator.earthRadiusMiles, accuracy: 1)
    }
}
