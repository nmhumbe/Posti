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

/**
 * Client-generated id (keeps offline creation + future sync trivial).
 *
 * `crypto.randomUUID` only exists in a secure context, so it's missing when the
 * app is opened over plain http on a phone via the LAN address. Fall back to a
 * v4 UUID built from `getRandomValues` (available in insecure contexts), then to
 * a last-ditch time+random string.
 */
export function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  if (c && typeof c.getRandomValues === "function") {
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
