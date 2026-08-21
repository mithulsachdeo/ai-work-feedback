"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import RoleConsent from "@/components/RoleConsent";
import PurposePicker from "@/components/PurposePicker";
import SubmissionForm from "@/components/SubmissionForm";

export default function AppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasRole, setHasRole] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const sb = getBrowserClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUserId(user.id);
      const { data: profile } = await sb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile && profile.role) {
        setHasRole(true);
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (d: {
    type: string;
    intent: string;
    text: string;
    originalDraft?: string;
    doNotStore: boolean;
  }) => {
    setBusy(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Evaluation failed.");
      } else {
        console.log("Evaluation response:", data);
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading…
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  if (!hasRole) {
    return <RoleConsent userId={userId} onDone={() => setHasRole(true)} />;
  }

  return (
    <main
      style={{
        width: "min(calc(100% - 32px), 960px)",
        margin: "32px auto 64px auto",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "18px",
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
            }}
          >
            Signal / learn
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "3px 8px",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-lime)",
              color: "var(--color-ink)",
            }}
          >
            Beta
          </span>
        </div>
      </header>

      {!selectedType ? (
        <PurposePicker onPick={(t) => setSelectedType(t)} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <button
            onClick={() => setSelectedType(null)}
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
          <SubmissionForm type={selectedType} onSubmit={handleSubmit} busy={busy} />
        </div>
      )}
    </main>
  );
}
