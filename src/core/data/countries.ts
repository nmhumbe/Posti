/**
 * numeric ISO 3166-1 → alpha-3 + name + continent.
 *
 * PARTIAL TABLE — covers the well-travelled world plus every country referenced
 * by the prototype. The map renders off numeric ids directly, so a missing row
 * only means an "Unknown" continent/label for that country. Completing this to
 * all ~195 UN members is a Phase 2 data task (see PLAN.md §10).
 */

export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania"
  | "Antarctica";

export interface CountryRow {
  numeric: number;
  iso3: string;
  name: string;
  continent: Continent;
}

export const COUNTRIES: CountryRow[] = [
  { numeric: 4, iso3: "AFG", name: "Afghanistan", continent: "Asia" },
  { numeric: 8, iso3: "ALB", name: "Albania", continent: "Europe" },
  { numeric: 12, iso3: "DZA", name: "Algeria", continent: "Africa" },
  { numeric: 32, iso3: "ARG", name: "Argentina", continent: "South America" },
  { numeric: 36, iso3: "AUS", name: "Australia", continent: "Oceania" },
  { numeric: 40, iso3: "AUT", name: "Austria", continent: "Europe" },
  { numeric: 50, iso3: "BGD", name: "Bangladesh", continent: "Asia" },
  { numeric: 56, iso3: "BEL", name: "Belgium", continent: "Europe" },
  { numeric: 68, iso3: "BOL", name: "Bolivia", continent: "South America" },
  { numeric: 76, iso3: "BRA", name: "Brazil", continent: "South America" },
  { numeric: 100, iso3: "BGR", name: "Bulgaria", continent: "Europe" },
  { numeric: 116, iso3: "KHM", name: "Cambodia", continent: "Asia" },
  { numeric: 124, iso3: "CAN", name: "Canada", continent: "North America" },
  { numeric: 152, iso3: "CHL", name: "Chile", continent: "South America" },
  { numeric: 156, iso3: "CHN", name: "China", continent: "Asia" },
  { numeric: 170, iso3: "COL", name: "Colombia", continent: "South America" },
  { numeric: 188, iso3: "CRI", name: "Costa Rica", continent: "North America" },
  { numeric: 191, iso3: "HRV", name: "Croatia", continent: "Europe" },
  { numeric: 192, iso3: "CUB", name: "Cuba", continent: "North America" },
  { numeric: 196, iso3: "CYP", name: "Cyprus", continent: "Europe" },
  { numeric: 203, iso3: "CZE", name: "Czechia", continent: "Europe" },
  { numeric: 208, iso3: "DNK", name: "Denmark", continent: "Europe" },
  { numeric: 214, iso3: "DOM", name: "Dominican Republic", continent: "North America" },
  { numeric: 218, iso3: "ECU", name: "Ecuador", continent: "South America" },
  { numeric: 818, iso3: "EGY", name: "Egypt", continent: "Africa" },
  { numeric: 233, iso3: "EST", name: "Estonia", continent: "Europe" },
  { numeric: 246, iso3: "FIN", name: "Finland", continent: "Europe" },
  { numeric: 250, iso3: "FRA", name: "France", continent: "Europe" },
  { numeric: 268, iso3: "GEO", name: "Georgia", continent: "Asia" },
  { numeric: 276, iso3: "DEU", name: "Germany", continent: "Europe" },
  { numeric: 300, iso3: "GRC", name: "Greece", continent: "Europe" },
  { numeric: 320, iso3: "GTM", name: "Guatemala", continent: "North America" },
  { numeric: 348, iso3: "HUN", name: "Hungary", continent: "Europe" },
  { numeric: 352, iso3: "ISL", name: "Iceland", continent: "Europe" },
  { numeric: 356, iso3: "IND", name: "India", continent: "Asia" },
  { numeric: 360, iso3: "IDN", name: "Indonesia", continent: "Asia" },
  { numeric: 364, iso3: "IRN", name: "Iran", continent: "Asia" },
  { numeric: 372, iso3: "IRL", name: "Ireland", continent: "Europe" },
  { numeric: 376, iso3: "ISR", name: "Israel", continent: "Asia" },
  { numeric: 380, iso3: "ITA", name: "Italy", continent: "Europe" },
  { numeric: 388, iso3: "JAM", name: "Jamaica", continent: "North America" },
  { numeric: 392, iso3: "JPN", name: "Japan", continent: "Asia" },
  { numeric: 400, iso3: "JOR", name: "Jordan", continent: "Asia" },
  { numeric: 398, iso3: "KAZ", name: "Kazakhstan", continent: "Asia" },
  { numeric: 404, iso3: "KEN", name: "Kenya", continent: "Africa" },
  { numeric: 410, iso3: "KOR", name: "South Korea", continent: "Asia" },
  { numeric: 414, iso3: "KWT", name: "Kuwait", continent: "Asia" },
  { numeric: 418, iso3: "LAO", name: "Laos", continent: "Asia" },
  { numeric: 428, iso3: "LVA", name: "Latvia", continent: "Europe" },
  { numeric: 422, iso3: "LBN", name: "Lebanon", continent: "Asia" },
  { numeric: 440, iso3: "LTU", name: "Lithuania", continent: "Europe" },
  { numeric: 442, iso3: "LUX", name: "Luxembourg", continent: "Europe" },
  { numeric: 458, iso3: "MYS", name: "Malaysia", continent: "Asia" },
  { numeric: 470, iso3: "MLT", name: "Malta", continent: "Europe" },
  { numeric: 484, iso3: "MEX", name: "Mexico", continent: "North America" },
  { numeric: 504, iso3: "MAR", name: "Morocco", continent: "Africa" },
  { numeric: 524, iso3: "NPL", name: "Nepal", continent: "Asia" },
  { numeric: 528, iso3: "NLD", name: "Netherlands", continent: "Europe" },
  { numeric: 554, iso3: "NZL", name: "New Zealand", continent: "Oceania" },
  { numeric: 578, iso3: "NOR", name: "Norway", continent: "Europe" },
  { numeric: 512, iso3: "OMN", name: "Oman", continent: "Asia" },
  { numeric: 586, iso3: "PAK", name: "Pakistan", continent: "Asia" },
  { numeric: 591, iso3: "PAN", name: "Panama", continent: "North America" },
  { numeric: 604, iso3: "PER", name: "Peru", continent: "South America" },
  { numeric: 608, iso3: "PHL", name: "Philippines", continent: "Asia" },
  { numeric: 616, iso3: "POL", name: "Poland", continent: "Europe" },
  { numeric: 620, iso3: "PRT", name: "Portugal", continent: "Europe" },
  { numeric: 634, iso3: "QAT", name: "Qatar", continent: "Asia" },
  { numeric: 642, iso3: "ROU", name: "Romania", continent: "Europe" },
  { numeric: 643, iso3: "RUS", name: "Russia", continent: "Europe" },
  { numeric: 682, iso3: "SAU", name: "Saudi Arabia", continent: "Asia" },
  { numeric: 688, iso3: "SRB", name: "Serbia", continent: "Europe" },
  { numeric: 702, iso3: "SGP", name: "Singapore", continent: "Asia" },
  { numeric: 703, iso3: "SVK", name: "Slovakia", continent: "Europe" },
  { numeric: 705, iso3: "SVN", name: "Slovenia", continent: "Europe" },
  { numeric: 710, iso3: "ZAF", name: "South Africa", continent: "Africa" },
  { numeric: 724, iso3: "ESP", name: "Spain", continent: "Europe" },
  { numeric: 144, iso3: "LKA", name: "Sri Lanka", continent: "Asia" },
  { numeric: 752, iso3: "SWE", name: "Sweden", continent: "Europe" },
  { numeric: 756, iso3: "CHE", name: "Switzerland", continent: "Europe" },
  { numeric: 158, iso3: "TWN", name: "Taiwan", continent: "Asia" },
  { numeric: 764, iso3: "THA", name: "Thailand", continent: "Asia" },
  { numeric: 788, iso3: "TUN", name: "Tunisia", continent: "Africa" },
  { numeric: 792, iso3: "TUR", name: "Türkiye", continent: "Asia" },
  { numeric: 784, iso3: "ARE", name: "United Arab Emirates", continent: "Asia" },
  { numeric: 826, iso3: "GBR", name: "United Kingdom", continent: "Europe" },
  { numeric: 840, iso3: "USA", name: "United States", continent: "North America" },
  { numeric: 858, iso3: "URY", name: "Uruguay", continent: "South America" },
  { numeric: 704, iso3: "VNM", name: "Vietnam", continent: "Asia" },
];

export const UN_MEMBER_COUNT = 193;

const _byISO3 = new Map(COUNTRIES.map((c) => [c.iso3, c]));
const _byNumeric = new Map(COUNTRIES.map((c) => [String(c.numeric).padStart(3, "0"), c]));

export const countryByISO3 = (iso3: string): CountryRow | undefined =>
  _byISO3.get(iso3.toUpperCase());
export const countryByNumeric = (n: string | number): CountryRow | undefined =>
  _byNumeric.get(String(n).padStart(3, "0"));
