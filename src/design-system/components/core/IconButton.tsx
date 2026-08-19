"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonVariant = "ghost" | "solid" | "outline";

const sizes: Record<IconButtonSize, string> = {
  sm: "var(--control-height-sm)",
  md: "var(--control-height-md)",
  lg: "var(--control-height-lg)",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  selected?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Square icon-only control; `label` supplies both aria-label and title. */
export function IconButton({
  label,
  size = "md",
  variant = "ghost",
  selected = false,
  disabled = false,
  children,
  style,
  ...rest
}: IconButtonProps) {
  const [hover, setHover] = useState(false);
  const solid = variant === "solid";
  const css: CSSProperties = {
    width: sizes[size],
    height: sizes[size],
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border:
      variant === "outline"
        ? "var(--rule-thin) solid var(--rule-ink)"
        : "var(--rule-thin) solid transparent",
    borderRadius: 0,
    cursor: "pointer",
    transition: "var(--transition-control)",
    background: solid
      ? hover
        ? "var(--interactive-bg-hover)"
        : "var(--interactive-bg)"
      : selected
        ? "var(--surface-mark)"
        : hover
          ? "var(--interactive-quiet-hover)"
          : "transparent",
    color: solid ? "var(--interactive-fg)" : "var(--text-primary)",
    ...(disabled
      ? {
          color: "var(--interactive-disabled-fg)",
          cursor: "not-allowed",
          background: "transparent",
        }
      : null),
    ...style,
  };
  return (
    <button
      aria-label={label}
      aria-pressed={selected || undefined}
      disabled={disabled}
      title={label}
      style={css}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
    >
      {children}
    </button>
  );
}
