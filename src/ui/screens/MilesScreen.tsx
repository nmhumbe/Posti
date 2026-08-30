import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@core/db";
import { EARTH_CIRCUMFERENCE_MILES } from "@core/services/distance";
import { Screen, Card, StatTile, ComingSoon } from "@ui/components";

export function MilesScreen() {
  const flights = useLiveQuery(() => db.flights.toArray(), [], []);
  const profile = useLiveQuery(() => db.profiles.toArray(), [], []);
  const goal = profile[0]?.milesGoal ?? 100_000;

  const total = flights.reduce((s, f) => s + (f.distanceMiles || 0), 0);
  const pct = Math.min(100, (total / goal) * 100);
  const around = total / EARTH_CIRCUMFERENCE_MILES;

  return (
    <Screen title="Miles" kicker="Since 2025">
      <div
        style={{
          background: "var(--color-accent)",
          borderRadius: "var(--radius-card)",
          padding: "20px 20px 18px",
          color: "var(--color-bg)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ font: "400 46px/1 var(--font-heading)" }}>
          {total.toLocaleString()}
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 6 }}>
          miles flown · {around.toFixed(2)}× around the Earth
        </div>
        <div
          style={{
            height: 9,
            borderRadius: 999,
            background: "rgba(245,234,216,.35)",
            marginTop: 16,
            overflow: "hidden",
          }}
        >
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-bg)" }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10.5,
            marginTop: 7,
            opacity: 0.9,
          }}
        >
          <span>Goal: {goal.toLocaleString()}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <StatTile value={flights.length} label="flights" />
        <StatTile
          value={flights.length ? Math.round(total / flights.length).toLocaleString() : "—"}
          label="avg leg"
        />
        <StatTile value="—" label="in the air" />
      </div>

      {flights.length > 0 && (
        <Card pad={0}>
          {flights
            .slice()
            .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
            .map((f, i) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 15px",
                  borderTop: i ? "1px solid var(--color-divider)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {f.originIATA} → {f.destIATA}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-neutral-600)", marginTop: 2 }}>
                    {f.date ? new Date(f.date).toLocaleDateString() : "—"}
                    {f.airline ? ` · ${f.airline}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ font: "400 15px var(--font-heading)", color: "var(--color-accent-700)" }}>
                    {f.distanceMiles.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-neutral-600)" }}>mi</div>
                </div>
              </div>
            ))}
        </Card>
      )}

      <ComingSoon note='"Add manually" — origin/dest IATA autocomplete from a bundled OpenFlights table → haversine → cached distance. Boarding-pass scan later. (Phase 3)' />
    </Screen>
  );
}
