import { countryByISO2 } from "../data/countries";

/**
 * Place search via Nominatim (OpenStreetMap). Free, CORS-enabled, no key.
 * Usage policy: <=1 req/s, identify the app, cache results — all handled here.
 * Debounce the caller's input (see ComposeScreen).
 */

export interface PlaceResult {
  label: string; // "Nice, Alpes-Maritimes, France"
  cityName: string; // "Nice"
  countryName: string; // "France"
  countryISO2: string; // "fr"
  countryISO3: string; // "FRA" ("" if not in our partial table)
  latitude: number;
  longitude: number;
}

const ENDPOINT = "https://nominatim.openstreetmap.org/search";
const cache = new Map<string, PlaceResult[]>();

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;

  const url = `${ENDPOINT}?${new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    "accept-language": "en",
    limit: "6",
  })}`;

  const res = await fetch(url, {
    signal,
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`Geocoder ${res.status}`);
  const raw = (await res.json()) as NominatimPlaceRaw[];

  const results = raw
    .map(toPlaceResult)
    .filter((p): p is PlaceResult => p !== null);

  cache.set(key, results);
  return results;
}

interface NominatimPlaceRaw {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

function toPlaceResult(r: NominatimPlaceRaw): PlaceResult | null {
  const a = r.address ?? {};
  const cityName =
    a.city || a.town || a.village || a.municipality || r.name || a.state || "";
  if (!cityName || !a.country_code) return null;
  const iso2 = a.country_code.toUpperCase();
  return {
    label: r.display_name.split(",").slice(0, 3).join(",").trim(),
    cityName,
    countryName: a.country ?? "",
    countryISO2: a.country_code.toLowerCase(),
    countryISO3: countryByISO2(iso2)?.iso3 ?? "",
    latitude: Number(r.lat),
    longitude: Number(r.lon),
  };
}
