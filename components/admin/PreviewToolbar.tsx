"use client";

export default function PreviewToolbar({
  statusText,
  onBack,
  onPublish,
}: {
  statusText: string;
  onBack: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="preview-bar">
      <div style={{ fontSize: 14 }}>{statusText}</div>
      <div className="bar-actions">
        <button type="button" className="btn btn--primary" onClick={onBack}>
          Tillbaka till redigering
        </button>
        <button type="button" className="btn btn--ghost-light" onClick={onPublish}>
          Publicera ändringar
        </button>
      </div>
    </div>
  );
}
