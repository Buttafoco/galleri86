"use client";

const NAV = [
  { href: "#utstallningar", label: "Utställningar" },
  { href: "#galleriet", label: "Galleriet" },
  { href: "#veckans-schema", label: "Veckans schema" },
  { href: "#boka", label: "Boka galleriet" },
  { href: "#besok", label: "Kontakt" },
];

export default function Header({ variant }: { variant: "public" | "admin" }) {
  return (
    <header className="top">
      {variant === "public" ? (
        <div id="headerSlot" style={{ height: 24, width: 1 }} />
      ) : (
        <div className="serif" style={{ fontSize: 19 }}>
          Galleri <span style={{ color: "#C97A55", fontStyle: "italic" }}>86</span> Stockholm.
        </div>
      )}
      <nav>
        {NAV.map((n) => (
          <a key={n.href} href={n.href} style={{ opacity: 0.85 }}>
            {n.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
