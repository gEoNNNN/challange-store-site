import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import Navbar from "./components/Navbar";
import JsonLd from "./components/JsonLd";
import { SITE_URL } from "../lib/site";
import { isSiteLocked } from "../lib/siteLock";

/**
 * Fonturile se încarcă din Google Fonts la runtime (link), nu la build cu next/font:
 * build-ul de pe Vercel pica la rezolvarea fonturilor (Turbopack + next/font/google).
 * Variabilele CSS (--font-*) sunt definite în globals.css.
 */
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2" +
  "?family=Geist:wght@100..900" +
  "&family=Geist+Mono:wght@100..900" +
  "&family=Poppins:wght@400;500;600;700;800;900" +
  "&family=Alfa+Slab+One:wght@400" +
  "&family=Chivo:wght@400;500;700;900" +
  "&family=DM+Serif+Display:wght@400" +
  "&family=Nunito:wght@400;500;600;700;800" +
  "&family=Alegreya+Sans:wght@400;700;900" +
  "&family=Alegreya:wght@400;500;700" +
  "&family=Raleway:wght@100;300;400;600;700;800" +
  "&family=Fira+Sans:wght@400;700;900" +
  "&family=PT+Serif:wght@400;700" +
  "&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Challenge Store — Dulciuri Exotice și Snacks-uri Importate în Chișinău, Moldova",
    template: "%s | Challenge Store Moldova",
  },
  description:
    "Magazin de dulciuri exotice, snacks-uri și băuturi importate în Chișinău: Lay's, Nerds, Reese's, Arizona, Oreo din SUA, Japonia și Coreea. Livrare rapidă în Chișinău și în toată Moldova. Comandă online!",
  keywords: [
    "dulciuri exotice Chișinău",
    "dulciuri americane Moldova",
    "snacks-uri importate Chișinău",
    "magazin dulciuri importate Moldova",
    "Lay's Moldova",
    "Nerds Moldova",
    "Reese's Chișinău",
    "Arizona tea Moldova",
    "Oreo Chișinău",
    "băuturi americane Moldova",
    "dulciuri japoneze Chișinău",
    "snacks coreene Moldova",
    "сладости из США Кишинев",
    "американские сладости Молдова",
    "экзотические сладости Кишинев",
    "чипсы Lay's Молдова",
    "снеки Кишинев доставка",
  ],
  applicationName: "Challenge Store",
  authors: [{ name: "CG CAPITAL TRADING S.R.L." }],
  creator: "Challenge Store",
  publisher: "CG CAPITAL TRADING S.R.L.",
  formatDetection: { telephone: true, email: true, address: true },
  alternates: {
    canonical: "/",
    languages: {
      "ro-MD": "/",
      "ru-MD": "/",
      en: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Challenge Store",
    title:
      "Challenge Store — Dulciuri Exotice și Snacks-uri Importate în Chișinău",
    description:
      "Lay's, Nerds, Reese's, Arizona, Oreo și alte branduri internaționale — importate direct și livrate rapid în Chișinău și în toată Moldova.",
    locale: "ro_MD",
    alternateLocale: ["ru_MD", "en_US"],
    images: [
      {
        url: "/img/logo alb.png",
        width: 1200,
        height: 630,
        alt: "Challenge Store — Dulciuri Exotice Moldova",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Challenge Store — Dulciuri Exotice în Chișinău, Moldova",
    description:
      "Snacks-uri și dulciuri importate din SUA, Japonia, Coreea. Livrare în toată Moldova.",
    images: ["/img/logo alb.png"],
  },
  robots: isSiteLocked()
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
  category: "shopping",
  other: {
    "geo.region": "MD-CU",
    "geo.placename": "Chișinău, Municipiul Chișinău, Moldova",
    "geo.position": "47.0105;28.8638",
    ICBM: "47.0105, 28.8638",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0c1a12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body>
        <JsonLd />
        <Providers><Navbar />{children}</Providers>
      </body>
    </html>
  );
}
