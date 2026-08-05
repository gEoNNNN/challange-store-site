import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate",
  description:
    "Politica de confidențialitate Challenge Store: cum colectăm, folosim și protejăm datele tale personale conform Legii nr. 133/2011 a Republicii Moldova.",
  alternates: { canonical: "/politica-de-confidentialitate" },
};

export default function ConfidentialitateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
