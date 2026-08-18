"use client";

import type { ReactNode } from "react";
import type { TextKey } from "@/lib/types";
import { useEditor } from "./EditorContext";

/**
 * Wraps an editable text block. In edit mode it becomes a keyboard-accessible
 * control that opens the text side panel; otherwise it renders its children as-is.
 */
export default function EditText({
  textKey,
  children,
  style,
}: {
  textKey: TextKey;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  const { mode, openTextEdit } = useEditor();
  if (mode !== "edit") return <>{children}</>;

  return (
    <div
      className="edit-text"
      role="button"
      tabIndex={0}
      aria-label="Redigera text"
      style={style}
      onClick={() => openTextEdit(textKey)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTextEdit(textKey);
        }
      }}
    >
      {children}
    </div>
  );
}
