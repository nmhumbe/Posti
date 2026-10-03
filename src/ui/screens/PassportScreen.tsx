import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { listEntries, listCountryVisits } from "@core/repo";
import { countryByISO3, type Continent } from "@core/data/countries";
import { Screen, Card } from "@ui/components";

interface Stamp {
  iso3: string;
  name: string;
  continent: Continent | null;
  date: number | null;
  kind: "Entry" | "Resident" | "Transit";
  transit: boolean;
}

const LINE: Record<string, string> = {
  Europe: "var(--color-accent-700)",
  "North America": "var(--color-accent-700)",
  "South America": "var(--color-accent-600)",
  Asia: "var(--color-accent-2-700)",
  Oceania: "var(--color-accent-2-600)",
  Africa: "var(--color-accent-800)",
  Antarctica: "var(--color-neutral-700)",
};

export function PassportScreen() {
  const entries = useLiveQuery(listEntries, [], []);
  const visits = useLiveQuery(listCountryVisits, [], []);
  const [page, setPage] = useState(0);

  const stamps = useMemo<Stamp[]>(() => {
    const earliest = new Map<string, number>();
    for (const e of entries) {
      const iso = e.countryISO?.toUpperCase();
      if (!iso || !e.arrivalDate) continue;
      earliest.set(iso, Math.min(earliest.get(iso) ?? Infinity, e.arrivalDate));
    }
    const byIso = new Map<string, Stamp>();

    // real presence: a logged city, or a manual visited/lived mark
    for (const iso of new Set([
      ...entries.map((e) => e.countryISO?.toUpperCase()).filter(Boolean),
      ...visits.filter((v) => v.status === "visited" || v.status === "lived").map((v) => v.countryISO),
    ])) {
      if (!iso) continue;
      const row = countryByISO3(iso);
      const visit = visits.find((v) => v.countryISO === iso);
      byIso.set(iso, {
        iso3: iso,
        name: row?.name ?? iso,
        continent: row?.continent ?? null,
        date: earliest.get(iso) ?? visit?.firstVisitDate ?? null,
        kind: visit?.status === "lived" ? "Resident" : "Entry",
        transit: false,
      });
    }
    // layover-only countries → faint transit stamps
    for (const v of visits) {
      if (v.status !== "layover" || byIso.has(v.countryISO)) continue;
      const row = countryByISO3(v.countryISO);
      byIso.set(v.countryISO, {
        iso3: v.countryISO,
        name: row?.name ?? v.countryISO,
        continent: row?.continent ?? null,
        date: v.firstVisitDate ?? null,
        kind: "Transit",
        transit: true,
      });
    }

    return [...byIso.values()].sort((a, b) => (a.date ?? Infinity) - (b.date ?? Infinity));
  }, [entries, visits]);

  const spreads = chunk(stamps, 4);
  const clampedPage = Math.min(page, Math.max(0, spreads.length - 1));
  const current = spreads[clampedPage] ?? [];

  return (
    <Screen
      title="Passport"
      kicker="Stamps collected"
      trailing={
        spreads.length > 1 && (
          <div style={{ display: "flex", gap: 6 }}>
            <PageBtn dir="prev" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={clampedPage === 0} />
            <PageBtn
              dir="next"
              onClick={() => setPage((p) => Math.min(spreads.length - 1, p + 1))}
              disabled={clampedPage >= spreads.length - 1}
            />
          </div>
        )
      }
    >
      {stamps.length === 0 ? (
        <Card>
          <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
            No stamps yet. Your first city entry on the <strong>Trips</strong> tab presses one —
            dated from your arrival.
          </div>
        </Card>
      ) : (
        <>
          <div
            style={{
              background: "var(--color-accent-900)",
              borderRadius: 22,
              padding: 8,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ display: "flex", background: "var(--color-neutral-200)", borderRadius: 16, overflow: "hidden" }}>
              <PassportPage stamps={current.slice(0, 2)} label={`p. ${String(clampedPage * 2 + 1).padStart(2, "0")}`} border />
              <PassportPage stamps={current.slice(2, 4)} label={`p. ${String(clampedPage * 2 + 2).padStart(2, "0")}`} align="right" />
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--color-neutral-600)" }}>
            {stamps.length} {stamps.length === 1 ? "stamp" : "stamps"} · spread {clampedPage + 1} of {spreads.length}
          </div>
        </>
      )}
    </Screen>
  );
}

function PassportPage({
  stamps,
  label,
  border,
  align = "left",
}: {
  stamps: Stamp[];
  label: string;
  border?: boolean;
  align?: "left" | "right";
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 260,
        padding: "14px 12px 20px",
        backgroundImage:
          "repeating-linear-gradient(135deg,rgba(140,73,26,.06) 0 2px,transparent 2px 10px)",
        borderRight: border ? "1px solid rgba(32,30,29,.14)" : undefined,
      }}
    >
      <div
        style={{
          font: "600 8px var(--font-body)",
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "var(--color-neutral-600)",
          textAlign: align,
          marginBottom: 14,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {stamps.map((s, i) => (
          <StampMark key={s.iso3} stamp={s} big={i === 0} />
        ))}
      </div>
    </div>
  );
}

function StampMark({ stamp, big }: { stamp: Stamp; big: boolean }) {
  const line = stamp.continent ? LINE[stamp.continent] ?? "var(--color-accent-700)" : "var(--color-accent-700)";
  const size = big ? 108 : 90;
  const rot = ((hash(stamp.iso3) % 13) - 6) * (big ? 1 : -1);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: `2.5px ${stamp.transit ? "dashed" : "solid"} ${line}`,
        color: line,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${rot}deg)`,
        background: stamp.transit ? "transparent" : `color-mix(in srgb, ${line} 9%, transparent)`,
        opacity: stamp.transit ? 0.7 : 1,
        padding: "0 8px",
        textAlign: "center",
      }}
    >
      <div style={{ font: `400 ${big ? 12 : 10.5}px var(--font-heading)`, letterSpacing: ".04em", lineHeight: 1.1 }}>
        {stamp.name}
      </div>
      <div style={{ width: 40, height: 1.5, background: "currentColor", opacity: 0.5, margin: "5px 0" }} />
      <div style={{ font: "600 7.5px var(--font-body)", letterSpacing: ".14em", textTransform: "uppercase" }}>
        {stamp.date ? fmt(stamp.date) : "— — —"}
      </div>
      <div style={{ font: "600 7px var(--font-body)", letterSpacing: ".16em", opacity: 0.7, marginTop: 3, textTransform: "uppercase" }}>
        {stamp.kind}
      </div>
    </div>
  );
}

function PageBtn({ dir, onClick, disabled }: { dir: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        border: 0,
        background: "var(--color-neutral-200)",
        color: "var(--color-neutral-800)",
        opacity: disabled ? 0.4 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function fmt(t: number): string {
  return new Date(t).toLocaleDateString("en", { month: "short", year: "numeric" });
}
