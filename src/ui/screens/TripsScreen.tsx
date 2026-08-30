import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@core/db";
import { seedSampleData } from "@core/dev";
import { Screen, Card, Tag, PillButton, PrimaryButton } from "@ui/components";

export function TripsScreen() {
  const entries = useLiveQuery(() => db.entries.orderBy("orderIndex").toArray(), [], []);

  return (
    <Screen title="Trips" trailing={<PillButton>+ New entry</PillButton>}>
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
            No entries yet. Phase 1 builds the real create flow (place search + geocode,
            photo album with captions, day notes). For now, load the sample trips from the
            design prototype to see the map and stats work.
          </div>
          <PrimaryButton onClick={() => seedSampleData()}>Load sample data</PrimaryButton>
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
              <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
                <Tag kind="sage">{e.countryISO}</Tag>
                <Tag>0 photos</Tag>
                <Tag>0 notes</Tag>
              </div>
            </div>
          </Card>
        ))
      )}
    </Screen>
  );
}

function fmtRange(a?: number | null, b?: number | null): string {
  if (!a) return "";
  const f = (t: number) =>
    new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return b ? `${f(a)} – ${f(b)}` : f(a);
}
