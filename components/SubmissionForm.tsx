"use client";
import { useState } from "react";
import { PASTE_BOX_NUDGE, HIGH_STAKES_LINE, LATE_NIGHT_LINE } from "@/constants";

const GEN_PROMPT = "Explain the logic of what we built, step by step, as if to a smart colleague who'll maintain it.";

const HELP: Record<string, { title: string; desc: string }> = {
  work_product: {
    title: "Checking Finished Work",
    desc: "Paste the finished email, summary, doc, or deck text exactly as you'd send it.",
  },
  implementation_logic: {
    title: "Checking Automation & Logic",
    desc: "Don't have a written explanation? Copy the prompt below, run it with your AI, paste its raw answer below, then paste your corrected version underneath.",
  },
  concept_articulation: {
    title: "Checking Conceptual Understanding",
    desc: "In your own words, write what you think this is and how it works. Don't paste the AI's explanation — that defeats the check.",
  },
};

export default function SubmissionForm({
  type,
  onSubmit,
  busy,
  initialText = "",
  initialIntent = "",
}: {
  type: string;
  onSubmit: (d: {
    type: string;
    intent: string;
    text: string;
    originalDraft?: string;
    doNotStore: boolean;
  }) => void;
  busy: boolean;
  initialText?: string;
  initialIntent?: string;
}) {
  const [intent, setIntent] = useState(initialIntent);
  const [text, setText] = useState(initialText);
  const [originalDraft, setOriginalDraft] = useState("");
  const [doNotStore, setDoNotStore] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const isLateNight = new Date().getHours() >= 21 || new Date().getHours() < 5;
  const canSubmit = text.trim().length >= 20 && intent.trim().length >= 3;
  const helpInfo = HELP[type] ?? { title: "Submit Work", desc: "Paste your work below for evaluation." };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(GEN_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div
      style={{
        background: "var(--theme-card-surface)",
        border: "1px solid var(--theme-card-border)",
        borderRadius: "var(--radius-card)",
        padding: "clamp(24px, 4vw, 36px)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <div>
        <span
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontSize: "11px",
            fontWeight: 800,
            color: "var(--color-blue)",
            display: "inline-block",
            marginBottom: "6px",
          }}
        >
          {helpInfo.title}
        </span>
        <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--theme-card-text)" }}>
          {helpInfo.desc}
        </p>
        <div
          style={{
            fontSize: "13.5px",
            lineHeight: 1.5,
            fontWeight: 500,
            fontStyle: "italic",
            color: "var(--theme-delight-text)",
            transform: "rotate(-1.5deg)",
            transformOrigin: "left center",
            display: "inline-block",
            marginTop: "6px",
          }}
        >
          {isLateNight ? LATE_NIGHT_LINE : HIGH_STAKES_LINE}
        </div>
      </div>

      {type === "implementation_logic" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            onClick={handleCopyPrompt}
            style={{
              background: "rgba(108, 99, 245, 0.08)",
              border: "1px dashed var(--color-blue)",
              borderRadius: "16px",
              padding: "14px 18px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "13px", color: "var(--theme-card-text)", fontFamily: "monospace" }}>
              &ldquo;{GEN_PROMPT}&rdquo;
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-blue)",
                whiteSpace: "nowrap",
              }}
            >
              {copiedPrompt ? "Copied! ✓" : "Click to copy ↗"}
            </span>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--theme-card-text)",
                marginBottom: "6px",
              }}
            >
              1. AI&apos;s Original Draft (before your edits)
            </label>
            <textarea
              rows={5}
              placeholder="Paste the raw AI explanation here…"
              value={originalDraft}
              onChange={(e) => setOriginalDraft(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid var(--theme-input-border)",
                background: "var(--theme-input-bg)",
                fontSize: "14px",
                lineHeight: 1.5,
                color: "var(--theme-input-text)",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        </div>
      )}

      <div>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--theme-card-text)",
            marginBottom: "6px",
          }}
        >
          {type === "implementation_logic" ? "Purpose / context" : "What is this, and who is it for?"}
        </label>
        <input
          placeholder="e.g. email to my VP proposing we delay launch by a week"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "14px",
            border: "1px solid var(--theme-input-border)",
            background: "var(--theme-input-bg)",
            fontSize: "15px",
            color: "var(--theme-input-text)",
            outline: "none",
          }}
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--theme-card-text)",
            marginBottom: "6px",
          }}
        >
          {type === "implementation_logic"
            ? "2. Your Corrected Version (what did you fix or add?)"
            : "The work to evaluate"}
        </label>
        <textarea
          rows={type === "implementation_logic" ? 7 : 10}
          placeholder={
            type === "implementation_logic"
              ? "Now paste your corrected version — what did you fix, refine, or add?"
              : "Paste your work here (minimum 20 characters)…"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            border: "1px solid var(--theme-input-border)",
            background: "var(--theme-input-bg)",
            fontSize: "14px",
            lineHeight: 1.5,
            color: "var(--theme-input-text)",
            outline: "none",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
          <span style={{ fontSize: "11px", lineHeight: 1.5, color: "var(--theme-card-text-muted)" }}>
            {PASTE_BOX_NUDGE}
          </span>
          <span style={{ fontSize: "11px", lineHeight: 1.5, color: text.length >= 20 ? "var(--color-mint)" : "var(--theme-card-text-muted)" }}>
            {text.length} chars {text.length < 20 ? "(minimum 20)" : "✓"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderTop: "1px solid var(--theme-card-border)",
          paddingTop: "20px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            lineHeight: 1.5,
            color: "var(--theme-card-text-muted)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={doNotStore}
            onChange={(e) => setDoNotStore(e.target.checked)}
            style={{ width: "16px", height: "16px", accentColor: "var(--color-lime)" }}
          />
          Don&apos;t store this submission (we still check it, we just don&apos;t keep the text)
        </label>

        <button
          disabled={busy || !canSubmit}
          onClick={() =>
            onSubmit({
              type,
              intent,
              text,
              originalDraft: type === "implementation_logic" ? originalDraft : undefined,
              doNotStore,
            })
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            borderRadius: "var(--radius-pill)",
            background: "var(--color-lime)",
            color: "var(--color-ink)",
            fontWeight: 800,
            fontSize: "15px",
            border: "none",
            opacity: busy || !canSubmit ? 0.45 : 1,
            cursor: busy || !canSubmit ? "not-allowed" : "pointer",
            transition: "transform var(--duration-fast) var(--ease-standard)",
          }}
        >
          {busy ? "Checking…" : "Check it ↗"}
        </button>
      </div>
    </div>
  );
}
