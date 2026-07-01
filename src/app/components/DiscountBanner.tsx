"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsGiftFill, BsX } from "react-icons/bs";
import Image from "next/image";
import styles from "./DiscountBanner.module.css";

const CONFETTI_COLORS = ["#01934A", "#00c25e", "#FF8A3D", "#FF6FAF", "#FFD66B", "#7C5CFF"];

type Piece = {
  id: number;
  left: number;
  driftX: number;
  fallY: number;
  rotate: number;
  delay: number;
  duration: number;
  color: string;
  w: number;
  h: number;
  round: boolean;
};

function makeConfetti(count: number): Piece[] {
  return Array.from({ length: count }).map((_, i) => {
    const round = Math.random() > 0.6;
    const size = Math.random() * 5 + 6;
    return {
      id: i,
      left: Math.random() * 100,
      driftX: (Math.random() - 0.5) * 80,
      fallY: typeof window !== "undefined" ? window.innerHeight * (0.7 + Math.random() * 0.5) : 700,
      rotate: (Math.random() - 0.5) * 720,
      delay: Math.random() * 0.25,
      duration: 1.3 + Math.random() * 1.1,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: round ? size : size * 0.6,
      h: round ? size : size * 1.4,
      round,
    };
  });
}

type Mode = "closed" | "full" | "mini";

export default function DiscountBanner() {
  const [mode, setMode] = useState<Mode>("closed");
  const [copied, setCopied] = useState(false);
  const confetti = useMemo(() => makeConfetti(60), []);

  useEffect(() => {
    const t = setTimeout(() => setMode("full"), 2200);
    return () => clearTimeout(t);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("WELCOME10");
    } catch {
      const el = document.createElement("textarea");
      el.value = "WELCOME10";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <AnimatePresence>
      {/* ── Full centered modal ── */}
      {mode === "full" && (
        <motion.div
          key="overlay"
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={() => setMode("mini")}
          role="dialog"
          aria-label="Ofertă specială"
        >
          {/* Confetti — full screen */}
          <div className={styles.confetti} aria-hidden="true">
            {confetti.map((c) => (
              <motion.span
                key={c.id}
                className={styles.piece}
                style={{
                  left: `${c.left}%`,
                  width: c.w,
                  height: c.h,
                  background: c.color,
                  borderRadius: c.round ? "50%" : "2px",
                }}
                initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
                animate={{ y: c.fallY, x: c.driftX, opacity: [0, 1, 1, 0], rotate: c.rotate }}
                transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }}
              />
            ))}
          </div>

          <div className={styles.cardContainer} onClick={(e) => e.stopPropagation()}>
            {/* Voucher card */}
            <motion.div
              className={styles.card}
              initial={{ scale: 0.82, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 120, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 240 }}
            >
              <div className={styles.content}>
                <div className={styles.brand}>
                  <Image
                    src="/img/logo.jpg"
                    alt="Challenge Store"
                    width={120}
                    height={40}
                    className={styles.brandLogo}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <h3 className={styles.heading}>
                  LA PRIMA COMANDĂ
                  <br />
                  <span className={styles.highlight}>ECONOMISEȘTI 10%</span>
                </h3>

                <div className={styles.divider} />

                <p className={styles.sub}>Folosește codul la checkout pentru reducere instant.</p>

                <button className={styles.codeBtn} onClick={copy} aria-label="Copiază codul WELCOME10">
                  <span className={styles.codeText}>WELCOME10</span>
                  <span className={styles.codeDivider} />
                  <span className={styles.codeCopy}>{copied ? "✓ Copiat!" : "Copiază"}</span>
                </button>
              </div>

              <div className={styles.giftPanel}>
                <BsGiftFill size={72} color="rgba(255,255,255,0.92)" />
              </div>

              <button className={styles.closeBtn} onClick={() => setMode("mini")} aria-label="Minimizează">
                <BsX size={20} />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ── Mini badge bottom-right ── */}
      {mode === "mini" && (
        <motion.div
          key="mini"
          className={styles.mini}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
        >
          <Image src="/img/logo.jpg" alt="" width={20} height={20} style={{ objectFit: "contain", borderRadius: 4 }} />
          <span className={styles.miniCode}>WELCOME10</span>
          <span className={styles.miniDot} />
          <span className={styles.miniDiscount}>-10%</span>
          <button className={styles.miniCopy} onClick={copy}>
            {copied ? "✓" : "Copiază"}
          </button>
          <button className={styles.miniClose} onClick={() => setMode("closed")} aria-label="Închide">
            <BsX size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
