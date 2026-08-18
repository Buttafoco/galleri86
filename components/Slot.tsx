"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { ImageItem, ItemRef } from "@/lib/types";
import { useEditor } from "./EditorContext";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
  const { mode, openLightbox, openImageEdit, activeImageRef, updateImagePlacement } = useEditor();
  const editing = mode === "edit";
  const active =
    editing && activeImageRef?.store === refItem.store && activeImageRef.key === refItem.key;
  const slotRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);
  const moveStart = useRef<{ pointerId: number; x: number; y: number; positionX: number; positionY: number } | null>(null);
  const zoomStart = useRef<{ pointerId: number; x: number; y: number; zoom: number } | null>(null);

  useEffect(() => {
    if (!editing || !slotRef.current) {
      setFrameSize(null);
      return;
    }

    const frame = slotRef.current;
    const measure = () => {
      const rect = frame.getBoundingClientRect();
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      setFrameSize((current) =>
        current?.width === next.width && current.height === next.height ? current : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [editing]);

  const classes = ["slot", extraClass];
  if (!editing) {
    classes.push("zoomable", "reveal", "reveal-s");
    if (revealDelay) classes.push(`reveal-d${revealDelay}`);
  } else {
    classes.push("editable");
    if (active) classes.push("is-direct-editing");
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

  const imageStyle: CSSProperties = {};
  if (item.fit) imageStyle.objectFit = item.fit;
  if (typeof item.positionX === "number" || typeof item.positionY === "number") {
    imageStyle.objectPosition = `${item.positionX ?? 50}% ${item.positionY ?? 50}%`;
  }
  if (typeof item.zoom === "number") {
    imageStyle.transform = `translate(-50%, -50%) scale(${item.zoom / 100})`;
  }

  const startMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      positionX: item.positionX ?? 50,
      positionY: item.positionY ?? 50,
    };
    updateImagePlacement({ fit: "cover" });
  };

  const moveImage = (event: PointerEvent<HTMLDivElement>) => {
    const start = moveStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const frame = event.currentTarget.getBoundingClientRect();
    updateImagePlacement({
      positionX: Math.round(clamp(start.positionX - ((event.clientX - start.x) / frame.width) * 100, 0, 100)),
      positionY: Math.round(clamp(start.positionY - ((event.clientY - start.y) / frame.height) * 100, 0, 100)),
    });
  };

  const stopMove = (event: PointerEvent<HTMLDivElement>) => {
    if (moveStart.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    moveStart.current = null;
  };

  const startZoom = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    zoomStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      zoom: item.zoom ?? 100,
    };
    updateImagePlacement({ fit: "cover" });
  };

  const zoomImage = (event: PointerEvent<HTMLButtonElement>) => {
    const start = zoomStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const delta = (event.clientX - start.x + event.clientY - start.y) / 2;
    updateImagePlacement({ zoom: Math.round(clamp(start.zoom + delta * 0.6, 100, 250)) });
  };

  const stopZoom = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (zoomStart.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    zoomStart.current = null;
  };

  const moveWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    const currentX = item.positionX ?? 50;
    const currentY = item.positionY ?? 50;
    const positions: Record<string, { positionX?: number; positionY?: number }> = {
      ArrowLeft: { positionX: clamp(currentX - step, 0, 100) },
      ArrowRight: { positionX: clamp(currentX + step, 0, 100) },
      ArrowUp: { positionY: clamp(currentY - step, 0, 100) },
      ArrowDown: { positionY: clamp(currentY + step, 0, 100) },
    };
    const patch = positions[event.key];
    if (!patch) return;
    event.preventDefault();
    updateImagePlacement({ fit: "cover", ...patch });
  };

  return (
    <div ref={slotRef} className={classes.join(" ").trim()} style={style}>
      {item.src ? (
        <img src={item.src} alt={item.alt || item.artist || "Galleribild"} loading="lazy" style={imageStyle} />
      ) : (
        <div className="slot-empty" aria-hidden="true" />
      )}

      {showCaption && (item.artist || item.year) && (
        <div className="cap">
          <span>{item.artist}</span>
          <span>{item.year}</span>
        </div>
      )}

      {!active && (
        <button
          type="button"
          className="slot-open"
          aria-label={item.artist ? `Öppna bild: ${item.artist}` : "Öppna bild"}
          onClick={open}
        />
      )}

      {editing && !active && (
        <button
          type="button"
          className="slot-edit"
          onClick={(e) => {
            e.stopPropagation();
            const frame = e.currentTarget.parentElement?.getBoundingClientRect();
            openImageEdit(refItem, {
              aspectRatio: frame && frame.height > 0 ? frame.width / frame.height : 16 / 9,
              showCaption,
            });
          }}
        >
          Redigera bild
        </button>
      )}

      {active && (
        <div
          className="slot-direct-editor"
          role="group"
          tabIndex={0}
          aria-label="Placera bilden. Dra bilden eller använd piltangenterna. Dra hörnet för att zooma."
          onPointerDown={startMove}
          onPointerMove={moveImage}
          onPointerUp={stopMove}
          onPointerCancel={stopMove}
          onKeyDown={moveWithKeyboard}
        >
          <span className="slot-direct-editor__hint">Dra bilden för att placera</span>
          <button
            type="button"
            className="slot-zoom-handle"
            aria-label="Dra inåt eller utåt för att ändra bildens storlek"
            onPointerDown={startZoom}
            onPointerMove={zoomImage}
            onPointerUp={stopZoom}
            onPointerCancel={stopZoom}
            onClick={(event) => event.stopPropagation()}
          >
            ↘
          </button>
        </div>
      )}

      {editing && item.hidden && <span className="slot-hidden-badge">Dold från hemsidan</span>}
      {editing && frameSize && (
        <span className="slot-size-badge" aria-label={`Ramstorlek ${frameSize.width} gånger ${frameSize.height} pixlar`}>
          {frameSize.width} × {frameSize.height} px
        </span>
      )}
    </div>
  );
}
