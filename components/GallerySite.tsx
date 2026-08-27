"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ImageItem, ImageKey, ImagePlacementTarget, ItemRef, SiteContent, SiteMode, TextKey } from "@/lib/types";
import {
  EditorContext,
  EditorApi,
  ImageEditPreview,
  ImagePlacementPatch,
  LightboxPayload,
} from "./EditorContext";
import { LOGO_ASPECT, LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH } from "@/lib/logo";
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
  openImageEdit: (ref: ItemRef, preview?: ImageEditPreview) => void;
  activeImageRef: ItemRef | null;
  activePlacementTarget: ImagePlacementTarget | null;
  updateImagePlacement: (patch: ImagePlacementPatch) => void;
  openTextEdit: (key: TextKey) => void;
  openAdd: (section: "artists" | "collage") => void;
  openScheduleEdit: () => void;
  openUpcomingEdit: () => void;
}

interface LbState {
  group: "hero" | "artist" | null;
  index: number;
  singleRef?: ItemRef;
}

const HERO_ORDER: { key: ImageKey }[] = [
  { key: "heroSide" },
  { key: "heroSideExtra" },
  { key: "heroMain" },
  { key: "heroC1" },
  { key: "heroC2" },
  { key: "heroWide" },
];

function toPayload(image: ImageItem, refItem: ItemRef): LightboxPayload {
  return { image, refItem };
}

function findImage(content: SiteContent, ref: ItemRef): ImageItem | null {
  if (ref.store === "images") return content.images[ref.key as ImageKey] ?? null;
  return content[ref.store].find((item) => item.key === ref.key) ?? null;
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
    () => HERO_ORDER.map(({ key }) => toPayload(content.images[key], { store: "images", key })),
    [content],
  );
  const artistGroup = useMemo(
    () =>
      content.artists
        .filter((artist) => editing || !artist.hidden)
        .map((artist) => toPayload(artist, { store: "artists", key: artist.key })),
    [content, editing],
  );

  const api: EditorApi = useMemo(
    () => ({
      mode,
      hoverKey: null,
      setHover: () => {},
      openImageEdit: handlers?.openImageEdit ?? (() => {}),
      activeImageRef: handlers?.activeImageRef ?? null,
      activePlacementTarget: handlers?.activePlacementTarget ?? null,
      updateImagePlacement: handlers?.updateImagePlacement ?? (() => {}),
      openTextEdit: handlers?.openTextEdit ?? (() => {}),
      openAdd: handlers?.openAdd ?? (() => {}),
      openScheduleEdit: handlers?.openScheduleEdit ?? (() => {}),
      openUpcomingEdit: handlers?.openUpcomingEdit ?? (() => {}),
      openLightbox: (payload: LightboxPayload) => {
        if (payload.group === "hero" || payload.group === "artist") {
          setLb({ group: payload.group, index: payload.index ?? 0 });
        } else {
          setLb({ group: null, index: 0, singleRef: payload.refItem });
        }
      },
    }),
    [mode, handlers],
  );

  // Scroll-reveal (runs in public & preview; harmless in edit). Some .reveal
  // elements — the closed Galleri grid's images — don't exist yet when this
  // effect first runs (they mount later, on demand, once the visitor opens
  // it); a MutationObserver picks those up too, so they still get an "in"
  // class and aren't left stuck at opacity:0 forever.
  useEffect(() => {
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
    const observeNew = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => io.observe(el));
    };
    observeNew(document);
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(".reveal:not(.in)")) io.observe(node);
          observeNew(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
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
      titleWidth?: number;
      headerTop?: number;
      headerLeft?: number;
      headerWidth?: number;
      headerMid?: number;
    } = {};

    const measure = () => {
      const sy = window.scrollY || 0;
      const hr = heroTitle.getBoundingClientRect();
      const sr = headerSlot.getBoundingClientRect();
      m.titleTop = hr.top + sy;
      m.titleLeft = hr.left;
      m.titleWidth = hr.width;
      m.headerTop = sr.top;
      m.headerLeft = sr.left;
      m.headerWidth = sr.width;
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
      const width = (m.titleWidth as number) - ((m.titleWidth as number) - (m.headerWidth as number)) * p2;
      const height = width * LOGO_ASPECT;
      const dockedTop = (m.headerMid as number) - height / 2;
      const top = Math.max(docTop, dockedTop);
      const left = (m.titleLeft as number) + ((m.headerLeft as number) - (m.titleLeft as number)) * p2;
      clone.style.display = "block";
      clone.style.top = `${top}px`;
      clone.style.left = `${left}px`;
      clone.style.width = `${width}px`;
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
    } else if (lb.singleRef) {
      const image = findImage(content, lb.singleRef);
      lbItem = image ? toPayload(image, lb.singleRef) : null;
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
          <a id="dockClone" href="/" aria-label="Gå till startsidan" className="brand-logo-link">
            <Image src={LOGO_SRC} alt="" width={LOGO_WIDTH} height={LOGO_HEIGHT} sizes="120px" />
          </a>
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
