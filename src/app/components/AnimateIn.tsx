"use client";
import { motion, Variants } from "framer-motion";
import { ReactNode, ElementType } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface Props {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  as?: ElementType;
  style?: React.CSSProperties;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function AnimateIn({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.65,
  distance = 28,
  once = true,
  as: Tag = "div",
  style,
}: Props) {
  const initial =
    direction === "up"    ? { opacity: 0, y: distance }  :
    direction === "down"  ? { opacity: 0, y: -distance } :
    direction === "left"  ? { opacity: 0, x: distance }  :
    direction === "right" ? { opacity: 0, x: -distance } :
                            { opacity: 0 };

  const MotionTag = motion(Tag as "div");

  return (
    <MotionTag
      className={className}
      style={style}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration, delay, ease }}
    >
      {children}
    </MotionTag>
  );
}

/* ── Stagger container + item variants (export for direct use) ── */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};
