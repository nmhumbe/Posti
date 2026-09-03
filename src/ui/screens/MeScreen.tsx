import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@core/db";
import { getProfile, updateProfile } from "@core/repo";
import { clearAllData } from "@core/dev";
import { computeWorldStats } from "@core/services/stats";
import { MAP_FILL_HEX, type MapFill } from "@core/models";
import { Screen, Card, Tag, ComingSoon, TextInput } from "@ui/components";

const FILLS: MapFill[] = ["terracotta", "sage", "rust", "clay"];

export function MeScreen() {
  const profile = useLiveQuery(getProfile, [], undefined);
  const entries = useLiveQuery(() => db.entries.toArray(), [], []);
  const photos = useLiveQuery(() => db.photos.toArray(), [], []);
  const visits = useLiveQuery(() => db.countryVisits.toArray(), [], []);
  const stats = computeWorldStats(entries, [], visits);

  // local drafts for text fields, synced from the row
  const [name, setName] = useState("");
  const [airport, setAirport] = useState("");
  const [goal, setGoal] = useState("100000");
  useEffect(() => {
    if (!profile) return;
    setName(profile.displayName);
    setAirport(profile.homeAirportIATA ?? "");
    setGoal(String(profile.milesGoal));
  }, [profile?.displayName, profile?.homeAirportIATA, profile?.milesGoal]);

  if (!profile) return <Screen title="Me">{null}</Screen>;

  return (
    <Screen title={profile.displayName || "Me"}>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <Tag kind="accent">{stats.countryCount} countries</Tag>
        <Tag kind="sage">{photos.length} photos</Tag>
        <Tag>{entries.length} cities</Tag>
      </div>

      <Card>
        <div className="kicker" style={{ color: "var(--color-neutral-600)", marginBottom: 8 }}>
          Name
        </div>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== profile.displayName && updateProfile({ displayName: name.trim() })}
        />
      </Card>

      <Card>
        <div className="kicker" style={{ color: "var(--color-neutral-600)", marginBottom: 10 }}>
          Map fill colour
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {FILLS.map((f) => {
            const active = profile.mapFill === f;
            return (
              <button
                key={f}
                onClick={() => updateProfile({ mapFill: f })}
                aria-label={f}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  border: active ? "3px solid var(--color-text)" : "3px solid transparent",
                  background: MAP_FILL_HEX[f],
                  outline: "1px solid var(--color-divider)",
                }}
              />
            );
          })}
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="kicker" style={{ color: "var(--color-neutral-600)", marginBottom: 8 }}>
              Home airport
            </div>
            <TextInput
              value={airport}
              placeholder="LAX"
              maxLength={4}
              onChange={(e) => setAirport(e.target.value.toUpperCase())}
              onBlur={() =>
                airport !== (profile.homeAirportIATA ?? "") &&
                updateProfile({ homeAirportIATA: airport.trim() || null })
              }
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className="kicker" style={{ color: "var(--color-neutral-600)", marginBottom: 8 }}>
              Miles goal
            </div>
            <TextInput
              value={goal}
              inputMode="numeric"
              onChange={(e) => setGoal(e.target.value.replace(/[^0-9]/g, ""))}
              onBlur={() => {
                const n = Number(goal) || 0;
                if (n !== profile.milesGoal) updateProfile({ milesGoal: n });
              }}
            />
          </div>
        </div>
      </Card>

      <ComingSoon note="Badges grid (earned + locked with progress) and JSON export/import land in Phase 5." />

      <button
        onClick={() => {
          if (confirm("Delete all local trips, flights and photos?")) clearAllData();
        }}
        style={{
          alignSelf: "flex-start",
          border: "1px solid var(--color-divider)",
          background: "transparent",
          color: "var(--color-neutral-700)",
          borderRadius: 999,
          padding: "10px 16px",
          fontSize: 12.5,
        }}
      >
        Reset sample data
      </button>
    </Screen>
  );
}
