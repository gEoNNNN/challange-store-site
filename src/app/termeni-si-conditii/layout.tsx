import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții",
  description:
    "Termenii și condițiile de utilizare a site-ului challengestore.md și de achiziționare a produselor Challenge Store: comenzi, plată, livrare în Moldova, retur.",
  alternates: { canonical: "/termeni-si-conditii" },
};

export default function TermeniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
