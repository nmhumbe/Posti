import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@core/db";
import { listEntries } from "@core/repo";
import { seedSampleData } from "@core/dev";
import { Screen, Card, Tag, PillButton, Toast } from "@ui/components";

export function TripsScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const entries = useLiveQuery(listEntries, [], []);
  const dayNotes = useLiveQuery(() => db.dayNotes.toArray(), [], []);
  const photos = useLiveQuery(() => db.photos.toArray(), [], []);

  const noteCount = (id: string) => dayNotes.filter((n) => n.entryId === id && !n.deletedAt).length;
  const photoCount = (id: string) => photos.filter((p) => p.entryId === id && !p.deletedAt).length;

  // toast passed from the Compose screen on save
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null,
  );
  useEffect(() => {
    if (!toast) return;
    window.history.replaceState({}, "");
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <Screen title="Trips" trailing={<PillButton onClick={() => navigate("/compose")}>+ New entry</PillButton>}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "var(--color-neutral-200)",
          borderRadius: 999,
          padding: "10px 15px",
          color: "var(--color-neutral-600)",
          fontSize: 13,
        }}
      >
        <span>⌕</span> Search places, notes, people
      </div>

      {entries.length === 0 ? (
        <Card>
          <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 12 }}>
            No entries yet. Tap <strong>+ New entry</strong> to add a city — search the place,
            it's geocoded to a country and lights up the map.
          </div>
        </Card>
      ) : (
        entries.map((e) => (
          <Card key={e.id} pad={0} style={{ overflow: "hidden" }}>
            <div
              className="washed"
              style={{
                height: 120,
                background:
                  "linear-gradient(135deg, var(--color-accent-300), var(--color-accent-2-300))",
              }}
            />
            <div style={{ padding: "13px 15px 15px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <h4>{e.cityName}</h4>
                <span style={{ fontSize: 11.5, color: "var(--color-neutral-600)" }}>
                  {fmtRange(e.arrivalDate, e.departureDate)}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 11 }}>
                <Tag kind="sage">{e.countryISO || "??"}</Tag>
                {e.mood && <Tag kind="accent">{e.mood}</Tag>}
                <Tag>{photoCount(e.id)} photos</Tag>
                <Tag>{noteCount(e.id)} notes</Tag>
              </div>
            </div>
          </Card>
        ))
      )}

      <button
        onClick={() => seedSampleData()}
        style={{
          alignSelf: "flex-start",
          border: "1px solid var(--color-divider)",
          background: "transparent",
          color: "var(--color-neutral-600)",
          borderRadius: 999,
          padding: "8px 14px",
          fontSize: 12,
        }}
      >
        + Load sample data (dev)
      </button>

      {toast && <Toast message={toast} />}
    </Screen>
  );
}

function fmtRange(a?: number | null, b?: number | null): string {
  if (!a) return "";
  const f = (t: number) =>
    new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return b ? `${f(a)} – ${f(b)}` : f(a);
}
