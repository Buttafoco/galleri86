"use client";

import type { ChangeEvent } from "react";
import { type ImageDraft } from "./types";
import ImageFields from "./ImageFields";

export default function AddImagePanel({
  sectionLabel,
  draft,
  setField,
  onFile,
  onConfirm,
  onClose,
}: {
  sectionLabel: string;
  draft: ImageDraft;
  setField: (field: keyof ImageDraft, value: string) => void;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
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

        <label className="file-btn">
          <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          Välj bild
        </label>

        <ImageFields draft={draft} setField={setField} idPrefix="add" />

        <button
          type="button"
          className="btn btn--primary btn--block"
          style={{ minHeight: 52, fontSize: 16 }}
          onClick={onConfirm}
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
