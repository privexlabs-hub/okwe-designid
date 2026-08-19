"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  onClose?: () => void;
  footer?: ReactNode;
  width?: string;
  callNumber?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Modal dialog with a call-number header band and an optional footer band. */
export function Dialog({
  open = true,
  title,
  description,
  onClose,
  footer,
  width = "620px",
  callNumber,
  children,
  style,
  ...rest
}: DialogProps) {
  if (!open) return null;
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--overlay-scrim)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "var(--space-11) var(--space-8)",
        zIndex: 60,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          background: "var(--surface-field)",
          border: "var(--frame-ink)",
          borderRadius: 0,
          boxShadow: "var(--shadow-dialog)",
          display: "flex",
          flexDirection: "column",
          ...style,
        }}
        {...rest}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--space-5)",
            padding: "var(--space-4) var(--space-6)",
            borderBottom: "var(--rule-thin) solid var(--rule-ink)",
            background: "var(--surface-inset)",
          }}
        >
          <span className="okwe-call">{callNumber || "OKW · DIALOG"}</span>
          {onClose && (
            <button
              aria-label="Close"
              onClick={onClose}
              style={{
                background: "none",
                border: 0,
                cursor: "pointer",
                font: "var(--type-label)",
                fontStretch: "var(--stretch-mono)",
                letterSpacing: "var(--tracking-label)",
                color: "var(--text-primary)",
              }}
            >
              {"CLOSE ×"}
            </button>
          )}
        </div>
        <div
          style={{
            padding: "var(--space-7) var(--space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          {title && (
            <h3
              style={{
                font: "var(--type-h2)",
                fontStretch: "var(--stretch-display)",
                letterSpacing: "var(--tracking-heading)",
              }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              style={{
                font: "var(--type-body-sm)",
                color: "var(--text-secondary)",
                maxWidth: "var(--measure-narrow)",
              }}
            >
              {description}
            </p>
          )}
          {children}
        </div>
        {footer && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-4)",
              padding: "var(--space-5) var(--space-6)",
              borderTop: "var(--rule-thin) solid var(--rule-ink)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
