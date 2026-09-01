import { useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@core/db";
import {
  listPhotos,
  listDayNotes,
  addPhoto,
  updatePhoto,
  deletePhoto,
  setEntryCover,
} from "@core/repo";
import type { Photo } from "@core/models";
import { useBlobUrl } from "@ui/hooks";
import { SegmentedToggle, RoundButton, ComingSoon } from "@ui/components";

const TABS = ["Photos", "Notes"] as const;

export function EntryScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Photos");
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const entry = useLiveQuery(() => db.entries.get(id), [id]);
  const photos = useLiveQuery(() => listPhotos(id), [id], []);
  const notes = useLiveQuery(() => listDayNotes(id), [id], []);
  const coverUrl = useBlobUrl(
    photos.find((p) => p.id === entry?.coverPhotoId)?.blobKey ?? photos[0]?.blobKey,
  );

  if (entry === undefined) return null; // loading
  if (entry === null) {
    navigate("/trips", { replace: true });
    return null;
  }

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(list)) await addPhoto(id, file);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bg)",
        overflowY: "auto",
        zIndex: 40,
      }}
    >
      {/* hero */}
      <div style={{ position: "relative", height: 240 }}>
        <div
          className="washed"
          style={{
            position: "absolute",
            inset: 0,
            background: coverUrl
              ? `center/cover no-repeat url(${coverUrl})`
              : "linear-gradient(135deg, var(--color-accent-300), var(--color-accent-2-300))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(32,30,29,.42) 0%, rgba(32,30,29,0) 45%, rgba(32,30,29,.55) 100%)",
          }}
        />
        <div style={{ position: "absolute", top: "calc(var(--safe-top) + 14px)", left: 16 }}>
          <RoundButton dark onClick={() => navigate(-1)}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </RoundButton>
        </div>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 16 }}>
          <div className="kicker" style={{ color: "var(--color-accent-200)" }}>
            {entry.countryISO || "??"} · {fmtRange(entry.arrivalDate, entry.departureDate)}
          </div>
          <h2 style={{ color: "var(--color-bg)", marginTop: 5, fontSize: 34 }}>{entry.cityName}</h2>
        </div>
      </div>

      <div style={{ padding: "16px 20px calc(var(--safe-bottom) + 28px)" }}>
        <SegmentedToggle options={TABS} value={tab} onChange={setTab} />

        {tab === "Photos" ? (
          <div style={{ marginTop: 16 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => onFiles(e.target.files)}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {photos.map((p) => (
                <PhotoCell
                  key={p.id}
                  photo={p}
                  isCover={entry.coverPhotoId === p.id}
                  onOpen={() => setLightbox(p)}
                  onCaption={(caption) => updatePhoto(p.id, { caption })}
                  onCover={() => setEntryCover(id, p.id)}
                  onDelete={() => deletePhoto(p.id)}
                />
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                style={{
                  height: 126,
                  borderRadius: 18,
                  border: "2.5px dashed var(--color-neutral-400)",
                  background: "transparent",
                  color: "var(--color-neutral-600)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 20 }}>+</span>
                {busy ? "Adding…" : "Add photos"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {notes.map((n) => (
              <div
                key={n.id}
                style={{
                  background: "var(--color-neutral-100)",
                  borderRadius: 22,
                  padding: "15px 16px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="kicker" style={{ color: "var(--color-neutral-600)", marginBottom: 7 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n.body}</div>
              </div>
            ))}
            <ComingSoon note="Add / edit / reorder day notes lands in Slice 3. Notes created from the New-entry sheet show here now." />
          </div>
        )}
      </div>

      {lightbox && (
        <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

function PhotoCell({
  photo,
  isCover,
  onOpen,
  onCaption,
  onCover,
  onDelete,
}: {
  photo: Photo;
  isCover: boolean;
  onOpen: () => void;
  onCaption: (v: string) => void;
  onCover: () => void;
  onDelete: () => void;
}) {
  const url = useBlobUrl(photo.blobKey);
  const [caption, setCaption] = useState(photo.caption ?? "");

  return (
    <div>
      <div style={{ position: "relative" }}>
        <div
          className="washed"
          onClick={onOpen}
          style={{
            height: 126,
            borderRadius: 18,
            background: url ? `center/cover no-repeat url(${url})` : "var(--color-neutral-200)",
          }}
        />
        <button
          onClick={onCover}
          title={isCover ? "Cover photo" : "Set as cover"}
          style={roundBadge(6, 6)}
        >
          {isCover ? "★" : "☆"}
        </button>
        <button onClick={onDelete} title="Delete" style={roundBadge(6, undefined, 6)}>
          ×
        </button>
      </div>
      <input
        value={caption}
        placeholder="Add a caption"
        onChange={(e) => setCaption(e.target.value)}
        onBlur={() => caption !== (photo.caption ?? "") && onCaption(caption)}
        style={{
          width: "100%",
          border: 0,
          background: "transparent",
          fontSize: 11.5,
          fontWeight: 600,
          marginTop: 6,
          outline: "none",
        }}
      />
    </div>
  );
}

function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  const url = useBlobUrl(photo.blobKey);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-neutral-900)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, background: url ? `center/contain no-repeat url(${url})` : "none" }} />
      {photo.caption && (
        <div
          style={{
            padding: "16px 20px calc(var(--safe-bottom) + 20px)",
            color: "var(--color-bg)",
            fontSize: 14,
          }}
        >
          {photo.caption}
        </div>
      )}
    </div>
  );
}

function roundBadge(top: number, left?: number, right?: number): CSSProperties {
  return {
    position: "absolute",
    top,
    left,
    right,
    width: 24,
    height: 24,
    borderRadius: 999,
    border: 0,
    background: "rgba(245,234,216,.92)",
    color: "var(--color-text)",
    fontSize: 13,
    lineHeight: "24px",
    padding: 0,
  };
}

function fmtRange(a?: number | null, b?: number | null): string {
  if (!a) return "";
  const f = (t: number) =>
    new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return b ? `${f(a)} – ${f(b)}` : f(a);
}
