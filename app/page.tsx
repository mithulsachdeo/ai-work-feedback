"use client";
import { useEffect } from "react";
import posthog from "posthog-js";
import SignIn from "@/components/SignIn";
import ThemeToggle from "@/components/ThemeToggle";
import RotatingPills from "@/components/RotatingPills";

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
          background: "var(--theme-card-bg)",
          color: "var(--theme-card-text)",
          border: "1px solid var(--theme-card-border)",
          borderRadius: "var(--radius-section)",
          padding: "clamp(36px, 6vw, 80px) clamp(24px, 5vw, 64px)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "40px",
          position: "relative",
          overflow: "hidden",
          transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontSize: "11px",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                background: "var(--theme-card-surface)",
                color: "var(--color-lime)",
              }}
            >
              Signal / learn
            </span>
            <span style={{ fontSize: "12px", color: "var(--theme-card-text-muted)" }}>
              Feedback coach for AI-assisted work
            </span>
          </div>

          <ThemeToggle />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "780px" }}>
          <h1
            style={{
              fontSize: "clamp(42px, 6.5vw, 84px)",
              lineHeight: 0.94,
              letterSpacing: "-0.055em",
              fontWeight: 800,
              color: "var(--theme-card-text)",
            }}
          >
            Is your AI-assisted work <span style={{ color: "var(--color-lime)" }}>actually good?</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              lineHeight: 1.5,
              color: "var(--theme-card-text-muted)",
              maxWidth: "640px",
            }}
          >
            Bring one thing you made with AI — an email, a doc, or your understanding of something you&apos;re learning. Get specific feedback on whether it&apos;s good, and whether you&apos;re using AI well.
          </p>

          <div style={{ marginTop: "12px" }}>
            <SignIn />
          </div>
        </div>

        <RotatingPills />
        <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", margin: 0 }}>
          Automation checks need a chat-based AI that can explain what it built.
        </p>
      </section>
    </main>
  );
}
