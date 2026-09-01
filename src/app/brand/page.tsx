import type { Metadata } from "next";
import { Brand } from "./Brand";

export const metadata: Metadata = {
  title: "Brand assets",
  description:
    "Every mark for the four arms of the Okwe ecosystem — vector masters, app icons, watermarks and the share card — with the rule that governs how they are used.",
};

export default function BrandPage() {
  return <Brand />;
}
