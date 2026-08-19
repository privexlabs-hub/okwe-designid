import type { Metadata } from "next";
import { Carousel } from "./Carousel";

export const metadata: Metadata = {
  title: "Carousel template",
  description:
    "The standard six-part carousel set — cover, problem, framework, comparison, conclusion, CTA — at 1080×1350.",
};

export default function CarouselPage() {
  return <Carousel />;
}
