"use client";

import type { SiteContent } from "@/lib/types";
import Slot from "../Slot";
import EditText from "../EditText";
import SectionTag from "../SectionTag";

export default function Aktuellt({ content }: { content: SiteContent }) {
  return (
    <section
      className="grid-2 section-pad"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
        gap: 64,
        alignItems: "center",
        padding: "140px 48px",
        maxWidth: 1440,
        margin: "0 auto",
      }}
    >
      <SectionTag label="Aktuellt" />
      <Slot
        item={content.images.curImg}
        refItem={{ store: "images", key: "curImg" }}
        extraClass="slot--current"
        style={{ height: 640 }}
      />
      <div>
        <div
          className="reveal reveal-d1"
          style={{
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.55,
            marginBottom: 18,
          }}
        >
          Aktuell utställning
        </div>
        <EditText textKey="curTitle">
          <h2
            className="serif ital reveal reveal-d2"
            style={{ margin: "0 0 6px", fontSize: 34, fontWeight: 500 }}
          >
            {content.texts.curTitle}
          </h2>
        </EditText>
        <EditText textKey="curSub">
          <h3
            className="reveal reveal-d3"
            style={{
              margin: "0 0 22px",
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: "0.04em",
              opacity: 0.7,
            }}
          >
            {content.texts.curSub}
          </h3>
        </EditText>
        <div className="reveal reveal-d3" style={{ fontSize: 13, opacity: 0.55, marginBottom: 18 }}>
          14 sep – 12 okt 2026
        </div>
        <EditText textKey="curDesc">
          <p
            className="reveal reveal-d4"
            style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 380, opacity: 0.85, margin: "0 0 26px" }}
          >
            {content.texts.curDesc}
          </p>
        </EditText>
        <a
          className="reveal reveal-d5"
          href="#"
          style={{ fontSize: 14, borderBottom: "1px solid rgba(17,17,17,0.35)", paddingBottom: 3 }}
        >
          Läs mer →
        </a>
      </div>
    </section>
  );
}
