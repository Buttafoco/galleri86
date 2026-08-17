"use client";

import { schedule } from "@/lib/content";

export default function Schema() {
  return (
    <section
      id="veckans-schema"
      className="section-pad"
      style={{ padding: "0 48px 140px", maxWidth: 1440, margin: "0 auto" }}
    >
      <h2
        style={{
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: 0.55,
          margin: "0 0 24px",
          fontWeight: 500,
        }}
      >
        Veckans schema
      </h2>
      <div style={{ borderTop: "1px solid rgba(17,17,17,0.12)" }}>
        {schedule.map((d) => (
          <div
            key={d.name}
            className="schedule-row"
            style={{
              display: "grid",
              gridTemplateColumns: "80px minmax(0,1fr) 110px",
              alignItems: "baseline",
              gap: 24,
              padding: "20px 0",
              borderBottom: "1px solid rgba(17,17,17,0.12)",
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.55 }}>
              {d.name}
            </div>
            <div className="serif ital" style={{ fontSize: 19 }}>
              {d.event}
            </div>
            <div style={{ fontSize: 13, opacity: 0.6, textAlign: "right" }}>{d.hours}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
