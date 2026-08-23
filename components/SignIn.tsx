"use client";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

// Supabase enforces a per-address resend cooldown (default 60s). Gate the button locally so
// an impatient user can't hammer /auth/v1/otp into a cascade of 429s (seen in prod logs).
const RESEND_COOLDOWN_SECONDS = 60;

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const sb = getBrowserClient();
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function isRateLimit(msg: string) {
    const m = msg.toLowerCase();
    return m.includes("rate limit") || m.includes("too many") || m.includes("429") || m.includes("seconds");
  }

  async function magic() {
    if (!email || loading || cooldown > 0) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) {
        // On a rate-limit, don't surface Supabase's raw copy — start the cooldown and reassure.
        if (isRateLimit(error.message || "")) {
          setCooldown(RESEND_COOLDOWN_SECONDS);
          setErrorMsg("We just sent a link — check your inbox. You can try again in a moment.");
        } else {
          setErrorMsg(error.message || "Couldn't send sign-in link.");
        }
      } else {
        setSent(true);
        setCooldown(RESEND_COOLDOWN_SECONDS);
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
          color: "var(--theme-card-text)",
          marginTop: "16px",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "4px" }}>
          Check your email ↗
        </div>
        <p style={{ fontSize: "14px", color: "var(--theme-card-text-muted)" }}>
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
            border: "1px solid var(--theme-input-border)",
            background: "var(--theme-input-bg)",
            fontSize: "15px",
            color: "var(--theme-input-text)",
            outline: "none",
          }}
        />
        <button
          onClick={magic}
          disabled={!email || loading || cooldown > 0}
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
            opacity: !email || loading || cooldown > 0 ? 0.5 : 1,
            transition: "transform var(--duration-fast) var(--ease-standard)",
          }}
        >
          {loading ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Email me a link ↗"}
        </button>
      </div>
      {errorMsg && (
        <p style={{ fontSize: "13px", color: "#d32f2f", marginTop: "4px" }}>{errorMsg}</p>
      )}
    </div>
  );
}
