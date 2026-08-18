"use client";

import { EXTERNAL_LINK_PROPS, FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/social";

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
          <a href={INSTAGRAM_URL} {...EXTERNAL_LINK_PROPS} style={{ opacity: 0.75 }}>
            Instagram
          </a>
          <a href={FACEBOOK_URL} {...EXTERNAL_LINK_PROPS} style={{ opacity: 0.75 }}>
            Facebook
          </a>
          <a href="/kontakt" style={{ opacity: 0.75 }}>Kontakt</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ opacity: 0.4 }}>© 2026</span>
          <a
            href="https://studioklaro.se/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: 0.4 }}
          >
            Designed by Studio Klaro
          </a>
        </div>
      </div>
    </footer>
  );
}
