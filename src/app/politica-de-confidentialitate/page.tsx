"use client";
import Footer from "../components/Footer";
import styles from "../legal.module.css";
import { BsShieldLock, BsTelephone, BsEnvelope, BsGeoAlt } from "react-icons/bs";

type Section = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  note?: string;
};

const SECTIONS: Section[] = [
  {
    id: "cine-suntem",
    title: "Cine suntem",
    paragraphs: [
      "CG CAPITAL TRADING S.R.L., persoană juridică înregistrată în Republica Moldova, IDNO 1025600025386, proprietarul magazinului Challenge Store și al site-ului challengestore.md, este operatorul datelor dumneavoastră cu caracter personal.",
      "Această Politică de Confidențialitate explică ce date colectăm, de ce le colectăm, cum le folosim și care sunt drepturile dumneavoastră, în conformitate cu Legea nr. 133/2011 privind protecția datelor cu caracter personal a Republicii Moldova.",
      "Prin utilizarea Site-ului și plasarea unei comenzi, confirmați că ați luat cunoștință de această politică.",
    ],
  },
  {
    id: "date-colectate",
    title: "Ce date colectăm",
    paragraphs: ["Colectăm doar datele strict necesare procesării comenzilor:"],
    list: [
      "Date de identificare și contact: nume și prenume, număr de telefon, adresă de e-mail;",
      "Date de livrare: adresa de livrare, localitatea, observațiile privind comanda;",
      "Date despre comenzi: produsele achiziționate, istoricul comenzilor, preferințele de produse (favorite);",
      "Date tehnice: adresa IP, tipul browserului, paginile vizitate, colectate automat prin cookie-uri și instrumente de analiză.",
    ],
  },
  {
    id: "scopuri",
    title: "Scopurile prelucrării",
    paragraphs: ["Folosim datele dumneavoastră exclusiv pentru:"],
    list: [
      "Procesarea și confirmarea comenzilor plasate pe Site;",
      "Livrarea produselor la adresa indicată;",
      "Comunicarea cu dumneavoastră privind comanda, stocurile și disponibilitatea produselor;",
      "Îmbunătățirea experienței pe Site și a ofertei de produse;",
      "Transmiterea de oferte și noutăți — doar cu consimțământul dumneavoastră, cu posibilitatea dezabonării în orice moment;",
      "Respectarea obligațiilor legale (contabilitate, fiscalitate, protecția consumatorilor).",
    ],
  },
  {
    id: "temei",
    title: "Temeiul legal al prelucrării",
    list: [
      "Executarea contractului — prelucrarea datelor este necesară pentru onorarea comenzii dumneavoastră;",
      "Obligații legale — păstrarea documentelor fiscale și contabile conform legislației;",
      "Interes legitim — îmbunătățirea serviciilor și prevenirea fraudei;",
      "Consimțământ — pentru comunicări de marketing, pe care îl puteți retrage oricând.",
    ],
  },
  {
    id: "cookies",
    title: "Cookie-uri",
    paragraphs: [
      "Site-ul utilizează cookie-uri și tehnologii similare pentru funcționarea corectă (coș de cumpărături, preferințe de limbă și temă) și pentru analiza traficului.",
      "Datele despre coș și favorite sunt păstrate local, în browserul dumneavoastră, și nu sunt transmise către terți.",
      "Puteți dezactiva cookie-urile din setările browserului, însă unele funcții ale Site-ului (coșul de cumpărături) ar putea deveni indisponibile.",
    ],
  },
  {
    id: "transmitere",
    title: "Cui transmitem datele",
    paragraphs: [
      "Nu vindem, nu închiriem și nu cedăm datele dumneavoastră personale către terți în scopuri comerciale.",
      "Datele pot fi transmise strict în măsura necesară către: servicii de curierat (pentru livrare), furnizori de servicii IT și găzduire (pentru funcționarea Site-ului) și autorități publice — doar în cazurile prevăzute de lege.",
    ],
  },
  {
    id: "securitate",
    title: "Securitatea datelor",
    paragraphs: [
      "Aplicăm măsuri tehnice și organizatorice corespunzătoare pentru a proteja datele dumneavoastră împotriva accesului neautorizat, pierderii, distrugerii sau divulgării.",
      "Conexiunea la Site este securizată prin protocol HTTPS. Accesul la datele personale este limitat la angajații care au nevoie de ele pentru procesarea comenzilor.",
    ],
  },
  {
    id: "pastrare",
    title: "Perioada de păstrare",
    paragraphs: [
      "Păstrăm datele dumneavoastră doar pe perioada necesară îndeplinirii scopurilor pentru care au fost colectate:",
    ],
    list: [
      "Datele aferente comenzilor și documentelor fiscale — conform termenelor legale de arhivare;",
      "Datele de contact pentru comunicări — până la retragerea consimțământului;",
      "Datele din browser (coș, favorite) — până la ștergerea lor de către dumneavoastră.",
    ],
  },
  {
    id: "drepturi",
    title: "Drepturile dumneavoastră",
    paragraphs: [
      "În conformitate cu legislația în vigoare, aveți următoarele drepturi:",
    ],
    list: [
      "Dreptul de acces — să aflați ce date deținem despre dumneavoastră;",
      "Dreptul la rectificare — să corectați datele inexacte sau incomplete;",
      "Dreptul la ștergere — să solicitați ștergerea datelor, cu respectarea obligațiilor legale de păstrare;",
      "Dreptul la opoziție — să vă opuneți prelucrării în scopuri de marketing;",
      "Dreptul de a depune plângere — la Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP) al Republicii Moldova.",
    ],
    note: "Pentru exercitarea oricărui drept, scrieți-ne la contact@challengestore.md — vom răspunde în termen de 15 zile lucrătoare.",
  },
  {
    id: "minori",
    title: "Protecția minorilor",
    paragraphs: [
      "Site-ul nu este destinat colectării deliberate de date de la persoane sub 16 ani. Comenzile plasate de minori trebuie efectuate cu acordul părinților sau al tutorelui legal.",
      "Dacă aflăm că am colectat date ale unui minor fără acord, le vom șterge imediat.",
    ],
  },
  {
    id: "modificari",
    title: "Modificarea politicii",
    paragraphs: [
      "Ne rezervăm dreptul de a actualiza această Politică de Confidențialitate. Orice modificare va fi publicată pe această pagină cu data ultimei actualizări.",
      "Vă recomandăm să verificați periodic această pagină pentru a fi la curent cu modul în care vă protejăm datele.",
    ],
  },
];

const LAST_UPDATED = "5 august 2026";

export default function ConfidentialitatePage() {
  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroIcon}>
            <BsShieldLock size={28} />
          </div>
          <span className={styles.heroBadge}>Challenge Store</span>
          <h1 className={styles.heroTitle}>Politica de Confidențialitate</h1>
          <p className={styles.heroText}>
            Cum colectăm, folosim și protejăm datele tale personale atunci când
            folosești challengestore.md și comanzi dulciurile noastre.
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
              <a href="#contact">12. Contact</a>
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
            <h2 className={styles.contactTitle}>12. Contact</h2>
            <p className={styles.contactText}>
              Pentru orice întrebare privind protecția datelor personale sau
              pentru exercitarea drepturilor tale, contactează-ne:
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
