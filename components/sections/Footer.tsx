"use client";

import { EXTERNAL_LINK_PROPS, FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/social";

export default function Footer() {
  return (
    <footer
      id="besok"
      className="section-pad site-footer"
      style={{ borderTop: "1px solid rgba(17,17,17,0.1)", padding: "36px 48px", maxWidth: 1440, margin: "0 auto" }}
    >
      <div
        className="site-footer__row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 13,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div className="site-footer__group site-footer__address" style={{ opacity: 0.75 }}>
          GALLERI 86 · Skånegatan 86, Stockholm
        </div>
        <div className="site-footer__group site-footer__links" style={{ display: "flex", gap: 24 }}>
          <a className="footer-link" href={INSTAGRAM_URL} {...EXTERNAL_LINK_PROPS} style={{ opacity: 0.75 }}>
            Instagram
          </a>
          <a className="footer-link" href={FACEBOOK_URL} {...EXTERNAL_LINK_PROPS} style={{ opacity: 0.75 }}>
            Facebook
          </a>
          <a className="footer-link" href="/kontakt" style={{ opacity: 0.75 }}>Kontakt</a>
        </div>
        <div className="site-footer__group site-footer__credit" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="site-footer__copyright" style={{ opacity: 0.4 }}>© 2026</span>
          <a
            className="footer-link site-footer__studio"
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
