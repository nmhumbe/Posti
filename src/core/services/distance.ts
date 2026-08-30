/** Great-circle distance. Turns an airport pair into Flight.distanceMiles. */

export const EARTH_RADIUS_MILES = 3958.7613;
export const EARTH_CIRCUMFERENCE_MILES = 24_901;

export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius = EARTH_RADIUS_MILES,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
