"use client";

import type { ChangeEvent } from "react";
import { type ImageDraft, type SetImageDraftField } from "./types";
import ImageFields from "./ImageFields";

export default function AddImagePanel({
  sectionLabel,
  draft,
  setField,
  onFile,
  uploading,
  onConfirm,
  onClose,
}: {
  sectionLabel: string;
  draft: ImageDraft;
  setField: SetImageDraftField;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <button className="panel-scrim" aria-label="Stäng panel" onClick={onClose} />
      <aside className="panel" role="dialog" aria-modal="true" aria-label={`Lägg till bild – ${sectionLabel}`}>
        <h2>Lägg till bild — {sectionLabel}</h2>

        <div className="panel-preview dashed">
          {draft.src ? <img src={draft.src} alt="Vald bild" /> : <div className="empty">Ingen bild vald ännu</div>}
        </div>

        <label className="file-btn" style={{ opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? "none" : "auto" }}>
          <input type="file" accept="image/*" onChange={onFile} disabled={uploading} style={{ display: "none" }} />
          {uploading ? "Laddar upp …" : "Välj bild"}
        </label>

        <ImageFields draft={draft} setField={setField} idPrefix="add" />

        <button
          type="button"
          className="btn btn--primary btn--block"
          style={{ minHeight: 52, fontSize: 16 }}
          onClick={onConfirm}
          disabled={uploading}
        >
          Lägg till på hemsidan
        </button>
        <button type="button" className="btn--link" onClick={onClose}>
          Avbryt
        </button>
      </aside>
    </>
  );
}
