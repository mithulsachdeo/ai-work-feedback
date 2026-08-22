"use client";
import { useEffect, useState, useRef } from "react";

const PILLS = [
  { label: "Before you hit send on that email", rot: "-1deg" },
  { label: "Before you post that update", rot: "1.5deg" },
  { label: "Before the client sees that proposal", rot: "-1.5deg" },
  { label: "Before you present those slides", rot: "1.2deg" },
  { label: "Before you ship that automation", rot: "-2deg" },
  { label: "Before you're asked to defend your understanding", rot: "1deg" },
];

export default function RotatingPills() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % PILLS.length);
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, prefersReducedMotion]);

  const current = PILLS[index];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        borderTop: "1px solid var(--theme-card-border)",
        paddingTop: "24px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          minHeight: "44px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "var(--theme-card-text-muted)",
            fontWeight: 700,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Moments like:
        </span>

        {/* Outer wrapper handles opacity + translation entrance; inner pill maintains constant rotation throughout */}
        <div
          key={index}
          style={{
            display: "inline-flex",
            alignItems: "center",
            animation: prefersReducedMotion ? "none" : "pillEntrance 350ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "14px",
              fontWeight: 700,
              padding: "8px 18px",
              borderRadius: "var(--radius-pill)",
              background: "var(--theme-card-surface)",
              color: "var(--theme-card-text)",
              border: "1px solid var(--theme-card-border)",
              transform: `rotate(${current.rot})`,
              transformOrigin: "center center",
            }}
          >
            {current.label}
          </div>
        </div>
      </div>

      {/* Dot Pagination */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingLeft: "2px",
        }}
        role="tablist"
        aria-label="Moments carousel"
      >
        {PILLS.map((pill, i) => {
          const isActive = i === index;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Slide ${i + 1}: ${pill.label}`}
              onClick={() => setIndex(i)}
              style={{
                width: isActive ? "18px" : "6px",
                height: "6px",
                borderRadius: "var(--radius-pill)",
                background: isActive ? "var(--color-lime)" : "var(--theme-card-border)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-standard)",
              }}
            />
          );
        })}
      </div>

      <style jsx>{`
        @keyframes pillEntrance {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
