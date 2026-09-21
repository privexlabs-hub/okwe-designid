import type { Metadata } from "next";
import { Context } from "./Context";

export const metadata: Metadata = {
  title: "Brand context",
  description:
    "Everything Okwe knows about itself as plain Markdown — strategy, voice, the social and content playbooks, the template library, the visual thesis and the publishing gate — ready to paste into any model.",
};

export default function ContextPage() {
  return <Context />;
}
