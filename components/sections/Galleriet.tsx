"use client";

import type { SiteContent } from "@/lib/types";
import Slot from "../Slot";
import EditText from "../EditText";
import SectionTag from "../SectionTag";

export default function Galleriet({ content }: { content: SiteContent }) {
  return (
    <section
      id="galleriet"
      className="section-pad"
      style={{ position: "relative", background: "#111111", color: "#F7F6F2", padding: "140px 48px" }}
    >
      <SectionTag label="Om Galleri 86" onDark />
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: 64,
          alignItems: "center",
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        <Slot item={content.images.spaceImg} refItem={{ store: "images", key: "spaceImg" }} style={{ height: 560 }} />
        <div>
          <EditText textKey="spaceH">
            <h2 style={{ margin: "0 0 20px", fontSize: 30, fontWeight: 500, lineHeight: 1.25 }}>
              {content.texts.spaceH}
            </h2>
          </EditText>
          <EditText textKey="spaceP">
            <p style={{ fontSize: 15, lineHeight: 1.75, opacity: 0.8, maxWidth: 400, margin: "0 0 40px" }}>
              {content.texts.spaceP}
            </p>
          </EditText>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {[
              ["47 kvm", "Yta"],
              ["Tre rum", "Planlösning"],
              ["Skånegatan 86", "Adress"],
            ].map(([big, small]) => (
              <div key={small}>
                <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{big}</div>
                <div style={{ fontSize: 12, opacity: 0.55, letterSpacing: "0.03em" }}>{small}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
