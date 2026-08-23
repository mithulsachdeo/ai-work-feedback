"use client";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

// Email + password auth with NO email verification (Supabase "Confirm email" is OFF, so no
// email is ever sent — this is what removes the rate limit and the magic-link cross-browser
// bug). Email may be fake; it is only an identifier and is never stored in content tables.
const MIN_PASSWORD = 8;

export default function SignIn() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const sb = getBrowserClient();

  function mapError(raw: string): string {
    const m = raw.toLowerCase();
    if (m.includes("already registered") || m.includes("already exists"))
      return "That email is already registered — switch to Log in.";
    if (m.includes("invalid login") || m.includes("invalid credentials"))
      return "Wrong email or password.";
    if (m.includes("password")) return `Password must be at least ${MIN_PASSWORD} characters.`;
    return raw || "Something went wrong — please try again.";
  }

  async function submit() {
    if (!email || !password || loading) return;
    if (mode === "signup" && password.length < MIN_PASSWORD) {
      setErrorMsg(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } =
        mode === "signup"
          ? await sb.auth.signUp({ email, password })
          : await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(mapError(error.message || ""));
        setLoading(false);
        return;
      }
      // "Confirm email" is off, so both flows return a live session immediately. The SSR cookie
      // is set by the browser client; /app reads it server-side on the next request.
      window.location.href = "/app";
    } catch {
      setErrorMsg("An unexpected error occurred.");
      setLoading(false);
    }
  }

  // Visual-only base; sizing is set per field so a flex-basis never leaks onto the wrong axis
  // (the email field is a column child — a horizontal `flex-basis` there becomes its height).
  const baseInput = {
    padding: "14px 20px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--theme-input-border)",
    background: "var(--theme-input-bg)",
    fontSize: "15px",
    color: "var(--theme-input-text)",
    outline: "none",
    boxSizing: "border-box",
  } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "420px" }}>
      <input
        type="email"
        placeholder="you@work.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && email && password) submit(); }}
        style={{ ...baseInput, width: "100%" }}
      />
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="password"
          placeholder={mode === "signup" ? "Choose a password (8+ characters)" : "Your password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && email && password) submit(); }}
          style={{ ...baseInput, flex: "1 1 200px", minWidth: 0 }}
        />
        <button
          onClick={submit}
          disabled={!email || !password || loading}
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
            opacity: !email || !password || loading ? 0.5 : 1,
            transition: "transform var(--duration-fast) var(--ease-standard)",
          }}
        >
          {loading ? "…" : mode === "signup" ? "Create account ↗" : "Log in ↗"}
        </button>
      </div>

      {errorMsg && <p style={{ fontSize: "13px", color: "#d32f2f", margin: 0 }}>{errorMsg}</p>}

      {mode === "signup" && (
        <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", margin: 0 }}>
          Use a password you&apos;ll remember — there&apos;s no recovery.
        </p>
      )}

      <button
        type="button"
        onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErrorMsg(""); }}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          padding: 0,
          fontSize: "13px",
          fontWeight: 700,
          color: "var(--color-blue)",
          cursor: "pointer",
        }}
      >
        {mode === "signup" ? "Already have an account? Log in" : "Need an account? Create one"}
      </button>
    </div>
  );
}
