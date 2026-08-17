"use client";

import type { CSSProperties } from "react";
import type { ImageItem, ItemRef } from "@/lib/types";
import { useEditor } from "./EditorContext";

interface SlotProps {
  item: ImageItem;
  /** Which store/key this image belongs to (needed for editing). */
  refItem: ItemRef;
  /** Extra slot modifier class, e.g. "slot--wide" or "slot--current". */
  extraClass?: string;
  style?: CSSProperties;
  /** Reveal-on-scroll stagger (0–5). Only applied outside edit mode. */
  revealDelay?: number;
  /** Show the hover caption overlay (artist + year). */
  showCaption?: boolean;
  /** Lightbox prev/next group. */
  group?: "hero" | "artist" | null;
  index?: number;
}

export default function Slot({
  item,
  refItem,
  extraClass = "",
  style,
  revealDelay = 0,
  showCaption = false,
  group = null,
  index,
}: SlotProps) {
  const { mode, openLightbox, openImageEdit } = useEditor();
  const editing = mode === "edit";

  const classes = ["slot", extraClass];
  if (!editing) {
    classes.push("zoomable", "reveal", "reveal-s");
    if (revealDelay) classes.push(`reveal-d${revealDelay}`);
  } else {
    classes.push("editable");
    if (item.hidden) classes.push("is-hidden");
  }

  const open = () =>
    openLightbox({
      src: item.src,
      artist: item.artist,
      year: item.year,
      title: item.title,
      shortText: item.shortText,
      group,
      index,
    });

  return (
    <div className={classes.join(" ").trim()} style={style}>
      {item.src ? (
        <img src={item.src} alt={item.alt || item.artist || "Galleribild"} loading="lazy" />
      ) : (
        <div className="slot-empty" aria-hidden="true" />
      )}

      {showCaption && (item.artist || item.year) && (
        <div className="cap">
          <span>{item.artist}</span>
          <span>{item.year}</span>
        </div>
      )}

      <button
        type="button"
        className="slot-open"
        aria-label={item.artist ? `Öppna bild: ${item.artist}` : "Öppna bild"}
        onClick={open}
      />

      {editing && (
        <button
          type="button"
          className="slot-edit"
          onClick={(e) => {
            e.stopPropagation();
            openImageEdit(refItem);
          }}
        >
          Redigera bild
        </button>
      )}

      {editing && item.hidden && <span className="slot-hidden-badge">Dold från hemsidan</span>}
    </div>
  );
}
