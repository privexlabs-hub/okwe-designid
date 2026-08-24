import type { Metadata } from "next";
import { Register } from "./Register";

export const metadata: Metadata = {
  title: "Question register",
  description:
    "Every question from a comment, DM, workshop or conversation — where it came from, when it arrived, how often it has appeared, and whether we can answer it with evidence.",
};

export default function RegisterPage() {
  return <Register />;
}
