"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import type { ImageItem, ImagePlacementTarget, ItemRef } from "@/lib/types";
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
  /** Keep the image editable without opening the regular lightbox. */
  disableLightbox?: boolean;
  /** Whether the controls edit the on-page frame or the popup/lightbox placement. */
  placementTarget?: ImagePlacementTarget;
  /** Optional label for the edit button in specialized frames. */
  editLabel?: string;
  /** Mark this as the actual LCP candidate on EVERY viewport — triggers next/image's
   * unconditional (non-viewport-aware) preload plus fetchpriority=high. Only use this
   * for an image that's genuinely the largest paint on all breakpoints; when the LCP
   * element differs by viewport, prefer `eager` here and add a manually
   * viewport-scoped `<link rel="preload" media="...">` instead (see app/page.tsx). */
  priority?: boolean;
  /** Load immediately (not lazily) without the unconditional preload/fetchpriority=high
   * that `priority` adds — for an image that's above the fold on some but not all
   * viewports, so it shouldn't compete for top fetch priority everywhere. */
  eager?: boolean;
  /** Responsive `sizes` hint matching this slot's real rendered width, for next/image's srcset. */
  sizes?: string;
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
  disableLightbox = false,
  placementTarget = "frame",
  editLabel = "Redigera bild",
  priority = false,
  eager = false,
  sizes = "100vw",
}: SlotProps) {
  const { mode, openLightbox, openImageEdit, activeImageRef, activePlacementTarget, updateImagePlacement } = useEditor();
  const editing = mode === "edit";
  const active =
    editing &&
    activePlacementTarget === placementTarget &&
    activeImageRef?.store === refItem.store &&
    activeImageRef.key === refItem.key;
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
      image: item,
      refItem,
      group,
      index,
    });

  const popupPlacement = placementTarget === "popup";
  const currentSrc = popupPlacement ? item.popupSrc || item.src : item.src;
  const currentFit = popupPlacement ? item.popupFit ?? "contain" : item.fit;
  const currentPositionX = popupPlacement ? item.popupPositionX ?? 50 : item.positionX ?? 50;
  const currentPositionY = popupPlacement ? item.popupPositionY ?? 50 : item.positionY ?? 50;
  const currentZoom = popupPlacement ? item.popupZoom ?? 100 : item.zoom ?? 100;
  // Explicit base position/inset for next/image's `fill` mode — replicates the
  // `.slot img { top:50%; left:50%; transform:translate(-50%,-50%) }` centering
  // rule from globals.css (which still applies as a fallback outside of these
  // properties) instead of Next's own inset:0 fill defaults, so the pan/zoom
  // transform math below (anchored on that same -50%/-50% centering) keeps working.
  const imageStyle: CSSProperties = {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  };
  if (currentFit) imageStyle.objectFit = currentFit;
  if (popupPlacement || typeof item.positionX === "number" || typeof item.positionY === "number") {
    imageStyle.objectPosition = `${currentPositionX}% ${currentPositionY}%`;
  }
  if (popupPlacement || typeof item.zoom === "number") {
    imageStyle.transform = `translate(-50%, -50%) scale(${currentZoom / 100})`;
  }

  const startMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      positionX: currentPositionX,
      positionY: currentPositionY,
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
      zoom: currentZoom,
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
    const currentX = currentPositionX;
    const currentY = currentPositionY;
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
      {currentSrc ? (
        <Image
          src={currentSrc}
          alt={item.alt || item.artist || "Galleribild"}
          fill
          sizes={sizes}
          quality={75}
          priority={priority}
          loading={priority ? undefined : eager ? "eager" : undefined}
          style={imageStyle}
        />
      ) : (
        <div className="slot-empty" aria-hidden="true" />
      )}

      {showCaption && (item.artist || item.year) && (
        <>
          <div className="cap-grad" aria-hidden="true" />
          <div className="cap">
            <span>{item.artist}</span>
            <span>{item.year}</span>
          </div>
        </>
      )}

      {!active && !disableLightbox && (
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
              placementTarget,
            });
          }}
        >
          {editLabel}
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
