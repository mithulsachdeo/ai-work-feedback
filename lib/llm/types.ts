export type SubmissionType = "work_product" | "implementation_logic" | "concept_articulation";
export type ProviderName = "gemini" | "anthropic" | "openai";
export type Level = "Emerging" | "Solid" | "Strong";
export type CriterionId = "accuracy" | "fitness" | "clarity" | "verified" | "owned" | "understood";

// `originalDraft` (added 2026-08-21, from requirements audit): implementation_logic only —
// the AI's pre-edit draft, paired with `text` (the user's corrected version) so 2.1
// (verified) has a real signal to compare instead of inferring from prose alone.
export interface Submission { type: SubmissionType; intent: string; text: string; originalDraft?: string; }
export interface CriterionResult { level: Level; evidence: string; next_step: string; standard: string; }

// Discriminated union: either a full evaluation, or a graceful "can't check this".
export type EvaluationResult =
  | { not_evaluable: true; reason: string }
  | { not_evaluable?: false; fix_this_first: string; criteria: Record<CriterionId, CriterionResult> };
