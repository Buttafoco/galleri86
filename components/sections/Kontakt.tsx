import { EXTERNAL_LINK_PROPS, FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/social";

const eyebrowLabelStyle: React.CSSProperties = {
  fontSize: 13,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  opacity: 0.55,
  fontWeight: 500,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.5,
  marginBottom: 6,
};

const fieldValueStyle: React.CSSProperties = {
  display: "block",
  fontSize: 16,
  opacity: 0.85,
};

const ADDRESS = "Skånegatan 86, Stockholm";
const MAPS_QUERY = encodeURIComponent(ADDRESS);
const MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

export default function Kontakt() {
  return (
    <section
      className="grid-2 section-pad"
      style={{
        padding: "160px 48px 140px",
        maxWidth: 1440,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
        gap: 80,
        alignItems: "start",
      }}
    >
      <div>
        <div style={{ ...eyebrowLabelStyle, marginBottom: 20 }}>Kontakt</div>
        <h1 style={{ margin: "0 0 20px", fontSize: 36, fontWeight: 500, lineHeight: 1.2, maxWidth: 480 }}>
          Kontakta oss
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.75, opacity: 0.8, maxWidth: 440, margin: "0 0 48px" }}>
          Har du frågor om galleriet, våra utställningar eller ett besök? Välkommen att kontakta oss.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 44 }}>
          <div className="serif ital" style={{ fontSize: 20, fontWeight: 500 }}>
            Galleri 86
          </div>

          <div>
            <div style={fieldLabelStyle}>Besöksadress</div>
            <div style={fieldValueStyle}>{ADDRESS}</div>
          </div>

          <div>
            <div style={fieldLabelStyle}>E-post</div>
            <a href="mailto:info@galleri86.se" style={fieldValueStyle}>
              info@galleri86.se
            </a>
          </div>

          <div>
            <div style={fieldLabelStyle}>Sociala medier</div>
            <div style={{ display: "flex", gap: 20 }}>
              <a href={INSTAGRAM_URL} {...EXTERNAL_LINK_PROPS} style={fieldValueStyle}>
                Instagram
              </a>
              <a href={FACEBOOK_URL} {...EXTERNAL_LINK_PROPS} style={fieldValueStyle}>
                Facebook
              </a>
            </div>
          </div>
        </div>

        <a
          href={MAPS_LINK}
          {...EXTERNAL_LINK_PROPS}
          className="btn btn--dark"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 52, padding: "0 28px", fontSize: 14 }}
        >
          Öppna i Google Maps
        </a>
      </div>

      <div style={{ position: "relative", height: 560, background: "#e9e7e1", overflow: "hidden" }}>
        <iframe
          src={MAPS_EMBED_SRC}
          loading="lazy"
          title="Karta som visar Galleri 86 på Skånegatan 86, Stockholm"
          style={{ border: 0, width: "100%", height: "100%", display: "block" }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
