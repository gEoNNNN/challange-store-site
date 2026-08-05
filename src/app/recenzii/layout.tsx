import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recenzii — Ce Spun Clienții",
  description:
    "Recenziile clienților Challenge Store Chișinău: păreri reale despre dulciurile exotice, snacks-urile importate și serviciul de livrare din Moldova.",
  alternates: { canonical: "/recenzii" },
  openGraph: {
    title: "Recenzii Challenge Store Moldova",
    description:
      "Păreri reale de la clienți despre dulciurile și snacks-urile importate din Chișinău.",
  },
};

export default function RecenziiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
