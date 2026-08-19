"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

/** Rectangular toggle: no radius, the knob slides and turns sulphur when on. */
export function Switch({
  label,
  checked = false,
  disabled = false,
  onChange,
  style,
  ...rest
}: SwitchProps) {
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
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{
          position: "absolute",
          opacity: 0,
          width: 32,
          height: 14,
          margin: 0,
        }}
        {...rest}
      />
      <span
        aria-hidden="true"
        style={{
          width: 32,
          height: 14,
          flex: "none",
          borderRadius: 0,
          background: "var(--surface-field)",
          border: "var(--rule-thin) solid var(--rule-ink)",
          position: "relative",
          transition: "var(--transition-control)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: checked ? 16 : 0,
            width: 16,
            background: checked ? "var(--surface-mark)" : "var(--chalk-300)",
            transition: "left var(--duration-snap) var(--ease-mech)",
          }}
        />
      </span>
      {label}
    </label>
  );
}
