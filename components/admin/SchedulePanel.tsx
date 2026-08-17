"use client";

import type { ScheduleDay } from "@/lib/types";
import { ACTIVITY_MAX } from "@/lib/schedule";

export default function SchedulePanel({
  days,
  errors,
  onField,
  onSave,
  onCancel,
}: {
  days: ScheduleDay[];
  errors: Record<string, string>;
  onField: (day: string, patch: Partial<ScheduleDay>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <button className="panel-scrim" aria-label="Stäng panel" onClick={onCancel} />
      <aside className="panel" role="dialog" aria-modal="true" aria-label="Redigera veckans schema">
        <h2>Redigera veckans schema</h2>

        {days.map((d) => {
          const count = d.description.length;
          const err = errors[d.day];
          return (
            <div key={d.day} className={`sched-day${err ? " has-error" : ""}`}>
              <div className="sched-day__label">{d.label}</div>

              <div>
                <label className="field-label" htmlFor={`act-${d.day}`}>
                  Aktivitet eller information
                </label>
                <input
                  id={`act-${d.day}`}
                  type="text"
                  maxLength={ACTIVITY_MAX}
                  value={d.description}
                  onChange={(e) => onField(d.day, { description: e.target.value.slice(0, ACTIVITY_MAX) })}
                />
                <div className={`counter${count >= ACTIVITY_MAX ? " over" : ""}`}>
                  {count} av {ACTIVITY_MAX} tecken
                </div>
              </div>

              <label className="sched-check">
                <input
                  type="checkbox"
                  checked={d.closed}
                  onChange={(e) => onField(d.day, { closed: e.target.checked })}
                />
                Stängt för besökare
              </label>

              {!d.closed && (
                <div className="sched-times">
                  <div>
                    <label className="field-label" htmlFor={`open-${d.day}`}>
                      Öppnar
                    </label>
                    <input
                      id={`open-${d.day}`}
                      type="time"
                      value={d.opensAt ?? ""}
                      onChange={(e) => onField(d.day, { opensAt: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`close-${d.day}`}>
                      Stänger
                    </label>
                    <input
                      id={`close-${d.day}`}
                      type="time"
                      value={d.closesAt ?? ""}
                      onChange={(e) => onField(d.day, { closesAt: e.target.value || null })}
                    />
                  </div>
                </div>
              )}

              {err && (
                <div className="sched-error" role="alert">
                  {err}
                </div>
              )}
            </div>
          );
        })}

        <div className="row-2" style={{ marginTop: 8 }}>
          <button type="button" className="btn btn--primary" style={{ minHeight: 52, fontSize: 16 }} onClick={onSave}>
            Spara schema
          </button>
        </div>
        <button type="button" className="btn--link" onClick={onCancel}>
          Avbryt
        </button>
      </aside>
    </>
  );
}
