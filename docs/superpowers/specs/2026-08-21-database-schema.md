# Database Schema — AI-Work-Feedback MVP

_Compiled 2026-08-21, updated same day after a two-agent requirements/UI-sync audit. Source of
truth for the actual DDL is `supabase/migrations/0001_init.sql` (Task 2 of
`2026-08-21-mvp-implementation.md`) — this doc explains what each table/column is for and why
it exists, not just what it is. Ownership checks and cross-session resume (earlier fixes)
added new queries/API routes only, no schema changes. The audit below DID require one real
schema change (`original_draft`) plus a constraint tightening (`intent not null`)._

---

## 1. `profiles`

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid, PK, FK → `auth.users(id)` | Links to Supabase's own auth table — this row is the *only* place identity and content connect. |
| `role` | text | One-time personalization input (Marketing, Ops, HR, etc.) — used only to tailor starter-task suggestions and "what good looks like" examples, never to fork a curriculum. |
| `consented_at` | timestamptz | Records when the user accepted the consent disclosure — a compliance/audit trail, not just a UI flag. |
| `created_at` | timestamptz | Standard signup timestamp. |

**Why this table exists separately at all:** it's the deliberate seam between identity and content. Email lives only in Supabase's own `auth.users`, never in `profiles` or any content table — this is what makes the "de-identified data" promise actually true rather than just claimed.

---

## 2. `submissions`

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid, PK | The pseudonymous key everything else joins on. |
| `user_id` | uuid, FK → `profiles(id)` | Links content to a user by UUID only — never by email. |
| `type` | text, checked (`work_product` / `implementation_logic` / `concept_articulation`) | Drives which rubric flex applies. |
| `intent` | text, **not null** (fixed 2026-08-21, from requirements audit — was nullable) | The user's one-line declared purpose — what the rubric judges the artifact against; the purpose/text-mismatch guardrail (rubric spec §3) has nothing to compare against without it. |
| `text` | text | The submission itself (or a placeholder string, `"[not stored at user request]"`, if "don't store this one" was checked). |
| `original_draft` | text, nullable (added 2026-08-21, from requirements audit) | `implementation_logic` only — the AI's pre-edit draft, paired with `text` (the user's corrected version). This is the dual-capture verification signal the rubric spec calls "stronger than inferring from prose alone" for criterion 2.1 — it existed as a design decision in the rubric spec but had no column, no capture UI, and no golden-set case until this audit. |
| `previous_submission_id` | uuid, FK → `submissions(id)`, nullable | **The single most important column in the schema** — without it, "did this user's work improve on resubmission" (the north-star metric) can't be measured at all. This is what makes "Revise & re-check" a linked event instead of just another unrelated submission. |
| `created_at` | timestamptz | Ordering/lineage support; also what `getLastSubmission` sorts on for cross-session resume. |

---

## 3. `evaluations`

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid, PK | |
| `submission_id` | uuid, FK → `submissions(id)` | One evaluation belongs to exactly one submission. |
| `result_json` | jsonb | The full structured rubric output (six criteria + `fix_this_first`, or the `not_evaluable` branch) — stored as JSON rather than six separate columns because the shape is a discriminated union and the schema is still being tuned via the golden set; JSON keeps that flexible without a migration every time the prompt changes. |
| `provider` | text | Which LLM answered (gemini/anthropic/openai) — needed to explain quality variance later (free tier vs. BYO). |
| `model` | text | The exact model string — pins down *which* Gemini/Claude/GPT version, since these change over time. |
| `byo` | boolean | Whether this ran on the shared key or the user's own — separates quota-affecting evaluations from unlimited ones in analysis. |
| `created_at` | timestamptz | |

**Why separate from `submissions` at all:** an evaluation is a re-runnable *judgment* of a submission, not the submission itself — keeping them apart is what lets `getEvaluationLevels`/`getLastSubmission` fetch "the latest scored result for this submission" cleanly, and keeps the raw user text distinct from the model's opinion of it.

---

## 4. `feedback_outcomes`

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid, PK | |
| `evaluation_id` | uuid, FK → `evaluations(id)` | Which evaluation this behavioral signal is about. |
| `action` | text, checked (`viewed_fix` / `resubmitted` / `self_report`) | What the user actually did after receiving feedback. |
| `resubmission_improved` | boolean, nullable | The literal answer to "did this user's work get better" — null for `viewed_fix`/`self_report` rows, set true/false only on a `resubmitted` row. |
| `created_at` | timestamptz | |

