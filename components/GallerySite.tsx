"use client";

import { useEffect, useMemo, useState } from "react";
import type { ItemRef, SiteContent, SiteMode, TextKey } from "@/lib/types";
import { EditorContext, EditorApi, LightboxPayload } from "./EditorContext";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Aktuellt from "./sections/Aktuellt";
import Utstallningar from "./sections/Utstallningar";
import Schema from "./sections/Schema";
import Galleriet from "./sections/Galleriet";
import Boka from "./sections/Boka";
import Footer from "./sections/Footer";
import Lightbox from "./Lightbox";

export interface EditorHandlers {
  openImageEdit: (ref: ItemRef) => void;
  openTextEdit: (key: TextKey) => void;
  openAdd: (section: "artists" | "collage") => void;
  openScheduleEdit: () => void;
}

interface LbState {
  group: "hero" | "artist" | null;
  index: number;
  single?: LightboxPayload;
}

const HERO_ORDER: { key: string }[] = [
  { key: "heroSide" },
  { key: "heroSideExtra" },
  { key: "heroMain" },
  { key: "heroC1" },
  { key: "heroC2" },
  { key: "heroWide" },
];

function toPayload(item: {
  src: string | null;
  artist: string;
  year: string;
  title: string;
  shortText: string;
}): LightboxPayload {
  return {
    src: item.src,
    artist: item.artist,
    year: item.year,
    title: item.title,
    shortText: item.shortText,
  };
}

export default function GallerySite({
  content,
  mode,
  handlers,
}: {
  content: SiteContent;
  mode: SiteMode;
  handlers?: EditorHandlers;
}) {
  const [lb, setLb] = useState<LbState | null>(null);
  const editing = mode === "edit";

  const heroGroup = useMemo(
    () => HERO_ORDER.map(({ key }) => toPayload(content.images[key as keyof typeof content.images])),
    [content],
  );
  const artistGroup = useMemo(
    () => content.artists.filter((a) => editing || !a.hidden).map(toPayload),
    [content, editing],
  );

  const api: EditorApi = useMemo(
    () => ({
      mode,
      hoverKey: null,
      setHover: () => {},
      openImageEdit: handlers?.openImageEdit ?? (() => {}),
      openTextEdit: handlers?.openTextEdit ?? (() => {}),
      openAdd: handlers?.openAdd ?? (() => {}),
      openScheduleEdit: handlers?.openScheduleEdit ?? (() => {}),
      openLightbox: (payload: LightboxPayload) => {
        if (payload.group === "hero" || payload.group === "artist") {
          setLb({ group: payload.group, index: payload.index ?? 0 });
        } else {
          setLb({ group: null, index: 0, single: payload });
        }
      },
    }),
    [mode, handlers],
  );

  // Scroll-reveal (runs in public & preview; harmless in edit).
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [mode, content]);

  // Hero title dock (public only — the admin shell uses a static header).
  useEffect(() => {
    if (mode !== "public") return;
    const heroTitle = document.getElementById("heroTitle");
    const headerSlot = document.getElementById("headerSlot");
    const clone = document.getElementById("dockClone");
    const header = document.querySelector<HTMLElement>("header.top");
    if (!heroTitle || !headerSlot || !clone || !header) return;

    const m: {
      titleTop?: number;
      titleLeft?: number;
      headerTop?: number;
      headerLeft?: number;
      headerMid?: number;
    } = {};

    const measure = () => {
      const sy = window.scrollY || 0;
      const hr = heroTitle.getBoundingClientRect();
      const sr = headerSlot.getBoundingClientRect();
      m.titleTop = hr.top + sy;
      m.titleLeft = hr.left;
      m.headerTop = sr.top;
      m.headerLeft = sr.left;
      const hb = header.getBoundingClientRect();
      m.headerMid = hb.top + hb.height / 2;
    };
    const onScroll = () => {
      if (m.titleTop === undefined) return;
      const sy = window.scrollY || 0;
      const docTop = m.titleTop - sy;
      const zone = Math.max(40, m.titleTop - (m.headerTop as number));
      const zoneStart = (m.headerTop as number) + zone;
      if (docTop >= zoneStart) {
        clone.style.display = "none";
        heroTitle.style.opacity = "1";
        return;
      }
      const progress = Math.min(1, (zoneStart - docTop) / zone);
      const p2 = Math.max(0, Math.min(1, (progress - 0.3) / 0.7));
      const fs = 56 - (56 - 19) * p2;
      const dockedTop = (m.headerMid as number) - fs * 0.384;
      const top = Math.max(docTop, dockedTop);
      const left = (m.titleLeft as number) + ((m.headerLeft as number) - (m.titleLeft as number)) * p2;
      clone.style.display = "block";
      clone.style.top = `${top}px`;
      clone.style.left = `${left}px`;
      clone.style.fontSize = `${fs}px`;
      clone.style.opacity = String(p2);
      heroTitle.style.opacity = String(1 - p2);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [mode, content]);

  // Resolve the currently shown lightbox item.
  let lbItem: LightboxPayload | null = null;
  let hasNav = false;
  if (lb) {
    if (lb.group === "hero") {
      lbItem = heroGroup[lb.index] ?? null;
      hasNav = heroGroup.length > 1;
    } else if (lb.group === "artist") {
      lbItem = artistGroup[lb.index] ?? null;
      hasNav = artistGroup.length > 1;
    } else {
      lbItem = lb.single ?? null;
    }
  }
  const step = (dir: number) => {
    setLb((cur) => {
      if (!cur || !cur.group) return cur;
      const len = cur.group === "hero" ? heroGroup.length : artistGroup.length;
      return { ...cur, index: (cur.index + dir + len) % len };
    });
  };

  return (
    <EditorContext.Provider value={api}>
      <div className={`site ${mode === "public" ? "site--public" : "site--admin"}`}>
        {mode === "public" && (
          <div id="dockClone">
            Galleri <span className="accent ital">86</span> Stockholm.
          </div>
        )}
        <Header variant={mode === "public" ? "public" : "admin"} />
        <Hero content={content} />
        <Aktuellt content={content} />
        <Utstallningar content={content} />
        <Schema content={content} />
        <Galleriet content={content} />
        <Boka />
        <Footer />
        {lb && lbItem && (
          <Lightbox
            item={lbItem}
            hasNav={hasNav}
            onClose={() => setLb(null)}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
          />
        )}
      </div>
    </EditorContext.Provider>
  );
}
