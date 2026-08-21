import { improvedAny } from "./levels";
import type { CriterionId, Level } from "./types";

const mk = (o: Partial<Record<CriterionId, Level>>) => o as Record<CriterionId, Level>;

test("detects an improvement on any criterion", () => {
  expect(improvedAny(mk({ verified: "Emerging", clarity: "Solid" }), mk({ verified: "Solid", clarity: "Solid" }))).toBe(true);
});

test("no improvement when all levels are equal or lower", () => {
  expect(improvedAny(mk({ verified: "Solid", clarity: "Strong" }), mk({ verified: "Solid", clarity: "Solid" }))).toBe(false);
});
