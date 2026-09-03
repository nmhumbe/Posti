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
  appendDayNote,
  updateDayNote,
  deleteDayNote,
  moveDayNote,
} from "@core/repo";
import type { Photo, DayNote } from "@core/models";
import { useBlobUrl } from "@ui/hooks";
import { SegmentedToggle, RoundButton } from "@ui/components";

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
            {notes.map((n, i) => (
              <NoteCard
                key={n.id}
                note={n}
                first={i === 0}
                last={i === notes.length - 1}
                onChange={(patch) => updateDayNote(n.id, patch)}
                onMove={(dir) => moveDayNote(id, n.id, dir)}
                onDelete={() => deleteDayNote(n.id)}
              />
            ))}
            {notes.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>
                No notes yet. Add one per day — "Day 1 · arrival", then what happened.
              </div>
            )}
            <button
              onClick={() => appendDayNote(id)}
              style={{
                alignSelf: "flex-start",
                border: "2.5px dashed var(--color-neutral-400)",
                background: "transparent",
                color: "var(--color-neutral-600)",
                borderRadius: 999,
                padding: "9px 16px",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              + Add note
            </button>
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

function NoteCard({
  note,
  first,
  last,
  onChange,
  onMove,
  onDelete,
}: {
  note: DayNote;
  first: boolean;
  last: boolean;
  onChange: (patch: Partial<DayNote>) => void;
  onMove: (dir: "up" | "down") => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);

  return (
    <div
      style={{
        background: "var(--color-neutral-100)",
        borderRadius: 22,
        padding: "13px 15px 15px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{ width: 8, height: 8, borderRadius: 999, background: "var(--color-accent-2)", flex: "none" }}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== note.title && onChange({ title })}
          placeholder="Day 1 · arrival"
          className="kicker"
          style={{
            flex: 1,
            border: 0,
            background: "transparent",
            color: "var(--color-neutral-600)",
            outline: "none",
          }}
        />
        <button onClick={() => onMove("up")} disabled={first} style={noteIconBtn(first)}>↑</button>
        <button onClick={() => onMove("down")} disabled={last} style={noteIconBtn(last)}>↓</button>
        <button onClick={onDelete} style={noteIconBtn(false)}>×</button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onBlur={() => body !== note.body && onChange({ body })}
        placeholder="What happened?"
        rows={Math.max(3, body.split("\n").length + 1)}
        style={{
          width: "100%",
          marginTop: 8,
          border: 0,
          background: "transparent",
          resize: "none",
          outline: "none",
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}

function noteIconBtn(disabled: boolean): CSSProperties {
  return {
    width: 24,
    height: 24,
    borderRadius: 999,
    border: 0,
    background: "var(--color-neutral-200)",
    color: "var(--color-neutral-700)",
    fontSize: 13,
    lineHeight: "24px",
    padding: 0,
    opacity: disabled ? 0.35 : 1,
  };
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
