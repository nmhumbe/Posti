import Dexie, { type EntityTable } from "dexie";
import type {
  Trip,
  JournalEntry,
  Photo,
  DayNote,
  Flight,
  CountryVisit,
  Profile,
} from "./models";
import { LOCAL_OWNER_ID } from "./identity";

/**
 * Local-first store (IndexedDB via Dexie). This is the equivalent of the
 * SwiftData+CloudKit plan for the web build: works fully offline, no account.
 *
 * Multi-user later = add a Supabase adapter behind the same repo functions
 * (src/core/repo.ts) and a sync loop keyed on `updatedAt`. The schema here
 * already carries `ownerId` + timestamps + soft delete for that.
 */
export class JournalDB extends Dexie {
  trips!: EntityTable<Trip, "id">;
  entries!: EntityTable<JournalEntry, "id">;
  photos!: EntityTable<Photo, "id">;
  dayNotes!: EntityTable<DayNote, "id">;
  flights!: EntityTable<Flight, "id">;
  countryVisits!: EntityTable<CountryVisit, "id">;
  profiles!: EntityTable<Profile, "id">;

  constructor() {
    super("travel-journal");
    this.version(1).stores({
      trips: "id, ownerId, startDate, updatedAt",
      entries: "id, ownerId, tripId, countryISO, orderIndex, updatedAt",
      photos: "id, ownerId, entryId, orderIndex, updatedAt",
      dayNotes: "id, ownerId, entryId, dayNumber, orderIndex, updatedAt",
      flights: "id, ownerId, tripId, date, updatedAt",
      countryVisits: "id, ownerId, countryISO, status, updatedAt",
      profiles: "id",
      // image bytes kept out of the rows; rows store the key only
      photoBlobs: "key",
    });
  }
}

export const db = new JournalDB();

/** Blobs live in their own store, keyed by string; Photo rows hold the key. */
export const photoBlobs = {
  async put(key: string, blob: Blob): Promise<void> {
    await db.table("photoBlobs").put({ key, blob });
  },
  async get(key: string): Promise<Blob | undefined> {
    const row = await db.table("photoBlobs").get(key);
    return row?.blob as Blob | undefined;
  },
};

/** Ensure the single local Profile row exists. Called once on boot. */
export async function seedProfile(): Promise<void> {
  const existing = await db.profiles.get(LOCAL_OWNER_ID);
  if (existing) return;
  const now = Date.now();
  await db.profiles.put({
    id: LOCAL_OWNER_ID,
    displayName: "Me",
    joinedAt: now,
    mapFill: "terracotta",
    milesGoal: 100_000,
    journalPrivacy: "onlyMe",
    createdAt: now,
    updatedAt: now,
  });
}
