"use client";
import { useEffect } from "react";
import posthog from "posthog-js";
import SignIn from "@/components/SignIn";

export default function Home() {
  useEffect(() => {
    posthog.capture("landing_viewed");
  }, []);

  return (
    <main
      style={{
        width: "min(calc(100% - 32px), 1280px)",
        margin: "24px auto",
        minHeight: "calc(100vh - 48px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          background: "var(--color-ink)",
          color: "var(--color-paper)",
          borderRadius: "var(--radius-section)",
          padding: "clamp(36px, 6vw, 80px) clamp(24px, 5vw, 64px)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "780px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontSize: "11px",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(255, 252, 245, 0.12)",
                color: "var(--color-lime)",
              }}
            >
              Signal / learn
            </span>
            <span style={{ fontSize: "12px", opacity: 0.6, color: "var(--color-paper)" }}>
              Feedback coach for AI-assisted work
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(42px, 6.5vw, 84px)",
              lineHeight: 0.94,
              letterSpacing: "-0.055em",
              fontWeight: 800,
              color: "var(--color-paper)",
            }}
          >
            Is your AI-assisted work <span style={{ color: "var(--color-lime)" }}>actually good?</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              lineHeight: 1.5,
              color: "rgba(255, 252, 245, 0.78)",
              maxWidth: "640px",
            }}
          >
            Bring one thing you made with AI — an email, a doc, or your understanding of something you&apos;re learning. Get specific feedback on whether it&apos;s good, and whether you&apos;re using AI well.
          </p>

          <div style={{ marginTop: "12px" }}>
            <SignIn />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            borderTop: "1px solid rgba(255, 252, 245, 0.15)",
            paddingTop: "24px",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(255, 252, 245, 0.5)", fontWeight: 700, marginRight: "8px" }}>
            Check any of:
          </span>
          {[
            { label: "Emails to leadership", rot: "-1deg" },
            { label: "Automation logic", rot: "1.5deg" },
            { label: "Strategy summaries", rot: "-2deg" },
            { label: "Concept understanding", rot: "1deg" },
          ].map((pill, idx) => (
            <span
              key={idx}
              style={{
                fontSize: "13px",
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(255, 252, 245, 0.08)",
                color: "var(--color-paper)",
                border: "1px solid rgba(255, 252, 245, 0.15)",
                transform: `rotate(${pill.rot})`,
              }}
            >
              {pill.label}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
