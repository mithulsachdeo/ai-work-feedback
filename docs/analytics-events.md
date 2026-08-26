# Whetstone — Analytics & Metrics Reference

_Created 2026-08-24. The single current source for what we track in PostHog, the north-star, and
the raw signals available for leading/lagging metrics. Supersedes the event list in
`docs/superpowers/specs/2026-08-21-mvp-implementation-design.md §8` (that copy is pre-launch and
missing events added since)._

---

## 0. Read these caveats first — or PostHog will mislead you

1. **`identify()` must be live for funnels to work.** Client events (below) attach to PostHog's
   anonymous browser id; server events use the Supabase `user.id`. `posthog.identify(user.id)` (in
   `app/app/page.tsx`) stitches them into one person. It is **committed on PR #2 but only takes
   effect once that build is promoted/merged to production.** Until then, any funnel that crosses a
   client event → a server event (e.g. `landing_viewed → evaluation_completed`) will look broken
   even though the data is fine. Check the deploy before trusting cross-boundary funnels.
2. **`auth.users` is the true signup count, not `profiles`.** A `profiles` row is only written when
   a user completes the "What's your role?" screen (`RoleConsent`). People who sign up but bounce
   before that exist in **Supabase → Authentication → Users** but not in `profiles`. Use `auth.users`
   (or the `signed_up` event) for signups; `role_selected` for onboarding completion.
3. **`person_profiles: "identified_only"`** — anonymous-only visitors don't create person profiles;
   they appear once identified. Expected, not a bug.
4. **Client vs server.** Client events fire from the browser (`posthog-js`); server events fire from
   API routes (`posthog-node`, via `lib/events.ts` `track()`, which swallows its own errors).

---

## 1. Event inventory

### Client events (`posthog.capture`)

| Event | Properties | Fires when / where |
|---|---|---|
| `landing_viewed` | — | Landing page load (`app/page.tsx`) |
| `app_opened` | — | `/app` load (`app/app/page.tsx`) |
| `signed_up` | — | `RoleConsent` mounts = first-ever `/app` visit (proxy for signup) |
| `role_selected` | `role` | User picks a role + Start (onboarding complete) |
| `type_selected` | `type` | Picks a check type card |
| `submission_created` | `type`, `revision` | Submit pressed |
| `resubmitted` | `type` | Submit pressed on a revision (revise-loop) |
| `resumed_last_check` | — | "Resume your previous check" used |
| `quota_hit` | — | Client sees a 429 (out of daily checks) |
| `byo_key_added` | `provider` | User adds their own API key |
| `fix_viewed` | `evaluationId` | Feedback "fix this first" viewed |
| `criterion_expanded` | `criterion` | A rubric chip expanded |
| `side_question_asked` | `evaluationId`, `byo` | "Ask coach" / suggested question used |
| `signed_out` | — | Sign-out confirmed (fired **before** `reset()`, so still attributed) |

### Server events (`track(user.id, …)`, `lib/events.ts`)

| Event | Properties | Fires when / where |
|---|---|---|
| `evaluation_completed` | `type`, `provider`, `byo`, `levels`, `root_submission_id` | A submission was scored (`/api/evaluate`). Denominator source for the north-star. |
| `level_improved` | `type`, `root_submission_id` | A linked resubmission scored higher on ≥1 criterion. Numerator source for the north-star. |
| `submission_not_evaluable` | `type`, `intent`, `textLength`, `provider`, `model`, `reason` | Model bounced a submission — **content-free**; the monitor for false-positive bounces |
| `product_feedback_submitted` | rating/notes | "Tell us" widget (`/api/product-feedback`) |
| `ask_quota_hit` | `evaluationId` | Hit the 10-questions-per-check cap |
| `ask_throttled` | `evaluationId` | Hit the 5-questions-per-minute cap |

_Note: `returned_next_day` is referenced in the old spec but is **not** implemented; use PostHog's
built-in returning-user / retention on `app_opened` instead._

