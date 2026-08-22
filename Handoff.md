# Handoff — Signal / learn (AI-work-feedback MVP, Case Study, due 26 Aug 2026)

_Last updated: 2026-08-23 (end of session). This supersedes all earlier handoffs. The
product is built, deployed, and live — this session was building + fixing + polishing,
not planning. Read this, then read the plan file's grill log (bottom of
`docs/superpowers/plans/2026-08-21-mvp-implementation.md`) for full decision history.
The 2026-08-23 session reframed the Automation & Logic check — see Task 23 below and
`docs/superpowers/specs/2026-08-22-automation-logic-instruction-reframe-design.md`._

## Where things stand

**The MVP is built and live in production:** https://ai-work-feedback-virid.vercel.app/

All 17 original plan tasks (+ Task 6.5) are complete, smoke-tested, and deployed. Five
more tasks (18–22) were added and shipped this session in response to live feedback
from actually using the product. Execution model: **subagent-driven via Antigravity**
(a separate agentic coding tool the user runs locally) — Claude (this session) writes
precise, scoped execution prompts one at a time, Antigravity executes and reports back,
Claude independently verifies (checks actual commits/diffs, doesn't just trust the
report) before handing off the next prompt. This worked well and should continue.

**Nothing is currently blocking.** All outstanding DB migrations have been applied by
the human. The one open item is a full live walkthrough of the production site across
both themes (deferred by user choice, not urgent) — worth doing early next session.

## The product (one line)

A self-serve web tool where a signed-in user submits AI-assisted work (or their
articulation of a concept) and gets bite-sized, teaching feedback scored against a
six-criterion, two-layer rubric — Layer 1 "is the work good?" (accuracy, fitness,
clarity) + Layer 2 "did you use AI well?" (verified, owned, understood) — judged
against a user-declared purpose across three submission types (`work_product`,
`implementation_logic`, `concept_articulation`).

## Stack

Next.js (App Router) on Vercel · Supabase (Postgres + magic-link auth, RLS enabled on
all tables, content access via service-role only) · PostHog analytics · default LLM =
Google **`gemini-3.5-flash-lite`** (free tier, shared server-side key — the plan
originally specified `gemini-2.0-flash`, which was deprecated/delisted mid-session and
replaced after a live validation pass) · optional session-only BYO key
(Gemini/Anthropic/OpenAI).

## Key artifacts

- **The implementation plan is the single source of truth for everything built:**
  `docs/superpowers/plans/2026-08-21-mvp-implementation.md` — 22 tasks, each with real
  code, TDD steps, and commit instructions, plus an extensive grill log at the bottom
  documenting every design decision, bug found, and why. **Read the grill log before
  making further changes** — it explains a lot of non-obvious choices.
- Rubric/product spec: `docs/superpowers/specs/2026-08-21-ai-work-rubric-design.md`
- Implementation/architecture spec: `docs/superpowers/specs/2026-08-21-mvp-implementation-design.md`
- Feature list + roadmap: `docs/superpowers/specs/2026-08-21-feature-list.md`
- Database schema doc: `docs/superpowers/specs/2026-08-21-database-schema.md`
- API list doc: `docs/superpowers/specs/2026-08-21-api-list.md`
- Design system: `design.md` (project root) — explicitly a "starting draft" per the
  user; has been extended substantially during the build (theme tokens, carousel,
  copy voice) beyond what it originally specified. Worth reconciling design.md itself
  with what's actually been built, if there's time — it's now somewhat behind reality.
- `.env.local` (project root, gitignored) — has real Supabase/Gemini/PostHog keys.

## What got built, in order (see plan file for full detail on each)

**Tasks 1–17 (original plan, all complete):** project scaffold → DB schema → LLM
types/schema → rubric prompt → provider adapters (Gemini/Anthropic/OpenAI) →
`evaluate()` orchestration → golden-set eval harness (9 cases) → quota service →
data-writes service → measurement/outcome helpers → event tracking → `/api/evaluate` →
`/api/ask` → auth/consent → landing+sign-in → submission UI → feedback UI → BYO-key
modal/quota banner/app assembly → deploy + full smoke test (including the
launch-blocking cross-user RLS check — passed).

