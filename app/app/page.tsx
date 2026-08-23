"use client";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { getBrowserClient } from "@/lib/supabase/client";
import RoleConsent from "@/components/RoleConsent";
import PurposePicker from "@/components/PurposePicker";
import SubmissionForm from "@/components/SubmissionForm";
import FeedbackView from "@/components/FeedbackView";
import QuotaBanner from "@/components/QuotaBanner";
import ByoKeyModal from "@/components/ByoKeyModal";
import FeedbackWidget from "@/components/FeedbackWidget";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import type { EvaluationResult } from "@/lib/llm/types";

export default function AppPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [needsRole, setNeedsRole] = useState(false);
  const [stage, setStage] = useState<"pick" | "submit" | "feedback">("pick");
  const [type, setType] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [evaluationId, setEvaluationId] = useState("");
  const [remaining, setRemaining] = useState(-1);
  const [byo, setByo] = useState<{ key: string; provider: string } | undefined>();
  const [showByo, setShowByo] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Revise loop: prefill + parent-submission link.
  const [prefill, setPrefill] = useState<{ text: string; intent: string }>({ text: "", intent: "" });
  const [prevSubmissionId, setPrevSubmissionId] = useState<string | null>(null);
  const [lastText, setLastText] = useState("");
  const [lastIntent, setLastIntent] = useState("");
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  // Cross-session "continue where you left off".
  const [lastAvailable, setLastAvailable] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [improved, setImproved] = useState<boolean | null>(null);

  useEffect(() => {
    posthog.capture("app_opened");
    const sb = getBrowserClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        window.location.href = "/";
        return;
      }
      setUserId(data.user.id);
      const { data: p } = await sb.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      setNeedsRole(!p?.role);
      setRole(p?.role ?? null);
    });

    fetch("/api/last-submission")
      .then((r) => r.json())
      .then((j) => setLastAvailable(j.last))
      .catch(() => {});
  }, []);

  async function submit(d: {
    type: string;
    intent: string;
    text: string;
    instructionSummary?: string;
    doNotStore: boolean;
  }) {
    setBusy(true);
    const isRevision = Boolean(prevSubmissionId);
    posthog.capture("submission_created", { type: d.type, revision: isRevision });
    if (isRevision) posthog.capture("resubmitted", { type: d.type });

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...d,
          role,
          byoKey: byo?.key,
          byoProvider: byo?.provider,
          previousSubmissionId: prevSubmissionId,
        }),
      });

      const j = await res.json();
      setBusy(false);

      if (res.status === 401) {
        window.location.href = "/";
        return;
      }
      if (res.status === 429) {
        setRemaining(0);
        posthog.capture("quota_hit");
        setShowByo(true);
        return;
      }
      if (!res.ok) {
        alert(j.error || "Evaluation failed. Please try again.");
        return;
      }

      setResult(j.result);
      setEvaluationId(j.evaluationId);
      setRemaining(j.remaining);
      setLastText(d.text);
      setLastIntent(d.intent);
      setLastSubmissionId(j.submissionId);
      setImproved(j.improved ?? null);
      setPrevSubmissionId(null);
      setStage("feedback");
    } catch {
      setBusy(false);
      alert("A network error occurred. Please check your connection and try again.");
    }
  }

  function reviseSameWork() {
    setPrefill({ text: lastText, intent: lastIntent });
    setPrevSubmissionId(lastSubmissionId);
    setResult(null);
    setImproved(null);
    setStage("submit");
  }

  function checkSomethingNew() {
    setPrefill({ text: "", intent: "" });
    setPrevSubmissionId(null);
    setResult(null);
    setImproved(null);
    setStage("pick");
  }

  function continueLast() {
    if (!lastAvailable) return;
    posthog.capture("resumed_last_check");
    setResult(lastAvailable.result);
    setEvaluationId(lastAvailable.evaluationId);
    setLastText(lastAvailable.text);
    setLastIntent(lastAvailable.intent);
    setLastSubmissionId(lastAvailable.submissionId);
    setType(lastAvailable.type);
    setImproved(null);
    setStage("feedback");
  }

  if (!userId) {
    return (
      <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", color: "var(--theme-frame-text)" }}>
        Loading session…
      </div>
    );
  }

  if (needsRole) {
    return <RoleConsent userId={userId} onDone={() => setNeedsRole(false)} />;
  }

  return (
    <main
      style={{
        width: "min(calc(100% - 32px), 1280px)",
        margin: "24px auto 64px auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <section
        style={{
          background: "var(--theme-card-bg)",
          color: "var(--theme-card-text)",
          border: "1px solid var(--theme-card-border)",
          borderRadius: "var(--radius-section)",
          padding: "clamp(24px, 4vw, 48px)",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)",
        }}
      >
        {/* Navigation Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid var(--theme-card-border)",
            paddingBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/app" style={{ textDecoration: "none" }}><Logo height={26} /></a>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                padding: "3px 8px",
                borderRadius: "var(--radius-pill)",
                background: "var(--color-lime)",
                color: "var(--color-ink)",
              }}
            >
              Beta
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <QuotaBanner remaining={remaining} byoActive={!!byo} onUnlock={() => setShowByo(true)} />
            <button
              type="button"
              onClick={() => setShowFeedback(true)}
              style={{
                background: "none",
                border: "1px solid var(--theme-card-border)",
                borderRadius: "var(--radius-pill)",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--theme-card-text)",
                cursor: "pointer",
              }}
            >
              Tell us
            </button>
            <a
              href="/guide"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "none",
                border: "1px solid var(--theme-card-border)",
                borderRadius: "var(--radius-pill)",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--theme-card-text)",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Guide
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* Stage: Pick Purpose */}
        {stage === "pick" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {lastAvailable && (
              <div
                style={{
                  background: "var(--theme-card-surface)",
                  border: "1px solid var(--theme-card-border)",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--theme-card-text)" }}>
                    Resume your previous check
                  </div>
                  <div style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--theme-card-text-muted)" }}>
                    &ldquo;{lastAvailable.intent}&rdquo;
                  </div>
                </div>
                <button
                  onClick={continueLast}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--color-lime)",
                    color: "var(--color-ink)",
                    fontWeight: 700,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Continue check ↗
                </button>
              </div>
            )}

            {role && (
              <div style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400 }}>
                💡 As a <strong>{role}</strong>, try checking your latest email, summary, or doc.
              </div>
            )}

            <PurposePicker
              onPick={(t) => {
                setType(t);
                posthog.capture("type_selected", { type: t });
                setStage("submit");
              }}
            />
          </div>
        )}

        {/* Stage: Submit Form */}
        {stage === "submit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button
              onClick={() => setStage("pick")}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                color: "var(--color-blue)",
                fontWeight: 700,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              ← Change check type
            </button>
            <SubmissionForm
              type={type}
              busy={busy}
              onSubmit={submit}
              initialText={prefill.text}
              initialIntent={prefill.intent}
            />
          </div>
        )}

        {/* Stage: Feedback View */}
        {stage === "feedback" && result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {improved && (
              <div
                style={{
                  background: "rgba(89, 201, 149, 0.15)",
                  border: "1px solid rgba(89, 201, 149, 0.4)",
                  borderRadius: "var(--radius-pill)",
                  padding: "10px 20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1B7A42",
                }}
              >
                <span>🎉</span>
                <span>This version scored higher than your last one!</span>
              </div>
            )}

            <FeedbackView result={result} evaluationId={evaluationId} byo={byo} />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                borderTop: "1px solid var(--theme-card-border)",
                paddingTop: "24px",
              }}
            >
              <button
                onClick={reviseSameWork}
                style={{
                  padding: "14px 24px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--color-lime)",
                  color: "var(--color-ink)",
                  fontWeight: 800,
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Revise &amp; re-check this ↗
              </button>
              <button
                onClick={checkSomethingNew}
                style={{
                  padding: "14px 24px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--theme-card-surface)",
                  border: "1px solid var(--theme-card-border)",
                  color: "var(--theme-card-text)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Check something new
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {showByo && (
          <ByoKeyModal
            onSet={(k) => {
              setByo(k);
              setShowByo(false);
            }}
            onClose={() => setShowByo(false)}
          />
        )}

        {showFeedback && (
          <FeedbackWidget
            onClose={() => setShowFeedback(false)}
            trigger="header"
          />
        )}
      </section>
    </main>
  );
}
