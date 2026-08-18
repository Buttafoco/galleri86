"use client";

import { type ImageDraft, type SetImageDraftField, SHORT_TEXT_MAX } from "./types";

export default function ImageFields({
  draft,
  setField,
  idPrefix,
}: {
  draft: ImageDraft;
  setField: SetImageDraftField;
  idPrefix: string;
}) {
  const count = draft.shortText.length;
  return (
    <>
      <div>
        <label className="field-label" htmlFor={`${idPrefix}-artist`}>
          Konstnär
        </label>
        <input
          id={`${idPrefix}-artist`}
          type="text"
          value={draft.artist}
          placeholder="Konstnärens namn"
          onChange={(e) => setField("artist", e.target.value)}
        />
      </div>

      <div>
        <label className="field-label" htmlFor={`${idPrefix}-title`}>
          Verkets titel <span className="opt">(valfritt)</span>
        </label>
        <input
          id={`${idPrefix}-title`}
          type="text"
          value={draft.title}
          placeholder="T.ex. Dissonans"
          onChange={(e) => setField("title", e.target.value)}
        />
      </div>

      <div>
        <label className="field-label" htmlFor={`${idPrefix}-year`}>
          År <span className="opt">(valfritt)</span>
        </label>
        <input
          id={`${idPrefix}-year`}
          className="year"
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={draft.year}
          placeholder="T.ex. 2026"
          onChange={(e) => setField("year", e.target.value.slice(0, 4))}
        />
      </div>

      <div>
        <label className="field-label" htmlFor={`${idPrefix}-short`}>
          Kort text på bilden <span className="opt">(valfritt)</span>
        </label>
        <textarea
          id={`${idPrefix}-short`}
          rows={3}
          maxLength={SHORT_TEXT_MAX}
          value={draft.shortText}
          onChange={(e) => setField("shortText", e.target.value.slice(0, SHORT_TEXT_MAX))}
        />
        <div className="hint">Visas när en besökare håller över eller öppnar bilden.</div>
        <div className={`counter${count >= SHORT_TEXT_MAX ? " over" : ""}`}>
          {count} av {SHORT_TEXT_MAX} tecken
        </div>
      </div>
    </>
  );
}
