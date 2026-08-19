import type { LabelHTMLAttributes, ReactNode } from "react";

export interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label?: ReactNode;
  index?: number | string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
}

/** Labelled form row: call-number index, rule under the label, hint/error below. */
export function Field({
  label,
  index,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  style,
  ...rest
}: FieldProps) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          display: "flex",
          gap: "var(--space-3)",
          alignItems: "baseline",
          borderBottom: "var(--rule-thin) solid var(--rule-quiet)",
          paddingBottom: "var(--space-2)",
        }}
      >
        {index !== undefined && (
          <span className="okwe-call" style={{ color: "var(--text-quiet)" }}>
            {String(index).padStart(2, "0")}
          </span>
        )}
        <span className="okwe-label" style={{ color: "var(--text-secondary)" }}>
          {label}
          {required && <span style={{ color: "var(--class-opinion)" }}>{" ·req"}</span>}
        </span>
      </span>
      {children}
      {(error || hint) && (
        <span
          style={{
            font: "var(--type-caption)",
            color: error ? "var(--status-danger)" : "var(--text-muted)",
          }}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
}
