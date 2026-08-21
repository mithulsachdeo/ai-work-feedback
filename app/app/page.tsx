"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import RoleConsent from "@/components/RoleConsent";

export default function AppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasRole, setHasRole] = useState(false);

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

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  }

  if (!userId) {
    return null;
  }

  if (!hasRole) {
    return <RoleConsent userId={userId} onDone={() => setHasRole(true)} />;
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Feedback App</h1>
      <p>Signed in successfully.</p>
    </div>
  );
}
