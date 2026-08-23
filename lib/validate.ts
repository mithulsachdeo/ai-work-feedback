import { MAX_INTENT_CHARS, MAX_TEXT_CHARS, MAX_INSTRUCTION_SUMMARY_CHARS } from "@/constants";

export function checkLengths(s: { intent: string; text: string; instructionSummary?: string }): string | null {
  if (s.intent.length > MAX_INTENT_CHARS) {
    return `That purpose is longer than the ${MAX_INTENT_CHARS}-character limit — shorten it and try again.`;
  }
  if (s.text.length > MAX_TEXT_CHARS) {
    return `That's longer than the ${MAX_TEXT_CHARS.toLocaleString()}-character limit — trim it and try again.`;
  }
  if (s.instructionSummary && s.instructionSummary.length > MAX_INSTRUCTION_SUMMARY_CHARS) {
    return `The instruction summary is longer than the ${MAX_INSTRUCTION_SUMMARY_CHARS.toLocaleString()}-character limit — trim it and try again.`;
  }
  return null;
}
