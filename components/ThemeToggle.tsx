"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "1px solid var(--theme-card-border)",
        borderRadius: "var(--radius-pill)",
        padding: "6px 14px",
        fontSize: "12px",
        fontWeight: 700,
        color: "var(--theme-card-text)",
        cursor: "pointer",
        transition: "all var(--duration-fast) var(--ease-standard)",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span>{theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}</span>
    </button>
  );
}