**Task 18 — Product feedback capture:** a lightweight in-app feedback widget (1-5
rating + tag checkboxes + optional free text), stored in a new `product_feedback`
Supabase table, mirrored to a PostHog event (rating/tags only, not the free text).

**Task 19 — Light/dark theme toggle:** originally scoped as a one-way dark reskin of
the in-app screens (to match the landing page's near-black hero), then redesigned
before any code was written into a full user-toggleable light/dark theme — both themes
share the same "framed working-card" composition (thin outer frame + large rounded
content card), just with frame/card colors reversed. No-flash-on-load via an inline
theme-init script. Defaults to dark.

**Task 20 — Rotating pill carousel + situation-framed copy:** the landing page's
"Check any of:" example pills, and the purpose-picker's `work_product` hint, were
rewritten from listing document *formats* ("email, summary, deck") to describing
*situations* ("before you hit send on that email") — a deliberate reframe from
`/superpowers:brainstorming`, since format-lists implied a closed set the product
doesn't actually have (confirmed: the rubric engine is fully generic; a LinkedIn post
scored correctly in testing). The landing pills now rotate one at a time via a small
carousel component, styled after voyageai.com's rotating announcement pattern.

**Task 21 — Role-based analogies in feedback explanations:** the rubric prompt now
explicitly favors short, role-relevant analogies for Layer 2 criteria + `fix_this_first`
(e.g. "like merging code without running tests" for an engineer), while explicitly
preserving the already-locked invariant that role never changes a criterion's *level*,
only its phrasing. Chosen over two alternatives (a second role-blind-then-rephrase LLM
call; static per-role UI templates) specifically to avoid adding a second Gemini call
against the already-fragile shared free-tier rate limit.

**Task 22 — Suggested follow-up questions + abuse-protected coach loop:** up to 3
clickable suggested questions appear with feedback and after every coach answer
(continuing indefinitely if the user keeps clicking) — generated as extra fields on the
*existing* `evaluate()`/`/api/ask` LLM calls, not new calls. Protected by two new
server-side (DB-backed, not client-side — required because Vercel serverless makes
in-memory counters unreliable) limits on `/api/ask`: 10 questions per evaluation, 5
questions per minute per user, both bypassed for BYO-key requests. A real fail-open bug
was found and fixed during this task's verification pass (see below).

**Task 23 — Automation & Logic check reframed around instruction quality (2026-08-23;
built and committed on a branch, pending merge):** the `implementation_logic` submission
type was rebuilt. The old model asked non-technical users for the AI's "original draft" +
their "corrected version" and scored verification by diffing them — a behavior this audience
doesn't have (they don't edit AI-built implementations). The new model: the scored artifact
is the AI's own account of what it built; the user provides their goal, that implementation
doc, and an optional AI-generated summary of their instructions. Layer 2
(verified/owned/understood) is re-cast via a `TYPE`-conditional prompt addendum to measure how
well the user *instructed* the AI (problem articulation, guidance, rabbit holes left open, and
hedged downstream ramifications — explicitly never a claim about the running system, which the
product can't see). The six-criterion rubric and the feedback UI are unchanged. A deliberate
product boundary — "needs a chat-based AI that can explain what it built" — is surfaced on the
submission form, the check-type picker's Automation card, and the landing page (a scope limit
we chose to state plainly rather than expand to cover un-interrogable tools). Worked via
`/superpowers:brainstorming` + `/grilling` before any code. Full design:
`docs/superpowers/specs/2026-08-22-automation-logic-instruction-reframe-design.md`.

- **Data model:** `Submission.originalDraft` → `instructionSummary`; DB column
  `submissions.original_draft` → `instruction_summary` via **migration `0004` (APPLIED to live
  Supabase on 2026-08-23)**.
- **Golden set:** dropped the 2 dead draft-diff cases, added 3 instruction-quality cases
  (vague one-liner → low owned/understood; well-guided + checked → Strong; uncovered gap →
  understood Emerging naming the gap). `npm run eval` green against real Gemini.
- **Also shipped on this branch (2026-08-23, pre/around the reframe):** RoleConsent card was
  invisible in dark theme (used `--theme-card-surface` instead of a solid `--theme-card-bg`);
  role-dropdown options were cream-on-white and unreadable (added solid theme-aware `<option>`
  colors); level badges (Strong/Solid/Emerging) were low-contrast in light mode (made
  theme-aware via CSS `--level-*` tokens); the product-rating "Feedback" control was renamed to
  "Tell us" so it stops colliding with the product's own "feedback"; the intent-field
  label/placeholder was made per-type (the Conceptual Understanding check no longer shows a
  work_product email example).
