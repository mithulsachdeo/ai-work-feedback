"use client";
import { useState } from "react";
import posthog from "posthog-js";

export default function SideQuestions({
  context,
  byo,
}: {
  context: string;
  byo?: { key: string; provider: string };
}) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    if (!q.trim() || busy) return;
    posthog.capture("side_question_asked");
    setBusy(true);
    setA("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          context,
          byoKey: byo?.key,
          byoProvider: byo?.provider,
        }),
      });
      const j = await res.json();
      setA(j.answer || j.error || "No answer received.");
    } catch {
      setA("Couldn't reach the coach right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        marginTop: "20px",
        borderTop: "1px solid var(--theme-card-border)",
        paddingTop: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--theme-card-text)", marginBottom: "4px" }}>
          Have a question about this feedback?
        </div>
        <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400 }}>
          Ask for clarification, how to rephrase a section, or how to verify a fact.
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          placeholder="e.g. How can I make paragraph 2 clearer?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) ask();
          }}
          style={{
            flex: "1 1 240px",
            padding: "12px 18px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--theme-input-border)",
            background: "var(--theme-input-bg)",
            fontSize: "14px",
            color: "var(--theme-input-text)",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={ask}
          disabled={busy || !q.trim()}
          style={{
            padding: "12px 22px",
            borderRadius: "var(--radius-pill)",
            background: "var(--theme-card-surface-hover)",
            color: "var(--theme-card-text)",
            border: "1px solid var(--theme-card-border)",
            fontWeight: 800,
            fontSize: "14px",
            opacity: busy || !q.trim() ? 0.5 : 1,
            cursor: busy || !q.trim() ? "not-allowed" : "pointer",
            transition: "transform var(--duration-fast) var(--ease-standard)",
          }}
        >
          {busy ? "Thinking…" : "Ask coach ↗"}
        </button>
      </div>

      {a && (
        <div
          style={{
            background: "rgba(108, 99, 245, 0.1)",
            border: "1px solid rgba(108, 99, 245, 0.3)",
            borderRadius: "18px",
            padding: "16px 20px",
            fontSize: "14px",
            lineHeight: 1.5,
            color: "var(--theme-card-text)",
            fontWeight: 400,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-blue)", marginBottom: "6px" }}>
            Coach response
          </div>
          <p>{a}</p>
        </div>
      )}
    </div>
  );
}
