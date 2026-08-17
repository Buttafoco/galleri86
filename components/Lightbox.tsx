"use client";

import { useEffect } from "react";
import type { LightboxPayload } from "./EditorContext";

interface LightboxProps {
  item: LightboxPayload;
  hasNav: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ item, hasNav, onClose, onPrev, onNext }: LightboxProps) {
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

  return (
    <>
      <div className="lightbox-back" onClick={onClose} aria-hidden="true" />
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
      <button type="button" className="lb-fig" onClick={onClose} aria-label="Stäng förstoring">
        {item.src && <img src={item.src} alt={item.artist || "Konstverk"} />}
      </button>
      <div className="lb-meta">
        {item.artist && <div className="a">{item.artist}</div>}
        {item.year && <div className="y">{item.year}</div>}
        {item.title && <div className="t">{item.title}</div>}
        {item.shortText && <div className="st">{item.shortText}</div>}
      </div>
    </>
  );
}
