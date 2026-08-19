import type { CSSProperties, HTMLAttributes } from "react";
import { SEEDS, seedGap, seedRing } from "../../brand/geometry";

export interface SeedsProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  size?: number;
  gap?: number;
  filled?: number;
  total?: number;
  color?: string;
  fill?: string;
  style?: CSSProperties;
}

/**
 * The seed row: six counters from the okwe board, three sown (filled), three open.
 * Circles are reserved for this mark (and the radio dot); data tallies stay square.
 */
export function Seeds({
  size = 10,
  gap,
  filled = SEEDS.filled,
  total = SEEDS.total,
  color = "currentColor",
  fill,
  style,
  ...rest
}: SeedsProps) {
  const g = gap === undefined ? seedGap(size) : gap;
  const ring = seedRing(size);
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", gap: g, ...style }} {...rest}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            flex: "none",
            display: "block",
            background: i < filled ? fill || color : "transparent",
            boxShadow: i < filled ? "none" : `inset 0 0 0 ${ring}px ${color}`,
          }}
        />
      ))}
    </span>
  );
}