**Why this table exists:** explicitly called "the gold signal" in the spec — it's the behavioral ground-truth data (did the user act on feedback, did it work) that the case-study north-star metric and the "was this useful" evaluation both depend on. Without it, PostHog events alone would show *that* people used the tool, not whether the tool actually helped them.

---

## 5. `daily_usage`

| Column | Type | Purpose |
|---|---|---|
| `user_id` | uuid, FK → `profiles(id)` | Part of composite PK. |
| `day` | date | Part of composite PK — one row per user per day. |
| `count` | int | The running tally of evaluations consumed today. |

**Why a separate table instead of a counter on `profiles`:** a per-day row (rather than a single running counter) is what makes the daily reset trivial — a new day is automatically a new row via `used_today()`'s `where day = current_date` filter, with no cron job needed to zero anything out at midnight.

---

## Supporting functions (not tables, part of the same design)

- **`used_today(uuid)`** — read-only lookup, called *before* an evaluation runs.
- **`consume_quota(uuid)`** — the only writer, called *only after* a successful, scored evaluation.

Splitting these into read-then-write (rather than one atomic check-and-increment) is a deliberate trade — it guarantees a failed or `not_evaluable` evaluation never burns a user's daily allowance, at the cost of a small, accepted race window between two simultaneous requests.

---

## Cross-cutting design decision — Row-Level Security

Every table has RLS enabled, but only `profiles` has an actual policy (self-scope via `auth.uid()`). The four content/usage tables (`submissions`, `evaluations`, `feedback_outcomes`, `daily_usage`) have **no** browser-facing policy at all — every read/write to them must go through the service-role server client. This is the entire security model: the public anon key in the browser is structurally incapable of reading any user's content, because there's no policy that would ever let it. Verified via a cross-user smoke test at deploy time (Task 17).

Because content tables have no RLS, **application code is the only authorization layer** for anything that reads across submissions by ID. Two places do this and both are ownership-checked:
- `getSubmissionOwner` — verifies a caller-supplied `previousSubmissionId` actually belongs to the requesting user before `/api/evaluate` trusts it for lineage/comparison.
- `getLastSubmission` — always scoped by `user_id` in the query itself, so it can only ever return the caller's own most recent submission.

One caller-supplied ID is a documented, accepted exception: `/api/outcome`'s `evaluationId` has no ownership check (write-only, no data read back, blast radius is a wrong analytics count at friendly-tester scale).

---

## Post-schema additions (no DDL changes, new queries only)

Two features added after the original Task 2 migration read from these same tables/columns without altering the schema:

- **Ownership checks** (`getSubmissionOwner`) — reads `submissions.user_id`.
- **Cross-session "continue where you left off"** (`getLastSubmission`) — reads `submissions` (`id`, `type`, `intent`, `text`, `created_at`) and `evaluations` (`id`, `result_json`, `created_at`), both already present. Exposed via a new `GET /api/last-submission` route rather than a direct browser query, since content tables have no browser RLS policy.

## Requirements/UI-sync audit (2026-08-21) — findings and fixes

A two-agent audit checked (a) whether the schema satisfies every requirement the specs
impose, and (b) whether the schema and the UI are fully in sync. Five findings, all fixed:

1. **Dual-capture had no schema support at all (the significant one).** Fixed by adding
   `submissions.original_draft` (above) plus the corresponding capture UI (`SubmissionForm.tsx`
   Task 14), prompt wiring (`buildMessages`/`evaluate()`, Tasks 4/6), and two new golden-set
   cases (Task 6.5).
2. **`improved` (the north-star signal) was computed by `/api/evaluate` but silently discarded
   in the UI.** Fixed — `AppPage` now captures and displays it (Task 16).
3. **`profiles.role` was captured but never consumed anywhere.** Fixed — now read into
   `AppPage` state and used two ways: a starter-task hint on the purpose picker, and passed
   to the rubric prompt as context-only tailoring (Tasks 4/6/10/16).
4. **`intent` was nullable despite being a required input per the rubric spec.** Fixed —
   `not null` on the column (above), plus a matching client-side guard (Task 14) and
   server-side validation (Task 10).
5. **Cosmetic: feedback chips weren't grouped by layer** even though `CRITERIA[].layer`
   already existed. Fixed — `FeedbackView.tsx` now groups chips under "Is the work good?" /
   "Did you use AI well?" per the approved wireframe (Task 15).
