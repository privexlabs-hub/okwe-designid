"use client";

import type { SelectHTMLAttributes } from "react";

export type SelectOption = string | { value: string; label: string };

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options?: SelectOption[];
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

/** Native select with a drawn caret; corners are 0, invalid reddens the base rule. */
export function Select({
  options = [],
  size = "md",
  invalid = false,
  style,
  ...rest
}: SelectProps) {
  return (
    <select
      style={{
        fontFamily: "var(--font-ui)",
        fontStretch: "var(--stretch-ui)",
        fontSize: "var(--size-sm)",
        fontWeight: "var(--weight-medium)",
        width: "100%",
        appearance: "none",
        background: "var(--surface-field)",
        color: "var(--text-body)",
        borderRadius: 0,
        border: "var(--rule-thin) solid var(--rule-quiet)",
        borderBottom: `var(--rule-thin) solid ${invalid ? "var(--status-danger)" : "var(--rule-ink)"}`,
        height:
          size === "sm"
            ? "var(--control-height-sm)"
            : size === "lg"
              ? "var(--control-height-lg)"
              : "var(--control-height-md)",
        padding: "0 var(--space-8) 0 var(--space-4)",
        cursor: "pointer",
        backgroundImage:
          "linear-gradient(var(--rule-ink),var(--rule-ink)),linear-gradient(var(--rule-ink),var(--rule-ink))",
        backgroundSize: "8px 1px,1px 8px",
        backgroundPosition: "calc(100% - 14px) 55%,calc(100% - 10px) calc(55% - 4px)",
        backgroundRepeat: "no-repeat",
        ...style,
      }}
      {...rest}
    >
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value,
          l = typeof o === "string" ? o : o.label;
        return (
          <option key={v} value={v}>
            {l}
          </option>
        );
      })}
    </select>
  );
}
