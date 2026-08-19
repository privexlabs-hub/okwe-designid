"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
}

/** Square radio (corners are 0); selected state is a sulphur fill inset by the field colour. */
export function Radio({
  label,
  description,
  checked = false,
  disabled = false,
  onChange,
  name,
  value,
  style,
  ...rest
}: RadioProps) {
  return (
    <label
      style={{
        display: "inline-flex",
        gap: "var(--space-4)",
        alignItems: "flex-start",
        cursor: disabled ? "not-allowed" : "pointer",
        font: "var(--type-body-sm)",
        color: disabled ? "var(--text-quiet)" : "var(--text-body)",
        ...style,
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{
          position: "absolute",
          opacity: 0,
          width: 14,
          height: 14,
          margin: 0,
        }}
        {...rest}
      />
      <span
        aria-hidden="true"
        style={{
          width: 14,
          height: 14,
          flex: "none",
          marginTop: 4,
          // The bundle sets 0 here and on the dot, making a radio visually
          // identical to a checkbox. The design system contradicts that twice —
          // its readme ("Circles exist only for the seed mark and the radio
          // dot") and the comment in Seeds.tsx — and ships --radius-circle
          // solely for these two cases. Following the stated rule.
          borderRadius: "var(--radius-circle)",
          border: "var(--rule-thin) solid var(--rule-ink)",
          background: "var(--surface-field)",
          display: "grid",
          placeItems: "center",
          transition: "var(--transition-control)",
        }}
      >
        {checked && (
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "var(--radius-circle)",
              background: "var(--surface-mark)",
              boxShadow: "inset 0 0 0 3px var(--surface-field)",
            }}
          />
        )}
      </span>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        {label}
        {description && (
          <span
            style={{
              font: "var(--type-caption)",
              color: "var(--text-muted)",
            }}
          >
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
