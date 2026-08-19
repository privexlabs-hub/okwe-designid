"use client";

import { useEffect, useState } from "react";
import { Button } from "@/design-system/components/core/Button";

export const PLATE_KEY = "okwe:content-proofs:plate";

/**
 * Plate mode: the cyanotype negative, defined in tokens as [data-theme="plate"].
 * The attribute is set on <html> so the inline boot script in page.tsx can apply
 * it before first paint; this component only keeps it in sync and cleans it up
 * when the route unmounts, so the setting does not leak to the rest of the app.
 */
export function PlateSwitch() {
  const [plate, setPlate] = useState(false);

  useEffect(() => {
    setPlate(document.documentElement.getAttribute("data-theme") === "plate");
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  function toggle() {
    const next = !plate;
    setPlate(next);
    if (next) document.documentElement.setAttribute("data-theme", "plate");
    else document.documentElement.removeAttribute("data-theme");
    try {
      window.localStorage.setItem(PLATE_KEY, next ? "1" : "0");
    } catch {
      /* private mode — the switch still works for this session */
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-pressed={plate}
      style={{
        fontFamily: "var(--font-mono)",
        fontStretch: "var(--stretch-mono)",
        letterSpacing: "var(--tracking-call)",
        textTransform: "uppercase",
      }}
    >
      Plate mode · {plate ? "on" : "off"}
    </Button>
  );
}
