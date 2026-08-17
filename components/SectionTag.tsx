"use client";

import { useEditor } from "./EditorContext";

/** Small "Sektion: …" pill shown only in edit mode. */
export default function SectionTag({ label, onDark = false }: { label: string; onDark?: boolean }) {
  const { mode } = useEditor();
  if (mode !== "edit") return null;
  return <div className={`section-tag${onDark ? " on-dark" : ""}`}>Sektion: {label}</div>;
}
