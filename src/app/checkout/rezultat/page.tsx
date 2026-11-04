"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BsArrowClockwise, BsCheckCircleFill, BsExclamationCircle, BsHourglassSplit } from "react-icons/bs";
import { useCart } from "../../context/CartContext";
import styles from "../page.module.css";

type PaymentState = "checking" | "paid" | "failed" | "pending" | "error";

function PaymentResult() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const clearCartRef = useRef(clearCart);
  const checkoutId = params.get("checkoutId");
  const orderId = params.get("orderId");
  const [state, setState] = useState<PaymentState>(checkoutId && orderId ? "checking" : "error");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);

  useEffect(() => {
    if (!checkoutId || !orderId) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let checks = 0;
    const check = async () => {
      try {
        const query = new URLSearchParams({ checkoutId, orderId });
        const response = await fetch(`/api/payments/maib/status?${query}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json() as { ok: boolean; status?: "pending" | "paid" | "failed" };
        if (!response.ok || !data.ok || !data.status) throw new Error("Status unavailable");
        if (data.status === "paid") {
          clearCartRef.current();
          setState("paid");
          return;
        }
        if (data.status === "failed") {
          setState("failed");
          return;
        }
        checks++;
        if (checks < 5) timer = setTimeout(check, 1600);
        else setState("pending");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setState("error");
      }
    };
    check();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [attempt, checkoutId, orderId]);

  const retry = () => {
    setState("checking");
    setAttempt((value) => value + 1);
  };
  const content = state === "paid"
    ? {
        icon: <BsCheckCircleFill size={58} color="#01934A" />,
        title: "Plată confirmată!",
        text: <>Comanda <strong>#{orderId}</strong> a fost achitată și înregistrată. Confirmarea a fost trimisă pe email.</>,
      }
    : state === "failed"
      ? {
          icon: <BsExclamationCircle size={58} color="#dc2626" />,
          title: "Plata nu a fost finalizată",
          text: <>Comanda nu a fost achitată, iar produsele au fost eliberate din rezervare. Poți reveni în coș și încerca din nou.</>,
        }
      : state === "pending"
        ? {
            icon: <BsHourglassSplit size={54} color="#d97706" />,
            title: "Plata este în procesare",
            text: <>Confirmarea de la bancă poate dura câteva momente. Verifică din nou statutul înainte de a repeta plata.</>,
          }
        : state === "error"
          ? {
              icon: <BsExclamationCircle size={58} color="#dc2626" />,
              title: "Nu am putut verifica plata",
              text: <>Nu plasa încă o comandă. Reîncearcă verificarea sau contactează magazinul dacă problema persistă.</>,
            }
          : {
              icon: <span className={styles.resultSpinner} />,
              title: "Verificăm plata…",
              text: <>Așteptăm confirmarea securizată de la maib.</>,
            };

  return (
    <div className={styles.successPage}>
      <div className={styles.successCard}>
        <div className={styles.successIconWrap}>{content.icon}</div>
        <h1 className={styles.successTitle}>{content.title}</h1>
        <p className={styles.successSub}>{content.text}</p>
        {(state === "pending" || state === "error") && (
          <button className={styles.resultRetryBtn} onClick={retry}>
            <BsArrowClockwise size={16} /> Verifică din nou
          </button>
        )}
        {state === "paid" ? (
          <Link href="/produse" className={styles.successBtn}>Continuă cumpărăturile</Link>
        ) : state === "failed" ? (
          <Link href="/checkout" className={styles.successBtn}>Revino la comandă</Link>
        ) : null}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className={styles.successPage}><span className={styles.resultSpinner} /></div>}>
      <PaymentResult />
    </Suspense>
  );
}
