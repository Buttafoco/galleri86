"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/types";
import Slot from "../Slot";
import EditText from "../EditText";
import SectionTag from "../SectionTag";
import ExhibitionModal from "../ExhibitionModal";
import { useEditor } from "../EditorContext";

const NEXT_SHOW_DATE = "14 sep – 12 okt 2026";

const eyebrowLabelStyle: React.CSSProperties = {
  fontSize: 13,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  opacity: 0.55,
  fontWeight: 500,
};

/** Turns the weekly schedule into a short "Ons–Fre 12:00–18:00 · Lör–Sön 12:00–16:00" summary. */
function summarizeHours(schedule: SiteContent["schedule"]): string {
  const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
  const groups: { labels: string[]; opensAt: string; closesAt: string }[] = [];
  schedule.forEach((d) => {
    if (d.closed || !d.opensAt || !d.closesAt) return;
    const prev = groups[groups.length - 1];
    if (prev && prev.opensAt === d.opensAt && prev.closesAt === d.closesAt) {
      prev.labels.push(d.label);
    } else {
      groups.push({ labels: [d.label], opensAt: d.opensAt, closesAt: d.closesAt });
    }
  });
  if (groups.length === 0) return "Se öppettider under Veckans schema";
  return groups
    .map((g) => {
      const days =
        g.labels.length > 1 ? `${cap(g.labels[0])}–${cap(g.labels[g.labels.length - 1])}` : cap(g.labels[0]);
      return `${days} ${g.opensAt}–${g.closesAt}`;
    })
    .join(" · ");
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function formatDatePart(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(day)}/${Number(month)}`;
}

/** Renders a stored range ("2026-08-19 - 2026-08-24", from the admin's date
 * pickers) as "19/8 - 24/8". Older free-text entries ("Vår 2027") aren't ISO
 * dates, so they fall through unchanged. */
function formatDateRange(date: string): string {
  const idx = date.indexOf(" - ");
  const from = idx === -1 ? date : date.slice(0, idx);
  const to = idx === -1 ? "" : date.slice(idx + 3);
  if (!ISO_DATE.test(from)) return date;
  if (!to) return formatDatePart(from);
  if (!ISO_DATE.test(to)) return date;
  return `${formatDatePart(from)} - ${formatDatePart(to)}`;
}

export default function Aktuellt({ content }: { content: SiteContent }) {
  const { mode, openTextEdit, openUpcomingEdit } = useEditor();
  const editing = mode === "edit";
  const [showModal, setShowModal] = useState(false);
  const upcoming = content.upcomingExhibitions;
  const hours = summarizeHours(content.schedule);

  return (
    <section
      className="section-pad"
      style={{ position: "relative", padding: "140px 48px", maxWidth: 1440, margin: "0 auto" }}
    >
      <SectionTag label="Aktuellt" />
      <h2 id="aktuellt" className="aktuellt-title" style={{ ...eyebrowLabelStyle, margin: "0 0 56px" }}>Aktuellt</h2>

      {/* Nästa utställning — clearly emphasized */}
      <div
        className="grid-2 aktuellt-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
          gap: 64,
          alignItems: "center",
        }}
      >
        <Slot
          item={content.images.curImg}
          refItem={{ store: "images", key: "curImg" }}
          extraClass="slot--current"
          style={{ height: 640 }}
        />
        <div>
          <div className="reveal reveal-d1" style={{ ...eyebrowLabelStyle, marginBottom: 18 }}>
            Nästa utställning
          </div>
          <EditText textKey="curSub">
            <h3
              className="serif ital reveal reveal-d2"
              style={{ margin: "0 0 8px", fontSize: 34, fontWeight: 500 }}
            >
              {content.texts.curSub || "Utställningens namn meddelas snart"}
            </h3>
          </EditText>
          <EditText textKey="curTitle">
            <div
              className="reveal reveal-d3"
              style={{ margin: "0 0 22px", fontSize: 17, fontWeight: 400, letterSpacing: "0.02em", opacity: 0.75 }}
            >
              {content.texts.curTitle || "Konstnär meddelas snart"}
            </div>
          </EditText>
          <div
            className="reveal reveal-d3"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 10px",
              alignItems: "center",
              fontSize: 13,
              opacity: 0.6,
              marginBottom: 10,
            }}
          >
            <span>{NEXT_SHOW_DATE}</span>
            <span aria-hidden="true">·</span>
            <span>{hours}</span>
          </div>
          <div
            className="reveal reveal-d3 accent"
            style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}
          >
            Fri entré
          </div>
          <EditText textKey="curDesc">
            <p
              className="reveal reveal-d4"
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                maxWidth: 380,
                opacity: 0.85,
                margin: "0 0 26px",
                whiteSpace: "pre-line",
              }}
            >
              {content.texts.curDesc || "Mer information om utställningen kommer inom kort."}
            </p>
          </EditText>
          <button
            type="button"
            className="reveal reveal-d5 text-btn"
            onClick={() => setShowModal(true)}
            style={{ fontSize: 14, borderBottom: "1px solid rgba(17,17,17,0.35)", paddingBottom: 3 }}
          >
            Läs mer →
          </button>

          {editing && (
            <div
              className="reveal"
              style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 16 }}
            >
              <Slot
                item={content.images.curPopupImg}
                refItem={{ store: "images", key: "curPopupImg" }}
                style={{ width: 72, height: 72, flexShrink: 0 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 11, opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Popupbild &amp; längre beskrivning
                </span>
                <button
                  type="button"
                  className="btn--link"
                  style={{ fontSize: 13, padding: 0 }}
                  onClick={() => setShowModal(true)}
                >
                  Anpassa bilden i popupen
                </button>
                <button
                  type="button"
                  className="btn--link"
                  style={{ fontSize: 13, padding: 0 }}
                  onClick={() => openTextEdit("curLongDesc")}
                >
                  Redigera längre beskrivning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ExhibitionModal
          image={content.images.curPopupImg}
          title={content.texts.curSub || "Utställningens namn meddelas snart"}
          artist={content.texts.curTitle || "Konstnär meddelas snart"}
          dateLabel={NEXT_SHOW_DATE}
          description={
            content.texts.curLongDesc || content.texts.curDesc || "Mer information om utställningen kommer inom kort."
          }
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Kommande utställningar */}
      <div className={`upcoming-box${editing ? " editable" : ""}`} style={{ marginTop: 120 }}>
        {editing && (
          <button type="button" className="upcoming-edit-btn" onClick={openUpcomingEdit}>
            Redigera kommande utställningar
          </button>
        )}
        <h2 style={{ ...eyebrowLabelStyle, margin: "0 0 40px" }}>Kommande utställningar</h2>
        {upcoming.length > 0 ? (
          <div>
            {upcoming.map((a) => (
              <div
                key={a.key}
                className="reveal"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "22px 0",
                  borderBottom: "1px solid rgba(17,17,17,0.1)",
                }}
              >
                <div className="serif ital" style={{ fontSize: 20, fontWeight: 500 }}>
                  {a.name || "Konstnär meddelas snart"}
                </div>
                <div style={{ fontSize: 13, opacity: 0.5 }}>{formatDateRange(a.date) || "Datum meddelas snart"}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 15, opacity: 0.6, fontStyle: "italic" }}>Kommande utställningar meddelas snart.</p>
        )}
      </div>
    </section>
  );
}
