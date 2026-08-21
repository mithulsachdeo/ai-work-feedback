import { z } from "zod";
import type { EvaluationResult } from "./types";

const criterion = z.object({
  level: z.enum(["Emerging", "Solid", "Strong"]),
  evidence: z.string().min(1),
  next_step: z.string().min(1),
  standard: z.string().min(1),
});

const evaluable = z.object({
  not_evaluable: z.literal(false).optional(),
  fix_this_first: z.string().min(1),
  criteria: z.object({
    accuracy: criterion, fitness: criterion, clarity: criterion,
    verified: criterion, owned: criterion, understood: criterion,
  }),
});

const notEvaluable = z.object({
  not_evaluable: z.literal(true),
  reason: z.string().min(1),
});

const schema = z.union([notEvaluable, evaluable]);

export function parseEvaluation(raw: string): EvaluationResult {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return schema.parse(JSON.parse(cleaned)) as EvaluationResult;
}
