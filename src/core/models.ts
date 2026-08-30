/**
 * Domain model — plain TypeScript, no framework imports. This file ports to a
 * future Expo / React Native app unchanged.
 *
 * Sync-friendly shape on every user-owned record:
 *   - client-generated string `id`
 *   - `ownerId` (one local user today; `auth.uid()` later)
 *   - `createdAt` / `updatedAt` epoch millis, `deletedAt` for soft delete
 * Cross-record links are ids, not nested objects.
 */

export interface Owned {
  id: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

/** Optional grouping over entries — usually one real journey. */
export interface Trip extends Owned {
  title: string;
  startDate?: number | null;
  endDate?: number | null;
  notes?: string | null;
  coverPhotoId?: string | null;
}

/** One city visit — the unit the Trips tab is built around. */
export interface JournalEntry extends Owned {
  tripId?: string | null;
  cityName: string;
  countryISO: string; // ISO 3166-1 alpha-3, e.g. "FRA"
  latitude: number;
  longitude: number;
  arrivalDate?: number | null;
  departureDate?: number | null;
  coverPhotoId?: string | null;
  orderIndex: number;
}

export interface Photo extends Owned {
  entryId?: string | null;
  /** object-store key for the blob (see photoStore); or a remote URL later */
  blobKey: string;
  caption?: string | null;
  placeLabel?: string | null;
  takenAt?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  orderIndex: number;
}

export interface DayNote extends Owned {
  entryId?: string | null;
  dayNumber: number;
  title: string; // "Day 1 · arrival"
  body: string; // plain text / light markdown
  date?: number | null;
  orderIndex: number;
}

export interface Flight extends Owned {
  tripId?: string | null;
  originIATA: string;
  destIATA: string;
  date?: number | null;
  airline?: string | null;
  flightNumber?: string | null;
  distanceMiles: number; // cached great-circle result
}

export type VisitStatus = "visited" | "lived" | "layover" | "wishlist";

/**
 * The map fill set is *derived* from entries + flights. `CountryVisit` rows
 * exist only for what can't be derived: manual overrides, wishlist/layover
 * marks, per-country metadata.
 */
export interface CountryVisit extends Owned {
  countryISO: string;
  status: VisitStatus;
  firstVisitDate?: number | null;
  note?: string | null;
}

export type MapFill = "terracotta" | "sage" | "rust" | "clay";
export type JournalPrivacy = "onlyMe" | "sharedLink";

/** Exactly one row today; the seam where multi-user auth plugs in. */
export interface Profile {
  id: string; // === ownerId
  displayName: string;
  homeCityName?: string | null;
  homeAirportIATA?: string | null;
  joinedAt: number;
  mapFill: MapFill;
  milesGoal: number;
  journalPrivacy: JournalPrivacy;
  createdAt: number;
  updatedAt: number;
}

export const MAP_FILL_HEX: Record<MapFill, string> = {
  terracotta: "#c67139",
  sage: "#7a8a5e",
  rust: "#8c491a",
  clay: "#b2622d",
};
