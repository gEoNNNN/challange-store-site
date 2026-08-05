"use client";
import Footer from "../components/Footer";
import styles from "../legal.module.css";
import { BsFileEarmarkText, BsTelephone, BsEnvelope, BsGeoAlt } from "react-icons/bs";

type Section = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  note?: string;
};

const SECTIONS: Section[] = [
  {
    id: "dispozitii-generale",
    title: "Dispoziții generale",
    paragraphs: [
      "Prezenții Termeni și Condiții reglementează utilizarea site-ului challengestore.md (în continuare — „Site-ul”) și condițiile de achiziționare a produselor comercializate prin intermediul acestuia.",
      "Site-ul este administrat de CG CAPITAL TRADING S.R.L., persoană juridică înregistrată în Republica Moldova, IDNO 1025600025386 (în continuare — „Vânzătorul”, „Noi”), proprietarul magazinului Challenge Store.",
      "Prin accesarea Site-ului, crearea unei comenzi sau utilizarea oricărui serviciu oferit, confirmați că ați citit, ați înțeles și acceptați integral acești Termeni și Condiții. Dacă nu sunteți de acord cu aceștia, vă rugăm să nu utilizați Site-ul.",
    ],
  },
  {
    id: "definitii",
    title: "Definiții",
    list: [
      "Client — persoana fizică sau juridică care plasează o comandă pe Site;",
      "Comandă — solicitarea Clientului de a achiziționa produse de pe Site;",
      "Produs — orice articol alimentar sau nealimentar comercializat pe Site (dulciuri, snacks-uri, băuturi și alte produse de import);",
      "Contract — înțelegerea dintre Vânzător și Client, încheiată la distanță, care intră în vigoare la confirmarea comenzii.",
    ],
  },
  {
    id: "produse",
    title: "Produse și disponibilitate",
    paragraphs: [
      "Challenge Store comercializează produse alimentare importate — dulciuri exotice, snacks-uri, băuturi și specialități de la branduri internaționale (Lay's, Nerds, Arizona, Reese's și altele), provenite din SUA, Japonia, Coreea, China și Europa.",
      "Depunem toate eforturile ca descrierile, imaginile și specificațiile produselor să fie exacte. Imaginile au caracter ilustrativ; ambalajul real poate diferi ușor în funcție de lotul importat. Lista de ingrediente, valorile nutriționale și alergenii sunt cele indicate de producător pe ambalaj — vă rugăm să consultați eticheta produsului înainte de consum.",
      "Stocul afișat pe Site este sincronizat automat cu sistemul nostru de gestiune și este actualizat periodic. În cazuri excepționale, un produs poate deveni indisponibil după plasarea comenzii — în această situație vă vom contacta pentru a vă propune un produs similar, modificarea sau anularea comenzii.",
    ],
  },
  {
    id: "preturi",
    title: "Prețuri",
    paragraphs: [
      "Toate prețurile sunt exprimate în lei moldovenești (MDL) și includ TVA, dacă nu este menționat altfel.",
      "Prețurile afișate la momentul plasării comenzii sunt definitive pentru acea comandă. Ne rezervăm dreptul de a modifica prețurile fără notificare prealabilă, însă modificările nu afectează comenzile deja confirmate.",
      "În cazul unei erori evidente de afișare a prețului (de exemplu, o eroare tehnică), ne rezervăm dreptul de a anula comanda afectată, cu informarea prealabilă a Clientului.",
    ],
  },
  {
    id: "comenzi",
    title: "Plasarea și confirmarea comenzii",
    paragraphs: [
      "Comenzile se plasează direct pe Site, prin completarea formularului de checkout cu datele de contact și adresa de livrare.",
      "După plasarea comenzii, aceasta este transmisă automat în sistemul nostru de gestiune, iar un operator vă va contacta telefonic pentru confirmarea detaliilor și a termenului de livrare. Contractul de vânzare-cumpărare se consideră încheiat la momentul confirmării telefonice.",
      "Este responsabilitatea Clientului să furnizeze date corecte și complete (nume, telefon, adresă). Nu ne facem responsabili pentru imposibilitatea livrării cauzată de date eronate.",
      "Ne rezervăm dreptul de a refuza sau anula comenzi în caz de suspiciune de fraudă, comportament abuziv sau date incomplete.",
    ],
  },
  {
    id: "plata",
    title: "Modalități de plată",
    paragraphs: [
      "În prezent, plata se efectuează în numerar sau cu cardul la primirea produselor (la livrare sau la ridicarea din magazin).",
      "Plata online cu cardul va fi disponibilă în curând — vă vom anunța pe Site la lansarea acestei opțiuni.",
      "Factura fiscală este emisă și predată împreună cu produsele.",
    ],
  },
  {
    id: "livrare",
    title: "Livrare",
    list: [
      "Livrăm pe teritoriul municipiului Chișinău și, în funcție de comandă, în toată Republica Moldova;",
      "Costul livrării în Chișinău este de 50 MDL; livrarea este GRATUITĂ pentru comenzile de 500 MDL și mai mari;",
      "Termenul de livrare este, de regulă, de 1–2 zile lucrătoare de la confirmarea comenzii;",
      "La primire, vă rugăm să verificați integritatea ambalajelor și conformitatea produselor cu comanda.",
    ],
  },
  {
    id: "retur",
    title: "Anulare și retur",
    paragraphs: [
      "Puteți anula comanda fără nicio penalitate înainte de expedierea acesteia, contactându-ne telefonic sau prin e-mail.",
      "Conform legislației în vigoare a Republicii Moldova privind protecția consumatorilor, produsele alimentare de calitate corespunzătoare NU pot fi returnate sau schimbate, având în vedere natura și condițiile speciale de păstrare a acestora.",
      "Dacă ați primit un produs neconform (expirat, deteriorat, greșit sau cu ambalajul compromis), vă rugăm să ne contactați în termen de 24 de ore de la primire, cu o fotografie a produsului. Vom înlocui produsul sau vă vom rambursa integral contravaloarea acestuia.",
    ],
    note: "Important: dreptul de retur în 14 zile, prevăzut pentru cumpărăturile online, NU se aplică produselor alimentare și altor produse care, prin natura lor, nu pot fi returnate din motive de igienă și siguranță alimentară.",
  },
  {
    id: "calitate",
    title: "Garanția calității",
    paragraphs: [
      "Toate produsele comercializate sunt originale, importate prin canale oficiale, se află în termenul de valabilitate și sunt păstrate și transportate în condiții corespunzătoare standardelor de siguranță alimentară.",
      "Termenul de valabilitate este indicat pe ambalajul fiecărui produs. Vă recomandăm să respectați condițiile de păstrare indicate de producător (temperatură, umiditate, ferire de lumina directă).",
    ],
  },
  {
    id: "raspundere",
    title: "Limitarea răspunderii",
    paragraphs: [
      "Nu ne facem responsabili pentru reacții alergice sau intoleranțe individuale la ingredientele produselor. Verificați întotdeauna eticheta produsului înainte de consum, mai ales dacă aveți alergii cunoscute (nuci, arahide, gluten, lactoză etc.).",
      "Site-ul este oferit „ca atare”. Nu garantăm funcționarea neîntreruptă a Site-ului și nu răspundem pentru întreruperi tehnice temporare, erori de afișare sau indisponibilitate cauzată de mentenanță.",
      "Răspunderea noastră totală față de Client este limitată la valoarea comenzii în cauză.",
    ],
  },
  {
    id: "proprietate",
    title: "Proprietate intelectuală",
    paragraphs: [
      "Întregul conținut al Site-ului (texte, design, logo-uri, fotografii proprii) este proprietatea CG CAPITAL TRADING S.R.L. și este protejat de legislația privind drepturile de autor.",
      "Mărcile comerciale ale produselor prezentate (Lay's, Nerds, Reese's, Arizona și altele) aparțin deținătorilor lor legitimi și sunt utilizate exclusiv în scopul identificării produselor comercializate.",
    ],
  },
  {
    id: "modificari",
    title: "Modificarea termenilor",
    paragraphs: [
      "Ne rezervăm dreptul de a actualiza acești Termeni și Condiții în orice moment. Versiunea curentă este întotdeauna disponibilă pe această pagină, cu data ultimei actualizări.",
      "Continuarea utilizării Site-ului după publicarea modificărilor constituie acceptarea acestora.",
    ],
  },
  {
    id: "lege",
    title: "Legea aplicabilă și litigii",
    paragraphs: [
      "Prezenții Termeni și Condiții sunt guvernați de legislația Republicii Moldova.",
      "Orice litigiu va fi soluționat pe cale amiabilă. În caz contrar, litigiul va fi înaintat instanțelor judecătorești competente de la sediul Vânzătorului.",
    ],
  },
];

