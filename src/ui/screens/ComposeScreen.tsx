import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPlaces, type PlaceResult } from "@core/services/geocode";
import { createEntry, addDayNote } from "@core/repo";
import { Field, TextInput, TextArea, Chip, PrimaryButton } from "@ui/components";

const MOODS = ["Sun-drunk", "Homesick", "Wired", "Slow day", "Lost"];

export function ComposeScreen() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [place, setPlace] = useState<PlaceResult | null>(null);

  const [arrival, setArrival] = useState<string>(todayISO());
  const [departure, setDeparture] = useState<string>("");
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // debounced geocode
  const acRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (place && query === place.label) return;
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;
      setSearching(true);
      try {
        setResults(await searchPlaces(q, ac.signal));
      } catch (e) {
        if ((e as Error).name !== "AbortError") console.warn(e);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [query, place]);

  async function save() {
    if (!place || saving) return;
    setSaving(true);
    const arrivalMs = dateToMs(arrival);
    const entry = await createEntry({
      cityName: place.cityName,
      countryISO: place.countryISO3,
      latitude: place.latitude,
      longitude: place.longitude,
      arrivalDate: arrivalMs,
      departureDate: dateToMs(departure),
      mood,
    });
    if (note.trim()) {
      await addDayNote(entry.id, {
        dayNumber: 1,
        title: "Day 1 · arrival",
        body: note.trim(),
        date: arrivalMs,
      });
    }
    navigate("/trips", {
      replace: true,
      state: { toast: `Entry saved · ${place.cityName}` },
    });
  }

  const mapNote = place
    ? place.countryISO3
      ? `Adds ${place.countryName || place.countryISO3} to your world`
      : `${place.countryName || "This country"} isn't in the map table yet — the entry still saves`
    : "Pick a place to light up the map";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bg)",
        overflowY: "auto",
        zIndex: 40,
        padding: "calc(var(--safe-top) + 20px) 20px calc(var(--safe-bottom) + 24px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ border: 0, background: "none", fontSize: 13, fontWeight: 600, color: "var(--color-neutral-700)" }}
        >
          Cancel
        </button>
        <div style={{ font: "400 17px var(--font-heading)" }}>New entry</div>
        <button
          onClick={save}
          disabled={!place || saving}
          style={{
            border: 0,
            background: "none",
            fontSize: 13,
            fontWeight: 700,
            color: place ? "var(--color-accent-700)" : "var(--color-neutral-400)",
          }}
        >
          Save
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Where were you?">
          <TextInput
            value={query}
            placeholder="Search a city"
            autoFocus
            onChange={(e) => {
              setQuery(e.target.value);
              setPlace(null);
            }}
          />
        </Field>

        {(searching || results.length > 0) && !place && (
          <div
            style={{
              background: "var(--color-neutral-100)",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {searching && results.length === 0 && (
              <div style={{ padding: "12px 15px", fontSize: 12.5, color: "var(--color-neutral-600)" }}>
                Searching…
              </div>
            )}
            {results.map((r, i) => (
              <button
                key={`${r.latitude},${r.longitude}`}
                onClick={() => {
                  setPlace(r);
                  setQuery(r.label);
                  setResults([]);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  border: 0,
                  background: "none",
                  padding: "11px 15px",
                  borderTop: i ? "1px solid var(--color-divider)" : "none",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.cityName}</div>
                <div style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>{r.label}</div>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Arrived">
            <TextInput type="date" value={arrival} onChange={(e) => setArrival(e.target.value)} />
          </Field>
          <Field label="Left">
            <TextInput type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} />
          </Field>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Mood</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {MOODS.map((m) => (
              <Chip key={m} label={m} selected={mood === m} onClick={() => setMood(mood === m ? null : m)} />
            ))}
          </div>
        </div>

        <Field label="Notes">
          <TextArea
            value={note}
            placeholder="What happened today?"
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--color-neutral-100)",
            borderRadius: 22,
            padding: "14px 16px",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{mapNote}</div>
        </div>

        <PrimaryButton onClick={save}>{saving ? "Saving…" : "Save entry"}</PrimaryButton>
      </div>
    </div>
  );
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function dateToMs(iso: string): number | null {
  if (!iso) return null;
  const ms = new Date(`${iso}T12:00:00`).getTime();
  return Number.isNaN(ms) ? null : ms;
}
