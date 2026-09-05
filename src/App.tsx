import { NavLink, Route, Routes, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { MapScreen } from "@ui/screens/MapScreen";
import { TripsScreen } from "@ui/screens/TripsScreen";
import { PassportScreen } from "@ui/screens/PassportScreen";
import { MilesScreen } from "@ui/screens/MilesScreen";
import { MeScreen } from "@ui/screens/MeScreen";
import { ComposeScreen } from "@ui/screens/ComposeScreen";
import { EntryScreen } from "@ui/screens/EntryScreen";
import { AddFlightScreen } from "@ui/screens/AddFlightScreen";

const TABS: Array<{ to: string; label: string; icon: ReactNode }> = [
  { to: "/map", label: "Map", icon: <PinIcon /> },
  { to: "/trips", label: "Trips", icon: <BookIcon /> },
  { to: "/passport", label: "Passport", icon: <IdIcon /> },
  { to: "/miles", label: "Miles", icon: <PlaneIcon /> },
  { to: "/me", label: "Me", icon: <PersonIcon /> },
];

const FULLSCREEN_PREFIXES = ["/compose", "/entry/", "/flights/new"];

export function App() {
  const location = useLocation();
  const hideTabs = FULLSCREEN_PREFIXES.some((p) => location.pathname.startsWith(p));

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
      }}
    >
      <main style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" as never }}>
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/trips" element={<TripsScreen />} />
          <Route path="/passport" element={<PassportScreen />} />
          <Route path="/miles" element={<MilesScreen />} />
          <Route path="/me" element={<MeScreen />} />
          <Route path="/compose" element={<ComposeScreen />} />
          <Route path="/entry/:id" element={<EntryScreen />} />
          <Route path="/flights/new" element={<AddFlightScreen />} />
          <Route path="*" element={<Navigate to="/map" replace />} />
        </Routes>
      </main>

      {!hideTabs && (
        <nav
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "9px 6px calc(var(--safe-bottom) + 10px)",
            background: "var(--color-neutral-100)",
            borderTop: "1px solid var(--color-divider)",
          }}
        >
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              style={({ isActive }) => ({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                width: 60,
                fontSize: 10,
                fontWeight: 600,
                color: isActive ? "var(--color-accent-700)" : "var(--color-neutral-500)",
              })}
            >
              {t.icon}
              {t.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}

/* icons — 23px, currentColor, matching the prototype's line weight */
const S = { width: 23, height: 23, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function PinIcon() { return <svg {...S}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>; }
function BookIcon() { return <svg {...S}><path d="M5 4h11a2 2 0 0 1 2 2v14H6a1 1 0 0 1-1-1z" /><path d="M9 4v16" /></svg>; }
function IdIcon() { return <svg {...S}><circle cx="12" cy="10" r="6.5" /><path d="M6.5 20h11" /></svg>; }
function PlaneIcon() { return <svg {...S}><path d="M3 12l18-7.5-6.5 7.5 6.5 7.5z" /></svg>; }
function PersonIcon() { return <svg {...S}><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" /></svg>; }
