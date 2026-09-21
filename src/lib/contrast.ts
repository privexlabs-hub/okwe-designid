/**
 * WCAG 2.1 contrast ratio between two opaque colours.
 *
 * Arithmetic, not judgement: relative luminance per WCAG 2.1 §1.4.3, then
 * (lighter + 0.05) / (darker + 0.05). Black on white is 21:1.
 *
 * Used by the brand guidelines to show what each colour can and cannot carry.
 * It is also how the page found that the playbook's "cyanotype-800 on
 * chalk-100 = 13.9:1" is an arithmetic slip — the pair measures 12.2:1.
 */

/** WCAG 2.1 AA: 4.5:1 for body text; 3:1 for large text and UI components. */
export const AA = { text: 4.5, large: 3 } as const;

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

function luminance(hex: string): number {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) throw new Error(`contrast: "${hex}" is not an opaque #RRGGBB colour`);
  const [r, g, b] = m.slice(1).map((h) => channel(parseInt(h, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

/** The ratio, or null when either colour is not an opaque hex (an rgba rule, say). */
export function contrast(a: string, b: string): number | null {
  if (!isHex(a) || !isHex(b)) return null;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** "12.2:1", or "—" when there is no ratio to give. */
export const ratioLabel = (r: number | null) => (r === null ? "—" : `${r.toFixed(1)}:1`);

/** What a pair may carry: body text, large text and UI only, or nothing. */
export function grade(r: number | null): "AA" | "Large" | "Fail" | "—" {
  if (r === null) return "—";
  if (r >= AA.text) return "AA";
  if (r >= AA.large) return "Large";
  return "Fail";
}
