import type { Metadata } from "next";
import { Editor } from "./Editor";

export const metadata: Metadata = { title: "Post editor" };

export default function PostEditorPage() {
  return <Editor />;
}
