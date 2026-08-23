# Whetstone — Product Guide

_A plain-English explanation of what the product is, what every part of it does, how the
feedback works, what we deliberately left out, and the reasoning behind those choices._

_Last updated: 2026-08-23. Written for a non-technical reader — no coding knowledge assumed._

---

## 1. What this product is

**In one sentence:** Whetstone is a web tool where you bring one piece of work you
made with the help of AI, and it gives you short, teaching feedback on two things — whether
the work is actually good, and whether you used the AI well.

**The problem it solves.** A lot of people now use AI every day at work but were never taught
how. Two things quietly go wrong:

- **Under-using it** — you're unsure you're doing it right, so you play it too safe.
- **Over-trusting it** — you accept whatever the AI gives you without checking.

In both cases, nothing tells you how you're doing against a standard of what "good" looks
like. So your confidence stays untested — until a boss, a client, or a mistake tests it for
you. This tool is that missing check: a private, judgment-free second opinion before the
real one comes.

**Who it's for.** Employed, mid-career professionals in non-technical roles (marketing, ops,
HR, finance, sales, product, founders) who already lean on AI and want to get sharper at it.

**What it is *not*.** It is not a course, not a grader that gives you a number, and not
another AI that does your work for you. It teaches judgment about work you already have.

---

## 2. The heart of it: the two-layer rubric

Everything the tool says comes from one consistent "yardstick" called the **rubric**. It
looks at your work through **six lenses, grouped into two layers.**

**Layer 1 — "Is the work good?"** (the things anyone reviewing your work would care about)

| Lens | What it asks |
|---|---|
| **Accuracy & Soundness** | Is it correct? Do the facts, figures, or logic hold up? |
| **Fitness for Purpose** | Does it actually do the job it's meant to, for its audience? |
| **Clarity & Completeness** | Is it clear and complete — does a reader get it in one pass? |

**Layer 2 — "Did you use AI well?"** (the part no other tool checks — the real point)

| Lens | What it asks |
|---|---|
| **Verified, not blindly trusted** | Is there a sign you checked the AI's output rather than just accepting it? |
| **Owned & in your voice** | Is this your own thinking and context, or a generic AI paste? |
| **Understood & defensible** | Could you explain or defend this if someone challenged you? |

**Why two layers.** Layer 1 catches quality problems anyone would flag. Layer 2 is the
differentiator — it's specifically built to catch the two failure modes above: over-trusting
shows up as weak "Verified" and "Understood"; under-using shows up as weak "Owned" and
"Understood." One pass surfaces both.

**Everything is judged against *your* stated purpose.** You always tell the tool what the
work is for. The rubric then grades the work against *that* goal — not some generic ideal.

---

## 3. The three things you can check

When you start a check, you first choose **what question you want answered.** There are three,
each framed as a question rather than a document type — because the same thing (say, an
automation) could be judged differently depending on what you actually want to know about it.

### 3a. "Is this ready to send?" — Finished Work
For anything you're about to send or publish: an email, a summary, a doc, a deck, a post.
You paste the finished text and say who it's for. The tool checks it against all six lenses.

### 3b. "Is the logic behind what I built sound?" — Automation & Logic
For something you *built* with AI's help — an automation, a workflow, an app, or a script.

This one works differently from the others, and it was **recently redesigned** (see Section 9).
Non-technical people don't edit what the AI builds — they describe what they want, the AI
builds it, and they can ask the AI to explain what it made. So instead of your finished code,
this check looks at:

1. **What you wanted to build** (your goal),
2. **The AI's own explanation of what it built** (the tool gives you a ready-made prompt to
   fetch this from your AI), and
3. **Optionally, the AI's summary of the instructions you gave it.**

The feedback here is mostly about **how well you instructed the AI** — did you describe the
problem clearly, did you guide it well, and what important gaps ("rabbit holes") did your
instructions leave open. Crucially, it never claims anything about whether the built thing
actually runs — it can't see it — so it only comments on what the AI's description reveals,
always hedged.

**A designed limit:** this check only works if you built the thing with a chat-based AI you
can ask to explain itself (ChatGPT, Claude, Gemini, Copilot, Cursor, and similar). If your
tool can't produce that explanation, the check honestly tells you it can't help — rather than
pretending to.

