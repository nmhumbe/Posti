import { db, photoBlobs } from "./db";
import { currentOwnerId, newId } from "./identity";
import type { JournalEntry, DayNote, Photo } from "./models";
import { downscaleImage } from "./services/image";

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

// ---- Photos -----------------------------------------------------------

export function listPhotos(entryId: string): Promise<Photo[]> {
  return db.photos
    .where("entryId")
    .equals(entryId)
    .toArray()
    .then((xs) => xs.filter(notDeleted).sort((a, b) => a.orderIndex - b.orderIndex));
}

/** Downscales, stores the blob, writes the row. Returns the new Photo. */
export async function addPhoto(
  entryId: string,
  file: File | Blob,
  fields: { caption?: string; placeLabel?: string; takenAt?: number | null } = {},
): Promise<Photo> {
  const now = Date.now();
  const blob = await downscaleImage(file);
  const blobKey = newId();
  await photoBlobs.put(blobKey, blob);

  const count = await db.photos.where("entryId").equals(entryId).count();
  const photo: Photo = {
    id: newId(),
    ownerId: currentOwnerId(),
    entryId,
    blobKey,
    caption: fields.caption ?? null,
    placeLabel: fields.placeLabel ?? null,
    takenAt: fields.takenAt ?? (file instanceof File ? file.lastModified : null),
    orderIndex: count,
    createdAt: now,
    updatedAt: now,
  };
  await db.photos.put(photo);

  // first photo becomes the entry cover
  const entry = await db.entries.get(entryId);
  if (entry && !entry.coverPhotoId) {
    await db.entries.update(entryId, { coverPhotoId: photo.id, updatedAt: now });
  }
  return photo;
}

export async function updatePhoto(id: string, patch: Partial<Photo>): Promise<void> {
  await db.photos.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deletePhoto(id: string): Promise<void> {
  const photo = await db.photos.get(id);
  await db.photos.update(id, { deletedAt: Date.now(), updatedAt: Date.now() });
  if (photo?.entryId) {
    const entry = await db.entries.get(photo.entryId);
    if (entry?.coverPhotoId === id) {
      const next = (await listPhotos(photo.entryId)).find((p) => p.id !== id);
      await db.entries.update(photo.entryId, {
        coverPhotoId: next?.id ?? null,
        updatedAt: Date.now(),
      });
    }
  }
}

export async function setEntryCover(entryId: string, photoId: string): Promise<void> {
  await db.entries.update(entryId, { coverPhotoId: photoId, updatedAt: Date.now() });
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
