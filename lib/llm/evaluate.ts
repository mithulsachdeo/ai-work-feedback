import type { Submission, EvaluationResult, ProviderName } from "./types";
import { buildMessages } from "./prompt";
import { parseEvaluation } from "./schema";
import { callGemini } from "./providers/gemini";
import { callAnthropic } from "./providers/anthropic";
import { callOpenAI } from "./providers/openai";
import { MODELS } from "@/constants";

export interface ProviderChoice { provider: ProviderName; apiKey: string; byo: boolean; }
type Caller = (system: string, user: string, apiKey: string) => Promise<string>;

const callers: Record<ProviderName, Caller> = {
  gemini: callGemini, anthropic: callAnthropic, openai: callOpenAI,
};

export async function evaluate(
  submission: Submission,
  choice: ProviderChoice,
  callerOverride?: Caller,
  role?: string  // (added 2026-08-21, from requirements audit) optional, context-only
): Promise<{ result: EvaluationResult; provider: ProviderName; model: string; byo: boolean }> {
  const { system, user } = buildMessages(submission, role);
  const caller = callerOverride ?? callers[choice.provider];
  const raw = await caller(system, user, choice.apiKey);
  const result = parseEvaluation(raw); // throws on invalid — caller handles
  return { result, provider: choice.provider, model: MODELS[choice.provider], byo: choice.byo };
}