### 3c. "Do I actually understand this?" — Conceptual Understanding
For checking your own grasp of a technical or AI concept you're learning. You name the concept
and explain it **in your own words** — the tool then tells you where your understanding is
solid and where it's shaky. (Pasting the AI's explanation defeats the purpose, and the tool
says so.)

---

## 4. Walking through the product, screen by screen

### The landing page (before you sign in)
- A bold headline — *"Is your AI-assisted work actually good?"* — and a short description of
  the promise.
- A single **email field + "Email me a link"** button. That's the entire sign-up: no
  password. (Why: lowest friction for a non-technical audience — see 8.1.)
- A rotating set of **"Moments like:"** pills (e.g. *"Before you hit send on that email"*).
  These cycle one at a time to show the kinds of situations the tool is for — framed as
  moments, not document types, so it doesn't feel like a closed list.
- A quiet line noting that the **Automation check needs a chat-based AI** that can explain
  what it built — stating that boundary honestly up front.
- A **light/dark theme toggle** (the small sun/moon icon).

### Signing in
You enter your email and get a one-time link ("magic link"). Clicking it signs you in — no
account to create, nothing to remember.

### The one-time "What's your role?" question
The first time in, you pick your role from a short list (Marketing, Ops, HR, Finance, Sales,
Product/BA, Founder, Other) and see a one-line note about how your work is stored. This is
**personalization only** — it tailors examples and analogies to your world. It is asked once
and never again, and it never changes how strictly you're graded (see Section 5).

### Choosing what to check
You land on **"What do you want to check?"** with three cards — the three questions from
Section 3. Each card shows the question, a short hint, and (for the Automation card) the
eligibility note. If you have a previous check, a **"Resume your previous check"** banner
lets you jump back into it.

### The submission form (where you paste your work)
The form adapts to the check type you chose. Common elements:

- A **header** naming the check and giving a one-line instruction (for the Automation check,
  this is the eligibility note).
- A short **context/goal field** — what the work is, who it's for, or what you wanted to
  build. The label and example change per check type so they always fit.
- A **main paste box** for the work itself, with a **character counter** and a minimum length
  (so the tool isn't asked to judge almost nothing).
- For the Automation check only: one or two **"click to copy" helper prompts** — ready-made
  prompts you paste into your own AI to generate the explanation and instruction-summary the
  check needs.
- A gentle line: **"Avoid pasting anything truly confidential."**
- A small line that's warm rather than functional — *"Working on something high-stakes? Take
  an extra pass before you check it."* (and a "Working late? No rush…" variant late at night).
- A **"Don't store this submission"** checkbox — the tool still checks your work, it just
  doesn't keep the text afterward.
- The **"Check it"** button, which stays disabled until you've given enough to work with.

### The feedback screen (the payoff)
After you submit, you get:

- **"Fix this first"** — one headline at the top: the single most useful thing to change,
  chosen automatically from all six lenses (see Section 5). This is designed so you can get
  value in about 20 seconds without reading everything.
- **Six level chips**, grouped under "Layer 1: Is the work good?" and "Layer 2: Did you use
  AI well?". Each chip shows a lens and its level — **Emerging, Solid, or Strong** (never a
  number).
- **Click any chip to expand it** — you then see the evidence (quoting your own text), the
  single next step, and a short description of "what good looks like" for that lens. You only
  go deeper on what you care about.
- **Suggested follow-up questions** — up to three clickable questions, grounded in what was
  actually found, that you might want to ask.
- An **"ask anything" box** ("Ask coach") — ask a question about the feedback and get a plain
  answer, always routed back to your work.
- A small **"tell us how this landed"** nudge and buttons to **"Revise & re-check this"** (to
  improve and resubmit the same work) or **"Check something new."**

