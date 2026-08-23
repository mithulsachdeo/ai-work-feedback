import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { evaluate, type ProviderChoice } from "@/lib/llm/evaluate";
import { getRemaining, consumeQuota } from "@/lib/quota";
import { saveSubmission, saveEvaluation, saveOutcome, getEvaluationLevels, getSubmissionOwner } from "@/lib/data";
import { improvedAny } from "@/lib/llm/levels";
import { track } from "@/lib/events";
import type { ProviderName, CriterionId, Level } from "@/lib/llm/types";
import { checkLengths } from "@/lib/validate";

const PROVIDERS = ["gemini", "anthropic", "openai"];

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

  const body = await req.json();
  // `instructionSummary` and `role` added 2026-08-21/22, from requirements audit / reframe.
  const { type, intent, byoKey, byoProvider, previousSubmissionId, doNotStore, instructionSummary, role } = body;
  let text: string = body.text ?? "";
  if (!text || text.trim().length < 20) {
    return NextResponse.json({ error: "Add a bit more so I can check it." }, { status: 400 });
  }
  // (fixed 2026-08-21, from requirements audit) intent is a required input per the rubric
  // spec's declared-purpose model, and the purpose/text-mismatch guardrail has nothing to
  // compare against without it — matches the DB's `intent not null` constraint (Task 2).
  if (!intent || !String(intent).trim()) {
    return NextResponse.json({ error: "Add a one-line purpose so I know what to check this against." }, { status: 400 });
  }

  const lengthError = checkLengths({ intent: String(intent), text, instructionSummary });
  if (lengthError) {
    return NextResponse.json({ error: lengthError }, { status: 400 });
  }

  const byo = Boolean(byoKey);
  if (byo && !PROVIDERS.includes(byoProvider)) {
    return NextResponse.json({ error: "Unknown provider for your key." }, { status: 400 });
  }

  // Quota: read-only gate BEFORE the eval, so a failed/not_evaluable eval never charges.
  let remaining = -1;
  if (!byo) {
    remaining = await getRemaining(user.id);
    if (remaining <= 0) {
      return NextResponse.json(
        { error: "You're out of free checks for today. Add your own key for unlimited, sharper checks.", remaining: 0 },
        { status: 429 }
      );
    }
  }

  const choice: ProviderChoice = byo
    ? { provider: byoProvider as ProviderName, apiKey: byoKey, byo: true }
    : { provider: "gemini", apiKey: process.env.GEMINI_API_KEY!, byo: false };

  // Ownership guard (added 2026-08-21, from plan grill): only trust a caller-supplied
  // previousSubmissionId if it actually belongs to this user. Content tables have no RLS
  // (§ Task 2), so this application-level check is the only thing preventing one user from
  // linking to — and reading the scored levels of — another user's submission. A mismatch
  // is treated as "no link" (silent), not an error, so it never blocks a legitimate check.
  let linkedPreviousId: string | undefined = undefined;
  if (previousSubmissionId) {
    const owner = await getSubmissionOwner(previousSubmissionId);
    if (owner === user.id) linkedPreviousId = previousSubmissionId;
  }

  // Retry ONLY the LLM call + parse (added 2026-08-21, from plan grill). The previous version
  // retried saveSubmission/saveEvaluation too, so a transient failure after a successful
  // (costly) LLM call could create a duplicate submission+evaluation row for one user action —
  // corrupting the lineage data the north-star metric depends on. DB writes below now run
  // exactly once, only after a confirmed successful evaluation.
  //
  // (added 2026-08-21, from rate-limit grill) Gemini's free tier applies rate limits
  // per-project, not per-key or per-user — every free-tier user shares one ceiling
  // (~15 req/min, third-party-reported). A burst right after a launch post is plausible, and
  // retrying instantly into the same saturated limit is more likely to fail again immediately.
  // Detect a rate-limit-shaped failure and back off ~2.5s before the single retry; other
  // failure types still retry immediately, unchanged from before.
  const isRateLimitError = (e: unknown) => {
    const msg = String((e as any)?.message ?? e).toLowerCase();
    return msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("rate limit") || msg.includes("quota");
  };
  let evalOut: Awaited<ReturnType<typeof evaluate>>;
  let lastErrWasRateLimit = false;
  try {
    evalOut = await evaluate({ type, intent, text, instructionSummary }, choice, undefined, role);
  } catch (err) {
    if (isRateLimitError(err)) {
      lastErrWasRateLimit = true;
      await new Promise((r) => setTimeout(r, 2500));
    }
    try {
      evalOut = await evaluate({ type, intent, text, instructionSummary }, choice, undefined, role);   // one retry, LLM step only
    } catch (err2) {
      const rateLimited = lastErrWasRateLimit || isRateLimitError(err2);
      const error = rateLimited
        ? "We're getting a lot of checks right now — try again in a minute."
        : "Couldn't check that just now — please try again.";
      return NextResponse.json({ error, remaining }, { status: 502 });
    }
  }
  const { result, provider, model } = evalOut;
  const isNotEvaluable = "not_evaluable" in result && result.not_evaluable === true;

  const submissionId = await saveSubmission(user.id, { type, intent, text, instructionSummary }, { previousSubmissionId: linkedPreviousId, doNotStore });
  const evaluationId = await saveEvaluation(submissionId, result, provider, model, byo);

  // Measurement loop: extract levels; on a linked resubmission, record improvement.
  let improved: boolean | null = null;
  let levels: Record<CriterionId, Level> | null = null;
  if (!isNotEvaluable) {
    const scored = result as Exclude<typeof result, { not_evaluable: true }>;
    levels = Object.fromEntries(
      Object.entries(scored.criteria).map(([k, v]) => [k, (v as any).level])
    ) as Record<CriterionId, Level>;
    if (linkedPreviousId) {
      const prev = await getEvaluationLevels(linkedPreviousId);
      if (prev) { improved = improvedAny(prev, levels); await saveOutcome(evaluationId, "resubmitted", improved); }
    }
  }

  // Quota fix (added 2026-08-21, from plan grill): the previous version charged quota on
  // ANY successfully-parsed result, including not_evaluable — contradicting the locked P0 #3
  // decision ("failed / not_evaluable evaluations never burn a user's daily allowance").
  // Charge only on a genuinely scored result.
  if (!byo && !isNotEvaluable) await consumeQuota(user.id);
  await track(user.id, "evaluation_completed", { type, provider, byo, levels });
  if (improved) await track(user.id, "level_improved", { type });
  return NextResponse.json({
    evaluationId, submissionId, result,
    remaining: byo ? -1 : Math.max(0, remaining - (isNotEvaluable ? 0 : 1)),
    improved,
  });
}
