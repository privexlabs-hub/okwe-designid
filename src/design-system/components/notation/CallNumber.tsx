import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

const SERIES_CODES: Record<string, string> = {
  "The Trade Desk": "TD",
  "The Logistics Desk": "LD",
  "Field Notes": "FN",
  "Numbers": "NM",
  "Business Anatomy": "BA",
  "How It Works": "HW",
  "Okwe Explains": "OX",
  "Okwe Academy": "AC",
  "Research": "RS",
};

export function callNumberString(
  series?: string,
  issue?: string | number,
  part?: string | number
): string {
  const code =
    SERIES_CODES[series as string] ||
    (series || "")
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const n = issue === undefined ? "" : "·" + String(issue).padStart(3, "0");
  const p = part === undefined ? "" : "/" + String(part).padStart(2, "0");
  return code + n + p;
}

export interface CallNumberProps
  // `part` is the call number's part index, not React's DOM `part` attribute
  // (which is string-only); `className` is a classification label, not a CSS class.
  extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "part"> {
  series?: string;
  issue?: string | number;
  part?: string | number;
  date?: ReactNode;
  /** Rendered as a trailing classification label, not as a DOM class. */
  className?: string;
  tone?: "ink" | "inverse" | "mark";
  orientation?: "horizontal" | "vertical";
  style?: CSSProperties;
}

/** Library-style call number: code, series, classification and date on one line (or rotated rule). */
export function CallNumber({
  series,
  issue,
  part,
  date,
  className = "",
  tone = "ink",
  orientation = "horizontal",
  style,
  ...rest
}: CallNumberProps) {
  const color =
    tone === "inverse"
      ? "var(--text-inverse)"
      : tone === "mark"
        ? "var(--text-mark)"
        : "var(--text-primary)";
  const quiet = tone === "inverse" ? "var(--text-inverse-muted)" : "var(--text-muted)";
  const vertical = orientation === "vertical";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: vertical ? "flex-start" : "baseline",
        gap: vertical ? "var(--space-3)" : "var(--space-4)",
        color,
        ...(vertical
          ? {
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }
          : null),
        ...style,
      }}
      {...rest}
    >
      <span className="okwe-call" style={{ fontWeight: "var(--weight-bold)" }}>
        {callNumberString(series, issue, part)}
      </span>
      {series && (
        <span className="okwe-call" style={{ color: quiet }}>
          {series}
        </span>
      )}
      {className && (
        <span className="okwe-call" style={{ color: quiet }}>
          {className}
        </span>
      )}
      {date && (
        <span
          className="okwe-call"
          style={{ color: quiet, marginLeft: vertical ? 0 : "auto" }}
        >
          {date}
        </span>
      )}
    </div>
  );
}
