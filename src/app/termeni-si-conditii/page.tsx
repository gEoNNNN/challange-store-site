"use client";
import Footer from "../components/Footer";
import styles from "../legal.module.css";
import {
  BsFileEarmarkText,
  BsCreditCard2Front,
  BsTruck,
  BsArrowCounterclockwise,
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsShieldCheck,
} from "react-icons/bs";

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
      "Acest site este deținut de CG CAPITAL TRADING S.R.L., persoană juridică înregistrată în Republica Moldova, IDNO 1025600025386 (în continuare — „Vânzătorul”, „Noi”), proprietarul magazinului online Challenge Store, disponibil la adresa challengestore.md.",
      "La înregistrarea comenzii în magazinul online, Cumpărătorul acceptă Termenii și Condițiile de vânzare a bunurilor/produselor și/sau prestare a serviciilor care sunt bazați pe legislația Republicii Moldova (în continuare — Termeni și Condiții) prezentate mai jos.",
      "Utilizarea website-ului presupune acceptarea Termenilor și Condițiilor propuse de către CG CAPITAL TRADING S.R.L., în conformitate cu Legea nr. 284/2004 privind comerțul electronic. Relațiile dintre client și vânzător sunt stabilite în baza Legii nr. 105/2003 cu privire la protecția drepturilor consumatorilor, a Codului civil al Republicii Moldova și a altor acte normative adoptate în conformitate cu acestea.",
      "Vânzătorul își rezervă dreptul de a modifica Termenii și Condițiile date, fără o notificare prealabilă, iar Cumpărătorul este obligat să monitorizeze modificările. Versiunea aplicabilă este cea publicată pe această pagină la momentul plasării comenzii.",
      "Comenzile pot fi plasate de persoane care au împlinit 18 ani. Minorii pot achiziționa produse doar cu acordul părinților sau al reprezentantului legal.",
    ],
    list: [
      "Cumpărător/Client — persoana fizică sau juridică ce plasează o comandă pe site;",
      "Vânzător — CG CAPITAL TRADING S.R.L., operatorul magazinului online Challenge Store;",
      "Comandă — solicitarea Clientului de a achiziționa produse de pe site, transmisă prin formularul de checkout;",
      "Produs — orice articol alimentar sau nealimentar comercializat pe site (dulciuri, snacks-uri, băuturi și alte produse de import);",
      "Contract — înțelegerea la distanță dintre Vânzător și Client, care intră în vigoare la confirmarea comenzii.",
    ],
  },
  {
    id: "protectia-datelor",
    title: "Protecția datelor cu caracter personal",
    paragraphs: [
      "Prin utilizarea site-ului challengestore.md, sunteți de acord cu colectarea și prelucrarea datelor cu caracter personal care sunt necesare pentru procesarea, confirmarea și executarea comenzilor.",
      "Datele personale se prelucrează doar pentru scopuri legitime, precum furnizarea produselor comandate, livrarea, comunicările privind comanda, promoțiile, analiza traficului (Google Analytics), cookie-urile și notificările/newsletterul.",
      "Toată informația ce conține date cu caracter personal este stocată și utilizată doar pentru perioada necesară atingerii scopurilor pentru care a fost colectată, în conformitate cu prevederile Legii nr. 133/2011 privind protecția datelor cu caracter personal.",
      "Folosim măsuri de securitate comerciale pentru a preveni accesul neautorizat, pentru a menține exactitatea datelor și pentru a asigura utilizarea corectă a informației de pe site. Transmiterea datelor pe internet sau prin rețea wireless nu poate fi protejată în totalitate. Prin urmare, la fel ca alte companii, nu putem garanta securitatea absolută a informației transmise, astfel încât Cumpărătorul face acest lucru pe propria răspundere.",
      "Nu colectăm și nu stocăm date bancare ale cardului (număr de card, data expirării, cod CVV). Acestea sunt introduse exclusiv pe pagina securizată a procesatorului de plăți.",
    ],
    note: "Datele cu caracter personal pot fi prelucrate și utilizate de către Vânzător în scopuri statistice și de promovare ulterioară, cu respectarea legislației în vigoare.",
  },
  {
    id: "confidentialitate",
    title: "Politica de confidențialitate",
    paragraphs: [
      "În conformitate cu prevederile Legii nr. 133/2011 privind protecția datelor cu caracter personal, furnizorul de servicii prelucrează date cu caracter personal cu bună-credință, în temeiul și în conformitate cu prevederile legale. Prelucrarea se realizează prin mijloace mixte (automate și manuale), cu respectarea cerințelor legale și în condiții care să asigure securitatea, confidențialitatea și respectarea drepturilor persoanelor vizate.",
      "Furnizorul colectează și prelucrează doar datele personale oferite de consumatori la efectuarea comenzii: nume, prenume, număr de telefon, adresă, adresă poștală și, opțional, adresa de e-mail.",
      "Datele personale sunt utilizate exclusiv în scopul administrării site-ului, pentru a permite accesul la informațiile disponibile, pentru livrarea comenzilor sau pentru a contacta consumatorul în vederea executării livrării. Prin prezenta informare, utilizatorii și consumatorii iau cunoștință despre faptul că li se vor prelucra și utiliza datele cu caracter personal furnizate prin navigarea, folosirea și înregistrarea pe site-ul challengestore.md.",
      "Orice informație furnizată de către utilizatorii și consumatorii site-ului va fi considerată și va reprezenta consimțământul expres ca datele personale să fie folosite de Furnizor în scopurile descrise mai sus.",
      "Furnizorul nu va dezvălui unei terțe părți niciuna dintre datele deținute, fără acordul persoanelor vizate, și nu va comercializa, schimba sau divulga aceste date cu alte persoane, cu excepțiile prevăzute de legislația în vigoare (la solicitarea instituțiilor publice, a organelor de drept sau a instanțelor de judecată, de asemenea autorizate să prelucreze date cu caracter personal).",
      "Datele pot fi transmise strict în măsura necesară către servicii de curierat (pentru livrare), furnizori de servicii IT și găzduire (pentru funcționarea site-ului) și procesatorul de plăți (pentru achitarea online).",
      "Furnizorul de servicii îndeplinește cerințele de securitate a datelor cu caracter personal și asigură protecția datelor consumatorilor împotriva pierderii, distrugerii, denaturării/falsificării sau divulgării către terțe persoane. Angajații furnizorului sunt obligați să respecte confidențialitatea datelor personale ale consumatorilor, iar prelucrarea este realizată de persoana împuternicită a Furnizorului.",
      "Site-ul utilizează cookie-uri și tehnologii similare pentru funcționarea corectă (coș de cumpărături, preferințe de limbă și temă) și pentru analiza traficului. Datele despre coș și favorite sunt păstrate local, în browserul dumneavoastră. Puteți dezactiva cookie-urile din setările browserului, însă unele funcții ale site-ului ar putea deveni indisponibile.",
      "În calitate de persoană vizată, aveți dreptul de acces, de rectificare, de ștergere, de opoziție și de a depune plângere la Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP). Pentru exercitarea acestor drepturi ne puteți scrie la contact@challengestore.md sau ne puteți suna la +373 60 000 000.",
    ],
  },
  {
    id: "comanda-si-plata",
    title: "Înregistrarea și achitarea comenzii",
    paragraphs: [
      "Comenzile se plasează direct pe site, prin completarea formularului de checkout cu datele de contact și adresa de livrare. După plasarea comenzii, un operator vă contactează telefonic pentru confirmarea detaliilor și a termenului de livrare. Contractul de vânzare-cumpărare se consideră încheiat la momentul confirmării comenzii de către operator.",
      "Este responsabilitatea Cumpărătorului să furnizeze date corecte și complete (nume, telefon, adresă). Nu ne asumăm răspunderea pentru imposibilitatea livrării cauzată de date eronate. Ne rezervăm dreptul de a refuza sau anula comenzi în caz de suspiciune de fraudă, comportament abuziv sau date incomplete.",
      "Achitarea comenzilor este posibilă prin următoarele metode:",
    ],
    list: [
      "Plată online cu cardul sau prin MIA QR — procesată prin maib, cu redirecționare pe pagina securizată a procesatorului;",
      "Plată la livrare — în numerar sau cu cardul, la primirea comenzii, pe baza bonului fiscal.",
    ],
    note: "Plata online se face în condiții de siguranță maximă, folosind cardul bancar, care permite efectuarea de tranzacții online. După efectuarea plății primiți o confirmare pe adresa de e-mail indicată la comandă.",
  },
  {
    id: "livrare",
    title: "Condiții de livrare",
    paragraphs: [
      "După înregistrarea comenzii, Cumpărătorului i se oferă informația privind data preconizată de transmitere a comenzii de către curieri/serviciul de livrare.",
      "Livrarea în raza municipiului Chișinău se efectuează în termen de 1–2 zile lucrătoare de la confirmarea comenzii de către operatorii noștri. Livrarea este gratuită pentru comenzile de minim 500 MDL; pentru comenzile cu valoare mai mică se achită livrarea de 50 MDL, inclusă în suma totală a tranzacției.",
      "Pentru alte localități din Republica Moldova, condițiile și termenul de livrare se confirmă individual de către operator la prelucrarea comenzii.",
      "În zilele de duminică sau sărbătoare națională nu se efectuează livrări. Termenul de livrare se poate extinde în anumite situații izolate (de exemplu: condiții meteo nefavorabile, perioadele sărbătorilor legale, probleme tehnice neprevăzute). Vă notificăm în prealabil în cazul în care întâmpinăm una dintre aceste situații.",
      "Puteți alege orice adresă pentru livrare — acasă, în oficiu sau oricare altă adresă, fără achitări suplimentare. Acceptăm o singură adresă de livrare pentru fiecare comandă; dacă aveți nevoie de livrare pe adrese diferite, vă rugăm să înregistrați comenzi separate.",
      "La primirea produselor, vă rugăm ca, în prezența curierului, să verificați integritatea ambalajului și prezența bonului fiscal. Eventualele pretenții ulterioare cu privire la aceste aspecte nu vor fi acceptate.",
    ],
  },
  {
    id: "retur",
    title: "Politica de retur",
    paragraphs: [
      "Conform Legii nr. 105/2003 privind protecția consumatorilor, Cumpărătorul are dreptul de a returna un produs procurat la distanță în termen de 14 zile de la ziua achitării, cu excepția produselor pentru care acest drept nu se aplică. Mijloacele bănești se returnează pe cardul de pe care s-a efectuat cumpărătura sau, pentru comenzile achitate la livrare, prin transfer bancar.",
      "Produsele alimentare de calitate corespunzătoare nu pot fi schimbate sau returnate, în conformitate cu Anexa nr. 2 a Hotărârii Guvernului nr. 1465 din 08.12.2003 (MO 248-253/19.12.2003), în redacția Hotărârii Guvernului nr. 1188 din 02.11.2007 (MO 175/09.11.2007), având în vedere natura și condițiile speciale de păstrare a acestora.",
      "Dacă ați primit un produs neconform (expirat, deteriorat, greșit sau cu ambalajul compromis), vă rugăm să ne contactați în termen de 24 de ore de la primire, cu o fotografie a produsului. Vom înlocui produsul sau vă vom rambursa integral contravaloarea acestuia, inclusiv costul livrării.",
      "Puteți anula comanda fără nicio penalitate înainte de expedierea acesteia, contactându-ne telefonic sau prin e-mail.",
    ],
    list: [
      "Contacte în caz de retur: +373 60 000 000 sau contact@challengestore.md;",
      "Termenul de procesare a cererii de retur: până la 14 zile calendaristice de la recepționarea cererii;",
      "Condiții de retur: ambalajul original intact, produsul nefolosit și nedeteriorat de Cumpărător, bonul fiscal sau confirmarea comenzii;",
      "Pentru produsele neconforme, fotografia produsului și numărul comenzii sunt obligatorii pentru soluționarea rapidă a cererii.",
    ],
    note: "Dreptul de retur în 14 zile, prevăzut pentru cumpărăturile online, nu se aplică produselor alimentare și altor produse care, prin natura lor, nu pot fi returnate din motive de igienă și siguranță alimentară.",
  },
];

