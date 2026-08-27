"use client";

import { useState } from "react";

const inputStyle: React.CSSProperties = {
  border: "none",
  borderBottom: "1.5px solid rgba(17,17,17,0.2)",
  background: "transparent",
  padding: "6px 0",
  fontSize: 15,
  fontFamily: "var(--font-newsreader), Georgia, serif",
  outline: "none",
  color: "#111111",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.5,
};

export default function Boka() {
  const [sent, setSent] = useState(false);

  return (
    <section
      id="boka"
      className="grid-2 section-pad"
      style={{
        padding: "140px 48px",
        maxWidth: 1440,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
        gap: 80,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.55,
            marginBottom: 18,
          }}
        >
          Bokningen 2027 öppen
        </div>
        <h2 style={{ margin: "0 0 22px", fontSize: 32, fontWeight: 500, lineHeight: 1.25, maxWidth: 420 }}>
          Vill du ställa ut på Galleri 86?
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.75, opacity: 0.8, maxWidth: 420, margin: "0 0 8px" }}>
          Vi hyr ut galleriet till konstnärer och kreatörer som vill visa sitt arbete i en intim miljö. Tre rum,
          47 kvm, mitt i SoFo.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.75, opacity: 0.8, maxWidth: 420 }}>
          Skicka en kort förfrågan så återkommer vi med tillgängliga perioder.
        </p>
      </div>
      <form
        style={{ display: "flex", flexDirection: "column", gap: 22 }}
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <label style={labelStyle}>
          Namn
          <input type="text" required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          E-post
          <input type="email" required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Om utställningen
          <textarea rows={4} style={{ ...inputStyle, resize: "none" }} />
        </label>
        <button
          type="submit"
          style={{
            alignSelf: "flex-start",
            marginTop: 10,
            background: "none",
            color: "#C97A55",
            padding: "0 0 4px",
            fontSize: 13,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: "var(--font-inter), Helvetica, Arial, sans-serif",
            border: "none",
            borderBottom: "1px solid #C97A55",
            cursor: "pointer",
          }}
        >
          {sent ? "Tack — vi hör av oss ✓" : "Skicka förfrågan →"}
        </button>
      </form>
    </section>
  );
}
