import { describe, it, expect } from "vitest";
import { checkLengths } from "./validate";
import { MAX_INTENT_CHARS, MAX_TEXT_CHARS, MAX_INSTRUCTION_SUMMARY_CHARS } from "@/constants";

describe("checkLengths", () => {
  it("returns null when all fields are within limits", () => {
    const res = checkLengths({
      intent: "A valid intent string",
      text: "A valid text string that is at least twenty characters long.",
      instructionSummary: "A valid instruction summary.",
    });
    expect(res).toBeNull();
  });

  it("returns null when optional instructionSummary is undefined", () => {
    const res = checkLengths({
      intent: "A valid intent string",
      text: "A valid text string that is at least twenty characters long.",
    });
    expect(res).toBeNull();
  });

  it("flags intent exceeding MAX_INTENT_CHARS", () => {
    const res = checkLengths({
      intent: "a".repeat(MAX_INTENT_CHARS + 1),
      text: "A valid text string.",
    });
    expect(res).toContain(`That purpose is longer than the ${MAX_INTENT_CHARS}-character limit`);
  });

  it("flags text exceeding MAX_TEXT_CHARS", () => {
    const res = checkLengths({
      intent: "A valid intent",
      text: "a".repeat(MAX_TEXT_CHARS + 1),
    });
    expect(res).toContain(`That's longer than the ${MAX_TEXT_CHARS.toLocaleString()}-character limit`);
  });

  it("flags instructionSummary exceeding MAX_INSTRUCTION_SUMMARY_CHARS", () => {
    const res = checkLengths({
      intent: "A valid intent",
      text: "A valid text string.",
      instructionSummary: "a".repeat(MAX_INSTRUCTION_SUMMARY_CHARS + 1),
    });
    expect(res).toContain(`The instruction summary is longer than the ${MAX_INSTRUCTION_SUMMARY_CHARS.toLocaleString()}-character limit`);
  });
});
