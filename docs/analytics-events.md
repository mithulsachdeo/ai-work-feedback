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
| `evaluation_completed` | `type`, `provider`, `byo`, `levels` | A submission was scored (`/api/evaluate`) |
| `level_improved` | `type` | A linked resubmission scored higher on ≥1 criterion |
| `submission_not_evaluable` | `type`, `intent`, `textLength`, `provider`, `model`, `reason` | Model bounced a submission — **content-free**; the monitor for false-positive bounces |
| `product_feedback_submitted` | rating/notes | "Tell us" widget (`/api/product-feedback`) |
| `ask_quota_hit` | `evaluationId` | Hit the 10-questions-per-check cap |
| `ask_throttled` | `evaluationId` | Hit the 5-questions-per-minute cap |

_Note: `returned_next_day` is referenced in the old spec but is **not** implemented; use PostHog's
built-in returning-user / retention on `app_opened` instead._

---

## 2. North-star metric

**Number of work-products a user actually improved** — i.e. a submission that was revised and scored
higher on re-check. This is the product's whole thesis: feedback that changes the work, not just
feedback that was seen.

**How it's computed today:** the revise-loop links a resubmission to its parent
(`submissions.previous_submission_id`); `/api/evaluate` compares per-criterion levels
(`improvedAny`), writes `feedback_outcomes.resubmission_improved`, and fires **`level_improved`**.
So the north-star ≈ count of `level_improved` (or `feedback_outcomes` rows with
`resubmission_improved = true`).

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
2. **North-star trend:** `level_improved` over time, and `level_improved ÷ resubmitted`.
3. **Quality monitor:** `submission_not_evaluable` rate by `type`.
4. **Segmentation:** by `role` (`role_selected`) and by submission `type`.

Reminder: #1 and #4 depend on `identify()` being live (see §0.1).
