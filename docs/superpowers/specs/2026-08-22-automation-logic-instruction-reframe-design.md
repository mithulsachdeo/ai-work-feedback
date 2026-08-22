# Reframe the "Automation & Logic" check around instruction quality

_Design spec · 2026-08-22 · submission type `implementation_logic`_

## Problem

The current `implementation_logic` ("Checking Automation & Logic") submission
type asks the user for two things: the **AI's original draft** and **their
corrected version**, and scores Layer 2 "verified" primarily by diffing the two
(meaningful edits = evidence of verification).

This assumes a behavior non-technical users do not have. A non-technical builder
does not edit the AI's implementation. Their real workflow is:

1. They have something they want to build.
2. They explain it to an AI.
3. The AI builds it.
4. They ask the AI to explain how it built it — that explanation is the only
   artifact they can produce.

They cannot meaningfully "correct" an implementation they do not understand. So
the "corrected version" input is empty of signal for this audience, and the
diff-based "verified" logic measures nothing.

## What this check should measure instead

The product's north star is "did you use AI well?" For a thing the AI **built**,
using AI well means **instructing it well**. So this is a type-specific
_re-interpretation_ of the existing Layer 2, not a new scoring model:

- **Layer 1 (kept)** — is the described logic sound for the user's goal?
  (accuracy, fitness, clarity — applied to the AI's implementation doc)
- **Layer 2 (re-cast)** — did the user instruct/guide the AI well?

We keep the six-criterion, two-layer rubric, the scoring, and the entire
feedback UI. Only the _evidence the model looks for_ in Layer 2 changes, keyed
off `TYPE`.

### Layer 2 re-castings (this type only)

| Criterion | Default meaning | Re-cast for a built artifact |
|---|---|---|
| `verified` | Did you check the AI's claims vs. accept them blindly? | Is there any sign the user checked what was built against their goal, rather than accepting "it's done"? |
| `owned` | Own thinking vs. generic AI paste | Is the goal specific and genuinely theirs, with evidence they _guided_ the build (constraints, preferences, corrections) vs. a one-line "build me X"? |
| `understood` | Could you explain/defend this? | Can they explain the approach and see its gaps — the rabbit holes their instructions left open? |

The user-facing criterion labels do not change.

## Scope of this check

For "something you built with AI's help — an automation, workflow, app, or
script — where the AI produced the how." Distinct from `work_product` (AI _wrote_
prose) and `concept_articulation` (user explains a concept in their own words).

## Product boundary (eligibility)

This check only works when the user built the thing with a **conversational AI
they can still ask to explain what it built** (ChatGPT, Claude, Gemini, Copilot,
Cursor, Bolt/Lovable/v0, and similar). It does **not** work for tools with no
interrogable chat surface (a raw Zapier/Make visual flow, an embedded feature, a
voice assistant), because there is no implementation doc to fetch.

We **state this limit plainly rather than expand scope** to cover every tool. It
is honest, on-brand for a "supportive but honest coach," and cheaper than
half-supporting tools we cannot evaluate. The `not_evaluable` guardrail remains
the backstop for pastes that are not implementation docs.

## Inputs & data model

`Submission` changes from `{ type, intent, text, originalDraft? }` to
`{ type, intent, text, instructionSummary? }`.

| Field | Required | Role for this type |
|---|---|---|
| `intent` | Yes | "What did you want to build?" — the declared-purpose anchor the whole rubric judges against. |
| `text` | Yes (≥20 chars) | The AI's implementation doc — the **primary scored artifact**. |
| `instructionSummary` | No | The AI's recap of the user's instructions — **soft corroboration** for `owned`/`understood` only. |

`originalDraft` was consumed only by `implementation_logic`, so the rename is
self-contained. Submit gates on `intent` + `text` only; `instructionSummary`
never blocks submission.

## Submission form (`components/SubmissionForm.tsx`)

Replace the two-box "Original Draft / Corrected Version" layout for
`implementation_logic` with three fields, top to bottom:

1. **"What did you want to build?"** _(required)_ — placeholder:
   _"e.g. a flow that files new invoices into the right client folder"_
   (maps to `intent`)
