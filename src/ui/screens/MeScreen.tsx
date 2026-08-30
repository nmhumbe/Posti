import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@core/db";
import { clearAllData } from "@core/dev";
import { computeWorldStats } from "@core/services/stats";
import { Screen, Card, Tag, ComingSoon } from "@ui/components";

export function MeScreen() {
  const profile = useLiveQuery(() => db.profiles.toArray(), [], []);
  const entries = useLiveQuery(() => db.entries.toArray(), [], []);
  const photos = useLiveQuery(() => db.photos.toArray(), [], []);
  const visits = useLiveQuery(() => db.countryVisits.toArray(), [], []);
  const p = profile[0];
  const stats = computeWorldStats(entries, [], visits);

  const rows: Array<[string, string]> = [
    ["Map fill colour", p ? cap(p.mapFill) : "Terracotta"],
    ["Home airport", p?.homeAirportIATA ?? "Not set"],
    ["Miles goal", (p?.milesGoal ?? 100_000).toLocaleString()],
    ["Journal privacy", p?.journalPrivacy === "sharedLink" ? "Shared link" : "Only me"],
  ];

  return (
    <Screen title={p?.displayName || "Me"}>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <Tag kind="accent">{stats.countryCount} countries</Tag>
        <Tag kind="sage">{photos.length} photos</Tag>
      </div>

      <ComingSoon note="Badges grid (earned full-opacity, locked dimmed with a progress hint). Definitions in code, earned state from the stats service. (Phase 5)" />

      <Card pad={0}>
        {rows.map(([k, val], i) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderTop: i ? "1px solid var(--color-divider)" : "none",
              fontSize: 13.5,
            }}
          >
            <span>{k}</span>
            <span style={{ color: "var(--color-neutral-600)", fontSize: 12 }}>{val}</span>
          </div>
        ))}
      </Card>

      <button
        onClick={() => {
          if (confirm("Delete all local trips, flights and photos?")) clearAllData();
        }}
        style={{
          border: "1px solid var(--color-divider)",
          background: "transparent",
          color: "var(--color-neutral-700)",
          borderRadius: 999,
          padding: "10px 16px",
          fontSize: 12.5,
          alignSelf: "flex-start",
        }}
      >
        Reset sample data
      </button>
    </Screen>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
