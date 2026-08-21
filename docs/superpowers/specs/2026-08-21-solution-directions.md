# PRD Section — Solution Directions Explored

_One-pager. Written 2026-08-21. Feeds the PRD's required "≥3 directions, why one was chosen" section._

## Problem (restated)

The employed, mid-career non-technical professional uses AI daily but was never taught it. They either quietly **under-use** it (unsure they're doing it right) or **over-trust** it (delegate without checking). Nothing checks their AI-assisted work against a standard of "good" for their role, so their confidence stays untested until a review — or a mistake — checks it for them.

Three genuinely different mechanisms could address this: **teach them content, improve their inputs, or judge their outputs.** Each is a different bet on where the failure actually lives.

## The three directions

| | **A. Curriculum-first** ("Duolingo/iro.ai for AI") | **B. Prompt-library / role-templates** | **C. Feedback-on-real-work rubric** (chosen) |
|---|---|---|---|
| **Mechanism** | Deliver bite-sized synthetic lessons + exercises + streaks, sequenced by role | Give better prompts/templates for the user's function; they paste and run them | User submits their *actual* AI-assisted work; a two-layer rubric (is the work good? did you use AI well?) grades it against their stated purpose and teaches from the gap |
| **What it fixes** | Missing vocabulary/technique | Weak inputs | Unverified judgment on outputs — the thing the problem statement actually names |
| **User value (2-day-build MVP)** | Medium — generic content ≠ "is *my* thing right," so it doesn't resolve the anxiety it targets | Low-Medium — better prompts don't tell the user if the *result* was good; over-trusters especially get no signal | High — directly answers "am I doing this right," works on real artifacts, and serves both personas more directly than A/B (A's judgment-testing exercises could partially help the under-user, but neither A nor B validates the user's actual artifact) |
| **Build effort (2 days)** | High — needs authored content + sequencing logic even for a thin slice; an empty curriculum has no value | Low — a static/lightly-parameterized template library is fast to ship | Medium — one rubric, one LLM call, one feedback render; no content authoring needed. (Scoped to the MVP core loop only — the guardrails and eval harness added afterward, see `2026-08-21-ai-work-rubric-design.md`, are real additional effort layered on top of this estimate.) |
| **Risk** | Crowded, low-trust category (FOMO→FOGS skepticism per research); doesn't validate real work even if built well | Deepens the AI-as-crutch pattern the research flags as the category's central danger; no differentiation from a prompt Google Doc | Depends on rubric quality and one LLM call getting it right — real failure modes include judge hallucination/inconsistency, prompt-injection, and parsing/latency issues; each is testable and mitigable (golden-set evals, injection defense), which is why this is rated contained rather than open-ended |
| **Value ÷ Effort** | Medium ÷ High → **poor** | Low-Medium ÷ Low → **poor** (cheap, but cheap because it doesn't solve the problem) | High ÷ Medium → **best** |

_(A fourth, tangential direction — an employer-side AI-usage audit/certification — was considered and dropped immediately: enterprise sales cycles don't fit a 5-day deadline, and a buyer-side layer breaks the psychological safety the whole product depends on. Not scored above because it fails on timeline before any value/effort trade-off applies.)_

## Why the rejected directions lost (one sentence each)

- **Curriculum-first loses** because even its strongest form — judgment-testing scenario exercises, not just vocabulary drills — still grades a *synthetic proxy*: a user can ace every exercise and still not know if the specific email/analysis in front of them is good.
- **Prompt-library loses** because even its strongest form — a self-critique template ("ask AI to check its own output") — fails on *self-grading bias*: the same model that produced the output is grading it, with no independent judge and no persona-specific criteria. It leaves both personas exactly as unverified as before, and for the over-truster it's actively counterproductive (better inputs, same blind trust in outputs).

## Chosen approach (one paragraph)

The product is a **self-serve feedback tool**: a user submits a piece of real AI-assisted work (or their articulation of a concept), declares its purpose, and receives bite-sized teaching feedback scored against a six-criterion, two-layer rubric — Layer 1 asks "is the work good?" (accuracy, fitness, clarity), Layer 2 asks "did you use AI well?" (verified, owned, understood). It beats curriculum-first because it validates the artifact the user actually has, not a synthetic proxy for it, and beats the prompt-library because it closes the loop on the *output*, which is where both the under-user's doubt and the over-truster's blind spot actually live. It is also the direction with the best value-to-effort ratio inside a 2-day build: one rubric and one well-designed LLM call outperform an authored curriculum or a template catalog. (Aside, not part of this decision's scoring: it's also the hardest of the three for a curriculum-first incumbent like iro.ai to copy, since their engine is built around pre-authored content, not real-work evaluation — but that's a competitive-moat consideration, not a reason this direction is right for a graded case-study MVP, and shouldn't be read as tipping the Value÷Effort verdict.)

## Self-check

1. **Genuinely divergent, or one idea in three costumes?** Divergent. Each direction changes a different variable: A changes what content the user *consumes*, B changes what the user *inputs* to AI, C changes what happens to the user's *output*. They fail for different reasons (vocabulary vs. crutch-deepening vs. — the reason C succeeds — closing the actual loop), not variations of the same mechanic.
2. **Can the rejected directions' losses be stated in one sentence each?** Yes — see "Why the rejected directions lost" above.
