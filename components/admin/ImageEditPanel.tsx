"use client";

import type { ChangeEvent } from "react";
import { type ImageDraft } from "./types";
import ImageFields from "./ImageFields";

export default function ImageEditPanel({
  draft,
  setField,
  onFile,
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
  setField: (field: keyof ImageDraft, value: string) => void;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
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

  return (
    <>
      <button className="panel-scrim" aria-label="Stäng panel" onClick={onClose} />
      <aside className="panel" role="dialog" aria-modal="true" aria-label="Redigera bild">
        <h2>Redigera bild</h2>

        <div className="panel-preview">
          {draft.src ? <img src={draft.src} alt="Nuvarande bild" /> : <div className="empty">Nuvarande bild</div>}
        </div>

        <label className="file-btn">
          <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          Byt bild
        </label>

        <ImageFields draft={draft} setField={setField} idPrefix="edit" />

        <div>
          <div className="field-label">Förhandsvisning</div>
          <div className="panel-caption-preview">
            {draft.src ? <img src={draft.src} alt="" /> : <div className="empty">Nuvarande bild</div>}
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
          <button type="button" className="btn btn--primary" style={{ minHeight: 52, fontSize: 16 }} onClick={onSave}>
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
