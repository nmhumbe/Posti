import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import {
  countryByISO3,
  countryByNumeric,
  type CountryRow,
} from "../data/countries";

/**
 * World geometry, mirroring the prototype's approach exactly:
 * world-atlas `countries-110m` TopoJSON → GeoJSON features, projected with
 * d3 `geoNaturalEarth1`. Country ids are numeric ISO 3166 (e.g. 250 = France).
 */
export type WorldFeature = GeoJSON.Feature<Geometry, { name?: string }> & {
  id: string;
};

let cache: WorldFeature[] | null = null;

export async function loadWorldFeatures(): Promise<WorldFeature[]> {
  if (cache) return cache;
  const topo = (await import("world-atlas/countries-110m.json")).default as any;
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection;
  cache = (fc.features as WorldFeature[]).filter((f) => String(f.id) !== "010"); // drop Antarctica
  return cache;
}

export function makeProjectedPath(features: WorldFeature[], width: number, height: number) {
  const projection = geoNaturalEarth1().fitSize(
    [width, height],
    { type: "FeatureCollection", features } as GeoPermissibleObjects as any,
  );
  const path = geoPath(projection);
  return { projection, path };
}

// ---- numeric ISO → metadata -------------------------------------------------
// The country table (src/core/data/countries.ts) is partial. The map renders off
// numeric ids alone, so partial data only softens continent counts / labels.

export type { CountryRow };
export { countryByISO3, countryByNumeric };

export function isoA3ForNumeric(numeric: string | number): string | undefined {
  return countryByNumeric(numeric)?.iso3;
}
export function numericForISO3(iso3: string): string | undefined {
  const n = countryByISO3(iso3)?.numeric;
  return n === undefined ? undefined : String(n).padStart(3, "0");
}
