"use client";

import { useEffect, type CSSProperties } from "react";
import { useEditor, type LightboxPayload } from "./EditorContext";
import Slot from "./Slot";

interface LightboxProps {
  item: LightboxPayload;
  hasNav: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ item, hasNav, onClose, onPrev, onNext }: LightboxProps) {
  const { mode } = useEditor();
  const editing = mode === "edit";
  const { image, refItem } = item;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && hasNav) onPrev();
      else if (e.key === "ArrowRight" && hasNav) onNext();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [hasNav, onClose, onPrev, onNext]);

  const imageStyle: CSSProperties = {
    objectFit: image.popupFit ?? "contain",
    objectPosition: `${image.popupPositionX ?? 50}% ${image.popupPositionY ?? 50}%`,
    transform: `scale(${(image.popupZoom ?? 100) / 100})`,
  };

  return (
    <>
      <div className="lightbox-back" onClick={onClose} aria-hidden="true" />
      {!editing && (
        <button type="button" className="lb-close" aria-label="Stäng förstoring" onClick={onClose}>
          <span className="lb-close__bar" aria-hidden="true" />
          <span className="lb-close__bar" aria-hidden="true" />
        </button>
      )}
      {hasNav && (
        <button type="button" className="lb-nav prev" aria-label="Föregående bild" onClick={onPrev}>
          ‹
        </button>
      )}
      {hasNav && (
        <button type="button" className="lb-nav next" aria-label="Nästa bild" onClick={onNext}>
          ›
        </button>
      )}
      {editing ? (
        <div className="lb-fig lb-fig--editing" role="dialog" aria-label="Anpassa bild i popup">
          <Slot
            item={image}
            refItem={refItem}
            extraClass="lb-popup-slot"
            style={{ position: "absolute", inset: 0 }}
            placementTarget="popup"
            editLabel="Anpassa popupbild"
            disableLightbox
          />
          <button type="button" className="lb-edit-close" aria-label="Stäng popup" onClick={onClose}>
            ×
          </button>
        </div>
      ) : (
        <div className="lb-fig" onClick={onClose}>
          {image.src && <img src={image.src} alt={image.artist || "Konstverk"} style={imageStyle} />}
        </div>
      )}
      <div className="lb-meta">
        {image.artist && <div className="a">{image.artist}</div>}
        {image.year && <div className="y">{image.year}</div>}
        {image.title && <div className="t">{image.title}</div>}
        {image.shortText && <div className="st">{image.shortText}</div>}
      </div>
    </>
  );
}
