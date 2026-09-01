/**
 * ISO 3166-1: numeric ↔ alpha-2 ↔ alpha-3 + name + continent.
 *
 * PARTIAL TABLE — covers the well-travelled world plus every country referenced
 * by the prototype. The map renders off numeric ids directly, so a missing row
 * only means an "Unknown" continent/label for that country. Completing this to
 * all ~195 UN members + territories is a Phase 2 data task (see PLAN.md §10).
 *
 * `iso2` is what the Nominatim geocoder returns (`address.country_code`); the
 * rest of the app stores `iso3` on entries.
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
  iso2: string;
  iso3: string;
  name: string;
  continent: Continent;
}

export const COUNTRIES: CountryRow[] = [
  { numeric: 4, iso2: "AF", iso3: "AFG", name: "Afghanistan", continent: "Asia" },
  { numeric: 8, iso2: "AL", iso3: "ALB", name: "Albania", continent: "Europe" },
  { numeric: 12, iso2: "DZ", iso3: "DZA", name: "Algeria", continent: "Africa" },
  { numeric: 32, iso2: "AR", iso3: "ARG", name: "Argentina", continent: "South America" },
  { numeric: 36, iso2: "AU", iso3: "AUS", name: "Australia", continent: "Oceania" },
  { numeric: 40, iso2: "AT", iso3: "AUT", name: "Austria", continent: "Europe" },
  { numeric: 50, iso2: "BD", iso3: "BGD", name: "Bangladesh", continent: "Asia" },
  { numeric: 56, iso2: "BE", iso3: "BEL", name: "Belgium", continent: "Europe" },
  { numeric: 68, iso2: "BO", iso3: "BOL", name: "Bolivia", continent: "South America" },
  { numeric: 76, iso2: "BR", iso3: "BRA", name: "Brazil", continent: "South America" },
  { numeric: 100, iso2: "BG", iso3: "BGR", name: "Bulgaria", continent: "Europe" },
  { numeric: 116, iso2: "KH", iso3: "KHM", name: "Cambodia", continent: "Asia" },
  { numeric: 124, iso2: "CA", iso3: "CAN", name: "Canada", continent: "North America" },
  { numeric: 152, iso2: "CL", iso3: "CHL", name: "Chile", continent: "South America" },
  { numeric: 156, iso2: "CN", iso3: "CHN", name: "China", continent: "Asia" },
  { numeric: 170, iso2: "CO", iso3: "COL", name: "Colombia", continent: "South America" },
  { numeric: 188, iso2: "CR", iso3: "CRI", name: "Costa Rica", continent: "North America" },
  { numeric: 191, iso2: "HR", iso3: "HRV", name: "Croatia", continent: "Europe" },
  { numeric: 192, iso2: "CU", iso3: "CUB", name: "Cuba", continent: "North America" },
  { numeric: 196, iso2: "CY", iso3: "CYP", name: "Cyprus", continent: "Europe" },
  { numeric: 203, iso2: "CZ", iso3: "CZE", name: "Czechia", continent: "Europe" },
  { numeric: 208, iso2: "DK", iso3: "DNK", name: "Denmark", continent: "Europe" },
  { numeric: 214, iso2: "DO", iso3: "DOM", name: "Dominican Republic", continent: "North America" },
  { numeric: 218, iso2: "EC", iso3: "ECU", name: "Ecuador", continent: "South America" },
  { numeric: 818, iso2: "EG", iso3: "EGY", name: "Egypt", continent: "Africa" },
  { numeric: 233, iso2: "EE", iso3: "EST", name: "Estonia", continent: "Europe" },
  { numeric: 246, iso2: "FI", iso3: "FIN", name: "Finland", continent: "Europe" },
  { numeric: 250, iso2: "FR", iso3: "FRA", name: "France", continent: "Europe" },
  { numeric: 268, iso2: "GE", iso3: "GEO", name: "Georgia", continent: "Asia" },
  { numeric: 276, iso2: "DE", iso3: "DEU", name: "Germany", continent: "Europe" },
  { numeric: 300, iso2: "GR", iso3: "GRC", name: "Greece", continent: "Europe" },
  { numeric: 320, iso2: "GT", iso3: "GTM", name: "Guatemala", continent: "North America" },
  { numeric: 348, iso2: "HU", iso3: "HUN", name: "Hungary", continent: "Europe" },
  { numeric: 352, iso2: "IS", iso3: "ISL", name: "Iceland", continent: "Europe" },
  { numeric: 356, iso2: "IN", iso3: "IND", name: "India", continent: "Asia" },
  { numeric: 360, iso2: "ID", iso3: "IDN", name: "Indonesia", continent: "Asia" },
  { numeric: 364, iso2: "IR", iso3: "IRN", name: "Iran", continent: "Asia" },
  { numeric: 372, iso2: "IE", iso3: "IRL", name: "Ireland", continent: "Europe" },
  { numeric: 376, iso2: "IL", iso3: "ISR", name: "Israel", continent: "Asia" },
  { numeric: 380, iso2: "IT", iso3: "ITA", name: "Italy", continent: "Europe" },
  { numeric: 388, iso2: "JM", iso3: "JAM", name: "Jamaica", continent: "North America" },
  { numeric: 392, iso2: "JP", iso3: "JPN", name: "Japan", continent: "Asia" },
  { numeric: 400, iso2: "JO", iso3: "JOR", name: "Jordan", continent: "Asia" },
  { numeric: 398, iso2: "KZ", iso3: "KAZ", name: "Kazakhstan", continent: "Asia" },
  { numeric: 404, iso2: "KE", iso3: "KEN", name: "Kenya", continent: "Africa" },
  { numeric: 410, iso2: "KR", iso3: "KOR", name: "South Korea", continent: "Asia" },
  { numeric: 414, iso2: "KW", iso3: "KWT", name: "Kuwait", continent: "Asia" },
  { numeric: 418, iso2: "LA", iso3: "LAO", name: "Laos", continent: "Asia" },
  { numeric: 428, iso2: "LV", iso3: "LVA", name: "Latvia", continent: "Europe" },
  { numeric: 422, iso2: "LB", iso3: "LBN", name: "Lebanon", continent: "Asia" },
  { numeric: 440, iso2: "LT", iso3: "LTU", name: "Lithuania", continent: "Europe" },
  { numeric: 442, iso2: "LU", iso3: "LUX", name: "Luxembourg", continent: "Europe" },
  { numeric: 458, iso2: "MY", iso3: "MYS", name: "Malaysia", continent: "Asia" },
  { numeric: 470, iso2: "MT", iso3: "MLT", name: "Malta", continent: "Europe" },
  { numeric: 484, iso2: "MX", iso3: "MEX", name: "Mexico", continent: "North America" },
  { numeric: 504, iso2: "MA", iso3: "MAR", name: "Morocco", continent: "Africa" },
  { numeric: 524, iso2: "NP", iso3: "NPL", name: "Nepal", continent: "Asia" },
  { numeric: 528, iso2: "NL", iso3: "NLD", name: "Netherlands", continent: "Europe" },
  { numeric: 554, iso2: "NZ", iso3: "NZL", name: "New Zealand", continent: "Oceania" },
  { numeric: 578, iso2: "NO", iso3: "NOR", name: "Norway", continent: "Europe" },
  { numeric: 512, iso2: "OM", iso3: "OMN", name: "Oman", continent: "Asia" },
  { numeric: 586, iso2: "PK", iso3: "PAK", name: "Pakistan", continent: "Asia" },
  { numeric: 591, iso2: "PA", iso3: "PAN", name: "Panama", continent: "North America" },
  { numeric: 604, iso2: "PE", iso3: "PER", name: "Peru", continent: "South America" },
  { numeric: 608, iso2: "PH", iso3: "PHL", name: "Philippines", continent: "Asia" },
  { numeric: 616, iso2: "PL", iso3: "POL", name: "Poland", continent: "Europe" },
  { numeric: 620, iso2: "PT", iso3: "PRT", name: "Portugal", continent: "Europe" },
  { numeric: 634, iso2: "QA", iso3: "QAT", name: "Qatar", continent: "Asia" },
  { numeric: 642, iso2: "RO", iso3: "ROU", name: "Romania", continent: "Europe" },
  { numeric: 643, iso2: "RU", iso3: "RUS", name: "Russia", continent: "Europe" },
  { numeric: 682, iso2: "SA", iso3: "SAU", name: "Saudi Arabia", continent: "Asia" },
  { numeric: 688, iso2: "RS", iso3: "SRB", name: "Serbia", continent: "Europe" },
  { numeric: 702, iso2: "SG", iso3: "SGP", name: "Singapore", continent: "Asia" },
  { numeric: 703, iso2: "SK", iso3: "SVK", name: "Slovakia", continent: "Europe" },
  { numeric: 705, iso2: "SI", iso3: "SVN", name: "Slovenia", continent: "Europe" },
  { numeric: 710, iso2: "ZA", iso3: "ZAF", name: "South Africa", continent: "Africa" },
  { numeric: 724, iso2: "ES", iso3: "ESP", name: "Spain", continent: "Europe" },
  { numeric: 144, iso2: "LK", iso3: "LKA", name: "Sri Lanka", continent: "Asia" },
  { numeric: 752, iso2: "SE", iso3: "SWE", name: "Sweden", continent: "Europe" },
  { numeric: 756, iso2: "CH", iso3: "CHE", name: "Switzerland", continent: "Europe" },
  { numeric: 158, iso2: "TW", iso3: "TWN", name: "Taiwan", continent: "Asia" },
  { numeric: 764, iso2: "TH", iso3: "THA", name: "Thailand", continent: "Asia" },
  { numeric: 788, iso2: "TN", iso3: "TUN", name: "Tunisia", continent: "Africa" },
  { numeric: 792, iso2: "TR", iso3: "TUR", name: "Türkiye", continent: "Asia" },
  { numeric: 784, iso2: "AE", iso3: "ARE", name: "United Arab Emirates", continent: "Asia" },
  { numeric: 826, iso2: "GB", iso3: "GBR", name: "United Kingdom", continent: "Europe" },
  { numeric: 840, iso2: "US", iso3: "USA", name: "United States", continent: "North America" },
  { numeric: 858, iso2: "UY", iso3: "URY", name: "Uruguay", continent: "South America" },
  { numeric: 704, iso2: "VN", iso3: "VNM", name: "Vietnam", continent: "Asia" },
];

export const UN_MEMBER_COUNT = 193;

const _byISO3 = new Map(COUNTRIES.map((c) => [c.iso3, c]));
const _byISO2 = new Map(COUNTRIES.map((c) => [c.iso2, c]));
const _byNumeric = new Map(COUNTRIES.map((c) => [String(c.numeric).padStart(3, "0"), c]));

export const countryByISO3 = (iso3: string): CountryRow | undefined =>
  _byISO3.get(iso3.toUpperCase());
export const countryByISO2 = (iso2: string): CountryRow | undefined =>
  _byISO2.get(iso2.toUpperCase());
export const countryByNumeric = (n: string | number): CountryRow | undefined =>
  _byNumeric.get(String(n).padStart(3, "0"));
