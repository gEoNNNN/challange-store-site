import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produse — Dulciuri, Snacks-uri și Băuturi Importate",
  description:
    "Catalogul complet Challenge Store: chips-uri Lay's, bomboane Nerds, ciocolată Reese's, ceai Arizona, Oreo și sute de produse importate din SUA, Japonia, Coreea și Europa. Livrare în Chișinău și toată Moldova.",
  keywords: [
    "catalog dulciuri importate",
    "chips-uri Lay's Chișinău",
    "bomboane americane Moldova",
    "ceai Arizona Chișinău",
    "ciocolată importată Moldova",
    "снеки и сладости Кишинев каталог",
  ],
  alternates: { canonical: "/produse" },
  openGraph: {
    title: "Produse — Challenge Store Moldova",
    description:
      "Sute de dulciuri și snacks-uri importate: Lay's, Nerds, Reese's, Arizona, Oreo. Livrare rapidă în Moldova.",
  },
};

export default function ProduseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
