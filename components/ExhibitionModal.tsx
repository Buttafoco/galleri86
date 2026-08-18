"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { ImageItem } from "@/lib/types";
import { useEditor } from "./EditorContext";
import Slot from "./Slot";

interface ExhibitionModalProps {
  image: ImageItem;
  title: string;
  artist: string;
  dateLabel: string;
  description: string;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ExhibitionModal({
  image,
  title,
  artist,
  dateLabel,
  description,
  onClose,
}: ExhibitionModalProps) {
  const { mode } = useEditor();
  const editing = mode === "edit";
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const imageStyle: CSSProperties = {
    objectFit: image.fit ?? "contain",
    objectPosition: `${image.positionX ?? 50}% ${image.positionY ?? 50}%`,
    transform: `scale(${(image.zoom ?? 100) / 100})`,
  };

  return (
    <div className="exhibit-modal-scrim" onClick={onClose}>
      <div
        ref={dialogRef}
        className="exhibit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exhibit-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" ref={closeRef} className="exhibit-modal-close" aria-label="Stäng" onClick={onClose}>
          ×
        </button>
        <div className={`exhibit-modal-img${editing ? " exhibit-modal-img--editable" : ""}`}>
          {editing ? (
            <Slot
              item={image}
              refItem={{ store: "images", key: "curPopupImg" }}
              extraClass="exhibit-modal-popup-slot"
              style={{ position: "absolute", inset: 0 }}
              disableLightbox
            />
          ) : image.src ? (
            <img src={image.src} alt={image.alt || artist || "Utställningsbild"} style={imageStyle} />
          ) : (
            <div className="slot-empty" aria-hidden="true" />
          )}
        </div>
        <div className="exhibit-modal-body">
          <div className="exhibit-modal-eyebrow">Nästa utställning</div>
          <h2 id="exhibit-modal-title" className="serif ital exhibit-modal-title">
            {title}
          </h2>
          <div className="exhibit-modal-artist">{artist}</div>
          <div className="exhibit-modal-date">{dateLabel}</div>
          <p className="exhibit-modal-desc">{description}</p>
        </div>
      </div>
    </div>
  );
}
