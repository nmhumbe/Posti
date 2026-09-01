import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

/** The component vocabulary from PLAN.md §6, styled to the organic tokens. */

const v = (name: string) => `var(--${name})`;

export function Screen({
  title,
  kicker,
  trailing,
  children,
}: {
  title: ReactNode;
  kicker?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: v("color-bg"),
        padding: `calc(var(--safe-top) + 40px) 20px 24px`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: "var(--space-4)",
        }}
      >
        <div>
          {kicker && <div className="kicker" style={{ marginBottom: 6 }}>{kicker}</div>}
          <h2>{title}</h2>
        </div>
        {trailing}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {children}
      </div>
    </div>
  );
}

export function Card({
  children,
  style,
  pad = 13.2,
}: {
  children: ReactNode;
  style?: CSSProperties;
  pad?: number;
}) {
  return (
    <div
      style={{
        background: v("color-surface"),
        borderRadius: v("radius-card"),
        boxShadow: v("shadow-sm"),
        padding: pad,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatTile({
  value,
  label,
  color = v("color-accent-700"),
}: {
  value: ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: v("color-neutral-100"),
        borderRadius: 18,
        padding: "12px 13px",
      }}
    >
      <div style={{ font: `400 26px/1 ${v("font-heading")}`, color }}>{value}</div>
      <div style={{ fontSize: 11, color: v("color-neutral-700"), marginTop: 3 }}>{label}</div>
    </div>
  );
}

type TagKind = "accent" | "sage" | "neutral";
export function Tag({ children, kind = "neutral" }: { children: ReactNode; kind?: TagKind }) {
  const map: Record<TagKind, [string, string]> = {
    accent: [v("color-accent-200"), v("color-accent-800")],
    sage: [v("color-accent-2-200"), v("color-accent-2-800")],
    neutral: [v("color-neutral-200"), v("color-neutral-800")],
  };
  const [bg, fg] = map[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 11px",
        borderRadius: v("radius-pill"),
        background: bg,
        color: fg,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        border: 0,
        padding: "15px",
        borderRadius: v("radius-pill"),
        background: v("color-accent"),
        color: v("color-bg"),
        font: `400 16px ${v("font-heading")}`,
        boxShadow: v("shadow-sm"),
      }}
    >
      {children}
    </button>
  );
}

export function PillButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: 0,
        background: v("color-accent"),
        color: v("color-bg"),
        padding: "9px 15px",
        borderRadius: v("radius-pill"),
        font: `400 13px ${v("font-heading")}`,
        boxShadow: v("shadow-sm"),
      }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: v("radius-pill"),
  border: `1px solid ${v("color-divider")}`,
  background: v("color-neutral-100"),
  fontSize: 13.5,
  outline: "none",
};

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        borderRadius: 22,
        minHeight: 110,
        resize: "vertical",
        fontFamily: v("font-body"),
        lineHeight: 1.6,
        ...props.style,
      }}
    />
  );
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 0,
        padding: "8px 14px",
        borderRadius: v("radius-pill"),
        fontSize: 12,
        fontWeight: 600,
        background: selected ? v("color-accent") : v("color-neutral-200"),
        color: selected ? v("color-bg") : v("color-neutral-800"),
      }}
    >
      {label}
    </button>
  );
}

/** Brief confirmation pill, slide-up from the bottom. Auto-dismisses. */
export function Toast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(var(--safe-bottom) + 92px)",
        transform: "translateX(-50%)",
        background: v("color-accent-800"),
        color: v("color-accent-100"),
        padding: "11px 18px",
        borderRadius: v("radius-pill"),
        fontSize: 12.5,
        fontWeight: 600,
        boxShadow: v("shadow-lg"),
        whiteSpace: "nowrap",
        zIndex: 50,
      }}
    >
      {message}
    </div>
  );
}

/** Honest placeholder for a screen area that isn't built yet. */
export function ComingSoon({ note }: { note: string }) {
  return (
    <Card>
      <div className="kicker" style={{ color: v("color-neutral-600"), marginBottom: 8 }}>
        Not built yet
      </div>
      <div style={{ fontSize: 13, color: v("color-neutral-700"), textWrap: "pretty" as never }}>
        {note}
      </div>
    </Card>
  );
}
