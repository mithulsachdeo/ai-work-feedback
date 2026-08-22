# Feature List — AI-Work-Feedback MVP

_Compiled 2026-08-21 from the rubric spec, implementation spec, and implementation plan
(all already grilled/hardened). Organized by product area, in roughly the order a user
encounters them. Each feature states the "why," not just the "what" — pulled from the
locked decisions already made, not new invention._

---

## 1. Onboarding & Auth

**1.1 Magic-link sign-in (email only, no password)**
Why: lowest-friction entry for a non-technical, self-serve audience; no account/password to manage. Google sign-in was considered and dropped — its unverified-app warning screen undercut the "private, safe" positioning the product depends on, so magic-link is the sole path.

**1.2 One-time role capture ("What's your role?")**
Why: personalization only — used to suggest a relevant starter task and tailor "what good looks like" examples. Deliberately **not** a curriculum fork; the research explicitly warns against defining "professional" as a job title rather than a constraint set. Asked once, never repeated.

**1.3 One-line consent disclosure at signup**
Why: the product's trust promise ("private, safe") requires explicit, honest disclosure — covers both anonymized storage and the free-tier fact that Google may train on submitted content, so users aren't discovering that fact later.

---

## 2. Submission (the "declared purpose" input)

**2.1 Three-question purpose picker** ("Is this ready to send?" / "Is the logic sound?" / "Do I actually understand this?")
Why: the picker is framed by the *question the user wants answered*, not an artifact noun — because the same underlying thing (e.g. an automation) could be a work product or implementation logic depending on intent, and only intent disambiguates. This picker **is** the onboarding — no separate course/tour needed.

**2.2 Per-type guided paste box + one-line intent field**
Why: users must never have to guess what to submit or which type they are; help appears at every step so the "bring your real work" entry point doesn't strand a first-time user.

**2.3 "Generate it" prompt helper (implementation-logic type)**
Why: the target user is non-technical and won't have a written explanation of their own build lying around — asking them to author one from scratch defeats the product's purpose. A copy-paste AI prompt gets them a first draft to correct, which is also what makes 2.4 possible.

**2.4 Dual-capture: AI's original draft + user's corrected version (implementation-logic only)**
Why: without this, the tool only ever sees a self-description it can't verify. Capturing both the AI draft and what the user changed gives the rubric's "verified" criterion (2.1) a real, concrete signal instead of an inferred one — the single strongest fix that came out of grilling the rubric.

**2.5 "Don't store this one" checkbox**
Why: an explicit privacy control that reinforces the "private" positioning — the tool still evaluates the text, it just stores a placeholder instead of the real content, for users who want the check but not the retention.

**2.6 Purpose/text mismatch → `not_evaluable`**
Why: guards against a declared intent that obviously doesn't match the pasted text (e.g. intent says "email," text is code) — routes to the escape hatch instead of silently scoring a nonsensical pair.

---

## 3. Evaluation Engine (the rubric, the actual product)

**3.1 Two-layer, six-criterion rubric** (Layer 1: accuracy, fitness, clarity — "is the work good?" · Layer 2: verified, owned, understood — "did you use AI well?")
Why: this is the standard of "good" the problem statement says nobody has given these users. Layer 1 catches quality problems anyone would flag; Layer 2 is the actual differentiator — it's built to catch the two named failure modes (over-trust fails 2.1/2.3, under-use is exposed by 2.2/2.3) in one pass.

**3.2 One flexible rubric across three submission types, not three separate rubrics**
Why: a single "standard of good" is what keeps the rubric buildable inside a 2-day window, and the type-specific flex language (§4 of the rubric spec) is concrete enough per type to avoid feeling templated — verified empirically via the golden set (3.9).

**3.3 Levels, not scores** (Emerging / Solid / Strong)
Why: this is a teaching tool, not a grader — a number invites a "homework" feeling the product deliberately avoids; three teachable levels are enough to show progress without feeling clinical.