const LAST_UPDATED = "25 noiembrie 2026";

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
              <a href="#contact">{SECTIONS.length + 1}. Datele de contact</a>
            </li>
          </ul>
        </aside>

        {/* Sections */}
        <div className={styles.content}>
          {/* Intro + key facts */}
          <section className={styles.introCard}>
            <p className={styles.introLead}>
              Prezenții Termeni și Condiții de utilizare a magazinului online
              challengestore.md sunt aplicabili comenzilor pentru achiziționarea
              produselor oferite de CG CAPITAL TRADING S.R.L. prin intermediul
              site-ului.
            </p>
            <p className={styles.introText}>
              Challenge Store comercializează produse alimentare importate —
              dulciuri, snacks-uri, băuturi și specialități de la branduri
              internaționale — cu livrare în municipiul Chișinău. Pentru
              folosirea în bune condiții a site-ului, vă recomandăm
              familiarizarea cu atenție a Termenilor și Condițiilor prezentate.
              Ne rezervăm dreptul de a face modificări ale acestor prevederi,
              fără o notificare prealabilă.
            </p>
            <div className={styles.facts}>
              <div className={styles.fact}>
                <BsCreditCard2Front size={18} />
                <span className={styles.factLabel}>Plată</span>
                <span className={styles.factValue}>
                  Card online prin maib sau la livrare
                </span>
              </div>
              <div className={styles.fact}>
                <BsTruck size={18} />
                <span className={styles.factLabel}>Livrare</span>
                <span className={styles.factValue}>
                  1–2 zile lucrătoare în Chișinău
                </span>
              </div>
              <div className={styles.fact}>
                <BsArrowCounterclockwise size={18} />
                <span className={styles.factLabel}>Retur</span>
                <span className={styles.factValue}>
                  14 zile pentru produsele nealimentare
                </span>
              </div>
              <div className={styles.fact}>
                <BsShieldCheck size={18} />
                <span className={styles.factLabel}>Date personale</span>
                <span className={styles.factValue}>
                  Protejate conform Legii nr. 133/2011
                </span>
              </div>
            </div>
          </section>

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
            <h2 className={styles.contactTitle}>
              {SECTIONS.length + 1}. Datele de contact
            </h2>
            <p className={styles.contactText}>
              Pentru orice întrebare legată de acești Termeni și Condiții, de
              comenzile tale sau de produsele noastre, ne poți contacta:
            </p>
            <div className={styles.contactRows}>
              <div className={styles.contactRow}>
                <BsGeoAlt size={17} />
                <span>
                  Denumirea juridică: CG CAPITAL TRADING S.R.L. · IDNO
                  1025600025386
                </span>
              </div>
              <div className={styles.contactRow}>
                <BsGeoAlt size={17} />
                <span>Adresa juridică și fizică: mun. Chișinău, Republica Moldova</span>
              </div>
              <div className={styles.contactRow}>
                <BsTelephone size={17} />
                <a href="tel:+37360000000">+373 60 000 000</a>
              </div>
              <div className={styles.contactRow}>
                <BsEnvelope size={17} />
                <a href="mailto:contact@challengestore.md">
                  contact@challengestore.md
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
