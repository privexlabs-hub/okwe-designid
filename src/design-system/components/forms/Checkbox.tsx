"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  indeterminate?: boolean;
}

/** Square box, zero radius; selected state is a sulphur fill (--surface-mark). */
export function Checkbox({
  label,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  style,
  ...rest
}: CheckboxProps) {
  const on = checked || indeterminate;
  return (
    <label
      style={{
        display: "inline-flex",
        gap: "var(--space-4)",
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        font: "var(--type-body-sm)",
        color: disabled ? "var(--text-quiet)" : "var(--text-body)",
        ...style,
      }}
    >
      <input
        type="checkbox"
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
          display: "grid",
          placeItems: "center",
          borderRadius: 0,
          border: "var(--rule-thin) solid var(--rule-ink)",
          background: on ? "var(--surface-mark)" : "var(--surface-field)",
          transition: "var(--transition-control)",
        }}
      >
        {indeterminate ? (
          <span
            style={{ width: 8, height: 2, background: "var(--cyanotype-900)" }}
          />
        ) : checked ? (
          <span
            style={{ width: 6, height: 6, background: "var(--cyanotype-900)" }}
          />
        ) : null}
      </span>
      {label}
    </label>
  );
}
