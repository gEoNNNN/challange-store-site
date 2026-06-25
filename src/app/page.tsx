import Image from "next/image";
import { BsCart3 } from "react-icons/bs";
import styles from "./page.module.css";
import ProductsSection from "./components/ProductsSection";
import PartnersSection from "./components/PartnersSection";
import ExploreSection from "./components/ExploreSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.bgBlobs} aria-hidden="true">
        <span className={styles.blob1} />
        <span className={styles.blob2} />
        <span className={styles.blob3} />
        <span className={styles.blob4} />
      </div>

      <div className={styles.glassLayer}>
      {/* Navbar */}
      <header className={styles.nav}>
        <div className={styles.navLogo}>
          <Image
            src="/img/logo.jpg"
            alt="Challenge Store logo"
            width={140}
            height={48}
            className={styles.navLogoImg}
            priority
          />
        </div>
        <nav className={styles.navLinks}>
          <a href="#" className={styles.navLinkActive}>Acasă</a>
          <a href="#produse">Produse</a>
          <a href="#despre">Despre noi</a>
          <a href="#recenzii">Recenzii</a>
        </nav>
        <div className={styles.navActions}>
          <a className={styles.navLogin} href="#login">Log in</a>
          <a className={styles.navCart} href="#cos" aria-label="Coș de cumpărături">
            <BsCart3 size={22} />
          </a>
          <a className={styles.navCta} href="#contact">Comandă</a>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1>
            Descoperă<br />
            <span className={styles.accent}>Gusturile</span>
            <br />
            Internaționale
          </h1>
          <p>
            Challenge Store aduce în Republica Moldova cele mai îndrăgite
            branduri internaționale — KitKat, Snickers, Kinder, Haribo,
            Oreo, Coca&#8209;Cola, Fanta și multe altele. Disponibile în
            magazinele noastre din Chișinău și prin livrare rapidă la
            ușa ta.
          </p>
          <div className={styles.heroBtns}>
            <a className={styles.btnPrimary} href="#produse">
              Cumpără acum
            </a>
            <a className={styles.btnSecondary} href="#produse">
              Vezi produsele
            </a>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.aura} aria-hidden="true" />
          <Image
            src="/img/candypack.png"
            alt="Pachet cu bomboane importate"
            width={900}
            height={900}
            className={styles.candyImg}
            priority
          />
        </div>
      </section>
      </div>

      <ProductsSection />
      <PartnersSection />
      <ExploreSection />
      <Footer />
    </div>
  );
}
