# Design Spec — Rubric for "Good AI-Assisted Written Work"

**Date:** 2026-08-21
**Status:** Draft for review
**Related:** `Handoff.md`, `Opportunity Prioritisation.md`, primary & secondary research docs
**Case deadline:** 26 Aug 2026 (working MVP + 40–50 real users + full funnel)

---

## 1. Purpose

Define the **standard of "good"** that the product checks user work against. This
rubric is the core evaluative engine behind the product's north-star feature:
**feedback on the user's own AI-assisted work.**

The finalized problem statement (see `Handoff.md`) is that mid-career, non-technical
professionals already use AI daily but were never taught it — they either *under-use*
it (unsure they're doing it right) or *over-trust* it (delegate without checking) —
and **nothing checks their AI-assisted work against a standard of what "good" looks
like.** This rubric is that standard.

### What the rubric is (and is not)

- It is a **feedback lens + teaching standard**, not a scoring engine. Scores/levels
  exist but are subordinate to specific, actionable feedback and to showing the user
  what "good" looks like so they internalize it.
- It is **not** a grader that hands back a number. A grader feels like homework; this
  is an editor-that-teaches.

---

## 2. Core design decisions (locked)

1. **Two layers, declared-purpose-driven.** A base layer on the artifact ("is the work
   good?") plus a layer on the AI usage ("did you use AI well?"). The AI-usage layer
   maps directly to the two personas (over-trust / under-use).
2. **One rubric, not N.** The artifact layer flexes to a user-declared *purpose* rather
   than hardcoding a separate rubric per job function or artifact type. This is what
   keeps a single "standard of good" buildable by the deadline.
3. **Object judged = a piece of text.** Every submission reduces to writing — the work
   product itself, a written explanation of an implementation's logic, or a free-text
   articulation of understanding. The tool always grades text.
4. **Feedback + teaching, not scoring** (see §1).
5. **Entry point = the user's real work, not a course.** Onboarding is "bring one real
   thing you made with AI," not "enrol in a curriculum" (see §6).

---

## 3. Inputs — the "declared purpose"

The user provides three things. The picker is framed by **the question the user wants
answered**, not by an artifact noun — because a work product and an implementation-logic
doc can point to the same underlying thing, and only the user's *intent* disambiguates
them.

| The user picks this if they're asking… | Type | What they paste (guided at every step) |
|---|---|---|
| **"Is this ready to send?"** | Work product | The finished email / summary / deck text / doc, exactly as they'd send it. |
| **"Is the logic behind what I built sound?"** | Implementation logic | A written explanation of how their tool/automation works. If they don't have one, a **"Generate it"** button gives a copy-paste prompt: *"Explain the logic of what we built, step by step, as if to a smart colleague who'll maintain it."* They run it, paste the result, correct anything wrong. |
| **"Do I actually understand this?"** | Concept articulation | In their own words, what they think the concept is and how it works. No pasting the AI's explanation — that defeats the check. |

Plus a **one-line intent** ("what is this + who/what is it for") and the **text itself**.

**Guidance requirement:** copy must be unambiguous and help must appear at every step —
the picker explains each choice by its question, the paste box carries helper text, and
implementation-logic gets the generator button. The user never has to guess what to
submit or which type they are.

---

## 4. The rubric — two layers, six criteria

Kept deliberately to **3 + 3**. This is a feedback/teaching tool, not a heavy grader;
more criteria would raise cognitive load without improving the core loop.

### Layer 1 — "Is the work good?" (Artifact Quality, judged against the declared purpose)

**1.1 Accuracy & Soundness — *Is it correct?***
- Flexes: Work product → facts/figures hold and are consistent · Implementation logic →
  steps are feasible and correctly reasoned, no magic steps · Concept → understanding
  matches reality, no misconceptions.
- Signals: internal contradictions, hand-wavy claims, confident-but-invented specifics.
- Research anchor: *"validating that the AI solved the right problem and did not invent
  one"; "output that looks right, cannot be trusted."*

**1.2 Fitness for Purpose — *Does it do the declared job, for its audience?***
- Flexes: Work product → right tone/length/detail for that reader, answers the real ask ·
  Implementation logic → solves the actual problem at the right level of abstraction ·
  Concept → matches the depth the concept actually needs.
- Signals: wrong register, over/under-scoped, answers a different question than declared.
- Research anchor: *"the scarce skill moves to framing the right problem"*; confidence is
  stakes-dependent.

**1.3 Clarity & Completeness — *Clear, structured, nothing critical missing.***
- Flexes: Work product → understood in one pass, no filler · Implementation logic → a
  colleague could follow and maintain it, no gaps in the chain · Concept → coherent and
  covers the essential parts.
- Signals: buried lede, missing steps, filler padding.

### Layer 2 — "Did you use AI well?" (AI Usage & Ownership — over-trust / under-use detector)

This is the strongest-justified layer. The single strongest product justification in the
primary research: *"The gap we close is judgment and validation, not access — the leap
from 'I used AI' to 'I can confidently use AI.'"*

**2.1 Verified, not blindly trusted — *the over-trust detector.***
- Checks: did the user check the AI's claims, or accept them? Flexes: Work product → facts
  verified · Implementation logic → they know why each step is there and what breaks ·
  Concept → they tested their understanding, didn't just restate AI.
- Weak-signal self-report (1 tap): *"Did you check these claims yourself, or take them
  from AI?"*
- Research anchor: *"no way to check if that is true… half were useless because of
  hallucinations."*

**2.2 Owned & in your voice — *engagement / not-a-blind-paste.***
- Checks: is this the user's thinking and context, or raw AI output pasted? Flexes: Work
  product → sounds like them, fits their context · Implementation logic → reflects their
  real build choices · Concept → their words, their analogies.
- Signals: generic AI cadence, zero organization-specific detail, decisions AI couldn't
  have known are absent.
- Research anchor: the over-trust pattern — *"delegating work without checking it."*

**2.3 Understood & defensible — *the under-use / AI-as-crutch detector.***
- Checks: could the user explain and defend this if challenged — or did they lean on AI to
  skip understanding? Flexes: Work product → they can stand behind every claim ·
  Implementation logic → they understand why it works and what can break · Concept →
  genuine comprehension (the whole point).
- Weak-signal self-report (1 tap): *"In one line — why does this work?"*
- Research anchor: *"AI is replacing learning, not enabling it… I end up using AI without
  understanding much myself"; "comprehension checks to prevent AI-as-crutch."*

### How the two personas fall out

- The **over-truster** fails 2.1 + 2.3 (accepted output blindly, can't defend it).
- The **under-user** may scrape through Layer 1, but 2.2 / 2.3 expose shallow, generic
  engagement — and either way the six criteria finally give them the signal the research
  says nobody has: *"am I doing this right?"*

### Honesty constraint on Layer 2

Layer 2 is **inferred from signals in the text** — you cannot fully see verification from a
finished document. Therefore Layer 2 feedback **hedges by design** ("this reads as
unverified because…") and, where the text signal is weak, the tool may ask **1–2
single-tap self-report questions** rather than assert. This keeps the tool honest.

---

## 5. Output — what the user receives (and how it stays bite-sized)

Users lose interest fast (research: optimal micro-session 5–10 min; "cramming" is a top
reason professionals fail to retain). So the *evaluation* runs all six criteria
underneath, but the *experience* is one glance + one fix.

**Per-criterion, the engine produces four parts:**
1. A **level** — *Emerging → Solid → Strong* (three teachable levels, not a number).
2. **Evidence** — the specific thing in *their* text that earned the level ("this reads
   like…").
3. **One next step** — the single most useful fix.
4. **What "good" looks like** — the standard for that criterion, so they learn it.

**The flow:**
1. **First view (~20 sec):** six tiny level chips (a glance at where they stand) + **one**
   headline — *"Fix this first:"* — the single highest-impact next step, 1–2 sentences.
2. **Progressive disclosure:** tap any chip to expand its evidence + "what good looks like"
   card. Optional, never forced.
3. **Every feedback item ≤ 2 sentences.** One "what good looks like" micro-card at a time,
   tied to the fix in front of them.
4. **Layer 2 self-report:** at most 1–2 single-tap questions, only when text signal is weak.

**Side-questions rule (cross-cutting):** a persistent "ask anything" affordance runs
alongside the loop. It answers *any* question the user has — however many, however
tangential — clearly and unambiguously, then **always routes back** to the step they were
on ("…back to your email — the one thing to fix is still X"). It behaves like a good
tutor: never refuses a tangent, never lets the tangent become the destination. It stays
subordinate to finishing the loop so it cannot become a rabbit hole that breaks the
bite-sized promise.

---

## 6. Entry point & personalization

**Entry point = the submission itself, not a course.** First run is not "choose a path,"
it is *"Bring one thing you made with AI this week — an email, a doc, or explain something
you're learning."* The declared-purpose picker (§3) **is** the onboarding.

Rationale (from research):
- The dominant real behavior is picking up AI directly on real work tasks, not enrolling
  in courses (40% of desk workers have invested <5 hrs in training; ~70% are self-taught).
  A course-first entry point fights the grain.
- *"AI-assisted usage is the universal entry point; AI-native is the advanced
  destination."* The three declared-purpose types ladder along exactly this arc
  (work product → implementation logic → build cases).

**Role = one-time personalization, not a curriculum fork.** Ask role once; use it only to
(a) suggest a relevant starter task ("as a marketer, try your last campaign email") and
(b) tailor the "what good looks like" examples. Do **not** build per-role curricula — the
rubric is already function-agnostic-with-declared-purpose, and the research says *"define
professional as a constraint set, not a job title."* This protects the deadline.

**"Lessons" are generated from gaps, not authored as a catalog.** The teaching micro-card
is produced from whichever criterion scored lowest — bite-sized, tied to the current fix.
No fixed lesson catalog to build.

---

## 7. Positioning & scope boundaries (what v1 deliberately does not solve)

**Deliberately out of scope for v1:**
- "What should I learn?" / role-based learning roadmap.
- An authored curriculum or lesson catalog.
- Deeper artifact types graded on their own terms (spreadsheets/dashboards, code, data
  analysis) — these arrive as text-explanations under "implementation logic," not as
  native graded artifacts. Native support is a v2 segmentation decision.
- Any employer / L&D buyer layer (breaks the private psychological-safety loop; see
  `Handoff.md`).

**Why deferring these is a moat, not a gap.** The tool occupies the **adjacent, unserved
slot** that existing learning tools do not fill: *validation and judgment* ("am I doing
this right?"). It therefore does not inherit their problems (overwhelm, low-trust
roadmaps, FOMO→FOGS skepticism) — it sidesteps them. Two supporting points:
- A lightweight **emergent roadmap comes for free**: the user's weakest criterion this
  week is their next lesson; the sequence of "fix this first" across submissions is a
  personalized micro-roadmap with no curriculum to author.
- **Retention substrate is stronger than a course's.** Real AI-assisted work is produced
  constantly, so every task is an organic reason to return — versus tools that must
  manufacture return triggers (streaks on synthetic exercises).

**Competitive contrast (iro.ai).** iro is curriculum-first (29 paths, 477 lessons,
3,000+ synthetic exercises, streaks, an AI coach that critiques *its own* practice
prompts). This product is **work-first**: feedback on the user's *real* output, with the
curriculum emerging from their gaps. iro cannot easily copy this because its engine is
pre-authored content; feedback-on-real-work is structurally harder and is this product's
north star, so it is the right thing to be 10x better at.

### How the tool handles "stuck"

Users who are mid-task ("I'm building something with AI and don't know what to do next")
are a common case. The tool helps with **one kind of stuck and deliberately refuses the
other** — because blurring the two turns a differentiated feedback tool back into a
generic AI copilot.

- **Judgment-stuck — *in scope.*** "I have something, but I don't know if it's right / why
  it's not working / what to fix." This is the normal loop run on **partial** work: the
  user submits their work-in-progress (the "implementation logic" type accepts this) and
  the feedback *is* the unblock — 1.1/1.3 catches the broken or missing step, 2.3 surfaces
  where their understanding breaks (usually the real reason they're stuck), and the "Fix
  this first" output is a concrete next step. This is exactly the stuck-ness the research
  describes: *"the thing works but I don't understand why it works, what can break, or
  whether I can trust it."* A judgment gap — which is the product.

- **Execution-stuck — *out of scope.*** "I don't know the next technical move — how do I
  connect this API? Write it for me." This is the AI copilot's job (ChatGPT, Cursor) — the
  tool the user is *already* using. Taking it on would (a) compete head-on with that AI,
  (b) recreate the **AI-as-crutch** risk the research warns is the category's central
  danger, and (c) exceed the timeline. The side-questions channel (§5) may answer a small
  "how do I…" tangent unambiguously and route back, but the tool never *becomes* the
  builder.

**The line:** the tool tells the user what is wrong and what to decide or fix next; it
does **not** write the next chunk for them. It sharpens judgment about what they have; it
does not outsource the doing. No separate "help me build" mode ships in v1 — the
evaluation loop already produces forward direction, and a copilot mode would cost the
product its differentiation.

---

## 8. Governing design constraint

**The feedback must improve the work in the user's hand, not just grade it.** Catch the
error before it ships; make the email land better; then submitting is not a detour off
the user's real task — it is on the critical path of the task they already had. This is
what prevents the tool from feeling like homework, which is the primary retention risk of
a feedback-only product. Every output decision (§5) is subordinate to this constraint.

---

## 9. Open items (carried, not blocking this rubric)

- The exact prompt/eval design that makes an LLM apply these six criteria reliably against
  a one-line declared intent (implementation-plan concern).
- Instrumentation: which events map to the funnel and to a north-star metric (research
  suggests a competency/output signal — e.g., real artifacts improved — over lessons
  watched).
- Pricing mechanics (free vs. freemium unlock at a high-stakes moment).
- Acquisition channel/hook (opportunity 6 — specific personal trigger over generic
  messaging).

---

## 10. Evidence base

- Primary research: role interviews (Ops, Finance, HR, Sales, PM/BA), survey (n=25),
  consolidated problem-space observations. Key anchors: P8 "Access Is Not Capability,"
  P9 "Judgment & Quality," "AI is replacing learning, not enabling it," "No one has a
  rubric for how AI-literate should I be."
- Secondary research: market/course landscape, persona spectrum, microlearning and
  retention data, competitor scan.
- Competitor: iro.ai (App Store; tryiro.com), reviewed 2026-08-21.
