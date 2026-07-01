"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CountdownSection.module.css";

const TARGET = new Date("2026-08-01T00:00:00");

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const UNITS = [
  { key: "days",    label: "Zile",    color: "#FF6FAF", emoji: "\uD83C\uDF6D" },
  { key: "hours",   label: "Ore",     color: "#FF8A3D", emoji: "\uD83C\uDF6B" },
  { key: "minutes", label: "Minute",  color: "#01934A", emoji: "\uD83C\uDF6C" },
  { key: "seconds", label: "Secunde", color: "#8B5CF6", emoji: "\uD83C\uDF88" },
] as const;

const FLOATERS = ["\uD83C\uDF6D", "\uD83C\uDF6C", "\uD83C\uDF88", "\uD83C\uDF89", "\uD83C\uDF6B", "\uD83E\uDDC1", "\uD83C\uDF6A", "\u2B50", "\uD83C\uDF7C", "\uD83C\uDF88", "\uD83C\uDF6D", "\uD83C\uDF89"];

export default function CountdownSection() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className={styles.section} id="aniversare">
      {/* Floating candy background */}
      <div className={styles.floaters} aria-hidden="true">
        {FLOATERS.map((emoji, i) => (
          <span key={i} className={styles.floater} style={{ "--i": i } as React.CSSProperties}>
            {emoji}
          </span>
        ))}
      </div>

      <div className={styles.inner}>
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: -16, rotate: -6 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
        >
          <span className={styles.badgeCake}>🎂</span> Petrecere de 1 an!
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring", bounce: 0.45 }}
        >
          Challenge Store împlinește <span className={styles.accent}>1&nbsp;An!</span>
        </motion.h2>

        <motion.p
          className={styles.sub}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Pe <strong>1 August 2026</strong> facem o mare petrecere cu surprize,
          dulciuri și cadouri! Numărăm împreună 🎉
        </motion.p>

        {/* Countdown */}
        <motion.div
          className={styles.countdown}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {UNITS.map(({ key, label, color, emoji }, idx) => (
            <motion.div
              key={key}
              className={styles.unit}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
            >
              <div className={styles.card} style={{ "--card-color": color } as React.CSSProperties}>
                <span className={styles.cardEmoji}>{emoji}</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={time[key]}
                    className={styles.number}
                    initial={{ y: "-100%", opacity: 0, scale: 0.6 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: "100%", opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
                  >
                    {pad(time[key])}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className={styles.label}>{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
