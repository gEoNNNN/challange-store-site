import Image from "next/image";
import Link from "next/link";
import {
  BsGlobe2, BsTruck, BsShieldCheck, BsHeart, BsStars, BsBoxSeam,
  BsAward, BsPeople, BsLightningCharge, BsCheckCircleFill, BsArrowRight,
} from "react-icons/bs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./page.module.css";

const VALUES = [
  { icon: <BsGlobe2 size={26} />,        title: "Autenticitate", text: "Aducem produse originale direct de la distribuitori autorizați din întreaga lume." },
  { icon: <BsShieldCheck size={26} />,   title: "Calitate garantată", text: "Fiecare produs trece prin verificări stricte de prospețime și conformitate." },
  { icon: <BsLightningCharge size={26} />, title: "Rapiditate", text: "Livrare rapidă în toată Moldova, direct la ușa ta în cel mai scurt timp." },
  { icon: <BsHeart size={26} />,         title: "Pasiune", text: "Iubim ceea ce facem — împărtășim gusturi care aduc bucurie clienților noștri." },
];

const UNIQUE = [
  { icon: <BsBoxSeam size={22} />,    title: "500+ produse internaționale", text: "De la KitKat și Snickers până la băuturi exotice asiatice." },
  { icon: <BsGlobe2 size={22} />,     title: "12 țări de origine", text: "SUA, Japonia, Coreea, China și cele mai bune branduri europene." },
  { icon: <BsTruck size={22} />,      title: "Livrare în toată Moldova", text: "Curierat rapid și ambalaj sigur pentru fiecare comandă." },
  { icon: <BsAward size={22} />,      title: "Distribuitori autorizați", text: "Colaborăm doar cu parteneri oficiali pentru produse 100% originale." },
];

const TIMELINE = [
  { year: "1 aug 2025",  title: "Primul magazin — Portmall", text: "Ne-am deschis porțile cu primul magazin Challenge Store în Portmall, Chișinău." },
  { year: "12 dec 2025", title: "Magazin în centrul Chișinăului", text: "Am adus dulciurile preferate în inima capitalei, în centrul orașului." },
  { year: "29 mai 2026", title: "Ne extindem la Bălți", text: "Am deschis un nou magazin în orașul Bălți, mai aproape de copiii de acolo." },
  { year: "1 aug 2026",  title: "1 an de Challenge Store", text: "Sărbătorim împlinirea unui an de la înființare, alături de voi." },
];

const COMMITMENTS = [
  "Produse 100% originale și verificate",
  "Termen de valabilitate garantat",
  "Ambalaj sigur pentru transport",
  "Suport clienți dedicat",
  "Retur simplu în 14 zile",
  "Prețuri corecte, fără surprize",
];