---

## 2. North-star metric — Artifact Improvement Reach

**Of every artifact-lineage that got real feedback, what share was ever improved based on it.**
Locked & validated via /grilling, 2026-08-24. This supersedes the earlier "count of
`level_improved`" phrasing: the metric is a **per-artifact-lineage ratio**, not a raw event count.

```
Artifact Improvement Reach =
  (lineages with ≥1 real improvement anywhere in the chain)
  / (lineages that ever received ≥1 real, scored evaluation)
```

An **artifact-lineage** = an original submission plus every resubmission chained to it via
`previous_submission_id`, grouped to a common root (`submissions.root_submission_id`, set by the
trigger in migration 0005). Counted **per-lineage, not per-user**, so a prolific user can't dominate
the ratio. "Real" excludes `not_evaluable` guardrail bounces (no feedback was delivered, so there
was nothing to act on). "Improvement" = existing `improvedAny()` semantics: any of the six criteria
ranked higher than its immediate parent, OR'd across every hop in the chain.

**Source of truth:** `analytics-queries.sql` (recursive CTE over `previous_submission_id`, run in
Supabase). **Reproduced live in PostHog** via the `root_submission_id` property on both metric
events — the two computations must agree:

```sql
-- PostHog → Insights → SQL (HogQL). This IS the north-star.
select
  count(distinct if(event = 'level_improved',      properties.root_submission_id, null)) as improved,
  count(distinct if(event = 'evaluation_completed', properties.root_submission_id, null)) as scored,
  round(100.0 * improved / nullif(scored, 0), 1) as improvement_reach_pct
from events
where event in ('evaluation_completed', 'level_improved')
```

Because `evaluation_completed` fires only on a genuinely scored eval (bounces fire
`submission_not_evaluable` instead), `count(distinct root_submission_id)` over it = the denominator
(lineages that got real feedback). `level_improved` fires only when `improvedAny` is true, so the
same distinct-count over it = the numerator. Segment by `properties.role` or `properties.type` via a
`breakdown`. **Only covers lineages whose events fired after migration 0005 shipped** — for the
historical baseline, run `analytics-queries.sql` against Supabase.

**Known edge case (parked):** a user who scores Strong on everything at first submission has no
headroom to "improve" — see the grill note in the mvp-implementation-design spec.

---

## 3. Raw signals available for leading / lagging (framework is next session's work)

This lists the inputs; it deliberately does **not** pre-decide the leading/lagging split — that's the
task. Candidate groupings to react to, not adopt blindly:

- **Acquisition:** `landing_viewed`, referrer/UTM (tag launch links with `?utm_source=…`).
- **Activation:** `signed_up` → `role_selected` → first `evaluation_completed`.
- **Engagement:** `fix_viewed`, `criterion_expanded`, `side_question_asked`, evals per user.
- **Core value / north-star (laggier):** `resubmitted` → `level_improved` (and its ratio).
- **Retention (lagging):** returning `app_opened`, `resumed_last_check`.
- **Health / quality:** `submission_not_evaluable` rate (should trend down after the PR #2 fix),
  `quota_hit` / `ask_quota_hit` / `ask_throttled` (limit friction + monetization signal),
  `byo_key_added` (power-user intent).

---

## 4. Suggested PostHog insights to build (task: "see analytics")

1. **Acquisition funnel:** `landing_viewed → signed_up → submission_created → evaluation_completed`,
   broken down by UTM source. (Watch `app_opened ≫ signed_up` = onboarding drop.)
2. **North-star (Artifact Improvement Reach):** the HogQL insight in §2. For a trend, wrap it in a
   `toStartOfWeek(timestamp)` group-by; for segments, add a `breakdown` on `properties.role`/`type`.
3. **Quality monitor:** `submission_not_evaluable` rate by `type`.
4. **Segmentation:** by `role` (`role_selected`) and by submission `type`.

Reminder: #1 and #4 depend on `identify()` being live (see §0.1).
