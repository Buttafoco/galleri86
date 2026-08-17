import type { SiteContent, ScheduleRow } from "./types";

const SLOT = "/assets/slots";

/**
 * The published content of the site, seeded from the live public homepage.
 * This is the single source of truth — the public route renders it directly,
 * and the editor clones it into a draft. No image/content data is duplicated
 * across the section components.
 */
export const publishedContent: SiteContent = {
  images: {
    heroMain: {
      src: `${SLOT}/hero-main.jpg`,
      artist: "Sofia Feucht",
      title: "",
      year: "2026",
      shortText: "",
      hidden: false,
      size: "large",
      alt: "Konstverk av Sofia Feucht",
    },
    heroC1: {
      src: `${SLOT}/hero-collage-1.jpg`,
      artist: "Daniela Eriksson",
      title: "",
      year: "2026",
      shortText: "",
      hidden: false,
      size: "medium",
      alt: "Konstverk av Daniela Eriksson",
    },
    heroC2: {
      src: `${SLOT}/hero-collage-2.jpg`,
      artist: "Ulrika W",
      title: "",
      year: "2026",
      shortText: "",
      hidden: false,
      size: "medium",
      alt: "Konstverk av Ulrika W",
    },
    heroSide: {
      src: `${SLOT}/hero-side.jpg`,
      artist: "Rebekka RvK",
      title: "",
      year: "2027",
      shortText: "",
      hidden: false,
      size: "medium",
      alt: "Konstverk av Rebekka RvK",
    },
    heroSideExtra: {
      src: `${SLOT}/hero-side-extra.jpg`,
      artist: "Sofia Feucht",
      title: "",
      year: "2026",
      shortText: "",
      hidden: false,
      size: "medium",
      alt: "Konstverk av Sofia Feucht",
    },
    heroWide: {
      src: `${SLOT}/hero-wide.jpg`,
      artist: "Sofia Feucht",
      title: "",
      year: "2026",
      shortText: "",
      hidden: false,
      size: "large",
      alt: "Utställningsvy, Galleri 86",
    },
    curImg: {
      src: `${SLOT}/current-exhibition.jpg`,
      artist: "Sofia Feucht",
      title: "Dissonans",
      year: "2026",
      shortText:
        "En serie målningar som rör sig mellan det figurativa och det upplösta.",
      hidden: false,
      size: "large",
      alt: "Verk från aktuell utställning: Sofia Feucht, Dissonans",
    },
    spaceImg: {
      src: `${SLOT}/gallery-space.jpg`,
      artist: "",
      title: "",
      year: "",
      shortText: "Interiör, Skånegatan 86",
      hidden: false,
      size: "large",
      alt: "Interiörbild av Galleri 86, Skånegatan 86",
    },
  },
  artists: [
    {
      key: "artist-daniela",
      name: "Daniela Eriksson",
      date: "Vår 2026",
      src: `${SLOT}/artist-daniela.jpg`,
      artist: "Daniela Eriksson",
      title: "",
      year: "Vår 2026",
      shortText: "",
      hidden: false,
      size: "medium",
      alt: "Verk av Daniela Eriksson",
    },
    {
      key: "artist-sofia",
      name: "Sofia Feucht",
      date: "Höst 2026",
      src: `${SLOT}/artist-sofia.jpg`,
      artist: "Sofia Feucht",
      title: "",
      year: "Höst 2026",
      shortText: "",
      hidden: false,
      size: "medium",
      alt: "Verk av Sofia Feucht",
    },
    {
      key: "artist-ulrika",
      name: "Ulrika W",
      date: "Vinter 2026",
      src: `${SLOT}/artist-ulrika.jpg`,
      artist: "Ulrika W",
      title: "",
      year: "Vinter 2026",
      shortText: "",
      hidden: false,
      size: "medium",
      alt: "Verk av Ulrika W",
    },
    {
      key: "artist-rebekka",
      name: "Rebekka RvK",
      date: "Vår 2027",
      src: `${SLOT}/artist-rebekka.jpg`,
      artist: "Rebekka RvK",
      title: "",
      year: "Vår 2027",
      shortText: "",
      hidden: false,
      size: "medium",
      alt: "Verk av Rebekka RvK",
    },
  ],
  // Collage tiles reproduce the current 4-column / 140px-row grid: the tiles at
  // index 0, 4 and 10 span two columns ("wide"), the rest are single ("small").
  collage: Array.from({ length: 13 }, (_, i) => {
    const wide = i === 0 || i === 4 || i === 10;
    return {
      key: `collage-${i + 1}`,
      kind: (wide ? "wide" : "small") as "wide" | "small",
      src: `${SLOT}/collage-${i + 1}.jpg`,
      artist: "",
      title: "",
      year: "",
      shortText: "",
      hidden: false,
      size: "small" as const,
      alt: "Galleribild",
    };
  }),
  texts: {
    intro:
      "Nära Nytorget på Södermalm vill vi skapa en plats där konstnärer får möta sin publik i en nära, avslappnad miljö. Galleriet drivs med ett stort intresse för konst, människor och möten — med ambitionen att varje utställning ska få kännas personlig.",
    curTitle: "Sofia Feucht",
    curSub: "Dissonans",
    curDesc:
      "En serie målningar som rör sig mellan det figurativa och det upplösta — ytor som söker sin form och sedan lämnar den igen.",
    spaceH: "Ett litet galleri mitt på Södermalm",
    spaceP:
      "Galleri 86 ligger på Skånegatan 86, nära Nytorget. Ett personligt galleri för konstnärer och kreatörer som vill ställa ut i en intim miljö mitt i SoFo.",
  },
};

export const schedule: ScheduleRow[] = [
  { name: "Mån", hours: "Stängt", event: "Stängt för publik" },
  { name: "Tis", hours: "Stängt", event: "Uppbyggnad av utställning" },
  { name: "Ons", hours: "12–18", event: "Visning: Sofia Feucht" },
  { name: "Tor", hours: "12–18", event: "Artist talk kl 17" },
  { name: "Fre", hours: "12–18", event: "Öppet hus" },
  { name: "Lör", hours: "12–16", event: "Guidad rundvandring kl 13" },
  { name: "Sön", hours: "12–16", event: "Familjevisning" },
];

/** Deep clone used when seeding the editor's draft from the published content. */
export function cloneContent(content: SiteContent): SiteContent {
  return {
    images: Object.fromEntries(
      Object.entries(content.images).map(([k, v]) => [k, { ...v }]),
    ) as SiteContent["images"],
    artists: content.artists.map((a) => ({ ...a })),
    collage: content.collage.map((c) => ({ ...c })),
    texts: { ...content.texts },
  };
}
