"use client";
import { useState } from "react";
import posthog from "posthog-js";

export default function ByoKeyModal({
  onSet,
  onClose,
}: {
  onSet: (k: { key: string; provider: string }) => void;
  onClose: () => void;
}) {
  const [provider, setProvider] = useState("anthropic");
  const [key, setKey] = useState("");

  const handleSubmit = () => {
    if (!key.trim()) return;
    posthog.capture("byo_key_added", { provider });
    onSet({ key: key.trim(), provider });
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
          padding: "36px",
          width: "100%",
          maxWidth: "460px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
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
            Frontier Models
          </span>
          <h3
            style={{
              fontSize: "24px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "var(--theme-card-text)",
            }}
          >
            Unlock unlimited, sharper checks
          </h3>
          <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", marginTop: "8px" }}>
            Paste your own API key. It stays in this browser session only — we never store it or send it anywhere except directly to the provider for your checks.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px", color: "var(--theme-card-text)" }}>
              Select Model Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "14px",
                border: "1px solid var(--theme-input-border)",
                background: "var(--theme-input-bg)",
                fontSize: "14px",
                color: "var(--theme-input-text)",
                outline: "none",
              }}
            >
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="gemini">Google Gemini (Paid tier key)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px", color: "var(--theme-card-text)" }}>
              API Key
            </label>
            <input
              type="password"
              placeholder="sk-… or your provider API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && key.trim()) handleSubmit();
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "14px",
                border: "1px solid var(--theme-input-border)",
                background: "var(--theme-input-bg)",
                fontSize: "14px",
                color: "var(--theme-input-text)",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!key.trim()}
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-lime)",
              color: "var(--color-ink)",
              fontWeight: 800,
              fontSize: "14px",
              border: "none",
              opacity: !key.trim() ? 0.5 : 1,
              cursor: !key.trim() ? "not-allowed" : "pointer",
            }}
          >
            Use my key ↗
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "14px 20px",
              borderRadius: "var(--radius-pill)",
              background: "var(--theme-card-surface)",
              color: "var(--theme-card-text)",
              border: "1px solid var(--theme-card-border)",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
