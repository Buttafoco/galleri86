"use client";

import type { UpcomingExhibition } from "@/lib/types";

export default function UpcomingExhibitionsPanel({
  items,
  onField,
  onAdd,
  onRemove,
  onSave,
  onCancel,
}: {
  items: UpcomingExhibition[];
  onField: (key: string, field: "name" | "date", value: string) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <button className="panel-scrim" aria-label="Stäng panel" onClick={onCancel} />
      <aside className="panel" role="dialog" aria-modal="true" aria-label="Redigera kommande utställningar">
        <h2>Kommande utställningar</h2>
        <p className="panel-intro">Ändra konstnär och period, eller lägg till fler utställningar.</p>

        {items.map((item, index) => (
          <div className="upcoming-editor-row" key={item.key}>
            <div>
              <label className="field-label" htmlFor={`upcoming-name-${item.key}`}>
                Konstnär
              </label>
              <input
                id={`upcoming-name-${item.key}`}
                type="text"
                value={item.name}
                placeholder="Konstnärens namn"
                onChange={(event) => onField(item.key, "name", event.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor={`upcoming-date-${item.key}`}>
                Period eller datum
              </label>
              <input
                id={`upcoming-date-${item.key}`}
                type="text"
                value={item.date}
                placeholder="Till exempel Vår 2027"
                onChange={(event) => onField(item.key, "date", event.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn--link upcoming-remove"
              onClick={() => onRemove(item.key)}
              aria-label={`Ta bort utställning ${index + 1}`}
            >
              Ta bort
            </button>
          </div>
        ))}

        {items.length === 0 && <p className="upcoming-empty">Inga kommande utställningar är inlagda.</p>}

        <button type="button" className="btn btn--outline btn--block" onClick={onAdd}>
          + Lägg till utställning
        </button>

        <div className="row-2" style={{ marginTop: 8 }}>
          <button type="button" className="btn btn--primary" style={{ minHeight: 52, fontSize: 16 }} onClick={onSave}>
            Spara listan
          </button>
        </div>
        <button type="button" className="btn--link" onClick={onCancel}>
          Avbryt
        </button>
      </aside>
    </>
  );
}
