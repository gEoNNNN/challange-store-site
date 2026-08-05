import { SITE_URL, SITE_NAME, COMPANY } from "../../lib/site";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "GroceryStore",
        "@id": `${SITE_URL}/#store`,
        name: SITE_NAME,
        legalName: COMPANY.legalName,
        url: SITE_URL,
        logo: `${SITE_URL}/img/logo alb.png`,
        image: `${SITE_URL}/img/logo alb.png`,
        description:
          "Magazin de dulciuri exotice, snacks-uri și băuturi importate în Chișinău, Moldova: Lay's, Nerds, Reese's, Arizona, Oreo și alte branduri internaționale din SUA, Japonia, Coreea și Europa.",
        telephone: COMPANY.phone,
        email: COMPANY.email,
        taxID: COMPANY.idno,
        currenciesAccepted: "MDL",
        paymentAccepted: "Cash, Credit Card",
        priceRange: "10–500 MDL",
        address: {
          "@type": "PostalAddress",
          addressLocality: COMPANY.city,
          addressCountry: COMPANY.countryCode,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: COMPANY.latitude,
          longitude: COMPANY.longitude,
        },
        areaServed: {
          "@type": "Country",
          name: "Moldova",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Dulciuri și snacks-uri importate",
          itemListElement: [
            { "@type": "OfferCatalog", name: "Snacks & Chips" },
            { "@type": "OfferCatalog", name: "Ciocolată" },
            { "@type": "OfferCatalog", name: "Bomboane" },
            { "@type": "OfferCatalog", name: "Băuturi" },
            { "@type": "OfferCatalog", name: "Biscuiți" },
            { "@type": "OfferCatalog", name: "Gumă & Jeleuri" },
          ],
        },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#store` },
        inLanguage: ["ro-MD", "ru-MD", "en"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
