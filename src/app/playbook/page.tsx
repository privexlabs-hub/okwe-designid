import type { Metadata } from "next";
import { Playbook } from "./Playbook";
import "./doc.css";

export const metadata: Metadata = {
  title: "Brand playbook",
  description:
    "How Okwe looks, sounds and decides — brand strategy, voice and writing, the social and content playbooks, the template library and the visual thesis.",
};

export default function PlaybookPage() {
  return <Playbook />;
}
