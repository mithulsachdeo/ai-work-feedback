"use client";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const sb = getBrowserClient();
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  async function magic() {
    if (!email) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) {
        setErrorMsg(error.message || "Couldn't send sign-in link.");
      } else {
        setSent(true);
      }
    } catch {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        style={{
          background: "rgba(201, 255, 54, 0.12)",
          border: "1px solid var(--color-lime)",
          borderRadius: "20px",
          padding: "20px 24px",
          color: "var(--color-ink)",
          marginTop: "16px",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "4px" }}>
          Check your email ↗
        </div>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
          We sent a sign-in link to <strong>{email}</strong>. Click it to begin.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "420px" }}>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="email"
          placeholder="you@work.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && email) magic(); }}
          style={{
            flex: "1 1 240px",
            padding: "14px 20px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-border)",
            background: "#ffffff",
            fontSize: "15px",
            color: "var(--color-ink)",
            outline: "none",
          }}
        />
        <button
          onClick={magic}
          disabled={!email || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px 24px",
            borderRadius: "var(--radius-pill)",
            background: "var(--color-lime)",
            color: "var(--color-ink)",
            fontWeight: 800,
            fontSize: "15px",
            border: "none",
            opacity: !email || loading ? 0.5 : 1,
            transition: "transform var(--duration-fast) var(--ease-standard)",
          }}
        >
          {loading ? "Sending…" : "Email me a link ↗"}
        </button>
      </div>
      {errorMsg && (
        <p style={{ fontSize: "13px", color: "#d32f2f", marginTop: "4px" }}>{errorMsg}</p>
      )}
    </div>
  );
}