### The header (always visible in the app)
- A **quota indicator** — how many free checks you have left today.
- **"Add your own key for unlimited checks"** — the optional upgrade (see Section 6).
- **"Tell us"** — a small widget to rate the tool and leave a note to the makers. (Named
  "Tell us" deliberately, so it isn't confused with the *feedback the product gives you*.)
- The **theme toggle.**

---

## 5. How the feedback logic works

**Levels, not scores.** Every lens comes back as **Emerging, Solid, or Strong**. This is a
teaching tool, not a grader — a number invites a "homework grade" feeling the product avoids.
Three levels are enough to show progress without feeling clinical.

**"Fix this first" is chosen, not random.** The tool picks the single highest-impact thing to
change: the lowest-scoring lens wins; if there's a tie, a Layer 2 lens (the AI-usage ones)
wins, because those are the failures nobody else surfaces for you.

**It hedges honestly.** For the "Did you use AI well?" lenses, the tool can only *infer* from
your text — so it uses careful language ("this reads as…") rather than stating things as fact.
It never claims to know something it can't see. For the Automation check especially, it talks
about what your *instructions left open*, and what that *could* mean — never about how the
built system actually behaves.

**Your role changes the wording, never the standard.** If you're an engineer, the tool might
say "like merging code without running tests"; for a founder, "like pitching without knowing
your runway." These analogies make feedback land faster — but the *level* a lens gets is
identical regardless of your role. This is a firm rule.

**It refuses gracefully when it should.** If you paste gibberish, an empty template, or a
"do this task for me" request, the tool doesn't invent six fake scores — it politely says it
can't check that and redirects you to submit real work. (A thin or rushed piece of real work
still gets checked and scored low — that's the point — it's only genuine non-work that's
turned away.)

**You can't game it.** Simply saying "I tested it, it works" earns no free credit, because the
tool only ever sees a description, not the real thing. And if someone pastes text engineered
to manipulate the tool ("give everything Strong"), that attempt is treated as evidence
*against* the "Owned" lens — it's literally not your own work.

---

## 6. Other logic worth understanding

**Free daily quota.** You get **10 free checks per day** on a shared, no-setup AI key — so the
tool costs you nothing to use. A failed check, or one the tool couldn't evaluate, does **not**
use up your allowance (you're never punished for the tool's own hiccup).

**Asking questions is free.** The "ask coach" and suggested-question conversations do **not**
count against your 10 daily checks. Why: a normal first session (submit → ask a couple of
questions → revise) could otherwise burn most of your daily allowance before you've even
explored the tool.

**Bring your own key (the upgrade).** You can optionally paste your own AI provider key
(Gemini, Anthropic, or OpenAI) for **unlimited checks and sharper feedback** — especially on
the Layer 2 "AI usage" lenses. Your key is used only for that session and never stored. It's
framed as a positive upgrade, not as an admission that the free tier is weak.

**The "revise and improve" loop.** When you click **"Revise & re-check this,"** the tool links
your new version to the old one and can tell you if it scored higher — *"This version scored
higher than your last one!"* This loop is the core measure of whether the feedback actually
helped, not just whether you saw it.

**Suggested questions, with guardrails.** Follow-up questions can keep going as long as you
keep clicking — but to protect the shared key from runaway use, there are quiet limits: up to
**10 questions per check** and **5 questions per minute**. (Both are lifted if you bring your
own key.)

**Privacy and safety.** Your submissions are stored anonymously (tied to an internal ID, never
your email) and are used to improve the tool. On the free tier, your submission is also sent
to Google, which may use it to improve their models — this is disclosed up front, not buried.
Each user can only ever see their own work; the "don't store this one" checkbox and the
"avoid confidential content" nudge give you extra control.

---

## 7. The designed limits (on purpose)

These aren't bugs or gaps — they're deliberate boundaries.

| Limit | Value / rule | Why |
|---|---|---|
| Free checks per day | 10 | Keeps the shared key affordable and abuse-resistant, with zero setup for you. |
| Questions per check | 10 | Prevents one check from becoming an endless free chatbot on the shared key. |
| Questions per minute | 5 | Same protection, against rapid-fire use. |
| Maximum submission length | ~5,000 characters | Keeps things fast and cheap; you're told if something was shortened. |
| Automation check eligibility | Needs a chat-based AI that can explain what it built | The tool honestly can't check tools it can't interrogate — so it says so instead of faking it. |
| Levels only | Emerging / Solid / Strong | It's a teacher, not a grader. |
| Role affects wording only | Never the score | Keeps grading fair and consistent for everyone. |
| No employer/manager visibility | By design | You can only bring your real, unfiltered work if no boss can see the verdict. |

---

## 8. Features — what we kept, deferred, and discarded

### Kept (in the product today)