export default function DesprePage() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBlob1} aria-hidden="true" />
        <div className={styles.heroBlob2} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.heroLabel}>Despre Challenge Store</span>
          <h1 className={styles.heroTitle}>
            Aducem <span className={styles.accent}>gusturile lumii</span><br />
            mai aproape de tine
          </h1>
          <p className={styles.heroText}>
            Suntem pasionați de descoperirea celor mai îndrăgite dulciuri și
            băuturi internaționale, pe care le aducem direct în Republica Moldova
            — autentice, proaspete și gata să-ți încânte simțurile.
          </p>
          <div className={styles.heroBtns}>
            <Link href="/produse" className={styles.btnPrimary}>
              Explorează produsele <BsArrowRight size={16} />
            </Link>
            <a href="#poveste" className={styles.btnSecondary}>Povestea noastră</a>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className={styles.statsStrip}>
        <div className={styles.stat}>
          <BsPeople size={24} className={styles.statIcon} />
          <span className={styles.statNum}>10.000+</span>
          <span className={styles.statLabel}>Clienți fericiți</span>
        </div>
        <div className={styles.stat}>
          <BsBoxSeam size={24} className={styles.statIcon} />
          <span className={styles.statNum}>500+</span>
          <span className={styles.statLabel}>Produse importate</span>
        </div>
        <div className={styles.stat}>
          <BsGlobe2 size={24} className={styles.statIcon} />
          <span className={styles.statNum}>12</span>
          <span className={styles.statLabel}>Țări de origine</span>
        </div>
        <div className={styles.stat}>
          <BsStars size={24} className={styles.statIcon} />
          <span className={styles.statNum}>4.9</span>
          <span className={styles.statLabel}>Rating mediu</span>
        </div>
      </section>

      {/* ── BRAND STORY ── */}
      <section className={styles.story} id="poveste">
        <div className={styles.storyImg}>
          <div className={styles.storyImgAura} aria-hidden="true" />
          <video
            className={styles.storyVideoEl}
            src="/img/vid.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
        <div className={styles.storyText}>
          <span className={styles.sectionLabel}>Povestea noastră</span>
          <h2 className={styles.sectionTitle}>Totul a început<br />de la copiii noștri</h2>
          <p>
            Totul a pornit de la copiii noștri. Ca toți cei mici, își doreau
            mereu cele mai colorate și gustoase dulciuri — exact acele batoane,
            bomboane și băuturi speciale pe care le vedeau în desene animate sau
            la prietenii întorși din vacanțe. Problema era că acestea erau
            aproape imposibil de găsit în Moldova.
          </p>
          <p>
            Căutam prin zeci de magazine și tot nu găseam gusturile pe care și
            le doreau ai noștri copii. Atunci ne-a venit ideea: dacă noi ne
            dorim atât de mult aceste dulciuri pentru copiii noștri, cu
            siguranță și alți părinți și copii își doresc același lucru.
          </p>
          <p>
            Așa s-a născut <strong>Challenge Store</strong> — dintr-o dorință
            simplă și sinceră de a aduce bucuria dulciurilor din toată lumea
            mai aproape de familiile din Moldova. Astăzi aducem sute de produse
            originale din SUA, Japonia, Coreea, China și Europa, alese cu
            grijă, ca fiecare copil (și fiecare părinte) să-și găsească
            gustul preferat.
          </p>
          <div className={styles.signature}>
            <span className={styles.sigName}>Echipa Challenge Store</span>
            <span className={styles.sigRole}>Chișinău, Republica Moldova</span>
          </div>
        </div>
      </section>

      {/* ── MISSION & VALUES ── */}
      <section className={styles.values}>
        <div className={styles.valuesHead}>
          <span className={styles.sectionLabel}>Misiune & Valori</span>
          <h2 className={styles.sectionTitle}>Ce ne ghidează în fiecare zi</h2>
          <p className={styles.valuesSub}>
            Principiile care stau la baza fiecărei decizii și a fiecărui produs
            pe care îl aducem la tine.
          </p>
        </div>
        <div className={styles.valuesGrid}>
          {VALUES.map((v) => (
            <div key={v.title} className={styles.valueCard}>
              <div className={styles.valueIcon}>{v.icon}</div>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueText}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT MAKES US UNIQUE ── */}
      <section className={styles.unique}>
        <div className={styles.uniqueInner}>
          <div className={styles.uniqueLeft}>
            <span className={styles.sectionLabelLight}>De ce Challenge Store</span>
            <h2 className={styles.uniqueTitle}>Ce ne face<br />diferiți</h2>
            <p className={styles.uniqueText}>
              Nu suntem doar un magazin — suntem poarta ta către gusturile
              autentice ale lumii, cu garanția calității la fiecare pas.
            </p>
            <Link href="/produse" className={styles.btnWhite}>
              Vezi produsele <BsArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.uniqueGrid}>
            {UNIQUE.map((u) => (
              <div key={u.title} className={styles.uniqueCard}>
                <div className={styles.uniqueCardIcon}>{u.icon}</div>
                <h4 className={styles.uniqueCardTitle}>{u.title}</h4>
                <p className={styles.uniqueCardText}>{u.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className={styles.timeline}>
        <div className={styles.timelineHead}>
          <span className={styles.sectionLabel}>Parcursul nostru</span>
          <h2 className={styles.sectionTitle}>Momente importante</h2>
        </div>
        <div className={styles.timelineTrack}>
          {TIMELINE.map((t, i) => (
            <div key={t.year} className={styles.milestone}>
              <div className={styles.milestoneDot}>{i + 1}</div>
              <span className={styles.milestoneYear}>{t.year}</span>
              <h4 className={styles.milestoneTitle}>{t.title}</h4>
              <p className={styles.milestoneText}>{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUALITY COMMITMENTS ── */}
      <section className={styles.commitments}>
        <div className={styles.commitImg}>
          <Image src="/img/us.png" alt="Calitate garantată"
            width={480} height={480} style={{ objectFit: "contain" }} />
        </div>
        <div className={styles.commitText}>
          <span className={styles.sectionLabel}>Angajamentul nostru</span>
          <h2 className={styles.sectionTitle}>Calitate în care<br />poți avea încredere</h2>
          <p className={styles.commitIntro}>
            Fiecare produs din magazinul nostru respectă cele mai înalte
            standarde de calitate și autenticitate.
          </p>
          <ul className={styles.commitList}>
            {COMMITMENTS.map((c) => (
              <li key={c}>
                <BsCheckCircleFill size={18} className={styles.commitCheck} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Gata să descoperi gusturi noi?</h2>
          <p className={styles.ctaText}>
            Explorează colecția noastră de dulciuri și băuturi internaționale
            și lasă-te surprins de aromele lumii.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/produse" className={styles.ctaPrimary}>
              Explorează produsele <BsArrowRight size={18} />
            </Link>
            <Link href="#contact" className={styles.ctaSecondary}>Contactează-ne</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
