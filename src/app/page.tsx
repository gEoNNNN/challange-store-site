import styles from "./page.module.css";
import ProductsSection from "./components/ProductsSection";
import PartnersSection from "./components/PartnersSection";
import ExploreSection from "./components/ExploreSection";
import Footer from "./components/Footer";
import DiscountBanner from "./components/DiscountBanner";
import CountdownSection from "./components/CountdownSection";
import HeroSection from "./components/HeroSection";

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
        <HeroSection />
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
