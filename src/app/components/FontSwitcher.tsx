"use client";
import { useState } from "react";
import { useFontTheme, FONT_THEMES } from "../context/FontThemeContext";
import styles from "./FontSwitcher.module.css";

export default function FontSwitcher() {
  const { theme, setTheme } = useFontTheme();
  const [open, setOpen] = useState(false);

  const current = FONT_THEMES.find((f) => f.id === theme);

  return (
    <div className={styles.wrap}>
      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Font</span>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
            </div>
            {FONT_THEMES.map((ft) => (
              <button
                key={ft.id}
                className={`${styles.option} ${theme === ft.id ? styles.optionActive : ""}`}
                onClick={() => { setTheme(ft.id); setOpen(false); }}
              >
                <span className={styles.optionBadge}>{ft.label}</span>
                <span className={styles.optionPreview}>
                  <span
                    className={styles.previewHeading}
                    style={{ fontFamily: ft.headingVar }}
                  >
                    {ft.headingName}
                  </span>
                  <span
                    className={styles.previewBody}
                    style={{ fontFamily: ft.bodyVar }}
                  >
                    {ft.bodyName}
                  </span>
                </span>
                {theme === ft.id && <span className={styles.checkmark}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ""}`}
        onClick={() => setOpen(!open)}
        title="Schimbă fontul"
        aria-label="Schimbă fontul"
      >
        <span className={styles.fabAa} style={{ fontFamily: current?.headingVar }}>Aa</span>
      </button>
    </div>
  );
}