- **Branch:** `feature/automation-logic-reframe` — **NOT yet merged to `master`.** Commits:
  spec + amendment; backend (types/prompt/golden-set/persistence/migration); UI reshape +
  three-surface eligibility; per-type intent copy. All green: `tsc` clean, 25 unit tests,
  golden set green, production build clean across 12 routes.
- **Process note (worth keeping):** round 1 passed `npm test` + `npm run eval` but the field
  rename had broken `tsc` in the persistence layer, which vitest (untyped) didn't catch. Every
  Antigravity round now gates on `npx tsc --noEmit`, not just the test/eval scripts.

## Real bugs found and fixed this session (worth knowing about, not just historical)

- **Golden-set harness only supported upper-bound assertions**, making two test cases
  vacuous or actively wrong — added a lower-bound (`atLeast`) assertion type.
- **The `not_evaluable` guardrail was too aggressive** — it was swallowing thin/vague
  or unedited-AI-draft submissions that the rubric is specifically designed to score
  low, not refuse. Found by running the golden-set harness live in code (not just
  reasoning about it), fixed by narrowing the guardrail's trigger conditions.
- **`/api/ask` was rendering raw JSON** (`{"response": "..."}`) instead of plain text
  in the coach response box — caused by the Gemini/OpenAI adapters unconditionally
  forcing JSON mode for every call, including this plain-text route. Fixed by giving
  `/api/ask` its own explicit JSON contract + defensive parsing.
- **A real UI contrast bug**: near-black text on a near-black hero background in the
  post-magic-link confirmation box.
- **A fail-open security bug in Task 22's rate limits**: if the DB count query for
  either new abuse-protection check errored, the code treated the error as "count is
  0," silently letting requests through unlimited instead of blocking them. Found and
  fixed during live verification — now fails closed (rejects with a 500 rather than
  silently allowing unmetered requests).
