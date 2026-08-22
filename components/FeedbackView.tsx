"use client";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { CRITERIA } from "@/constants";
import type { EvaluationResult, CriterionId, Level } from "@/lib/llm/types";
import SideQuestions from "./SideQuestions";
import FeedbackWidget from "./FeedbackWidget";

const LEVEL_STYLES: Record<Level, { bg: string; color: string; border: string; badgeBg: string; badgeColor: string; label: string }> = {
  Emerging: {
    bg: "var(--level-emerging-bg)",
    color: "var(--level-emerging-fg)",
    border: "var(--level-emerging-border)",
    badgeBg: "var(--level-emerging-badge-bg)",
    badgeColor: "var(--level-emerging-badge-fg)",
    label: "Emerging",
  },
  Solid: {
    bg: "var(--level-solid-bg)",
    color: "var(--level-solid-fg)",
    border: "var(--level-solid-border)",
    badgeBg: "var(--level-solid-badge-bg)",
    badgeColor: "var(--level-solid-badge-fg)",
    label: "Solid",
  },
  Strong: {
    bg: "var(--level-strong-bg)",
    color: "var(--level-strong-fg)",
    border: "var(--level-strong-border)",
    badgeBg: "var(--level-strong-badge-bg)",
    badgeColor: "var(--level-strong-badge-fg)",
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
    fetch("/api/outcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluationId, action: "viewed_fix" }),
    }).catch(() => {});

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

  if (result.not_evaluable) {
    return (
      <div
        style={{
          background: "var(--theme-card-surface)",
          border: "1px solid rgba(255, 112, 67, 0.4)",
          borderRadius: "var(--radius-card)",
          padding: "clamp(24px, 4vw, 36px)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          color: "var(--theme-card-text)",
        }}
      >
        <span
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontSize: "11px",
            fontWeight: 800,
            color: "#FF8A65",
          }}
        >
          Notice
        </span>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--theme-card-text)" }}>
          I couldn&apos;t check this submission
        </h2>
        <p style={{ fontSize: "15px", lineHeight: 1.5, color: "var(--theme-card-text)" }}>
          {result.reason}
        </p>
        <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400 }}>
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
          background: isOpen ? "var(--color-lime)" : style.bg,
          color: isOpen ? "var(--color-ink)" : style.color,
          border: `1px solid ${isOpen ? "var(--color-lime)" : style.border}`,
          fontSize: "13px",
          fontWeight: 800,
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
            background: isOpen ? "rgba(23, 25, 25, 0.15)" : style.badgeBg,
            color: isOpen ? "var(--color-ink)" : style.badgeColor,
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
        background: "var(--theme-card-surface)",
        border: "1px solid var(--theme-card-border)",
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
          background: "var(--theme-card-bg)",
          color: "var(--theme-card-text)",
          border: "1px solid var(--theme-card-border)",
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
            color: "var(--theme-card-text-muted)",
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
            color: "var(--theme-card-text-muted)",
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
            background: "var(--theme-card-bg)",
            border: "1px solid var(--theme-card-border)",
            borderRadius: "20px",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--theme-card-text)" }}>
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
              <strong style={{ color: "var(--theme-card-text)" }}>What I saw: </strong>
              <span style={{ color: "var(--theme-card-text-muted)" }}>{selectedResult.evidence}</span>
            </div>
            <div>
              <strong style={{ color: "var(--theme-card-text)" }}>Next step: </strong>
              <span style={{ color: "var(--theme-card-text-muted)" }}>{selectedResult.next_step}</span>
            </div>
            <div>
              <strong style={{ color: "var(--theme-card-text)" }}>Standard: </strong>
              <span style={{ color: "var(--theme-card-text-muted)" }}>{selectedResult.standard}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. One-time dismissible product feedback nudge */}
      {showNudge && (
        <div
          style={{
            background: "var(--theme-card-bg)",
            border: "1px solid var(--theme-card-border)",
            borderRadius: "18px",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--theme-card-text)", fontWeight: 400 }}>
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
                background: "var(--color-lime)",
                color: "var(--color-ink)",
                fontWeight: 800,
                fontSize: "12px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Share your thoughts ↗
            </button>
            <button
              onClick={dismissNudge}
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: "var(--theme-card-text-muted)",
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
      <SideQuestions
        context="reviewing your feedback"
        evaluationId={evaluationId}
        initialSuggestions={result.suggested_questions}
        byo={byo}
      />

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
