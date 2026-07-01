import Image from "next/image";
import styles from "./page.module.css";
import ProductsSection from "./components/ProductsSection";
import PartnersSection from "./components/PartnersSection";
import ExploreSection from "./components/ExploreSection";
import Footer from "./components/Footer";
import DiscountBanner from "./components/DiscountBanner";
import CountdownSection from "./components/CountdownSection";
import HomeNav from "./components/HomeNav";

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
      <HomeNav />

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
      <CountdownSection />
      <PartnersSection />
      <ExploreSection />
      <Footer />
      <DiscountBanner />
    </div>
  );
}
