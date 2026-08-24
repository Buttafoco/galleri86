"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LOGO_SRC } from "@/lib/logo";

const NAV = [
  { href: "#utstallningar", label: "Utställningar" },
  { href: "#galleriet", label: "Galleriet" },
  { href: "#aktuellt", label: "Aktuellt" },
  { href: "#om-galleriet", label: "Om galleriet" },
  { href: "#boka", label: "Boka galleriet" },
  { href: "/kontakt", label: "Kontakt" },
];

// "Boka galleriet" doubles as the mobile menu's primary call to action.
const CTA_HREF = "#boka";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Header({ variant }: { variant: "public" | "admin" | "page" }) {
  const pathname = usePathname();
  // "/" and "/admin" render the full set of homepage sections in-page, so their
  // anchors should stay bare hashes; any other route needs to jump back home first.
  const hasHomeSections = pathname === "/" || pathname?.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const resolveHref = (href: string) => (href.startsWith("#") && !hasHomeSections ? `/${href}` : href);

  const navLinks = NAV.filter((n) => n.href !== CTA_HREF);
  const cta = NAV.find((n) => n.href === CTA_HREF)!;

  // Restoring overflow here (not only in the effect cleanup below) matters: a link
  // click both closes the menu and triggers the browser's native hash-scroll, and
  // that scroll needs body overflow unlocked immediately, before React's passive
  // effect cleanup gets a chance to run.
  const closeMenu = () => {
    document.body.style.overflow = "";
    setOpen(false);
  };

  const go = (n: (typeof NAV)[number]) => {
    if (n.href === "#galleriet" && hasHomeSections) {
      window.dispatchEvent(new Event("galleri86:open-gallery"));
    }
    closeMenu();
  };

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 768) closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <>
    <header className={`top${open ? " menu-open" : ""}`}>
      {variant === "public" ? (
        <img id="headerSlot" src={LOGO_SRC} alt="" aria-hidden="true" className="brand-logo" style={{ visibility: "hidden" }} />
      ) : (
        <a href="/" aria-label="Gå till startsidan" className="brand-logo-link">
          <img src={LOGO_SRC} alt="" className="brand-logo" />
        </a>
      )}

      <nav className="nav-desktop">
        {NAV.map((n) => {
          const href = n.href.startsWith("#") && !hasHomeSections ? `/${n.href}` : n.href;
          return (
            <a
              key={n.href}
              href={href}
              onClick={
                n.href === "#galleriet" && hasHomeSections
                  ? () => window.dispatchEvent(new Event("galleri86:open-gallery"))
                  : undefined
              }
              style={{ opacity: 0.85 }}
            >
              {n.label}
            </a>
          );
        })}
      </nav>

      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Stäng meny" : "Öppna meny"}
        onClick={() => (open ? closeMenu() : setOpen(true))}
      >
        <span className="menu-toggle__bar" aria-hidden="true" />
        <span className="menu-toggle__bar" aria-hidden="true" />
        <span className="menu-toggle__bar" aria-hidden="true" />
      </button>
    </header>

    {/* Rendered outside <header> (which sets backdrop-filter, a containing block for
        fixed descendants) so this can reliably cover the full viewport. */}
    <div
      id="mobile-menu"
      ref={menuRef}
      className={`mobile-menu${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Huvudmeny"
      aria-hidden={!open}
      onClick={closeMenu}
    >
      <nav className="mobile-menu__nav" aria-label="Huvudmeny" onClick={(e) => e.stopPropagation()}>
        {navLinks.map((n) => (
          <a key={n.href} href={resolveHref(n.href)} className="mobile-menu__link" onClick={() => go(n)}>
            {n.label}
          </a>
        ))}
      </nav>
      <div className="mobile-menu__cta" onClick={(e) => e.stopPropagation()}>
        <a href={resolveHref(cta.href)} className="btn btn--dark btn--block" onClick={() => go(cta)}>
          {cta.label}
        </a>
      </div>
    </div>
    </>
  );
}
