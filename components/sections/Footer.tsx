"use client";

export default function Footer() {
  return (
    <footer
      id="besok"
      className="section-pad"
      style={{ borderTop: "1px solid rgba(17,17,17,0.1)", padding: "36px 48px", maxWidth: 1440, margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 13,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ opacity: 0.75 }}>GALLERI 86 · Skånegatan 86, Stockholm</div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#" style={{ opacity: 0.75 }}>Instagram</a>
          <a href="#" style={{ opacity: 0.75 }}>Facebook</a>
          <a href="mailto:info@galleri86.se" style={{ opacity: 0.75 }}>Kontakt</a>
        </div>
        <div style={{ opacity: 0.4 }}>© 2026</div>
      </div>
    </footer>
  );
}