- **Model drift**: `gemini-2.0-flash` (the plan's original model id) was deprecated;
  replaced with `gemini-3.5-flash-lite` after live validation in Google AI Studio.

## Key locked decisions carried from before (see specs for full reasoning)

- Pure self-serve, no employer buyer. De-identified data (content keyed by `user_id`
  UUID, email never in content tables). RLS enabled everywhere; content access only via
  service-role server client — this is the entire security model, and it's been
  verified with a real cross-user test (User B cannot read User A's data).
- NOT solving "what to learn"/roadmap in v1 — deliberate scope cut.
- `/api/ask` does NOT share `/api/evaluate`'s daily quota — considered reversing this
  twice this session (once directly, once implicitly via the suggested-questions loop)
  and both times concluded the separation should stay: sharing one pool would mean
  deep coaching engagement (a good outcome) punishes the user by depleting their
  ability to check new work that day.
- Role (`profiles.role`, a fixed 8-value picklist — not free text, so no
  prompt-injection surface there) is context-only for phrasing/analogies, never changes
  a criterion's level. This invariant has been explicitly re-affirmed twice under
  pressure to change it and should not be casually revisited.

## Working with Antigravity (process note for next session)

The established pattern that's worked well: write one focused, self-contained prompt
per task/fix (Antigravity has no memory between separate prompts unless you explicitly
say "continue from X"), have it report back in detail, then **independently verify**
before moving on — check `git log`, spot-read the actual diffs/files, don't just trust
a "PASS" in a text report. This caught real issues twice (the fail-open bug, and
confirming the abuse-limit verification hadn't actually run yet because the migration
wasn't applied). For anything touching the rubric prompt (`lib/llm/prompt.ts`), always
require a full golden-set rerun (`npm run eval`, 16 cases as of Task 23) before
accepting the change — this has caught real regressions, not just theoretical risk.

**Runtime evals — deliberately NOT built (decision 2026-08-23).** We considered online/runtime
evals (a synchronous LLM-judge on each response, or an async quality-monitoring pipeline) and
declined both: a synchronous judge is redundant (the output is itself an evaluation; malformed
output is already caught by schema-validation + one retry) and would double load on the fragile
shared free-tier key; an async pipeline isn't justified at 40–50 users where outputs can be
eyeballed. **Agreed substitute:** rerun the offline golden-set *periodically* (not only when the
prompt changes) to catch model drift — the one real external risk being the provider
deprecating/changing the model under us, as happened when `gemini-2.0-flash` was delisted.
Build async sampled evals only at a scale where manual review becomes impossible. (Similarly
declined: LLM cost caching — see the feature list §9.15.)

## Open items / not yet done

- **Task 23 (Automation & Logic reframe) — DONE, merged, pushed, deployed.** Merged to
  `master` (merge commit `07d1e96`), pushed to origin (Vercel prod deploy triggered), branch
  deleted. Migration `0004` applied to live Supabase. Live end-to-end walkthrough completed in
  both themes: three fields + both copy-scaffolds render, a real submission returned
  instruction-quality feedback (it flagged the gaps the instructions left open, with a
  role-relevant analogy), light-mode level badges are legible, and the eligibility line shows
  on all three surfaces. Nothing outstanding here.
- **⚠️ Known scaling limits — deliberately NOT fixed; hotfix at launch IF onboarding spikes**
  (user's call, 2026-08-23). At the 40–50-user target the current setup is expected to hold;
  the risk is a burst (e.g. a LinkedIn push landing many people at once). Two cheap, no-code,
  dashboard-only fixes, in priority order:
  1. **Magic-link email — the real onboarding bottleneck.** Sign-in emails go through
     Supabase's built-in SMTP, which is rate-limited (~30/hr, historically less). A signup
     burst means some users never get their link and silently bounce — directly hurting the
     activation metric the case study is graded on. Fix: point Supabase Auth at a free custom
     SMTP provider (Resend / Postmark free tier). ~30 min, $0, no code.
  2. **Shared free-tier Gemini key.** All non-BYO users share one key with per-minute + per-day
     caps; a burst 429s some checks (app degrades gracefully — retry + "add your own key"
     nudge). Fix: enable billing on the Google AI key (pay-as-you-go; `flash-lite` is
     pennies/day at this scale) to remove the daily cliff. No code.
  - Minor, optional: set `export const maxDuration = 30;` on `/api/evaluate` and `/api/ask`
    (no `maxDuration` is set today, so they inherit Vercel's ~10s default — a slow Gemini call
    plus the 2.5s retry could be cut off). The app tier itself (Vercel autoscale + Supabase via
    the PostgREST HTTP API, no direct-connection pooling issue) scales into the hundreds without
    re-architecture — these two dashboard fixes are the whole story until revenue-stage scale.
- **Full live walkthrough** of production, both themes, after this session's rapid
  changes (theme toggle, carousel, role analogies, suggested-questions loop) —
  deferred by user choice, should happen early next session.
- **`design.md` is now somewhat stale** relative to what's actually built (theme
  tokens, carousel pattern, copy voice all evolved past it) — could use a reconciliation
  pass if time allows, though not launch-blocking.
- **Real sample submissions (~15)** to expand the golden set and double as launch seed
  content — status not reconfirmed this session, check if this is still outstanding.
- **Acquisition cycle** (LinkedIn push, warm-network recruitment for the 40-50 target
  users) — status not reconfirmed this session; this remains the actual binding
  constraint on the case study succeeding, not further product polish. Worth checking
  in on this explicitly next session rather than defaulting to more UI iteration.
- **Deferred to roadmap (deliberate, not forgotten):** PWA/mobile support (no manifest,
  service worker, or viewport-specific work yet — explicitly deferred earlier), full
  submission-history browsing UI (only "continue your last check" exists, not a full
  history view), a two-pass role-blind-then-rephrase architecture for role analogies
  (rejected for now due to Gemini call cost, could revisit if this becomes a
  heavily-scrutinized feature at real scale).

## Next steps (suggested order)

1. Do the deferred full live walkthrough (both themes, all screens, the new
   suggested-questions loop, product feedback widget).
2. Check status of acquisition (the actual binding constraint) and real sample
   submissions — these are more urgent than further UI polish with the deadline this
   close.
3. Continue fixing/polishing based on real usage, following the established
   brainstorm → grill (for anything non-trivial) → scoped Antigravity handoff →
   independent verification loop.
4. If time allows: reconcile `design.md` with the actual built system.
