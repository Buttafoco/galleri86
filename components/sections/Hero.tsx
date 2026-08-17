"use client";

import type { SiteContent } from "@/lib/types";
import Slot from "../Slot";
import EditText from "../EditText";
import SectionTag from "../SectionTag";

export default function Hero({ content }: { content: SiteContent }) {
  const img = content.images;
  return (
    <section className="hero section-pad" style={{ position: "relative" }}>
      <SectionTag label="Introduktion" />
      <div
        className="social"
        style={{
          writingMode: "vertical-rl",
          display: "flex",
          flexDirection: "column",
          gap: 26,
          fontSize: 12,
          letterSpacing: "0.08em",
          opacity: 0.55,
        }}
      >
        <a href="#" style={{ color: "#111111" }}>Instagram</a>
        <a href="#" style={{ color: "#111111" }}>Facebook</a>
      </div>

      <div>
        <h1
          id="heroTitle"
          className="serif"
          style={{ margin: "0 0 24px", fontSize: 56, lineHeight: 1.05, fontWeight: 400 }}
        >
          Galleri <span className="accent ital">86</span>
          <br />
          Stockholm.
        </h1>
        <p
          className="serif ital"
          style={{ fontSize: 22, lineHeight: 1.35, margin: "0 0 22px", maxWidth: 340 }}
        >
          Ett litet, familjedrivet galleri på Skånegatan 86 — en personlig och välkomnande plats för
          konst och möten.
        </p>
        <EditText textKey="intro">
          <p style={{ fontSize: 14, lineHeight: 1.75, maxWidth: 320, margin: 0, opacity: 0.7 }}>
            {content.texts.intro}
          </p>
        </EditText>
        <a href="#utstallningar" className="link-arrow" style={{ marginTop: 32 }}>
          Utställningar <span />
        </a>

        <div style={{ marginTop: 56, height: 300, width: "100%", position: "relative" }}>
          <Slot
            item={img.heroSide}
            refItem={{ store: "images", key: "heroSide" }}
            style={{ height: "100%", width: "100%" }}
            showCaption
            group="hero"
            index={0}
          />
        </div>
        <div style={{ marginTop: 24, height: 300, width: "100%", position: "relative" }}>
          <Slot
            item={img.heroSideExtra}
            refItem={{ store: "images", key: "heroSideExtra" }}
            style={{ height: "100%", width: "100%" }}
            showCaption
            group="hero"
            index={1}
          />
        </div>
      </div>

      <div
        className="hero-col3"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)",
          gap: 24,
          minWidth: 0,
          alignItems: "start",
          alignContent: "start",
        }}
      >
        <Slot
          item={img.heroMain}
          refItem={{ store: "images", key: "heroMain" }}
          style={{ height: 620 }}
          showCaption
          group="hero"
          index={2}
        />
        <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
          <Slot
            item={img.heroC1}
            refItem={{ store: "images", key: "heroC1" }}
            style={{ height: 298 }}
            revealDelay={1}
            showCaption
            group="hero"
            index={3}
          />
          <Slot
            item={img.heroC2}
            refItem={{ store: "images", key: "heroC2" }}
            style={{ height: 298 }}
            revealDelay={2}
            showCaption
            group="hero"
            index={4}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Slot
            item={img.heroWide}
            refItem={{ store: "images", key: "heroWide" }}
            extraClass="slot--wide"
            style={{ height: 620 }}
            revealDelay={1}
            showCaption
            group="hero"
            index={5}
          />
        </div>
      </div>
    </section>
  );
}