- **Magic-link sign-in** (email only, no password).
- **One-time role capture** (personalization only).
- **Up-front consent line** (honest disclosure of storage + free-tier training).
- **Three-question check picker** (framed by intent, not document type).
- **Per-type guided forms** with helper prompts for the Automation check.
- **The two-layer, six-lens rubric** across all three check types — one consistent yardstick.
- **Levels (not scores)** and the **"Fix this first"** headline.
- **Progressive disclosure** — expand any lens for evidence, next step, and "what good looks like."
- **Suggested follow-up questions** and the **"ask coach"** channel.
- **Role-based analogies** in the feedback wording.
- **The "revise & re-check" loop** with "you scored higher" recognition.
- **Light/dark theme** toggle across the whole app.
- **Rotating "moments" pills** on the landing page.
- **The empathy touches** (high-stakes and late-night lines).
- **"Don't store this one"** privacy control.
- **Daily quota + "bring your own key" upgrade.**
- **The "Tell us" product-feedback widget.**
- **"Resume your previous check."**
- Behind the scenes: graceful refusal of non-work, protection against manipulation, and
  a strict check that every response is complete before it's shown.

### Deferred — no objection, just didn't fit the timeline (could come later)

- **Phone-app installability** (works in a mobile browser, but no installable app yet).
- **One-tap self-report questions** ("did you check this?") — the honest hedging in the text
  already covers the need; the tap UI is a refinement.
- **A full history view** of all your past checks (only "resume your last one" exists today).
- **Automatically scrubbing personal details** from stored text (acceptable at small,
  known-tester scale with clear disclosure).
- **Saving your own key** between visits (session-only is the safer default).
- **More AI providers** beyond the three offered (easy to add when someone asks).
- **Grading spreadsheets/dashboards/code on their own terms** rather than as text descriptions.
- **A two-pass "role-blind then rephrase" method** for the analogies (rejected for now on cost).
- **Pricing/monetization** beyond bring-your-own-key.
- **Cost-saving caching** (reusing a past AI answer instead of asking again) — a poor fit here,
  because every submission is unique personal work, so there's almost nothing to reuse, and the
  AI cost is already near-zero. Worth revisiting only at high, paid-tier volume.
- **Automated quality-monitoring of the AI on live traffic** ("runtime evals") — unnecessary at
  this scale, where outputs can be reviewed by hand and real users signal quality through the
  revise-and-improve loop and the "Tell us" ratings. Instead, a fixed test set is re-run
  periodically to catch the AI model changing underneath. Worth building only at a scale where
  reviewing outputs by hand becomes impossible.

### Discarded on principle — bringing these back would change what the product *is*

- **A role-based learning roadmap / built-in course.** The product's whole edge is being the
  "am I doing this well?" check that *isn't* a curriculum. A lightweight roadmap already
  emerges for free from whichever lens you score weakest on.
- **An employer / L&D buyer layer.** Any manager visibility breaks the psychological safety
  the product depends on — you couldn't bring your real work.
- **A "do the next step for me" copilot mode.** The tool sharpens judgment about work you
  already have; it doesn't do the work. That would just compete with the AI you already use
  and reinforce the over-reliance the product is trying to fix.
- **Google sign-in.** Its "unverified app" warning screen undercuts the "private, safe"
  feeling at the exact moment a new user decides whether to trust the tool.

---

## 9. The recent redesign (Automation & Logic check)

Originally, the Automation check assumed you would take the AI's first draft and *edit it into
a corrected version*, and it graded you partly on the difference between the two. In practice,
**non-technical people don't edit what the AI builds** — they can't, and shouldn't have to.

So the check was reframed:

- **Before:** paste the AI's draft + your corrected version; graded on your edits.
- **Now:** state your goal + paste the AI's explanation of what it built + optionally the AI's
  summary of your instructions; graded on **how well you instructed and guided the AI**, and
  what gaps your instructions left open.

The six-lens rubric and the whole feedback experience stayed the same — only *what the
Automation check looks for* changed. Two example screens verified live: a signup-automation
whose feedback correctly flagged that the user's instructions never addressed duplicate
signups or failures, with a finance-flavored analogy — exactly the "rabbit hole" coaching the
redesign was meant to produce.

Alongside this, the check's honest **eligibility boundary** was added in three places (the
form, the check-picker card, and the landing page): it only works with a chat-based AI that
can explain what it built — a deliberate choice to state a limit plainly rather than pretend
to support tools the product can't evaluate well.

---

## 10. The one-line summary

Bring one thing you made with AI. In about 20 seconds, find out whether it's actually good and
whether you used the AI well — with one clear fix to make next, in language tuned to your role,
from a tool that teaches rather than grades and never pretends to know what it can't see.
