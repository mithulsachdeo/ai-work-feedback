# Handoff — Learning Tech & AI for Non-Tech Professionals (Case Study, due 26 Aug 2026)

_Last updated: 2026-08-21 (end of session). This supersedes the earlier handoff; product decisions now live in the spec files below._

## Where things stand
Product is fully designed and planned; **nothing is built yet.** Today we produced two design specs and a full implementation plan, added a guardrails & evals pass, and ran a senior-PM and senior-QA review of the plan. Execution mode is chosen (subagent-driven) but **paused** — build has not started. The binding constraint remains **getting 40–50 real, activated users + one iteration by 26 Aug**, and acquisition has not been designed yet.

## Final problem statement (unchanged)
> For the employed, mid-career non-technical professional who already uses AI daily but was never taught it — whether they quietly **under-use it** (unsure they're doing it right) or **over-trust it** (delegating without checking) — nothing checks their AI-assisted work against a standard of what "good" looks like for their role. So their confidence stays untested and collapses the first time it's checked — a review, or a mistake someone else catches first.

## The product (one line)
A **self-serve web tool** where a signed-in user submits AI-assisted work (or their articulation of a concept) and gets **bite-sized, teaching feedback** scored against a **six-criterion, two-layer rubric** — Layer 1 "is the work good?" (accuracy, fitness, clarity) + Layer 2 "did you use AI well?" (verified, owned, understood) — judged against a user-declared purpose across three submission types (`work_product`, `implementation_logic`, `concept_articulation`). Feedback+teaching, not a grader. Entry point = "bring one thing you made with AI," not a course.

## Artifacts produced (all in `docs/superpowers/`)
- **Product/rubric spec:** `specs/2026-08-21-ai-work-rubric-design.md`
- **Implementation spec:** `specs/2026-08-21-mvp-implementation-design.md`
- **Implementation plan (17 tasks + Task 6.5, TDD):** `plans/2026-08-21-mvp-implementation.md`
- Prior context: `Opportunity Prioritisation.md`, research docx files (project root).

## Key locked decisions (see specs for reasoning)
- Pure self-serve (employer buyer would break psychological safety). Personas by behavior not title (Silent Struggler / Overconfident Delegator).
- **Stack:** Next.js on Vercel · Supabase (Postgres + magic-link/Google auth) · PostHog analytics · **default LLM = Google Gemini free tier (shared server-side key; users enter nothing)** · optional session-only BYO paid key (Gemini/Anthropic/OpenAI) = the "unlock" mechanic. Daily quota ~10/day.
- De-identified data (content keyed by user_id UUID, email never in content). `feedback_outcomes` intended as the improvement signal.
- NOT solving "what to learn"/roadmap in v1 (deliberate moat). "Get unstuck" = judgment-stuck only, NOT a copilot.
- Guardrails: prompt-injection defense, `not_evaluable` escape hatch, input cap, on-purpose-use scoping (auth-gated + scoped `/api/ask`). Evals: golden-set harness (plan Task 6.5), human spot-check, behavioral outcomes.

## ⚠️ Review findings (from PM + QA agents) — most now FOLDED INTO the spec + plan
Both reviewers independently concluded: **the plan over-invests in the eval engine and under-invests in the measurement + user loop the case actually grades.**

**✅ FOLDED IN (2026-08-21):** P0 #1 (RLS + policies), P0 #2 (measurement loop — `previous_submission_id`, `improvedAny`, `/api/outcome`, server-side improvement write + `level_improved`, "Revise & re-check" UX), P0 #3 (quota read-before/consume-after-success + `/api/ask` shared quota + length caps), P1 #4 (full event set + `levels` on `evaluation_completed`), P1 #6 (privacy: "don't store this one" option + paid-key-at-launch recommendation), P2 (quota off-by-one fixed via read/consume split → now exactly 10; truncation notice on every response). Plus bonuses: RoleConsent upsert error-check, `byoProvider` validation. New plan task: **Task 8.5** (level-comparison + `/api/outcome`).

**⏭ STILL DEFERRED (decide before/at build):** P1 #5 (no-signup demo + Google-primary sign-in — reduces bounce), P1 #7 (LLM-parsing hardening: prose-preamble/lowercase-enum extraction, provider timeouts, distinct invalid-BYO-key message), P1 #8 (deeper injection sanitization: fence+cap the `intent` field, neutralize marker strings, add an injection golden case), P2 (build-or-cut Layer-2 self-report; add a `/api/evaluate` test; expand golden set to ~12). Reference detail below:

**P0 — launch-blocking:**
1. **Enable Supabase RLS + policies** (QA). Migration never enables RLS; the public anon key would expose every user's raw submissions. Self-scope all tables to `auth.uid()`; keep content writes on the service-role server client.
2. **Make the north-star metric measurable** (BOTH — the headline miss). No submission lineage, `feedback_outcomes` never written, `level_improved` missing, `resubmitted` fires on button click. Add `submissions.previous_submission_id`; write `feedback_outcomes` via a `POST /api/outcome`; fire `resubmitted`/`level_improved` at real resubmit time comparing linked levels.
3. **Don't consume quota on failed/`not_evaluable` evals; add quota + size cap to `/api/ask`** (QA). Increment only after a parsed success.

**P1 — serious:**
4. Emit the full funnel event set (missing `signed_up`, `role_selected`, `submission_created`, etc.); put `levels` back on `evaluation_completed`.
5. Reduce pre-value friction: add a no-signup sample/demo; make Google sign-in primary.
6. Resolve privacy-vs-training honestly (free-tier Google-trains-on-inputs contradicts the "private" moat + poisons data); consider a paid shared key at launch so Layer-2 shows well.
7. Harden LLM parsing (prose preamble / lowercase enum), add provider-call timeouts, validate `byoProvider`, surface invalid-BYO-key distinctly.
8. Close injection holes: fence + cap the `intent` field; neutralize marker strings in user text; add an injection golden-set case.

**P2 — cheap fixes / decide:** quota off-by-one (ships 9, self-review says 10 — set `DAILY_QUOTA=11`); truncation notice only fires on retry branch; Layer-2 self-report specced but unbuilt (build or cut); add a `/api/evaluate` test + injection eval; expand golden set to ~12.

_Full consolidated report is in the session transcript; the two raw agent reports are not saved to file._

## Next steps (in order, for the next session)
1. **PRD: explore 3 solution directions** (see dedicated section below) — user wants this FIRST on restart.
2. **Review triage — DONE** (folded P0 #1–3, P1 #4/#6, cheap P2 into spec + plan on 2026-08-21). Remaining deferred items: P1 #5 (demo/Google-primary), #7 (parsing/timeout/BYO-error), #8 (injection sanitization), P2 (Layer-2 self-report decision, extra tests, golden-set expansion) — decide these at build time.
3. **`git init` + commit** the specs/plan (still not a git repo) so subagent build has a clean baseline.
4. **Pre-build setup** — create PostHog account (only missing one); collect all keys into `.env.local`.
5. **Start acquisition cycle IN PARALLEL** — it's the binding constraint; pre-recruit a warm list of 50+ and pre-write ~15 real sample submissions (double as launch seed + golden set).
6. **Perfect the rubric prompt** (Task 6.5 golden set) in a chat window before wiring the engine.
7. **Execute the plan subagent-driven** (Task 1 → 17), review between tasks.
8. Launch (~23–25 Aug) → observe PostHog + human spot-check → ship one iteration → write up the submission.

## TODO NEXT SESSION — PRD requirement: 3 solution directions
The user's PRD template requires exploring **at least 3 solution/direction paths and why one was chosen over the other 2**; the alternatives can be tangential to the finalized direction. **This is not yet written — do it first on restart.**

- **Chosen direction (what we designed):** feedback-on-your-real-work against a rubric — the "validation/judgment" wedge. Why it wins is documented across the rubric spec (§7 positioning, iro.ai contrast) — pull from there.
- **Seed candidate alternatives to develop (tangential, pick ~2 to contrast):**
  1. **Curriculum/lessons-first ("Duolingo/iro.ai for AI")** — teach via bite-sized synthetic lessons + streaks. _Rejected because:_ crowded/low-trust (FOGS), teaches vocabulary not capability, and doesn't answer "am I doing this right on my real work" — the actual unmet need.
  2. **Human/community mentor model (WhatsApp-tutor style)** — recurring live guidance. _Rejected because:_ doesn't scale to a 40–50-user self-serve MVP in the timeline, and the differentiator (private, instant judgment) is weaker.
  3. **Prompt-library / role-templates tool** — give people better prompts for their function. _Rejected because:_ it improves inputs, not judgment; users still can't tell if the output is good — deepens the AI-as-crutch risk the research warns about.
  4. (Optional B2B tangent) **Employer AI-usage audit/certification** — _Rejected for MVP because:_ enterprise sales cycle incompatible with the deadline and breaks the private, psychologically-safe loop.

  Develop 2 of these into proper alternatives with trade-offs, then write the "why chosen over these" justification for the PRD.

## Open items (not blocking, carried)
- Acquisition channel/hook + growth loop (its own brainstorm cycle — start next session).
- Verify current Gemini free-tier model name + rate limits at build time.
- Pricing/monetization beyond BYO-key; v1.1 layer-routed hybrid provider strategy; PII-scrub pass on stored text.
