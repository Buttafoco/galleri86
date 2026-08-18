"use client";

import type { SiteContent } from "@/lib/types";
import Slot from "../Slot";
import SectionTag from "../SectionTag";
import Collage from "./Collage";
import { useEditor } from "../EditorContext";

export default function Utstallningar({ content }: { content: SiteContent }) {
  const { mode, openAdd } = useEditor();
  const editing = mode === "edit";
  const visibleArtists = content.artists.filter((a) => editing || !a.hidden);

  return (
    <section id="utstallningar" className="section-pad" style={{ position: "relative", padding: "40px 48px 140px", maxWidth: 1440, margin: "0 auto" }}>
      <SectionTag label="Utställningar" />
      <h2
        style={{
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: 0.55,
          margin: "0 0 48px",
          fontWeight: 500,
        }}
      >
        Utställningar
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "64px 48px" }}>
        {visibleArtists.map((a, i) => (
          <div className="artist-card" key={a.key}>
            <Slot
              item={a}
              refItem={{ store: "artists", key: a.key }}
              style={{ height: 520, marginBottom: 18 }}
              group="artist"
              index={i}
            />
            <div
              className="reveal reveal-d1"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
            >
              <div className="serif ital" style={{ fontSize: 19, fontWeight: 500 }}>
                {a.name}
              </div>
              <div style={{ fontSize: 13, opacity: 0.5 }}>{a.date}</div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="add-row">
          <button
            type="button"
            className="btn btn--dark"
            style={{ minHeight: 52, padding: "0 30px", fontSize: 15 }}
            onClick={() => openAdd("artists")}
          >
            Lägg till bild i denna sektion
          </button>
        </div>
      )}

      <Collage content={content} />
    </section>
  );
}
