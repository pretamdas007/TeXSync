"use client";

import { EditorLayout } from "@/components/editor/editor-layout";
import { LaTeXEditor } from "@/components/editor/latex-editor";

export default function EditorPage() {
  return (
    <EditorLayout>
      <LaTeXEditor />
    </EditorLayout>
  );
}