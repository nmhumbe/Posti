// Regenerates src/core/data/airports.json from OpenFlights' airports.dat
// (public domain / ODbL, https://openflights.org/data.html) plus world-countries
// for name -> ISO3 resolution. Run: npm run gen:airports
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const SOURCE_URL =
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";
const cacheDir = fileURLToPath(new URL("./.cache", import.meta.url));
const cachePath = `${cacheDir}/airports.dat`;

mkdirSync(cacheDir, { recursive: true });

let raw;
if (existsSync(cachePath)) {
  raw = readFileSync(cachePath, "utf8");
  console.log("Using cached airports.dat");
} else {
  console.log("Fetching", SOURCE_URL);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  raw = await res.text();
  writeFileSync(cachePath, raw);
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

// ---- country name -> ISO3, built from world-countries (common/official/altSpellings) ----
const countriesData = require("world-countries/countries.json");
const nameToISO3 = new Map();
for (const c of countriesData) {
  const names = [c.name.common, c.name.official, ...(c.altSpellings ?? [])];
  for (const n of names) nameToISO3.set(n.toLowerCase(), c.cca3);
}
// OpenFlights quirks not covered by altSpellings
const OVERRIDES = {
  "congo (kinshasa)": "COD",
  "congo (brazzaville)": "COG",
  "cote d'ivoire": "CIV",
  "ivory coast": "CIV",
  "myanmar": "MMR",
  "burma": "MMR",
  "south korea": "KOR",
  "north korea": "PRK",
  "macau": "MAC",
  "hong kong": "HKG",
  "reunion": "REU",
  "east timor": "TLS",
  "swaziland": "SWZ",
  "czech republic": "CZE",
  "virgin islands": "VIR",
  "netherlands antilles": "BES",
  "saint martin": "MAF",
  "vatican city": "VAT",
  "turkey": "TUR",
  "midway islands": "USA",
  "johnston atoll": "USA",
  "wake island": "USA",
};
for (const [k, v] of Object.entries(OVERRIDES)) nameToISO3.set(k, v);

function iso3For(countryName) {
  return nameToISO3.get(countryName.trim().toLowerCase()) ?? "";
}

const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
const rows = [];
let unresolved = 0;
const unresolvedNames = new Set();

for (const line of lines) {
  const f = parseCsvLine(line);
  const [, name, city, country, iata, , latStr, lonStr] = f;
  if (!/^[A-Z]{3}$/.test(iata)) continue;
  const lat = Number(latStr);
  const lon = Number(lonStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const iso3 = iso3For(country);
  if (!iso3) {
    unresolved++;
    unresolvedNames.add(country);
  }
  rows.push([iata, name, city, iso3, Math.round(lat * 1000) / 1000, Math.round(lon * 1000) / 1000]);
}

// dedupe by IATA (keep first / largest-looking match — OpenFlights is ~unique already)
const seen = new Set();
const deduped = rows.filter((r) => (seen.has(r[0]) ? false : (seen.add(r[0]), true)));

const target = fileURLToPath(new URL("../src/core/data/airports.json", import.meta.url));
writeFileSync(target, JSON.stringify(deduped));

console.log(`Wrote ${deduped.length} airports to ${target}`);
console.log(
  `${unresolved} rows had an unresolved country (${unresolvedNames.size} distinct names)`,
);
if (unresolvedNames.size) {
  console.log("Unresolved:", [...unresolvedNames].slice(0, 20).join(", "));
}
