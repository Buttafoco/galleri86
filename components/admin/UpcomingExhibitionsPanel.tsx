"use client";

import type { UpcomingExhibition } from "@/lib/types";

/** "19/8 - 24/8" -> { from: "19/8", to: "24/8" }. Free text with no " - "
 * (older entries like "Vår 2027") lands entirely in `from` so nothing is lost. */
function splitDateRange(date: string): { from: string; to: string } {
  const idx = date.indexOf(" - ");
  if (idx === -1) return { from: date, to: "" };
  return { from: date.slice(0, idx), to: date.slice(idx + 3) };
}

function joinDateRange(from: string, to: string): string {
  return to ? `${from} - ${to}` : from;
}

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
        <p className="panel-intro">Ändra konstnär och datum, eller lägg till fler utställningar.</p>

        {items.map((item, index) => {
          const { from, to } = splitDateRange(item.date);
          return (
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
              <div className="upcoming-date-range">
                <div>
                  <label className="field-label" htmlFor={`upcoming-date-from-${item.key}`}>
                    Från datum
                  </label>
                  <input
                    id={`upcoming-date-from-${item.key}`}
                    type="date"
                    value={from}
                    onChange={(event) => onField(item.key, "date", joinDateRange(event.target.value, to))}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor={`upcoming-date-to-${item.key}`}>
                    Till datum (valfritt)
                  </label>
                  <input
                    id={`upcoming-date-to-${item.key}`}
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => onField(item.key, "date", joinDateRange(from, event.target.value))}
                  />
                </div>
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
          );
        })}

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