**3.4 Self-report can never raise a level, only hedge**
Why: Layer 2 is inferred from text, and the weak-signal self-report taps ("did you check this?") are trivially gameable — a user can just tap "yes." Only the text signal (or, for 2.4's dual-capture, the actual diff) earns credit; self-report can lower confidence but never inflate a score.

**3.5 Unsupported-claims skepticism** ("I tested it, it works" ≠ free credit)
Why: closes the most obvious way a user could game the accuracy criterion on implementation-logic submissions, where the tool only ever sees a description, not the real artifact.

**3.6 Prompt-injection defense** (fenced submission text + scored as evidence, not just blocked)
Why: the tool always grades free text the user controls, so it must defend against text engineered to manipulate the judge. A detected attempt is treated as direct negative evidence under "owned" (2.2) — it's literally not the user's own work — rather than needing a separate UI state.

**3.7 `not_evaluable` escape hatch**
Why: prevents the model from hallucinating six scores against gibberish, an empty template, or a "do this task for me" request — the tool must refuse gracefully rather than invent a judgment on nothing.

**3.8 "Fix this first" — one headline, deterministic selection**
Why: the *experience* must be one glance + one fix even though all six criteria run underneath (research: micro-sessions of 5–10 min, cramming kills retention). Lowest level wins outright; Layer 2 wins ties, since validation/judgment failures are the ones research says nobody currently surfaces for users.

**3.9 Golden-set eval harness** (seed cases + per-type + injection cases)
Why: the eval prompt is the real engineering risk, not the app shell. This is the quality gate — proves the rubric prompt reliably catches planted issues, proves the single rubric is genuinely type-specific in practice (not just by design), and proves the injection defense actually works, before the prompt is trusted in production.

---

## 4. Feedback Experience

**4.1 Six level chips + one "Fix this first" headline (first view, ~20 sec)**
Why: matches the governing constraint — feedback must improve the work in the user's hand, not just grade it — by giving an immediate, actionable read before any deep-dive.

**4.2 Progressive disclosure per criterion** (evidence + next step + "what good looks like")
Why: keeps the bite-sized promise; a user only goes deeper on the criterion they care about, and every card teaches the standard, not just the verdict — so the user internalizes "good" rather than just being told a grade.

**4.3 Side-questions channel ("ask anything")**
Why: acts like a good tutor — never refuses a tangent, always routes back to the current step ("…back to your email — the fix is still X") — so curiosity doesn't derail the loop, and the tool stays useful for the "judgment-stuck" case without becoming a general copilot.

**4.4 Empathy delighter** (constant high-stakes-work line + client-clock late-night line)
Why: a low-cost trust/care touch, scoped deliberately small — static copy only, no behavior tracking — so it adds warmth without becoming a wellness feature or feeling like surveillance on top of a tool that already scrutinizes the user's work.

---

## 5. Measurement Loop (the north-star mechanic)

**5.1 "Revise & re-check this"** (linked resubmission via `previous_submission_id`)
Why: this is what makes the north-star metric ("a resubmission that moves up a level") real rather than aspirational — without lineage, there's no way to measure whether feedback actually changed anything.

**5.2 Level-comparison + `feedback_outcomes` write** (`viewed_fix`, `resubmitted`, `resubmission_improved`)
Why: this is the behavioral ground-truth signal — "did the user act on the fix, did it get better" — not a vanity metric like lessons-watched. Ownership-checked server-side so a user can't link to (and read the levels of) someone else's submission.
Deliberately excluded from strict validation: no ownership check on `evaluationId` in the lower-stakes `viewed_fix` write — write-only, accepted risk at 40–50-user scale.

---

## 6. Quota & BYO-Key Unlock

**6.1 Daily quota on the shared free key** (10 checks/day, `/api/evaluate` only)
Why: protects the shared Gemini key from abuse without requiring users to bring anything — this is what keeps runtime LLM cost at zero by default.

**6.2 Quota split: read-before, consume-after-success**
Why: a failed or `not_evaluable` evaluation must never burn a user's daily allowance — punishing a user for the tool's own parsing failure (or for pasting something that turned out not to be evaluable) would be unfair and would suppress retries exactly when a retry is harmless.

**6.3 `/api/ask` exempt from the shared quota**
Why: a single realistic first session (submit → ask a question or two → revise) could otherwise burn most of a new user's 10 daily checks before they've even explored the product — this would kill activation for the exact users the launch most needs to convert.

**6.4 BYO-key unlock** (session-only, never persisted, three providers)
Why: the opt-in upgrade path — better quality (especially Layer 2, the differentiator), no quota, and the user's own provider relationship under their own terms. Framed positively in-app ("get sharper AI-usage feedback with your own key") rather than as a confession that the free tier is weaker.

---

## 7. Guardrails (cross-cutting, protecting the loop itself)

**7.1 Strict schema validation on every model response**
Why: the model can never hand the UI a malformed or partial result — a bad response is retried once (LLM call only, not the DB writes) and then surfaces a friendly error, never a broken screen.

**7.2 On-purpose-use scoping** (`/api/ask` auth-gated + scoped prompt; `/api/evaluate`'s `not_evaluable` also catches "do this task for me" requests)
Why: the tool must never become a free general-purpose AI riding on the shared key — this is both a cost guard and a positioning guard (it stays a judgment tool, not a copilot).

**7.3 Input-size cap with visible truncation notice**
Why: protects latency/token cost from one outsized paste, without silently dropping content the user doesn't know is missing.

**7.4 Ownership check on `previousSubmissionId`**
Why: content tables have no RLS by design (all authorization happens in application code), so this is the one thing standing between a user and reading another user's scored evaluation levels via a crafted resubmission link.

**7.5 Row-Level Security on all tables**
Why: launch-blocking baseline — the public anon key in the browser must never be able to read another user's content; this is verified with a cross-user smoke test before launch, not assumed.

**7.6 Paste-box confidentiality nudge**
Why: acquisition is explicitly warm-network (real colleagues, real client names, real figures), and PII-scrubbing is deliberately deferred — one line of copy meaningfully reduces the chance someone pastes something they'd regret, at effectively zero build cost.

---

## 8. Instrumentation (case-study deliverable)

**8.1 Full AARRR funnel event set** (`landing_viewed` → `signed_up` → `submission_created` → `evaluation_completed` → `resubmitted` → `level_improved`, etc.)
Why: the case grades the full loop with real users, not polish — without instrumentation there's no way to show acquisition, activation, retention, or the north-star metric actually moving.

**8.2 `levels` captured on `evaluation_completed`**
Why: without this, PostHog can show that evaluations happened but not what they said — losing the ability to analyze which criteria are weakest across the real user base, which is also the qualitative story for the case writeup.

---

---

## 9. Not in v1 — Future Releases / Roadmap

Pulled together from the scope-boundary sections and open-items lists across all three specs.
Split into two kinds: things **rejected on principle** (bringing them back would undermine a
locked positioning decision) and things **deferred on cost/time** (no objection, just didn't
fit the 2-day window).

### Rejected on principle (not just "later" — reconsidering these changes what the product is)

**9.1 Role-based learning roadmap / authored curriculum**
Why rejected: this is the moat decision, not a gap. The product occupies the adjacent,
unserved "validation and judgment" slot precisely by *not* being curriculum-first — building
one would put it in direct, worse-differentiated competition with iro.ai and reintroduce the
low-trust-roadmap problem the research flags. A lightweight roadmap already emerges for free
from each user's weakest criterion.

**9.2 Employer / L&D buyer layer**
Why rejected: any buyer-side visibility breaks the psychological safety the entire product
depends on — a user cannot bring their real, unfiltered work if a manager might see the
verdict. This is a structural incompatibility, not a resourcing question.

**9.3 Copilot / "do the next step for me" mode**
Why rejected: the tool sharpens judgment about work the user already has; it does not
outsource the doing. Building an execution-stuck helper would compete head-on with the AI the
user is already using (ChatGPT, Cursor) and recreate the AI-as-crutch pattern the research
names as the category's central danger.

**9.4 Google sign-in**
Why rejected (not merely deferred): the unverified-app warning screen actively undercuts the
"private, safe" trust positioning at the exact moment a new user decides whether to trust the
tool — bringing it back would need Google's app verification resolved first, not just build
time.

### Deferred on cost/time (no objection — just didn't fit 2 days)

**9.5a PWA installability (manifest, icons, service worker) — added 2026-08-21**
Status: genuine gap, not a deliberate cut — never raised until now. Neither the plan nor the
spec has a `manifest.json`, icons, service worker, or PWA registration anywhere. Why deferred:
the 2-day budget is already fully allocated; retrofitting a manifest + service worker later is
cheap relative to redoing it, unlike gaps that touch core data flow. Basic mobile-browser
usability is *partially* covered by accident (simple stacked `maxWidth` layouts, no complex
grids) but has never been verified at mobile viewport width — that verification is also
deferred, not confirmed working.

**9.5 Layer-2 self-report UI (the 1-2 single-tap questions)**
Status: specced (rubric spec §4/§5) and the DB already supports it (`feedback_outcomes.action`
includes `'self_report'`), but the actual tap-question UI was never wired into the plan's
`FeedbackView`/`SubmissionForm`. Why deferred: the hedge-in-text-copy already covers the
honesty requirement without it; the tap UI is a quality refinement, not a launch blocker.

**9.6 Layer-routed hybrid provider strategy (Layer 1 on free tier, Layer 2 only on a frontier model)**
Why deferred: doubles the calls (and cost/latency) per evaluation for a quality gain that
BYO-key already delivers today at zero extra engineering.

**9.7 PII-scrub pass on stored submission text**
Why deferred: acceptable posture at friendly-tester scale (40–50 known users) is raw text
under a pseudonymous key + clear disclosure (§7.6 nudge + consent line); a scrub pass is real
engineering effort with low payoff until the user base grows past people the builder knows
personally.

**9.8 BYO-key encrypted persistence** (currently session-only, re-entered each visit)
Why deferred: session-only has zero key-at-rest liability, which is the safer default; adding
persistence is a convenience feature, not a capability gap.

**9.9 "Any provider" beyond the three named BYO options**
Why deferred: `evaluate()` is already provider-agnostic by design, so adding a fourth adapter
is a small, localized change *when demand appears* — building it speculatively now has no
current user asking for it.

**9.10 Deeper native artifact grading** (spreadsheets/dashboards/code graded on their own terms, not as text-explanations)
Why deferred: this is a v2 segmentation decision, not a v1 gap — every submission currently
reduces to text (including implementation-logic's dual-capture description), which is what
keeps a single rubric buildable at all. Native grading would need per-artifact-type judging
logic, a materially bigger engineering lift.

**9.11 LLM-parsing hardening** (prose-preamble/lowercase-enum extraction, provider-call
timeouts, a distinct invalid-BYO-key error message)
Why deferred: the current strict-schema-plus-one-retry approach (7.1) is good enough at MVP
scale; these are refinements to a working baseline, not fixes to a broken one.

**9.12 Empathy delighter's session-duration variant** ("you've been at this a long time")
Why deferred: the only variant of the empathy idea that needs real behavior tracking
infrastructure — cut from v1 specifically to keep the feature at delighter cost (see feature
4.4); revisit only if the static/time-of-day version proves the concept resonates.

**9.13 Acquisition channel / growth loop**
Why deferred from this doc specifically: the case treats it as its own required deliverable,
not a product feature — tracked separately, not folded into the build spec.

**9.14 Pricing / monetization beyond BYO-key**
Why deferred: out of scope for a validation-stage MVP graded on the feedback loop and real
user behavior, not revenue.

**9.15 LLM cost caching (response cache + explicit provider prompt caching) — added 2026-08-23**
Why deferred (really: not worth building at this scale). Two flavors, both a poor fit right now:
*Response caching* (reuse a stored answer for an identical request) has a near-zero hit rate —
every submission is unique personal work judged against a per-user purpose + role, so identical
requests essentially never recur; caching users' submissions as keys would also cut against the
privacy positioning. *Explicit provider prompt caching* (cache the static rubric prefix) would
shave only fractions of a cent off an already-near-zero cost (free tier / pennies on
`flash-lite`) for a ~1–2k-token static prompt that Gemini already caches implicitly for free.
Revisit only at high-volume paid scale, and even then lean on the provider's automatic prompt
caching rather than a hand-built cache.

**9.16 Runtime (online) evals — synchronous judge + async quality-monitoring pipeline — added 2026-08-23**
Why deferred. The product already has the pieces that matter: strict per-response schema
validation + one retry (a structural runtime guardrail, §7.1), the `not_evaluable` refusal
(§3.7), and real-world quality signals (PostHog level distributions §8.2, the revise→improve
outcome loop §5, the "Tell us" product-feedback ratings, and human spot-check). A *synchronous*
LLM-judge is redundant — the output is itself an evaluation and malformed output is already
caught — and would double calls on the fragile shared free-tier key (the same reason a second
Gemini call was rejected for role analogies). An *async* monitoring pipeline is real infra not
justified at 40–50 users, where outputs can be reviewed by hand. **Agreed substitute:** rerun
the offline golden-set (§3.9) *periodically*, not only on prompt edits, to catch model drift —
the one external risk being the provider deprecating/changing the model (as happened when
`gemini-2.0-flash` was delisted). Build async *sampled* evals only at a scale where manual
review becomes impossible.