2. **"How the AI says it built it"** _(required, scored artifact)_ — with the
   existing copy-paste scaffold prompt above it
   (_"Explain the logic of what we built, step by step, as if to a smart
   colleague who'll maintain it."_); placeholder: _"Paste the AI's explanation
   of what it built and how…"_ (maps to `text`)
3. **"The AI's summary of your instructions"** _(optional)_ — with a new
   copy-paste scaffold prompt above it (_"Summarize, in order, what I asked you
   to build and any changes I requested."_); placeholder: _"Optional — paste the
   AI's recap of what you asked for…"_ (maps to `instructionSummary`)

Both scaffold prompts are pure convenience — copied by the user into their own
AI, never sent to the evaluator. The submit payload sends `instructionSummary`
in place of `originalDraft`. The 20-char minimum and the "avoid pasting anything
confidential" nudge stay, attached to the implementation-doc field.

## Prompt (`lib/llm/prompt.ts`)

**Remove:** the "AI'S ORIGINAL DRAFT … compare it to the submission (the user's
corrected version) … 'no changes made'" clause, and the `originalDraft` block
builder in `buildMessages`.

**Add:** a `TYPE === "implementation_logic"` conditional block that:

- Frames the submission as the AI's own account of something it **built**
  (automation/workflow/app/script), not prose the user wrote.
- Applies Layer 1 to the described logic (feasible, sound, fits the goal).
- Re-casts Layer 2 per the table above.
- Directs `fix_this_first` to name the single most consequential **gap the
  user's instructions left open** and — hedged, based only on the described
  build, never a claim about the running system — what it could mean for their
  stated goal.
- Uses an `--- INSTRUCTION SUMMARY START/END ---` block as soft corroboration
  when present; judges from `intent` + implementation doc alone when absent.

Retain all existing hedging discipline ("this reads as…") and the
prompt-injection fencing. The `instructionSummary` block is fenced and
neutralized identically to the main submission.

## Feedback UI (`components/FeedbackView.tsx`)

**No change.** Rabbit holes surface in the `understood` criterion's
evidence/next_step; the single biggest ramification leads `fix_this_first`. No
new UI in v1. A dedicated "ramifications" callout is a deliberate fast-follow if
real usage shows it is warranted.

## Eligibility callout — three surfaces

The eligibility line appears on three surfaces:

1. **Submission form** (this type) — under the check-type header, replacing
   today's "Don't have a written explanation?" lead. Full line:
   _"Works with any chat-based AI that can explain what it built — ChatGPT,
   Claude, Gemini, Copilot, Cursor, and similar. If your tool can't produce that
   explanation, this check can't help with it yet."_
2. **Check-type picker** (`components/PurposePicker.tsx`) — a small qualifier on
   the "Automation & Logic" card. Replace its stale hint ("How you'd explain it
   to whoever inherits it," which described the _old_ concept) with the new
   scope plus a condensed eligibility note.
3. **Landing** (`components/RotatingPills.tsx` / `app/page.tsx`) — the lightest
   touch: a single muted caption near the carousel, e.g. _"Automation checks
   need a chat-based AI that can explain what it built."_ Exact placement to be
   confirmed against the live hero so it qualifies the offer without deflating
   the pitch.

## Golden set (`evals/golden-set.ts`)

Audit and replace any `implementation_logic` cases that relied on the draft/diff.
Add three cases:

1. Vague one-line instruction + AI doc → low `owned`/`understood`.
2. Specific goal + evidence of guidance and a real check → Strong.
3. Implementation doc with an obvious uncovered gap (e.g. no dedupe / no error
   path) the instructions never addressed → `understood` Emerging, and
   `fix_this_first` names the gap and its hedged ramification.

`npm run eval` must stay green before the prompt change is accepted.

## Files touched

- `lib/llm/types.ts` — `Submission` field rename `originalDraft` →
  `instructionSummary`.
- `lib/llm/prompt.ts` — remove diff clause; add `TYPE`-conditional Layer 2
  re-cast + `instructionSummary` block.
- `components/SubmissionForm.tsx` — three-field reshape + second scaffold prompt
  + eligibility line + payload field rename.
- `components/PurposePicker.tsx` — updated hint + eligibility qualifier on the
  Automation card.
- `components/RotatingPills.tsx` and/or `app/page.tsx` — landing eligibility
  caption.
- `app/app/page.tsx` — submit payload field rename (`originalDraft` →
  `instructionSummary`).
- `evals/golden-set.ts` — audit + three new cases.
- `lib/llm/prompt.test.ts` — update the case that references `originalDraft`.

## Out of scope

- The other two submission types (`work_product`, `concept_articulation`).
- The six-criterion feedback UI structure.
- A dedicated "ramifications" callout (fast-follow, not v1).
- Supporting AI tools that cannot produce an implementation doc (deliberate
  boundary, communicated via the eligibility callout).

## Risks

1. **Prompt quality is the real risk.** The re-cast Layer 2 must produce
   grounded, hedged feedback and must not confabulate ramifications about a
   system it cannot see. Mitigation: the golden-set cases are the guardrail;
   the prompt change and the eval cases land and pass together before
   acceptance.
2. **Landing caveat over-qualifying the hero.** Mitigation: lightest-touch
   placement, confirmed against the live page.

## Build sequencing

1. Data model + prompt + golden set (`types.ts`, `prompt.ts`, `golden-set.ts`,
   `prompt.test.ts`) — then run `npm run eval` and confirm green **before**
   proceeding.
2. UI + copy (`SubmissionForm.tsx`, `PurposePicker.tsx`, landing, `app/page.tsx`
   payload rename).

Executed via scoped Antigravity prompts with independent verification per the
established loop.
