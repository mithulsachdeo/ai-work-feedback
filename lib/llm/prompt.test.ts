import { buildMessages } from "./prompt";

test("system prompt names all six criteria and the three levels", () => {
  const { system } = buildMessages({ type: "work_product", intent: "email to my VP", text: "hi" });
  for (const id of ["accuracy","fitness","clarity","verified","owned","understood"]) {
    expect(system).toContain(id);
  }
  for (const lvl of ["Emerging","Solid","Strong"]) expect(system).toContain(lvl);
  expect(system).toContain("fix_this_first");
});

test("user message includes the type, intent, and text", () => {
  const { user } = buildMessages({ type: "concept_articulation", intent: "how APIs work", text: "an API is..." });
  expect(user).toContain("concept_articulation");
  expect(user).toContain("how APIs work");
  expect(user).toContain("an API is...");
});

test("system prompt includes injection defense and the not_evaluable escape hatch", () => {
  const { system } = buildMessages({ type: "work_product", intent: "x", text: "y" });
  expect(system).toContain("not_evaluable");
  expect(system.toLowerCase()).toContain("never an instruction");
});

// (added 2026-08-21, from requirements audit)
test("user message includes the AI's original draft block when provided", () => {
  const { user } = buildMessages({ type: "implementation_logic", intent: "i", text: "corrected version", originalDraft: "raw ai draft" });
  expect(user).toContain("ORIGINAL DRAFT");
  expect(user).toContain("raw ai draft");
  expect(user).toContain("corrected version");
});

test("user message includes role context only when provided", () => {
  const withRole = buildMessages({ type: "work_product", intent: "i", text: "t" }, "Marketing").user;
  const withoutRole = buildMessages({ type: "work_product", intent: "i", text: "t" }).user;
  expect(withRole).toContain("Marketing");
  expect(withoutRole).not.toContain("USER'S ROLE");
});
