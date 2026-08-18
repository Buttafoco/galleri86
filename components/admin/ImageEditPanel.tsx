"use client";

import type { CSSProperties, ChangeEvent } from "react";
import type { ImageEditPreview } from "@/components/EditorContext";
import { type ImageDraft, type SetImageDraftField } from "./types";
import ImageFields from "./ImageFields";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export default function ImageEditPanel({
  draft,
  setField,
  onFile,
  uploading,
  preview,
  isList,
  hidden,
  onMoveUp,
  onMoveDown,
  onToggleHide,
  onAskDelete,
  onSave,
  onClose,
}: {
  draft: ImageDraft;
  setField: SetImageDraftField;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  preview: ImageEditPreview;
  isList: boolean;
  hidden: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleHide: () => void;
  onAskDelete: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const artistLine = draft.title ? `${draft.artist} — ${draft.title}` : draft.artist || "Konstnär";
  const safeAspectRatio = clamp(Number.isFinite(preview.aspectRatio) ? preview.aspectRatio : 16 / 9, 0.75, 2.4);
  const placementStyle: CSSProperties = {
    objectFit: draft.fit,
    objectPosition: `${draft.positionX}% ${draft.positionY}%`,
    transform: `scale(${draft.zoom / 100})`,
  };

  const fitFrame = () => {
    setField("fit", "cover");
    setField("zoom", 100);
    setField("positionX", 50);
    setField("positionY", 50);
  };

  const showWholeImage = () => {
    setField("fit", "contain");
    setField("zoom", 100);
    setField("positionX", 50);
    setField("positionY", 50);
  };

  return (
    <>
      <div className="panel-scrim panel-scrim--preview" aria-hidden="true" />
      <aside className="panel" role="dialog" aria-label="Redigera bild">
        <h2>Redigera bild</h2>

        <p className="panel-intro">
          Redigera direkt i den orange ramen: dra bilden för placering och dra hörnet inåt eller utåt för storlek.
        </p>

        <label className="file-btn" style={{ opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? "none" : "auto" }}>
          <input type="file" accept="image/*" onChange={onFile} disabled={uploading} style={{ display: "none" }} />
          {uploading ? "Laddar upp …" : "Byt bild"}
        </label>

        <div className="placement-controls">
          <h3>Bildanpassning i ramen</h3>

          <div className="placement-actions">
            <button type="button" className="btn btn--primary" onClick={fitFrame}>
              Fyll ramen automatiskt
            </button>
            <button type="button" className="btn btn--outline" onClick={showWholeImage}>
              Visa hela bilden
            </button>
          </div>

          <div>
            <div className="placement-label-row">
              <label className="field-label" htmlFor="edit-zoom">Zoom</label>
              <output htmlFor="edit-zoom">{draft.zoom} %</output>
            </div>
            <input
              id="edit-zoom"
              type="range"
              min="100"
              max="250"
              step="1"
              value={draft.zoom}
              onChange={(event) => setField("zoom", Number(event.target.value))}
            />
          </div>

          <button
            type="button"
            className="btn--link"
            onClick={fitFrame}
          >
            Återställ bildplaceringen
          </button>
        </div>

        <ImageFields draft={draft} setField={setField} idPrefix="edit" />

        {preview.showCaption && (
          <div>
            <div className="field-label">Förhandsvisning med bildtext</div>
            <div className="panel-caption-preview" style={{ aspectRatio: String(safeAspectRatio), height: "auto" }}>
              {draft.src ? <img src={draft.src} alt="" style={placementStyle} /> : <div className="empty">Nuvarande bild</div>}
              <div className="grad" />
              <div className="meta">
                <div className="row">
                  <div className="a">{artistLine}</div>
                  <div className="y">{draft.year}</div>
                </div>
                {draft.shortText && <div className="st">{draft.shortText}</div>}
              </div>
            </div>
          </div>
        )}

        {isList && (
          <div className="row-2">
            <button type="button" className="btn btn--outline" onClick={onMoveUp}>
              Flytta upp
            </button>
            <button type="button" className="btn btn--outline" onClick={onMoveDown}>
              Flytta ner
            </button>
          </div>
        )}

        <button type="button" className="btn btn--outline btn--block" onClick={onToggleHide}>
          {hidden ? "Visa på hemsidan" : "Dölj från hemsidan"}
        </button>
        <button type="button" className="btn btn--danger-outline btn--block" onClick={onAskDelete}>
          Ta bort bild
        </button>

        <div className="row-2" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="btn btn--primary"
            style={{ minHeight: 52, fontSize: 16 }}
            onClick={onSave}
            disabled={uploading}
          >
            Spara ändringar
          </button>
        </div>
        <button type="button" className="btn--link" onClick={onClose}>
          Avbryt
        </button>
      </aside>
    </>
  );
}
