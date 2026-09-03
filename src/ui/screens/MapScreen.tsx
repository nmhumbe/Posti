import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { db } from "@core/db";
import { listEntries, listCountryVisits, setCountryStatus } from "@core/repo";
import { computeWorldStats } from "@core/services/stats";
import {
  loadWorldFeatures,
  makeProjectedPath,
  numericForISO3,
  countryByNumeric,
  type WorldFeature,
} from "@core/services/geo";
import { MAP_FILL_HEX, type JournalEntry, type VisitStatus } from "@core/models";
import { Screen, Card, StatTile, RegionBar, Tag } from "@ui/components";
import { usePanZoom } from "@ui/usePanZoom";

const RATIO = 0.5; // 800 x 400 viewBox, like the prototype

interface Picked {
  iso3: string;
  name: string;
  continent: string;
}

export function MapScreen() {
  const navigate = useNavigate();
  const entries = useLiveQuery(listEntries, [], []);
  const visits = useLiveQuery(listCountryVisits, [], []);
  const profile = useLiveQuery(() => db.profiles.toArray(), [], []);
  const fill = MAP_FILL_HEX[profile[0]?.mapFill ?? "terracotta"];

  const stats = useMemo(() => computeWorldStats(entries, [], visits), [entries, visits]);

  const visitedNumeric = useMemo(() => {
    const s = new Set<string>();
    for (const iso of stats.visitedISO3) {
      const n = numericForISO3(iso);
      if (n) s.add(n);
    }
    return s;
  }, [stats.visitedISO3]);

  const wishlistNumeric = useMemo(() => {
    const s = new Set<string>();
    for (const v of visits) {
      if (v.status !== "wishlist") continue;
      const n = numericForISO3(v.countryISO);
      if (n) s.add(n);
    }
    return s;
  }, [visits]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [features, setFeatures] = useState<WorldFeature[] | null>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const pz = usePanZoom();

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

  const vbW = width - 16;
  const height = Math.round(width * RATIO);
  const vbH = height - 12;
  pz.setBounds(vbW, vbH);

  const paths = useMemo(() => {
    if (!features) return [];
    const { path } = makeProjectedPath(features, vbW, vbH);
    return features
      .map((f) => ({ id: String(f.id).padStart(3, "0"), d: path(f) ?? "" }))
      .filter((p) => p.d);
  }, [features, vbW, vbH]);

  function tapCountry(numericId: string) {
    if (pz.wasDrag()) return;
    const row = countryByNumeric(numericId);
    if (!row) return;
    setPicked({ iso3: row.iso3, name: row.name, continent: row.continent });
  }

  const pickedVisit = picked ? visits.find((v) => v.countryISO === picked.iso3) : undefined;
  const pickedEntries = picked
    ? entries.filter((e) => e.countryISO.toUpperCase() === picked.iso3)
    : [];

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
        <svg
          ref={pz.svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${vbW} ${vbH}`}
          style={{ display: "block", touchAction: "none", cursor: pz.view.k > 1 ? "grab" : "default" }}
          {...pz.handlers}
        >
          <g transform={pz.transform}>
            {paths.map((p) => (
              <path
                key={p.id}
                d={p.d}
                onClick={() => tapCountry(p.id)}
                fill={
                  visitedNumeric.has(p.id)
                    ? fill
                    : wishlistNumeric.has(p.id)
                      ? "var(--color-accent-2-300)"
                      : "var(--color-neutral-300)"
                }
                stroke="var(--color-bg)"
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>

        {pz.view.k > 1 && (
          <button
            onClick={pz.reset}
            style={{
              position: "absolute",
              top: 12,
              right: 14,
              border: 0,
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 600,
              background: "rgba(245,234,216,.92)",
              color: "var(--color-text)",
            }}
          >
            Reset
          </button>
        )}

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
            entry is geocoded to a country and lights it up here. Tap any country to add it to
            your wishlist.
          </div>
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <div className="kicker" style={{ color: "var(--color-neutral-700)" }}>
              By region
            </div>
            {stats.regions
              .filter((r) => r.visited > 0)
              .map((r) => (
                <RegionBar key={r.name} name={r.name} visited={r.visited} total={r.total} pct={r.pct} />
              ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {stats.visitedCountries.map((c) => (
              <span
                key={c.iso3}
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
                <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--color-accent)" }} />
                {c.name}
              </span>
            ))}
          </div>
        </>
      )}

      {picked && (
        <CountrySheet
          country={picked}
          visitedByEntry={pickedEntries.length > 0}
          entries={pickedEntries}
          status={pickedVisit?.status ?? null}
          onStatus={(s) => setCountryStatus(picked.iso3, s)}
          onOpenEntry={(id) => {
            setPicked(null);
            navigate(`/entry/${id}`);
          }}
          onClose={() => setPicked(null)}
        />
      )}
    </Screen>
  );
}

const STATUS_OPTIONS: VisitStatus[] = ["visited", "wishlist", "layover", "lived"];

function CountrySheet({
  country,
  visitedByEntry,
  entries,
  status,
  onStatus,
  onOpenEntry,
  onClose,
}: {
  country: Picked;
  visitedByEntry: boolean;
  entries: JournalEntry[];
  status: VisitStatus | null;
  onStatus: (s: VisitStatus | null) => void;
  onOpenEntry: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(46,43,37,.4)", zIndex: 45, display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          background: "var(--color-bg)",
          borderRadius: "26px 26px 0 0",
          padding: "18px 20px calc(var(--safe-bottom) + 22px)",
        }}
      >
        <div
          style={{ width: 40, height: 4, borderRadius: 999, background: "var(--color-neutral-300)", margin: "0 auto 14px" }}
        />
        <div className="kicker" style={{ color: "var(--color-neutral-600)" }}>
          {country.continent}
        </div>
        <h3 style={{ margin: "4px 0 0" }}>{country.name}</h3>

        {visitedByEntry && (
          <div style={{ fontSize: 12.5, color: "var(--color-accent-2-700)", marginTop: 6 }}>
            Visited · {entries.length} {entries.length === 1 ? "city" : "cities"} logged
          </div>
        )}

        {entries.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {entries.map((e) => (
              <button
                key={e.id}
                onClick={() => onOpenEntry(e.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: 0,
                  textAlign: "left",
                  background: "var(--color-neutral-100)",
                  borderRadius: 16,
                  padding: "11px 14px",
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{e.cityName}</span>
                <span style={{ fontSize: 11.5, color: "var(--color-neutral-600)" }}>
                  {e.arrivalDate ? new Date(e.arrivalDate).getFullYear() : ""}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="kicker" style={{ color: "var(--color-neutral-600)", margin: "16px 0 8px" }}>
          Mark this country
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {STATUS_OPTIONS.map((s) => {
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => onStatus(active ? null : s)}
                style={{
                  border: 0,
                  textTransform: "capitalize",
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: active ? "var(--color-accent)" : "var(--color-neutral-200)",
                  color: active ? "var(--color-bg)" : "var(--color-neutral-800)",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
        {visitedByEntry && (
          <div style={{ fontSize: 11.5, color: "var(--color-neutral-600)", marginTop: 8 }}>
            <Tag kind="sage">note</Tag> already visited via your cities — a manual mark just
            adds metadata.
          </div>
        )}
      </div>
    </div>
  );
}

function fmtMiles(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)}k`;
  return String(Math.round(m));
}
