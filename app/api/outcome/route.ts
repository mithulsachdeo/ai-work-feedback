import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { saveOutcome } from "@/lib/data";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled when called in context where response headers cannot be modified
          }
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { evaluationId, action } = await req.json();
  if (!evaluationId || action !== "viewed_fix") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  // Accepted risk (added 2026-08-21, from plan grill): evaluationId is not checked for
  // ownership, so a signed-in user could in principle attach a viewed_fix outcome to
  // another user's evaluation. Deliberately not fixed — no data is read back (pure write),
  // so the blast radius is a wrong analytics count, not a privacy leak. Revisit if the user
  // base grows past friendly-tester scale.
  await saveOutcome(evaluationId, "viewed_fix");
  return NextResponse.json({ ok: true });
}
