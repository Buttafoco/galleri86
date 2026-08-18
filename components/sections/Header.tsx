"use client";

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

export default function Header({ variant }: { variant: "public" | "admin" | "page" }) {
  const pathname = usePathname();
  // "/" and "/admin" render the full set of homepage sections in-page, so their
  // anchors should stay bare hashes; any other route needs to jump back home first.
  const hasHomeSections = pathname === "/" || pathname?.startsWith("/admin");

  return (
    <header className="top">
      {variant === "public" ? (
        <img id="headerSlot" src={LOGO_SRC} alt="" aria-hidden="true" className="brand-logo" style={{ visibility: "hidden" }} />
      ) : (
        <a href="/" aria-label="Gå till startsidan" className="brand-logo-link">
          <img src={LOGO_SRC} alt="" className="brand-logo" />
        </a>
      )}
      <nav>
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
    </header>
  );
}
