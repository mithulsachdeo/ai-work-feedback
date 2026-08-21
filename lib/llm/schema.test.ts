import { parseEvaluation } from "./schema";

const valid = JSON.stringify({
  fix_this_first: "Verify the Q3 figure before sending.",
  criteria: {
    accuracy:   { level: "Solid",    evidence: "Figures are internally consistent.", next_step: "Double-check the Q3 number.", standard: "Every number traces to a source." },
    fitness:    { level: "Strong",   evidence: "Right length for a VP.", next_step: "None.", standard: "Answers the real ask." },
    clarity:    { level: "Solid",    evidence: "Lead is clear.", next_step: "Tighten para 2.", standard: "Understood in one pass." },
    verified:   { level: "Emerging", evidence: "Reads as unverified.", next_step: "Confirm the claim yourself.", standard: "Claims are checked, not trusted." },
    owned:      { level: "Solid",    evidence: "Your context is present.", next_step: "Add your own recommendation.", standard: "Your thinking, not a paste." },
    understood: { level: "Solid",    evidence: "Reasoning is shown.", next_step: "State why in one line.", standard: "You could defend it." },
  },
});

test("parses a valid evaluation", () => {
  const r = parseEvaluation(valid);
  expect(r.not_evaluable).toBeUndefined();
  if (!r.not_evaluable) {
    expect(r.fix_this_first).toContain("Verify");
    expect(r.criteria.verified.level).toBe("Emerging");
  }
});

test("throws on a missing criterion", () => {
  const bad = JSON.parse(valid); delete bad.criteria.owned;
  expect(() => parseEvaluation(JSON.stringify(bad))).toThrow();
});

test("strips markdown code fences before parsing", () => {
  const fenced = "```json\n" + valid + "\n```";
  expect(() => parseEvaluation(fenced)).not.toThrow();
});

test("parses a not_evaluable response", () => {
  const ne = JSON.stringify({ not_evaluable: true, reason: "This looks like a template, not real work." });
  const r = parseEvaluation(ne);
  expect(r.not_evaluable).toBe(true);
  if (r.not_evaluable) expect(r.reason).toContain("template");
});
