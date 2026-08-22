"use client";
import { useState, useEffect } from "react";
import posthog from "posthog-js";

export default function SideQuestions({
  context,
  evaluationId,
  initialSuggestions = [],
  byo,
}: {
  context: string;
  evaluationId: string;
  initialSuggestions?: string[];
  byo?: { key: string; provider: string };
}) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [askedCount, setAskedCount] = useState(0);

  useEffect(() => {
    setSuggestions(initialSuggestions);
    setAskedCount(0);
    setBlocked(false);
    setA("");
    setQ("");
  }, [evaluationId, initialSuggestions]);

  async function handleAsk(questionText: string) {
    const text = questionText.trim();
    if (!text || busy || blocked) return;

    posthog.capture("side_question_asked", { evaluationId, byo: Boolean(byo) });
    setBusy(true);
    setA("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          context,
          evaluationId,
          byoKey: byo?.key,
          byoProvider: byo?.provider,
        }),
      });

      const j = await res.json();

      if (res.status === 429) {
        setBlocked(true);
        setSuggestions([]);
        setA(j.error || "You've reached the question limit for now.");
        return;
      }

      if (!res.ok) {
        setA(j.error || "Couldn't reach the coach right now. Please try again.");
        return;
      }

      setA(j.answer || "No answer received.");
      setSuggestions(Array.isArray(j.suggestions) ? j.suggestions : []);
      setAskedCount((prev) => prev + 1);
      setQ("");
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--theme-card-text)", marginBottom: "4px" }}>
            Have a question about this feedback?
          </div>
          <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400 }}>
            Ask for clarification, how to rephrase a section, or how to verify a fact.
          </p>
        </div>
        {askedCount > 0 && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--theme-card-text-muted)",
              background: "var(--theme-card-surface)",
              padding: "3px 8px",
              borderRadius: "var(--radius-pill)",
            }}
          >
            {askedCount} asked
          </span>
        )}
      </div>

      {/* Suggested Question Chips */}
      {suggestions.length > 0 && !blocked && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 800,
              color: "var(--color-blue)",
            }}
          >
            Suggested follow-ups
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {suggestions.map((sugg, idx) => (
              <button
                key={idx}
                type="button"
                disabled={busy || blocked}
                onClick={() => handleAsk(sugg)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--theme-card-surface)",
                  color: "var(--theme-card-text)",
                  border: "1px solid var(--theme-card-border)",
                  fontSize: "13px",
                  fontWeight: 600,
                  textAlign: "left",
                  cursor: busy || blocked ? "not-allowed" : "pointer",
                  transition: "all var(--duration-fast) var(--ease-standard)",
                  opacity: busy || blocked ? 0.6 : 1,
                }}
              >
                <span>💬 {sugg}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Row */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          placeholder={blocked ? "Question limit reached" : "e.g. How can I make paragraph 2 clearer?"}
          value={q}
          disabled={busy || blocked}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) handleAsk(q);
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
            opacity: blocked ? 0.6 : 1,
          }}
        />
        <button
          type="button"
          onClick={() => handleAsk(q)}
          disabled={busy || blocked || !q.trim()}
          style={{
            padding: "12px 22px",
            borderRadius: "var(--radius-pill)",
            background: "var(--theme-card-surface-hover)",
            color: "var(--theme-card-text)",
            border: "1px solid var(--theme-card-border)",
            fontWeight: 800,
            fontSize: "14px",
            opacity: busy || blocked || !q.trim() ? 0.5 : 1,
            cursor: busy || blocked || !q.trim() ? "not-allowed" : "pointer",
            transition: "transform var(--duration-fast) var(--ease-standard)",
          }}
        >
          {busy ? "Thinking…" : "Ask coach ↗"}
        </button>
      </div>

      {/* Coach Response Display */}
      {a && (
        <div
          style={{
            background: blocked ? "rgba(255, 112, 67, 0.1)" : "rgba(108, 99, 245, 0.1)",
            border: `1px solid ${blocked ? "rgba(255, 112, 67, 0.3)" : "rgba(108, 99, 245, 0.3)"}`,
            borderRadius: "18px",
            padding: "16px 20px",
            fontSize: "14px",
            lineHeight: 1.5,
            color: "var(--theme-card-text)",
            fontWeight: 400,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: blocked ? "#FF8A65" : "var(--color-blue)",
              marginBottom: "6px",
            }}
          >
            {blocked ? "Limit Notice" : "Coach response"}
          </div>
          <p>{a}</p>
        </div>
      )}
    </div>
  );
}
