import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@core/db";
import { computeWorldStats } from "@core/services/stats";
import {
  loadWorldFeatures,
  makeProjectedPath,
  isoA3ForNumeric,
  numericForISO3,
  type WorldFeature,
} from "@core/services/geo";
import { Screen, Card, StatTile } from "@ui/components";

const RATIO = 0.5; // 800 x 400 viewBox, like the prototype

export function MapScreen() {
  const entries = useLiveQuery(() => db.entries.toArray(), [], []);
  const visits = useLiveQuery(() => db.countryVisits.toArray(), [], []);
  const fill = "#c67139"; // Profile.mapFill wired in Phase 1

  const stats = useMemo(
    () => computeWorldStats(entries, [], visits),
    [entries, visits],
  );

  const visitedNumeric = useMemo(() => {
    const s = new Set<string>();
    for (const iso of stats.visitedISO3) {
      const n = numericForISO3(iso);
      if (n) s.add(n);
    }
    return s;
  }, [stats.visitedISO3]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [features, setFeatures] = useState<WorldFeature[] | null>(null);

  useEffect(() => {
    loadWorldFeatures().then(setFeatures).catch(console.error);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = Math.round(width * RATIO);

  const paths = useMemo(() => {
    if (!features) return [];
    const { path } = makeProjectedPath(features, width - 16, height - 12);
    return features
      .map((f) => ({
        id: String(f.id).padStart(3, "0"),
        a3: isoA3ForNumeric(f.id) ?? "",
        d: path(f) ?? "",
      }))
      .filter((p) => p.d);
  }, [features, width, height]);

  return (
    <Screen
      title={`${stats.countryCount} of ${stats.unMemberCount}`}
      kicker="Your world"
      trailing={
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 999,
            background: "var(--color-accent-200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-accent-700)",
            font: "600 12.5px var(--font-body)",
          }}
        >
          {stats.percentOfWorld.toFixed(1)}%
        </div>
      }
    >
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          background: "var(--color-accent-2-200)",
          borderRadius: 24,
          padding: "6px 8px",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        <svg width="100%" height={height} viewBox={`0 0 ${width - 16} ${height - 12}`}>
          <g transform="translate(0,0)">
            {paths.map((p) => (
              <path
                key={p.id}
                d={p.d}
                fill={visitedNumeric.has(p.id) ? fill : "var(--color-neutral-300)"}
                stroke="var(--color-bg)"
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>
        {!features && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontSize: 12,
              color: "var(--color-accent-2-800)",
            }}
          >
            loading map…
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <StatTile value={stats.countryCount} label="countries" />
        <StatTile
          value={stats.continentCount}
          label="continents"
          color="var(--color-accent-2-700)"
        />
        <StatTile value={fmtMiles(stats.totalMiles)} label="miles flown" />
      </div>

      {stats.countryCount === 0 ? (
        <Card>
          <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
            The map fills in as you add city entries on the <strong>Trips</strong> tab. Each
            entry is geocoded to a country and lights it up here.
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {[...stats.visitedISO3].sort().map((iso) => (
            <span
              key={iso}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px 6px 8px",
                borderRadius: 999,
                background: "var(--color-accent-200)",
                color: "var(--color-accent-800)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "var(--color-accent)",
                }}
              />
              {iso}
            </span>
          ))}
        </div>
      )}
    </Screen>
  );
}

function fmtMiles(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)}k`;
  return String(Math.round(m));
}
