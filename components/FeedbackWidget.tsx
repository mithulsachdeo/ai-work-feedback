"use client";
import { useState } from "react";

const TAG_OPTIONS = [
  "Felt accurate",
  "Felt too generic",
  "Helped me improve my work",
  "Confusing to use",
  "Was too slow",
  "Something didn't work",
];

export default function FeedbackWidget({
  onClose,
  trigger = "header",
}: {
  onClose: () => void;
  trigger?: "header" | "nudge";
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const canSubmit = rating !== null && (selectedTags.length > 0 || comment.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/product-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          tags: selectedTags,
          comment: comment.trim(),
          page: typeof window !== "undefined" ? window.location.pathname : "/app",
        }),
      });

      if (!res.ok) {
        const j = await res.json();
        setErrorMsg(j.error || "Couldn't save feedback.");
        setBusy(false);
        return;
      }

      setSubmitted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("feedback_nudge_shown", "1");
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--theme-card-bg)",
          color: "var(--theme-card-text)",
          border: "1px solid var(--theme-card-border)",
          borderRadius: "var(--radius-card)",
          padding: "clamp(24px, 4vw, 36px)",
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        }}
      >
        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0", display: "grid", gap: "10px" }}>
            <div style={{ fontSize: "32px" }}>🙌</div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--theme-card-text)" }}>
              Thank you for the feedback!
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400 }}>
              Your input helps us make the coach more accurate and useful.
            </p>
          </div>
        ) : (
          <>
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
                {trigger === "nudge" ? "Quick Check-in" : "How's this tool working?"}
              </span>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                  color: "var(--theme-card-text)",
                }}
              >
                How was your experience?
              </h3>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400, marginTop: "4px" }}>
                Tell us how the feedback landed and what we should improve.
              </p>
            </div>

            {/* 1. Rating 1-5 */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--theme-card-text)" }}>
                Overall Rating (1–5)
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((num) => {
                  const isSelected = rating === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        borderRadius: "var(--radius-pill)",
                        border: `1px solid ${isSelected ? "var(--color-lime)" : "var(--theme-input-border)"}`,
                        background: isSelected ? "var(--color-lime)" : "var(--theme-input-bg)",
                        color: isSelected ? "var(--color-ink)" : "var(--theme-input-text)",
                        fontWeight: 800,
                        fontSize: "15px",
                        cursor: "pointer",
                        transition: "all var(--duration-fast) var(--ease-standard)",
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Tag checkboxes / pills */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--theme-card-text)" }}>
                What stood out? (select any)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {TAG_OPTIONS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-pill)",
                        border: `1px solid ${isSelected ? "var(--color-blue)" : "var(--theme-card-border)"}`,
                        background: isSelected ? "rgba(108, 99, 245, 0.2)" : "var(--theme-card-surface)",
                        color: isSelected ? "var(--color-blue)" : "var(--theme-card-text)",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all var(--duration-fast) var(--ease-standard)",
                      }}
                    >
                      {isSelected ? "✓ " : ""}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Optional Free text */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px", color: "var(--theme-card-text)" }}>
                Anything else? (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Tell us more about what worked or what felt off…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  border: "1px solid var(--theme-input-border)",
                  background: "var(--theme-input-bg)",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  color: "var(--theme-input-text)",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {errorMsg && (
              <p style={{ fontSize: "12px", color: "#d32f2f" }}>{errorMsg}</p>
            )}

            {/* 4. Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || busy}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--color-lime)",
                  color: "var(--color-ink)",
                  fontWeight: 800,
                  fontSize: "14px",
                  border: "none",
                  opacity: !canSubmit || busy ? 0.5 : 1,
                  cursor: !canSubmit || busy ? "not-allowed" : "pointer",
                }}
              >
                {busy ? "Sending…" : "Send ↗"}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 18px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--theme-card-surface)",
                  color: "var(--theme-card-text)",
                  border: "1px solid var(--theme-card-border)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
