import type { Metadata } from "next";
import { PRODUCTS } from "../productsData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === Number(id));

  if (!product) {
    return { title: "Produs negăsit" };
  }

  const description = `${product.name} — ${product.brand}, importat din ${product.country}. ${product.description} Livrare în Chișinău și în toată Moldova. Preț: ${product.price} MDL.`;

  return {
    title: `${product.name} — ${product.brand}`,
    description,
    keywords: [
      product.name,
      `${product.brand} Moldova`,
      `${product.category} importate Chișinău`,
      `${product.brand} Chișinău`,
    ],
    alternates: { canonical: `/produse/${product.id}` },
    openGraph: {
      title: `${product.name} | Challenge Store Moldova`,
      description,
      images: [{ url: product.img, alt: product.name }],
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
