import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finalizare Comandă",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
