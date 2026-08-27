import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font — same families, weights and styles the old
// Google Fonts <link> requested (Inter 400/500/600 roman only; Newsreader's
// default 400 weight in both roman and italic — its stylesheet never
// requested a wght axis, so that was already all Google served). next/font
// downloads these at build time, serves them from our own origin (no extra
// cross-origin request) and computes a size-matched fallback so swapping in
// the real font doesn't shift layout.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
  display: "swap",
  variable: "--font-inter",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Galleri 86 Stockholm — Konstgalleri på Skånegatan 86, Södermalm",
  description:
    "Ett litet, familjedrivet konstgalleri på Skånegatan 86, nära Nytorget på Södermalm. Utställningar, veckans schema och uthyrning av galleriet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${inter.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
