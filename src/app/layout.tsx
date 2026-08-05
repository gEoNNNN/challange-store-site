import type { Metadata, Viewport } from "next";
import {
  Geist, Geist_Mono, Poppins,
  Alfa_Slab_One, Chivo,
  DM_Serif_Display, Nunito,
  Alegreya_Sans, Alegreya,
  Raleway,
  Fira_Sans, PT_Serif,
} from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import Navbar from "./components/Navbar";
import JsonLd from "./components/JsonLd";
import { SITE_URL } from "../lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const alfaSlabOne = Alfa_Slab_One({
  variable: "--font-alfa-slab-one",
  subsets: ["latin"],
  weight: "400",
});

const chivo = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const alegreyaSans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["100", "300", "400", "600", "700", "800"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
  robots: {
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
    <html lang="ro" className={[
        geistSans.variable, geistMono.variable, poppins.variable,
        alfaSlabOne.variable, chivo.variable,
        dmSerifDisplay.variable, nunito.variable,
        alegreyaSans.variable, alegreya.variable,
        raleway.variable, firaSans.variable, ptSerif.variable,
      ].join(" ")}>
      <body>
        <JsonLd />
        <Providers><Navbar />{children}</Providers>
      </body>
    </html>
  );
}
