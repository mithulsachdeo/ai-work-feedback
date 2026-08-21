"use client";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { CONSENT_LINE } from "@/constants";

const ROLES = ["Marketing", "Ops", "HR", "Finance", "Sales", "Product/BA", "Founder", "Other"];

export default function RoleConsent({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [role, setRole] = useState("");
  // First-visit-only component (role is null) → a good proxy for the signup event.
  useEffect(() => { posthog.capture("signed_up"); }, []);
  async function submit() {
    const sb = getBrowserClient();
    const { error } = await sb.from("profiles").upsert({ id: userId, role, consented_at: new Date().toISOString() });
    if (error) { alert("Couldn't save that — please try again."); return; }  // don't proceed on failure
    posthog.capture("role_selected", { role });
    onDone();
  }
  return (
    <div style={{ maxWidth: 420, margin: "3rem auto", display: "grid", gap: 12 }}>
      <h2>One quick thing</h2>
      <label>What&apos;s your role?</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Select…</option>
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <p style={{ fontSize: 12, opacity: 0.7 }}>{CONSENT_LINE}</p>
      <button disabled={!role} onClick={submit}>Start</button>
    </div>
  );
}
