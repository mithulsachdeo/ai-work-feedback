import { evaluate } from "./evaluate";

const validJson = JSON.stringify({
  fix_this_first: "x",
  criteria: Object.fromEntries(["accuracy","fitness","clarity","verified","owned","understood"]
    .map((k) => [k, { level: "Solid", evidence: "a", next_step: "b", standard: "c" }])),
});

test("routes to the chosen provider and parses the result", async () => {
  const fakeCaller = async () => validJson;
  const out = await evaluate(
    { type: "work_product", intent: "i", text: "t" },
    { provider: "gemini", apiKey: "k", byo: false },
    fakeCaller
  );
  expect(out.provider).toBe("gemini");
  expect(out.byo).toBe(false);
  if (!out.result.not_evaluable) {
    expect(out.result.criteria.accuracy.level).toBe("Solid");
  }
});

test("throws a clear error when the model returns unparseable output", async () => {
  const fakeCaller = async () => "not json";
  await expect(evaluate(
    { type: "work_product", intent: "i", text: "t" },
    { provider: "openai", apiKey: "k", byo: true },
    fakeCaller
  )).rejects.toThrow();
});
