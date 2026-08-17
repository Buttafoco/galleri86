import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Galleri 86 Stockholm — Konstgalleri på Skånegatan 86, Södermalm",
  description:
    "Ett litet, familjedrivet konstgalleri på Skånegatan 86, nära Nytorget på Södermalm. Utställningar, veckans schema och uthyrning av galleriet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
