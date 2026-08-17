"use client";

export default function TextEditPanel({
  label,
  value,
  onChange,
  onSave,
  onClose,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <button className="panel-scrim" aria-label="Stäng panel" onClick={onClose} />
      <aside
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label="Redigera text"
        style={{ width: 440 }}
      >
        <h2>Redigera text</h2>
        <div>
          <label className="field-label" htmlFor="text-edit">
            {label}
          </label>
          <textarea id="text-edit" rows={6} value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
        <div className="row-2">
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
