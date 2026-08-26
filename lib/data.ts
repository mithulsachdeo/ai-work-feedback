import type { Submission, EvaluationResult, ProviderName, CriterionId, Level, SubmissionType } from "./llm/types";
import { getServerClient } from "./supabase/server";

type Sb = ReturnType<typeof getServerClient>;

// Returns the new submission id and its lineage root (root_submission_id, set by a DB trigger —
// migration 0005). The root is the north-star's unit of analysis; the caller attaches it to the
// `evaluation_completed` / `level_improved` events so PostHog can group by artifact-lineage.
export async function saveSubmission(
  userId: string,
  s: Submission,
  opts: { previousSubmissionId?: string; doNotStore?: boolean } = {},
  sb: Sb = getServerClient()
): Promise<{ id: string; rootSubmissionId: string }> {
  const { data, error } = await sb.from("submissions")
    .insert({
      user_id: userId,
      type: s.type,
      intent: s.intent,
      text: opts.doNotStore ? "[not stored at user request]" : s.text,
      // Optional instruction-summary signal (implementation_logic); never persisted under doNotStore.
      instruction_summary: opts.doNotStore ? null : (s.instructionSummary ?? null),
      previous_submission_id: opts.previousSubmissionId ?? null,
    })
    .select("id, root_submission_id").single();
  if (error) throw error;
  return { id: (data as any).id, rootSubmissionId: (data as any).root_submission_id };
}

// Latest evaluation's per-criterion levels for a submission (null if none or not_evaluable).
export async function getEvaluationLevels(
  submissionId: string, sb: Sb = getServerClient()
): Promise<Record<CriterionId, Level> | null> {
  const { data, error } = await sb.from("evaluations")
    .select("result_json").eq("submission_id", submissionId)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error || !data) return null;
  const r = (data as any).result_json as EvaluationResult;
  if ("not_evaluable" in r && r.not_evaluable) return null;
  const scored = r as Exclude<EvaluationResult, { not_evaluable: true }>;
  const out: any = {};
  for (const k of Object.keys(scored.criteria)) out[k] = scored.criteria[k as CriterionId].level;
  return out;
}

export async function saveEvaluation(
  submissionId: string, result: EvaluationResult, provider: ProviderName, model: string, byo: boolean,
  sb: Sb = getServerClient()
): Promise<string> {
  const { data, error } = await sb.from("evaluations")
    .insert({ submission_id: submissionId, result_json: result, provider, model, byo })
    .select().single();
  if (error) throw error;
  return (data as any).id;
}

export async function saveOutcome(
  evaluationId: string, action: "viewed_fix" | "resubmitted" | "self_report",
  resubmissionImproved?: boolean, sb: Sb = getServerClient()
): Promise<void> {
  const { error } = await sb.from("feedback_outcomes")
    .insert({ evaluation_id: evaluationId, action, resubmission_improved: resubmissionImproved ?? null });
  if (error) throw error;
}

// (added 2026-08-21, from plan grill) Ownership check for caller-supplied submission ids.
export async function getSubmissionOwner(
  submissionId: string, sb: Sb = getServerClient()
): Promise<string | null> {
  const { data, error } = await sb.from("submissions")
    .select("user_id").eq("id", submissionId).maybeSingle();
  if (error || !data) return null;
  return (data as any).user_id as string;
}

// (added 2026-08-21, from history-gap grill) Cross-session "continue where you left off":
// the user's most recent submission with a scored (non-not_evaluable) evaluation. Fails
// silent (returns null) if there is none, the last one was not_evaluable (nothing meaningful
// to revise), or it was saved with doNotStore (only a placeholder was kept, no real text to
// resume into) — per the grill decision, a dead-end "continue" is worse than none at all.
export interface LastSubmission {
  submissionId: string; type: SubmissionType; intent: string; text: string;
  evaluationId: string; result: EvaluationResult;
}
export async function getLastSubmission(
  userId: string, sb: Sb = getServerClient()
): Promise<LastSubmission | null> {
  const { data: sub, error: subErr } = await sb.from("submissions")
    .select("id, type, intent, text")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();
  if (subErr || !sub) return null;
  if ((sub as any).text === "[not stored at user request]") return null;

  const { data: ev, error: evErr } = await sb.from("evaluations")
    .select("id, result_json")
    .eq("submission_id", (sub as any).id)
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();
  if (evErr || !ev) return null;
  const result = (ev as any).result_json as EvaluationResult;
  if ("not_evaluable" in result && result.not_evaluable) return null;

  return {
    submissionId: (sub as any).id, type: (sub as any).type, intent: (sub as any).intent,
    text: (sub as any).text, evaluationId: (ev as any).id, result,
  };
}
