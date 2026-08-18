"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/types";
import Slot from "../Slot";
import { useEditor } from "../EditorContext";

export default function Collage({ content }: { content: SiteContent }) {
  const { mode, openAdd } = useEditor();
  const editing = mode === "edit";
  const [open, setOpen] = useState(false);

  const visible = content.collage.filter((c) => editing || !c.hidden);

  useEffect(() => {
    const openGallery = () => setOpen(true);
    const openGalleryFromHash = () => {
      if (window.location.hash === "#galleriet") openGallery();
    };

    openGalleryFromHash();
    window.addEventListener("hashchange", openGalleryFromHash);
    window.addEventListener("galleri86:open-gallery", openGallery);

    return () => {
      window.removeEventListener("hashchange", openGalleryFromHash);
      window.removeEventListener("galleri86:open-gallery", openGallery);
    };
  }, []);

  const grid = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,minmax(0,1fr))",
        gridAutoRows: 140,
        gap: 20,
        paddingTop: 8,
      }}
    >
      {visible.map((c) => (
        <div
          key={c.key}
          className="slot-cell"
          style={{ gridColumn: c.kind === "wide" ? "span 2" : "span 1", position: "relative" }}
        >
          <Slot
            item={c}
            refItem={{ store: "collage", key: c.key }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="add-inline">
        <h2
          id="galleriet"
          style={{
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.55,
            margin: 0,
            fontWeight: 500,
          }}
        >
          Galleri
        </h2>
        {editing && (
          <button type="button" className="btn btn--dark" onClick={() => openAdd("collage")}>
            Lägg till bild
          </button>
        )}
      </div>

      {editing ? (
        visible.length === 0 ? (
          <div className="empty-gallery">
            <div className="lead">Inga bilder har lagts till ännu</div>
            <button type="button" className="btn btn--dark" onClick={() => openAdd("collage")}>
              Lägg till första bilden
            </button>
          </div>
        ) : (
          grid
        )
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateRows: open ? "1fr" : "0fr",
              marginTop: open ? 56 : 0,
              opacity: open ? 1 : 0,
              overflow: "hidden",
              transition:
                "grid-template-rows 1.3s cubic-bezier(0.65,0,0.35,1), opacity 1.1s ease-in-out, margin-top 1.3s cubic-bezier(0.65,0,0.35,1)",
            }}
          >
            <div style={{ minHeight: 0, overflow: "hidden" }}>{grid}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 56 }}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              style={{
                background: "none",
                border: "none",
                color: "#111111",
                fontSize: 13,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "10px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              {open ? "Stäng Galleri" : "Öppna Galleri"}
              <span style={{ display: "block", width: "100%", height: 1, background: "currentColor" }} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
