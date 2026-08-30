import type { JournalEntry, Flight, CountryVisit } from "../models";
import { countryByISO3, type CountryRow } from "../data/countries";
import { UN_MEMBER_COUNT } from "../data/countries";
import { EARTH_CIRCUMFERENCE_MILES } from "./distance";

export interface WorldStats {
  visitedISO3: Set<string>;
  countryCount: number;
  unMemberCount: number;
  percentOfWorld: number;
  continentCount: number;
  continents: string[];
  totalMiles: number;
  flightCount: number;
  timesAroundEarth: number;
  cityCount: number;
}

/**
 * Single source of truth for the map + stat strip. A country is "visited" if a
 * journal entry or an explicit visit row touches it. (Flights get folded in
 * once we resolve IATA → country, Phase 3.)
 */
export function computeWorldStats(
  entries: JournalEntry[],
  flights: Flight[],
  visits: CountryVisit[],
): WorldStats {
  const live = <T extends { deletedAt?: number | null }>(xs: T[]) =>
    xs.filter((x) => !x.deletedAt);

  const e = live(entries);
  const v = live(visits);
  const f = live(flights);

  const visitedISO3 = new Set<string>();
  for (const x of e) if (x.countryISO) visitedISO3.add(x.countryISO.toUpperCase());
  for (const x of v)
    if (x.countryISO && (x.status === "visited" || x.status === "lived"))
      visitedISO3.add(x.countryISO.toUpperCase());

  const continents = new Set<string>();
  for (const iso of visitedISO3) {
    const row: CountryRow | undefined = countryByISO3(iso);
    if (row) continents.add(row.continent);
  }

  const totalMiles = f.reduce((sum, x) => sum + (x.distanceMiles || 0), 0);

  return {
    visitedISO3,
    countryCount: visitedISO3.size,
    unMemberCount: UN_MEMBER_COUNT,
    percentOfWorld: (visitedISO3.size / UN_MEMBER_COUNT) * 100,
    continentCount: continents.size,
    continents: [...continents].sort(),
    totalMiles,
    flightCount: f.length,
    timesAroundEarth: totalMiles / EARTH_CIRCUMFERENCE_MILES,
    cityCount: e.length,
  };
}
