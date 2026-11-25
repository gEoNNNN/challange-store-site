import Image from "next/image";
import styles from "./PaymentLogos.module.css";

const LOGOS = [
  { src: "/maiblogo/maib.png", alt: "maib", width: 78, height: 22 },
  { src: "/maiblogo/visa.png", alt: "Visa", width: 40, height: 13 },
  { src: "/maiblogo/mastercard.png", alt: "Mastercard", width: 30, height: 19 },
  { src: "/maiblogo/amex.png", alt: "American Express", width: 20, height: 20 },
];

export default function PaymentLogos({ label }: { label?: string }) {
  return (
    <div className={styles.logos}>
      {label && <span className={styles.label}>{label}</span>}
      {LOGOS.map((logo) => (
        <Image key={logo.src} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} className={styles.logo} />
      ))}
    </div>
  );
}
