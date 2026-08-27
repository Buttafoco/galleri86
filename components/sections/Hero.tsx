"use client";

import Image from "next/image";
import type { SiteContent } from "@/lib/types";
import Slot from "../Slot";
import EditText from "../EditText";
import SectionTag from "../SectionTag";
import { LOGO_ALT, LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH } from "@/lib/logo";
import { EXTERNAL_LINK_PROPS, FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/social";

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
        <a href={INSTAGRAM_URL} {...EXTERNAL_LINK_PROPS} style={{ color: "#111111" }}>
          Instagram
        </a>
        <a href={FACEBOOK_URL} {...EXTERNAL_LINK_PROPS} style={{ color: "#111111" }}>
          Facebook
        </a>
      </div>

      <div>
        <Image
          id="heroTitle"
          src={LOGO_SRC}
          alt={LOGO_ALT}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          priority
          sizes="(max-width: 1000px) 100vw, 380px"
          style={{ display: "block", width: "100%", height: "auto", objectFit: "contain", margin: "0 0 24px" }}
        />
        <h1
          className="serif ital"
          style={{ fontSize: 22, fontWeight: "inherit", lineHeight: 1.35, margin: "0 0 22px", maxWidth: 340 }}
        >
          Ett litet, familjärt galleri på Skånegatan 86 — en personlig och välkomnande plats för
          konst och möten.
        </h1>
        <EditText textKey="intro">
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              maxWidth: 320,
              margin: 0,
              opacity: 0.7,
              whiteSpace: "pre-line",
            }}
          >
            {content.texts.intro}
          </p>
        </EditText>
        <a href="#utstallningar" className="link-arrow" style={{ marginTop: 32 }}>
          Utställningar <span />
        </a>

        <div className="mob-square" style={{ marginTop: 56, height: 300, width: "100%", position: "relative" }}>
          <Slot
            item={img.heroSide}
            refItem={{ store: "images", key: "heroSide" }}
            style={{ height: "100%", width: "100%" }}
            showCaption
            group="hero"
            index={0}
            sizes="(max-width: 1000px) 100vw, 380px"
          />
        </div>
        <div className="mob-square" style={{ marginTop: 24, height: 300, width: "100%", position: "relative" }}>
          <Slot
            item={img.heroSideExtra}
            refItem={{ store: "images", key: "heroSideExtra" }}
            style={{ height: "100%", width: "100%" }}
            showCaption
            group="hero"
            index={1}
            sizes="(max-width: 1000px) 100vw, 380px"
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
          extraClass="mob-square"
          showCaption
          group="hero"
          index={2}
          eager
          sizes="(max-width: 1000px) 100vw, 500px"
        />
        <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
          <Slot
            item={img.heroC1}
            refItem={{ store: "images", key: "heroC1" }}
            style={{ height: 298 }}
            extraClass="mob-square"
            revealDelay={1}
            showCaption
            group="hero"
            index={3}
            sizes="(max-width: 1000px) 100vw, 390px"
          />
          <Slot
            item={img.heroC2}
            refItem={{ store: "images", key: "heroC2" }}
            style={{ height: 298 }}
            extraClass="mob-square"
            revealDelay={2}
            showCaption
            group="hero"
            index={4}
            sizes="(max-width: 1000px) 100vw, 390px"
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Slot
            item={img.heroWide}
            refItem={{ store: "images", key: "heroWide" }}
            extraClass="slot--wide mob-square"
            style={{ height: 620 }}
            revealDelay={1}
            showCaption
            group="hero"
            index={5}
            sizes="(max-width: 1000px) 100vw, 890px"
          />
        </div>
      </div>
    </section>
  );
}
