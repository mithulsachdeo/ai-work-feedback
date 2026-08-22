export type SubmissionType = "work_product" | "implementation_logic" | "concept_articulation";
export type ProviderName = "gemini" | "anthropic" | "openai";
export type Level = "Emerging" | "Solid" | "Strong";
export type CriterionId = "accuracy" | "fitness" | "clarity" | "verified" | "owned" | "understood";

// `instructionSummary` (added 2026-08-22, instruction-quality reframe): implementation_logic
// only — the AI's recap of what the user asked it to build. Optional soft corroboration for
// the re-cast Layer 2 (owned/understood); `text` holds the AI's implementation doc being scored.
export interface Submission { type: SubmissionType; intent: string; text: string; instructionSummary?: string; }
export interface CriterionResult { level: Level; evidence: string; next_step: string; standard: string; }

// Discriminated union: either a full evaluation, or a graceful "can't check this".
export type EvaluationResult =
  | { not_evaluable: true; reason: string }
  | { not_evaluable?: false; fix_this_first: string; criteria: Record<CriterionId, CriterionResult>; suggested_questions?: string[] };
