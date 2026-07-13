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

// Each plant maps to a distinct exception thrown by POST /api/cart/add.
const PRODUCTS: Product[] = [
  {
    id: "nullingia",
    name: "Nullingia",
    errorType: "TypeError",
    desc: "A hollow beauty — reach for a leaf and there's simply nothing there. Cannot read properties of null.",
    price: 32,
    emoji: "🪴",
    bg: "linear-gradient(135deg,#e7f2ea,#cfe6d6)",
  },
  {
    id: "recursa",
    name: "Recursa Infinitum",
    errorType: "RangeError",
    desc: "Grows into itself, watering itself watering itself watering itself… until the call stack finally gives out.",
    price: 44,
    emoji: "🎋",
    bg: "linear-gradient(135deg,#eef3e4,#d8e6c2)",
  },
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
    desc: "Fetches its sunlight from a very distant star. Always waiting, always times out.",
    price: 28,
    emoji: "🌿",
    bg: "linear-gradient(135deg,#e9f1ea,#c9e3cf)",
  },
  {
    id: "deadlock-dahlia",
    name: "Deadlock Dahlia",
    errorType: "DatabaseError",
    desc: "Two roots, one pot, and neither will yield. The transaction rolls back in a huff.",
    price: 37,
    emoji: "🌺",
    bg: "linear-gradient(135deg,#f2e7ee,#e2c6d6)",
  },
  {
    id: "ghost-orchid",
    name: "Ghost Orchid",
    errorType: "ReferenceError",
    desc: "Famously hard to find in the wild. Also famously undefined — its watering schedule is not defined.",
    price: 49,
    emoji: "👻",
    bg: "linear-gradient(135deg,#eef0f3,#d3d8e2)",
  },
];

type CardState = { status: "idle" | "loading" | "error"; message?: string; kind?: string };

export default function Home() {
  const [state, setState] = useState<Record<string, CardState>>({});

  async function add(p: Product) {
    setState((s) => ({ ...s, [p.id]: { status: "loading" } }));
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: p.id }),
      });
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
          <h1>Plants that break beautifully.</h1>
          <p>
            Every plant on this shelf fails in its own special way. Add one to
            your cart to watch it happen.
          </p>
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

        <p className="footnote">
          Fernwood is a demo storefront. Every “Add to cart” throws a real,
          intentional server error to generate telemetry.
        </p>
      </main>
    </>
  );
}
