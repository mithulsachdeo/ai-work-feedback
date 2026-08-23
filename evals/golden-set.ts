import type { Submission, CriterionId, Level } from "@/lib/llm/types";

export interface GoldenCase {
  id: string;
  submission: Submission;
  // (added 2026-08-22, from role-analogy brainstorming) optional — threads through to
  // buildMessages/evaluate exactly like the real app does. Used for a regression-safety
  // case proving role-conditioning doesn't shift levels; analogy CONTENT quality is a
  // manual spot-check, not an automated assertion (see plan Task 21).
  role?: string;
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
  // (added 2026-08-23, prod incident) Question-shaped intent ("What is a RAG") was tripping the
  // not_evaluable "request for YOU to perform a task" rule. A real, correct explanation must SCORE,
  // not bounce — the harness fails any non-expectNotEvaluable case that returns not_evaluable.
  {
    id: "concept-question-intent-scores",
    submission: {
      type: "concept_articulation",
      intent: "What is a RAG",
      text: "Retrieval-augmented generation (RAG) is a way to make an LLM answer from your own documents instead of only its training data. When a question comes in, the system first searches a knowledge base for the most relevant chunks of text, then passes those chunks to the LLM along with the question, so the answer is grounded in that retrieved context. It reduces hallucination and lets you update what the model knows by updating the documents rather than retraining it.",
    },
    // Accurate and clear → must score well, and crucially must NOT be bounced as not_evaluable.
    expect: { accuracy: { atLeast: "Solid" }, clarity: { atLeast: "Solid" } },
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
  // (added 2026-08-22, instruction-quality reframe) Vague one-line instruction → weak owned/understood.
  {
    id: "impl-vague-instruction",
    submission: {
      type: "implementation_logic",
      intent: "an automation to handle my incoming emails",
      text: "I asked the AI to build something to handle my emails, and it made a workflow that reads each new email and sorts it into a folder. It decides the right folder on its own.",
      instructionSummary: "You asked me to 'handle your emails' and sort them into folders.",
    },
    // One-line 'handle my emails', no constraints or success criteria given → the user barely
    // guided the build and can't really explain/defend it. owned + understood should be weak.
    expect: { owned: { atWorst: "Emerging" }, understood: { atWorst: "Solid" } },
  },
  // (added 2026-08-22) Specific goal + explicit constraints + a real check → scores well.
  {
    id: "impl-well-guided",
    submission: {
      type: "implementation_logic",
      intent: "a workflow that files new client invoices into the correct client folder in Drive, and flags anything it can't confidently match",
      text: "The workflow triggers on a new invoice email, extracts the client name from the subject and the sender domain, matches it against my client list, and moves the PDF into that client's Drive folder. If it can't confidently match a client, it leaves the file in an 'Unsorted' folder and emails me to file it by hand. I told it explicitly not to auto-file low-confidence matches, after it guessed wrong twice during my testing.",
      instructionSummary: "You asked for invoices filed by client, with a required manual-review fallback for anything uncertain, and told me not to auto-file low-confidence matches.",
    },
    // Specific goal, explicit constraints, evidence of a real check (caught wrong guesses in testing).
    expect: { owned: { atLeast: "Solid" }, verified: { atLeast: "Solid" }, understood: { atLeast: "Solid" } },
  },
  // (added 2026-08-22) Implementation doc with an obvious uncovered gap the instructions never
  // addressed → understood weak, and the gap should surface in the feedback.
  {
    id: "impl-uncovered-gap",
    submission: {
      type: "implementation_logic",
      intent: "an automation that adds every new signup to my mailing list and welcomes them",
      text: "When someone submits the signup form, the automation takes their email, adds a new row to my mailing-list sheet, and sends them a welcome email.",
      instructionSummary: "You asked me to add new signups to the mailing list and send a welcome email.",
    },
    // Instructions never addressed the same person signing up twice → repeat rows + repeat welcomes.
    // understood should be Emerging and the gap should be named. NOTE: `mustMention` is a substring
    // check on this criterion's evidence/next_step. "duplicate" is the expected token — but if the
    // eval run shows the model reliably describes this gap with a different word (e.g. "twice",
    // "again"), change mustMention to a token the model actually emits, or drop mustMention and keep
    // only the level assertion. Report whatever you changed and why.
    expect: { understood: { atWorst: "Emerging", mustMention: "duplicate" } },
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
  // (added 2026-08-22, from role-analogy brainstorming) Regression-safety case: same
  // submission as wp-strong-email, but WITH a role set. Proves the strengthened
  // role-analogy instruction doesn't shift levels — same bounds must still hold. Analogy
  // CONTENT quality (is it actually a good analogy?) is a manual spot-check in AI Studio,
  // not something this automated assertion can robustly judge.
  {
    id: "role-analogy-does-not-change-score",
    submission: {
      type: "work_product",
      intent: "email to my manager proposing we delay the launch by a week",
      text: "Hi Sam — I'd like to push the launch to the 14th. Two reasons: the payment flow still fails on 1 in 20 test runs (bug #412, fix ETA Tuesday), and QA hasn't covered mobile. A week gets both done and de-risks the on-call weekend. If you're OK, I'll tell the team today.",
    },
    role: "Product/BA",
    expect: { owned: { atLeast: "Solid" }, clarity: { atLeast: "Solid" }, understood: { atLeast: "Solid" } },
  },
];
