"use client";
import { useState } from "react";
import { PASTE_BOX_NUDGE, HIGH_STAKES_LINE, LATE_NIGHT_LINE } from "@/constants";

const GEN_PROMPT = "Explain the logic of what we built, step by step, as if to a smart colleague who'll maintain it.";
const SUMMARY_PROMPT = "Summarize, in order, what I asked you to build and any changes I requested.";

const HELP: Record<string, { title: string; desc: string }> = {
  work_product: {
    title: "Checking Finished Work",
    desc: "Paste the finished email, summary, doc, or deck text exactly as you'd send it.",
  },
  implementation_logic: {
    title: "Checking Automation & Logic",
    desc: "Works with any chat-based AI that can explain what it built — ChatGPT, Claude, Gemini, Copilot, Cursor, and similar. If your tool can't produce that explanation, this check can't help with it yet.",
  },
  concept_articulation: {
    title: "Checking Conceptual Understanding",
    desc: "In your own words, write what you think this is and how it works. Don't paste the AI's explanation — that defeats the check.",
  },
};

const INTENT_FIELD: Record<string, { label: string; placeholder: string }> = {
  work_product: {
    label: "What is this, and who is it for?",
    placeholder: "e.g. email to my VP proposing we delay launch by a week",
  },
  implementation_logic: {
    label: "What did you want to build?",
    placeholder: "e.g. a flow that files new invoices into the right client folder",
  },
  concept_articulation: {
    label: "What are you explaining, and to whom?",
    placeholder: "e.g. my understanding of how APIs work",
  },
};

function PromptScaffold({ prompt, copied, onCopy }: { prompt: string; copied: boolean; onCopy: () => void }) {
  return (
    <div
      onClick={onCopy}
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
        marginBottom: "12px",
      }}
    >
      <div style={{ fontSize: "13px", color: "var(--theme-card-text)", fontFamily: "monospace" }}>
        &ldquo;{prompt}&rdquo;
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
        {copied ? "Copied! ✓" : "Click to copy ↗"}
      </span>
    </div>
  );
}

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
    instructionSummary?: string;
    doNotStore: boolean;
  }) => void;
  busy: boolean;
  initialText?: string;
  initialIntent?: string;
}) {
  const [intent, setIntent] = useState(initialIntent);
  const [text, setText] = useState(initialText);
  const [instructionSummary, setInstructionSummary] = useState("");
  const [doNotStore, setDoNotStore] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const isImpl = type === "implementation_logic";
  const isLateNight = new Date().getHours() >= 21 || new Date().getHours() < 5;
  const canSubmit = text.trim().length >= 20 && intent.trim().length >= 3;
  const helpInfo = HELP[type] ?? { title: "Submit Work", desc: "Paste your work below for evaluation." };
  const intentField = INTENT_FIELD[type] ?? { label: "What is this, and who is it for?", placeholder: "e.g. email to my VP proposing we delay launch by a week" };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(GEN_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };
  const handleCopySummary = () => {
    navigator.clipboard.writeText(SUMMARY_PROMPT);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const labelStyle = { display: "block", fontSize: "13px", fontWeight: 700, color: "var(--theme-card-text)", marginBottom: "6px" } as const;
  const fieldBase = {
    width: "100%",
    border: "1px solid var(--theme-input-border)",
    background: "var(--theme-input-bg)",
    color: "var(--theme-input-text)",
    outline: "none",
  } as const;

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--color-blue)",
            }}
          >
            {helpInfo.title}
          </span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              lineHeight: 1.5,
              fontWeight: 500,
              color: "var(--theme-card-text-muted)",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-lavender)", flexShrink: 0 }} />
            <span>{isLateNight ? LATE_NIGHT_LINE : HIGH_STAKES_LINE}</span>
          </div>
        </div>
        <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--theme-card-text)" }}>
          {helpInfo.desc}
        </p>
      </div>

      {/* 1. Intent / goal */}
      <div>
        <label style={labelStyle}>
          {intentField.label}
        </label>
        <input
          placeholder={intentField.placeholder}
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          style={{ ...fieldBase, padding: "14px 16px", borderRadius: "14px", fontSize: "15px" }}
        />
      </div>

      {/* 2. The work / implementation doc (scored artifact) */}
      <div>
        <label style={labelStyle}>
          {isImpl ? "How the AI says it built it" : "The work to evaluate"}
        </label>
        {isImpl && <PromptScaffold prompt={GEN_PROMPT} copied={copiedPrompt} onCopy={handleCopyPrompt} />}
        <textarea
          rows={isImpl ? 8 : 10}
          placeholder={isImpl ? "Paste the AI's explanation of what it built and how…" : "Paste your work here (minimum 20 characters)…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ ...fieldBase, padding: "16px", borderRadius: "16px", fontSize: "14px", lineHeight: 1.5, resize: "vertical" }}
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

      {/* 3. Optional instruction summary (implementation_logic only) */}
      {isImpl && (
        <div>
          <label style={labelStyle}>
            The AI&apos;s summary of your instructions{" "}
            <span style={{ fontWeight: 400, color: "var(--theme-card-text-muted)" }}>(optional)</span>
          </label>
          <PromptScaffold prompt={SUMMARY_PROMPT} copied={copiedSummary} onCopy={handleCopySummary} />
          <textarea
            rows={4}
            placeholder="Optional — paste the AI's recap of what you asked for…"
            value={instructionSummary}
            onChange={(e) => setInstructionSummary(e.target.value)}
            style={{ ...fieldBase, padding: "16px", borderRadius: "16px", fontSize: "14px", lineHeight: 1.5, resize: "vertical" }}
          />
        </div>
      )}

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
              instructionSummary: isImpl ? instructionSummary : undefined,
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
