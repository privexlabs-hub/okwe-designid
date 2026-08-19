/**
 * Anchor id for a proof section.
 *
 * Lives in its own module because both the server page (which renders the
 * `id`) and the client jump list (which scrolls to it) need it, and a
 * "use client" module cannot hand a plain function back to the server.
 */
export function proofId(n: number): string {
  return `proof-${String(n).padStart(2, "0")}`;
}
