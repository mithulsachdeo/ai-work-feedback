"use client";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { CONSENT_LINE } from "@/constants";

const ROLES = ["Marketing", "Ops", "HR", "Finance", "Sales", "Product/BA", "Founder", "Other"];

export default function RoleConsent({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [role, setRole] = useState("");
  // First-visit-only component (role is null) → a good proxy for the signup event.
  useEffect(() => {
    posthog.capture("signed_up");
  }, []);

  async function submit() {
    const sb = getBrowserClient();
    const { error } = await sb.from("profiles").upsert({
      id: userId,
      role,
      consented_at: new Date().toISOString(),
    });
    if (error) {
      alert("Couldn't save that — please try again.");
      return;
    }
    posthog.capture("role_selected", { role });
    onDone();
  }

  return (
    <div
      style={{
        maxWidth: "460px",
        margin: "3rem auto",
        background: "var(--theme-card-bg)",
        border: "1px solid var(--theme-card-border)",
        borderRadius: "var(--radius-card)",
        padding: "clamp(24px, 4vw, 36px)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        color: "var(--theme-card-text)",
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
          Welcome
        </span>
        <h2 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em" }}>
          One quick thing
        </h2>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
          What&apos;s your role?
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
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
          <option value="" style={{ background: "var(--theme-card-bg)", color: "var(--theme-card-text)" }}>
            Select…
          </option>
          {ROLES.map((r) => (
            <option key={r} value={r} style={{ background: "var(--theme-card-bg)", color: "var(--theme-card-text)" }}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400 }}>
        {CONSENT_LINE}
      </p>

      <button
        type="button"
        disabled={!role}
        onClick={submit}
        style={{
          padding: "14px 20px",
          borderRadius: "var(--radius-pill)",
          background: "var(--color-lime)",
          color: "var(--color-ink)",
          fontWeight: 800,
          fontSize: "15px",
          border: "none",
          opacity: !role ? 0.5 : 1,
          cursor: !role ? "not-allowed" : "pointer",
          transition: "transform var(--duration-fast) var(--ease-standard)",
        }}
      >
        Start ↗
      </button>
    </div>
  );
}
