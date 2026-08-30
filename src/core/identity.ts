/**
 * Ownership seam for the future multi-user backend.
 *
 * Every user-owned record stores an `ownerId`. Today there is exactly one local
 * user, so `ownerId` is this constant. When auth (Supabase) lands, `current()`
 * returns the signed-in user's id and existing rows are migrated once.
 */
export const LOCAL_OWNER_ID = "local-owner";

export function currentOwnerId(): string {
  return LOCAL_OWNER_ID;
}

export function newId(): string {
  // client-generated ids keep offline creation + future sync trivial
  return crypto.randomUUID();
}
