"use client";

import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

const shell: CSSProperties = {
  fontFamily: "var(--font-read)",
  fontSize: "var(--size-md)",
  width: "100%",
  background: "var(--surface-field)",
  color: "var(--text-body)",
  border: "var(--rule-thin) solid var(--rule-quiet)",
  borderBottom: "var(--rule-thin) solid var(--rule-ink)",
  borderRadius: 0,
  padding: "0 var(--space-4)",
  height: "var(--control-height-md)",
  transition: "var(--transition-control)",
};

export type InputSize = "sm" | "md" | "lg";

interface InputOwnProps {
  size?: InputSize;
  invalid?: boolean;
  rows?: number;
  prefix?: ReactNode;
}

/** `size` and `prefix` collide with native DOM attributes, so both are omitted first. */
export type InputProps =
  | (Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> &
      InputOwnProps & { multiline?: false })
  | (Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "prefix"> &
      InputOwnProps & { multiline: true });

/** Single-line input, or a textarea when `multiline`; optional call-number prefix. */
export function Input(props: InputProps) {
  const {
    size = "md",
    invalid = false,
    multiline = false,
    rows = 4,
    prefix,
    style,
    ...rest
  } = props;

  const css: CSSProperties = {
    ...shell,
    height: multiline
      ? "auto"
      : size === "lg"
        ? "var(--control-height-lg)"
        : size === "sm"
          ? "var(--control-height-sm)"
          : "var(--control-height-md)",
    padding: multiline ? "var(--space-4)" : shell.padding,
    fontSize: size === "sm" ? "var(--size-sm)" : "var(--size-md)",
    borderBottomColor: invalid ? "var(--status-danger)" : "var(--rule-ink)",
    borderBottomWidth: invalid ? "var(--rule-thick)" : "var(--rule-thin)",
    lineHeight: multiline ? "var(--leading-body)" : "normal",
    resize: multiline ? "vertical" : undefined,
    ...style,
  };

  // Inside a prefix shell the control loses its own frame; the shell draws the rules.
  const controlStyle: CSSProperties = prefix
    ? { ...css, border: 0, padding: 0, background: "transparent" }
    : css;

  const el = multiline ? (
    <textarea
      rows={rows}
      style={controlStyle}
      {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  ) : (
    <input
      style={controlStyle}
      {...(rest as InputHTMLAttributes<HTMLInputElement>)}
    />
  );

  if (!prefix) return el;

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        background: "var(--surface-field)",
        border: "var(--rule-thin) solid var(--rule-quiet)",
        borderBottom: "var(--rule-thin) solid var(--rule-ink)",
        padding: "0 var(--space-4)",
      }}
    >
      <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
        {prefix}
      </span>
      {el}
    </span>
  );
}
