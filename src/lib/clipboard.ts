"use client";

/**
 * Copy text to the clipboard, or say honestly that it could not.
 *
 * The same three-state shape the social kit has used since the profile
 * register shipped (`src/app/social-kit/ProfileRegister.tsx`): access can be
 * blocked by an insecure context or a permission policy, and when it is, the
 * page must offer the text for manual selection rather than flash a "copied"
 * it did not do.
 *
 * That call site is deliberately left as it is. Rewiring a working component
 * to import this would be a refactor nobody asked for; this file exists for
 * the context pack, which copies eleven different things.
 */
export async function copyText(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
