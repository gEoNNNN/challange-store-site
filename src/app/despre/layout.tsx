import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Despre Noi — Povestea Challenge Store",
  description:
    "Challenge Store — magazinul de dulciuri exotice din Chișinău. Află cine suntem, cum aducem cele mai căutate snacks-uri și băuturi din SUA, Japonia și Coreea în Moldova.",
  alternates: { canonical: "/despre" },
  openGraph: {
    title: "Despre Challenge Store — Dulciuri Exotice în Moldova",
    description:
      "Povestea magazinului care aduce brandurile internaționale preferate direct în Chișinău.",
  },
};

export default function DespreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
