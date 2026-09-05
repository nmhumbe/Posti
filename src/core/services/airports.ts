/**
 * Bundled OpenFlights airport directory (src/core/data/airports.json), lazily
 * loaded so it never bloats the main bundle — same pattern as the map's
 * world-atlas TopoJSON. Data: OpenFlights (openflights.org/data.html), public.
 */

export interface Airport {
  iata: string;
  name: string;
  city: string;
  countryISO3: string; // "" if unresolved (rare — territories with no ISO3)
  lat: number;
  lon: number;
}

// generated rows are tuples: [iata, name, city, countryISO3, lat, lon]
type Row = [string, string, string, string, number, number];

let cache: Airport[] | null = null;
let byIata: Map<string, Airport> | null = null;

async function ensureLoaded(): Promise<Airport[]> {
  if (cache) return cache;
  const rows = (await import("../data/airports.json")).default as unknown as Row[];
  cache = rows.map(([iata, name, city, countryISO3, lat, lon]) => ({
    iata,
    name,
    city,
    countryISO3,
    lat,
    lon,
  }));
  byIata = new Map(cache.map((a) => [a.iata, a]));
  return cache;
}

export async function airportByIATA(code: string): Promise<Airport | undefined> {
  await ensureLoaded();
  return byIata?.get(code.toUpperCase());
}

/** IATA-prefix matches first, then city/name substring matches. */
export async function searchAirports(query: string, limit = 8): Promise<Airport[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const all = await ensureLoaded();

  const iataStarts: Airport[] = [];
  const nameMatches: Airport[] = [];
  for (const a of all) {
    if (a.iata.toLowerCase().startsWith(q)) iataStarts.push(a);
    else if (
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
    ) {
      nameMatches.push(a);
    }
    if (iataStarts.length >= limit && nameMatches.length >= limit) break;
  }
  return [...iataStarts, ...nameMatches].slice(0, limit);
}