const LAST_UPDATED = "5 august 2026";

export default function TermeniPage() {
  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroIcon}>
            <BsFileEarmarkText size={28} />
          </div>
          <span className={styles.heroBadge}>Challenge Store</span>
          <h1 className={styles.heroTitle}>Termeni și Condiții</h1>
          <p className={styles.heroText}>
            Regulile care guvernează utilizarea site-ului challengestore.md și
            achiziționarea produselor din magazinul nostru de dulciuri și
            snacks-uri exotice.
          </p>
          <span className={styles.heroUpdated}>
            Ultima actualizare: <strong>{LAST_UPDATED}</strong>
          </span>
        </div>
      </section>

      {/* ── Content ── */}
      <div className={styles.container}>
        {/* TOC */}
        <aside className={styles.toc}>
          <h3 className={styles.tocTitle}>Cuprins</h3>
          <ul className={styles.tocList}>
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#contact">15. Contacte</a>
            </li>
          </ul>
        </aside>

        {/* Sections */}
        <div className={styles.content}>
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>{i + 1}</span>
                <h2 className={styles.sectionTitle}>{s.title}</h2>
              </div>
              {s.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
              {s.list && (
                <ul>
                  {s.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
              {s.note && (
                <div className={styles.note}>
                  <strong>Notă:</strong> {s.note}
                </div>
              )}
            </section>
          ))}

          {/* Contact */}
          <section id="contact" className={styles.contactCard}>
            <h2 className={styles.contactTitle}>15. Contacte</h2>
            <p className={styles.contactText}>
              Pentru orice întrebare legată de acești Termeni și Condiții, de
              comenzile tale sau de produsele noastre, ne poți contacta:
            </p>
            <div className={styles.contactRows}>
              <div className={styles.contactRow}>
                <BsGeoAlt size={17} />
                <span>CG CAPITAL TRADING S.R.L. — mun. Chișinău, Republica Moldova</span>
              </div>
              <div className={styles.contactRow}>
                <BsTelephone size={17} />
                <a href="tel:+37360000000">+373 60 000 000</a>
              </div>
              <div className={styles.contactRow}>
                <BsEnvelope size={17} />
                <a href="mailto:contact@challengestore.md">contact@challengestore.md</a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
