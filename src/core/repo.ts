import { db, photoBlobs } from "./db";
import { currentOwnerId, newId } from "./identity";
import type { JournalEntry, DayNote, Photo, CountryVisit, VisitStatus } from "./models";
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

// ---- Country visits (manual overrides / wishlist / layover) ----------

export function listCountryVisits(): Promise<CountryVisit[]> {
  return db.countryVisits.toArray().then((xs) => xs.filter(notDeleted));
}

export function getCountryVisit(iso3: string): Promise<CountryVisit | undefined> {
  return db.countryVisits
    .where("countryISO")
    .equals(iso3.toUpperCase())
    .toArray()
    .then((xs) => xs.find(notDeleted));
}

/** Upsert the manual status for a country; `null` clears it (soft delete). */
export async function setCountryStatus(
  iso3: string,
  status: VisitStatus | null,
): Promise<void> {
  const iso = iso3.toUpperCase();
  const now = Date.now();
  const existing = await getCountryVisit(iso);
  if (!status) {
    if (existing) await db.countryVisits.update(existing.id, { deletedAt: now, updatedAt: now });
    return;
  }
  if (existing) {
    await db.countryVisits.update(existing.id, { status, updatedAt: now });
  } else {
    await db.countryVisits.put({
      id: newId(),
      ownerId: currentOwnerId(),
      countryISO: iso,
      status,
      firstVisitDate: status === "visited" ? now : null,
      createdAt: now,
      updatedAt: now,
    });
  }
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

/** Appends a blank note, numbered one past the current max day. */
export async function appendDayNote(entryId: string, title?: string): Promise<DayNote> {
  const notes = await listDayNotes(entryId);
  const nextDay = notes.reduce((m, n) => Math.max(m, n.dayNumber), 0) + 1;
  return addDayNote(entryId, {
    dayNumber: nextDay,
    title: title ?? `Day ${nextDay}`,
    body: "",
  });
}

export async function updateDayNote(id: string, patch: Partial<DayNote>): Promise<void> {
  await db.dayNotes.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteDayNote(id: string): Promise<void> {
  await db.dayNotes.update(id, { deletedAt: Date.now(), updatedAt: Date.now() });
}

/** Swaps orderIndex with the adjacent note in the given direction. */
export async function moveDayNote(
  entryId: string,
  id: string,
  dir: "up" | "down",
): Promise<void> {
  const notes = await listDayNotes(entryId);
  const i = notes.findIndex((n) => n.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= notes.length) return;
  const now = Date.now();
  await db.dayNotes.update(notes[i].id, { orderIndex: j, updatedAt: now });
  await db.dayNotes.update(notes[j].id, { orderIndex: i, updatedAt: now });
}
