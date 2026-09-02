"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  errorType: string;
  desc: string;
  price: number;
  emoji: string;
  bg: string;
};

const PRODUCTS: Product[] = [
  {
    id: "marigold",
    name: "Malformed Marigold",
    errorType: "SyntaxError",
    desc: "Petals that never quite close. Every time you parse it, JSON weeps.",
    price: 19,
    emoji: "🌼",
    bg: "linear-gradient(135deg,#f4efdd,#e6dcb4)",
  },
  {
    id: "patience-fern",
    name: "Patience Fern",
    errorType: "Timeout",
    desc: "A calm, adaptable fern that thrives in gentle light and a little patience.",
    price: 28,
    emoji: "🌿",
    bg: "linear-gradient(135deg,#e9f1ea,#c9e3cf)",
  },
];

type CardState = { status: "idle" | "loading" | "error"; message?: string; kind?: string };

export default function Home() {
  const [state, setState] = useState<Record<string, CardState>>({});

  async function add(p: Product) {
    setState((s) => ({ ...s, [p.id]: { status: "loading" } }));
    try {
      const res = await fetch(`/api/plants/${p.id}`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setState((s) => ({
          ...s,
          [p.id]: {
            status: "error",
            kind: data.error ?? p.errorType,
            message: data.message ?? "Something went wrong.",
          },
        }));
        return;
      }
      setState((s) => ({ ...s, [p.id]: { status: "idle" } }));
    } catch {
      setState((s) => ({
        ...s,
        [p.id]: { status: "error", kind: "NetworkError", message: "Request failed." },
      }));
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="brand">
            <span className="mark">🌿</span>
            <span>Fernwood</span>
          </div>
          <span className="cart-pill">
            Cart <span className="cart-count">0</span>
          </span>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <h1>Bring a little green home.</h1>
          <p>Choose a plant for your space and add it to your cart.</p>
        </section>

        <section className="grid">
          {PRODUCTS.map((p) => {
            const st = state[p.id] ?? { status: "idle" };
            return (
              <article key={p.id} className="card">
                <div className="thumb" style={{ background: p.bg }}>
                  {p.emoji}
                </div>
                <div className="card-body">
                  <div className="card-head">
                    <span className="card-name">{p.name}</span>
                    <span className="err-chip">{p.errorType}</span>
                  </div>
                  <div className="card-desc">{p.desc}</div>
                  <div className="card-row">
                    <span className="price">${p.price}</span>
                    <button
                      className="btn"
                      onClick={() => add(p)}
                      disabled={st.status === "loading"}
                    >
                      {st.status === "loading" ? "Adding…" : "Add to cart"}
                    </button>
                  </div>
                  {st.status === "error" && (
                    <div className="card-error">
                      <strong>💥 {st.kind}</strong>
                      <span>{st.message}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

      </main>
    </>
  );
}
