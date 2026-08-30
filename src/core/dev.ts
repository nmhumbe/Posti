import { db } from "./db";
import { currentOwnerId, newId } from "./identity";
import { haversineMiles } from "./services/distance";

/** Sample data lifted from the design prototype, so the map/stats have
 *  something to show before the real create flow exists. Dev only. */
export async function seedSampleData(): Promise<void> {
  const owner = currentOwnerId();
  const now = Date.now();
  const day = 86_400_000;

  const cities: Array<[string, string, number, number, number]> = [
    // city, ISO3, lat, lon, daysAgo
    ["Nice", "FRA", 43.7102, 7.262, 40],
    ["Ibiza", "ESP", 38.9067, 1.4206, 90],
    ["Ubud", "IDN", -8.5069, 115.2625, 200],
    ["Kochi", "IND", 9.9312, 76.2673, 300],
    ["Barcelona", "ESP", 41.3874, 2.1686, 340],
  ];

  for (let i = 0; i < cities.length; i++) {
    const [cityName, iso, lat, lon, daysAgo] = cities[i];
    await db.entries.put({
      id: newId(),
      ownerId: owner,
      cityName,
      countryISO: iso,
      latitude: lat,
      longitude: lon,
      arrivalDate: now - daysAgo * day,
      departureDate: now - (daysAgo - 6) * day,
      orderIndex: i,
      createdAt: now,
      updatedAt: now,
    });
  }

  const legs: Array<[string, number, number, string, number]> = [
    // origin lat/lon (LAX), dest lat/lon, label handled below
  ];
  void legs;

  const LAX: [number, number] = [33.9416, -118.4085];
  const dests: Array<[string, number, number]> = [
    ["NCE", 43.6584, 7.2159],
    ["IBZ", 38.8729, 1.3731],
    ["DPS", -8.7482, 115.1675],
    ["COK", 10.152, 76.4019],
    ["BCN", 41.2971, 2.0785],
  ];
  for (let i = 0; i < dests.length; i++) {
    const [iata, lat, lon] = dests[i];
    await db.flights.put({
      id: newId(),
      ownerId: owner,
      originIATA: "LAX",
      destIATA: iata,
      date: now - (300 - i * 60) * day,
      distanceMiles: Math.round(haversineMiles(LAX[0], LAX[1], lat, lon)),
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.trips.clear(),
    db.entries.clear(),
    db.photos.clear(),
    db.dayNotes.clear(),
    db.flights.clear(),
    db.countryVisits.clear(),
  ]);
}
