"use client";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "../context/LanguageContext";
import {
  BsGlobe2, BsTruck, BsShieldCheck, BsHeart, BsStars, BsBoxSeam,
  BsAward, BsPeople, BsLightningCharge, BsCheckCircleFill, BsArrowRight,
} from "react-icons/bs";
import Footer from "../components/Footer";
import styles from "./page.module.css";

const VALUE_ICONS = [<BsGlobe2 size={26} />, <BsShieldCheck size={26} />, <BsLightningCharge size={26} />, <BsHeart size={26} />];
const UNIQUE_ICONS = [<BsBoxSeam size={22} />, <BsGlobe2 size={22} />, <BsTruck size={22} />, <BsAward size={22} />];


export default function DesprePage() {
  const t = useTranslations();

  const VALUES = [
    { icon: VALUE_ICONS[0], title: t.aboutPage.value1Title, text: t.aboutPage.value1Text },
    { icon: VALUE_ICONS[1], title: t.aboutPage.value2Title, text: t.aboutPage.value2Text },
    { icon: VALUE_ICONS[2], title: t.aboutPage.value3Title, text: t.aboutPage.value3Text },
    { icon: VALUE_ICONS[3], title: t.aboutPage.value4Title, text: t.aboutPage.value4Text },
  ];
  const UNIQUE = [
    { icon: UNIQUE_ICONS[0], title: t.aboutPage.unique1Title, text: t.aboutPage.unique1Text },
    { icon: UNIQUE_ICONS[1], title: t.aboutPage.unique2Title, text: t.aboutPage.unique2Text },
    { icon: UNIQUE_ICONS[2], title: t.aboutPage.unique3Title, text: t.aboutPage.unique3Text },
    { icon: UNIQUE_ICONS[3], title: t.aboutPage.unique4Title, text: t.aboutPage.unique4Text },
  ];
  const TIMELINE = [
    { year: t.aboutPage.timeline1Year, title: t.aboutPage.timeline1Title, text: t.aboutPage.timeline1Text },
    { year: t.aboutPage.timeline2Year, title: t.aboutPage.timeline2Title, text: t.aboutPage.timeline2Text },
    { year: t.aboutPage.timeline3Year, title: t.aboutPage.timeline3Title, text: t.aboutPage.timeline3Text },
    { year: t.aboutPage.timeline4Year, title: t.aboutPage.timeline4Title, text: t.aboutPage.timeline4Text },
  ];
  const COMMITMENTS = [
    t.aboutPage.commit1, t.aboutPage.commit2, t.aboutPage.commit3,
    t.aboutPage.commit4, t.aboutPage.commit5, t.aboutPage.commit6,
  ];

  return (
    <div className={styles.page}>
      {/* ── HERO SECTION WITH VIDEO BACKGROUND ── */}
      <div className={styles.heroSection}>
        <video
          className={styles.heroVideo}
          src="/img/vid1.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ filter: 'blur(8px)', opacity: 0.3 }}
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        
        {/* ── HERO ── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
          <span className={styles.heroLabel}>{t.aboutPage.heroLabel}</span>
          <h1 className={styles.heroTitle}>
            {t.aboutPage.heroTitle} <span className={styles.accent}>{t.aboutPage.heroTitleAccent}</span><br />
            {t.aboutPage.heroTitleEnd}
          </h1>
          <p className={styles.heroText}>{t.aboutPage.heroText}</p>
          <div className={styles.heroBtns}>
            <Link href="/produse" className={styles.btnPrimary}>
              {t.aboutPage.heroCta} <BsArrowRight size={16} />
            </Link>
            <a href="#poveste" className={styles.btnSecondary}>{t.aboutPage.heroCtaSecondary}</a>
          </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className={styles.statsStrip}>
        <div className={styles.stat}>
          <BsPeople size={24} className={styles.statIcon} />
          <span className={styles.statNum}>10.000+</span>
          <span className={styles.statLabel}>{t.aboutPage.statClients}</span>
        </div>
        <div className={styles.stat}>
          <BsBoxSeam size={24} className={styles.statIcon} />
          <span className={styles.statNum}>500+</span>
          <span className={styles.statLabel}>{t.aboutPage.statProducts}</span>
        </div>
        <div className={styles.stat}>
          <BsGlobe2 size={24} className={styles.statIcon} />
          <span className={styles.statNum}>12</span>
          <span className={styles.statLabel}>{t.aboutPage.statCountries}</span>
        </div>
        <div className={styles.stat}>
          <BsStars size={24} className={styles.statIcon} />
          <span className={styles.statNum}>4.9</span>
          <span className={styles.statLabel}>{t.aboutPage.statRating}</span>
        </div>
        </section>
      </div>

      {/* ── BRAND STORY ── */}
      <section className={styles.storyFullWidth} id="poveste">
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
          <span className={styles.sectionLabel}>{t.aboutPage.storyLabel}</span>
          <h2 className={styles.sectionTitle}>{t.aboutPage.storyTitle}<br />{t.aboutPage.storyTitleAccent}</h2>
          <p>{t.aboutPage.storyP1}</p>
          <p>{t.aboutPage.storyP2}</p>
          <p>{t.aboutPage.storyP3}</p>
          <div className={styles.signature}>
            <span className={styles.sigName}>{t.aboutPage.sigName}</span>
            <span className={styles.sigRole}>{t.aboutPage.sigCity}</span>
          </div>
        </div>
      </section>

      {/* ── OUR LOCATIONS ── */}
      <section className={styles.locations}>
        <div className={styles.locationsHead}>
          <span className={styles.sectionLabel}>Magazinele Noastre</span>
          <h2 className={styles.sectionTitle}>Vino să ne vizitezi</h2>
          <p className={styles.locationsSub}>Avem 3 filiale în Chișinău, gata să te servească cu cele mai bune produse</p>
        </div>
        <div className={styles.locationsGrid}>
          <div className={styles.locationCard}>
            <div className={styles.locationImg}>
              <Image src="/img/photo1.jpg" alt="Filiala 1" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.locationInfo}>
              <h3 className={styles.locationName}>Filiala Centru</h3>
              <p className={styles.locationAddress}>Str. Ștefan cel Mare 123, Chișinău</p>
              <p className={styles.locationHours}>Luni-Duminică: 08:00 - 22:00</p>
            </div>
          </div>
          <div className={styles.locationCard}>
            <div className={styles.locationImg}>
              <Image src="/img/photo2.jpg" alt="Filiala 2" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.locationInfo}>
              <h3 className={styles.locationName}>Filiala Botanica</h3>
              <p className={styles.locationAddress}>Bd. Dacia 45, Chișinău</p>
              <p className={styles.locationHours}>Luni-Duminică: 08:00 - 22:00</p>
            </div>
          </div>
          <div className={styles.locationCard}>
            <div className={styles.locationImg}>
              <Image src="/img/photo3.jpg" alt="Filiala 3" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.locationInfo}>
              <h3 className={styles.locationName}>Filiala Rîșcani</h3>
              <p className={styles.locationAddress}>Str. Kiev 8, Chișinău</p>
              <p className={styles.locationHours}>Luni-Duminică: 08:00 - 22:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT MAKES US UNIQUE ── */}
      <section className={styles.unique}>
        <div className={styles.uniqueInner}>
          <div className={styles.uniqueLeft}>
            <span className={styles.sectionLabelLight}>{t.aboutPage.uniqueLabel}</span>
            <h2 className={styles.uniqueTitle}>{t.aboutPage.uniqueTitle} {t.aboutPage.uniqueTitleAccent}</h2>
            <p className={styles.uniqueText}>{t.aboutPage.uniqueText}</p>
            <Link href="/produse" className={styles.btnPrimary}>
              {t.aboutPage.uniqueCta} <BsArrowRight size={16} />
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
          <span className={styles.sectionLabel}>{t.aboutPage.timelineLabel}</span>
          <h2 className={styles.sectionTitle}>{t.aboutPage.timelineTitle}</h2>
        </div>
        <div className={styles.timelineTrack}>
          {TIMELINE.map((item, i) => (
            <div key={item.year} className={styles.milestone}>
              <div className={styles.milestoneDot}>{i + 1}</div>
              <span className={styles.milestoneYear}>{item.year}</span>
              <h4 className={styles.milestoneTitle}>{item.title}</h4>
              <p className={styles.milestoneText}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUALITY COMMITMENTS ── */}
      <section className={styles.commitments}>
        <div className={styles.commitImg}>
          <Image src="/img/photo1.jpg" alt="Calitate garantată"
            width={480} height={480} style={{ objectFit: "cover", borderRadius: 28 }} />
        </div>
        <div className={styles.commitText}>
          <span className={styles.sectionLabel}>{t.aboutPage.commitLabel}</span>
          <h2 className={styles.sectionTitle}>{t.aboutPage.commitTitle}<br />{t.aboutPage.commitTitleAccent}</h2>
          <p className={styles.commitIntro}>{t.aboutPage.commitIntro}</p>
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
          <h2 className={styles.ctaTitle}>{t.aboutPage.ctaTitle}</h2>
          <p className={styles.ctaText}>{t.aboutPage.ctaText}</p>
          <div className={styles.ctaBtns}>
            <Link href="/produse" className={styles.ctaPrimary}>
              {t.aboutPage.ctaPrimary} <BsArrowRight size={18} />
            </Link>
            <Link href="#contact" className={styles.ctaSecondary}>{t.aboutPage.ctaSecondary}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
