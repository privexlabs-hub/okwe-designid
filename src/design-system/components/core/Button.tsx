"use client";

import { useState } from "react";
import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";

const base: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
  fontStretch: "var(--stretch-ui)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-3)",
  border: "var(--rule-thin) solid transparent",
  borderRadius: 0,
  cursor: "pointer",
  transition: "var(--transition-control)",
  textDecoration: "none",
  whiteSpace: "nowrap",
  boxShadow: "none",
};

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "solid" | "mark" | "outline" | "ghost" | "link";

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: {
    height: "var(--control-height-sm)",
    padding: "0 var(--control-pad-sm)",
    fontSize: "var(--size-xs)",
  },
  md: {
    height: "var(--control-height-md)",
    padding: "0 var(--control-pad-md)",
    fontSize: "var(--size-sm)",
  },
  lg: {
    height: "var(--control-height-lg)",
    padding: "0 var(--control-pad-lg)",
    fontSize: "var(--size-md)",
  },
};

function skin(variant: ButtonVariant, hover: boolean): CSSProperties {
  switch (variant) {
    case "mark":
      return {
        background: hover ? "var(--interactive-mark-bg-hover)" : "var(--interactive-mark-bg)",
        color: "var(--interactive-mark-fg)",
        borderColor: "var(--interactive-mark-bg)",
      };
    case "outline":
      return {
        background: hover ? "var(--interactive-quiet-hover)" : "transparent",
        color: "var(--text-primary)",
        borderColor: "var(--rule-ink)",
        borderWidth: "var(--rule-thin)",
      };
    case "ghost":
      return {
        background: hover ? "var(--interactive-quiet-hover)" : "transparent",
        color: "var(--text-primary)",
      };
    case "link":
      return {
        background: "transparent",
        color: "var(--text-primary)",
        padding: 0,
        height: "auto",
        boxShadow: hover ? "inset 0 -3px 0 var(--rule-mark)" : "inset 0 -1px 0 currentColor",
        fontFamily: "var(--font-mono)",
        fontStretch: "var(--stretch-mono)",
        letterSpacing: "var(--tracking-call)",
        textTransform: "uppercase",
        fontSize: "var(--size-2xs)",
      };
    default:
      return {
        background: hover ? "var(--interactive-bg-hover)" : "var(--interactive-bg)",
        color: "var(--interactive-fg)",
        borderColor: "var(--interactive-bg)",
      };
  }
}

export interface ButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement & HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  href?: string;
  index?: number;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
}

/** Primary control. Renders an <a> when `href` is given, otherwise a <button>. */
export function Button({
  variant = "solid",
  size = "md",
  disabled = false,
  fullWidth = false,
  href,
  index,
  leadingIcon,
  trailingIcon,
  children,
  style,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const Tag = href ? "a" : "button";
  const css: CSSProperties = {
    ...base,
    ...sizes[size],
    ...skin(variant, hover && !disabled),
    ...(fullWidth
      ? {
          width: "100%",
        }
      : null),
    ...(disabled
      ? {
          background: "var(--interactive-disabled-bg)",
          color: "var(--interactive-disabled-fg)",
          borderColor: "transparent",
          cursor: "not-allowed",
          boxShadow: "none",
        }
      : null),
    ...style,
  };
  return (
    <Tag
      href={href}
      disabled={Tag === "button" ? disabled : undefined}
      style={css}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
    >
      {index !== undefined && (
        <span className="okwe-call" style={{ opacity: 0.62 }}>
          {String(index).padStart(2, "0")}
        </span>
      )}
      {leadingIcon}
      {children}
      {trailingIcon}
    </Tag>
  );
}
