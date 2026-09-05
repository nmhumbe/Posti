import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@core/db";
import { useLiveQuery } from "dexie-react-hooks";
import { searchAirports, airportByIATA, type Airport } from "@core/services/airports";
import { haversineMiles } from "@core/services/distance";
import { createFlight } from "@core/repo";
import { Field, TextInput, PrimaryButton } from "@ui/components";

export function AddFlightScreen() {
  const navigate = useNavigate();
  const profile = useLiveQuery(() => db.profiles.toArray(), [], []);

  const [origin, setOrigin] = useState<Airport | null>(null);
  const [dest, setDest] = useState<Airport | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [saving, setSaving] = useState(false);

  // prefill origin from the home-airport setting, once
  const prefilled = useRef(false);
  useEffect(() => {
    const home = profile[0]?.homeAirportIATA;
    if (!home || prefilled.current) return;
    prefilled.current = true;
    airportByIATA(home).then((a) => a && setOrigin(a));
  }, [profile]);

  const distance =
    origin && dest ? Math.round(haversineMiles(origin.lat, origin.lon, dest.lat, dest.lon)) : null;

  async function save() {
    if (!origin || !dest || saving) return;
    setSaving(true);
    try {
      await createFlight({
        originIATA: origin.iata,
        destIATA: dest.iata,
        distanceMiles: distance ?? 0,
        date: date ? new Date(`${date}T12:00:00`).getTime() : null,
        airline: airline.trim() || null,
        flightNumber: flightNumber.trim() || null,
        originISO3: origin.countryISO3,
        destISO3: dest.countryISO3,
      });
      navigate(-1);
    } catch (err) {
      console.error("Failed to save flight", err);
      alert(`Couldn't save the flight: ${(err as Error).message ?? err}`);
      setSaving(false);
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
        padding: "calc(var(--safe-top) + 20px) 20px calc(var(--safe-bottom) + 24px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ border: 0, background: "none", fontSize: 13, fontWeight: 600, color: "var(--color-neutral-700)" }}
        >
          Cancel
        </button>
        <div style={{ font: "400 17px var(--font-heading)" }}>New flight</div>
        <button
          onClick={save}
          disabled={!origin || !dest || saving}
          style={{
            border: 0,
            background: "none",
            fontSize: 13,
            fontWeight: 700,
            color: origin && dest ? "var(--color-accent-700)" : "var(--color-neutral-400)",
          }}
        >
          Save
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <AirportField label="From" value={origin} onSelect={setOrigin} placeholder="LAX or Los Angeles" />
        <AirportField label="To" value={dest} onSelect={setDest} placeholder="NCE or Nice" />

        <Field label="Date">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Airline (optional)">
            <TextInput value={airline} placeholder="Air France" onChange={(e) => setAirline(e.target.value)} />
          </Field>
          <Field label="Flight # (optional)">
            <TextInput value={flightNumber} placeholder="AF123" onChange={(e) => setFlightNumber(e.target.value)} />
          </Field>
        </div>

        {distance !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--color-neutral-100)",
              borderRadius: 22,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
              {origin!.iata} → {dest!.iata}
            </div>
            <div style={{ font: "400 20px var(--font-heading)", color: "var(--color-accent-700)" }}>
              {distance.toLocaleString()} mi
            </div>
          </div>
        )}

        <PrimaryButton onClick={save}>{saving ? "Saving…" : "Save flight"}</PrimaryButton>
      </div>
    </div>
  );
}

function AirportField({
  label,
  value,
  onSelect,
  placeholder,
}: {
  label: string;
  value: Airport | null;
  onSelect: (a: Airport | null) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Airport[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (value || q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchAirports(q).then(setResults);
    }, 200);
    return () => clearTimeout(t);
  }, [query, value]);

  return (
    <Field label={label}>
      <TextInput
        value={value ? labelFor(value) : query}
        placeholder={placeholder}
        onChange={(e) => {
          onSelect(null);
          setQuery(e.target.value);
        }}
      />
      {results.length > 0 && (
        <div
          style={{
            background: "var(--color-neutral-100)",
            borderRadius: 18,
            overflow: "hidden",
            marginTop: 6,
          }}
        >
          {results.map((a, i) => (
            <button
              key={a.iata}
              onClick={() => {
                onSelect(a);
                setQuery(labelFor(a));
                setResults([]);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: 0,
                background: "none",
                padding: "10px 14px",
                borderTop: i ? "1px solid var(--color-divider)" : "none",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {a.iata} · {a.city || a.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>{a.name}</div>
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}

function labelFor(a: Airport): string {
  return `${a.iata} · ${a.city || a.name}`;
}
