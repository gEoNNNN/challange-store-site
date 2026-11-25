"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BsArrowClockwise, BsCheckCircleFill, BsExclamationCircle, BsHourglassSplit } from "react-icons/bs";
import { useCart } from "../../context/CartContext";
import { COMPANY, SITE_NAME, SITE_URL } from "../../../lib/site";
import PaymentLogos from "../../components/PaymentLogos";
import styles from "../page.module.css";

const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

type PaymentState = "checking" | "paid" | "failed" | "pending" | "error";

type PaidOrderSummary = {
  code: string;
  total: number;
  currency: "MDL";
  paidAt: string | null;
  paymentMethod: "cod" | "maib";
  subtotal: number;
  shipping: number;
  items: { name: string; quantity: number; unitPrice: number }[];
};

const moneyFormatter = new Intl.NumberFormat("ro-MD", {
  style: "currency",
  currency: "MDL",
  minimumFractionDigits: 2,
});

const paidAtFormatter = new Intl.DateTimeFormat("ro-MD", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Chisinau",
});

function PaymentResult() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const clearCartRef = useRef(clearCart);
  const checkoutId = params.get("checkoutId");
  const orderId = params.get("orderId");
  const [state, setState] = useState<PaymentState>(checkoutId && orderId ? "checking" : "error");
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState<PaidOrderSummary | null>(null);

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
        const data = await response.json() as {
          ok: boolean;
          status?: "pending" | "paid" | "failed";
          order?: PaidOrderSummary | null;
        };
        if (!response.ok || !data.ok || !data.status) throw new Error("Status unavailable");
        if (data.status === "paid") {
          clearCartRef.current();
          setSummary(data.order ?? null);
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
        {state === "paid" && summary && (
          <div className={styles.resultDetails}>
            <div className={styles.resultDetailsRow}>
              <span>Număr comandă</span>
              <strong>#{summary.code}</strong>
            </div>
            <div className={styles.resultDetailsRow}>
              <span>Status plată</span>
              <strong>Confirmată</strong>
            </div>
            <div className={styles.resultDetailsRow}>
              <span>Data achitării</span>
              <strong>
                {summary.paidAt
                  ? paidAtFormatter.format(new Date(summary.paidAt))
                  : "Confirmată"}
              </strong>
            </div>
            <ul className={styles.resultItems}>
              {summary.items.map((item, index) => (
                <li key={index}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{moneyFormatter.format(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.resultDetailsRow}>
              <span>Subtotal</span>
              <strong>{moneyFormatter.format(summary.subtotal)}</strong>
            </div>
            {summary.shipping > 0 && (
              <div className={styles.resultDetailsRow}>
                <span>Livrare</span>
                <strong>{moneyFormatter.format(summary.shipping)}</strong>
              </div>
            )}
            <div className={styles.resultTotalRow}>
              <span>Total achitat</span>
              <strong>{moneyFormatter.format(summary.total)}</strong>
            </div>
            <div className={styles.resultDetailsRow}>
              <span>Comerciant</span>
              <strong>{COMPANY.legalName} (IDNO {COMPANY.idno})</strong>
            </div>
            <div className={styles.resultDetailsRow}>
              <span>Website / App</span>
              <strong>{SITE_NAME} ({SITE_DOMAIN})</strong>
            </div>
            <PaymentLogos label="Plăți procesate securizat de maib" />
          </div>
        )}
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
