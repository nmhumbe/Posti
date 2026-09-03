import type { JournalEntry, Flight, CountryVisit } from "../models";
import {
  countryByISO3,
  CONTINENTS,
  CONTINENT_TOTALS,
  UN_MEMBER_COUNT,
  type Continent,
} from "../data/countries";
import { EARTH_CIRCUMFERENCE_MILES } from "./distance";

export interface RegionStat {
  name: Continent;
  visited: number;
  total: number;
  pct: number; // 0..1
}

export interface VisitedCountry {
  iso3: string;
  name: string;
  continent: Continent | null;
}

export interface WorldStats {
  visitedISO3: Set<string>;
  visitedCountries: VisitedCountry[];
  countryCount: number;
  unMemberCount: number;
  percentOfWorld: number;
  continentCount: number;
  continents: string[];
  regions: RegionStat[];
  totalMiles: number;
  flightCount: number;
  timesAroundEarth: number;
  cityCount: number;
}

const live = <T extends { deletedAt?: number | null }>(xs: T[]) => xs.filter((x) => !x.deletedAt);

/**
 * Single source of truth for the map + stat strip. A country is "visited" if a
 * journal entry or an explicit visit row touches it. (Flights fold in once we
 * resolve IATA -> country, Phase 3.)
 */
export function computeWorldStats(
  entries: JournalEntry[],
  flights: Flight[],
  visits: CountryVisit[],
): WorldStats {
  const e = live(entries);
  const v = live(visits);
  const f = live(flights);

  const visitedISO3 = new Set<string>();
  for (const x of e) if (x.countryISO) visitedISO3.add(x.countryISO.toUpperCase());
  for (const x of v)
    if (x.countryISO && (x.status === "visited" || x.status === "lived"))
      visitedISO3.add(x.countryISO.toUpperCase());

  const visitedCountries: VisitedCountry[] = [...visitedISO3]
    .map((iso3) => {
      const row = countryByISO3(iso3);
      return { iso3, name: row?.name ?? iso3, continent: row?.continent ?? null };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const perContinent = new Map<Continent, number>();
  for (const c of visitedCountries) {
    if (!c.continent) continue;
    perContinent.set(c.continent, (perContinent.get(c.continent) ?? 0) + 1);
  }

  const regions: RegionStat[] = CONTINENTS.filter((c) => c !== "Antarctica").map((name) => {
    const visited = perContinent.get(name) ?? 0;
    const total = CONTINENT_TOTALS[name] ?? 0;
    return { name, visited, total, pct: total ? visited / total : 0 };
  });

  const totalMiles = f.reduce((sum, x) => sum + (x.distanceMiles || 0), 0);

  return {
    visitedISO3,
    visitedCountries,
    countryCount: visitedISO3.size,
    unMemberCount: UN_MEMBER_COUNT,
    percentOfWorld: (visitedISO3.size / UN_MEMBER_COUNT) * 100,
    continentCount: perContinent.size,
    continents: [...perContinent.keys()].sort(),
    regions,
    totalMiles,
    flightCount: f.length,
    timesAroundEarth: totalMiles / EARTH_CIRCUMFERENCE_MILES,
    cityCount: e.length,
  };
}
