import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface DefinitionCardProps extends HTMLAttributes<HTMLDivElement> {
  term?: ReactNode;
  pronunciation?: ReactNode;
  definition?: ReactNode;
  alsoKnownAs?: ReactNode;
  notThis?: ReactNode;
  callNumber?: ReactNode;
  style?: CSSProperties;
}

/** Dictionary-style entry: term, pronunciation, definition, and what it is not. */
export function DefinitionCard({
  term,
  pronunciation,
  definition,
  alsoKnownAs,
  notThis,
  callNumber,
  style,
  ...rest
}: DefinitionCardProps) {
  return (
    <div
      style={{
        borderTop: "var(--rule-thick) solid var(--rule-ink)",
        paddingTop: "var(--space-4)",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr)",
        gap: "var(--space-4)",
        ...style,
      }}
      {...rest}
    >
      {callNumber && (
        <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
          {callNumber}
        </span>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            font: "var(--type-h1)",
            fontSize: "var(--size-2xl)",
            fontStretch: "var(--stretch-display)",
            letterSpacing: "var(--tracking-heading)",
            color: "var(--text-primary)",
          }}
        >
          {term}
        </h3>
        {pronunciation && (
          <span className="okwe-call" style={{ color: "var(--text-quiet)" }}>
            {pronunciation}
          </span>
        )}
      </div>
      <p
        style={{
          font: "var(--type-body)",
          color: "var(--text-body)",
          maxWidth: "var(--measure-body)",
        }}
      >
        {definition}
      </p>
      <dl
        style={{
          margin: 0,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: "var(--space-5)",
          rowGap: "var(--space-2)",
          alignItems: "baseline",
        }}
      >
        {alsoKnownAs && (
          <>
            <dt className="okwe-label" style={{ color: "var(--text-muted)" }}>
              Also
            </dt>
            <dd
              style={{
                margin: 0,
                font: "var(--type-body-sm)",
                color: "var(--text-secondary)",
              }}
            >
              {alsoKnownAs}
            </dd>
          </>
        )}
        {notThis && (
          <>
            <dt className="okwe-label" style={{ color: "var(--class-opinion)" }}>
              Not
            </dt>
            <dd
              style={{
                margin: 0,
                font: "var(--type-body-sm)",
                color: "var(--text-secondary)",
              }}
            >
              {notThis}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
