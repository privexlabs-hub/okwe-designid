import type { Metadata } from "next";
import { readTokens } from "@/lib/tokens";
import { Guidelines } from "./Guidelines";

export const metadata: Metadata = {
  title: "Brand guidelines",
  description:
    "How Okwe looks and sounds — the marks for Okwe, Okwe Knows, Okwe Coms and Okwe Move, the colours and when each is used, type, space, the recurring devices, the voice, and the rules that keep them from drifting.",
};

/*
 * A server page, and a server component under it: the tokens are read from the
 * CSS at build time (src/lib/tokens.ts uses `fs`), so the page can never show a
 * value the stylesheet does not have.
 */
export default function GuidelinesPage() {
  return <Guidelines tokens={readTokens()} />;
}
