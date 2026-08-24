"use client";
import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { getBrowserClient } from "@/lib/supabase/client";

// Icon at rest; first tap expands to a "Sign out?" confirm (there's no password recovery, so a
// forgotten password after signing out means a lost account — the confirm earns its friction);
// second tap commits. Auto-cancels on blur or after ~3s.
const CONFIRM_TIMEOUT_MS = 3000;

export default function SignOutButton() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function armConfirm() {
    setConfirming(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
  }

  function cancelConfirm() {
    if (timer.current) clearTimeout(timer.current);
    setConfirming(false);
  }

  async function signOut() {
    setBusy(true);
    // Capture while still identified, THEN reset the analytics identity so the next user on this
    // browser isn't merged into this one. Best-effort: clear + redirect even if the network revoke fails.
    posthog.capture("signed_out");
    posthog.reset();
    try {
      await getBrowserClient().auth.signOut();
    } catch {
      // Supabase clears the local session regardless; redirect anyway.
    }
    window.location.href = "/";
  }

  const label = confirming ? "Confirm sign out" : "Sign out";

  return (
    <button
      type="button"
      onClick={() => (confirming ? signOut() : armConfirm())}
      onBlur={cancelConfirm}
      disabled={busy}
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        background: "none",
        border: `1px solid ${confirming ? "var(--level-emerging-fg)" : "var(--theme-card-border)"}`,
        borderRadius: "var(--radius-pill)",
        padding: confirming ? "6px 12px" : "6px 10px",
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1,
        color: confirming ? "var(--level-emerging-fg)" : "var(--theme-card-text)",
        cursor: busy ? "default" : "pointer",
        opacity: busy ? 0.6 : 1,
        transition: "all var(--duration-fast) var(--ease-standard)",
      }}
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {confirming && <span>Sign out?</span>}
    </button>
  );
}
