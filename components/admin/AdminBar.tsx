"use client";

export default function AdminBar({
  dirty,
  publishing,
  onPreview,
  onPublish,
  onLogout,
}: {
  dirty: boolean;
  publishing: boolean;
  onPreview: () => void;
  onPublish: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="admin-bar">
      <div className="admin-bar__left">
        <div className="admin-bar__title">Galleri 86 – Redigeringsläge</div>
        <div className="admin-bar__status">
          <span
            className="status-dot"
            style={{ background: dirty ? "#C97A55" : "#7fae7f" }}
            aria-hidden="true"
          />
          {dirty ? "Osparade ändringar" : "Alla ändringar är sparade"}
        </div>
      </div>
      <div className="bar-actions">
        <button type="button" className="btn btn--ghost-light" onClick={onPreview}>
          Förhandsgranska
        </button>
        <button type="button" className="btn btn--primary" onClick={onPublish} disabled={publishing}>
          {publishing ? "Publicerar …" : "Publicera ändringar"}
        </button>
        <button type="button" className="btn btn--ghost-light" onClick={onLogout}>
          Logga ut
        </button>
      </div>
    </div>
  );
}
