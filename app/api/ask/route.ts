import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { callGemini } from "@/lib/llm/providers/gemini";
import { callAnthropic } from "@/lib/llm/providers/anthropic";
import { callOpenAI } from "@/lib/llm/providers/openai";
import type { ProviderName } from "@/lib/llm/types";

const callers = { gemini: callGemini, anthropic: callAnthropic, openai: callOpenAI };
const PROVIDERS = ["gemini", "anthropic", "openai"];

export async function POST(req: NextRequest) {
  // Auth-gate: this route uses the shared key, so it must not be an open free-LLM endpoint.
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

  const { question, context, byoKey, byoProvider } = await req.json();
  if (!question) return NextResponse.json({ error: "No question" }, { status: 400 });
  // Size cap: this is a quick side-question, not a document.
  if (String(question).length > 1000 || String(context ?? "").length > 2000) {
    return NextResponse.json({ error: "That's too long for a quick question." }, { status: 400 });
  }
  const byo = Boolean(byoKey);
  // (added 2026-08-21, from plan grill) Validate byoProvider against the allow-list — the
  // ByoKeyModal UI (Task 16) already restricts users to a <select> of these three, but this
  // route is a public endpoint independent of that UI, so it needs its own check (matches
  // the same validation already present in /api/evaluate, Task 10). Without it, an unknown
  // provider string falls through to `callers[provider]` being undefined and throwing an
  // unhandled TypeError, surfaced as a vague 502 instead of a clear 400.
  if (byo && !PROVIDERS.includes(byoProvider)) {
    return NextResponse.json({ error: "Unknown provider for your key." }, { status: 400 });
  }
  // (removed 2026-08-21, from spec grill) No shared-quota check here anymore — /api/ask no
  // longer draws from /api/evaluate's daily counter (a first session of submit + a couple
  // side-questions + a revise could otherwise burn most of a new user's 10 daily checks
  // before they've explored the product). Abuse is guarded by the auth-gate above and the
  // per-request length cap below, since each call is short/cheap relative to a full eval.

  const provider: ProviderName = byoKey ? (byoProvider as ProviderName) : "gemini";
  const apiKey = byoKey || process.env.GEMINI_API_KEY!;

  // Scope guardrail: keep this on-purpose. It is NOT a general assistant.
  // (fixed 2026-08-22, from live UI check) the Gemini adapter forces
  // responseMimeType: "application/json" for ALL calls (it's shared with evaluate()), and the
  // OpenAI adapter likewise forces response_format: json_object — both unconditionally, since
  // Task 5 gives every provider one uniform signature. Without an explicit JSON contract here,
  // Gemini/OpenAI invent their own wrapper shape (observed: `{"response": "..."}`) and it was
  // rendered raw in SideQuestions.tsx. Fix: ask ALL THREE providers for the same tiny JSON
  // shape explicitly, then parse it below with a plain-text fallback for Anthropic (which
  // doesn't force JSON mode and may still just answer in prose despite the instruction).
  const system =
    "You are a tutor INSIDE a writing-feedback tool. You may ONLY help with: the user's current " +
    "submission, the feedback they just received, or how to use AI well and improve their own " +
    "work/understanding. If the question is off-topic (general knowledge, personal chit-chat, " +
    "unrelated coding, or a request to DO a task for them like writing/translating/answering " +
    "something), politely decline in one sentence and redirect them back to their work — do NOT " +
    "answer it. For in-scope questions: answer clearly in 2-4 sentences, then in one short sentence " +
    "point them back to the step they were on. Never let a tangent take over. " +
    'Return EXACTLY this JSON shape, no markdown fences, no extra text: {"answer": "<your reply>"}.';
  const user2 = `The user is currently: ${context || "reviewing their feedback"}.\nQuestion: ${question}`;

  // Unwraps the {"answer": "..."} contract above; falls back to the raw (code-fence-stripped)
  // text if a provider ignores the instruction and replies in plain prose.
  function extractAnswer(raw: string): string {
    const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    try {
      const parsed = JSON.parse(stripped);
      if (parsed && typeof parsed.answer === "string") return parsed.answer;
      if (parsed && typeof parsed.response === "string") return parsed.response;
    } catch {
      // Not valid JSON — treat as the plain-text answer itself.
    }
    return stripped;
  }

  try {
    const raw = await callers[provider](system, user2, apiKey);
    return NextResponse.json({ answer: extractAnswer(raw) });
  } catch {
    return NextResponse.json({ error: "Couldn't answer that just now — try again." }, { status: 502 });
  }
}
