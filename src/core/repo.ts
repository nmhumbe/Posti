import { db } from "./db";
import { currentOwnerId, newId } from "./identity";
import type { JournalEntry, DayNote } from "./models";

/**
 * The single data-access layer. UI and screens call these — never Dexie
 * directly. When multi-user lands, a Supabase-backed implementation swaps in
 * behind the same signatures and a sync loop reconciles on `updatedAt`.
 *
 * Read helpers return Dexie promises so they compose with `useLiveQuery`.
 */

const notDeleted = <T extends { deletedAt?: number | null }>(x: T) => !x.deletedAt;

// ---- Journal entries ------------------------------------------------------

export function listEntries(): Promise<JournalEntry[]> {
  return db.entries
    .toArray()
    .then((xs) =>
      xs.filter(notDeleted).sort(
        (a, b) =>
          (b.arrivalDate ?? b.createdAt) - (a.arrivalDate ?? a.createdAt),
      ),
    );
}

export function getEntry(id: string): Promise<JournalEntry | undefined> {
  return db.entries.get(id);
}

export interface NewEntryInput {
  cityName: string;
  countryISO: string;
  latitude: number;
  longitude: number;
  arrivalDate?: number | null;
  departureDate?: number | null;
  mood?: string | null;
}

export async function createEntry(input: NewEntryInput): Promise<JournalEntry> {
  const now = Date.now();
  const count = await db.entries.count();
  const entry: JournalEntry = {
    id: newId(),
    ownerId: currentOwnerId(),
    cityName: input.cityName,
    countryISO: input.countryISO,
    latitude: input.latitude,
    longitude: input.longitude,
    arrivalDate: input.arrivalDate ?? null,
    departureDate: input.departureDate ?? null,
    mood: input.mood ?? null,
    orderIndex: count,
    createdAt: now,
    updatedAt: now,
  };
  await db.entries.put(entry);
  return entry;
}

export async function updateEntry(
  id: string,
  patch: Partial<JournalEntry>,
): Promise<void> {
  await db.entries.update(id, { ...patch, updatedAt: Date.now() });
}

/** Soft delete — keeps the row for a future sync to propagate the tombstone. */
export async function deleteEntry(id: string): Promise<void> {
  await db.entries.update(id, { deletedAt: Date.now(), updatedAt: Date.now() });
}

// ---- Day notes ----------------------------------------------------------

export function listDayNotes(entryId: string): Promise<DayNote[]> {
  return db.dayNotes
    .where("entryId")
    .equals(entryId)
    .toArray()
    .then((xs) => xs.filter(notDeleted).sort((a, b) => a.orderIndex - b.orderIndex));
}

export async function addDayNote(
  entryId: string,
  fields: { dayNumber: number; title: string; body: string; date?: number | null },
): Promise<DayNote> {
  const now = Date.now();
  const existing = await db.dayNotes.where("entryId").equals(entryId).count();
  const note: DayNote = {
    id: newId(),
    ownerId: currentOwnerId(),
    entryId,
    dayNumber: fields.dayNumber,
    title: fields.title,
    body: fields.body,
    date: fields.date ?? null,
    orderIndex: existing,
    createdAt: now,
    updatedAt: now,
  };
  await db.dayNotes.put(note);
  return note;
}
