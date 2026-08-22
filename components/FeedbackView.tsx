"use client";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { CRITERIA } from "@/constants";
import type { EvaluationResult, CriterionId, Level } from "@/lib/llm/types";
import SideQuestions from "./SideQuestions";
import FeedbackWidget from "./FeedbackWidget";

const LEVEL_STYLES: Record<Level, { bg: string; color: string; border: string; label: string }> = {
  Emerging: {
    bg: "rgba(255, 112, 67, 0.12)",
    color: "#D84315",
    border: "rgba(255, 112, 67, 0.35)",
    label: "Emerging",
  },
  Solid: {
    bg: "rgba(255, 193, 7, 0.14)",
    color: "#996500",
    border: "rgba(255, 193, 7, 0.4)",
    label: "Solid",
  },
  Strong: {
    bg: "rgba(89, 201, 149, 0.15)",
    color: "#1B7A42",
    border: "rgba(89, 201, 149, 0.45)",
    label: "Strong",
  },
};

export default function FeedbackView({
  result,
  evaluationId,
  byo,
}: {
  result: EvaluationResult;
  evaluationId: string;
  byo?: { key: string; provider: string };
}) {
  const [open, setOpen] = useState<CriterionId | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    posthog.capture("fix_viewed", { evaluationId });
    // Write the behavioral outcome (the north-star's gold signal).
    fetch("/api/outcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluationId, action: "viewed_fix" }),
    }).catch(() => {});

    // Check one-time feedback nudge
    if (typeof window !== "undefined" && !result.not_evaluable) {
      const seen = localStorage.getItem("feedback_nudge_shown");
      if (!seen) {
        setShowNudge(true);
      }
    }
  }, [evaluationId, result]);

  const dismissNudge = () => {
    setShowNudge(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("feedback_nudge_shown", "1");
    }
  };

  // Guardrail branch: the model returned "can't check this" instead of scores.
  if (result.not_evaluable) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(255, 112, 67, 0.3)",
          borderRadius: "var(--radius-card)",
          padding: "clamp(24px, 4vw, 36px)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <span
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontSize: "11px",
            fontWeight: 800,
            color: "#D84315",
          }}
        >
          Notice
        </span>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-ink)" }}>
          I couldn&apos;t check this submission
        </h2>
        <p style={{ fontSize: "15px", lineHeight: 1.5, color: "var(--color-ink)" }}>
          {result.reason}
        </p>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
          Try submitting a real, finished piece of work — an email, a doc, or your own explanation of a concept.
        </p>
      </div>
    );
  }

  const renderChip = (c: (typeof CRITERIA)[number]) => {
    const r = result.criteria[c.id as CriterionId];
    const style = LEVEL_STYLES[r.level];
    const isOpen = open === c.id;

    return (
      <button
        key={c.id}
        onClick={() => {
          const next = isOpen ? null : (c.id as CriterionId);
          setOpen(next);
          if (next) posthog.capture("criterion_expanded", { criterion: c.id });
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "var(--radius-pill)",
          background: isOpen ? "var(--color-ink)" : style.bg,
          color: isOpen ? "var(--color-paper)" : style.color,
          border: `1px solid ${isOpen ? "var(--color-ink)" : style.border}`,
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all var(--duration-fast) var(--ease-standard)",
        }}
      >
        <span>{c.label}</span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: "var(--radius-pill)",
            background: isOpen ? "rgba(255, 252, 245, 0.2)" : "rgba(255, 255, 255, 0.7)",
            color: isOpen ? "var(--color-paper)" : style.color,
          }}
        >
          {r.level}
        </span>
      </button>
    );
  };

  const selectedCriterion = open ? CRITERIA.find((c) => c.id === open) : null;
  const selectedResult = open ? result.criteria[open] : null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: "clamp(24px, 4vw, 36px)",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
      }}
    >
      {/* 1. Fix This First Headline Box */}
      <div
        style={{
          background: "var(--color-ink)",
          color: "var(--color-paper)",
          borderRadius: "24px",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--color-lime)",
            }}
          >
            Highest Priority
          </span>
        </div>
        <div
          style={{
            fontSize: "clamp(20px, 3vw, 26px)",
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          {result.fix_this_first}
        </div>
      </div>

      {/* 2. Layer 1 Rubric Chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontSize: "11px",
            fontWeight: 800,
            color: "var(--color-text-muted)",
          }}
        >
          Layer 1: Is the work good?
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {CRITERIA.filter((c) => c.layer === 1).map(renderChip)}
        </div>
      </div>

      {/* 3. Layer 2 Rubric Chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontSize: "11px",
            fontWeight: 800,
            color: "var(--color-text-muted)",
          }}
        >
          Layer 2: Did you use AI well?
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {CRITERIA.filter((c) => c.layer === 2).map(renderChip)}
        </div>
      </div>

      {/* 4. Progressive Disclosure Criterion Detail Panel */}
      {selectedCriterion && selectedResult && (
        <div
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-border)",
            borderRadius: "20px",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-ink)" }}>
              {selectedCriterion.label}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                background: LEVEL_STYLES[selectedResult.level].bg,
                color: LEVEL_STYLES[selectedResult.level].color,
                border: `1px solid ${LEVEL_STYLES[selectedResult.level].border}`,
              }}
            >
              {selectedResult.level}
            </span>
          </div>

          <div style={{ display: "grid", gap: "10px", fontSize: "14px", lineHeight: 1.5 }}>
            <div>
              <strong style={{ color: "var(--color-ink)" }}>What I saw: </strong>
              <span style={{ color: "var(--color-text-muted)" }}>{selectedResult.evidence}</span>
            </div>
            <div>
              <strong style={{ color: "var(--color-ink)" }}>Next step: </strong>
              <span style={{ color: "var(--color-text-muted)" }}>{selectedResult.next_step}</span>
            </div>
            <div>
              <strong style={{ color: "var(--color-ink)" }}>Standard: </strong>
              <span style={{ color: "var(--color-text-muted)" }}>{selectedResult.standard}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. One-time dismissible product feedback nudge */}
      {showNudge && (
        <div
          style={{
            background: "rgba(201, 255, 54, 0.12)",
            border: "1px solid rgba(201, 255, 54, 0.4)",
            borderRadius: "18px",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--color-ink)" }}>
            Got a sec? Tell us how this feedback landed for you.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => {
                setShowWidget(true);
                dismissNudge();
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                background: "var(--color-ink)",
                color: "var(--color-paper)",
                fontWeight: 700,
                fontSize: "12px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Give feedback ↗
            </button>
            <button
              onClick={dismissNudge}
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 6. Side-Questions Channel */}
      <SideQuestions context="reviewing your feedback" byo={byo} />

      {/* 7. Feedback Widget Modal if opened from nudge */}
      {showWidget && (
        <FeedbackWidget
          onClose={() => setShowWidget(false)}
          trigger="nudge"
        />
      )}
    </div>
  );
}
