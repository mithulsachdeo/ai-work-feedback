import type { Submission, CriterionId, Level } from "@/lib/llm/types";

export interface GoldenCase {
  id: string;
  submission: Submission;
  // Assertions: each named criterion must come back at (or worse than) `atWorst` and/or at
  // (or better than) `atLeast`, and/or the evidence/next_step must contain a keyword.
  // `atLeast` added 2026-08-21, from rubric-validation pass — without it there was no way to
  // assert "this should score WELL", only "this should score badly"; a case meant to prove the
  // model rewards good work either tested nothing (atWorst:"Strong" always passes) or actively
  // failed a correct high score (atWorst used as a ceiling when a floor was meant).
  expect?: Partial<Record<CriterionId, { atWorst?: Level; atLeast?: Level; mustMention?: string }>>;
  expectNotEvaluable?: boolean;
}

const worse = { Strong: 3, Solid: 2, Emerging: 1 } as const;
export function levelAtWorst(actual: Level, atWorst: Level) { return worse[actual] <= worse[atWorst]; }
// (added 2026-08-21, from rubric-validation pass)
export function levelAtLeast(actual: Level, atLeast: Level) { return worse[actual] >= worse[atLeast]; }

export const GOLDEN: GoldenCase[] = [
  {
    id: "wp-overtrust-factual-error",
    submission: {
      type: "work_product",
      intent: "email to my VP summarising Q3 results",
      text: "Hi, Q3 revenue grew 340% and we now lead the market with a 72% share. All targets exceeded. Full deck attached.",
    },
    // Invented, unverified stats → verified must be Emerging; user likely can't defend them.
    expect: { verified: { atWorst: "Emerging" }, understood: { atWorst: "Solid" } },
  },
  {
    id: "wp-generic-ai-paste",
    submission: {
      type: "work_product",
      intent: "reply to a customer asking for a refund",
      text: "Thank you for reaching out. We value your feedback and are committed to providing an exceptional experience. Your satisfaction is our top priority. Please rest assured we will look into this matter.",
    },
    // Zero specifics, pure AI cadence → owned must be Emerging.
    expect: { owned: { atWorst: "Emerging" }, fitness: { atWorst: "Solid" } },
  },
  {
    id: "wp-strong-email",
    submission: {
      type: "work_product",
      intent: "email to my manager proposing we delay the launch by a week",
      text: "Hi Sam — I'd like to push the launch to the 14th. Two reasons: the payment flow still fails on 1 in 20 test runs (bug #412, fix ETA Tuesday), and QA hasn't covered mobile. A week gets both done and de-risks the on-call weekend. If you're OK, I'll tell the team today.",
    },
    // Specific, owned, defensible → should score well across the board.
    // (fixed 2026-08-21, from rubric-validation pass) was atWorst:"Strong", which is always
    // true regardless of result — vacuous, tested nothing. atLeast is the correct assertion.
    expect: { owned: { atLeast: "Solid" }, clarity: { atLeast: "Solid" }, understood: { atLeast: "Solid" } },
  },
  {
    id: "concept-misconception",
    submission: {
      type: "concept_articulation",
      intent: "my understanding of what an API is",
      text: "An API is basically the database. When an app needs data it opens the API and reads the tables directly, which is why APIs have to store all the information.",
    },
    // Clear misconception (API ≠ database) → accuracy must be Emerging.
    expect: { accuracy: { atWorst: "Emerging", mustMention: "database" } },
  },
  {
    id: "impl-handwavy",
    submission: {
      type: "implementation_logic",
      intent: "the logic of the automation I built to sort support tickets",
      text: "The AI just reads each ticket and figures out the right team and sends it there automatically. It handles everything.",
    },
    // No real steps, "handles everything" → clarity/understood weak.
    expect: { clarity: { atWorst: "Emerging" }, understood: { atWorst: "Solid" } },
  },
  {
    id: "not-evaluable-gibberish",
    submission: { type: "work_product", intent: "test", text: "asdf asdf lorem ipsum test test 123 [PASTE HERE]" },
    expectNotEvaluable: true,
  },
  {
    id: "not-evaluable-task-request",
    // Off-purpose: asking the tool to DO a task, not submitting work to be checked.
    submission: { type: "work_product", intent: "help", text: "Write me a professional email asking my manager for a raise, and make it persuasive." },
    expectNotEvaluable: true,
  },
  // (added 2026-08-21, from requirements audit) Dual-capture verification signal cases —
  // proves the originalDraft-vs-text comparison instructed in the rubric prompt actually works.
  {
    id: "impl-dual-capture-verified",
    submission: {
      type: "implementation_logic",
      intent: "the logic of the ticket-routing automation I built",
      text: "The automation reads each ticket, checks the tag field for a team code, and routes to that team's queue. If no tag is present, it falls back to the general queue and pings me directly so nothing sits unrouted. I added the fallback after testing showed ~5% of tickets arrive untagged.",
      originalDraft: "The AI just reads each ticket and figures out the right team and sends it there automatically. It handles everything.",
    },
    // Substantial rewrite from a vague AI draft to specific, tested detail → real evidence of
    // verification. (fixed 2026-08-21, from rubric-validation pass) was atWorst:"Solid", which
    // would have FAILED a correct "Strong" result — atWorst is a ceiling, not a floor, and this
    // case wants to assert the opposite (this should score well, not poorly).
    expect: { verified: { atLeast: "Solid" } },
  },
  {
    id: "impl-dual-capture-unchanged",
    submission: {
      type: "implementation_logic",
      intent: "the logic of the ticket-routing automation I built",
      text: "The AI just reads each ticket and figures out the right team and sends it there automatically. It handles everything.",
      originalDraft: "The AI just reads each ticket and figures out the right team and sends it there automatically. It handles everything.",
    },
    // Identical draft and "corrected" version → soft hedge (rubric spec Q9), not a hard fail —
    // evidence text should note no changes were made, not just assert a level.
    expect: { verified: { atWorst: "Solid", mustMention: "no changes" } },
  },
];
