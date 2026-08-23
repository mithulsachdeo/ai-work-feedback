# Prompt — hand this to another LLM to generate the user flow

> ⚠️ **Superseded (2026-08-24) — historical snapshot.** The magic-link / "Email me a link" / "Check your email" flow described here no longer exists; auth is now email+password (no email sent), plus a sign-out control. Current truth: `docs/product-overview.md`. Body below is the original 2026-08-21 design, kept as a record.

_Copy everything below the line into a fresh LLM conversation. It's self-contained — no other
context needed._

---

You are a senior product designer. Produce a **complete user-flow flowchart** for the product
described below. Output a single **Mermaid flowchart** (`flowchart TD`), using rectangles for
screens/states, diamonds for decision points, and labeled arrows for the action/event that
triggers each transition. After the diagram, add a short legend explaining any abbreviations
you used. Do not invent screens, features, or branches beyond what's described below — if
something is genuinely ambiguous, make the smallest reasonable assumption and note it in one
line under the diagram, rather than expanding scope.

## Product summary

A self-serve web tool for employed, mid-career, non-technical professionals who already use
AI daily but were never taught it. Users either quietly under-use AI (unsure they're doing it
right) or over-trust it (delegate without checking). The product's job: a signed-in user
submits a piece of real AI-assisted work (or their own articulation of a concept), and
receives bite-sized, teaching feedback scored against a six-criterion rubric — telling them
whether the work is good AND whether they used AI well. It is a feedback/judgment tool, not a
course and not a copilot — it never writes work for the user, only evaluates what they bring.

## Full screen / state inventory

1. **Landing page** — value proposition copy + a single email input ("Email me a link") for
   magic-link sign-in. No password, no Google/social sign-in (deliberately not built).
2. **"Check your email" state** — shown immediately after requesting a magic link.
3. **Auth callback** — the link in the email lands here, then redirects into the app.
4. **Role + consent screen** — shown ONLY on a user's very first visit (never again once
   completed). A dropdown of roles (Marketing, Ops, HR, Finance, Sales, Product/BA, Founder,
   Other) + a one-line consent disclosure text + a "Start" button.
5. **Purpose picker** — the main app's entry screen after onboarding. Three large tappable
   options, each phrased as a question the user is asking about their own work:
   - "Is this ready to send?" (Work product — an email, summary, deck text, or doc)
   - "Is the logic behind what I built sound?" (Implementation logic — explaining how an
     AI-built tool/automation works)
   - "Do I actually understand this?" (Concept articulation — the user's own understanding
     of something, in their own words)
6. **Submission form** — varies slightly by the type picked in step 5:
   - Always: a one-line "intent" field ("What is this, and who/what is it for?") and a main
     paste box for the work itself.
   - If "Implementation logic" was picked: an additional "Generate it" helper (a copy-paste
     AI prompt the user can run elsewhere, then paste the result back) AND a second paste box
     for "what you changed/corrected" — i.e. this type captures BOTH the AI's original draft
     and the user's corrected version, not just one text block.
   - Always present on this screen: a "don't store this submission" checkbox (privacy
     control), a small confidentiality reminder line, a permanent low-key line about taking
     extra care on high-stakes work, and — only if it's currently late at night on the user's
     device — an additional low-key "working late, no rush" line.
   - A "Check it" submit button (disabled until enough text is entered).
7. **Checking / loading state** — brief, while the evaluation runs.
8. **"Can't check this" state** — an alternate outcome of step 7: shown when the submission
   is gibberish, an empty template, or actually a request for the AI to DO a task (e.g. "write
   me an email") rather than real work to evaluate. Shows a short reason and invites the user
   to submit something else. This is a dead end that routes back to step 5 or step 6.
9. **Feedback view** — the main outcome of a successful check. Shows:
   - Six small "level chips" at a glance (each one Emerging / Solid / Strong), split
     conceptually into two groups of three: "is the work good" (accuracy, fitness, clarity)
     and "did you use AI well" (verified, owned, understood).
   - One headline: "Fix this first" — the single most important thing to improve.
   - Tapping any chip expands a detail card for that one criterion (what was seen in their
     text, the specific fix, and what "good" looks like) — this is optional/progressive, nothing
     is forced open.
   - A persistent small "ask anything" question box at the bottom — the user can ask any
     question, gets a direct answer, and is always steered back to their current step
     afterward (it never becomes a separate destination).
10. **Post-feedback choice** — two buttons after viewing feedback:
    - **"Revise & re-check this"** — takes the user back to the submission form (step 6),
      pre-filled with their previous text/intent, explicitly linked to the original submission
      so the system can later tell if they improved.
    - **"Check something new"** — takes the user back to the purpose picker (step 5), blank,
      unlinked to anything previous.
11. **Quota banner** — a small persistent status shown throughout the app ("X free checks left
    today"), visible from step 5 onward.
12. **Quota-exhausted state** — triggered the moment a free (non-BYO-key) user tries to submit
    a check with zero remaining for the day. Blocks the submission and opens the BYO-key modal
    (step 13) as the resolution path. Resets automatically the next day.
13. **BYO-key modal** — an optional overlay a user can open anytime (from the quota banner) or
    that opens automatically on quota exhaustion. Lets the user paste their own API key from
    one of three providers (Anthropic, OpenAI, or paid Gemini) to unlock unlimited checks and
    somewhat sharper feedback for the rest of that browser session only (never saved). Two exits:
    "Use my key" (unlocks and returns to what they were doing) or "Not now" (dismiss, no change).

## Rules governing the flow (make sure these show up as explicit branches, not just happy path)

- Steps 1-4 happen once ever per user (except re-login later, which skips straight to step 5
  if role/consent is already done).
- From step 9 (feedback), the user can loop indefinitely between "revise & re-check" and
  "check something new" — there is no natural end state, only exits (closing the app).
- The quota check can interrupt the flow at the exact moment of submitting from step 6 — show
  this as a branch off of "Check it," not as a separate isolated screen.
- A user with an active BYO key bypasses the quota entirely — show this as a flow-level
  condition (a swimlane note or a branch label), not a full separate diagram.
- The "ask anything" box in step 9 never leads to a new screen — it answers in place and
  always returns the user to the same feedback view they were on.

## Output format requirements

- One Mermaid `flowchart TD` diagram covering the entire flow end-to-end.
- Use diamond nodes only for genuine decision points (auth check, not_evaluable vs. scored,
  quota remaining vs. exhausted, revise vs. new, BYO-key add vs. decline).
- Label every arrow with the user action or system event that causes that transition (e.g.
  "clicks magic link," "submits form," "quota = 0," "adds valid key").
- Keep node labels short (screen name only); put any extra detail in the legend below the
  diagram, not inside the node.
